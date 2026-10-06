import { Link } from "react-router-dom";

import {
  ArrowRight,
  Brain,
  CheckCircle2,
  Code2,
  GraduationCap,
  Laptop,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

const LandingPage = () => {
  const features = [
    {
      icon: Code2,
      title: "Online Coding Tests",
      description:
        "Attempt coding assessments directly inside the platform with multiple programming languages.",
    },
    {
      icon: Brain,
      title: "AI Powered Hints",
      description:
        "Get smart hints when you're stuck without directly revealing the complete solution.",
    },
    {
      icon: Zap,
      title: "Instant Code Execution",
      description:
        "Run your code against test cases instantly using Judge0 powered code execution.",
    },
    {
      icon: ShieldCheck,
      title: "Secure Assessments",
      description:
        "Controlled assessments with scheduling, duration limits and submission tracking.",
    },
    {
      icon: Trophy,
      title: "Performance Results",
      description:
        "View test results, passed problems and detailed submission performance.",
    },
    {
      icon: Users,
      title: "Teacher Dashboard",
      description:
        "Teachers can create tests, manage problems and monitor student performance.",
    },
  ];

  const steps = [
    {
      number: "01",
      title: "Teacher Creates Test",
      description:
        "Teacher creates coding problems, test cases and assessment schedules.",
    },
    {
      number: "02",
      title: "Student Joins",
      description:
        "Students register and access available coding assessments.",
    },
    {
      number: "03",
      title: "Solve & Run Code",
      description:
        "Write, compile and test solutions directly inside the coding environment.",
    },
    {
      number: "04",
      title: "Submit & View Result",
      description:
        "Submit solutions and view automatically evaluated results.",
    },
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-[#070b14] text-white">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute left-[-150px] top-[-150px] h-[400px] w-[400px] rounded-full bg-violet-600/20 blur-[120px]" />

        <div className="absolute right-[-120px] top-[200px] h-[350px] w-[350px] rounded-full bg-blue-500/20 blur-[120px]" />

        <div className="absolute bottom-[-150px] left-[40%] h-[350px] w-[350px] rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>

      {/* NAVBAR */}
      <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[#070b14]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            to="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 shadow-lg shadow-violet-500/20">
              <Code2 size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold">
                Campus
                <span className="text-violet-400">
                  Arena
                </span>
              </h2>

              <p className="text-[10px] tracking-widest text-gray-500">
                CODE • COMPETE • GROW
              </p>
            </div>
          </Link>

          <div className="hidden items-center gap-8 text-sm text-gray-300 md:flex">
            <a
              href="#features"
              className="transition hover:text-white"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="transition hover:text-white"
            >
              How it works
            </a>

            <a
              href="#portal"
              className="transition hover:text-white"
            >
              Portal
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden rounded-lg px-4 py-2 text-sm text-gray-300 transition hover:text-white sm:block"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-gray-200"
            >
              Get Started
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative mx-auto flex min-h-screen max-w-7xl items-center px-6 pb-20 pt-32">
        <div className="grid w-full items-center gap-16 lg:grid-cols-2">
          {/* LEFT */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">
              <Sparkles size={15} />
              Smart Campus Coding Assessment Platform
            </div>

            <h1 className="max-w-3xl text-5xl font-bold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl">
              Code.
              <span className="block bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Compete.
              </span>
              Improve.
            </h1>

            <p className="mt-7 max-w-xl text-lg leading-8 text-gray-400">
              A complete coding assessment platform for
              students to solve programming challenges,
              execute code, receive AI hints and track
              performance.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/register"
                className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-7 py-3.5 font-semibold shadow-lg shadow-violet-600/20 transition hover:scale-[1.02]"
              >
                Start Coding

                <ArrowRight
                  size={18}
                  className="transition group-hover:translate-x-1"
                />
              </Link>

              <a
                href="#how-it-works"
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 font-semibold text-gray-200 transition hover:bg-white/10"
              >
                Explore Platform
              </a>
            </div>

            <div className="mt-9 flex flex-wrap gap-5 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle2
                  size={17}
                  className="text-green-400"
                />

                Judge0 Integration
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2
                  size={17}
                  className="text-green-400"
                />

                AI Hints
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2
                  size={17}
                  className="text-green-400"
                />

                Instant Results
              </div>
            </div>
          </div>

          {/* CODE CARD */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-violet-600/20 blur-[100px]" />

            <div className="relative rounded-3xl border border-white/10 bg-white/[0.04] p-3 shadow-2xl backdrop-blur-xl">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d111b]">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                  <div className="flex gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-400" />
                    <span className="h-3 w-3 rounded-full bg-yellow-400" />
                    <span className="h-3 w-3 rounded-full bg-green-400" />
                  </div>

                  <span className="text-xs text-gray-500">
                    main.cpp
                  </span>

                  <span className="rounded-md bg-green-500/10 px-2 py-1 text-xs text-green-400">
                    C++
                  </span>
                </div>

                <div className="p-6 font-mono text-sm leading-8">
                  <p>
                    <span className="text-purple-400">
                      #include
                    </span>{" "}
                    <span className="text-green-300">
                      &lt;bits/stdc++.h&gt;
                    </span>
                  </p>

                  <p>
                    <span className="text-purple-400">
                      using namespace
                    </span>{" "}
                    std;
                  </p>

                  <br />

                  <p>
                    <span className="text-blue-400">
                      int
                    </span>{" "}
                    main() {"{"}
                  </p>

                  <p className="pl-6">
                    vector&lt;
                    <span className="text-blue-400">
                      int
                    </span>
                    &gt; nums = {"{"}
                    2, 7, 11, 15
                    {"}"};
                  </p>

                  <p className="pl-6">
                    <span className="text-blue-400">
                      int
                    </span>{" "}
                    target = 9;
                  </p>

                  <br />

                  <p className="pl-6 text-gray-500">
                    // Solve the problem
                  </p>

                  <p className="pl-6">
                    <span className="text-purple-400">
                      return
                    </span>{" "}
                    0;
                  </p>

                  <p>{"}"}</p>
                </div>

                <div className="m-4 mt-0 rounded-xl border border-green-500/20 bg-green-500/5 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-400">
                        ✓ Accepted
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        All test cases passed
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        Runtime
                      </p>

                      <p className="text-sm font-semibold">
                        12 ms
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-5 hidden rounded-2xl border border-white/10 bg-[#111827]/90 p-4 shadow-xl backdrop-blur-xl sm:block">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500/10">
                  <Trophy
                    className="text-yellow-400"
                    size={20}
                  />
                </div>

                <div>
                  <p className="text-xs text-gray-400">
                    Assessment
                  </p>

                  <p className="font-semibold">
                    Completed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-10 md:grid-cols-4">
          {[
            ["Multiple", "Coding Problems"],
            ["10+", "Languages"],
            ["AI", "Smart Hints"],
            ["24/7", "Code Execution"],
          ].map(([value, label]) => (
            <div
              key={label}
              className="text-center"
            >
              <h3 className="text-3xl font-bold">
                {value}
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="mx-auto max-w-7xl px-6 py-28"
      >
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-300">
            Platform Features
          </div>

          <h2 className="text-4xl font-bold sm:text-5xl">
            Everything you need for
            <span className="text-violet-400">
              {" "}
              coding assessments
            </span>
          </h2>

          <p className="mt-5 text-gray-400">
            From coding challenges to automatic
            evaluation and performance tracking,
            everything is available in one platform.
          </p>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map(
            ({
              icon: Icon,
              title,
              description,
            }) => (
              <div
                key={title}
                className="group rounded-2xl border border-white/10 bg-white/[0.03] p-7 transition duration-300 hover:-translate-y-1 hover:border-violet-500/30 hover:bg-white/[0.05]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 text-violet-400 transition group-hover:scale-110">
                  <Icon size={23} />
                </div>

                <h3 className="mt-6 text-xl font-semibold">
                  {title}
                </h3>

                <p className="mt-3 leading-7 text-gray-400">
                  {description}
                </p>
              </div>
            ),
          )}
        </div>
      </section>

      {/* PORTALS */}
      <section
        id="portal"
        className="bg-white/[0.02] py-28"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-4xl font-bold">
              Access Your Portal
            </h2>

            <p className="mt-4 text-gray-400">
              Dedicated environments for students and
              teachers.
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-4xl gap-6 md:grid-cols-2">
            {/* STUDENT */}
            <div className="rounded-3xl border border-blue-500/20 bg-gradient-to-b from-blue-500/10 to-transparent p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-400">
                <Laptop size={27} />
              </div>

              <h3 className="mt-7 text-2xl font-bold">
                Student Portal
              </h3>

              <p className="mt-3 leading-7 text-gray-400">
                Register, attempt coding assessments,
                receive AI hints and track your test
                results.
              </p>

              <ul className="mt-6 space-y-3 text-sm text-gray-300">
                {[
                  "Coding assessments",
                  "AI powered hints",
                  "Instant code execution",
                  "Submission history",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex gap-2"
                  >
                    <CheckCircle2
                      size={18}
                      className="text-blue-400"
                    />

                    {item}
                  </li>
                ))}
              </ul>

              <Link
                to="/register"
                className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium transition hover:bg-blue-500"
              >
                Join as Student
                <ArrowRight size={17} />
              </Link>
            </div>

            {/* TEACHER */}
            <div className="rounded-3xl border border-violet-500/20 bg-gradient-to-b from-violet-500/10 to-transparent p-8">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-400">
                <GraduationCap size={29} />
              </div>

              <h3 className="mt-7 text-2xl font-bold">
                Teacher Portal
              </h3>

              <p className="mt-3 leading-7 text-gray-400">
                Create coding assessments, manage
                problems and monitor student
                submissions.
              </p>

              <ul className="mt-6 space-y-3 text-sm text-gray-300">
                {[
                  "Create assessments",
                  "Manage coding problems",
                  "Manage test cases",
                  "Student performance reports",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex gap-2"
                  >
                    <CheckCircle2
                      size={18}
                      className="text-violet-400"
                    />

                    {item}
                  </li>
                ))}
              </ul>

              {/* Teacher cannot register */}
              <Link
                to="/login"
                className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-medium transition hover:bg-violet-500"
              >
                Teacher Login
                <ArrowRight size={17} />
              </Link>

              <p className="mt-3 text-center text-xs text-gray-500">
                Teacher accounts are managed by the
                administrator.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="mx-auto max-w-7xl px-6 py-28"
      >
        <div className="text-center">
          <h2 className="text-4xl font-bold">
            How Campus Arena Works
          </h2>

          <p className="mt-4 text-gray-400">
            A simple workflow from assessment creation
            to final results.
          </p>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {steps.map(
            ({
              number,
              title,
              description,
            }) => (
              <div
                key={number}
                className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-6"
              >
                <p className="text-5xl font-black text-white/[0.06]">
                  {number}
                </p>

                <h3 className="mt-3 text-lg font-semibold">
                  {title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-400">
                  {description}
                </p>
              </div>
            ),
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-28">
        <div className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-gradient-to-r from-violet-600/20 via-blue-600/20 to-cyan-500/10 px-8 py-16 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.25),transparent_50%)]" />

          <div className="relative">
            <Sparkles className="mx-auto mb-5 text-violet-400" />

            <h2 className="text-4xl font-bold">
              Ready to enter the coding arena?
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-gray-400">
              Register as a student and start solving
              coding assessments.
            </p>

            <Link
              to="/register"
              className="mx-auto mt-8 flex w-fit items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-semibold text-black transition hover:scale-105"
            >
              Create Student Account
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-6 py-8 text-sm text-gray-500 md:flex-row">
          <div className="flex items-center gap-2">
            <Code2
              size={18}
              className="text-violet-400"
            />

            <span className="font-semibold text-gray-300">
              Campus Arena
            </span>
          </div>

          <p>
            © 2026 Campus Coding Arena. Built for
            campus developers.
          </p>

          <div className="flex gap-6">
            <a
              href="#features"
              className="hover:text-white"
            >
              Features
            </a>

            <a
              href="#portal"
              className="hover:text-white"
            >
              Portal
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;