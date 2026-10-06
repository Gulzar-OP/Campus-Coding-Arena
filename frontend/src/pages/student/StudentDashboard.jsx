import { useEffect, useMemo, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import {
  AlertCircle,
  ArrowRight,
  Bot,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileCode2,
  Loader2,
  Play,
  Sparkles,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";

import { motion } from "framer-motion";

import api from "../../services/api";

const StudentDashboard = () => {
  const navigate = useNavigate();

  // ==========================================================
  // STATE
  // ==========================================================

  const [data, setData] = useState({
    live: [],
    upcoming: [],
    completed: [],
    missed: [],
    summary: {},
  });

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ==========================================================
  // FETCH DASHBOARD
  // ==========================================================

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      setError("");

      const response = await api.get("/student/dashboard");

      const responseData = response.data || {};

      setData({
        live: responseData.live || [],

        upcoming: responseData.upcoming || [],

        completed: responseData.completed || [],

        missed: responseData.missed || [],

        summary: responseData.summary || {},
      });
    } catch (error) {
      console.error("STUDENT DASHBOARD ERROR:", error);

      setError(error.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // ==========================================================
  // SORT / LIMIT DASHBOARD DATA
  // ==========================================================

  const liveTests = useMemo(() => {
    return [...data.live].sort(
      (a, b) => new Date(a.endTime) - new Date(b.endTime),
    );
  }, [data.live]);

  const upcomingTests = useMemo(() => {
    return [...data.upcoming]
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
      .slice(0, 4);
  }, [data.upcoming]);

  const recentCompleted = useMemo(() => {
    return [...data.completed]
      .sort(
        (a, b) =>
          new Date(b.submittedAt || b.endTime || 0) -
          new Date(a.submittedAt || a.endTime || 0),
      )
      .slice(0, 4);
  }, [data.completed]);

  // ==========================================================
  // STATS
  // ==========================================================

  const stats = [
    {
      title: "Live Tests",

      value: data.summary?.liveTests ?? data.live.length,

      subtitle: "Available now",

      icon: Play,

      iconClass: "bg-emerald-50 text-emerald-600",
    },

    {
      title: "Upcoming",

      value: data.summary?.upcomingTests ?? data.upcoming.length,

      subtitle: "Scheduled tests",

      icon: CalendarDays,

      iconClass: "bg-indigo-50 text-indigo-600",
    },

    {
      title: "Completed",

      value: data.summary?.completedTests ?? data.completed.length,

      subtitle: "Submitted tests",

      icon: CheckCircle2,

      iconClass: "bg-violet-50 text-violet-600",
    },

    {
      title: "Missed",

      value: data.summary?.missedTests ?? data.missed.length,

      subtitle: "Ended without submit",

      icon: XCircle,

      iconClass: "bg-orange-50 text-orange-600",
    },
  ];

  // ==========================================================
  // HELPERS
  // ==========================================================

  const getTestId = (item) => {
    return item?.id || item?._id || item?.test?._id || item?.test?.id;
  };

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

  const getSolvedCount = (item) => {
    return Number(item?.solvedProblems ?? item?.solvedQuestions ?? 0);
  };

  const getAttemptedCount = (item) => {
    return Number(item?.attemptedProblems ?? item?.attemptedQuestions ?? 0);
  };

  const getTotalQuestions = (item) => {
    return Number(
      item?.totalProblems ??
        item?.totalQuestions ??
        item?.test?.problems?.length ??
        0,
    );
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

          <p className="mt-4 text-sm font-medium text-gray-500">
            Loading your dashboard...
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
          Student Workspace
        </div>

        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl lg:text-4xl">
              Student Dashboard
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
              Track assessments, continue active tests and review your recent
              results.
            </p>
          </div>

          <Link
            to="/student/results"
            className="flex w-fit items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600"
          >
            <Trophy size={17} />
            My Results
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* ================================================== */}
      {/* ERROR */}
      {/* ================================================== */}

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />

          <div>
            <p className="text-sm font-semibold text-red-700">
              Failed to load dashboard
            </p>

            <p className="mt-1 text-sm text-red-500">{error}</p>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* STATS */}
      {/* ================================================== */}

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {stats.map((item, index) => (
          <StatCard key={item.title} {...item} index={index} />
        ))}
      </div>

      {/* ================================================== */}
      {/* LIVE ASSESSMENTS */}
      {/* ================================================== */}

      <DashboardSection
        title="Live Assessments"
        subtitle="Tests currently available for you"
        count={data.live.length}
      >
        {liveTests.length === 0 ? (
          <EmptyState
            icon={Play}
            title="No live assessments"
            text="There are no assessments available right now."
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {liveTests.map((item, index) => (
              <AssessmentCard
                key={getTestId(item)}
                item={item}
                type="live"
                index={index}
                onAction={() => navigate(`/student/tests/${getTestId(item)}`)}
                formatDateTime={formatDateTime}
                getTotalQuestions={getTotalQuestions}
              />
            ))}
          </div>
        )}
      </DashboardSection>

      {/* ================================================== */}
      {/* UPCOMING */}
      {/* ================================================== */}

      <DashboardSection
        title="Upcoming Tests"
        subtitle="Assessments scheduled for later"
        count={data.upcoming.length}
        action={
          data.upcoming.length > 4 ? (
            <span className="text-xs font-medium text-gray-400">
              Showing next 4
            </span>
          ) : null
        }
      >
        {upcomingTests.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="Nothing scheduled"
            text="No upcoming assessments are scheduled."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {upcomingTests.map((item, index) => (
              <AssessmentCard
                key={getTestId(item)}
                item={item}
                type="upcoming"
                index={index}
                formatDateTime={formatDateTime}
                getTotalQuestions={getTotalQuestions}
              />
            ))}
          </div>
        )}
      </DashboardSection>

      {/* ================================================== */}
      {/* RECENT COMPLETED */}
      {/* ================================================== */}

      <section className="mb-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                Recent Results
              </h2>

              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
                {data.completed.length}
              </span>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Your latest completed assessments
            </p>
          </div>

          {data.completed.length > 0 && (
            <Link
              to="/student/results"
              className="hidden items-center gap-1 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700 sm:flex"
            >
              View all
              <ArrowRight size={16} />
            </Link>
          )}
        </div>

        {recentCompleted.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="No results yet"
            text="Your completed assessments will appear here."
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            {recentCompleted.map((item, index) => (
              <CompletedResultRow
                key={getTestId(item)}
                item={item}
                index={index}
                last={index === recentCompleted.length - 1}
                onClick={() => navigate(`/student/results/${getTestId(item)}`)}
                formatDateTime={formatDateTime}
                solved={getSolvedCount(item)}
                attempted={getAttemptedCount(item)}
                total={getTotalQuestions(item)}
              />
            ))}

            {data.completed.length > recentCompleted.length && (
              <Link
                to="/student/results"
                className="flex items-center justify-center gap-2 border-t border-gray-100 bg-gray-50/70 px-5 py-4 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
              >
                View all {data.completed.length} completed tests
                <ArrowRight size={16} />
              </Link>
            )}
          </div>
        )}
      </section>
    </motion.div>
  );
};

