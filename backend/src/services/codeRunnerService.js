import axios from "axios";

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const executeCode = async ({
  code,
  language,
  testCases,
}) => {
  const CODE_RUNNER_URL =
    process.env.CODE_RUNNER_URL?.replace(
      /\/+$/,
      "",
    );

  const CODE_RUNNER_API_KEY =
    process.env.CODE_RUNNER_API_KEY;

  console.log(
    "\n==========================================",
  );

  console.log("🔧 CODE RUNNER CONFIG");

  console.log(
    "CODE_RUNNER_URL:",
    CODE_RUNNER_URL,
  );

  console.log(
    "API KEY LOADED:",
    Boolean(CODE_RUNNER_API_KEY),
  );

  console.log(
    "==========================================",
  );

  if (!CODE_RUNNER_URL) {
    throw new Error(
      "CODE_RUNNER_URL is not configured",
    );
  }

  if (!CODE_RUNNER_API_KEY) {
    throw new Error(
      "CODE_RUNNER_API_KEY is not configured",
    );
  }

  if (!code?.trim()) {
    throw new Error("Code is required");
  }

  if (!language) {
    throw new Error("Language is required");
  }

  if (
    !Array.isArray(testCases) ||
    testCases.length === 0
  ) {
    throw new Error(
      "Test cases are required",
    );
  }

  const formattedTestCases =
    testCases.map(
      (testCase, index) => ({
        input: String(
          testCase?.input ?? "",
        ),

        expectedOutput: String(
          testCase?.expectedOutput ??
            "",
        ),

        isHidden: Boolean(
          testCase?.isHidden,
        ),

        testCaseNumber:
          index + 1,
      }),
    );

  const runnerEndpoint =
    `${CODE_RUNNER_URL}/api/execute`;

  const payload = {
    sourceCode: code,
    language,
    testCases:
      formattedTestCases,
  };

  const MAX_ATTEMPTS = 2;

  let lastError;

  for (
    let attempt = 1;
    attempt <= MAX_ATTEMPTS;
    attempt++
  ) {
    try {
      console.log(
        "\n========== 🚀 CODE RUNNER REQUEST ==========",
      );

      console.log(
        "Attempt:",
        `${attempt}/${MAX_ATTEMPTS}`,
      );

      console.log(
        "URL:",
        runnerEndpoint,
      );

      console.log(
        "Language:",
        language,
      );

      console.log(
        "Code length:",
        code.length,
      );

      console.log(
        "Total test cases:",
        formattedTestCases.length,
      );

      console.log(
        "API key loaded:",
        Boolean(
          CODE_RUNNER_API_KEY,
        ),
      );

      console.log(
        "============================================\n",
      );

      const response =
        await axios.post(
          runnerEndpoint,
          payload,
          {
            headers: {
              "Content-Type":
                "application/json",

              "x-runner-key":
                CODE_RUNNER_API_KEY,
            },

            timeout: 90000,

            maxContentLength:
              1024 * 1024,

            maxBodyLength:
              1024 * 1024,
          },
        );

      console.log(
        "\n========== ✅ CODE RUNNER RESPONSE ==========",
      );

      console.log(
        "HTTP Status:",
        response.status,
      );

      console.log(
        "Verdict:",
        response.data?.status,
      );

      console.log(
        "Passed:",
        response.data
          ?.passedTestCases,
        "/",
        response.data
          ?.totalTestCases,
      );

      console.log(
        "Duration:",
        response.data
          ?.totalDurationMs,
      );

      console.log(
        "=============================================\n",
      );

      return response.data;
    } catch (error) {
      lastError = error;

      const status =
        error.response?.status;

      const retryableStatus =
        [502, 503, 504].includes(
          status,
        );

      const retryableNetworkError =
        [
          "ECONNRESET",
          "ETIMEDOUT",
          "ECONNABORTED",
        ].includes(
          error.code,
        );

      console.error(
        "\n========== ❌ CODE RUNNER ATTEMPT FAILED ==========",
      );

      console.error(
        "ATTEMPT:",
        `${attempt}/${MAX_ATTEMPTS}`,
      );

      console.error(
        "MESSAGE:",
        error.message,
      );

      console.error(
        "CODE:",
        error.code,
      );

      console.error(
        "HTTP STATUS:",
        status,
      );

      console.error(
        "URL:",
        error.config?.url,
      );

      console.error(
        "RESPONSE DATA:",
        error.response?.data,
      );

      console.error(
        "=================================================\n",
      );

      const shouldRetry =
        attempt < MAX_ATTEMPTS &&
        (
          retryableStatus ||
          retryableNetworkError
        );

      if (shouldRetry) {
        console.log(
          "⏳ Runner temporarily unavailable.",
        );

        console.log(
          "🔄 Retrying in 3 seconds...",
        );

        await sleep(3000);

        continue;
      }

      break;
    }
  }

  console.error(
    "\n========== ❌ FINAL CODE RUNNER ERROR ==========",
  );

  console.error(
    "MESSAGE:",
    lastError?.message,
  );

  console.error(
    "CODE:",
    lastError?.code,
  );

  console.error(
    "HTTP STATUS:",
    lastError?.response
      ?.status,
  );

  console.error(
    "RESPONSE DATA:",
    lastError?.response
      ?.data,
  );

  console.error(
    "===============================================\n",
  );

  if (
    lastError?.response
  ) {
    throw new Error(
      lastError.response.data
        ?.message ||
        lastError.response.data
          ?.error ||
        `Code runner failed with status ${lastError.response.status}`,
    );
  }

  if (
    lastError?.request
  ) {
    if (
      lastError.code ===
      "ECONNABORTED"
    ) {
      throw new Error(
        "Code runner request timed out",
      );
    }

    if (
      lastError.code ===
      "ETIMEDOUT"
    ) {
      throw new Error(
        "Code runner connection timed out",
      );
    }

    if (
      lastError.code ===
      "ECONNRESET"
    ) {
      throw new Error(
        "Code runner connection was reset",
      );
    }

    if (
      lastError.code ===
      "ECONNREFUSED"
    ) {
      throw new Error(
        "Code runner refused the connection",
      );
    }

    if (
      lastError.code ===
      "ENOTFOUND"
    ) {
      throw new Error(
        "Code runner hostname could not be resolved",
      );
    }

    throw new Error(
      `Code runner service did not respond: ${
        lastError.code ||
        lastError.message
      }`,
    );
  }

  throw (
    lastError ||
    new Error(
      "Code runner failed",
    )
  );
};