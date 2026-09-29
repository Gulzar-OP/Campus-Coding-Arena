import axios from "axios";

const JUDGE0_URL =
  process.env.JUDGE0_URL ||
  "https://ce.judge0.com";

const LANGUAGE_IDS = {
  cpp: 54,
  java: 62,
  python: 71,
  javascript: 63,
};

export const getLanguageId = (language) => {
  return LANGUAGE_IDS[language];
};

const sleep = (ms) => {
  return new Promise((resolve) =>
    setTimeout(resolve, ms),
  );
};

export const executeCode = async ({
  code,
  language,
  stdin = "",
  expectedOutput = "",
  timeLimit = 2,
}) => {
  const languageId =
    getLanguageId(language);

  if (!languageId) {
    throw new Error(
      `Unsupported language: ${language}`,
    );
  }

  // STEP 1
  // Judge0 ko code bhejo
  const submissionResponse =
    await axios.post(
      `${JUDGE0_URL}/submissions?base64_encoded=false&wait=false`,
      {
        source_code: code,
        language_id: languageId,
        stdin,
        expected_output:
          expectedOutput,
        cpu_time_limit: timeLimit,
      },
      {
        headers: {
          "Content-Type":
            "application/json",
        },
      },
    );

  const token =
    submissionResponse.data.token;

  if (!token) {
    throw new Error(
      "Judge0 submission token not received",
    );
  }

  // STEP 2
  // result poll karo
  let attempts = 0;
  const maxAttempts = 15;

  while (attempts < maxAttempts) {
    const resultResponse =
      await axios.get(
        `${JUDGE0_URL}/submissions/${token}?base64_encoded=false&fields=stdout,stderr,compile_output,message,status,time,memory`,
      );

    const result =
      resultResponse.data;

    const statusId =
      result.status?.id;

    // 1 = In Queue
    // 2 = Processing
    if (
      statusId !== 1 &&
      statusId !== 2
    ) {
      return result;
    }

    await sleep(500);

    attempts++;
  }

  throw new Error(
    "Judge0 execution timed out",
  );
};