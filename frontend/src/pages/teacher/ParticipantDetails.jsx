import { useEffect, useMemo, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import {
  Activity,
  ArrowLeft,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  Code2,
  Copy,
  FileCode2,
  GraduationCap,
  Loader2,
  Mail,
  MemoryStick,
  Sparkles,
  Target,
  Terminal,
  User,
  XCircle,
} from "lucide-react";

import { AnimatePresence, motion } from "framer-motion";

import toast from "react-hot-toast";

import api from "../../services/api";

const ParticipantDetails = () => {
  const { testId, studentId } = useParams();

  const navigate = useNavigate();

  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      if (!testId || !studentId) {
        setError("Invalid participant URL");

        setLoading(false);

        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/tests/${testId}/participants/${studentId}`,
        );

        setData(response.data || null);
      } catch (error) {
        console.error(
          "PARTICIPANT DETAILS ERROR:",
          error.response?.data || error,
        );

        const message =
          error.response?.data?.message ||
          "Failed to fetch participant details";

        setError(message);

        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [testId, studentId]);

  const test = data?.test || null;

  const attempt = data?.attempt || data?.participant || null;

  const problems = attempt?.problems || attempt?.problemResults || [];

  const stats = useMemo(() => {
    const total = Number(
      attempt?.totalProblems ??
        test?.totalProblems ??
        test?.problems?.length ??
        problems.length ??
        0,
    );

    const attempted = Number(
      attempt?.attemptedProblems ??
        problems.filter(
          (item) =>
            Boolean(item.submission) ||
            ["attempted", "passed", "failed"].includes(item.status),
        ).length,
    );

    const solved = Number(
      attempt?.solvedProblems ??
        problems.filter(
          (item) =>
            item.status === "passed" || item.submission?.verdict === "Accepted",
        ).length,
    );

    const failed = Number(
      attempt?.failedProblems ?? Math.max(attempted - solved, 0),
    );

    const notAttempted = Math.max(total - attempted, 0);

    const solveRate = total > 0 ? Math.round((solved / total) * 100) : 0;

    return {
      total,
      attempted,
      solved,
      failed,
      notAttempted,
      solveRate,
    };
  }, [attempt, test, problems]);

  const formatDate = (value) => {
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

  if (loading) {
    return (
      <div className="flex min-h-[520px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
            <Loader2 size={25} className="animate-spin text-indigo-600" />
          </div>

          <p className="mt-4 font-semibold text-gray-700">
            Loading participant
          </p>

          <p className="mt-1 text-sm text-gray-400">
            Preparing assessment details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !test || !attempt) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <User size={25} />
          </div>

          <h2 className="mt-5 text-xl font-bold text-gray-900">
            Participant details not found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {error || "Unable to load this participant."}
          </p>

          <button
            type="button"
            onClick={() => navigate(`/teacher/tests/${testId}`)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <ArrowLeft size={16} />
            Back to Test
          </button>
        </div>
      </div>
    );
  }

  const student = attempt.student || data.student || {};

  const status = attempt.status || "unknown";

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
        duration: 0.4,
      }}
      className="mx-auto w-full max-w-[1600px] pb-12"
    >
      <button
        type="button"
        onClick={() => navigate(`/teacher/tests/${testId}`)}
        className="mb-5 flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-indigo-600"
      >
        <ArrowLeft size={16} />
        Back to Test
      </button>

      <motion.section
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="relative mb-6 overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-6 sm:p-8"
      >
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600">
                <Sparkles size={16} />
                Student Performance
              </div>

              <StatusBadge status={status} />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl lg:text-4xl">
              {student.name || "Student Attempt"}
            </h1>

            <p className="mt-2 text-sm text-gray-500">{test.title}</p>

            {student.email && (
              <p className="mt-1 text-sm text-gray-400">{student.email}</p>
            )}
          </div>

          <div className="w-full rounded-2xl bg-gray-950 p-5 text-white shadow-xl shadow-gray-200 sm:w-auto sm:min-w-[240px]">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Questions Solved
            </p>

            <div className="mt-2 flex items-end justify-between gap-5">
              <div>
                <span className="text-4xl font-bold">{stats.solved}</span>

                <span className="ml-1 text-sm text-gray-400">
                  / {stats.total}
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
                  width: `${stats.solveRate}%`,
                }}
                transition={{
                  duration: 0.8,
                  delay: 0.2,
                }}
                className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-400"
              />
            </div>
          </div>
        </div>
      </motion.section>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Total Questions"
          value={stats.total}
          icon={FileCode2}
        />

        <StatCard title="Attempted" value={stats.attempted} icon={Target} />

        <StatCard
          title="Solved"
          value={stats.solved}
          icon={CheckCircle2}
          tone="success"
        />

        <StatCard
          title="AI Used"
          value={`${attempt.aiPromptsUsed ?? 0}/${test.maxAIPrompts ?? 0}`}
          icon={Bot}
          tone="violet"
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <InfoSection
          icon={User}
          title="Student Information"
          subtitle="Participant profile"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoCard icon={User} label="Name" value={student.name} />

            <InfoCard icon={Mail} label="Email" value={student.email} />

            <InfoCard
              icon={GraduationCap}
              label="Branch"
              value={student.branch}
            />

            <InfoCard
              icon={GraduationCap}
              label="Year"
              value={student.year ? `${student.year} Year` : "-"}
            />
          </div>
        </InfoSection>

        <InfoSection
          icon={FileCode2}
          title="Assessment Information"
          subtitle="Test session details"
          tone="violet"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoCard icon={FileCode2} label="Test" value={test.title} />

            <InfoCard
              icon={Clock3}
              label="Duration"
              value={`${test.duration || 0} minutes`}
            />

            <InfoCard
              icon={Clock3}
              label="Started At"
              value={formatDate(attempt.startedAt)}
            />

            <InfoCard
              icon={CheckCircle2}
              label="Submitted At"
              value={formatDate(attempt.submittedAt)}
            />
          </div>
        </InfoSection>
      </div>

      <InfoSection
        icon={Activity}
        title="Performance Overview"
        subtitle="Final question-wise summary"
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MiniPerformance label="Solved" value={stats.solved} type="success" />

          <MiniPerformance label="Failed" value={stats.failed} type="danger" />

          <MiniPerformance label="Not Tried" value={stats.notAttempted} />

          <MiniPerformance
            label="Solve Rate"
            value={`${stats.solveRate}%`}
            type="primary"
          />
        </div>
      </InfoSection>

      <section className="mt-7">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Question Results
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Submission and code details for every question.
            </p>
          </div>

          <span className="w-fit rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600">
            {stats.solved}/{stats.total} solved
          </span>
        </div>

        {problems.length > 0 ? (
          <div className="space-y-4">
            {problems.map((item, index) => (
              <ProblemCard
                key={item.problem?._id || `${index}`}
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

      {attempt.aiHistory?.length > 0 && (
        <InfoSection
          icon={Bot}
          title="AI Prompt History"
          subtitle="AI assistance used during the assessment"
          className="mt-7"
          tone="violet"
          badge={`${attempt.aiHistory.length} prompts`}
        >
          <div className="space-y-4">
            {attempt.aiHistory.map((item, index) => (
              <motion.div
                key={item._id || index}
                initial={{
                  opacity: 0,

                  y: 10,
                }}
                animate={{
                  opacity: 1,

                  y: 0,
                }}
                transition={{
                  delay: Math.min(index * 0.04, 0.2),
                }}
                className="rounded-2xl border border-gray-200 bg-gray-50/50 p-5"
              >
                <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                  <span className="text-sm font-bold text-indigo-600">
                    Prompt #{item.promptNumber || index + 1}
                  </span>

                  <span className="text-xs font-medium text-gray-400">
                    {item.problem?.title || "Question"}
                  </span>
                </div>

                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Student Prompt
                  </p>

                  <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm leading-6 text-gray-700">
                    {item.prompt || "-"}
                  </div>
                </div>

                <div className="mt-4">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-violet-500">
                    AI Response
                  </p>

                  <div className="whitespace-pre-wrap rounded-xl border border-violet-100 bg-violet-50/60 p-4 text-sm leading-6 text-gray-700">
                    {item.response || "-"}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </InfoSection>
      )}
    </motion.div>
  );
};

const ProblemCard = ({ item, index }) => {
  const [showCode, setShowCode] = useState(false);

  const submission = item.submission || null;

  const code = submission?.sourceCode || submission?.code || "";

  const verdict = submission?.verdict || "";

  const attempted =
    Boolean(submission) ||
    ["attempted", "passed", "failed"].includes(item.status);

  const solved = item.status === "passed" || verdict === "Accepted";

  const status = !attempted
    ? "Not Attempted"
    : solved
      ? "Accepted"
      : verdict || "Failed";

  const passedCases = Number(submission?.passedTestCases ?? 0);

  const totalCases = Number(submission?.totalTestCases ?? 0);

  const percentage =
    totalCases > 0 ? Math.round((passedCases / totalCases) * 100) : 0;

  const memory = submission?.memoryUsed ?? submission?.memory ?? null;

  const copyCode = async () => {
    if (!code) {
      toast.error("No submitted code available");

      return;
    }

    try {
      await navigator.clipboard.writeText(code);

      toast.success("Code copied");
    } catch {
      toast.error("Unable to copy code");
    }
  };

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
                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${difficultyStyle(
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

        <QuestionStatus solved={solved} attempted={attempted} status={status} />
      </div>

      {attempted && submission ? (
        <div className="border-t border-gray-100">
          <div className="grid grid-cols-2 gap-3 p-5 sm:p-6 lg:grid-cols-5">
            <SmallInfo label="Language" value={submission.language || "-"} />

            <SmallInfo label="Verdict" value={verdict || "-"} />

            <SmallInfo
              label="Test Cases"
              value={`${passedCases}/${totalCases}`}
            />

            <SmallInfo
              label="Execution"
              value={
                submission.executionTime !== undefined &&
                submission.executionTime !== null
                  ? `${submission.executionTime} ms`
                  : "-"
              }
            />

            <SmallInfo label="Memory" value={memory !== null ? memory : "-"} />
          </div>

          {totalCases > 0 && (
            <div className="px-5 pb-5 sm:px-6 sm:pb-6">
              <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-500">
                    Test Case Performance
                  </p>

                  <span className="text-xs font-bold text-gray-700">
                    {percentage}%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                  <motion.div
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width: `${percentage}%`,
                    }}
                    transition={{
                      duration: 0.6,
                    }}
                    className={`h-full rounded-full ${
                      solved
                        ? "bg-emerald-500"
                        : "bg-gradient-to-r from-amber-400 to-orange-500"
                    }`}
                  />
                </div>
              </div>
            </div>
          )}

          {code && (
            <div className="border-t border-gray-100">
              <div className="flex items-center justify-between gap-3 px-5 py-4 sm:px-6">
                <button
                  type="button"
                  onClick={() => setShowCode((prev) => !prev)}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-900"
                >
                  <Code2 size={18} className="text-indigo-600" />
                  Submitted Code
                  {showCode ? (
                    <ChevronUp size={15} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={15} className="text-gray-400" />
                  )}
                </button>

                <motion.button
                  type="button"
                  whileTap={{
                    scale: 0.9,
                  }}
                  onClick={copyCode}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-indigo-600"
                >
                  <Copy size={14} />
                  Copy
                </motion.button>
              </div>

              <AnimatePresence initial={false}>
                {showCode && (
                  <motion.div
                    initial={{
                      height: 0,

                      opacity: 0,
                    }}
                    animate={{
                      height: "auto",

                      opacity: 1,
                    }}
                    exit={{
                      height: 0,

                      opacity: 0,
                    }}
                    transition={{
                      duration: 0.25,
                    }}
                    className="overflow-hidden"
                  >
                    <div className="bg-gray-950">
                      <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 sm:px-6">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Terminal size={14} />

                          {submission.language || "Code"}
                        </div>
                      </div>

                      <pre className="max-h-[520px] overflow-auto p-5 font-mono text-xs leading-6 text-gray-200 sm:p-6 sm:text-sm">
                        <code>{code}</code>
                      </pre>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      ) : (
        <div className="border-t border-gray-100 p-5 sm:p-6">
          <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
            <XCircle size={18} className="text-gray-400" />

            <div>
              <p className="text-sm font-semibold text-gray-600">
                Not attempted
              </p>

              <p className="mt-1 text-xs text-gray-400">
                No code submission was recorded for this question.
              </p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

const InfoSection = ({
  icon: Icon,
  title,
  subtitle,
  children,
  tone = "indigo",
  className = "",
  badge,
}) => {
  const toneMap = {
    indigo: "bg-indigo-50 text-indigo-600",

    violet: "bg-violet-50 text-violet-600",
  };

  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 12,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className={`overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between gap-4 border-b border-gray-100 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              toneMap[tone] || toneMap.indigo
            }`}
          >
            <Icon size={19} />
          </div>

          <div>
            <h2 className="font-bold text-gray-900">{title}</h2>

            {subtitle && (
              <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>
            )}
          </div>
        </div>

        {badge && (
          <span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-600">
            {badge}
          </span>
        )}
      </div>

      <div className="p-5 sm:p-6">{children}</div>
    </motion.section>
  );
};

const StatCard = ({ title, value, icon: Icon, tone = "primary" }) => {
  const styles = {
    primary: "bg-indigo-50 text-indigo-600",

    success: "bg-emerald-50 text-emerald-600",

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
        <div>
          <p className="text-xs font-medium text-gray-500 sm:text-sm">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold capitalize text-gray-950">
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            styles[tone] || styles.primary
          }`}
        >
          <Icon size={19} />
        </div>
      </div>
    </motion.div>
  );
};

