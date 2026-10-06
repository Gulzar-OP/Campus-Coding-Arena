import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  Plus,
  X,
  Search,
  ClipboardList,
  Clock3,
  CalendarDays,
  Brain,
  FileCode2,
  ArrowLeft,
  Save,
  Sparkles,
  CheckCircle2,
  Trophy,
  Hash,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import toast from "react-hot-toast";

import api from "../../services/api";

const CreateTest = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [problems, setProblems] = useState([]);

  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    duration: 60,
    startTime: "",
    endTime: "",
    maxAIPrompts: 3,
    selectedProblems: [],
  });

  // =========================
  // FETCH PROBLEMS
  // =========================

  const fetchProblems = async () => {
    try {
      const response = await api.get("/problems/teacher/my");
      setProblems(response.data.problems || []);
    } catch (error) {
      console.error(error);

      toast.error("Failed to load problems");
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  // =========================
  // FILTER PROBLEMS
  // =========================

  const filteredProblems = useMemo(() => {
    return problems.filter((problem) =>
      problem.title.toLowerCase().includes(search.toLowerCase()),
    );
  }, [problems, search]);

  // =========================
  // ADD PROBLEM
  // =========================

  const addProblem = (problem) => {
    const alreadyAdded = form.selectedProblems.some(
      (item) => item.problem._id === problem._id,
    );

    if (alreadyAdded) {
      toast.error("Problem already added");

      return;
    }

    setForm((prev) => ({
      ...prev,

      selectedProblems: [
        ...prev.selectedProblems,
        {
          problem,
          marks: 10,
        },
      ],
    }));
  };

  // =========================
  // REMOVE PROBLEM
  // =========================

  const removeProblem = (id) => {
    setForm((prev) => ({
      ...prev,

      selectedProblems: prev.selectedProblems.filter(
        (item) => item.problem._id !== id,
      ),
    }));
  };

  // =========================
  // UPDATE MARKS
  // =========================

  const updateMarks = (id, marks) => {
    setForm((prev) => ({
      ...prev,

      selectedProblems: prev.selectedProblems.map((item) =>
        item.problem._id === id
          ? {
              ...item,
              marks: Number(marks),
            }
          : item,
      ),
    }));
  };

  // =========================
  // TOTAL MARKS
  // =========================

  const totalMarks = form.selectedProblems.reduce(
    (sum, item) => sum + Number(item.marks || 0),
    0,
  );

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.selectedProblems.length === 0) {
      toast.error("Add at least one problem");

      return;
    }

    if (
      form.endTime &&
      form.startTime &&
      new Date(form.endTime) <= new Date(form.startTime)
    ) {
      toast.error("End time must be after start time");

      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: form.title,

        description: form.description,

        duration: Number(form.duration),

        startTime: form.startTime,

        endTime: form.endTime,

        maxAIPrompts: Number(form.maxAIPrompts),

        problems: form.selectedProblems.map((item) => ({
          problem: item.problem._id,

          marks: Number(item.marks),
        })),
      };

      const response = await api.post("/tests", payload);
      console.log(response.data)

      toast.success(`Test created. Code: ${response.data.test.accessCode}`);

      navigate("/teacher/tests");
    } catch (error) {
      console.log("CREATE TEST ERROR:", error);
      console.log("BACKEND DATA:", error.response?.data);
      console.log("STATUS:", error.response?.status);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to create test",
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // STYLES
  // =========================

  const inputClass = `
    mt-2 w-full rounded-xl
    border border-gray-200
    bg-gray-50/70
    px-4 py-3
    text-sm text-gray-900
    outline-none transition
    placeholder:text-gray-400
    hover:border-gray-300
    focus:border-indigo-500
    focus:bg-white
    focus:ring-4
    focus:ring-indigo-500/10
  `;

  const sectionClass = `
    rounded-2xl
    border border-gray-200/80
    bg-white
    p-5 sm:p-6
    shadow-sm
  `;

  const difficultyStyle = (difficulty) => {
    if (difficulty === "Easy") {
      return "bg-emerald-50 text-emerald-600 border-emerald-100";
    }

    if (difficulty === "Medium") {
      return "bg-amber-50 text-amber-600 border-amber-100";
    }

    return "bg-red-50 text-red-600 border-red-100";
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
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
      className="mx-auto w-full max-w-[1500px] pb-12"
    >
      {/* ========================= */}
      {/* HEADER */}
      {/* ========================= */}

      <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
        <div>
          <button
            type="button"
            onClick={() => navigate("/teacher/tests")}
            className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-indigo-600"
          >
            <ArrowLeft size={16} />
            Back to Tests
          </button>

          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-indigo-600">
            <Sparkles size={16} />
            Assessment Builder
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl lg:text-4xl">
            Create New Test
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
            Build a coding assessment, configure schedule and select problems
            for your students.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate("/teacher/tests")}
            className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            Cancel
          </button>

          <motion.button
            whileTap={{
              scale: 0.98,
            }}
            disabled={loading}
            type="submit"
            className="
              flex items-center
              justify-center gap-2
              rounded-xl
              bg-gradient-to-r
              from-indigo-600
              to-violet-600
              px-6 py-3
              text-sm font-semibold
              text-white
              shadow-lg
              shadow-indigo-500/20
              transition
              hover:shadow-indigo-500/30
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {loading ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Creating...
              </>
            ) : (
              <>
                <Save size={17} />
                Create Test
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* ========================= */}
      {/* SUMMARY CARDS */}
      {/* ========================= */}

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <motion.div
          whileHover={{
            y: -3,
          }}
          className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 sm:text-sm">Problems</p>

              <p className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl">
                {form.selectedProblems.length}
              </p>
            </div>

            <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 sm:flex">
              <FileCode2 size={19} />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{
            y: -3,
          }}
          className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 sm:text-sm">Total Marks</p>

              <p className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl">
                {totalMarks}
              </p>
            </div>

            <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 sm:flex">
              <Trophy size={19} />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{
            y: -3,
          }}
          className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 sm:text-sm">Duration</p>

              <p className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl">
                {form.duration}m
              </p>
            </div>

            <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 sm:flex">
              <Clock3 size={19} />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{
            y: -3,
          }}
          className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 sm:text-sm">AI Prompts</p>

              <p className="mt-1 text-xl font-bold text-gray-900 sm:text-2xl">
                {form.maxAIPrompts}
              </p>
            </div>

            <div className="hidden h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 sm:flex">
              <Brain size={19} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* ========================= */}
      {/* BASIC + SETTINGS */}
      {/* ========================= */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* BASIC */}

        <motion.section
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.08,
          }}
          className={sectionClass}
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <ClipboardList size={21} />
            </div>

            <div>
              <h2 className="font-bold text-gray-900">Basic Information</h2>

              <p className="text-xs text-gray-500">
                General assessment details
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Test Title
            </label>

            <input
              required
              value={form.title}
              onChange={(e) =>
                setForm({
                  ...form,
                  title: e.target.value,
                })
              }
              placeholder="e.g. Capgemini Coding Round 1"
              className={inputClass}
            />
          </div>

          <div className="mt-5">
            <label className="text-sm font-semibold text-gray-700">
              Description
            </label>

            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
              placeholder="Describe the purpose and instructions for this assessment..."
              className={`${inputClass} min-h-36 resize-y leading-6`}
            />
          </div>
        </motion.section>

        {/* SETTINGS */}

        <motion.section
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            delay: 0.12,
          }}
          className={sectionClass}
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
              <Brain size={21} />
            </div>

            <div>
              <h2 className="font-bold text-gray-900">Assessment Settings</h2>

              <p className="text-xs text-gray-500">
                Control duration and AI usage
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Duration
            </label>

            <div className="relative">
              <Clock3
                size={17}
                className="absolute left-4 top-1/2 mt-1 -translate-y-1/2 text-gray-400"
              />

              <input
                type="number"
                min="1"
                required
                value={form.duration}
                onChange={(e) =>
                  setForm({
                    ...form,
                    duration: e.target.value,
                  })
                }
                className={`${inputClass} pl-11 pr-20`}
              />

              <span className="absolute right-4 top-1/2 mt-1 -translate-y-1/2 text-xs text-gray-400">
                minutes
              </span>
            </div>
          </div>

          <div className="mt-5">
            <label className="text-sm font-semibold text-gray-700">
              Max AI Prompts
            </label>

            <select
              value={form.maxAIPrompts}
              onChange={(e) =>
                setForm({
                  ...form,
                  maxAIPrompts: e.target.value,
                })
              }
              className={inputClass}
            >
              <option value="0">0 — Disabled</option>

              <option value="1">1 Prompt</option>

              <option value="2">2 Prompts</option>

              <option value="3">3 Prompts</option>
            </select>

            <p className="mt-2 text-xs leading-5 text-gray-400">
              Maximum number of AI hints a student can request during the
              assessment.
            </p>
          </div>
        </motion.section>
      </div>

      {/* ========================= */}
      {/* SCHEDULE */}
      {/* ========================= */}

      <motion.section
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.16,
        }}
        className={`${sectionClass} mt-6`}
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
            <CalendarDays size={21} />
          </div>

          <div>
            <h2 className="font-bold text-gray-900">Test Schedule</h2>

            <p className="text-xs text-gray-500">
              Decide when students can access the test
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-gray-700">
              Start Date & Time
            </label>

            <input
              type="datetime-local"
              required
              value={form.startTime}
              onChange={(e) =>
                setForm({
                  ...form,
                  startTime: e.target.value,
                })
              }
              className={inputClass}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              End Date & Time
            </label>

            <input
              type="datetime-local"
              required
              value={form.endTime}
              onChange={(e) =>
                setForm({
                  ...form,
                  endTime: e.target.value,
                })
              }
              className={inputClass}
            />
          </div>
        </div>
      </motion.section>

      {/* ========================= */}
      {/* PROBLEM SELECTOR */}
      {/* ========================= */}

      <motion.section
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
        }}
        className={`${sectionClass} mt-6`}
      >
        {/* Header */}

        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <FileCode2 size={21} />
            </div>

            <div>
              <h2 className="font-bold text-gray-900">Add Problems</h2>

              <p className="text-xs text-gray-500">
                Select problems from your problem bank
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600">
              {form.selectedProblems.length} selected
            </span>

            <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600">
              {totalMarks} marks
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* ===================== */}
          {/* AVAILABLE */}
          {/* ===================== */}

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">
                Problem Bank
              </h3>

              <span className="text-xs text-gray-400">
                {filteredProblems.length} problems
              </span>
            </div>

            {/* Search */}

            <div className="relative mb-4">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search problem..."
                className={`${inputClass} mt-0 pl-11`}
              />
            </div>

            {/* Problem List */}

            <div className="max-h-[500px] space-y-3 overflow-y-auto pr-1">
              {filteredProblems.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 p-10 text-center">
                  <Search size={28} className="mx-auto text-gray-300" />

                  <p className="mt-3 text-sm font-medium text-gray-500">
                    No problems found
                  </p>
                </div>
              ) : (
                filteredProblems.map((problem, index) => {
                  const isSelected = form.selectedProblems.some(
                    (item) => item.problem._id === problem._id,
                  );

                  return (
                    <motion.div
                      key={problem._id}
                      initial={{
                        opacity: 0,
                        y: 10,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: index * 0.025,
                      }}
                      className={`
                          group flex
                          items-center
                          justify-between
                          gap-4
                          rounded-xl
                          border p-4
                          transition
                          ${
                            isSelected
                              ? "border-indigo-200 bg-indigo-50/60"
                              : "border-gray-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/30"
                          }
                        `}
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {problem.title}
                          </p>

                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${difficultyStyle(
                              problem.difficulty,
                            )}`}
                          >
                            {problem.difficulty}
                          </span>
                        </div>

                        <p className="mt-1 truncate text-xs text-gray-400">
                          {problem.topic || "No topic"}
                        </p>
                      </div>

                      <motion.button
                        type="button"
                        whileTap={{
                          scale: 0.9,
                        }}
                        onClick={() => addProblem(problem)}
                        disabled={isSelected}
                        className={`
                            flex h-9 w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            transition
                            ${
                              isSelected
                                ? "cursor-default bg-emerald-50 text-emerald-600"
                                : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                            }
                          `}
                      >
                        {isSelected ? (
                          <CheckCircle2 size={17} />
                        ) : (
                          <Plus size={17} />
                        )}
                      </motion.button>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* ===================== */}
          {/* SELECTED */}
          {/* ===================== */}

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">
                Selected Problems
              </h3>

              <span className="text-xs text-gray-400">Configure marks</span>
            </div>

            {form.selectedProblems.length === 0 ? (
              <div className="flex min-h-[250px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center">
                <FileCode2 size={38} className="text-gray-300" />

                <h3 className="mt-4 font-semibold text-gray-700">
                  No problems selected
                </h3>

                <p className="mt-1 max-w-xs text-sm leading-6 text-gray-400">
                  Select problems from your problem bank to build this
                  assessment.
                </p>
              </div>
            ) : (
              <div className="max-h-[560px] space-y-3 overflow-y-auto pr-1">
                <AnimatePresence>
                  {form.selectedProblems.map((item, index) => (
                    <motion.div
                      key={item.problem._id}
                      initial={{
                        opacity: 0,
                        y: 10,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        x: 30,
                      }}
                      className="rounded-xl border border-gray-200 bg-white p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-xs font-bold text-indigo-600">
                            {index + 1}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-gray-900">
                              {item.problem.title}
                            </p>

                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${difficultyStyle(
                                  item.problem.difficulty,
                                )}`}
                              >
                                {item.problem.difficulty}
                              </span>

                              <span className="text-xs text-gray-400">
                                {item.problem.topic || "No topic"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <motion.button
                          whileTap={{
                            scale: 0.9,
                          }}
                          type="button"
                          onClick={() => removeProblem(item.problem._id)}
                          className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                        >
                          <X size={17} />
                        </motion.button>
                      </div>

                      {/* Marks */}

                      <div className="mt-4 border-t border-gray-100 pt-4">
                        <label className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                          <Hash size={14} />
                          Marks
                        </label>

                        <input
                          type="number"
                          min="0"
                          value={item.marks}
                          onChange={(e) =>
                            updateMarks(item.problem._id, e.target.value)
                          }
                          className={`${inputClass} py-2.5`}
                        />
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {/* ========================= */}
      {/* BOTTOM ACTIONS */}
      {/* ========================= */}

      <div className="mt-6 flex flex-col-reverse justify-end gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => navigate("/teacher/tests")}
          className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
        >
          Cancel
        </button>

        <motion.button
          whileTap={{
            scale: 0.98,
          }}
          disabled={loading}
          type="submit"
          className="
            flex items-center
            justify-center gap-2
            rounded-xl
            bg-gradient-to-r
            from-indigo-600
            to-violet-600
            px-7 py-3
            text-sm font-semibold
            text-white
            shadow-lg
            shadow-indigo-500/20
            transition
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          {loading ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Creating Test...
            </>
          ) : (
            <>
              <Save size={17} />
              Create Test
            </>
          )}
        </motion.button>
      </div>
    </motion.form>
  );
};

export default CreateTest;
