import { useState } from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Loader2,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  motion,
} from "framer-motion";

import toast from "react-hot-toast";

import api from "../../services/api";

const JoinTest = () => {
  const navigate =
    useNavigate();

  const [
    accessCode,
    setAccessCode,
  ] = useState("");

  const [loading, setLoading] =
    useState(false);

  // =========================
  // HANDLE CODE
  // =========================

  const handleCodeChange = (
    e,
  ) => {
    const value =
      e.target.value
        .toUpperCase()
        .replace(
          /[^A-Z0-9]/g,
          "",
        )
        .slice(0, 6);

    setAccessCode(value);
  };

  // =========================
  // JOIN TEST
  // =========================

  const handleSubmit = async (
    e,
  ) => {
    e.preventDefault();

    if (!accessCode.trim()) {
      toast.error(
        "Enter test access code",
      );

      return;
    }

    if (
      accessCode.trim().length <
      6
    ) {
      toast.error(
        "Enter a valid 6 character access code",
      );

      return;
    }

    try {
      setLoading(true);

      const response =
        await api.post(
          "/tests/join",
          {
            accessCode:
              accessCode
                .trim()
                .toUpperCase(),
          },
        );

      const test =
        response.data.test;

      const testId =
        test?.id ||
        test?._id ||
        response.data.testId;

      if (!testId) {
        toast.error(
          "Test ID not received from backend",
        );

        return;
      }

      toast.success(
        "Test found successfully",
      );

      navigate(
        `/student/tests/${testId}`,
      );
    } catch (error) {
      toast.error(
        error.response?.data
          ?.message ||
          "Invalid test code",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      className="
        relative flex
        min-h-[calc(100vh-100px)]
        items-center
        justify-center
        overflow-hidden
        px-4 py-10
      "
    >
      {/* ========================= */}
      {/* BACKGROUND */}
      {/* ========================= */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[10%] top-[10%] h-72 w-72 rounded-full bg-indigo-300/20 blur-[100px]" />

        <div className="absolute bottom-[5%] right-[10%] h-80 w-80 rounded-full bg-violet-300/20 blur-[110px]" />

        <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-200/10 blur-[100px]" />
      </div>

      {/* ========================= */}
      {/* CONTENT */}
      {/* ========================= */}

      <div className="relative w-full max-w-xl">
        {/* TOP */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.45,
          }}
          className="mb-7 text-center"
        >
          {/* ICON */}

          <motion.div
            initial={{
              scale: 0.8,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            transition={{
              delay: 0.1,
              type: "spring",
              stiffness: 180,
            }}
            className="
              mx-auto mb-5
              flex h-16 w-16
              items-center
              justify-center
              rounded-2xl
              bg-gradient-to-br
              from-indigo-100
              to-violet-100
              text-indigo-600
              shadow-sm
            "
          >
            <KeyRound
              size={29}
            />
          </motion.div>

          <div className="mb-2 flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600">
            <Sparkles
              size={15}
            />

            Student Assessment
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl lg:text-4xl">
            Join Assessment
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-500 sm:text-base">
            Enter the access code
            shared by your teacher
            to view the assessment.
          </p>
        </motion.div>

        {/* ========================= */}
        {/* FORM CARD */}
        {/* ========================= */}

        <motion.form
          initial={{
            opacity: 0,
            y: 25,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.12,
            duration: 0.45,
          }}
          onSubmit={handleSubmit}
          className="
            overflow-hidden
            rounded-3xl
            border border-gray-200/80
            bg-white/95
            shadow-xl
            shadow-gray-200/40
            backdrop-blur-sm
          "
        >
          {/* FORM */}

          <div className="p-5 sm:p-8">
            {/* Label */}

            <div className="mb-3 flex items-center justify-between">
              <label className="text-sm font-semibold text-gray-700">
                Test Access Code
              </label>

              <span className="text-xs font-medium text-gray-400">
                {accessCode.length}/6
              </span>
            </div>

            {/* ACCESS CODE BOX */}

            <div className="relative">
              <LockKeyhole
                size={19}
                className="
                  absolute
                  left-4 top-1/2
                  -translate-y-1/2
                  text-gray-400
                  sm:left-5
                "
              />

              <input
                autoFocus
                value={accessCode}
                onChange={
                  handleCodeChange
                }
                maxLength={6}
                placeholder="ABC123"
                autoComplete="off"
                className="
                  w-full rounded-2xl
                  border-2
                  border-gray-200
                  bg-gray-50/70
                  py-4
                  pl-12 pr-4
                  text-center
                  font-mono
                  text-xl
                  font-bold
                  uppercase
                  tracking-[0.25em]
                  text-gray-900
                  outline-none
                  transition
                  placeholder:text-gray-300
                  hover:border-gray-300
                  focus:border-indigo-500
                  focus:bg-white
                  focus:ring-4
                  focus:ring-indigo-500/10
                  sm:py-5
                  sm:pl-14
                  sm:text-2xl
                  sm:tracking-[0.4em]
                "
              />
            </div>

            {/* HELPER */}

            <p className="mt-3 text-center text-xs leading-5 text-gray-400">
              Access codes contain
              letters and numbers only.
            </p>

            {/* CODE PROGRESS */}

            <div className="mt-5 flex justify-center gap-2">
              {Array.from({
                length: 6,
              }).map((_, index) => (
                <motion.div
                  key={index}
                  animate={{
                    scale:
                      index <
                      accessCode.length
                        ? 1
                        : 0.9,

                    opacity:
                      index <
                      accessCode.length
                        ? 1
                        : 0.4,
                  }}
                  className={`h-1.5 flex-1 rounded-full transition sm:max-w-14 ${
                    index <
                    accessCode.length
                      ? "bg-indigo-500"
                      : "bg-gray-200"
                  }`}
                />
              ))}
            </div>

            {/* BUTTON */}

            <motion.button
              whileHover={
                loading
                  ? {}
                  : {
                      y: -1,
                    }
              }
              whileTap={
                loading
                  ? {}
                  : {
                      scale: 0.98,
                    }
              }
              disabled={
                loading
              }
              type="submit"
              className="
                mt-7 flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-gradient-to-r
                from-indigo-600
                to-violet-600
                py-3.5
                text-sm
                font-semibold
                text-white
                shadow-lg
                shadow-indigo-500/20
                transition
                hover:shadow-indigo-500/30
                disabled:cursor-not-allowed
                disabled:opacity-60
                sm:py-4
              "
            >
              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Checking Code...
                </>
              ) : (
                <>
                  Continue

                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </>
              )}
            </motion.button>
          </div>

          {/* ========================= */}
          {/* SECURITY INFO */}
          {/* ========================= */}

          <div className="border-t border-gray-100 bg-gray-50/70 p-5 sm:px-8 sm:py-6">
            <div className="flex gap-3">
              <div className="
                flex h-10 w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-indigo-50
                text-indigo-600
              ">
                <ShieldCheck
                  size={19}
                />
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700">
                  Timer won't start yet
                </p>

                <p className="mt-1 text-xs leading-5 text-gray-500 sm:text-sm sm:leading-6">
                  Joining an
                  assessment only
                  opens the
                  instruction page.
                  Your timer begins
                  when you click{" "}
                  <strong className="font-semibold text-gray-700">
                    Start Test
                  </strong>
                  .
                </p>
              </div>
            </div>
          </div>
        </motion.form>

        {/* ========================= */}
        {/* FEATURES */}
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
            delay: 0.25,
          }}
          className="
            mt-5 grid
            grid-cols-1
            gap-2
            sm:grid-cols-3
          "
        >
          <Feature
            text="Secure access"
          />

          <Feature
            text="Timed test"
          />

          <Feature
            text="Instant results"
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

// =========================
// SMALL FEATURE
// =========================

const Feature = ({
  text,
}) => (
  <div className="
    flex items-center
    justify-center gap-2
    rounded-xl
    border border-gray-100
    bg-white/70
    px-3 py-2.5
    text-xs
    font-medium
    text-gray-500
    backdrop-blur-sm
  ">
    <CheckCircle2
      size={14}
      className="text-emerald-500"
    />

    {text}
  </div>
);

export default JoinTest;