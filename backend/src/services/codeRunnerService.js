import axios from "axios";

// ==============================
// EXECUTE CODE
// ==============================

export const executeCode = async ({
  code,
  language,
  testCases,
}) => {
  try {
    // ==============================
    // ENV
    // ==============================

    const CODE_RUNNER_URL =
      process.env.CODE_RUNNER_URL?.replace(
        /\/+$/,
        "",
      );
      console.log(CODE_RUNNER_URL)

    const CODE_RUNNER_API_KEY =
      process.env.CODE_RUNNER_API_KEY;

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

    // ==============================
    // VALIDATION
    // ==============================

    if (!code?.trim()) {
      throw new Error(
        "Code is required",
      );
    }

    if (!language) {
      throw new Error(
        "Language is required",
      );
    }

    if (
      !Array.isArray(testCases) ||
      testCases.length === 0
    ) {
      throw new Error(
        "Test cases are required",
      );
    }

    // ==============================
    // FORMAT TEST CASES
    // ==============================

    const formattedTestCases =
      testCases.map((testCase) => ({
        input: String(
          testCase.input ?? "",
        ),

        expectedOutput: String(
          testCase.expectedOutput ?? "",
        ),

        isHidden: Boolean(
          testCase.isHidden,
        ),
      }));

    const runnerEndpoint =
      `${CODE_RUNNER_URL}/api/execute`;

    // ==============================
    // DEBUG
    // ==============================

    console.log(
      "========== CODE RUNNER REQUEST ==========",
    );

    console.log({
      url: runnerEndpoint,
      language,
      totalTestCases:
        formattedTestCases.length,
      apiKeyLoaded: Boolean(
        CODE_RUNNER_API_KEY,
      ),
      apiKeyLength:
        CODE_RUNNER_API_KEY.length,
    });

    // ==============================
    // CALL CUSTOM CODE RUNNER
    // ==============================

    const response =
      await axios.post(
        runnerEndpoint,

        {
          sourceCode: code,
          language,
          testCases:
            formattedTestCases,
        },

        {
          headers: {
            "Content-Type":
              "application/json",

            "x-runner-key":
              CODE_RUNNER_API_KEY,
          },

          // Render free instance cold start
          // ke liye thoda zyada timeout
          timeout: 90000,
        },
      );

    // ==============================
    // RESPONSE
    // ==============================

    console.log(
      "========== CODE RUNNER RESPONSE ==========",
    );

    console.log(response.data);

    return response.data;
  } catch (error) {
    console.error(
      "========== CODE RUNNER SERVICE ERROR ==========",
    );

    // ==============================
    // RUNNER RESPONDED WITH ERROR
    // ==============================

    if (error.response) {
      console.error(
        "STATUS:",
        error.response.status,
      );

      console.error(
        "DATA:",
        error.response.data,
      );

      throw new Error(
        error.response.data?.message ||
          error.response.data?.error ||
          `Code runner failed with status ${error.response.status}`,
      );
    }

    // ==============================
    // REQUEST SENT BUT NO RESPONSE
    // ==============================

    if (error.request) {
      console.error(
        "Code runner did not respond",
      );

      console.error(
        "REQUEST ERROR:",
        error.message,
      );

      throw new Error(
        "Code runner service did not respond",
      );
    }

    // ==============================
    // OTHER ERROR
    // ==============================

    console.error(
      "ERROR:",
      error.message,
    );

    throw error;
  }
};