import Problem from "../models/Problem.js";
import {
  executeCode,
} from "../services/judge0Service.js";

export const runCode = async (
  req,
  res,
) => {
  try {
    const {
      problemId,
      language,
      code,
    } = req.body;

    if (
      !problemId ||
      !language ||
      !code
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Problem, code and language are required",
      });
    }

    const problem =
      await Problem.findById(
        problemId,
      );

    if (!problem) {
      return res.status(404).json({
        success: false,
        message:
          "Problem not found",
      });
    }

    // RUN button me sirf visible/sample testcase
    const testCase =
      problem.testCases.find(
        (test) =>
          test.isHidden === false,
      );

    if (!testCase) {
      return res.status(400).json({
        success: false,
        message:
          "No sample testcase available",
      });
    }

    console.log(
      "Running:",
      problem.title,
    );

    console.log(
      "Input:",
      testCase.input,
    );

    console.log(
      "Expected:",
      testCase.expectedOutput,
    );

    const result =
      await executeCode({
        code,
        language,
        stdin:
          testCase.input,
        expectedOutput:
          testCase.expectedOutput,
      });

    return res.status(200).json({
      success: true,

      result: {
        status:
          result.status
            ?.description,

        output:
          result.stdout,

        expectedOutput:
          testCase.expectedOutput,

        time:
          result.time,

        memory:
          result.memory,

        stderr:
          result.stderr,

        compileOutput:
          result.compile_output,
      },
    });
  } catch (error) {
    console.error(
      "CODE RUN ERROR:",
      error.response?.data ||
        error.message,
    );

    return res.status(500).json({
      success: false,
      message:
        "Code execution failed",

      error:
        error.response?.data ||
        error.message,
    });
  }
};