// ============================================================
// ASSESSMENT CARD
// ============================================================

const AssessmentCard = ({
  item,
  type,
  onAction,
  index,
  formatDateTime,
  getTotalQuestions,
}) => {
  const test = item.test || item;

  const totalQuestions = getTotalQuestions(item);

  const typeStyles = {
    live: {
      badge: "border-emerald-100 bg-emerald-50 text-emerald-600",

      icon: "bg-emerald-50 text-emerald-600",

      label: "Live",
    },

    upcoming: {
      badge: "border-indigo-100 bg-indigo-50 text-indigo-600",

      icon: "bg-indigo-50 text-indigo-600",

      label: "Upcoming",
    },
  };

  const style = typeStyles[type] || typeStyles.upcoming;

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
        delay: Math.min(index * 0.04, 0.2),
      }}
      whileHover={{
        y: -3,
      }}
      className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-lg hover:shadow-gray-200/60 sm:p-6"
    >
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-indigo-500/[0.04] blur-3xl transition group-hover:bg-indigo-500/[0.08]" />

      <div className="relative">
        {/* Header */}

        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <span
              className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${style.badge}`}
            >
              {style.label}
            </span>

            <h3 className="mt-3 line-clamp-1 text-lg font-bold text-gray-900 sm:text-xl">
              {test.title}
            </h3>

            <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-gray-500">
              {test.description || "Coding assessment"}
            </p>
          </div>

          <div
            className={`hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl sm:flex ${style.icon}`}
          >
            <FileCode2 size={20} />
          </div>
        </div>

        {/* Information */}

        <div className="mt-5 grid grid-cols-2 gap-3">
          <MiniInfo icon={FileCode2} label="Questions" text={totalQuestions} />

          <MiniInfo
            icon={Clock3}
            label="Duration"
            text={`${test.duration || 0} min`}
          />

          <MiniInfo
            icon={CalendarDays}
            label={type === "live" ? "Ends" : "Starts"}
            text={formatDateTime(
              type === "live" ? test.endTime : test.startTime,
            )}
            wide
          />

          <MiniInfo
            icon={Bot}
            label="AI Hints"
            text={`${item.aiPromptsUsed ?? 0} / ${test.maxAIPrompts ?? 0}`}
          />
        </div>

        {/* Action */}

        {type === "live" && (
          <motion.button
            type="button"
            whileTap={{
              scale: 0.98,
            }}
            onClick={onAction}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:shadow-indigo-500/30"
          >
            <Play size={17} />

            {item.attemptStatus === "in_progress"
              ? "Continue Test"
              : "View Test"}

            <ArrowRight size={16} />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

// ============================================================
// COMPLETED RESULT ROW
// ============================================================

const CompletedResultRow = ({
  item,
  index,
  last,
  onClick,
  formatDateTime,
  solved,
  attempted,
  total,
}) => {
  const test = item.test || item;

  const solvePercentage = total > 0 ? Math.round((solved / total) * 100) : 0;

  return (
    <motion.button
      type="button"
      initial={{
        opacity: 0,
        y: 8,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: index * 0.04,
      }}
      onClick={onClick}
      className={`group flex w-full flex-col gap-4 px-5 py-4 text-left transition hover:bg-indigo-50/40 sm:flex-row sm:items-center sm:justify-between ${
        !last ? "border-b border-gray-100" : ""
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
          <Trophy size={19} />
        </div>

        <div className="min-w-0">
          <h3 className="truncate font-semibold text-gray-900">{test.title}</h3>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
            <span>{formatDateTime(item.submittedAt)}</span>

            <span className="hidden sm:inline">•</span>

            <span>{test.duration || 0} min</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 sm:justify-end">
        {/* Solved */}

        <div className="min-w-[90px]">
          <p className="text-xs text-gray-400">Solved</p>

          <p className="mt-0.5 font-semibold text-gray-900">
            {solved} / {total}
          </p>
        </div>

        {/* Attempted */}

        <div className="hidden min-w-[80px] md:block">
          <p className="text-xs text-gray-400">Attempted</p>

          <p className="mt-0.5 font-semibold text-gray-700">{attempted}</p>
        </div>

        {/* Progress */}

        <div className="hidden w-24 lg:block">
          <div className="mb-1 flex justify-between text-[10px] text-gray-400">
            <span>Progress</span>

            <span>{solvePercentage}%</span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-indigo-500"
              style={{
                width: `${Math.min(solvePercentage, 100)}%`,
              }}
            />
          </div>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition group-hover:bg-white group-hover:text-indigo-600">
          <ArrowRight size={17} />
        </div>
      </div>
    </motion.button>
  );
};

