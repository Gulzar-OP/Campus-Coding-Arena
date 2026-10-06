import { useState } from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Code2,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Zap,
} from "lucide-react";

import { motion } from "framer-motion";

import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";

const INITIAL_FORM = {
  name: "",
  email: "",
  password: "",
  rollNo: "",
  branch: "",
  year: "",
};

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10";

const Register = () => {
  const navigate = useNavigate();

  const { register } = useAuth();

  const [form, setForm] =
    useState(INITIAL_FORM);

  const [loading, setLoading] =
    useState(false);

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      toast.error(
        "Please enter your full name",
      );

      return false;
    }

    if (!form.email.trim()) {
      toast.error(
        "Please enter your email address",
      );

      return false;
    }
    if (!form.rollNo.trim()) {
      toast.error("Please enter your roll number");
      return false;
    }

    if (form.password.length < 6) {
      toast.error(
        "Password must be at least 6 characters",
      );

      return false;
    }

    if (!form.branch.trim()) {
      toast.error(
        "Please enter your branch",
      );

      return false;
    }

    if (!form.year) {
      toast.error(
        "Please select your year",
      );

      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      await register({
        name: form.name.trim(),

        email: form.email
          .trim()
          .toLowerCase(),

        password: form.password,
        rollNo: form.rollNo.trim(),
        branch: form.branch.trim(),

        year: Number(form.year),
      });

      toast.success(
        "Student account created successfully",
      );

      navigate("/student", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Register error:",
        error,
      );

      toast.error(
        error.response?.data?.message ||
          "Registration failed",
      );
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: BookOpen,
      title: "Coding Assessments",
      description:
        "Attempt teacher-assigned programming tests.",
    },
    {
      icon: Zap,
      title: "Instant Code Execution",
      description:
        "Run and evaluate solutions with Judge0.",
    },
    {
      icon: Sparkles,
      title: "AI Powered Hints",
      description:
        "Get useful hints without revealing answers.",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50">
      {/* Background */}

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-indigo-300/25 blur-[120px]" />

        <div className="absolute -bottom-40 right-0 h-[450px] w-[450px] rounded-full bg-violet-300/25 blur-[130px]" />

        <div className="absolute left-[55%] top-[20%] h-72 w-72 rounded-full bg-blue-200/20 blur-[110px]" />
      </div>

      <div className="relative flex min-h-screen">
        {/* ========================= */}
        {/* LEFT PANEL */}
        {/* ========================= */}

        <aside className="relative hidden w-[45%] overflow-hidden bg-[#080d18] text-white lg:flex">
          {/* Glow */}

          <div className="absolute inset-0">
            <div className="absolute -left-28 top-24 h-80 w-80 rounded-full bg-indigo-600/30 blur-[110px]" />

            <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-violet-600/20 blur-[120px]" />
          </div>

          {/* Grid */}

          <div
            className="
              absolute inset-0 opacity-[0.035]
              [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)]
              [background-size:42px_42px]
            "
          />

          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">
            {/* Brand */}

            <Link
              to="/"
              className="flex w-fit items-center gap-3"
            >
              <motion.div
                whileHover={{
                  rotate: 6,
                  scale: 1.05,
                }}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30"
              >
                <Code2 size={25} />
              </motion.div>

              <div>
                <h1 className="text-xl font-bold">
                  Campus
                  <span className="text-indigo-400">
                    Arena
                  </span>
                </h1>

                <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500">
                  Code • Compete • Grow
                </p>
              </div>
            </Link>

            {/* Main Content */}

            <motion.div
              initial={{
                opacity: 0,
                y: 30,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.6,
              }}
              className="max-w-lg"
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-4 py-2 text-sm text-indigo-300">
                <Sparkles size={15} />

                Student Coding Platform
              </div>

              <h2 className="text-4xl font-bold leading-[1.12] xl:text-5xl">
                Build your
                <span className="block bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  coding skills.
                </span>
                One test at a time.
              </h2>

              <p className="mt-5 max-w-md leading-7 text-slate-400">
                Join Campus Arena to attempt
                coding assessments, execute
                programs, receive AI-powered
                hints and track your progress.
              </p>

              <div className="mt-10 space-y-3">
                {features.map(
                  ({
                    icon: Icon,
                    title,
                    description,
                  }) => (
                    <div
                      key={title}
                      className="group flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 transition hover:border-indigo-400/20 hover:bg-white/[0.06]"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                        <Icon size={20} />
                      </div>

                      <div>
                        <p className="font-medium text-slate-200">
                          {title}
                        </p>

                        <p className="mt-0.5 text-xs leading-5 text-slate-500">
                          {description}
                        </p>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </motion.div>

            {/* Bottom */}

            <div className="flex items-center justify-between text-xs text-slate-600">
              <p>
                © 2026 Campus Coding Arena
              </p>

              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} />
                Secure Platform
              </div>
            </div>
          </div>
        </aside>

        {/* ========================= */}
        {/* RIGHT PANEL */}
        {/* ========================= */}

        <main className="relative flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <motion.div
            initial={{
              opacity: 0,
              y: 24,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
            }}
            className="w-full max-w-[520px]"
          >
            {/* Mobile Brand */}

            <div className="mb-8 flex lg:hidden">
              <Link
                to="/"
                className="flex items-center gap-3"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
                  <Code2 size={23} />
                </div>

                <div>
                  <h1 className="text-xl font-bold text-slate-950">
                    Campus
                    <span className="text-indigo-600">
                      Arena
                    </span>
                  </h1>

                  <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400">
                    Coding Assessment Platform
                  </p>
                </div>
              </Link>
            </div>

            {/* Heading */}

            <div className="mb-7">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-indigo-600">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
                  <UserPlus size={16} />
                </div>

                Student Registration
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Create your account
              </h1>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 sm:text-base">
                Register to access coding
                assessments and start solving
                problems.
              </p>
            </div>

            {/* Register Card */}

            <form
              onSubmit={handleSubmit}
              className="rounded-[28px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)] backdrop-blur-xl sm:p-7"
            >
              {/* Student Badge */}

              <div className="mb-6 flex items-center justify-between rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Student Account
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Registration is available
                    for students only
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                  <CheckCircle2 size={20} />
                </div>
              </div>

              {/* Name */}

              <div>
                <label
                  htmlFor="name"
                  className="text-sm font-semibold text-slate-700"
                >
                  Full Name
                </label>

                <input
                  id="name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  disabled={loading}
                  className={inputClass}
                />
              </div>
              <div className="mt-4">
                <label
                  htmlFor="rollNo"
                  className="text-sm font-semibold text-slate-700"
                >
                  Roll Number
                </label>

                <input
                  id="rollNo"
                  type="text"
                  name="rollNo"
                  value={form.rollNo}
                  onChange={handleChange}
                  placeholder="Enter your roll number"
                  disabled={loading}
                  className={inputClass}
                />
              </div>

              {/* Email */}

              <div className="mt-4">
                <label
                  htmlFor="email"
                  className="text-sm font-semibold text-slate-700"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={loading}
                  className={inputClass}
                />
              </div>

              {/* Password */}

              <div className="mt-4">
                <label
                  htmlFor="password"
                  className="text-sm font-semibold text-slate-700"
                >
                  Password
                </label>

                <div className="relative mt-2">
                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Minimum 6 characters"
                    autoComplete="new-password"
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3.5 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  />

                  <button
                    type="button"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    onClick={() =>
                      setShowPassword(
                        (prev) => !prev,
                      )
                    }
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* Branch + Year */}

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="branch"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Branch
                  </label>

                  <input
                    id="branch"
                    type="text"
                    name="branch"
                    value={form.branch}
                    onChange={handleChange}
                    placeholder="CSE AIML"
                    disabled={loading}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label
                    htmlFor="year"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Year
                  </label>

                  <select
                    id="year"
                    name="year"
                    value={form.year}
                    onChange={handleChange}
                    disabled={loading}
                    className={inputClass}
                  >
                    <option value="">
                      Select year
                    </option>

                    <option value="1">
                      1st Year
                    </option>

                    <option value="2">
                      2nd Year
                    </option>

                    <option value="3">
                      3rd Year
                    </option>

                    <option value="4">
                      4th Year
                    </option>
                  </select>
                </div>
              </div>

              {/* Submit */}

              <motion.button
                whileHover={
                  loading
                    ? {}
                    : {
                        scale: 1.01,
                      }
                }
                whileTap={
                  loading
                    ? {}
                    : {
                        scale: 0.985,
                      }
                }
                type="submit"
                disabled={loading}
                className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:shadow-xl hover:shadow-indigo-500/25 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />

                    Create Student Account

                    <ArrowRight
                      size={17}
                      className="transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </motion.button>

              {/* Login */}

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />

                <span className="text-xs text-slate-400">
                  Already have an account?
                </span>

                <div className="h-px flex-1 bg-slate-200" />
              </div>

              <Link
                to="/login"
                className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
              >
                Login to your account
              </Link>
            </form>

            {/* Footer Text */}

            <p className="mt-5 text-center text-xs leading-5 text-slate-400">
              By creating an account, you agree
              to Campus Arena&apos;s Terms &
              Privacy Policy.
            </p>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Register;