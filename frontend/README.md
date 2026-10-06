# Campus Coding Arena

Campus Coding Arena is a full-stack coding assessment platform designed for colleges, teachers, and students.

The platform allows a teacher to create programming problems and coding tests, publish assessments for a configurable time window, verify student accounts, and review student performance.

Students can register, wait for teacher verification, join a published test using an access code, start the test within the allowed window, solve coding problems in a timed environment, run code against visible sample test cases, submit each problem for final evaluation, and finally finish the test.

The current implementation uses a custom Docker-based code runner with Redis and BullMQ instead of Judge0.

---

# Core Product Rules

The current system is intentionally optimized for a college environment with roughly 200 students.

- Student self-registration is allowed.
- A student account must be verified by the teacher before normal use.
- Teacher accounts are not self-registered; the main teacher account is created manually.
- A test can remain open for a larger start window, for example 2 days.
- Each student gets an individual test duration, for example 60 minutes, starting from the moment they begin the test.
- Students may run code multiple times while debugging.
- Run requests are rate-limited.
- Run Code does not save code or execution results in MongoDB.
- Submit Code performs final evaluation for the selected problem and stores the result.
- A finished test cannot be started again.
- Final test submission is allowed only once.
- AI hints are available only for students.
- AI hints are limited per test, currently up to 3 prompts by default.
- Teacher-side AI assistance is disabled.

---

# Main Features

## Teacher Features

- Teacher authentication and authorization
- View dashboard metrics
- Create programming problems
- Edit programming problems
- View problem details
- Create coding tests
- Configure test title and description
- Configure test duration
- Configure test start and end time
- Add multiple coding problems
- Assign marks to problems
- Publish or unpublish tests
- Generate and use 6-character access codes
- Enable or disable tests
- View students
- Paginate student lists
- View unverified student requests
- Verify student accounts
- Remove invalid/unwanted student accounts
- View student results
- View test-wise results
- Inspect submitted source code and verdicts

## Student Features

- Student self-registration
- Teacher verification requirement
- Student authentication
- Join tests using access code
- Start-time validation
- End-time validation
- Individual attempt timer
- Start coding test
- Solve multiple coding problems
- Switch between problems
- Choose supported language
- Run code against visible sample test cases
- Submit code against all visible and hidden test cases
- Receive verdicts
- Track marks
- Use limited AI hints
- View own results
- Prevent duplicate test start after final submission
- Prevent invalid or expired attempts

## Coding Engine Features

- Custom Docker-based runner
- Redis-backed rate limiting
- BullMQ execution queue
- C++ execution
- Java execution
- Standard input support
- Expected output comparison
- Visible sample test cases
- Hidden test cases
- Compilation error handling
- Runtime error handling
- Wrong Answer detection
- Accepted solution detection
- Time-limit enforcement
- Output-size enforcement
- Source-size enforcement
- Maximum test-case enforcement
- Runner authentication using `x-runner-key`

---

# Tech Stack

## Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React
- react-hot-toast

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Cookie-based authentication

## Queue and Rate Limiting

- Redis
- BullMQ

## Code Execution

- Custom Docker code-runner service
- C++ compiler/runtime
- Java compiler/runtime

---

# Supported Languages

The current target is intentionally limited to:

```text
C++
Java
```

The previous Python support is no longer part of the current production scope.

Example language mapping used by the backend/runner layer:

```text
cpp  -> 54
java -> 62
```

The application should treat these values as internal execution identifiers rather than exposing implementation details to students.

---

# High-Level Architecture