// ============================================================
// STAT CARD
// ============================================================

const StatCard = ({ title, value, subtitle, icon: Icon, iconClass, index }) => {
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
        delay: index * 0.05,
      }}
      whileHover={{
        y: -3,
      }}
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-gray-500 sm:text-sm">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
            {value}
          </p>

          <p className="mt-1 hidden text-xs text-gray-400 sm:block">
            {subtitle}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${iconClass}`}
        >
          <Icon size={20} />
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================
// MINI INFO
// ============================================================

const MiniInfo = ({ icon: Icon, label, text, wide = false }) => (
  <div
    className={`rounded-xl bg-gray-50 p-3 ${
      wide ? "col-span-2 sm:col-span-1" : ""
    }`}
  >
    <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
      <Icon size={12} />

      {label}
    </div>

    <p className="mt-1.5 line-clamp-2 break-words text-sm font-semibold text-gray-700">
      {text}
    </p>
  </div>
);

// ============================================================
// SECTION
// ============================================================

const DashboardSection = ({ title, subtitle, count, action, children }) => (
  <section className="mb-9">
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
            {title}
          </h2>

          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">
            {count}
          </span>
        </div>

        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
      </div>

      {action}
    </div>

    {children}
  </section>
);

// ============================================================
// EMPTY STATE
// ============================================================

const EmptyState = ({ title, text, icon: Icon }) => (
  <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-9 text-center">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
      <Icon size={22} />
    </div>

    <h3 className="mt-4 text-sm font-semibold text-gray-700">{title}</h3>

    <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-gray-400">
      {text}
    </p>
  </div>
);

export default StudentDashboard;