const InfoCard = ({ label, value, icon: Icon }) => (
  <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
      <Icon size={17} />
    </div>

    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
      {label}
    </p>

    <p className="mt-1 break-words text-sm font-semibold text-gray-800">
      {value ?? "-"}
    </p>
  </div>
);

const MiniPerformance = ({ label, value, type = "default" }) => {
  const styles = {
    default: "bg-gray-50 text-gray-900",

    success: "bg-emerald-50 text-emerald-700",

    danger: "bg-red-50 text-red-600",

    primary: "bg-indigo-50 text-indigo-700",
  };

  return (
    <div className={`rounded-xl p-4 text-center ${styles[type]}`}>
      <p className="text-[10px] font-semibold uppercase tracking-wide opacity-60">
        {label}
      </p>

      <p className="mt-2 text-xl font-bold">{value}</p>
    </div>
  );
};

const SmallInfo = ({ label, value }) => (
  <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3 sm:p-4">
    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
      {label}
    </p>

    <p className="mt-2 break-words text-sm font-semibold capitalize text-gray-700">
      {value ?? "-"}
    </p>
  </div>
);

const QuestionStatus = ({ solved, attempted, status }) => {
  if (!attempted) {
    return (
      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-gray-200 bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-500">
        <XCircle size={14} />
        Not Attempted
      </span>
    );
  }

  if (solved) {
    return (
      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">
        <CheckCircle2 size={14} />
        Accepted
      </span>
    );
  }

  return (
    <span className="inline-flex w-fit items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600">
      <XCircle size={14} />

      {status}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const normalized = String(status || "")
    .toLowerCase()
    .replaceAll("_", " ");

  let classes = "border-gray-200 bg-gray-100 text-gray-600";

  if (["submitted", "completed"].includes(normalized)) {
    classes = "border-emerald-100 bg-emerald-50 text-emerald-600";
  }

  if (["in progress", "started"].includes(normalized)) {
    classes = "border-amber-100 bg-amber-50 text-amber-600";
  }

  if (normalized === "expired") {
    classes = "border-red-100 bg-red-50 text-red-600";
  }

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${classes}`}
    >
      {normalized || "Unknown"}
    </span>
  );
};

const difficultyStyle = (difficulty) => {
  if (difficulty === "Easy") {
    return "border-emerald-100 bg-emerald-50 text-emerald-600";
  }

  if (difficulty === "Medium") {
    return "border-amber-100 bg-amber-50 text-amber-600";
  }

  if (difficulty === "Hard") {
    return "border-red-100 bg-red-50 text-red-600";
  }

  return "border-gray-200 bg-gray-100 text-gray-600";
};

export default ParticipantDetails;