```text
                         Campus Coding Arena

                    ┌────────────┴────────────┐
                    │                         │
                 Teacher                   Student
                    │                         │
         ┌──────────┼──────────┐              │
         │          │          │              │
   Verify Users  Problems    Tests         Join Test
         │          │          │              │
         │          │       Publish           │
         │          │          │              │
         └──────────┴──────────┴──────┬───────┘
                                      │
                                      ▼
                                Test Attempt
                                      │
                     ┌────────────────┴────────────────┐
                     │                                 │
                  Run Code                         Submit Code
                     │                                 │
              Visible Testcase                   All Testcases
                     │                                 │
                     └───────────────┬─────────────────┘
                                     ▼
                              Rate Limit Check
                                     │
                                     ▼
                                   Redis
                                     │
                                     ▼
                                  BullMQ
                                     │
                                     ▼
                          Custom Docker Code Runner
                                     │
                                     ▼
                                  Verdict
                     ┌───────────────┴────────────────┐
                     │                                │
                RUN response                   SUBMIT result
               not persisted                      persisted
                     │                                │
                     └───────────────┬────────────────┘
                                     ▼
                              TestAttempt update
                                     │
                                     ▼
                                Finish Test
                                     │
                                     ▼
                          Permanent Result/Submission
                                     │
                                     ▼
                        Temporary Attempt removed
```

---

# Registration and Verification Flow

Student registration is separated from account verification.

```text
Student Register
      ↓
User Account Created
      ↓
Verified = false
      ↓
Teacher Request Page
      ↓
 ┌────┴────┐
 │         │
Verify   Remove
 │         │
 ▼         ▼
Access   Account Deleted
Granted
```

Recommended student registration data:

```text
name
email
password
branch
year
```

If `rollNo` exists in the current backend schema, it should not remain `required` unless the frontend also requires it. The schema, registration controller, and verification controller must use the same rule to avoid Mongoose validation errors during verification.

---

# Test Lifecycle

```text
Teacher Login
    ↓
Create Problems
    ↓
Create Test
    ↓
Attach Problems + Marks
    ↓
Configure Duration
    ↓
Configure Start/End Window
    ↓
Publish Test
    ↓
Access Code Generated
    ↓
Student Login
    ↓
Join Test
    ↓
Start Test
    ↓
Validate Published State
    ↓
Validate Start/End Window
    ↓
Check Previous Final Submission
    ↓
Create/Resume TestAttempt
    ↓
Solve Problems
    ↓
Run Code / Submit Problem
    ↓
Finish Test
    ↓
Calculate Final Marks
    ↓
Persist Final Result
    ↓
Delete Temporary TestAttempt
```

---

# Test Window vs Student Duration

The test has two independent timing concepts.

## Test Availability Window

Example:

```text
Test open: 2 days
```

This determines when a student is allowed to start the test.

## Individual Attempt Duration

Example:

```text
Duration: 60 minutes
```

If a student starts at 2:10 PM, their personal deadline is approximately:

```text
3:10 PM
```

The effective deadline should be the earlier of:

```text
startedAt + duration
OR
test.endTime
```

The backend remains authoritative for deadline checks.

---

# Main Database Models

## User

Represents teacher and student accounts.

Typical fields:

```text
name
email
password
role
branch
year
isVerified
createdAt
updatedAt
```

Roles:

```text
teacher
student
```

Recommended rule:

```text
student -> self registration allowed
teacher -> created manually
```

---

# Problem Model

A coding problem can contain:

```text
title
slug
topic
difficulty
solved
description
tags
languages
inputFormat
outputFormat
constraints
testCases
timeLimit
memoryLimit
companies
createdBy
isActive
```

## Difficulty

```text
Easy
Medium
Hard
```

## Test Case Shape

```json
{
  "input": "4\n2 7 11 15\n9",
  "expectedOutput": "0 1",
  "isHidden": false
}
```

Rules:

- `isHidden: false` can be used by Run Code.
- `isHidden: true` must never be exposed to the student frontend.
- Submit Code evaluates all required test cases.

---

# Test Model

Current conceptual shape:

```text
title
description
createdBy
problems[]
duration
startTime
endTime
maxAIPrompts
status
isActive
accessCode
allowDirectAccess
```

Current `problems` relationship:

```js
problems: [
  {
    problem: ObjectId,
    marks: Number
  }
]
```

Recommended status values:

```text
draft
published
```

Example access code:

```text
XV89GE
```

---

# TestAttempt Model

A `TestAttempt` is temporary state while a student is actively taking a test.

Conceptual fields:

```text
test
student
startedAt
submittedAt
status
aiPromptsUsed
problemResults
totalMarks
```

Attempt status:

```text
in_progress
submitted
expired
```

Problem result example:

```json
{
  "problem": "PROBLEM_OBJECT_ID",
  "status": "not_attempted",
  "submission": null,
  "marksObtained": 0
}
```

Problem result status:

```text
not_attempted
attempted
passed
failed
```

Current lifecycle rule:

- `TestAttempt` stores temporary state during the active test.
- When the test is finally finished, permanent submission/result data remains.
- The temporary attempt can then be deleted to reduce redundant storage.

---

# Submission Model

A final problem submission can store:

```text
user
test
problem
language
verdict
passedTestCases
totalTestCases
executionTime
memoryUsed
compileOutput
stderr
sourceCode
createdAt
```

Important storage rule:

```text
RUN     -> do not save source code/result
SUBMIT  -> save final evaluated source code/result
```

This keeps MongoDB usage lower while still preserving final assessment evidence.

---

# Authentication

Authentication flow:

```text
Login
  ↓
JWT generated
  ↓
JWT stored in HTTP-only cookie
  ↓
Authenticated request
  ↓
protect middleware
  ↓
req.user
  ↓
role authorization
```

Cookie configuration should account for environment:

```text
Development:
secure = false
sameSite = lax

Production:
secure = true
sameSite = none
```

---

# Student Verification APIs

A teacher-facing verification module should support flows similar to:

```text
GET    /api/.../unverified-students
PATCH  /api/.../students/:id/verify
DELETE /api/.../students/:id
```

Exact route placement can vary, but all three operations must require teacher authorization.

Recommended verification update:

```js
await User.findByIdAndUpdate(
  studentId,
  { isVerified: true },
  {
    new: true,
    runValidators: false
  }
);
```

Using an update operation can prevent unrelated required-field validation from blocking a simple verification change. A cleaner long-term fix is still to align schema requirements with actual registration fields.

---

# Join Test API

Student only.

```text
POST /api/tests/join
```

Example body:

```json
{
  "accessCode": "ABC123"
}
```

Validation flow:

```text
Access code normalized to uppercase
        ↓
Find test
        ↓
Published?
        ↓
Active?
        ↓
Inside valid availability window?
        ↓
Student verified?
        ↓
Already finally submitted?
        ↓
Allow join
```

---

# Start Test API

Conceptual endpoint:

```text
POST /api/tests/:id/start
```

Flow:

```text
Find Test
   ↓
Validate published status
   ↓
Validate current time
   ↓
Check permanent final submission/result
   ↓
If already submitted -> 409
   ↓
Check active TestAttempt
   ↓
Resume or create attempt
   ↓
Initialize problemResults
```

The permanent submission check is important because the temporary `TestAttempt` may be deleted after the student finishes the test.

---

# Run Code API

Conceptual endpoint:

```text
POST /api/code/run
```

Example body:

```json
{
  "testId": "TEST_OBJECT_ID",
  "problemId": "PROBLEM_OBJECT_ID",
  "language": "cpp",
  "code": "#include <bits/stdc++.h>\nusing namespace std;\nint main(){ return 0; }"
}
```

Backend flow:

```text
Validate request
     ↓
Validate supported language
     ↓
Find published test
     ↓
Find active TestAttempt
     ↓
Check timer/deadline
     ↓
Verify problem belongs to test
     ↓
Find problem
     ↓
Find visible sample testcase
     ↓
Check Redis rate limit
     ↓
Enqueue BullMQ job
     ↓
Docker code-runner executes
     ↓
Return output/verdict
     ↓
DO NOT persist code/result
```

---

# Run Code Rate Limiting

Current target policy:

```text
Maximum: 5 requests
Window: 10 seconds
On exceed: block for 60 seconds
```

Redis keys can follow a structure similar to:

```text
code-run:count:<userId>
code-run:block:<userId>
```

Example behavior:

```text
Student presses Run repeatedly
          ↓
Redis increments short-window counter
          ↓
Count <= 5 ?
   /              \
 Yes               No
 ↓                  ↓
Queue job      Create block key
                    ↓
              Reject for 60 sec
```

The frontend should show a clear rate-limit message rather than repeatedly retrying automatically.

