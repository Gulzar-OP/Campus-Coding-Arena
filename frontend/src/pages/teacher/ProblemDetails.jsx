import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import {
  Activity,
  AlignLeft,
  ArrowLeft,
  Binary,
  Braces,
  Building2,
  CheckCircle2,
  Clock3,
  Code2,
  Cpu,
  Eye,
  EyeOff,
  FileCode2,
  Gauge,
  Hash,
  Languages,
  Loader2,
  MemoryStick,
  Pencil,
  Sparkles,
  Tag,
  Terminal,
  Trash2,
  XCircle,
} from "lucide-react";

import { AnimatePresence, motion } from "framer-motion";

import toast from "react-hot-toast";

import api from "../../services/api";

const ProblemDetails = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [problem, setProblem] = useState(null);

  const [loading, setLoading] = useState(true);

  const [deleting, setDeleting] = useState(false);

  const [expandedTestCase, setExpandedTestCase] = useState(0);

  // ==========================================================
  // FETCH PROBLEM
  // ==========================================================

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true);

        const response = await api.get(`/problems/id/${id}`);

        setProblem(response.data?.problem || null);
      } catch (error) {
        console.error("FETCH PROBLEM ERROR:", error);

        toast.error(error.response?.data?.message || "Failed to load problem");

        navigate("/teacher/problems");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProblem();
    }
  }, [id, navigate]);

  // ==========================================================
  // DELETE
  // ==========================================================

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this problem?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      const response = await api.delete(`/problems/${id}`);

      toast.success(response.data?.message || "Problem deleted successfully");

      navigate("/teacher/problems");
    } catch (error) {
      console.error("DELETE PROBLEM ERROR:", error);

      toast.error(error.response?.data?.message || "Failed to delete problem");
    } finally {
      setDeleting(false);
    }
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

          <p className="mt-4 font-semibold text-gray-700">Loading problem</p>

          <p className="mt-1 text-sm text-gray-400">
            Fetching problem information...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // NOT FOUND
  // ==========================================================

  if (!problem) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <FileCode2 size={42} className="mx-auto text-gray-300" />

          <h2 className="mt-4 text-lg font-bold text-gray-800">
            Problem not found
          </h2>

          <button
            type="button"
            onClick={() => navigate("/teacher/problems")}
            className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white"
          >
            Back to Problems
          </button>
        </div>
      </div>
    );
  }

  const visibleTestCases =
    problem.testCases?.filter((item) => !item.isHidden).length || 0;

  const hiddenTestCases =
    problem.testCases?.filter((item) => item.isHidden).length || 0;

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
      className="mx-auto w-full max-w-[1500px] pb-12"
    >
      {/* ================================================== */}
      {/* TOP BAR */}
      {/* ================================================== */}

      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => navigate("/teacher/problems")}
          className="flex w-fit items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-indigo-600"
        >
          <ArrowLeft size={16} />
          Back to Problems
        </button>

        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{
              scale: 0.97,
            }}
            type="button"
            onClick={() => navigate(`/teacher/problems/${id}/edit`)}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600"
          >
            <Pencil size={16} />
            Edit
          </motion.button>

          <motion.button
            whileTap={{
              scale: 0.97,
            }}
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}

            {deleting ? "Deleting..." : "Delete"}
          </motion.button>
        </div>
      </div>

      {/* ================================================== */}
      {/* HERO */}
      {/* ================================================== */}

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

        <div className="relative flex flex-col justify-between gap-6 xl:flex-row xl:items-start">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <DifficultyBadge difficulty={problem.difficulty} />

              {problem.topic && <Badge>{problem.topic}</Badge>}

              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                  problem.isActive
                    ? "border-emerald-100 bg-emerald-50 text-emerald-600"
                    : "border-red-100 bg-red-50 text-red-500"
                }`}
              >
                {problem.isActive ? (
                  <CheckCircle2 size={12} />
                ) : (
                  <XCircle size={12} />
                )}

                {problem.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-indigo-600">
              <Sparkles size={15} />
              Coding Problem
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl lg:text-4xl">
              {problem.title}
            </h1>

            <p className="mt-2 font-mono text-xs text-gray-400">
              /{problem.slug}
            </p>
          </div>

          {/* LIMITS */}

          <div className="grid grid-cols-2 gap-3 sm:min-w-[320px]">
            <TopMetric
              icon={Clock3}
              label="Time Limit"
              value={`${problem.timeLimit || 0}s`}
            />

            <TopMetric
              icon={MemoryStick}
              label="Memory"
              value={`${problem.memoryLimit || 0} MB`}
            />
          </div>
        </div>
      </motion.section>

      {/* ================================================== */}
      {/* QUICK META */}
      {/* ================================================== */}

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Activity} label="Solved" value={problem.solved || 0} />

        <StatCard
          icon={Terminal}
          label="Test Cases"
          value={problem.testCases?.length || 0}
        />

        <StatCard
          icon={Languages}
          label="Languages"
          value={problem.languages?.length || 0}
        />

        <StatCard icon={EyeOff} label="Hidden Cases" value={hiddenTestCases} />
      </div>

      {/* ================================================== */}
      {/* DESCRIPTION */}
      {/* ================================================== */}

      <ContentSection
        icon={AlignLeft}
        title="Description"
        subtitle="Problem statement"
      >
        <p className="whitespace-pre-wrap text-sm leading-7 text-gray-700 sm:text-base">
          {problem.description}
        </p>
      </ContentSection>

      {/* ================================================== */}
      {/* COMPLEXITY */}
      {/* ================================================== */}

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
          delay: 0.08,
        }}
        className="my-6 overflow-hidden rounded-2xl border border-indigo-100 bg-indigo-50/40"
      >
        <div className="border-b border-indigo-100 bg-white/70 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <Gauge size={19} />
            </div>

            <div>
              <h2 className="font-bold text-gray-900">Expected Complexity</h2>

              <p className="text-xs text-gray-500">
                Recommended algorithm complexity for students
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">
          <ComplexityCard
            icon={Clock3}
            label="Time Complexity"
            value={problem.timeComplexity || "Not specified"}
          />

          <ComplexityCard
            icon={MemoryStick}
            label="Space Complexity"
            value={problem.spaceComplexity || "Not specified"}
          />
        </div>
      </motion.section>

      {/* ================================================== */}
      {/* INPUT OUTPUT */}
      {/* ================================================== */}

      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ContentSection
          icon={Braces}
          title="Input Format"
          subtitle="Expected input structure"
          compact
        >
          <CodeText>{problem.inputFormat || "Not provided"}</CodeText>
        </ContentSection>

        <ContentSection
          icon={Binary}
          title="Output Format"
          subtitle="Required output structure"
          compact
        >
          <CodeText>{problem.outputFormat || "Not provided"}</CodeText>
        </ContentSection>
      </div>

      {/* ================================================== */}
      {/* CONSTRAINTS */}
      {/* ================================================== */}

      <ContentSection
        icon={Cpu}
        title="Constraints"
        subtitle="Input boundaries and restrictions"
      >
        {problem.constraints?.length > 0 ? (
          <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
            {problem.constraints.map((constraint, index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/70 px-4 py-3"
              >
                <Hash size={14} className="shrink-0 text-indigo-500" />

                <code className="break-all text-sm text-gray-700">
                  {constraint}
                </code>
              </div>
            ))}
          </div>
        ) : (
          <EmptyText />
        )}
      </ContentSection>

      {/* ================================================== */}
      {/* METADATA */}
      {/* ================================================== */}

      <div className="my-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <ContentSection icon={Tag} title="Tags" compact>
          {problem.tags?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {problem.tags.map((tag, index) => (
                <span
                  key={index}
                  className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <EmptyText />
          )}
        </ContentSection>

        <ContentSection icon={Building2} title="Companies" compact>
          {problem.companies?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {problem.companies.map((company, index) => (
                <span
                  key={index}
                  className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600"
                >
                  {company}
                </span>
              ))}
            </div>
          ) : (
            <EmptyText />
          )}
        </ContentSection>

        <ContentSection icon={Languages} title="Languages" compact>
          {problem.languages?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {problem.languages.map((language, index) => (
                <span
                  key={index}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600"
                >
                  {language}
                </span>
              ))}
            </div>
          ) : (
            <EmptyText />
          )}
        </ContentSection>
      </div>

      {/* ================================================== */}
      {/* TEST CASES */}
      {/* ================================================== */}

      <motion.section
        initial={{
          opacity: 0,
          y: 12,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
      >
        <div className="flex flex-col justify-between gap-4 border-b border-gray-100 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
              <Terminal size={19} />
            </div>

            <div>
              <h2 className="font-bold text-gray-900">Test Cases</h2>

              <p className="text-xs text-gray-500">
                {visibleTestCases} visible · {hiddenTestCases} hidden
              </p>
            </div>
          </div>

          <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
            {problem.testCases?.length || 0} total
          </span>
        </div>

        {problem.testCases?.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {problem.testCases.map((testCase, index) => {
              const expanded = expandedTestCase === index;

              return (
                <div key={index}>
                  <button
                    type="button"
                    onClick={() => setExpandedTestCase(expanded ? null : index)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-gray-50 sm:px-6"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600">
                        {index + 1}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Test Case {index + 1}
                        </p>

                        <p className="mt-0.5 text-xs text-gray-400">
                          {testCase.isHidden
                            ? "Hidden test case"
                            : "Visible sample"}
                        </p>
                      </div>
                    </div>

                    <div
                      className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                        testCase.isHidden
                          ? "bg-violet-50 text-violet-600"
                          : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      {testCase.isHidden ? (
                        <EyeOff size={13} />
                      ) : (
                        <Eye size={13} />
                      )}

                      {testCase.isHidden ? "Hidden" : "Visible"}
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {expanded && (
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
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-1 gap-4 bg-gray-50/60 px-5 py-5 lg:grid-cols-2 sm:px-6">
                          <CodeBox title="Input" value={testCase.input} />

                          <CodeBox
                            title="Expected Output"
                            value={testCase.expectedOutput}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-10 text-center">
            <EmptyText text="No test cases added" />
          </div>
        )}
      </motion.section>
    </motion.div>
  );
};

// ============================================================
// CONTENT SECTION
// ============================================================

const ContentSection = ({
  icon: Icon,
  title,
  subtitle,
  children,
  compact = false,
}) => (
  <motion.section
    initial={{
      opacity: 0,
      y: 10,
    }}
    animate={{
      opacity: 1,
      y: 0,
    }}
    className={`rounded-2xl border border-gray-200 bg-white shadow-sm ${
      compact ? "p-5" : "p-5 sm:p-6"
    }`}
  >
    <div className="mb-5 flex items-center gap-3">
      {Icon && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <Icon size={18} />
        </div>
      )}

      <div>
        <h2 className="font-bold text-gray-900">{title}</h2>

        {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
      </div>
    </div>

    {children}
  </motion.section>
);

// ============================================================
// COMPLEXITY CARD
// ============================================================

const ComplexityCard = ({ icon: Icon, label, value }) => (
  <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        <Icon size={17} />
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>
    </div>

    <p className="mt-4 font-mono text-xl font-bold text-gray-950 sm:text-2xl">
      {value}
    </p>
  </div>
);

// ============================================================
// TOP METRIC
// ============================================================

const TopMetric = ({ icon: Icon, label, value }) => (
  <div className="rounded-2xl border border-white bg-white/80 p-4 shadow-sm backdrop-blur-sm">
    <div className="flex items-center gap-2 text-gray-400">
      <Icon size={14} />

      <span className="text-[10px] font-semibold uppercase tracking-wide">
        {label}
      </span>
    </div>

    <p className="mt-2 text-lg font-bold text-gray-900">{value}</p>
  </div>
);

// ============================================================
// STAT CARD
// ============================================================

const StatCard = ({ icon: Icon, label, value }) => (
  <motion.div
    whileHover={{
      y: -3,
    }}
    className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-medium text-gray-500 sm:text-sm">{label}</p>

        <p className="mt-2 text-2xl font-bold text-gray-950">{value}</p>
      </div>

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        <Icon size={19} />
      </div>
    </div>
  </motion.div>
);

// ============================================================
// CODE TEXT
// ============================================================

const CodeText = ({ children }) => (
  <pre className="min-h-[110px] overflow-auto whitespace-pre-wrap rounded-xl border border-gray-100 bg-gray-50/80 p-4 font-mono text-sm leading-6 text-gray-700">
    {children}
  </pre>
);

// ============================================================
// CODE BOX
// ============================================================

const CodeBox = ({ title, value }) => (
  <div>
    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
      {title}
    </p>

    <pre className="min-h-[110px] overflow-auto whitespace-pre-wrap rounded-xl bg-gray-950 p-4 font-mono text-sm leading-6 text-gray-100">
      {value || "-"}
    </pre>
  </div>
);

// ============================================================
// BADGE
// ============================================================

const Badge = ({ children }) => (
  <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-600">
    {children}
  </span>
);

// ============================================================
// DIFFICULTY
// ============================================================

const DifficultyBadge = ({ difficulty }) => {
  const styles = {
    Easy: "border-emerald-100 bg-emerald-50 text-emerald-600",

    Medium: "border-amber-100 bg-amber-50 text-amber-600",

    Hard: "border-red-100 bg-red-50 text-red-600",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
        styles[difficulty] || "border-gray-200 bg-gray-100 text-gray-600"
      }`}
    >
      {difficulty || "Unknown"}
    </span>
  );
};

// ============================================================
// EMPTY
// ============================================================

const EmptyText = ({ text = "Not provided" }) => (
  <p className="text-sm text-gray-400">{text}</p>
);

export default ProblemDetails;
