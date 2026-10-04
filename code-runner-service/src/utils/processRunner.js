import { spawn } from "node:child_process";

const MINIMAL_PATH = "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin";

export const runProcess = ({
  command,
  args = [],
  cwd,
  input = "",
  timeoutMs,
  maxOutputBytes,
  uid,
  gid,
}) =>
  new Promise((resolve) => {
    const startedAt = process.hrtime.bigint();
    let stdout = "";
    let stderr = "";
    let outputBytes = 0;
    let timedOut = false;
    let outputLimitExceeded = false;
    let settled = false;

    const child = spawn(command, args, {
      cwd,
      detached: process.platform !== "win32",
      stdio: ["pipe", "pipe", "pipe"],
      env: {
        PATH: process.env.PATH || MINIMAL_PATH,
        LANG: "C.UTF-8",
        LC_ALL: "C.UTF-8",
      },
      ...(uid === undefined ? {} : { uid }),
      ...(gid === undefined ? {} : { gid }),
    });

    const elapsedMs = () =>
      Number(process.hrtime.bigint() - startedAt) / 1_000_000;

    const killProcessTree = () => {
      if (!child.pid) return;

      try {
        if (process.platform !== "win32") {
          process.kill(-child.pid, "SIGKILL");
        } else {
          child.kill("SIGKILL");
        }
      } catch {
        child.kill("SIGKILL");
      }
    };

    const timer = setTimeout(() => {
      timedOut = true;
      killProcessTree();
    }, timeoutMs);

    const collect = (target, chunk) => {
      outputBytes += chunk.length;

      if (outputBytes > maxOutputBytes) {
        outputLimitExceeded = true;
        killProcessTree();
        return target;
      }

      return target + chunk.toString("utf8");
    };

    child.stdout.on("data", (chunk) => {
      stdout = collect(stdout, chunk);
    });

    child.stderr.on("data", (chunk) => {
      stderr = collect(stderr, chunk);
    });

    child.stdin.on("error", () => {
      // The program may exit before consuming all stdin. The close event still
      // contains the authoritative result.
    });

    child.on("error", (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);

      resolve({
        exitCode: null,
        signal: null,
        stdout,
        stderr,
        timedOut,
        outputLimitExceeded,
        durationMs: elapsedMs(),
        spawnError: error.message,
      });
    });

    child.on("close", (exitCode, signal) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);

      resolve({
        exitCode,
        signal,
        stdout,
        stderr,
        timedOut,
        outputLimitExceeded,
        durationMs: elapsedMs(),
        spawnError: null,
      });
    });

    child.stdin.end(String(input));
  });