---

# BullMQ Execution Queue

BullMQ is used to serialize or control code execution jobs.

```text
Backend Request
     ↓
BullMQ Queue
     ↓
Worker receives job
     ↓
Custom Runner
     ↓
Compilation
     ↓
Execution
     ↓
Result returned
```

Typical successful logs:

```text
📥 Code queued
🚀 Executing job
✅ completed
```

This queue protects the runner from sudden bursts, especially when many students press Run or Submit around the same time.

---

# Custom Docker Code Runner

Current runner service:

```text
container: campus-code-runner
port: 10000
```

Typical runner environment:

```env
MAX_CONCURRENT_JOBS=1
COMPILE_TIMEOUT_MS=15000
EXECUTION_TIMEOUT_MS=5000
MAX_OUTPUT_BYTES=65536
MAX_SOURCE_BYTES=50000
MAX_TEST_CASES=20
```

Backend configuration:

```env
CODE_RUNNER_URL=http://localhost:10000
CODE_RUNNER_API_KEY=your_runner_key
```

Authentication header:

```text
x-runner-key
```

The backend and runner must use the exact same header name.

---

# Submit Code API

Conceptual endpoint:

```text
POST /api/submissions/submit
```

Example body:

```json
{
  "testId": "TEST_OBJECT_ID",
  "problemId": "PROBLEM_OBJECT_ID",
  "language": "cpp",
  "code": "#include <bits/stdc++.h>\nusing namespace std;\nint main(){ return 0; }"
}
```

Flow:

```text
Validate active attempt
       ↓
Validate timer
       ↓
Validate problem belongs to test
       ↓
Load visible + hidden test cases
       ↓
Apply request protection/rate limiting
       ↓
Queue execution
       ↓
Runner executes all test cases
       ↓
Count passed test cases
       ↓
Generate final verdict
       ↓
Calculate marks for problem
       ↓
Create Submission document
       ↓
Update TestAttempt.problemResults
```

---

# Run Code vs Submit Code

## Run Code

```text
RUN
 ↓
Visible sample testcase
 ↓
Redis limit
 ↓
BullMQ
 ↓
Docker runner
 ↓
Show result
 ↓
No MongoDB submission write
```

Purpose: debugging.

## Submit Code

```text
SUBMIT
   ↓
Visible + hidden testcases
   ↓
BullMQ
   ↓
Docker runner
   ↓
Final verdict
   ↓
Marks
   ↓
Submission saved
   ↓
Problem result updated
```

Purpose: final evaluated answer for that problem.

---

# Verdicts

The platform should normalize runner output into application-level verdicts such as:

```text
Accepted
Wrong Answer
Compilation Error
Runtime Error
Time Limit Exceeded
```

Possible future verdicts:

```text
Memory Limit Exceeded
Output Limit Exceeded
Internal Error
```

---

# Marks Calculation

Each test problem can contain assigned marks.

Current simple rule:

```text
all test cases passed -> full problem marks
otherwise             -> 0 marks
```

Example:

```js
marksObtained = allPassed ? problemMarks : 0;
```

Total test score:

```js
const totalMarks = problemResults.reduce(
  (sum, item) => sum + (item.marksObtained || 0),
  0
);
```

Marks must always be calculated on the backend.

---

# Finish Test API

Conceptual endpoint:

```text
POST /api/tests/:id/finish
```

Recommended flow:

```text
Find active attempt
      ↓
Validate ownership
      ↓
Calculate total marks
      ↓
Mark final state submitted
      ↓
Set submittedAt
      ↓
Persist permanent result/submission data
      ↓
Delete temporary TestAttempt
      ↓
Return final result
```

Important:

After deletion of `TestAttempt`, future dashboard/start logic must use permanent submissions/results to determine that the student already completed the test.

---

# Dashboard Status Logic

The student dashboard fetches published active tests and determines display state from:

```text
current time
startTime
endTime
active TestAttempt
permanent final submission/result
```

Recommended logical statuses:

```text
upcoming
live
in_progress
completed
expired
```

Important rule:

```text
A test must not appear completed for a new student merely because another student submitted it.
```

