import { useEffect, useMemo, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Code2,
  FileText,
  Loader2,
  Play,
  Send,
  Sparkles,
  Terminal,
  X,
} from "lucide-react";

import { AnimatePresence, motion } from "framer-motion";

import toast from "react-hot-toast";

import api from "../../services/api";

// ============================================================

// LANGUAGE OPTIONS

// ============================================================

const languageOptions = [
  {
    label: "C++",

    value: "cpp",

    monaco: "cpp",
  },

  {
    label: "Java",

    value: "java",

    monaco: "java",
  },

  {
    label: "Python",

    value: "python",

    monaco: "python",
  },

  {
    label: "JavaScript",

    value: "javascript",

    monaco: "javascript",
  },
];

// ============================================================

// STARTER CODE

const starterCode = {
  cpp: `#include  <bits/stdc++.h>

using namespace std;

int main() {

    return 0;

}`,

  java: `import java.util. *;

public class Main {

    public static void main(String[] args) {

    }

}`,

  python: `def solve():

    pass

solve()`,

  javascript: `function solve() {

}

solve();`,
};

const CodingAssessment = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [test, setTest] = useState(null);

  const [attemptData, setAttemptData] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);

  const [language, setLanguage] = useState("cpp");

  const [codeMap, setCodeMap] = useState({});

  const [runResult, setRunResult] = useState(null);

  const [loading, setLoading] = useState(true);

  const [running, setRunning] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [finishing, setFinishing] = useState(false);

  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const [aiOpen, setAiOpen] = useState(false);

  const [aiPrompt, setAiPrompt] = useState("");

  const [aiLoading, setAiLoading] = useState(false);

  const [aiMessages, setAiMessages] = useState([]);

  // MOBILE

  const [mobilePanel, setMobilePanel] = useState("problem");

  useEffect(() => {
    const loadAssessment = async () => {
      try {
        setLoading(true);

        const [testResponse, attemptResponse] = await Promise.all([
          api.get(`/tests/${id}`),

          api.get(`/tests/${id}/attempt`),
        ]);

        const testData = testResponse.data.test;

        console.log("test data: ", testData);

        const attempt = attemptResponse.data;

        setTest(testData);

        setAttemptData(attempt);

        setRemainingSeconds(attempt.remainingSeconds || 0);

        try {
          const historyResponse = await api.get(`/ai/history/${id}`);

          const history = historyResponse.data.history || [];

          const messages = [];

          history.forEach((item) => {
            messages.push({
              role: "student",

              content: item.prompt,

              problemId: item.problem?._id || item.problem,
            });

            messages.push({
              role: "ai",

              content: item.response,

              problemId: item.problem?._id || item.problem,
            });
          });

          setAiMessages(messages);
        } catch (error) {
          console.error(
            "AI history error:",

            error,
          );
        }
      } catch (error) {
        console.error(
          "Assessment load error:",

          error.response?.data || error,
        );

        toast.error(
          error.response?.data?.message || "Failed to load assessment",
        );

        navigate(`/student/tests/${id}`);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadAssessment();
    }
  }, [id, navigate]);

  // ===========

const currentProblemEntry =
  test?.problems?.[currentIndex] ||
  null;

const currentProblem =
  currentProblemEntry?.problem &&
  typeof currentProblemEntry.problem === "object"
    ? currentProblemEntry.problem
    : currentProblemEntry;

const currentProblemId =
  currentProblem?._id ||
  (
    typeof currentProblemEntry?.problem ===
    "string"
      ? currentProblemEntry.problem
      : null
  ) ||
  currentProblemEntry?.problemId ||
  null;
  // ===========

  const code = useMemo(() => {
    if (!currentProblemId) {
      return "";
    }

    return codeMap[currentProblemId]?.[language] ?? starterCode[language];
  }, [codeMap, currentProblemId, language]);

  const promptsUsed = attemptData?.attempt?.aiPromptsUsed || 0;

  const maxPrompts = test?.maxAIPrompts || 0;

  const promptsRemaining = Math.max(
    maxPrompts - promptsUsed,

    0,
  );

  const currentAIMessages = aiMessages.filter(
    (message) => !message.problemId || message.problemId === currentProblemId,
  );

  useEffect(() => {
    if (loading || remainingSeconds <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setRemainingSeconds((previous) => {
        if (previous <= 1) {
          clearInterval(timer);

          toast.error("Assessment time is over");

          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading]);

  // ==========================================================

  // UPDATE CODE

  // ==========================================================

  const updateCode = (value) => {
    if (!currentProblemId) {
      return;
    }

    setCodeMap((previous) => ({
      ...previous,

      [currentProblemId]: {
        ...(previous[currentProblemId] || {}),

        [language]: value || "",
      },
    }));
  };

  // ==========================================================

  // CHANGE PROBLEM

  // ==========================================================

  const changeProblem = (index) => {
    if (index < 0 || index >= test.problems.length) {
      return;
    }

    setCurrentIndex(index);

    setRunResult(null);

    setMobilePanel("problem");
  };

  // ==========================================================

  // RUN CODE

  // ==========================================================

  const runCode = async () => {
    if (running || submitting || finishing) {
      return;
    }

    if (remainingSeconds <= 0) {
      toast.error("Assessment time has expired");

      return;
    }

    if (!code.trim()) {
      toast.error("Write some code first");

      return;
    }

    try {
      setRunning(true);

      setRunResult(null);

      const response = await api.post(
        "/code/run",

        {
          testId: id,

          problemId: currentProblemId,

          code,

          language,
        },
      );

      setRunResult(response.data.result);

      setMobilePanel("output");
    } catch (error) {
      console.error(
        "RUN CODE FULL ERROR:",

        error.response?.data || error.message,
      );

      toast.error(
        error.response?.data?.error ||
          error.response?.data?.message ||
          "Code execution failed",
      );

      if (error.response?.status === 403) {
        setRemainingSeconds(0);
      }
    } finally {
      setRunning(false);
    }
  };

  // ==========================================================

  // SUBMIT CODE

  // ==========================================================

  const submitCode = async () => {
    if (submitting || running || finishing) {
      return;
    }

    if (remainingSeconds <= 0) {
      toast.error("Assessment time has expired");

      return;
    }

    if (!code.trim()) {
      toast.error("Write code before submitting");

      return;
    }

    try {
      setSubmitting(true);

      const response = await api.post(
        "/submissions/submit",

        {
          testId: id,

          problemId: currentProblemId,

          code,

          language,
        },
      );

      const submission = response.data.submission;

      if (submission?.verdict === "Accepted") {
        toast.success("Problem accepted 🎉");
      } else {
        toast.error(submission?.verdict || "Submission failed");
      }

      setRunResult({
        status: submission?.verdict,

        stdout:
          submission?.verdict === "Accepted"
            ? "All test cases passed"
            : `${submission?.passedTestCases || 0}/${
                submission?.totalTestCases || 0
              } test cases passed`,
      });

      setMobilePanel("output");
    } catch (error) {
      console.error(
        "Submit error:",

        error,
      );

      toast.error(error.response?.data?.message || "Submission failed");

      if (error.response?.status === 403) {
        setRemainingSeconds(0);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================================

  // ASK AI

  // ==========================================================

  const askAI = async () => {
    if (remainingSeconds <= 0) {
      toast.error("Assessment time has expired");

      return;
    }

    if (!aiPrompt.trim()) {
      toast.error("Enter your question");

      return;
    }

    if (promptsRemaining <= 0) {
      toast.error("AI prompt limit reached");

      return;
    }

    const prompt = aiPrompt.trim();

    try {
      setAiLoading(true);

      const studentMessage = {
        role: "student",

        content: prompt,

        problemId: currentProblemId,
      };

      setAiMessages((previous) => [...previous, studentMessage]);

      setAiPrompt("");

      const response = await api.post(
        "/ai/ask",

        {
          testId: id,

          problemId: currentProblemId,

          prompt,

          code,
        },
      );

      const aiMessage = {
        role: "ai",

        content: response.data.answer,

        problemId: currentProblemId,
      };

      setAiMessages((previous) => [...previous, aiMessage]);

      setAttemptData((previous) => ({
        ...previous,

        attempt: {
          ...previous.attempt,

          aiPromptsUsed: response.data.promptsUsed,
        },
      }));
    } catch (error) {
      console.error(
        "AI error:",

        error,
      );

      toast.error(error.response?.data?.message || "AI request failed");

      setAiMessages((previous) =>
        previous.slice(
          0,

          -1,
        ),
      );
    } finally {
      setAiLoading(false);
    }
  };

  // ==========================================================

  // FINISH TEST

  // ==========================================================

  const finishTest = async () => {
    if (finishing || submitting || running) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to finish and submit the complete assessment?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setFinishing(true);

      const response = await api.post(`/tests/${id}/finish`);

      toast.success(
        response.data?.message || "Assessment submitted successfully",
      );

      navigate(`/student`, {
        replace: true,
      });
    } catch (error) {
      console.error("Finish test error:", error.response?.data || error);

      toast.error(
        error.response?.data?.message || "Unable to finish assessment",
      );
    } finally {
      setFinishing(false);
    }
  };

  // ==========================================================
  // LOADING

  // ==========================================================

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f7f8fc]">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Loader2 size={25} className="animate-spin" />
          </div>

          <p className="mt-4 font-semibold text-gray-700">
            Loading assessment{" "}
          </p>

          <p className="mt-1 text-sm text-gray-400">
            Preparing your coding workspace...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================

  // ERROR

  // ==========================================================

  if (
    !test ||
    !Array.isArray(test.problems) ||
    test.problems.length === 0 ||
    !currentProblem ||
    !currentProblemId
  ) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f7f8fc]">
        <div className="text-center">
          <AlertTriangle size={40} className="mx-auto text-amber-500" />

          <h2 className="mt-4 text-xl font-bold text-gray-900">
            Assessment problem not found
          </h2>

          <button
            onClick={() => navigate(`/student`)}
            className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white"
          >
            Back to Test
          </button>
        </div>
      </div>
    );
  }

  const selectedLanguage = languageOptions.find(
    (item) => item.value === language,
  );

  // ==========================================================

  // UI

  // ==========================================================

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-[#f7f8fc]">
      {/* =====================================================  */}

      {/* HEADER  */}

      {/* =====================================================  */}

      <header className="relative z-30 flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-3 shadow-sm sm:px-5">
        {/* LEFT  */}

        <div className="min-w-0">
          <h1 className="max-w-[160px] truncate text-sm font-bold text-gray-900 sm:max-w-xs sm:text-base md:max-w-sm xl:max-w-xl">
            {test.title}
          </h1>

          <p className="mt-0.5 text-[10px] text-gray-400 sm:text-xs">
            Problem {currentIndex + 1} of {test.problems.length}
          </p>
        </div>

        {/* RIGHT  */}

        <div className="flex items-center gap-2">
          {/* AI DESKTOP  */}

          <motion.button
            whileTap={{
              scale: 0.96,
            }}
            onClick={() => setAiOpen((previous) => !previous)}
            disabled={remainingSeconds === 0}
            className="hidden items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 transition hover:bg-violet-100 disabled:opacity-50 sm:flex"
          >
            <Bot size={16} />

            <span className="hidden md:inline">AI Assistant </span>

            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] shadow-sm">
              {promptsRemaining} left
            </span>
          </motion.button>

          {/* TIMER  */}

          <div
            className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold sm:text-sm ${
              remainingSeconds < 300
                ? "bg-red-50 text-red-600 ring-1 ring-red-100"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            <Clock3 size={16} />

            {formatTime(remainingSeconds)}
          </div>

          {/* FINISH  */}

          <motion.button
            whileTap={{
              scale: 0.96,
            }}
            onClick={finishTest}
            disabled={finishing || submitting || running}
            className="rounded-xl bg-red-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-600 disabled:opacity-50 sm:px-4 sm:text-sm"
          >
            {finishing ? "Finishing..." : "Finish"}
          </motion.button>
        </div>
      </header>

      {/* =====================================================  */}

      {/* MOBILE NAVIGATION TABS  */}

      {/* =====================================================  */}

      <div className="flex h-12 shrink-0 border-b border-gray-200 bg-white lg:hidden">
        <MobileTab
          icon={FileText}
          label="Problem"
          active={mobilePanel === "problem"}
          onClick={() => setMobilePanel("problem")}
        />

        <MobileTab
          icon={Code2}
          label="Code"
          active={mobilePanel === "code"}
          onClick={() => setMobilePanel("code")}
        />

        <MobileTab
          icon={Terminal}
          label="Output"
          active={mobilePanel === "output"}
          onClick={() => setMobilePanel("output")}
        />

        <button
          type="button"
          disabled={remainingSeconds === 0}
          onClick={() => setAiOpen(true)}
          className="flex flex-1 items-center justify-center gap-1.5 text-xs font-semibold text-violet-600 disabled:opacity-40"
        >
          <Bot size={15} />
          AI
          <span className="rounded-full bg-violet-50 px-1.5 py-0.5 text-[9px]">
            {promptsRemaining}
          </span>
        </button>
      </div>

      {/* =====================================================  */}

      {/* DESKTOP WORKSPACE  */}

      {/* =====================================================  */}

      <div className="hidden min-h-0 flex-1 lg:flex">
        {/* PROBLEM  */}

        <motion.aside
          animate={{
            width: aiOpen ? "31%" : "38%",
          }}
          transition={{
            duration: 0.25,
          }}
          className="shrink-0 overflow-y-auto border-r border-gray-200 bg-white"
        >
          <ProblemContent
            currentProblem={currentProblem}
            currentProblemEntry={currentProblemEntry}
            currentIndex={currentIndex}
          />
        </motion.aside>

        {/* EDITOR AREA  */}

        <main className="flex min-w-0 flex-1 flex-col">
          <EditorToolbar
            language={language}
            setLanguage={setLanguage}
            setRunResult={setRunResult}
            runCode={runCode}
            submitCode={submitCode}
            running={running}
            submitting={submitting}
            remainingSeconds={remainingSeconds}
          />

          {/* MONACO  */}

          <div className="min-h-0 flex-1 bg-[#1e1e1e]">
            <Editor
              height="100%"
              language={selectedLanguage?.monaco || "cpp"}
              theme="vs-dark"
              value={code}
              onChange={updateCode}
              options={{
                fontSize: 14,

                fontFamily: "Menlo, Monaco, Consolas, monospace",

                minimap: {
                  enabled: false,
                },

                wordWrap: "on",

                automaticLayout: true,

                scrollBeyondLastLine: false,

                tabSize: 2,

                lineNumbers: "on",

                roundedSelection: false,

                padding: {
                  top: 16,
                },

                suggestOnTriggerCharacters: true,

                quickSuggestions: true,

                smoothScrolling: true,

                cursorSmoothCaretAnimation: "on",

                renderLineHighlight: "all",
              }}
            />
          </div>

          <OutputPanel
            runResult={runResult}
            setRunResult={setRunResult}
            compact
          />

          <ProblemNavigation
            currentIndex={currentIndex}
            problems={test.problems}
            changeProblem={changeProblem}
          />
        </main>

        {/* AI DESKTOP  */}

        <AnimatePresence>
          {aiOpen && (
            <motion.aside
              initial={{
                width: 0,

                opacity: 0,
              }}
              animate={{
                width: 360,

                opacity: 1,
              }}
              exit={{
                width: 0,

                opacity: 0,
              }}
              transition={{
                duration: 0.25,
              }}
              className="shrink-0 overflow-hidden border-l border-gray-200 bg-white"
            >
              <AIContent
                promptsRemaining={promptsRemaining}
                maxPrompts={maxPrompts}
                currentAIMessages={currentAIMessages}
                aiLoading={aiLoading}
                aiPrompt={aiPrompt}
                setAiPrompt={setAiPrompt}
                remainingSeconds={remainingSeconds}
                askAI={askAI}
                close={() => setAiOpen(false)}
              />
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* =====================================================  */}

      {/* MOBILE / TABLET  */}

      {/* =====================================================  */}

      <div className="min-h-0 flex-1 lg:hidden">
        <AnimatePresence mode="wait">
          {/* PROBLEM  */}

          {mobilePanel === "problem" && (
            <motion.div
              key="mobile-problem"
              initial={{
                opacity: 0,

                x: -15,
              }}
              animate={{
                opacity: 1,

                x: 0,
              }}
              exit={{
                opacity: 0,

                x: -15,
              }}
              className="flex h-full flex-col bg-white"
            >
              <div className="min-h-0 flex-1 overflow-y-auto">
                <ProblemContent
                  currentProblem={currentProblem}
                  currentProblemEntry={currentProblemEntry}
                  currentIndex={currentIndex}
                />
              </div>

              <div className="shrink-0 border-t border-gray-200 bg-white p-3">
                <button
                  type="button"
                  onClick={() => setMobilePanel("code")}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20"
                >
                  Open Code Editor
                  <ChevronRight size={17} />
                </button>
              </div>
            </motion.div>
          )}

          {/* CODE  */}

          {mobilePanel === "code" && (
            <motion.div
              key="mobile-code"
              initial={{
                opacity: 0,

                x: 15,
              }}
              animate={{
                opacity: 1,

                x: 0,
              }}
              exit={{
                opacity: 0,

                x: 15,
              }}
              className="flex h-full flex-col"
            >
              <EditorToolbar
                language={language}
                setLanguage={setLanguage}
                setRunResult={setRunResult}
                runCode={runCode}
                submitCode={submitCode}
                running={running}
                submitting={submitting}
                remainingSeconds={remainingSeconds}
                mobile
              />

              <div className="min-h-0 flex-1 bg-[#1e1e1e]">
                <Editor
                  height="100%"
                  language={selectedLanguage?.monaco || "cpp"}
                  theme="vs-dark"
                  value={code}
                  onChange={updateCode}
                  options={{
                    fontSize: 13,

                    fontFamily: "Menlo, Monaco, Consolas, monospace",

                    minimap: {
                      enabled: false,
                    },

                    automaticLayout: true,

                    wordWrap: "on",

                    scrollBeyondLastLine: false,

                    tabSize: 2,

                    padding: {
                      top: 14,
                    },
                  }}
                />
              </div>

              <ProblemNavigation
                currentIndex={currentIndex}
                problems={test.problems}
                changeProblem={changeProblem}
                mobile
              />
            </motion.div>
          )}

          {/* OUTPUT  */}

          {mobilePanel === "output" && (
            <motion.div
              key="mobile-output"
              initial={{
                opacity: 0,

                x: 15,
              }}
              animate={{
                opacity: 1,

                x: 0,
              }}
              exit={{
                opacity: 0,

                x: 15,
              }}
              className="h-full overflow-y-auto bg-white"
            >
              <OutputPanel
                runResult={runResult}
                setRunResult={setRunResult}
                full
              />

              <div className="p-4">
                <button
                  type="button"
                  onClick={() => setMobilePanel("code")}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700"
                >
                  <ChevronLeft size={17} />
                  Back to Code
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* =====================================================  */}

      {/* MOBILE AI DRAWER  */}

      {/* =====================================================  */}

      <AnimatePresence>
        {aiOpen && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            className="fixed inset-0 z-[80] lg:hidden"
          >
            <button
              type="button"
              onClick={() => setAiOpen(false)}
              className="absolute inset-0 bg-black/35 backdrop-blur-[2px]"
            />

            <motion.div
              initial={{
                y: "100%",
              }}
              animate={{
                y: 0,
              }}
              exit={{
                y: "100%",
              }}
              transition={{
                type: "spring",

                damping: 28,

                stiffness: 260,
              }}
              className="absolute inset-x-0 bottom-0 h-[82vh] overflow-hidden rounded-t-[28px] bg-white shadow-2xl"
            >
              <AIContent
                promptsRemaining={promptsRemaining}
                maxPrompts={maxPrompts}
                currentAIMessages={currentAIMessages}
                aiLoading={aiLoading}
                aiPrompt={aiPrompt}
                setAiPrompt={setAiPrompt}
                remainingSeconds={remainingSeconds}
                askAI={askAI}
                close={() => setAiOpen(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================

// PROBLEM CONTENT

// ============================================================

const ProblemContent = ({
  currentProblem,

  currentProblemEntry,

  currentIndex,
}) => {
  const visibleTestCases =
    currentProblem.testCases?.filter((item) => !item.isHidden) || [];

  return (
    <div className="p-5 sm:p-6">
      {/* BADGES  */}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${difficultyClass(
              currentProblem.difficulty,
            )}`}
          >
            {currentProblem.difficulty}
          </span>

          {currentProblem.topic && (
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              {currentProblem.topic}
            </span>
          )}
        </div>

        <span className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-600">
          {currentProblemEntry?.marks ?? currentProblem?.marks ?? 0} marks
        </span>
      </div>

      {/* TITLE  */}

      <h2 className="text-xl font-bold leading-snug text-gray-950 sm:text-2xl">
        {currentIndex + 1}. {currentProblem.title}
      </h2>

      {/* TAGS  */}

      {currentProblem.tags?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {currentProblem.tags.map((tag, index) => (
            <span
              key={index}
              className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-500"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* DESCRIPTION  */}

      <ProblemSection
        title="Description"
        content={currentProblem.description}
        plain
      />

      {/* INPUT  */}

      {currentProblem.inputFormat && (
        <ProblemSection
          title="Input Format"
          content={currentProblem.inputFormat}
        />
      )}

      {/* OUTPUT  */}

      {currentProblem.outputFormat && (
        <ProblemSection
          title="Output Format"
          content={currentProblem.outputFormat}
        />
      )}

      {/* CONSTRAINTS  */}

      {currentProblem.constraints?.length > 0 && (
        <div className="mt-7">
          <h3 className="mb-3 text-sm font-bold text-gray-900 sm:text-base">
            Constraints
          </h3>

          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
            {currentProblem.constraints.map(
              (
                item,

                index,
              ) => (
                <p
                  key={index}
                  className="mb-1 break-words font-mono text-xs leading-6 text-gray-700 sm:text-sm"
                >
                  {item}
                </p>
              ),
            )}
          </div>
        </div>
      )}
{(
  currentProblem?.timeComplexity ||
  currentProblem?.spaceComplexity
) && (
  <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
    <p className="mb-3 text-sm font-semibold text-gray-900">
      Expected Complexity
    </p>

    <div className="flex flex-wrap gap-3">
      {currentProblem?.timeComplexity && (
        <span className="rounded-lg bg-white px-3 py-2 text-sm text-gray-700">
          Time:{" "}
          <strong>
            {currentProblem.timeComplexity}
          </strong>
        </span>
      )}

      {currentProblem?.spaceComplexity && (
        <span className="rounded-lg bg-white px-3 py-2 text-sm text-gray-700">
          Space:{" "}
          <strong>
            {currentProblem.spaceComplexity}
          </strong>
        </span>
      )}
    </div>
  </div>
)}

      {/* EXAMPLES  */}

      {visibleTestCases.length > 0 && (
        <div className="mt-7">
          <h3 className="mb-4 text-sm font-bold text-gray-900 sm:text-base">
            Examples
          </h3>

          {visibleTestCases.map(
            (
              item,

              index,
            ) => (
              <div
                key={index}
                className="mb-4 rounded-2xl border border-gray-200 bg-white p-4"
              >
                <p className="mb-3 text-sm font-bold text-gray-800">
                  Example {index + 1}
                </p>

                <CodeOutput label="Input" value={item.input} />

                <CodeOutput label="Output" value={item.expectedOutput} />
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================

// EDITOR TOOLBAR

// ============================================================

const EditorToolbar = ({
  language,

  setLanguage,

  setRunResult,

  runCode,

  submitCode,

  running,

  submitting,

  remainingSeconds,

  mobile = false,
}) => {
  return (
    <div
      className={`shrink-0 border-b border-gray-200 bg-white ${
        mobile ? "p-3" : "flex h-14 items-center justify-between px-4"
      }`}
    >
      <div
        className={
          mobile ? "flex items-center gap-2" : "flex items-center gap-3"
        }
      >
        <select
          value={language}
          onChange={(e) => {
            setLanguage(e.target.value);

            setRunResult(null);
          }}
          className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700 outline-none transition focus:border-indigo-500 focus:bg-white sm:text-sm"
        >
          {languageOptions.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>

        {!mobile && (
          <span className="hidden text-xs text-gray-400 xl:block">
            Code is preserved separately for each problem and language.
          </span>
        )}
      </div>

      <div className={mobile ? "mt-3 grid grid-cols-2 gap-2" : "flex gap-2"}>
        <motion.button
          whileTap={{
            scale: 0.96,
          }}
          type="button"
          onClick={runCode}
          disabled={running || submitting || remainingSeconds === 0}
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 sm:text-sm"
        >
          {running ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Play size={16} />
          )}

          {running ? "Running..." : "Run"}
        </motion.button>

        <motion.button
          whileTap={{
            scale: 0.96,
          }}
          type="button"
          onClick={submitCode}
          disabled={submitting || running || remainingSeconds === 0}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 transition disabled:opacity-50 sm:text-sm"
        >
          {submitting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Send size={16} />
          )}

          {submitting ? "Submitting..." : "Submit"}
        </motion.button>
      </div>
    </div>
  );
};

// ============================================================

// OUTPUT PANEL

// ============================================================

const OutputPanel = ({
  runResult,

  setRunResult,

  compact = false,

  full = false,
}) => {
  const status =
    typeof runResult?.status === "object"
      ? runResult.status?.description
      : runResult?.status;

  const accepted = status === "Accepted" || status === "accepted";

  return (
    <div
      className={`shrink-0 border-t border-gray-200 bg-white ${
        full ? "min-h-full" : compact ? "h-52 overflow-auto" : ""
      }`}
    >
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <Terminal size={17} className="text-indigo-600" />

          <h3 className="text-sm font-bold text-gray-900">Output </h3>
        </div>

        {runResult && (
          <button
            type="button"
            onClick={() => setRunResult(null)}
            className="text-xs font-medium text-gray-400 transition hover:text-gray-700"
          >
            Clear
          </button>
        )}
      </div>

      <div className={full ? "p-5 sm:p-6" : "p-4"}>
        {!runResult ? (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
              <Terminal size={21} />
            </div>

            <p className="mt-4 text-sm font-medium text-gray-500">
              No output yet
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Run or submit your code to see the result.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* STATUS  */}

            {status && (
              <div
                className={`flex items-center gap-2 rounded-xl border p-3 ${
                  accepted
                    ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 bg-gray-50 text-gray-700"
                }`}
              >
                {accepted ? <CheckCircle2 size={17} /> : <Terminal size={17} />}

                <span className="text-sm font-semibold">{status} </span>
              </div>
            )}

            {runResult.stdout !== undefined && (
              <ResultRow
                label="Output"
                value={runResult.stdout || "No output"}
              />
            )}

            {runResult.expectedOutput !== undefined && (
              <ResultRow label="Expected" value={runResult.expectedOutput} />
            )}

            {runResult.stderr && (
              <ResultRow label="Runtime Error" value={runResult.stderr} error />
            )}

            {runResult.compileOutput && (
              <ResultRow
                label="Compilation Error"
                value={runResult.compileOutput}
                error
              />
            )}

            {(runResult.time || runResult.memory) && (
              <div className="flex flex-wrap gap-2">
                {runResult.time && (
                  <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600">
                    Time: {runResult.time} sec
                  </span>
                )}

                {runResult.memory && (
                  <span className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600">
                    Memory: {runResult.memory} KB
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================

// PROBLEM NAVIGATION

// ============================================================

const ProblemNavigation = ({
  currentIndex,

  problems,

  changeProblem,

  mobile = false,
}) => {
  return (
    <div
      className={`shrink-0 border-t border-gray-200 bg-white ${
        mobile ? "p-3" : "flex h-16 items-center justify-between px-5"
      }`}
    >
      <div
        className={
          mobile
            ? "mb-3 flex items-center justify-center gap-2 overflow-x-auto"
            : "order-2 flex max-w-[60%] gap-2 overflow-x-auto"
        }
      >
        {problems.map((_, index) => (
          <button
            type="button"
            key={index}
            onClick={() => changeProblem(index)}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition ${
              currentIndex === index
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <div className={mobile ? "grid grid-cols-2 gap-2" : "contents"}>
        <button
          type="button"
          disabled={currentIndex === 0}
          onClick={() => changeProblem(currentIndex - 1)}
          className="order-1 flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 disabled:opacity-30"
        >
          <ChevronLeft size={17} />
          Previous
        </button>

        <button
          type="button"
          disabled={currentIndex === problems.length - 1}
          onClick={() => changeProblem(currentIndex + 1)}
          className="order-3 flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 disabled:opacity-30"
        >
          Next
          <ChevronRight size={17} />
        </button>
      </div>
    </div>
  );
};

// ============================================================

// AI CONTENT

// ============================================================

const AIContent = ({
  promptsRemaining,
  maxPrompts,
  currentAIMessages,
  aiLoading,
  aiPrompt,
  setAiPrompt,
  remainingSeconds,
  askAI,
  close,
}) => {
  const usedPrompts = Math.max(
    maxPrompts - promptsRemaining,
    0,
  );

  const progress =
    maxPrompts > 0
      ? (promptsRemaining / maxPrompts) * 100
      : 0;

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !aiLoading &&
      aiPrompt.trim() &&
      promptsRemaining > 0 &&
      remainingSeconds > 0
    ) {
      event.preventDefault();

      askAI();
    }
  };

  return (
    <div className="flex h-full w-full flex-col bg-[#fafbff]">
      <div className="shrink-0 border-b border-gray-200 bg-white px-4 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
              <Sparkles size={19} />

              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-sm font-bold text-gray-950">
                  AI Assistant
                </h3>

                <span className="rounded-full border border-violet-100 bg-violet-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-violet-600">
                  Hint Mode
                </span>
              </div>

              <p className="mt-1 text-[11px] leading-4 text-gray-500">
                Ask for hints, debugging help and complexity guidance.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={close}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="shrink-0 border-b border-gray-100 bg-white px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">
              AI Prompts
            </p>

            <p className="mt-1 text-xs font-semibold text-gray-700">
              {promptsRemaining} remaining
            </p>
          </div>

          <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 text-right">
            <p className="text-[10px] text-indigo-400">
              Used
            </p>

            <p className="text-sm font-bold text-indigo-700">
              {usedPrompts}/{maxPrompts}
            </p>
          </div>
        </div>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-100">
          <motion.div
            initial={{
              width: 0,
            }}
            animate={{
              width: `${Math.max(
                0,
                Math.min(progress, 100),
              )}%`,
            }}
            transition={{
              duration: 0.4,
            }}
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
        {currentAIMessages.length === 0 ? (
          <div className="flex h-full min-h-[320px] items-center justify-center">
            <div className="w-full max-w-sm text-center">
              <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-[22px] border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 text-indigo-600 shadow-sm">
                <Bot size={29} />

                <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm">
                  <Sparkles
                    size={12}
                    className="text-violet-500"
                  />
                </div>
              </div>

              <h4 className="mt-5 text-base font-bold text-gray-900">
                Need a hint?
              </h4>

              <p className="mx-auto mt-2 max-w-[280px] text-xs leading-5 text-gray-500">
                Ask me about your approach, bugs, edge cases or complexity.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-2 text-left">
                {[
                  "Give me a hint",
                  "What's wrong with my approach?",
                  "Help with time complexity",
                ].map((text) => (
                  <button
                    key={text}
                    type="button"
                    disabled={
                      aiLoading ||
                      promptsRemaining <= 0 ||
                      remainingSeconds === 0
                    }
                    onClick={() =>
                      setAiPrompt(text)
                    }
                    className="group flex items-center justify-between rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs font-medium text-gray-600 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50/50 hover:text-indigo-700 disabled:opacity-50"
                  >
                    <span>{text}</span>

                    <ChevronRight
                      size={14}
                      className="text-gray-300 transition group-hover:text-indigo-500"
                    />
                  </button>
                ))}
              </div>

              <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50/80 px-3 py-2.5 text-[10px] leading-4 text-amber-700">
                AI gives guidance and hints instead of directly solving the
                complete assessment.
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {currentAIMessages.map(
              (message, index) => {
                const isStudent =
                  message.role ===
                  "student";

                return (
                  <motion.div
                    key={`${message.role}-${index}`}
                    initial={{
                      opacity: 0,
                      y: 8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.2,
                    }}
                    className={`flex ${
                      isStudent
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex max-w-[95%] gap-2.5 ${
                        isStudent
                          ? "flex-row-reverse"
                          : ""
                      }`}
                    >
                      <div
                        className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                          isStudent
                            ? "bg-indigo-100 text-indigo-600"
                            : "bg-gradient-to-br from-indigo-600 to-violet-600 text-white"
                        }`}
                      >
                        {isStudent ? (
                          <span className="text-[10px] font-bold">
                            You
                          </span>
                        ) : (
                          <Sparkles size={13} />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p
                          className={`mb-1 px-1 text-[10px] font-semibold ${
                            isStudent
                              ? "text-right text-indigo-400"
                              : "text-gray-400"
                          }`}
                        >
                          {isStudent
                            ? "You"
                            : "AI Assistant"}
                        </p>

                        <div
                          className={`overflow-hidden rounded-2xl px-4 py-3 text-sm shadow-sm ${
                            isStudent
                              ? "rounded-tr-md bg-gradient-to-br from-indigo-600 to-violet-600 text-white"
                              : "rounded-tl-md border border-gray-200 bg-white text-gray-700"
                          }`}
                        >
                          {isStudent ? (
                            <p className="whitespace-pre-wrap break-words leading-6">
                              {
                                message.content
                              }
                            </p>
                          ) : (
                            <ReactMarkdown
                              components={{
                                h1: ({
                                  children,
                                }) => (
                                  <h1 className="mb-3 mt-5 text-lg font-bold leading-6 text-gray-950 first:mt-0">
                                    {
                                      children
                                    }
                                  </h1>
                                ),

                                h2: ({
                                  children,
                                }) => (
                                  <h2 className="mb-3 mt-5 text-base font-bold leading-6 text-gray-950 first:mt-0">
                                    {
                                      children
                                    }
                                  </h2>
                                ),

                                h3: ({
                                  children,
                                }) => (
                                  <h3 className="mb-2 mt-4 text-sm font-bold text-gray-950 first:mt-0">
                                    {
                                      children
                                    }
                                  </h3>
                                ),

                                h4: ({
                                  children,
                                }) => (
                                  <h4 className="mb-2 mt-4 text-sm font-semibold text-gray-900 first:mt-0">
                                    {
                                      children
                                    }
                                  </h4>
                                ),

                                p: ({
                                  children,
                                }) => (
                                  <p className="mb-3 break-words text-sm leading-6 text-gray-700 last:mb-0">
                                    {
                                      children
                                    }
                                  </p>
                                ),

                                strong: ({
                                  children,
                                }) => (
                                  <strong className="font-bold text-gray-950">
                                    {
                                      children
                                    }
                                  </strong>
                                ),

                                em: ({
                                  children,
                                }) => (
                                  <em className="text-gray-700">
                                    {
                                      children
                                    }
                                  </em>
                                ),

                                ul: ({
                                  children,
                                }) => (
                                  <ul className="mb-3 ml-5 list-disc space-y-1.5 text-sm text-gray-700 marker:text-indigo-500">
                                    {
                                      children
                                    }
                                  </ul>
                                ),

                                ol: ({
                                  children,
                                }) => (
                                  <ol className="mb-3 ml-5 list-decimal space-y-1.5 text-sm text-gray-700 marker:font-semibold marker:text-indigo-600">
                                    {
                                      children
                                    }
                                  </ol>
                                ),

                                li: ({
                                  children,
                                }) => (
                                  <li className="pl-0.5 leading-6">
                                    {
                                      children
                                    }
                                  </li>
                                ),

                                blockquote: ({
                                  children,
                                }) => (
                                  <blockquote className="my-3 border-l-4 border-indigo-300 bg-indigo-50 px-3 py-2 text-sm italic text-indigo-800">
                                    {
                                      children
                                    }
                                  </blockquote>
                                ),

                                hr: () => (
                                  <hr className="my-4 border-gray-200" />
                                ),

                                code: ({
                                  children,
                                  className,
                                  ...props
                                }) => {
                                  const isBlock =
                                    Boolean(
                                      className,
                                    );

                                  if (
                                    isBlock
                                  ) {
                                    return (
                                      <code
                                        className={`${className || ""} font-mono text-xs text-gray-100`}
                                        {...props}
                                      >
                                        {
                                          children
                                        }
                                      </code>
                                    );
                                  }

                                  return (
                                    <code
                                      className="rounded-md bg-indigo-50 px-1.5 py-0.5 font-mono text-[12px] font-medium text-indigo-700"
                                      {...props}
                                    >
                                      {
                                        children
                                      }
                                    </code>
                                  );
                                },

                                pre: ({
                                  children,
                                }) => (
                                  <pre className="my-3 max-w-full overflow-x-auto rounded-xl border border-gray-800 bg-[#111827] p-3 text-xs leading-5 text-gray-100 shadow-inner">
                                    {
                                      children
                                    }
                                  </pre>
                                ),

                                a: ({
                                  children,
                                  href,
                                }) => (
                                  <a
                                    href={href}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="font-medium text-indigo-600 underline decoration-indigo-200 underline-offset-2 transition hover:text-indigo-700"
                                  >
                                    {
                                      children
                                    }
                                  </a>
                                ),

                                table: ({
                                  children,
                                }) => (
                                  <div className="my-3 overflow-x-auto rounded-xl border border-gray-200">
                                    <table className="w-full text-left text-xs">
                                      {
                                        children
                                      }
                                    </table>
                                  </div>
                                ),

                                thead: ({
                                  children,
                                }) => (
                                  <thead className="bg-gray-50 text-gray-600">
                                    {
                                      children
                                    }
                                  </thead>
                                ),

                                th: ({
                                  children,
                                }) => (
                                  <th className="border-b border-gray-200 px-3 py-2 font-semibold">
                                    {
                                      children
                                    }
                                  </th>
                                ),

                                td: ({
                                  children,
                                }) => (
                                  <td className="border-b border-gray-100 px-3 py-2 text-gray-600">
                                    {
                                      children
                                    }
                                  </td>
                                ),
                              }}
                            >
                              {String(
                                message.content ||
                                  "",
                              )}
                            </ReactMarkdown>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              },
            )}

            {aiLoading && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 6,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                className="flex justify-start"
              >
                <div className="flex gap-2.5">
                  <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
                    <Sparkles
                      size={13}
                    />
                  </div>

                  <div>
                    <p className="mb-1 px-1 text-[10px] font-semibold text-gray-400">
                      AI Assistant
                    </p>

                    <div className="flex items-center gap-2 rounded-2xl rounded-tl-md border border-gray-200 bg-white px-4 py-3 text-sm text-gray-500 shadow-sm">
                      <Loader2
                        size={15}
                        className="animate-spin text-indigo-500"
                      />

                      <span>
                        Thinking...
                      </span>

                      <div className="flex items-center gap-1">
                        {[0, 1, 2].map(
                          (item) => (
                            <motion.span
                              key={
                                item
                              }
                              animate={{
                                opacity:
                                  [
                                    0.25,
                                    1,
                                    0.25,
                                  ],
                              }}
                              transition={{
                                duration: 1,
                                repeat:
                                  Infinity,
                                delay:
                                  item *
                                  0.15,
                              }}
                              className="h-1 w-1 rounded-full bg-indigo-400"
                            />
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-gray-200 bg-white p-3 sm:p-4">
        {promptsRemaining <= 0 ? (
          <div className="mb-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-center text-xs font-medium text-red-600">
            AI prompt limit reached
          </div>
        ) : remainingSeconds <= 0 ? (
          <div className="mb-3 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-center text-xs font-medium text-red-600">
            Assessment time has expired
          </div>
        ) : null}

        <div
          className={`rounded-2xl border bg-gray-50 transition ${
            aiPrompt.trim()
              ? "border-indigo-200 bg-white shadow-sm shadow-indigo-500/5"
              : "border-gray-200"
          }`}
        >
          <textarea
            value={aiPrompt}
            onChange={(event) =>
              setAiPrompt(
                event.target.value,
              )
            }
            onKeyDown={
              handleKeyDown
            }
            disabled={
              aiLoading ||
              promptsRemaining <= 0 ||
              remainingSeconds === 0
            }
            maxLength={1000}
            placeholder={
              promptsRemaining > 0
                ? "Ask for a hint..."
                : "AI prompt limit reached"
            }
            className="min-h-[76px] w-full resize-none bg-transparent px-4 pb-2 pt-3 text-sm leading-6 text-gray-800 outline-none placeholder:text-gray-400 disabled:cursor-not-allowed disabled:text-gray-400"
          />

          <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-3 py-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="hidden text-[10px] text-gray-400 sm:block">
                Enter to send • Shift + Enter for new line
              </span>

              <span className="text-[10px] text-gray-300 sm:hidden">
                {aiPrompt.length}/1000
              </span>
            </div>

            <motion.button
              whileTap={{
                scale: 0.94,
              }}
              type="button"
              onClick={askAI}
              disabled={
                aiLoading ||
                !aiPrompt.trim() ||
                promptsRemaining <=
                  0 ||
                remainingSeconds ===
                  0
              }
              className="flex h-9 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:shadow-lg hover:shadow-indigo-500/25 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {aiLoading ? (
                <Loader2
                  size={14}
                  className="animate-spin"
                />
              ) : (
                <Send size={14} />
              )}

              <span>
                {aiLoading
                  ? "Thinking"
                  : "Send"}
              </span>
            </motion.button>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between px-1">
          <p className="text-[9px] text-gray-400">
            Each successful request uses 1 AI prompt.
          </p>

          <p className="text-[9px] font-medium text-gray-400">
            {aiPrompt.length}/1000
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================================

// MOBILE TAB

// ============================================================

const MobileTab = ({
  icon: Icon,

  label,

  active,

  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-1 items-center justify-center gap-1.5 text-xs font-semibold transition ${
        active ? "text-indigo-600" : "text-gray-500"
      }`}
    >
      <Icon size={15} />

      {label}

      {active && (
        <motion.div
          layoutId="mobile-tab"
          className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-indigo-600"
        />
      )}
    </button>
  );
};

// ============================================================

// HELPERS

// ============================================================

const formatTime = (totalSeconds) => {
  const seconds = Math.max(
    totalSeconds,

    0,
  );

  const hours = Math.floor(seconds / 3600);

  const minutes = Math.floor((seconds % 3600) / 60);

  const remaining = seconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(
      2,

      "0",
    )}:${String(minutes).padStart(
      2,

      "0",
    )}:${String(remaining).padStart(
      2,

      "0",
    )}`;
  }

  return `${String(minutes).padStart(
    2,

    "0",
  )}:${String(remaining).padStart(
    2,

    "0",
  )}`;
};

const difficultyClass = (difficulty) => {
  if (difficulty === "Easy") {
    return "border-emerald-100 bg-emerald-50 text-emerald-600";
  }

  if (difficulty === "Medium") {
    return "border-amber-100 bg-amber-50 text-amber-600";
  }

  return "border-red-100 bg-red-50 text-red-600";
};

// ============================================================

// PROBLEM SECTION

// ============================================================

const ProblemSection = ({
  title,

  content,

  plain = false,
}) => (
  <div className="mt-7">
    <h3 className="mb-3 text-sm font-bold text-gray-900 sm:text-base">
      {title}
    </h3>

    {plain ? (
      <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700 sm:text-base">
        {content}
      </p>
    ) : (
      <div className="whitespace-pre-wrap rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm leading-6 text-gray-700">
        {content}
      </div>
    )}
  </div>
);

// ============================================================

// CODE OUTPUT

// ============================================================

const CodeOutput = ({
  label,

  value,
}) => (
  <div className="mb-3">
    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
      {label}
    </p>

    <pre className="overflow-auto whitespace-pre-wrap rounded-xl border border-gray-100 bg-gray-50 p-3 font-mono text-xs leading-6 text-gray-700 sm:text-sm">
      {value}
    </pre>
  </div>
);

// ============================================================

// RESULT ROW

// ============================================================

const ResultRow = ({
  label,

  value,

  error = false,
}) => (
  <div>
    <p
      className={`mb-1.5 text-[10px] font-bold uppercase tracking-wider ${
        error ? "text-red-500" : "text-gray-400"
      }`}
    >
      {label}
    </p>

    <pre
      className={`max-h-56 overflow-auto whitespace-pre-wrap rounded-xl border p-3 font-mono text-xs leading-6 sm:text-sm ${
        error
          ? "border-red-100 bg-red-50 text-red-700"
          : "border-gray-100 bg-gray-50 text-gray-700"
      }`}
    >
      {String(value)}
    </pre>
  </div>
);

export default CodingAssessment;
