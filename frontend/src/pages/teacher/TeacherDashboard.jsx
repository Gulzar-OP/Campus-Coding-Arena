import {
  FileCode2,
  ClipboardList,
  Users,
  CheckCircle2,
  Plus,
  ArrowRight,
  Clock3,
  BarChart3,
  Trophy,
  CalendarDays,
  Sparkles,
  Loader2,
} from "lucide-react";

import { motion } from "framer-motion";

import { Link } from "react-router-dom";

import { useEffect, useMemo, useState } from "react";

import axios from "../../services/api";

const TeacherDashboard = () => {
  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ==========================================================
  // LOAD DASHBOARD
  // ==========================================================

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);

        setError("");

        const { data } = await axios.get("/teacher/dashboard");

        setDashboard(data);
      } catch (error) {
        console.error("DASHBOARD ERROR:", error);

        setError(error.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  // ==========================================================
  // DATA
  // ==========================================================

  const summary = dashboard?.summary || {};

  const recentTests = dashboard?.recentTests || [];

  const upcomingAssessment = dashboard?.upcomingAssessment || null;

  const performance = dashboard?.performance || {};

  // ==========================================================
  // CARDS
  // ==========================================================

  const cards = useMemo(
    () => [
      {
        title: "Total Problems",

        value: summary.totalProblems ?? 0,

        icon: FileCode2,

        subtitle: "Coding questions",
      },

      {
        title: "Total Tests",

        value: summary.totalTests ?? 0,

        icon: ClipboardList,

        subtitle: "Assessments created",
      },

      {
        title: "Students",

        value: summary.totalStudents ?? 0,

        icon: Users,

        subtitle: "Active students",
      },

      {
        title: "Submissions",

        value: summary.totalSubmissions ?? 0,

        icon: CheckCircle2,

        subtitle: "Completed tests",
      },
    ],
    [summary],
  );

  // ==========================================================
  // ANIMATION
  // ==========================================================

  const containerVariants = {
    hidden: {
      opacity: 0,
    },

    visible: {
      opacity: 1,

      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,

      y: 20,
    },

    visible: {
      opacity: 1,

      y: 0,

      transition: {
        duration: 0.45,

        ease: "easeOut",
      },
    },
  };

  // ==========================================================
  // HELPERS
  // ==========================================================

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }

    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",

      month: "short",

      year: "numeric",
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "live":
        return "bg-emerald-50 text-emerald-600";

      case "published":
      case "upcoming":
        return "bg-indigo-50 text-indigo-600";

      case "ended":
        return "bg-gray-100 text-gray-600";

      case "draft":
        return "bg-amber-50 text-amber-600";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={30} className="animate-spin text-indigo-600" />

          <p className="text-sm text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
        <p className="font-semibold text-red-600">Failed to load dashboard</p>

        <p className="mt-1 text-sm text-red-500">{error}</p>
      </div>
    );
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mx-auto w-full max-w-[1600px]"
    >
      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <motion.div
        variants={itemVariants}
        className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-center"
      >
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-indigo-600">
            <Sparkles size={16} />
            Teacher Workspace
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl lg:text-4xl">
            Teacher Dashboard
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
            Manage coding assessments, track submissions and monitor student
            performance.
          </p>
        </div>

        <Link
          to="/teacher/tests/create"
          className="
            flex w-fit
            items-center gap-2
            rounded-xl
            bg-gradient-to-r
            from-indigo-600
            to-violet-600
            px-5 py-3
            text-sm font-semibold
            text-white
            shadow-lg
            shadow-indigo-500/20
            transition
            hover:shadow-indigo-500/30
          "
        >
          <Plus size={18} />
          Create Test
        </Link>
      </motion.div>

      {/* ================================================== */}
      {/* STAT CARDS */}
      {/* ================================================== */}

      <motion.div
        variants={containerVariants}
        className="
          grid grid-cols-1 gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <motion.div
              key={card.title}
              variants={itemVariants}
              whileHover={{
                y: -4,
              }}
              className="
                  group relative
                  overflow-hidden
                  rounded-2xl
                  border
                  border-gray-200/80
                  bg-white p-5
                  shadow-sm
                  transition-shadow
                  duration-300
                  hover:shadow-lg
                  hover:shadow-gray-200/60
                  sm:p-6
                "
            >
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-indigo-500/5 blur-2xl transition group-hover:bg-indigo-500/10" />

              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {card.title}
                  </p>

                  <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-950">
                    {card.value}
                  </h2>

                  <p className="mt-1 text-xs text-gray-400">{card.subtitle}</p>
                </div>

                <motion.div
                  whileHover={{
                    rotate: 8,

                    scale: 1.05,
                  }}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"
                >
                  <Icon size={22} />
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ================================================== */}
      {/* MAIN GRID */}
      {/* ================================================== */}

      <div className="mt-7 grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
        {/* ================================================= */}
        {/* RECENT TESTS */}
        {/* ================================================= */}

        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
                Recent Tests
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Recently created coding assessments
              </p>
            </div>

            <Link
              to="/teacher/tests"
              className="flex shrink-0 items-center gap-1 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
            >
              View all
              <ArrowRight size={16} />
            </Link>
          </div>

          {recentTests.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 text-center">
              <ClipboardList size={30} className="text-gray-300" />

              <p className="mt-3 font-medium text-gray-700">No tests yet</p>

              <p className="mt-1 text-sm text-gray-400">
                Create your first assessment.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTests.map((test, index) => (
                <motion.div
                  key={test._id}
                  initial={{
                    opacity: 0,

                    x: -15,
                  }}
                  animate={{
                    opacity: 1,

                    x: 0,
                  }}
                  transition={{
                    delay: 0.3 + index * 0.1,
                  }}
                  whileHover={{
                    x: 3,
                  }}
                  className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 transition hover:border-indigo-100 hover:bg-indigo-50/40"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {test.title}
                        </h3>

                        <span
                          className={`
                              rounded-full
                              px-2.5 py-1
                              text-[11px]
                              font-semibold
                              ${getStatusStyle(
                                test.runtimeStatus || test.status,
                              )}
                            `}
                        >
                          {(test.runtimeStatus || test.status)
                            ?.charAt(0)
                            .toUpperCase() +
                            (test.runtimeStatus || test.status)?.slice(1)}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <FileCode2 size={14} />
                          {test.problems} Problems
                        </span>

                        <span className="flex items-center gap-1.5">
                          <Clock3 size={14} />
                          {test.duration} mins
                        </span>

                        <span className="flex items-center gap-1.5">
                          <Users size={14} />
                          {test.participants} Participants
                        </span>

                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 size={14} />
                          {test.submitted} Submitted
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/teacher/tests/${test._id}`}
                      className="flex w-fit items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition hover:border-indigo-200 hover:text-indigo-600"
                    >
                      Manage
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ================================================= */}
        {/* QUICK ACTIONS */}
        {/* ================================================= */}

        <motion.div
          variants={itemVariants}
          className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-gray-500">Common teacher actions</p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <Link to="/teacher/problems/create">
              <motion.div
                whileHover={{
                  y: -3,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                className="group h-full rounded-xl border border-gray-200 p-5 transition hover:border-indigo-300 hover:bg-indigo-50/60"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-100">
                  <FileCode2 size={21} />
                </div>

                <p className="font-semibold text-gray-900">Add Problem</p>

                <p className="mt-1 text-sm leading-5 text-gray-500">
                  Create a new coding problem
                </p>
              </motion.div>
            </Link>

            <Link to="/teacher/tests/create">
              <motion.div
                whileHover={{
                  y: -3,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                className="group h-full rounded-xl border border-gray-200 p-5 transition hover:border-violet-300 hover:bg-violet-50/60"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600 transition group-hover:bg-violet-100">
                  <ClipboardList size={21} />
                </div>

                <p className="font-semibold text-gray-900">Create Test</p>

                <p className="mt-1 text-sm leading-5 text-gray-500">
                  Build a coding assessment
                </p>
              </motion.div>
            </Link>

            <Link to="/teacher/results">
              <motion.div
                whileHover={{
                  y: -3,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                className="group h-full rounded-xl border border-gray-200 p-5 transition hover:border-emerald-300 hover:bg-emerald-50/60"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <BarChart3 size={21} />
                </div>

                <p className="font-semibold text-gray-900">View Results</p>

                <p className="mt-1 text-sm leading-5 text-gray-500">
                  Analyze test performance
                </p>
              </motion.div>
            </Link>

            <Link to="/teacher/students">
              <motion.div
                whileHover={{
                  y: -3,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                className="group h-full rounded-xl border border-gray-200 p-5 transition hover:border-orange-300 hover:bg-orange-50/60"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                  <Users size={21} />
                </div>

                <p className="font-semibold text-gray-900">Students</p>

                <p className="mt-1 text-sm leading-5 text-gray-500">
                  View participants and progress
                </p>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* ================================================== */}
      {/* BOTTOM */}
      {/* ================================================== */}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* ================================================= */}
        {/* UPCOMING ASSESSMENT */}
        {/* ================================================= */}

        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-6"
        >
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-300/20 blur-3xl" />

          <div className="relative">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-indigo-600">
                  Upcoming Assessment
                </p>

                <h2 className="mt-1 text-xl font-bold text-gray-900">
                  {upcomingAssessment
                    ? upcomingAssessment.title
                    : "No upcoming assessment"}
                </h2>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                <CalendarDays size={21} />
              </div>
            </div>

            {upcomingAssessment ? (
              <>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <span>{upcomingAssessment.problems} Problems</span>

                  <span>•</span>

                  <span>{upcomingAssessment.duration} Minutes</span>

                  <span>•</span>

                  <span>{formatDate(upcomingAssessment.startTime)}</span>
                </div>

                <Link
                  to={`/teacher/tests/${upcomingAssessment._id}`}
                  className="mt-6 flex w-fit items-center gap-2 text-sm font-semibold text-indigo-600"
                >
                  View Assessment
                  <ArrowRight size={16} />
                </Link>
              </>
            ) : (
              <p className="mt-3 text-sm text-gray-500">
                No published test is scheduled for the future.
              </p>
            )}
          </div>
        </motion.div>

        {/* ================================================= */}
        {/* PERFORMANCE */}
        {/* ================================================= */}

        <motion.div
          variants={itemVariants}
          className="rounded-2xl bg-[#0d1424] p-6 text-white shadow-lg"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-400">Overall Performance</p>

              <h2 className="mt-1 text-xl font-bold">Student Progress</h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-yellow-400">
              <Trophy size={21} />
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-gray-400">Solve Rate</span>

              <span className="font-semibold">
                {performance.solveRate ?? 0}%
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div
                initial={{
                  width: 0,
                }}
                animate={{
                  width: `${Math.min(performance.solveRate || 0, 100)}%`,
                }}
                transition={{
                  delay: 0.8,

                  duration: 0.8,
                }}
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
              />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/[0.05] p-4">
              <p className="text-xs text-gray-500">Solved Questions</p>

              <p className="mt-1 text-xl font-bold">
                {performance.solvedQuestions ?? 0}
              </p>
            </div>

            <div className="rounded-xl bg-white/[0.05] p-4">
              <p className="text-xs text-gray-500">Avg. Solved / Test</p>

              <p className="mt-1 text-xl font-bold">
                {performance.averageSolvedPerTest ?? 0}
              </p>
            </div>
          </div>

          <div className="mt-3 text-xs text-gray-500">
            {performance.attemptedQuestions ?? 0} questions attempted across{" "}
            {performance.submittedTests ?? 0} submitted tests
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TeacherDashboard;
