import { useEffect, useMemo, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import {
  Activity,
  ArrowLeft,
  Brain,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Code2,
  Eye,
  FileCode2,
  Loader2,
  Sparkles,
  Target,
  Users,
  XCircle,
} from "lucide-react";

import { AnimatePresence, motion } from "framer-motion";

import toast from "react-hot-toast";

import api from "../../services/api";

const TestDetails = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [test, setTest] = useState(null);

  const [participants, setParticipants] = useState([]);

  const [summary, setSummary] = useState({
    totalParticipants: 0,
    inProgress: 0,
    submitted: 0,
    expired: 0,
  });

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [publishing, setPublishing] = useState(false);

  const fetchTest = async () => {
    const response = await api.get(`/tests/${id}`);

    setTest(response.data?.test || null);
  };

  const fetchParticipants = async () => {
    try {
      const response = await api.get(`/tests/${id}/participants`);

      setParticipants(response.data?.participants || []);

      setSummary({
        totalParticipants: response.data?.summary?.totalParticipants ?? 0,

        inProgress: response.data?.summary?.inProgress ?? 0,

        submitted: response.data?.summary?.submitted ?? 0,

        expired: response.data?.summary?.expired ?? 0,
      });
    } catch (error) {
      console.error("PARTICIPANTS FETCH ERROR:", error);

      setParticipants([]);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");

        await Promise.all([fetchTest(), fetchParticipants()]);
      } catch (error) {
        console.error("TEST DETAILS ERROR:", error);

        const message = error.response?.data?.message || "Failed to fetch test";

        setError(message);

        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      load();
    }
  }, [id]);

  const handlePublish = async () => {
    try {
      setPublishing(true);

      await api.post(`/tests/${id}/publish`);

      toast.success("Test published successfully");

      await fetchTest();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to publish test");
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    try {
      setPublishing(true);

      await api.post(`/tests/${id}/unpublish`);

      toast.success("Test moved back to draft");

      await fetchTest();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to unpublish test");
    } finally {
      setPublishing(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    return date.toLocaleString("en-IN", {
      timeZone: "UTC",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const participantStats = useMemo(() => {
    const totalQuestions = test?.problems?.length || 0;

    const totalSolved = participants.reduce(
      (sum, item) => sum + Number(item.solvedProblems ?? 0),
      0,
    );

    const totalAttempted = participants.reduce(
      (sum, item) => sum + Number(item.attemptedProblems ?? 0),
      0,
    );

    return {
      totalQuestions,
      totalSolved,
      totalAttempted,
    };
  }, [participants, test]);

  const openParticipant = (participant) => {
    const studentId = participant.student?._id || participant.studentId;

    if (!studentId) {
      toast.error("Student ID not available");

      return;
    }

    navigate(`/teacher/tests/${id}/participants/${studentId}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-[520px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
            <Loader2 size={25} className="animate-spin text-indigo-600" />
          </div>

          <p className="mt-4 font-semibold text-gray-700">Loading assessment</p>

          <p className="mt-1 text-sm text-gray-400">Fetching test details...</p>
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
            <FileCode2 size={25} />
          </div>

          <h2 className="mt-5 text-xl font-bold text-gray-900">
            Test not found
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            {error || "Unable to load this assessment."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/teacher/tests")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <ArrowLeft size={16} />
            Back to Tests
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Participants",

      value: summary.totalParticipants,

      icon: Users,

      tone: "indigo",
    },

    {
      title: "In Progress",

      value: summary.inProgress,

      icon: Clock3,

      tone: "amber",
    },

    {
      title: "Submitted",

      value: summary.submitted,

      icon: CheckCircle2,

      tone: "emerald",
    },

    {
      title: "Expired",

      value: summary.expired,

      icon: XCircle,

      tone: "red",
    },
  ];

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
      <div className="mb-5">
        <button
          type="button"
          onClick={() => navigate("/teacher/tests")}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-indigo-600"
        >
          <ArrowLeft size={16} />
          Back to Tests
        </button>
      </div>

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

        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600">
                <Sparkles size={16} />
                Assessment Details
              </div>

              <StatusBadge status={test.status} />
            </div>

            <h1 className="break-words text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl lg:text-4xl">
              {test.title}
            </h1>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-500 sm:text-base">
              {test.description ||
                "No description provided for this assessment."}
            </p>
          </div>

          <div className="shrink-0">
            {test.status === "draft" ? (
              <motion.button
                whileTap={{
                  scale: 0.98,
                }}
                type="button"
                onClick={handlePublish}
                disabled={publishing}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {publishing ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={17} />
                )}

                {publishing ? "Publishing..." : "Publish Test"}
              </motion.button>
            ) : (
              <motion.button
                whileTap={{
                  scale: 0.98,
                }}
                type="button"
                onClick={handleUnpublish}
                disabled={publishing}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {publishing && <Loader2 size={16} className="animate-spin" />}

                {publishing ? "Updating..." : "Move to Draft"}
              </motion.button>
            )}
          </div>
        </div>
      </motion.section>

      <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {statCards.map((card, index) => (
          <StatCard key={card.title} {...card} index={index} />
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Section
          icon={ClipboardCheck}
          title="Assessment Information"
          subtitle="Configuration and schedule"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoCard
              icon={ClipboardCheck}
              label="Status"
              value={test.status}
            />

            <InfoCard
              icon={Clock3}
              label="Duration"
              value={`${test.duration || 0} minutes`}
            />

            <InfoCard
              icon={FileCode2}
              label="Questions"
              value={test.problems?.length || 0}
            />

            <InfoCard
              icon={Brain}
              label="AI Prompts"
              value={test.maxAIPrompts ?? 0}
            />

            <InfoCard
              icon={CalendarDays}
              label="Starts"
              value={formatDate(test.startTime)}
            />

            <InfoCard
              icon={CalendarDays}
              label="Ends"
              value={formatDate(test.endTime)}
            />
          </div>
        </Section>

        <Section
          icon={Activity}
          title="Activity"
          subtitle="Current assessment performance"
          tone="violet"
        >
          <div className="grid grid-cols-2 gap-3">
            <ActivityCard
              label="Questions"
              value={participantStats.totalQuestions}
            />

            <ActivityCard label="Students" value={summary.totalParticipants} />

            <ActivityCard
              label="Attempts"
              value={participantStats.totalAttempted}
            />

            <ActivityCard label="Solved" value={participantStats.totalSolved} />
          </div>
        </Section>
      </div>

      <Section
        icon={Code2}
        title="Questions"
        subtitle="Questions included in this assessment"
        badge={`${test.problems?.length || 0} questions`}
      >
        {!test.problems || test.problems.length === 0 ? (
          <EmptyState
            icon={FileCode2}
            title="No questions added"
            description="Add at least one question before publishing the assessment."
          />
        ) : (
          <div className="space-y-3">
            {test.problems.map((item, index) => {
              const problem = item.problem || {};

              return (
                <motion.div
                  key={problem._id || index}
                  initial={{
                    opacity: 0,

                    x: -8,
                  }}
                  animate={{
                    opacity: 1,

                    x: 0,
                  }}
                  transition={{
                    delay: Math.min(index * 0.04, 0.2),
                  }}
                  whileHover={{
                    x: 3,
                  }}
                  className="flex flex-col justify-between gap-4 rounded-2xl border border-gray-200 bg-gray-50/40 p-4 transition hover:border-indigo-100 hover:bg-indigo-50/30 sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600">
                      {index + 1}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900">
                        {problem.title || "Untitled Question"}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <DifficultyBadge difficulty={problem.difficulty} />

                        {problem.topic && (
                          <span className="text-xs text-gray-400">
                            {problem.topic}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-4">
                    {(problem.timeComplexity || problem.spaceComplexity) && (
                      <div className="hidden text-right lg:block">
                        {problem.timeComplexity && (
                          <p className="font-mono text-xs font-semibold text-gray-600">
                            Time {problem.timeComplexity}
                          </p>
                        )}

                        {problem.spaceComplexity && (
                          <p className="mt-1 font-mono text-xs text-gray-400">
                            Space {problem.spaceComplexity}
                          </p>
                        )}
                      </div>
                    )}

                    <ChevronRight size={17} className="text-gray-300" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </Section>

      <Section
        icon={Users}
        title="Participants"
        subtitle="Track student progress and submissions"
        badge={`${participants.length} students`}
        className="mt-6"
      >
        {participants.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No participants yet"
            description="Students who start this assessment will appear here."
          />
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-xl border border-gray-200 md:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px]">
                  <thead className="bg-gray-50/80">
                    <tr>
                      <TableHead>Student</TableHead>

                      <TableHead>Status</TableHead>

                      <TableHead>AI Used</TableHead>

                      <TableHead>Attempted</TableHead>

                      <TableHead>Solved</TableHead>

                      <TableHead align="right">Details</TableHead>
                    </tr>
                  </thead>

                  <tbody>
                    {participants.map((item, index) => {
                      const studentId = item.student?._id || item.studentId;

                      const totalProblems = Number(
                        item.totalProblems ?? test.problems?.length ?? 0,
                      );

                      const attempted = Number(item.attemptedProblems ?? 0);

                      const solved = Number(item.solvedProblems ?? 0);

                      return (
                        <motion.tr
                          key={studentId || index}
                          initial={{
                            opacity: 0,
                          }}
                          animate={{
                            opacity: 1,
                          }}
                          transition={{
                            delay: Math.min(index * 0.03, 0.2),
                          }}
                          onClick={() => openParticipant(item)}
                          className="cursor-pointer border-t border-gray-100 transition hover:bg-indigo-50/40"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar name={item.student?.name} />

                              <div className="min-w-0">
                                <p className="truncate font-semibold text-gray-900">
                                  {item.student?.name || "Student"}
                                </p>

                                <p className="mt-1 truncate text-xs text-gray-400">
                                  {item.student?.email || "-"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <StatusBadge status={item.status} />
                          </td>

                          <td className="px-5 py-4 text-sm font-medium text-gray-600">
                            {item.aiPromptsUsed ?? 0}/{test.maxAIPrompts ?? 0}
                          </td>

                          <td className="px-5 py-4">
                            <QuestionValue
                              current={attempted}
                              total={totalProblems}
                            />
                          </td>

                          <td className="px-5 py-4">
                            <QuestionValue
                              current={solved}
                              total={totalProblems}
                              success
                            />
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end">
                              <div className="flex h-9 w-9 items-center justify-center rounded-xl text-indigo-600 transition hover:bg-indigo-50">
                                <Eye size={17} />
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-3 md:hidden">
              <AnimatePresence>
                {participants.map((item, index) => {
                  const studentId = item.student?._id || item.studentId;

                  const totalProblems = Number(
                    item.totalProblems ?? test.problems?.length ?? 0,
                  );

                  const attempted = Number(item.attemptedProblems ?? 0);

                  const solved = Number(item.solvedProblems ?? 0);

                  return (
                    <motion.button
                      key={studentId || index}
                      type="button"
                      layout
                      initial={{
                        opacity: 0,

                        y: 8,
                      }}
                      animate={{
                        opacity: 1,

                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                      }}
                      whileTap={{
                        scale: 0.99,
                      }}
                      onClick={() => openParticipant(item)}
                      className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-indigo-200"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar name={item.student?.name} />

                          <div className="min-w-0">
                            <p className="truncate font-semibold text-gray-900">
                              {item.student?.name || "Student"}
                            </p>

                            <p className="mt-1 truncate text-xs text-gray-400">
                              {item.student?.email || "-"}
                            </p>
                          </div>
                        </div>

                        <StatusBadge status={item.status} />
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-2">
                        <MiniInfo
                          label="AI Used"
                          value={`${item.aiPromptsUsed ?? 0}/${test.maxAIPrompts ?? 0}`}
                        />

                        <MiniInfo
                          label="Attempted"
                          value={`${attempted}/${totalProblems}`}
                        />

                        <MiniInfo
                          label="Solved"
                          value={`${solved}/${totalProblems}`}
                          success
                        />
                      </div>

                      <div className="mt-4 flex items-center justify-end gap-1 text-xs font-semibold text-indigo-600">
                        View Details
                        <ChevronRight size={14} />
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </>
        )}
      </Section>
    </motion.div>
  );
};

const Section = ({
  icon: Icon,
  title,
  subtitle,
  badge,
  children,
  className = "",
  tone = "indigo",
}) => {
  const tones = {
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
      transition={{
        duration: 0.35,
      }}
      className={`overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm ${className}`}
    >
      <div className="flex flex-col justify-between gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              tones[tone] || tones.indigo
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
          <span className="w-fit rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600">
            {badge}
          </span>
        )}
      </div>

      <div className="p-5 sm:p-6">{children}</div>
    </motion.section>
  );
};

const StatCard = ({ title, value, icon: Icon, tone, index }) => {
  const tones = {
    indigo: "bg-indigo-50 text-indigo-600",

    amber: "bg-amber-50 text-amber-600",

    emerald: "bg-emerald-50 text-emerald-600",

    red: "bg-red-50 text-red-600",
  };

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
        delay: index * 0.04,
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

          <p className="mt-2 text-2xl font-bold text-gray-950 sm:text-3xl">
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            tones[tone] || tones.indigo
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

    <p className="mt-1 break-words text-sm font-semibold capitalize text-gray-800">
      {value ?? "-"}
    </p>
  </div>
);

const ActivityCard = ({ label, value }) => (
  <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
    <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
      {label}
    </p>

    <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
  </div>
);

const TableHead = ({ children, align = "left" }) => (
  <th
    className={`px-5 py-4 text-${align} text-xs font-semibold uppercase tracking-wide text-gray-500`}
  >
    {children}
  </th>
);

const QuestionValue = ({ current, total, success = false }) => (
  <div>
    <p
      className={`text-sm font-bold ${
        success ? "text-emerald-600" : "text-gray-700"
      }`}
    >
      {current}/{total}
    </p>

    <div className="mt-2 h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
      <div
        style={{
          width: `${total > 0 ? Math.min((current / total) * 100, 100) : 0}%`,
        }}
        className={`h-full rounded-full ${
          success ? "bg-emerald-500" : "bg-indigo-500"
        }`}
      />
    </div>
  </div>
);

const MiniInfo = ({ label, value, success = false }) => (
  <div className={`rounded-xl p-3 ${success ? "bg-emerald-50" : "bg-gray-50"}`}>
    <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
      {label}
    </p>

    <p
      className={`mt-1 text-sm font-bold ${
        success ? "text-emerald-600" : "text-gray-700"
      }`}
    >
      {value}
    </p>
  </div>
);

const Avatar = ({ name }) => {
  const initial = name?.trim()?.[0]?.toUpperCase() || "S";

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 text-sm font-bold text-indigo-700">
      {initial}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const normalized = String(status || "")
    .toLowerCase()
    .replaceAll("_", " ");

  let classes = "border-gray-200 bg-gray-50 text-gray-600";

  if (["submitted", "completed"].includes(normalized)) {
    classes = "border-emerald-100 bg-emerald-50 text-emerald-600";
  }

  if (["in progress", "started"].includes(normalized)) {
    classes = "border-amber-100 bg-amber-50 text-amber-600";
  }

  if (normalized === "expired") {
    classes = "border-red-100 bg-red-50 text-red-600";
  }

  if (normalized === "published") {
    classes = "border-indigo-100 bg-indigo-50 text-indigo-600";
  }

  return (
    <span
      className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold capitalize ${classes}`}
    >
      {normalized || "Unknown"}
    </span>
  );
};

const DifficultyBadge = ({ difficulty }) => {
  const styles = {
    Easy: "border-emerald-100 bg-emerald-50 text-emerald-600",

    Medium: "border-amber-100 bg-amber-50 text-amber-600",

    Hard: "border-red-100 bg-red-50 text-red-600",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
        styles[difficulty] || "border-gray-200 bg-gray-100 text-gray-600"
      }`}
    >
      {difficulty || "Unknown"}
    </span>
  );
};

const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50/30 px-5 py-12 text-center">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-gray-300 shadow-sm">
      <Icon size={23} />
    </div>

    <p className="mt-4 font-semibold text-gray-700">{title}</p>

    <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-gray-400">
      {description}
    </p>
  </div>
);

export default TestDetails;
