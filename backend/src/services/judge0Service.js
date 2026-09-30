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

const judge0Client = axios.create({
  baseURL: JUDGE0_URL,
  timeout: 15000,
  headers: {
    "Content-Type":
      "application/json",
    Accept: "application/json",
  },
});

export const executeCode = async ({
  code,
  language,
  stdin = "",
  expectedOutput = "",
}) => {
  try {
    const languageId =
      LANGUAGE_IDS[language];

    if (!languageId) {
      throw new Error(
        `Unsupported language: ${language}`,
      );
    }

    console.log(
      "==============================",
    );
    console.log("JUDGE0 REQUEST");
    console.log("URL:", JUDGE0_URL);
    console.log(
      "Language:",
      language,
    );
    console.log(
      "Language ID:",
      languageId,
    );
    console.log("Input:", stdin);
    console.log(
      "Expected:",
      expectedOutput,
    );
    console.log(
      "==============================",
    );

    // =================================
    // CREATE SUBMISSION
    // =================================

    const submissionResponse =
      await judge0Client.post(
        "/submissions",
        {
          source_code: code,
          language_id: languageId,

          stdin:
            stdin === undefined ||
            stdin === null
              ? ""
              : String(stdin),

          expected_output:
            expectedOutput ===
              undefined ||
            expectedOutput === null
              ? ""
              : String(
                  expectedOutput,
                ),
        },
        {
          params: {
            base64_encoded: false,
            wait: false,
          },
        },
      );

    console.log(
      "SUBMISSION RESPONSE:",
      submissionResponse.data,
    );

    const token =
      submissionResponse.data?.token;

    if (!token) {
      throw new Error(
        "Judge0 token not received",
      );
    }

    // =================================
    // POLL RESULT
    // =================================

    for (
      let attempt = 1;
      attempt <= 20;
      attempt++
    ) {
      console.log(
        `Polling Judge0 ${attempt}/20`,
      );

      const response =
        await judge0Client.get(
          `/submissions/${token}`,
          {
            params: {
              base64_encoded:
                false,

              fields:
                "stdout,stderr,compile_output,message,status,time,memory",
            },
          },
        );

      const result =
        response.data;

      console.log(
        "Judge0 status:",
        result.status,
      );

      // 1 = In Queue
      // 2 = Processing

      if (
        result.status?.id !== 1 &&
        result.status?.id !== 2
      ) {
        console.log(
          "FINAL JUDGE0 RESULT:",
          result,
        );

        return result;
      }

      await sleep(1000);
    }

    throw new Error(
      "Judge0 execution timed out",
    );
  } catch (error) {
    console.error(
      "========== JUDGE0 SERVICE ERROR ==========",
    );

    if (error.response) {
      console.error(
        "Status:",
        error.response.status,
      );

      console.error(
        "Response:",
        error.response.data,
      );

      throw new Error(
        `Judge0 API error ${
          error.response.status
        }: ${
          typeof error.response
            .data === "string"
            ? error.response.data
            : JSON.stringify(
                error.response.data,
              )
        }`,
      );
    }

    if (error.request) {
      console.error(
        "No Judge0 response received",
      );

      throw new Error(
        "Judge0 server did not respond",
      );
    }

    console.error(
      "Error:",
      error.message,
    );

    throw error;
  }
};