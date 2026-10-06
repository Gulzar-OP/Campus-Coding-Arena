
import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  CheckCircle2,
  Clock3,
  FileCode2,
  Play,
  ShieldCheck,
  Sparkles,
  Wifi,
} from "lucide-react";

import {
  motion,
} from "framer-motion";

import toast from "react-hot-toast";

import api from "../../services/api";

const TestInstructions = () => {
  const { id } = useParams();

  const navigate =
    useNavigate();

  const [test, setTest] =
    useState(null);

  const [attempt, setAttempt] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [starting, setStarting] =
    useState(false);

  // =========================
  // FETCH TEST
  // =========================

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const response =
          await api.get(
            `/tests/${id}`,
          );

        setTest(
          response.data.test,
        );

        try {
          const attemptResponse =
            await api.get(
              `/tests/${id}/attempt`,
            );

          setAttempt(
            attemptResponse.data
              .attempt,
          );
        } catch {
          setAttempt(null);
        }
      } catch (error) {
        toast.error(
          error.response?.data
            ?.message ||
            "Failed to load test",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [id]);

  // =========================
  // START / CONTINUE TEST
  // =========================

  const startTest = async () => {
    try {
      setStarting(true);

      if (
        attempt?.status ===
        "in_progress"
      ) {
        navigate(
          `/student/tests/${id}/code`,
        );

        return;
      }

      await api.post(
        `/tests/${id}/start`,
      );

      toast.success(
        "Assessment started",
      );

      navigate(
        `/student/tests/${id}/code`,
      );
    }catch (error) {
  console.log("START TEST ERROR:", error);
  console.log(
    "BACKEND DATA:",
    error.response?.data,
  );
  console.log(
    "STATUS:",
    error.response?.status,
  );

  toast.error(
    error.response?.data?.message ||
      "Failed to start test",
  );

    } finally {
      setStarting(false);
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="flex min-h-[450px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-gray-200 border-t-indigo-600" />

          <p className="mt-4 text-sm font-medium text-gray-500">
            Loading assessment...
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // NOT FOUND
  // =========================

  if (!test) {
    return (
      <div className="flex min-h-[450px] items-center justify-center">
        <div className="text-center">
          <FileCode2
            size={42}
            className="mx-auto text-gray-300"
          />

          <h2 className="mt-4 text-xl font-bold text-gray-900">
            Assessment not found
          </h2>

          <button
            onClick={() =>
              navigate(
                "/student",
              )
            }
            className="mt-4 text-sm font-semibold text-indigo-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const totalMarks =
    test.problems?.reduce(
      (sum, item) =>
        sum +
        Number(item.marks || 0),
      0,
    ) || 0;

  const continuing =
    attempt?.status ===
    "in_progress";

  const infoCards = [
    {
      icon: Clock3,
      label: "Duration",
      value: `${test.duration} min`,
    },
    {
      icon: FileCode2,
      label: "Problems",
      value:
        test.problems?.length ||
        0,
    },
    {
      icon: Bot,
      label: "AI Prompts",
      value:
        test.maxAIPrompts ?? 0,
    },
    {
      icon: ShieldCheck,
      label: "Total Marks",
      value: totalMarks,
    },
  ];

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.45,
      }}
      className="mx-auto w-full max-w-6xl pb-12"
    >
      {/* ========================= */}
      {/* BACK */}
      {/* ========================= */}

      <button
        onClick={() =>
          navigate("/student")
        }
        className="mb-5 flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-indigo-600"
      >
        <ArrowLeft size={16} />

        Back to Dashboard
      </button>

      {/* ========================= */}
      {/* HERO */}
      {/* ========================= */}

      <motion.section
        initial={{
          opacity: 0,
          y: 15,
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
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-indigo-400/10 blur-3xl" />

        <div className="absolute -bottom-20 left-1/3 h-44 w-44 rounded-full bg-violet-400/10 blur-3xl" />

        <div className="relative">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-600 shadow-sm">
            <Sparkles
              size={14}
            />

            Coding Assessment
          </div>

          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
            <div className="max-w-3xl">
              <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl lg:text-4xl">
                {test.title}
              </h1>

              <p className="mt-3 text-sm leading-7 text-gray-500 sm:text-base">
                {test.description ||
                  "Read the instructions carefully before starting this coding assessment."}
              </p>
            </div>

            {continuing && (
              <span className="w-fit rounded-full border border-amber-100 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-600">
                Test already started
              </span>
            )}
          </div>
        </div>
      </motion.section>

      {/* ========================= */}
      {/* INFO CARDS */}
      {/* ========================= */}

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {infoCards.map(
          ({
            icon,
            label,
            value,
          }) => (
            <InfoCard
              key={label}
              icon={icon}
              label={label}
              value={value}
            />
          ),
        )}
      </div>

      {/* ========================= */}
      {/* MAIN CONTENT */}
      {/* ========================= */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_0.7fr]">
        {/* INSTRUCTIONS */}

        <motion.section
          initial={{
            opacity: 0,
            y: 15,
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
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 sm:text-xl">
              Instructions
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Please read these
              rules before starting
              the assessment.
            </p>
          </div>

          <div className="space-y-3">
            <Instruction>
              Your timer starts only
              after clicking{" "}
              <strong>
                Start Test
              </strong>
              .
            </Instruction>

            <Instruction>
              The assessment duration
              is{" "}
              <strong>
                {test.duration}{" "}
                minutes
              </strong>
              .
            </Instruction>

            <Instruction>
              You can use the AI
              assistant a maximum of{" "}
              <strong>
                {test.maxAIPrompts ??
                  0}{" "}
                times
              </strong>
              .
            </Instruction>

            <Instruction>
              AI assistance is
              intended only for hints
              and debugging guidance.
            </Instruction>

            <Instruction>
              Hidden test cases are
              used during final code
              submission.
            </Instruction>

            <Instruction>
              A problem receives marks
              only when all required
              test cases pass.
            </Instruction>

            <Instruction>
              Once the assessment time
              expires, code execution,
              AI assistance and
              submission are disabled.
            </Instruction>
          </div>
        </motion.section>

        {/* SIDE PANEL */}

        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.15,
          }}
          className="space-y-5"
        >
          {/* Warning */}

          <section className="rounded-2xl border border-orange-200 bg-orange-50 p-5">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-orange-600 shadow-sm">
                <AlertTriangle
                  size={20}
                />
              </div>

              <div>
                <h3 className="font-bold text-orange-900">
                  Before you start
                </h3>

                <p className="mt-2 text-sm leading-6 text-orange-700">
                  Make sure you have
                  a stable internet
                  connection. Once
                  started, the timer
                  continues even if
                  you leave the page.
                </p>
              </div>
            </div>
          </section>

          {/* Checklist */}

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="font-bold text-gray-900">
              Quick Checklist
            </h3>

            <div className="mt-4 space-y-3">
              <ChecklistItem
                icon={Wifi}
                text="Stable internet connection"
              />

              <ChecklistItem
                icon={
                  CheckCircle2
                }
                text="Read all instructions"
              />

              <ChecklistItem
                icon={Clock3}
                text="Enough uninterrupted time"
              />

              <ChecklistItem
                icon={Bot}
                text="Use AI prompts carefully"
              />
            </div>
          </section>
        </motion.div>
      </div>

      {/* ========================= */}
      {/* START BUTTON */}
      {/* ========================= */}

      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.2,
        }}
        className="mt-6 flex flex-col-reverse justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:p-5"
      >
        <div>
          <p className="text-sm font-semibold text-gray-800">
            {continuing
              ? "Your assessment is already in progress."
              : "Ready to begin?"}
          </p>

          <p className="mt-1 text-xs text-gray-400">
            {continuing
              ? "Continue from where you left off."
              : "Your timer will begin immediately after starting."}
          </p>
        </div>

        <motion.button
          whileHover={
            starting
              ? {}
              : {
                  scale: 1.01,
                }
          }
          whileTap={
            starting
              ? {}
              : {
                  scale: 0.98,
                }
          }
          onClick={startTest}
          disabled={starting}
          className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {starting ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

              {continuing
                ? "Opening..."
                : "Starting..."}
            </>
          ) : (
            <>
              <Play size={17} />

              {continuing
                ? "Continue Test"
                : "Start Test"}
            </>
          )}
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

// =========================
// INFO CARD
// =========================

const InfoCard = ({
  icon: Icon,
  label,
  value,
}) => (
  <motion.div
    whileHover={{
      y: -3,
    }}
    className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs font-medium text-gray-500 sm:text-sm">
          {label}
        </p>

        <p className="mt-2 text-xl font-bold text-gray-950 sm:text-2xl">
          {value}
        </p>
      </div>

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 sm:h-11 sm:w-11">
        <Icon size={20} />
      </div>
    </div>
  </motion.div>
);

// =========================
// INSTRUCTION
// =========================

const Instruction = ({
  children,
}) => (
  <div className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50/60 p-4">
    <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
      <CheckCircle2
        size={13}
      />
    </div>

    <p className="text-sm leading-6 text-gray-600">
      {children}
    </p>
  </div>
);

// =========================
// CHECKLIST
// =========================

const ChecklistItem = ({
  icon: Icon,
  text,
}) => (
  <div className="flex items-center gap-3">
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-indigo-600">
      <Icon size={15} />
    </div>

    <p className="text-sm text-gray-600">
      {text}
    </p>
  </div>
);

export default TestInstructions;
