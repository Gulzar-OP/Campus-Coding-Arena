import { useEffect, useMemo, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Code2,
  FileCode2,
  Gauge,
  Loader2,
  MemoryStick,
  Sparkles,
  Target,
  Terminal,
  Trophy,
  XCircle,
} from "lucide-react";

import { motion } from "framer-motion";

import toast from "react-hot-toast";

import api from "../../services/api";

const TestResult = () => {
  const { testId } = useParams();

  const navigate = useNavigate();

  // ==========================================================
  // STATE
  // ==========================================================

  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ==========================================================
  // FETCH RESULT
  // ==========================================================

  useEffect(() => {
    const fetchResult = async () => {
      try {
        setLoading(true);

        setError("");

        const response = await api.get(`/student/results/${testId}`);

        setData({
          test: response.data?.test || null,

          submission: response.data?.submission || null,

          results: response.data?.results || [],
        });
      } catch (error) {
        console.error("GET TEST RESULT ERROR:", error);

        const message =
          error.response?.data?.message || "Failed to fetch result";

        setError(message);

        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    if (testId) {
      fetchResult();
    }
  }, [testId]);

  // ==========================================================
  // DATA
  // ==========================================================

  const test = data?.test;

  const submission = data?.submission;

  const results = data?.results || [];

  // ==========================================================
  // CALCULATIONS
  // ==========================================================

  const stats = useMemo(() => {
    const totalQuestions = Number(test?.totalProblems ?? results.length ?? 0);

    const attemptedQuestions = Number(
      submission?.attemptedProblems ??
        results.filter((item) => item.submitted).length,
    );

    const solvedQuestions = Number(
      submission?.solvedProblems ??
        results.filter((item) => item.verdict === "Accepted").length,
    );

    const failedQuestions = Number(
      submission?.failedProblems ??
        Math.max(attemptedQuestions - solvedQuestions, 0),
    );

    const notAttemptedQuestions = Number(
      submission?.notAttemptedProblems ??
        Math.max(totalQuestions - attemptedQuestions, 0),
    );

    const solveRate =
      totalQuestions > 0
        ? Math.round((solvedQuestions / totalQuestions) * 100)
        : 0;

    return {
      totalQuestions,
      attemptedQuestions,
      solvedQuestions,
      failedQuestions,
      notAttemptedQuestions,
      solveRate,
    };
  }, [test, submission, results]);

  // ==========================================================
  // HELPERS
  // ==========================================================

  const formatDateTime = (value) => {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",

      month: "short",

      year: "numeric",

      hour: "2-digit",

      minute: "2-digit",
    });
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="flex min-h-[520px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
            <Loader2 size={26} className="animate-spin text-indigo-600" />
          </div>

          <p className="mt-4 font-semibold text-gray-700">Loading result</p>

          <p className="mt-1 text-sm text-gray-400">
            Preparing your assessment report...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR / NOT FOUND
  // ==========================================================

  if (error || !test || !submission) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <AlertCircle size={26} />
          </div>

          <h2 className="mt-5 text-xl font-bold text-gray-900">
            Result not found
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            {error || "We couldn't find this assessment result."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/student/results")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <ArrowLeft size={16} />
            Back to Results
          </button>
        </div>
      </div>
    );
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.4,
      }}
      className="mx-auto w-full max-w-[1600px] pb-12"
    >
      {/* ================================================== */}
      {/* BACK */}
      {/* ================================================== */}

      <button
        type="button"
        onClick={() => navigate("/student/results")}
        className="mb-5 flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-indigo-600"
      >
        <ArrowLeft size={16} />
        Back to Results
      </button>

      {/* ================================================== */}
      {/* HERO */}
      {/* ================================================== */}

      <motion.section
        initial={{
          opacity: 0,
          y: 14,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.05,
        }}
        className="relative mb-6 overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-6 sm:p-8"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-indigo-400/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-violet-400/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
          {/* LEFT */}

          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600">
                <Sparkles size={16} />
                Assessment Result
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold capitalize text-emerald-600">
                <CheckCircle2 size={13} />

                {submission.status}
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl lg:text-4xl">
              {test.title || "Coding Assessment"}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
              {test.description ||
                "Review your question performance and submission details."}
            </p>
          </div>

          {/* SCORE */}

          <div className="w-full rounded-2xl bg-gray-950 p-5 text-white shadow-xl shadow-gray-200 sm:w-auto sm:min-w-[220px]">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Questions Solved
            </p>

            <div className="mt-2 flex items-end justify-between gap-6">
              <div>
                <span className="text-4xl font-bold">
                  {stats.solvedQuestions}
                </span>

                <span className="ml-1 text-sm text-gray-400">
                  / {stats.totalQuestions}
                </span>
              </div>

              <span className="text-xl font-bold text-indigo-300">
                {stats.solveRate}%
              </span>
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{
                  width: 0,
                }}
                animate={{
                  width: `${Math.min(stats.solveRate, 100)}%`,
                }}
                transition={{
                  delay: 0.2,
                  duration: 0.7,
                }}
                className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-400"
              />
            </div>
          </div>
        </div>
      </motion.section>

      {/* ================================================== */}
      {/* STAT CARDS */}
      {/* ================================================== */}

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Total Questions"
          value={stats.totalQuestions}
          icon={FileCode2}
          type="primary"
        />

        <StatCard
          title="Solved"
          value={stats.solvedQuestions}
          icon={CheckCircle2}
          type="success"
        />

        <StatCard
          title="Failed"
          value={stats.failedQuestions}
          icon={XCircle}
          type="danger"
        />

        <StatCard
          title="Not Attempted"
          value={stats.notAttemptedQuestions}
          icon={Target}
          type="violet"
        />
      </div>

      {/* ================================================== */}
      {/* SUMMARY + PERFORMANCE */}
      {/* ================================================== */}

      <div className="mb-7 grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        {/* SUMMARY */}

        <motion.section
          initial={{
            opacity: 0,
            y: 14,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.1,
          }}
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <FileCode2 size={21} />
            </div>

            <div>
              <h2 className="font-bold text-gray-900">Assessment Summary</h2>

              <p className="text-xs text-gray-500">
                Test and submission information
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <InfoCard
              icon={FileCode2}
              label="Questions"
              value={stats.totalQuestions}
            />

            <InfoCard
              icon={Clock3}
              label="Duration"
              value={`${test.duration || 0} min`}
            />

            <InfoCard
              icon={Target}
              label="Attempted"
              value={stats.attemptedQuestions}
            />

            <InfoCard
              icon={CalendarDays}
              label="Submitted At"
              value={formatDateTime(submission.submittedAt)}
            />
          </div>
        </motion.section>

        {/* PERFORMANCE */}

        <motion.section
          initial={{
            opacity: 0,
            y: 14,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.15,
          }}
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h2 className="font-bold text-gray-900">Performance</h2>

              <p className="mt-1 text-xs text-gray-500">
                Question completion overview
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <Trophy size={19} />
            </div>
          </div>

          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-gray-950">
              {stats.solveRate}%
            </span>

            <span className="pb-1 text-xs text-gray-400">solved</span>
          </div>

          <div className="mt-5 h-3 overflow-hidden rounded-full bg-gray-100">
            <motion.div
              initial={{
                width: 0,
              }}
              animate={{
                width: `${Math.min(stats.solveRate, 100)}%`,
              }}
              transition={{
                duration: 0.8,
                delay: 0.2,
              }}
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
            />
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <PerformanceMini
              label="Attempted"
              value={stats.attemptedQuestions}
            />

            <PerformanceMini label="Solved" value={stats.solvedQuestions} />

            <PerformanceMini label="Failed" value={stats.failedQuestions} />
          </div>
        </motion.section>
      </div>

      {/* ================================================== */}
      {/* QUESTION RESULTS */}
      {/* ================================================== */}

      <section>
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
              Question Results
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Detailed result for every coding question.
            </p>
          </div>

          <span className="w-fit rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600">
            {stats.solvedQuestions}/{stats.totalQuestions} solved
          </span>
        </div>

        {results.length > 0 ? (
          <div className="space-y-4">
            {results.map((item, index) => (
              <QuestionResult
                key={item.problem?._id || index}
                item={item}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <FileCode2 size={38} className="mx-auto text-gray-300" />

            <p className="mt-4 font-medium text-gray-600">
              No question results available
            </p>
          </div>
        )}
      </section>
    </motion.div>
  );
};

// ============================================================
// QUESTION RESULT
// ============================================================

const QuestionResult = ({ item, index }) => {
  const accepted = item.verdict === "Accepted";

  const attempted = Boolean(item.submitted);

  const testPercentage =
    item.totalTestCases > 0
      ? Math.round(((item.passedTestCases || 0) / item.totalTestCases) * 100)
      : 0;

  const status = !attempted
    ? "Not Attempted"
    : accepted
      ? "Accepted"
      : item.verdict || "Failed";

  const statusClass = !attempted
    ? "border-gray-200 bg-gray-100 text-gray-500"
    : accepted
      ? "border-emerald-100 bg-emerald-50 text-emerald-600"
      : "border-red-100 bg-red-50 text-red-600";

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 14,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: Math.min(index * 0.05, 0.25),
      }}
      className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      {/* HEADER */}

      <div className="flex flex-col justify-between gap-5 p-5 sm:flex-row sm:items-start sm:p-6">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600">
              {index + 1}
            </div>

            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Question {index + 1}
            </p>
          </div>

          <h3 className="text-lg font-bold text-gray-900 sm:text-xl">
            {item.problem?.title || "Untitled Question"}
          </h3>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {item.problem?.difficulty && (
              <span
                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${difficultyClass(
                  item.problem.difficulty,
                )}`}
              >
                {item.problem.difficulty}
              </span>
            )}

            {item.problem?.topic && (
              <span className="text-xs text-gray-400">
                {item.problem.topic}
              </span>
            )}
          </div>
        </div>

        {/* STATUS */}

        <div className="flex items-center justify-between gap-4 sm:block sm:text-right">
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${statusClass}`}
          >
            {accepted ? <CheckCircle2 size={15} /> : <XCircle size={15} />}

            {status}
          </span>

          <p className="mt-0 text-sm font-semibold text-gray-500 sm:mt-3">
            {attempted
              ? `${item.passedTestCases || 0}/${item.totalTestCases || 0} test cases`
              : "No submission"}
          </p>
        </div>
      </div>

      {/* SUBMISSION DATA */}

      {attempted ? (
        <div className="border-t border-gray-100 p-5 sm:p-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <SmallInfo
              icon={Code2}
              label="Language"
              value={item.language || "-"}
            />

            <SmallInfo
              icon={Terminal}
              label="Verdict"
              value={item.verdict || "-"}
            />

            <SmallInfo
              icon={CheckCircle2}
              label="Test Cases"
              value={`${item.passedTestCases ?? 0}/${item.totalTestCases ?? 0}`}
            />

            <SmallInfo
              icon={Clock3}
              label="Execution"
              value={
                item.executionTime !== null && item.executionTime !== undefined
                  ? `${item.executionTime} ms`
                  : "-"
              }
            />
          </div>

          {/* MEMORY */}

          {item.memory !== null && item.memory !== undefined && (
            <div className="mt-3">
              <SmallInfo
                icon={MemoryStick}
                label="Memory"
                value={item.memory}
              />
            </div>
          )}

          {/* TEST CASE PROGRESS */}

          {item.totalTestCases > 0 && (
            <div className="mt-5 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-gray-500">
                  Test Case Performance
                </p>

                <span className="text-xs font-bold text-gray-700">
                  {testPercentage}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <motion.div
                  initial={{
                    width: 0,
                  }}
                  animate={{
                    width: `${Math.min(testPercentage, 100)}%`,
                  }}
                  transition={{
                    duration: 0.6,
                  }}
                  className={`h-full rounded-full ${
                    accepted
                      ? "bg-emerald-500"
                      : "bg-gradient-to-r from-amber-400 to-orange-500"
                  }`}
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="border-t border-gray-100 p-5 sm:p-6">
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
            <XCircle size={18} className="shrink-0 text-gray-400" />

            <div>
              <p className="text-sm font-semibold text-gray-600">
                Not attempted
              </p>

              <p className="mt-1 text-xs text-gray-400">
                No code was submitted for this question.
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// ============================================================
// STAT CARD
// ============================================================

const StatCard = ({ title, value, icon: Icon, type = "primary" }) => {
  const styleMap = {
    primary: "bg-indigo-50 text-indigo-600",

    success: "bg-emerald-50 text-emerald-600",

    danger: "bg-red-50 text-red-500",

    violet: "bg-violet-50 text-violet-600",
  };

  return (
    <motion.div
      whileHover={{
        y: -3,
      }}
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500 sm:text-sm">
            {title}
          </p>

          <p className="mt-2 truncate text-2xl font-bold text-gray-950 sm:text-3xl">
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${
            styleMap[type] || styleMap.primary
          }`}
        >
          <Icon size={20} />
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================
// INFO CARD
// ============================================================

const InfoCard = ({ icon: Icon, label, value }) => (
  <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
      <Icon size={17} />
    </div>

    <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
      {label}
    </p>

    <p className="mt-1 break-words text-sm font-semibold text-gray-800">
      {value ?? "-"}
    </p>
  </div>
);

// ============================================================
// SMALL INFO
// ============================================================

const SmallInfo = ({ icon: Icon, label, value }) => (
  <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3 sm:p-4">
    <div className="flex items-center gap-2 text-gray-400">
      {Icon && <Icon size={14} />}

      <p className="text-[10px] font-medium uppercase tracking-wide">{label}</p>
    </div>

    <p className="mt-2 break-words text-sm font-semibold capitalize text-gray-700">
      {value ?? "-"}
    </p>
  </div>
);

// ============================================================
// PERFORMANCE MINI
// ============================================================

const PerformanceMini = ({ label, value }) => (
  <div className="rounded-xl bg-gray-50 p-3 text-center">
    <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
      {label}
    </p>

    <p className="mt-1 text-lg font-bold text-gray-800">{value}</p>
  </div>
);

// ============================================================
// DIFFICULTY
// ============================================================

const difficultyClass = (difficulty) => {
  if (difficulty === "Easy") {
    return "border-emerald-100 bg-emerald-50 text-emerald-600";
  }

  if (difficulty === "Medium") {
    return "border-amber-100 bg-amber-50 text-amber-600";
  }

  return "border-red-100 bg-red-50 text-red-600";
};

export default TestResult;
