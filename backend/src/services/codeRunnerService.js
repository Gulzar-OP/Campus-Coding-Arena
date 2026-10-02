import axios from "axios";

const CODE_RUNNER_URL =
  process.env.CODE_RUNNER_URL ||
  "http://localhost:10000";

const CODE_RUNNER_API_KEY =
  process.env.CODE_RUNNER_API_KEY;

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
      testCases.map(
        (testCase) => ({
          input:
            String(
              testCase.input ??
                "",
            ),

          expectedOutput:
            String(
              testCase.expectedOutput ??
                "",
            ),

          isHidden:
            Boolean(
              testCase.isHidden,
            ),
        }),
      );

    console.log(
      "========== CODE RUNNER REQUEST ==========",
    );
    console.log(
  "CODE_RUNNER_API_KEY loaded:",
  Boolean(process.env.CODE_RUNNER_API_KEY),
);

console.log(
  "KEY LENGTH:",
  process.env.CODE_RUNNER_API_KEY?.length,
);

    console.log({
      url:
        `${CODE_RUNNER_URL}/api/execute`,

      language,

      totalTestCases:
        formattedTestCases.length,

      apiKeyLoaded:
        Boolean(
          CODE_RUNNER_API_KEY,
        ),
    });

    // ==============================
    // CALL CUSTOM CODE RUNNER
    // ==============================

    const response =
      await axios.post(
        `${CODE_RUNNER_URL}/api/execute`,

        {
          /*
            IMPORTANT:

            Custom runner expects:
            sourceCode
            language
            testCases
          */

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

          timeout: 60000,
        },
      );

    // ==============================
    // RETURN RUNNER RESULT
    // ==============================

    console.log(
      "========== CODE RUNNER RESPONSE ==========",
    );

    console.log(
      response.data,
    );

    return response.data;
  } catch (error) {
    console.error(
      "========== CODE RUNNER SERVICE ERROR ==========",
    );

    // Runner responded with error
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
        error.response.data
          ?.message ||
          error.response.data
            ?.error ||
          `Code runner failed with status ${error.response.status}`,
      );
    }

    // Runner did not respond
    if (error.request) {
      console.error(
        "Code runner did not respond",
      );

      throw new Error(
        "Code runner service did not respond",
      );
    }

    console.error(
      "ERROR:",
      error.message,
    );

    throw error;
  }
};