Completion checks must always be scoped to the authenticated student's user ID.

---

# AI Hint System

AI assistance is restricted to students during tests.

Current default limit:

```text
maxAIPrompts = 3 per test
```

Flow:

```text
Student asks for hint
      ↓
Find active TestAttempt
      ↓
Check aiPromptsUsed < maxAIPrompts
      ↓
Generate hint
      ↓
aiPromptsUsed += 1
```

AI should provide hints rather than full final solutions during an assessment.

Teacher-side AI is disabled in the current scope.

---

# Teacher Student-Request Page

The teacher UI should include a dedicated page for unverified students.

Recommended table/card data:

```text
Student Name
Email
Branch
Year
Registered At
Verification Status
Actions
```

Actions:

```text
Verify
Remove
```

Recommended UX:

- White/light theme
- Search student
- Pagination if the list grows
- Confirmation before remove
- Loading state while verifying/removing
- Toast on success/failure
- Disable repeated button clicks during API request

---

# Teacher Pages

Current teacher-side pages can include:

```text
Dashboard
Problems
Create Problem
Problem Details
Edit Problem
Tests
Create Test
Test Details
Edit Test
Students
Student Details
Verification Requests
Results
```

---

# Student Pages

Current student-side pages can include:

```text
Dashboard
Join Test
Test Instructions
Coding Test
My Results
Test Result
Profile
Settings
```

---

# Student Coding Interface

Conceptual layout:

```text
┌─────────────────────────────────────────────────────────────┐
│ Campus Coding Arena   Test Title              Time: 42:18  │
├───────────────┬───────────────────────┬─────────────────────┤
│ Problems      │ Problem Description   │ Code Editor         │
│               │                       │                     │
│ 1. Two Sum    │ Input Format          │ Language: C++       │
│ 2. Search     │ Output Format         │                     │
│ 3. Array      │ Constraints           │                     │
│               │ Examples              │                     │
│               │                       │ [ Run ] [ Submit ]  │
├───────────────┴───────────────────────┴─────────────────────┤
│ Output / Verdict / AI Hint                                 │
└─────────────────────────────────────────────────────────────┘
```

Recommended mobile behavior:

- Top header with logo
- Menu button
- Collapsible sidebar
- Scrollable sidebar/content
- Timer always visible during active test

---

# Example: Two Sum

Input:

```text
4
2 7 11 15
9
```

Expected output:

```text
0 1
```

Compatible C++ solution:

```cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    int n;
    cin >> n;

    vector<int> nums(n);

    for (int &x : nums) {
        cin >> x;
    }

    int target;
    cin >> target;

    unordered_map<int, int> index;

    for (int i = 0; i < n; i++) {
        int need = target - nums[i];

        if (index.count(need)) {
            cout << index[need] << " " << i;
            return 0;
        }

        index[nums[i]] = i;
    }

    return 0;
}
```

Compatible Java solution:

```java
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        int n = sc.nextInt();
        int[] nums = new int[n];

        for (int i = 0; i < n; i++) {
            nums[i] = sc.nextInt();
        }

        int target = sc.nextInt();

        Map<Integer, Integer> map = new HashMap<>();

        for (int i = 0; i < n; i++) {
            int need = target - nums[i];

            if (map.containsKey(need)) {
                System.out.println(map.get(need) + " " + i);
                return;
            }

            map.put(nums[i], i);
        }
    }
}
```

---

# Important Route Design

Do not apply student authorization middleware globally to routes that also contain teacher endpoints.

Bad pattern:

```js
router.use(protect);
router.use(authorizeRoles("student"));

router.get(
  "/students",
  protect,
  authorizeRoles("teacher"),
  allStudent
);
```

The teacher route would already be blocked by the earlier student-only middleware.

Prefer role authorization per route or use separate routers.

Example:

```js
router.get(
  "/dashboard",
  protect,
  authorizeRoles("student"),
  getStudentDashboard
);

router.get(
  "/students",
  protect,
  authorizeRoles("teacher"),
  allStudent
);
```

---

# Express JSON Middleware

JSON middleware must be registered before API routes:

