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

const sleep = (ms) =>
  new Promise((resolve) =>
    setTimeout(resolve, ms),
  );

export const executeCode = async ({
  code,
  language,
  stdin = "",
  expectedOutput = "",
}) => {
  const languageId =
    LANGUAGE_IDS[language];

  if (!languageId) {
    throw new Error(
      `Unsupported language: ${language}`,
    );
  }

  // Create Judge0 submission
  const { data } = await axios.post(
    `${JUDGE0_URL}/submissions?base64_encoded=false&wait=false`,
    {
      source_code: code,
      language_id: languageId,
      stdin,
      expected_output:
        expectedOutput,
    },
    {
      headers: {
        "Content-Type":
          "application/json",
      },
    },
  );

  const token = data.token;

  if (!token) {
    throw new Error(
      "Judge0 token not received",
    );
  }

  // Poll result
  for (let i = 0; i < 15; i++) {
    const { data: result } =
      await axios.get(
        `${JUDGE0_URL}/submissions/${token}?base64_encoded=false&fields=stdout,stderr,compile_output,status,time,memory`,
      );

    // 1 = In Queue
    // 2 = Processing
    if (
      result.status?.id !== 1 &&
      result.status?.id !== 2
    ) {
      return result;
    }

    await sleep(500);
  }

  throw new Error(
    "Judge0 execution timed out",
  );
};