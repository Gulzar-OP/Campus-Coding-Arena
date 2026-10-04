import { spawnSync } from "node:child_process";
import test from "node:test";
import assert from "node:assert/strict";
import {
  executeSubmission,
  validateExecutionRequest,
} from "../src/services/codeRunnerService.js";

const commandExists = (command, args) => {
  const result = spawnSync(command, args, { stdio: "ignore" });
  return !result.error && result.status === 0;
};

const cppAvailable = commandExists("g++", ["--version"]);
const javaAvailable =
  commandExists("javac", ["-version"]) ||
  commandExists("java", ["-m", "jdk.compiler/com.sun.tools.javac.Main", "-version"]);

const testCases = [
  { input: "2 3\n", expectedOutput: "5", isHidden: false },
  { input: "-10 4\n", expectedOutput: "-6", isHidden: true },
];

test("validates supported languages", () => {
  assert.equal(
    validateExecutionRequest({
      language: "python",
      sourceCode: "print(1)",
      testCases,
    }).error,
    "language must be cpp or java",
  );
});

test("requires Java Main class", () => {
  const result = validateExecutionRequest({
    language: "java",
    sourceCode: "public class Solution {}",
    testCases,
  });

  assert.equal(result.error, "Java source must define a Main class");
});

test("runs accepted C++17 submission", { skip: !cppAvailable }, async () => {
  const result = await executeSubmission({
    language: "cpp",
    sourceCode: `
      #include <iostream>
      int main() {
        long long a, b;
        std::cin >> a >> b;
        std::cout << a + b;
      }
    `,
    testCases,
  });

  assert.equal(result.status, "Accepted");
  assert.equal(result.passedTestCases, 2);
  assert.equal(result.results[1].input, undefined);
  assert.equal(result.results[1].expectedOutput, undefined);
  assert.equal(result.results[1].actualOutput, undefined);
});

test("detects C++ wrong answer", { skip: !cppAvailable }, async () => {
  const result = await executeSubmission({
    language: "cpp",
    sourceCode: `
      #include <iostream>
      int main() {
        long long a, b;
        std::cin >> a >> b;
        std::cout << a - b;
      }
    `,
    testCases,
  });

  assert.equal(result.status, "Wrong Answer");
  assert.equal(result.passedTestCases, 0);
});

test("detects C++ compilation error", { skip: !cppAvailable }, async () => {
  const result = await executeSubmission({
    language: "cpp",
    sourceCode: "int main() { this_will_not_compile }",
    testCases,
  });

  assert.equal(result.status, "Compilation Error");
  assert.match(result.compileOutput, /error:/i);
});

test("runs accepted Java 17 submission", { skip: !javaAvailable }, async () => {
  const result = await executeSubmission({
    language: "java",
    sourceCode: `
      import java.util.Scanner;
      public class Main {
        public static void main(String[] args) {
          Scanner scanner = new Scanner(System.in);
          long a = scanner.nextLong();
          long b = scanner.nextLong();
          System.out.print(a + b);
        }
      }
    `,
    testCases,
  });

  assert.equal(result.status, "Accepted");
  assert.equal(result.passedTestCases, 2);
});