```js
app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);
```

Then routes:

```js
app.use("/api/tests", testRoutes);
```

---

# Security and Validation

Current/expected protection includes:

- JWT authentication
- HTTP-only authentication cookie
- Role-based authorization
- Student verification before assessment access
- Teacher-only problem/test management
- Student-only assessment participation
- Published-test validation
- Test start-time validation
- Test end-time validation
- Per-attempt deadline validation
- Active-attempt validation
- Duplicate final-submit prevention
- Problem-to-test validation
- Hidden testcase protection
- Runner API key protection
- Redis rate limiting
- BullMQ execution throttling
- Docker execution isolation
- Source-size limit
- Output-size limit
- Compile timeout
- Execution timeout

Never trust frontend-provided marks, verdicts, roles, or hidden test cases.

---

# Environment Variables

Example backend environment:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

REDIS_HOST=localhost
REDIS_PORT=6379

CODE_RUNNER_URL=http://localhost:10000
CODE_RUNNER_API_KEY=your_runner_api_key
```

Example runner environment:

```env
MAX_CONCURRENT_JOBS=1
COMPILE_TIMEOUT_MS=15000
EXECUTION_TIMEOUT_MS=5000
MAX_OUTPUT_BYTES=65536
MAX_SOURCE_BYTES=50000
MAX_TEST_CASES=20
RUNNER_API_KEY=your_runner_api_key
```

Never commit real secrets or `.env` files.

---

# Project Structure

A current backend structure can look like:

```text
backend/
│
├── config/
│   ├── db.js
│   └── redis.js
│
├── controllers/
│   ├── authController.js
│   ├── problemController.js
│   ├── testController.js
│   ├── studentController.js
│   ├── submissionController.js
│   └── aiController.js
│
├── middleware/
│   ├── authMiddleware.js
│   └── roleMiddleware.js
│
├── models/
│   ├── User.js
│   ├── Problem.js
│   ├── Test.js
│   ├── TestAttempt.js
│   └── Submission.js
│
├── queues/
│   ├── codeQueue.js
│   └── codeWorker.js
│
├── routes/
│   ├── authRoutes.js
│   ├── problemRoutes.js
│   ├── testRoutes.js
│   ├── studentRoutes.js
│   ├── submissionRoutes.js
│   └── aiRoutes.js
│
├── services/
│   ├── codeRunnerService.js
│   └── aiService.js
│
├── utils/
│   ├── createSlug.js
│   ├── getAttemptDeadline.js
│   └── rateLimiter.js
│
├── .env
├── package.json
└── server.js
```

Custom runner:

```text
code-runner/
│
├── src/
├── Dockerfile
├── package.json
└── ...
```

---

# Deployment Architecture

A production deployment should not use `localhost` between independently deployed services.

Conceptually:

```text
Vercel
  │
  └── React Frontend

Render / Similar Host
  │
  ├── Node/Express Backend
  │       │
  │       ├── MongoDB Atlas
  │       ├── Redis Service
  │       └── BullMQ
  │
  └── Docker Code Runner
```

Important:

```text
localhost:10000
```

works only when the backend and runner are reachable in the same local machine/network context.

In deployment, use the runner's internal/private service URL when supported, otherwise its protected network URL.

---

# Scalability for College Usage

Target workload:

```text
Maximum registered/active students: ~200
Test availability window: ~2 days
Individual duration: ~60 minutes
```

This architecture reduces burst pressure because students can start at different times.

Additional protections:

```text
Redis rate limit
+
BullMQ queue
+
MAX_CONCURRENT_JOBS
+
No database write on Run
+
Final-only source persistence
```

For a college assessment platform, some queue delay under a burst is acceptable as long as requests are not lost and students receive clear status feedback.

---

# Current Development Status

## Implemented / Substantially Implemented

```text
Authentication
      ✅
Role Authorization
      ✅
Student Registration
      ✅
Teacher Verification Flow
      ✅ / being polished
Problem Management
      ✅
Test Management
      ✅
Multiple Problems
      ✅
Test Publishing
      ✅
Access Code
      ✅
Student Join
      ✅
