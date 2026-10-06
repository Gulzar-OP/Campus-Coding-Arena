import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Loader2,
  Search,
  Sparkles,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";

import { motion } from "framer-motion";

import api from "../../services/api";

const MyResults = () => {
  const navigate = useNavigate();

  // ==========================================================
  // STATE
  // ==========================================================

  const [results, setResults] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  // ==========================================================
  // FETCH RESULTS
  // ==========================================================

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);

        setError("");

        const response = await api.get("/student/results");

        setResults(response.data?.results || []);
      } catch (error) {
        console.error("RESULTS FETCH ERROR:", error);

        setError(error.response?.data?.message || "Failed to load results");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  // ==========================================================
  // FILTERED RESULTS
  // ==========================================================

  const filteredResults = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return results;
    }

    return results.filter(
      (item) =>
        item.test?.title?.toLowerCase().includes(query) ||
        item.test?.description?.toLowerCase().includes(query),
    );
  }, [results, search]);

  // ==========================================================
  // OVERALL STATS
  // ==========================================================

  const overallStats = useMemo(() => {
    const totalTests = results.length;

    const totalQuestions = results.reduce(
      (total, item) => total + Number(item.totalProblems || 0),
      0,
    );

    const attemptedQuestions = results.reduce(
      (total, item) => total + Number(item.attemptedProblems || 0),
      0,
    );

    const solvedQuestions = results.reduce(
      (total, item) => total + Number(item.solvedProblems || 0),
      0,
    );

    const solveRate =
      totalQuestions > 0
        ? Math.round((solvedQuestions / totalQuestions) * 100)
        : 0;

    return {
      totalTests,
      totalQuestions,
      attemptedQuestions,
      solvedQuestions,
      solveRate,
    };
  }, [results]);

  // ==========================================================
  // FORMAT DATE
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

          <p className="mt-4 font-semibold text-gray-700">Loading results</p>

          <p className="mt-1 text-sm text-gray-400">
            Fetching your assessment history...
          </p>
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
      {/* HEADER */}
      {/* ================================================== */}

      <div className="mb-7">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-indigo-600">
          <Sparkles size={16} />
          Performance Center
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl lg:text-4xl">
          My Results
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
          Review your completed coding assessments and track how many questions
          you solved.
        </p>
      </div>

      {/* ================================================== */}
      {/* ERROR */}
      {/* ================================================== */}

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />

          <div>
            <p className="text-sm font-semibold text-red-700">
              Failed to load results
            </p>

            <p className="mt-1 text-sm text-red-500">{error}</p>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* SUMMARY */}
      {/* ================================================== */}

      <div className="mb-7 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <SummaryCard
          icon={FileCheck2}
          title="Completed Tests"
          value={overallStats.totalTests}
          subtitle="Final submissions"
          iconClass="bg-indigo-50 text-indigo-600"
          index={0}
        />

        <SummaryCard
          icon={Target}
          title="Total Questions"
          value={overallStats.totalQuestions}
          subtitle="Across all tests"
          iconClass="bg-violet-50 text-violet-600"
          index={1}
        />

        <SummaryCard
          icon={CheckCircle2}
          title="Solved"
          value={overallStats.solvedQuestions}
          subtitle="Accepted questions"
          iconClass="bg-emerald-50 text-emerald-600"
          index={2}
        />

        <SummaryCard
          icon={Trophy}
          title="Solve Rate"
          value={`${overallStats.solveRate}%`}
          subtitle="Overall performance"
          iconClass="bg-amber-50 text-amber-600"
          index={3}
        />
      </div>

      {/* ================================================== */}
      {/* SEARCH */}
      {/* ================================================== */}

      {results.length > 0 && (
        <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search completed tests..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50/70 py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-gray-400 hover:border-gray-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          <div className="mt-3 flex items-center justify-between px-1 text-xs text-gray-400">
            <span>
              {filteredResults.length} result
              {filteredResults.length !== 1 ? "s" : ""}
            </span>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="font-medium text-indigo-600"
              >
                Clear search
              </button>
            )}
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* EMPTY */}
      {/* ================================================== */}

      {results.length === 0 ? (
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.98,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center shadow-sm"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Trophy size={28} />
          </div>

          <h2 className="mt-5 text-lg font-bold text-gray-900">
            No results yet
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
            Once you submit an assessment, your result and question performance
            will appear here.
          </p>
        </motion.div>
      ) : filteredResults.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <Search size={30} className="mx-auto text-gray-300" />

          <h3 className="mt-3 font-semibold text-gray-700">
            No matching tests
          </h3>

          <p className="mt-1 text-sm text-gray-400">Try another search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {filteredResults.map((item, index) => {
            const test = item.test;

            const total = Number(item.totalProblems || 0);

            const attempted = Number(item.attemptedProblems || 0);

            const solved = Number(item.solvedProblems || 0);

            const unsolved = Number(
              item.unsolvedProblems ?? Math.max(total - solved, 0),
            );

            const failed = Math.max(attempted - solved, 0);

            const notAttempted = Math.max(total - attempted, 0);

            const percentage =
              total > 0 ? Math.round((solved / total) * 100) : 0;

            const resultId = test?._id || test?.id;

            return (
              <motion.article
                key={item.submissionId || `${resultId}-${index}`}
                initial={{
                  opacity: 0,

                  y: 18,
                }}
                animate={{
                  opacity: 1,

                  y: 0,
                }}
                transition={{
                  delay: Math.min(index * 0.04, 0.25),

                  duration: 0.35,
                }}
                whileHover={{
                  y: -4,
                }}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-xl hover:shadow-gray-200/60 sm:p-6"
              >
                {/* Decoration */}

                <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-indigo-500/[0.05] blur-3xl transition group-hover:bg-indigo-500/[0.1]" />

                <div className="relative">
                  {/* HEADER */}

                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-600">
                        <CheckCircle2 size={12} />
                        Submitted
                      </span>

                      <h2 className="mt-3 line-clamp-1 text-lg font-bold text-gray-900 sm:text-xl">
                        {test?.title || "Coding Assessment"}
                      </h2>

                      <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-gray-500">
                        {test?.description || "Completed coding assessment"}
                      </p>
                    </div>

                    <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 sm:flex">
                      <Trophy size={20} />
                    </div>
                  </div>

                  {/* MAIN RESULT */}

                  <div className="mt-5 rounded-2xl bg-gradient-to-br from-gray-950 to-slate-800 p-5 text-white">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                          Questions Solved
                        </p>

                        <div className="mt-1 flex items-end gap-1">
                          <span className="text-3xl font-bold">{solved}</span>

                          <span className="pb-1 text-sm text-gray-400">
                            / {total}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-gray-400">Solve Rate</p>

                        <p className="mt-1 text-2xl font-bold">{percentage}%</p>
                      </div>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        initial={{
                          width: 0,
                        }}
                        animate={{
                          width: `${Math.min(percentage, 100)}%`,
                        }}
                        transition={{
                          delay: 0.15 + index * 0.04,

                          duration: 0.6,
                        }}
                        className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-400"
                      />
                    </div>
                  </div>

                  {/* QUESTION STATS */}

                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <MiniStat
                      icon={CheckCircle2}
                      label="Solved"
                      value={solved}
                      type="success"
                    />

                    <MiniStat
                      icon={Target}
                      label="Attempted"
                      value={attempted}
                      type="primary"
                    />

                    <MiniStat
                      icon={XCircle}
                      label="Failed"
                      value={failed}
                      type="danger"
                    />

                    <MiniStat
                      icon={FileCheck2}
                      label="Not Tried"
                      value={notAttempted}
                    />
                  </div>

                  {/* DETAILS */}

                  <div className="mt-4 flex flex-col gap-2 rounded-xl border border-gray-100 bg-gray-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <CalendarDays size={14} />
                      Submitted {formatDateTime(item.submittedAt)}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock3 size={14} />
                      {test?.duration || 0} min
                    </div>
                  </div>

                  {/* UNSOLVED */}

                  {unsolved > 0 && (
                    <div className="mt-3 text-xs text-gray-400">
                      {unsolved} question
                      {unsolved !== 1 ? "s" : ""} not solved
                    </div>
                  )}

                  {/* ACTION */}

                  <motion.button
                    type="button"
                    whileTap={{
                      scale: 0.98,
                    }}
                    disabled={!resultId}
                    onClick={() => navigate(`/student/results/${resultId}`)}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-white py-3 text-sm font-semibold text-indigo-600 transition hover:border-indigo-300 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    View Detailed Result
                    <ArrowRight
                      size={16}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </motion.button>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

// ============================================================
// SUMMARY CARD
// ============================================================

const SummaryCard = ({
  icon: Icon,
  title,
  value,
  subtitle,
  iconClass,
  index,
}) => (
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
      delay: index * 0.05,
    }}
    whileHover={{
      y: -3,
    }}
    className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-medium text-gray-500 sm:text-sm">{title}</p>

        <p className="mt-2 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
          {value}
        </p>

        <p className="mt-1 hidden text-xs text-gray-400 sm:block">{subtitle}</p>
      </div>

      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${iconClass}`}
      >
        <Icon size={20} />
      </div>
    </div>
  </motion.div>
);

// ============================================================
// MINI STAT
// ============================================================

const MiniStat = ({ icon: Icon, label, value, type = "default" }) => {
  const styles = {
    success: "bg-emerald-50 text-emerald-600",

    danger: "bg-red-50 text-red-500",

    primary: "bg-indigo-50 text-indigo-600",

    default: "bg-gray-100 text-gray-500",
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3">
      <div className="flex items-center gap-2">
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-lg ${
            styles[type] || styles.default
          }`}
        >
          <Icon size={14} />
        </div>

        <span className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
          {label}
        </span>
      </div>

      <p className="mt-2 text-lg font-bold text-gray-800">{value}</p>
    </div>
  );
};

export default MyResults;
