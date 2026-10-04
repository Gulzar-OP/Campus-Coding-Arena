import { constants as fsConstants } from "node:fs";
import { access, chown, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { config } from "../config.js";
import { Semaphore } from "../utils/semaphore.js";
import { runProcess } from "../utils/processRunner.js";

const semaphore = new Semaphore(config.maxConcurrentJobs);

const LANGUAGE_ALIASES = Object.freeze({
  cpp: "cpp",
  "c++": "cpp",
  cpp17: "cpp",
  java: "java",
  java17: "java",
});

const normalizeOutput = (value) =>
  String(value ?? "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();

const hasCommand = async (command) => {
  const searchPath = process.env.PATH || "";

  for (const directory of searchPath.split(path.delimiter)) {
    if (!directory) continue;

    try {
      await access(path.join(directory, command), fsConstants.X_OK);
      return true;
    } catch {
      // Continue searching PATH.
    }
  }

  return false;
};

const sandboxIdentity = () => ({
  uid: config.sandboxUid,
  gid: config.sandboxGid,
});

const prepareWorkDirectory = async () => {
  const workDirectory = await mkdtemp(path.join(os.tmpdir(), "campus-runner-"));

  if (config.sandboxUid !== undefined && config.sandboxGid !== undefined) {
    await chown(workDirectory, config.sandboxUid, config.sandboxGid);
  }

  return workDirectory;
};

const compileCpp = (workDirectory) =>
  runProcess({
    command: "g++",
    args: ["-std=c++17", "-O2", "-pipe", "main.cpp", "-o", "main"],
    cwd: workDirectory,
    timeoutMs: config.compileTimeoutMs,
    maxOutputBytes: config.maxOutputBytes,
    ...sandboxIdentity(),
  });

const compileJava = (workDirectory, compiler) =>
  runProcess({
    command: compiler.command,
    args: [...compiler.prefixArgs, "-encoding", "UTF-8", "Main.java"],
    cwd: workDirectory,
    timeoutMs: config.compileTimeoutMs,
    maxOutputBytes: config.maxOutputBytes,
    ...sandboxIdentity(),
  });

const resolveJavaCompiler = async () => {
  if (await hasCommand("javac")) {
    return { command: "javac", prefixArgs: [] };
  }

  if (await hasCommand("java")) {
    return {
      command: "java",
      prefixArgs: ["-m", "jdk.compiler/com.sun.tools.javac.Main"],
    };
  }

  return null;
};

const cppRunCommand = (workDirectory) => {
  const executable = path.join(workDirectory, "main");

  if (process.platform !== "linux") {
    return { command: executable, args: [] };
  }

  return {
    command: "prlimit",
    args: [
      "--nproc=64:64",
      "--as=268435456:268435456",
      "--fsize=1048576:1048576",
      "--cpu=6:6",
      "--",
      executable,
    ],
  };
};

const javaRunCommand = (workDirectory) => {
  const javaArgs = [
    "-Xms16m",
    "-Xmx128m",
    "-XX:MaxMetaspaceSize=96m",
    "-XX:ActiveProcessorCount=1",
    "-cp",
    workDirectory,
    "Main",
  ];

  if (process.platform !== "linux") {
    return { command: "java", args: javaArgs };
  }

  return {
    command: "prlimit",
    args: ["--nproc=64:64", "--fsize=1048576:1048576", "--cpu=6:6", "--", "java", ...javaArgs],
  };
};

const classifyExecution = (execution, expectedOutput) => {
  if (execution.spawnError) return "Internal Error";
  if (execution.timedOut) return "Time Limit Exceeded";
  if (execution.outputLimitExceeded) return "Output Limit Exceeded";
  if (execution.exitCode !== 0) return "Runtime Error";

  return normalizeOutput(execution.stdout) === normalizeOutput(expectedOutput)
    ? "Accepted"
    : "Wrong Answer";
};

const publicTestResult = (testCase, execution, status, index) => {
  const result = {
    testCase: index + 1,
    hidden: Boolean(testCase.isHidden),
    status,
    executionTimeMs: Number(execution.durationMs.toFixed(2)),
  };

  if (!testCase.isHidden) {
    result.input = String(testCase.input ?? "");
    result.expectedOutput = String(testCase.expectedOutput ?? "");
    result.actualOutput = execution.stdout;
    result.stderr = execution.stderr;
  }

  return result;
};

const compilationFailure = (compileResult) => {
  if (compileResult.spawnError) {
    return {
      status: "Internal Error",
      message: compileResult.spawnError,
      compileOutput: compileResult.stderr,
    };
  }

  if (compileResult.timedOut) {
    return {
      status: "Compilation Time Limit Exceeded",
      compileOutput: compileResult.stderr,
    };
  }

  if (compileResult.outputLimitExceeded) {
    return {
      status: "Compilation Output Limit Exceeded",
      compileOutput: compileResult.stderr,
    };
  }

  return {
    status: "Compilation Error",
    compileOutput: compileResult.stderr || compileResult.stdout,
  };
};

export const validateExecutionRequest = (body) => {
  const language = LANGUAGE_ALIASES[String(body?.language ?? "").toLowerCase()];
  const sourceCode = body?.sourceCode;
  const testCases = body?.testCases;

  if (!language) {
    return { error: "language must be cpp or java" };
  }

  if (typeof sourceCode !== "string" || sourceCode.trim() === "") {
    return { error: "sourceCode is required" };
  }

  if (Buffer.byteLength(sourceCode, "utf8") > config.maxSourceBytes) {
    return { error: `sourceCode exceeds ${config.maxSourceBytes} bytes` };
  }

  if (language === "java") {
    if (/^\s*package\s+/m.test(sourceCode)) {
      return { error: "Java package declarations are not supported" };
    }

    if (!/\b(?:public\s+)?class\s+Main\b/.test(sourceCode)) {
      return { error: "Java source must define a Main class" };
    }
  }

  if (!Array.isArray(testCases) || testCases.length === 0) {
    return { error: "at least one test case is required" };
  }

  if (testCases.length > config.maxTestCases) {
    return { error: `testCases cannot exceed ${config.maxTestCases}` };
  }

  for (const [index, testCase] of testCases.entries()) {
    if (testCase === null || typeof testCase !== "object") {
      return { error: `testCases[${index}] must be an object` };
    }

    if (!("expectedOutput" in testCase)) {
      return { error: `testCases[${index}].expectedOutput is required` };
    }
  }

  return {
    value: {
      language,
      sourceCode,
      testCases: testCases.map((testCase) => ({
        input: String(testCase.input ?? ""),
        expectedOutput: String(testCase.expectedOutput ?? ""),
        isHidden: Boolean(testCase.isHidden),
      })),
    },
  };
};

export const executeSubmission = async ({ language, sourceCode, testCases }) => {
  const release = await semaphore.acquire();
  let workDirectory;
  const startedAt = process.hrtime.bigint();

  try {
    workDirectory = await prepareWorkDirectory();
    const sourceFile = language === "cpp" ? "main.cpp" : "Main.java";
    const sourcePath = path.join(workDirectory, sourceFile);

    await writeFile(sourcePath, sourceCode, { encoding: "utf8", mode: 0o600 });

    if (config.sandboxUid !== undefined && config.sandboxGid !== undefined) {
      await chown(sourcePath, config.sandboxUid, config.sandboxGid);
    }

    const javaCompiler = language === "java" ? await resolveJavaCompiler() : null;
    const compilerAvailable =
      language === "cpp" ? await hasCommand("g++") : Boolean(javaCompiler);

    if (!compilerAvailable) {
      return {
        status: "Internal Error",
        message: `${language === "cpp" ? "g++" : "javac"} is not installed`,
      };
    }

    const compileResult =
      language === "cpp"
        ? await compileCpp(workDirectory)
        : await compileJava(workDirectory, javaCompiler);

    if (
      compileResult.spawnError ||
      compileResult.timedOut ||
      compileResult.outputLimitExceeded ||
      compileResult.exitCode !== 0
    ) {
      return compilationFailure(compileResult);
    }

    const results = [];

    for (const [index, testCase] of testCases.entries()) {
      const runCommand =
        language === "cpp"
          ? cppRunCommand(workDirectory)
          : javaRunCommand(workDirectory);

      const execution = await runProcess({
        ...runCommand,
        cwd: workDirectory,
        input: testCase.input,
        timeoutMs: config.executionTimeoutMs,
        maxOutputBytes: config.maxOutputBytes,
        ...sandboxIdentity(),
      });

      const status = classifyExecution(execution, testCase.expectedOutput);
      results.push(publicTestResult(testCase, execution, status, index));
    }

    const firstFailure = results.find((result) => result.status !== "Accepted");
    const totalDurationMs =
      Number(process.hrtime.bigint() - startedAt) / 1_000_000;

    return {
      status: firstFailure?.status ?? "Accepted",
      language,
      passedTestCases: results.filter((result) => result.status === "Accepted").length,
      totalTestCases: results.length,
      totalDurationMs: Number(totalDurationMs.toFixed(2)),
      results,
    };
  } finally {
    if (workDirectory) {
      await rm(workDirectory, { recursive: true, force: true });
    }

    release();
  }
};