Start Test
      ✅
TestAttempt
      ✅
Timer Validation
      ✅
Custom Docker Runner
      ✅
Redis Rate Limiting
      ✅
BullMQ Queue
      ✅
Run Code
      ✅
Visible Testcase Execution
      ✅
Submit Code
      ✅
Hidden Testcase Execution
      ✅
Submission Tracking
      ✅
Marks Calculation
      ✅
Finish Test
      ✅
Temporary Attempt Cleanup
      ✅
Student Dashboard
      ✅
Student Results
      ✅
Teacher Student List
      ✅
Pagination
      ✅
```

## Currently Being Polished

```text
Teacher verification-request UI
Student detail page
Teacher result dashboard UX
Mobile responsiveness
Deployment of runner + backend + Redis
Production error handling
```

---

# Near-Term Roadmap

Priority next steps:

```text
1. Finalize student verification UX
2. Finalize teacher results dashboard
3. Improve student result details
4. Add robust auto-expiry/auto-finish behavior
5. Add production deployment configuration
6. Add runner health checks
7. Add queue monitoring
8. Add plagiarism/code-similarity detection
9. Add deeper per-problem analytics
10. Add test statistics and leaderboard if required
```

Optional future improvements:

- Import problem metadata from supported public problem links where legally and technically appropriate
- Plagiarism detection
- Code similarity analysis
- Contest mode
- Ranking system
- CSV result export
- Bulk student import
- Email notifications
- Teacher analytics charts
- Per-topic student performance

---

# Important Development Rules

1. Keep the `Test.problems` structure consistent across controllers.
2. Do not mix direct problem ObjectIds with `{ problem, marks }` without handling both intentionally.
3. Run Code must use visible test cases only.
4. Run Code must not store source code or execution records in MongoDB.
5. Submit Code must evaluate all required test cases.
6. Hidden test cases must never be returned to students.
7. `TestAttempt` must exist for active Run/Submit operations.
8. Permanent results/submissions must be used to prevent restarting a completed test after temporary attempt deletion.
9. Every protected operation must verify the authenticated user.
10. Backend timer validation remains authoritative.
11. Never trust frontend-calculated marks or verdicts.
12. Student completion checks must be scoped by student ID and test ID.
13. C++ code must be compiled as C++; Java code must be compiled as Java.
14. Backend and runner must agree on the language identifier.
15. Backend and runner must use the same runner authentication header.
16. Rate-limited clients should receive a clear retry/block message.
17. Teacher-only routes must not sit behind global student-only middleware.
18. Verification controllers should not accidentally trigger unrelated required-field validation.
19. Production services must not communicate using local-only `localhost` addresses unless they share the same host/network namespace.
20. One student's submission must never affect another student's dashboard state.

---

# Updated Roadmap

```text
Phase 1
Backend Foundation
      ✅

Phase 2
Problem Management
      ✅

Phase 3
Test Management
      ✅

Phase 4
Student Registration + Verification
      ✅

Phase 5
Student Test Attempt
      ✅

Phase 6
Redis + BullMQ Infrastructure
      ✅

Phase 7
Custom Docker Coding Engine
      ✅

Phase 8
Submission + Scoring
      ✅

Phase 9
Final Test Submission + Results
      ✅

Phase 10
Frontend Coding Arena
      ✅ / polishing

Phase 11
Teacher Analytics + Verification UX
      🚧

Phase 12
Deployment + Production Hardening
      🚧

Phase 13
Advanced Analytics / Plagiarism
      ⏳
```

---

# Project Goal

Campus Coding Arena aims to provide a practical college coding assessment environment inspired by online coding and hiring platforms while remaining lightweight enough for a small institutional deployment.

The current architecture focuses on:

```text
Student Verification
+
Problem Solving
+
Timed Assessments
+
Redis Rate Limiting
+
BullMQ Queueing
+
Docker-based Code Execution
+
Automated Evaluation
+
Final Submission Persistence
+
Performance Tracking
```

The final platform should allow a teacher to conduct structured programming assessments for approximately 200 students while giving students a realistic coding-test experience with controlled execution resources and clear submission rules.
