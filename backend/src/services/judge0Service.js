import axios from "axios";

const CODE_RUNNER_URL = process.env.CODE_RUNNER_URL || "http://localhost:10000";

const CODE_RUNNER_API_KEY = process.env.CODE_RUNNER_API_KEY;

export const executeSubmissionCode = async ({ code, language, testCases }) => {
  try {
    const response = await axios.post(
      `${CODE_RUNNER_URL}/api/execute`,
      {
        sourceCode: code,
        language,
        testCases,
      },
      {
        headers: {
          "Content-Type": "application/json",

          "x-runner-key": CODE_RUNNER_API_KEY,
        },

        timeout: 60000,
      },
    );

    return response.data;
  } catch (error) {
    console.error(
      "SUBMISSION CODE RUNNER ERROR:",
      error.response?.data || error.message,
    );

    throw error;
  }
};
