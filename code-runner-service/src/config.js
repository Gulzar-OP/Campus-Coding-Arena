const readPositiveInteger = (name, fallback) => {
  const value = Number.parseInt(process.env[name] ?? "", 10);
  return Number.isInteger(value) && value > 0 ? value : fallback;
};

const readOptionalInteger = (name) => {
  const raw = process.env[name];

  if (raw === undefined || raw === "") {
    return undefined;
  }

  const value = Number.parseInt(raw, 10);
  return Number.isInteger(value) && value >= 0 ? value : undefined;
};

export const config = Object.freeze({
  port: readPositiveInteger("PORT", 10000),
  apiKey: process.env.RUNNER_API_KEY?.trim() || "",
  maxConcurrentJobs: readPositiveInteger("MAX_CONCURRENT_JOBS", 1),
  compileTimeoutMs: readPositiveInteger("COMPILE_TIMEOUT_MS", 15_000),
  executionTimeoutMs: readPositiveInteger("EXECUTION_TIMEOUT_MS", 5_000),
  maxOutputBytes: readPositiveInteger("MAX_OUTPUT_BYTES", 65_536),
  maxSourceBytes: readPositiveInteger("MAX_SOURCE_BYTES", 50_000),
  maxTestCases: readPositiveInteger("MAX_TEST_CASES", 20),
  sandboxUid: readOptionalInteger("SANDBOX_UID"),
  sandboxGid: readOptionalInteger("SANDBOX_GID"),
});
