import axios from "axios";

const CODE_RUNNER_URL =
  process.env.CODE_RUNNER_URL ||
  "http://localhost:10000";

const CODE_RUNNER_API_KEY =
  process.env.CODE_RUNNER_API_KEY;

export const executeSubmissionCode = async ({
  code,
  language,
  testCases,
}) => {
  const url = `${CODE_RUNNER_URL}/api/execute`;

  try {
    console.log("====================================");
    console.log("🚀 CODE RUNNER REQUEST");
    console.log("URL:", url);
    console.log("Language:", language);
    console.log("Test cases:", testCases?.length);
    console.log(
      "API Key loaded:",
      Boolean(CODE_RUNNER_API_KEY),
    );
    console.log("====================================");

    const response = await axios.post(
      url,
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

    console.log(
      "✅ CODE RUNNER RESPONSE:",
      response.status,
    );

    return response.data;
  } catch (error) {
    console.error(
      "\n========== CODE RUNNER ERROR ==========",
    );

    console.error(
      "URL:",
      error.config?.url || url,
    );

    console.error(
      "Message:",
      error.message,
    );

    console.error(
      "Code:",
      error.code,
    );

    console.error(
      "Status:",
      error.response?.status,
    );

    console.error(
      "Response:",
      error.response?.data,
    );

    console.error(
      "=======================================\n",
    );

    if (error.code === "ECONNABORTED") {
      throw new Error(
        "Code runner request timed out",
      );
    }

    if (!error.response) {
      throw new Error(
        "Code runner service did not respond",
      );
    }

    throw new Error(
      `Code runner failed with status ${error.response.status}`,
    );
  }
};