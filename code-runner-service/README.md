# Campus Coding Arena — C++/Java Code Runner

Standalone HTTP service that compiles one submission once, runs it against
multiple public/hidden test cases, and returns verdicts. It supports C++17 and
Java 17.

> This service is appropriate for a controlled college project/demo. It applies
> time, output and basic Linux resource limits, but it is not a hardened
> multi-tenant sandbox for running arbitrary public code.

## Local setup

Install Node.js 20+, `g++`, and Java 17, then run:

```bash
cp .env.example .env
npm install
npm start
```

The API starts at `http://localhost:10000`.

Health check:

```bash
curl http://localhost:10000/health
```

## Docker setup

```bash
docker build -t campus-code-runner .

docker run --rm \
  -p 10000:10000 \
  -e RUNNER_API_KEY=change-this-secret \
  campus-code-runner
```

## Execute C++

```bash
curl -X POST http://localhost:10000/api/execute \
  -H "Content-Type: application/json" \
  -H "x-runner-key: change-this-secret" \
  -d '{
    "language": "cpp",
    "sourceCode": "#include <iostream>\nint main(){long long a,b;std::cin>>a>>b;std::cout<<a+b;}",
    "testCases": [
      {"input":"2 3\n","expectedOutput":"5","isHidden":false},
      {"input":"-10 4\n","expectedOutput":"-6","isHidden":true}
    ]
  }'
```

## Execute Java

Java submissions must define `Main` and must not use a package declaration.

```json
{
  "language": "java",
  "sourceCode": "import java.util.*; public class Main { public static void main(String[] args) { Scanner sc=new Scanner(System.in); long a=sc.nextLong(), b=sc.nextLong(); System.out.print(a+b); } }",
  "testCases": [
    {
      "input": "2 3\n",
      "expectedOutput": "5",
      "isHidden": false
    }
  ]
}
```

## Main backend integration

Only the main backend should load test cases from MongoDB. The frontend/student
must never send or receive hidden expected outputs.

```js
export const executeWithCodeRunner = async ({ language, sourceCode, testCases }) => {
  const response = await fetch(`${process.env.CODE_RUNNER_URL}/api/execute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-runner-key": process.env.CODE_RUNNER_API_KEY,
    },
    body: JSON.stringify({ language, sourceCode, testCases }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Code execution failed");
  }

  return result;
};
```

Main backend environment:

```env
CODE_RUNNER_URL=https://your-code-runner.onrender.com
CODE_RUNNER_API_KEY=the-same-long-random-secret
```

## Render deployment

1. Push this folder to a GitHub repository.
2. Render dashboard → **New Web Service**.
3. Connect the repository.
4. Select **Docker** as the language/runtime.
5. Use the Free plan for a demo.
6. Add `RUNNER_API_KEY` with a long random value.
7. Deploy.

The Dockerfile installs Node.js, `g++`, and OpenJDK 17. Temporary submission
files are created under the system temp directory and deleted after every job,
so Render's ephemeral filesystem is suitable for this workflow.

## API response

```json
{
  "success": true,
  "status": "Accepted",
  "language": "cpp",
  "passedTestCases": 2,
  "totalTestCases": 2,
  "totalDurationMs": 51.42,
  "results": [
    {
      "testCase": 1,
      "hidden": false,
      "status": "Accepted",
      "executionTimeMs": 3.12,
      "input": "2 3\n",
      "expectedOutput": "5",
      "actualOutput": "5",
      "stderr": ""
    },
    {
      "testCase": 2,
      "hidden": true,
      "status": "Accepted",
      "executionTimeMs": 2.97
    }
  ]
}
```

Possible verdicts:

- `Accepted`
- `Wrong Answer`
- `Compilation Error`
- `Compilation Time Limit Exceeded`
- `Runtime Error`
- `Time Limit Exceeded`
- `Output Limit Exceeded`
- `Internal Error`

## Tests

```bash
npm test
```
