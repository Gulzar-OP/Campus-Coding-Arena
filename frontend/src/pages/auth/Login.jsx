import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import {
  ArrowRight,
  Braces,
  Code2,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

import { motion } from "framer-motion";

import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error("Email and password are required");

      return;
    }

    try {
      setLoading(true);

      const user = await login(form.email, form.password);

      toast.success("Login successful");

      if (user.role === "teacher" || user.role === "admin") {
        navigate("/teacher", {
          replace: true,
        });
      } else {
        navigate("/student", {
          replace: true,
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Code2,
      title: "Live Coding",
      text: "Write and execute code instantly",
    },
    {
      icon: Trophy,
      title: "Track Growth",
      text: "Monitor scores and performance",
    },
    {
      icon: ShieldCheck,
      title: "Secure Tests",
      text: "Reliable coding assessments",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f8fafc]">
      {/* Background Decorations */}

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-indigo-300/30 blur-3xl" />

        <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-violet-300/30 blur-3xl" />
      </div>

      <div className="relative flex min-h-screen">
        {/* ========================= */}
        {/* LEFT SECTION */}
        {/* ========================= */}

        <motion.div
          initial={{
            opacity: 0,
            x: -60,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: 0.7,
            ease: "easeOut",
          }}
          className="relative hidden w-[48%] overflow-hidden bg-[#090f1f] text-white lg:flex"
        >
          {/* Left Gradients */}

          <div className="absolute inset-0">
            <div className="absolute -left-20 top-20 h-72 w-72 rounded-full bg-indigo-600/30 blur-[100px]" />

            <div className="absolute bottom-10 right-0 h-72 w-72 rounded-full bg-violet-600/25 blur-[100px]" />

            <div className="absolute left-1/2 top-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[100px]" />
          </div>

          {/* Grid Background */}

          <div
            className="
              absolute inset-0 opacity-[0.05]
              [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)]
              [background-size:40px_40px]
            "
          />

          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">
            {/* Logo */}

            <Link to="/" className="flex w-fit items-center gap-3">
              <motion.div
                whileHover={{
                  rotate: 8,
                  scale: 1.05,
                }}
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30"
              >
                <Code2 size={25} />
              </motion.div>

              <div>
                <h1 className="text-xl font-bold tracking-tight">
                  Campus
                  <span className="text-indigo-400">Arena</span>
                </h1>

                <p className="text-[10px] uppercase tracking-[0.25em] text-gray-500">
                  Code • Compete • Grow
                </p>
              </div>
            </Link>

            {/* Main Content */}

            <div className="max-w-xl">
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
                  delay: 0.2,
                  duration: 0.6,
                }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-4 py-2 text-sm text-indigo-300"
              >
                <Sparkles size={15} />
                Campus Coding Platform
              </motion.div>

              <motion.h2
                initial={{
                  opacity: 0,
                  y: 30,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.3,
                  duration: 0.6,
                }}
                className="text-4xl font-bold leading-tight xl:text-5xl"
              >
                Build skills.
                <br />
                <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  Crack assessments.
                </span>
                <br />
                Grow faster.
              </motion.h2>

              <motion.p
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.4,
                  duration: 0.6,
                }}
                className="mt-5 max-w-md text-base leading-7 text-gray-400"
              >
                Practice coding, participate in campus assessments and track
                your performance from one powerful platform.
              </motion.p>

              {/* Feature Cards */}

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
                  delay: 0.5,
                  duration: 0.6,
                }}
                className="mt-10 grid gap-3 xl:grid-cols-3"
              >
                {features.map(({ icon: Icon, title, text }) => (
                  <motion.div
                    key={title}
                    whileHover={{
                      y: -4,
                    }}
                    className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur-md"
                  >
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                      <Icon size={18} />
                    </div>

                    <p className="text-sm font-semibold">{title}</p>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      {text}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Bottom */}

            <div className="flex items-center justify-between text-xs text-gray-500">
              <p>© 2026 Campus Coding Arena</p>

              <div className="flex items-center gap-2">
                <Users size={14} />
                Built for campuses
              </div>
            </div>
          </div>
        </motion.div>

        {/* ========================= */}
        {/* RIGHT SECTION */}
        {/* ========================= */}

        <div className="relative flex flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <motion.div
            initial={{
              opacity: 0,
              y: 35,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            transition={{
              duration: 0.65,
              ease: "easeOut",
            }}
            className="w-full max-w-[460px]"
          >
            {/* Mobile Logo */}

            <div className="mb-10 flex items-center justify-between lg:hidden">
              <Link to="/" className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
                  <Code2 size={23} />
                </div>

                <div>
                  <h1 className="text-xl font-bold">
                    Campus
                    <span className="text-indigo-600">Arena</span>
                  </h1>

                  <p className="text-[9px] uppercase tracking-[0.2em] text-gray-400">
                    Coding Platform
                  </p>
                </div>
              </Link>
            </div>

            {/* Heading */}

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
              className="mb-8"
            >
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-indigo-600">
                <Braces size={17} />
                Welcome back
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
                Login to your account
              </h1>

              <p className="mt-3 text-sm leading-6 text-gray-500 sm:text-base">
                Enter your credentials below to continue your coding journey.
              </p>
            </motion.div>

            {/* Form */}

            <motion.form
              onSubmit={handleSubmit}
              initial={{
                opacity: 0,
                y: 25,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.25,
                duration: 0.5,
              }}
              className="rounded-[28px] border border-gray-200/80 bg-white/90 p-6 shadow-[0_20px_70px_-30px_rgba(15,23,42,0.3)] backdrop-blur-xl sm:p-8"
            >
              {/* Email */}

              <div>
                <label
                  htmlFor="email"
                  className="text-sm font-semibold text-gray-700"
                >
                  Email address
                </label>

                <div className="group relative mt-2">
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="
                      w-full rounded-xl border border-gray-200
                      bg-gray-50/70 px-4 py-3.5
                      text-sm text-gray-900 outline-none
                      transition-all duration-200
                      placeholder:text-gray-400
                      hover:border-gray-300
                      focus:border-indigo-500
                      focus:bg-white
                      focus:ring-4
                      focus:ring-indigo-500/10
                    "
                  />
                </div>
              </div>

              {/* Password */}

              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-gray-700"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-xs font-medium text-indigo-600 transition hover:text-indigo-700"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative mt-2">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="
                      w-full rounded-xl border border-gray-200
                      bg-gray-50/70 px-4 py-3.5 pr-12
                      text-sm text-gray-900 outline-none
                      transition-all duration-200
                      placeholder:text-gray-400
                      hover:border-gray-300
                      focus:border-indigo-500
                      focus:bg-white
                      focus:ring-4
                      focus:ring-indigo-500/10
                    "
                  />

                  <motion.button
                    whileTap={{
                      scale: 0.9,
                    }}
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </motion.button>
                </div>
              </div>

              {/* Login Button */}

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
                        scale: 0.98,
                      }
                }
                type="submit"
                disabled={loading}
                className="
                  group mt-7 flex w-full items-center
                  justify-center gap-2 rounded-xl
                  bg-gradient-to-r from-indigo-600
                  to-violet-600 px-4 py-3.5
                  text-sm font-semibold text-white
                  shadow-lg shadow-indigo-500/20
                  transition
                  hover:shadow-indigo-500/30
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    Sign in
                    <ArrowRight
                      size={17}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </>
                )}
              </motion.button>

              {/* Divider */}

              <div className="my-7 flex items-center gap-3">
                <div className="h-px flex-1 bg-gray-200" />

                <span className="text-xs text-gray-400">
                  New to Campus Arena?
                </span>

                <div className="h-px flex-1 bg-gray-200" />
              </div>

              {/* Register */}

              <Link
                to="/register"
                className="
                  flex w-full items-center
                  justify-center gap-2 rounded-xl
                  border border-gray-200
                  bg-white py-3.5
                  text-sm font-semibold
                  text-gray-700
                  transition-all duration-200
                  hover:border-indigo-200
                  hover:bg-indigo-50
                  hover:text-indigo-700
                "
              >
                Create a new account
              </Link>
            </motion.form>

            {/* Footer */}

            <p className="mt-6 text-center text-xs leading-5 text-gray-400">
              By continuing, you agree to Campus Arena's{" "}
              <span className="cursor-pointer text-gray-600 hover:text-indigo-600">
                Terms
              </span>{" "}
              and{" "}
              <span className="cursor-pointer text-gray-600 hover:text-indigo-600">
                Privacy Policy
              </span>
              .
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;