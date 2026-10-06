import { useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  Plus,
  Trash2,
  FileCode2,
  AlignLeft,
  Braces,
  Cpu,
  FlaskConical,
  ArrowLeft,
  Save,
  Clock3,
  MemoryStick,
  Building2,
  Tag,
  Sparkles,
  EyeOff,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import toast from "react-hot-toast";

import api from "../../services/api";

const emptyTestCase = {
  input: "",
  expectedOutput: "",
  isHidden: false,
};

const CreateProblem = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    topic: "",
    difficulty: "Easy",

    description: "",
    timeComplexity: "",
    spaceComplexity: "",

    tags: "",

    languages: ["C++", "Java", "Python", "JavaScript"],

    inputFormat: "",
    outputFormat: "",

    constraints: "",

    companies: "",

    timeLimit: 2,
    memoryLimit: 256,

    testCases: [
      {
        ...emptyTestCase,
      },
    ],
  });

  // =========================
  // NORMAL INPUT CHANGE
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // TEST CASE CHANGE
  // =========================

  const handleTestCaseChange = (index, field, value) => {
    const updated = [...form.testCases];

    updated[index] = {
      ...updated[index],
      [field]: value,
    };

    setForm((prev) => ({
      ...prev,
      testCases: updated,
    }));
  };

  // =========================
  // ADD TEST CASE
  // =========================

  const addTestCase = () => {
    setForm((prev) => ({
      ...prev,

      testCases: [
        ...prev.testCases,
        {
          ...emptyTestCase,
        },
      ],
    }));
  };

  // =========================
  // REMOVE TEST CASE
  // =========================

  const removeTestCase = (index) => {
    if (form.testCases.length === 1) {
      toast.error("At least one test case is required");

      return;
    }

    setForm((prev) => ({
      ...prev,

      testCases: prev.testCases.filter((_, i) => i !== index),
    }));
  };

  // =========================
  // SUBMIT
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = {
        title: form.title.trim(),

        topic: form.topic.trim(),

        difficulty: form.difficulty,

        description: form.description.trim(),
        timeComplexity: form.timeComplexity.trim(),
        spaceComplexity: form.spaceComplexity.trim(),

        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),

        languages: form.languages,

        inputFormat: form.inputFormat,

        outputFormat: form.outputFormat,

        constraints: form.constraints
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),

        companies: form.companies
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),

        timeLimit: Number(form.timeLimit),

        memoryLimit: Number(form.memoryLimit),

        testCases: form.testCases,
      };

      await api.post("/problems", payload);

      toast.success("Problem created successfully");

      navigate("/teacher/problems");
    } catch (error) {
      toast.error(error.response?.data?.message || "Problem creation failed");
    } finally {
      setLoading(false);
    }
  };

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
            onClick={() => navigate("/teacher/problems")}
            className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-indigo-600"
          >
            <ArrowLeft size={16} />
            Back to Problems
          </button>

          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-indigo-600">
            <Sparkles size={16} />
            Problem Builder
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl lg:text-4xl">
            Add New Problem
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
            Create a coding problem with description, constraints, execution
            settings and test cases.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate("/teacher/problems")}
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
              flex items-center justify-center gap-2
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
                Create Problem
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* ========================= */}
      {/* BASIC INFO + DESCRIPTION */}
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
              <FileCode2 size={21} />
            </div>

            <div>
              <h2 className="font-bold text-gray-900">Basic Information</h2>

              <p className="text-xs text-gray-500">General problem details</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Problem Title
            </label>

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="e.g. Two Sum"
              className={inputClass}
            />
          </div>

          <div className="mt-5">
            <label className="text-sm font-semibold text-gray-700">Topic</label>

            <input
              name="topic"
              value={form.topic}
              onChange={handleChange}
              required
              placeholder="e.g. Arrays & Hashing"
              className={inputClass}
            />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-semibold text-gray-700">
                Difficulty
              </label>

              <select
                name="difficulty"
                value={form.difficulty}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="Easy">Easy</option>

                <option value="Medium">Medium</option>

                <option value="Hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700">
                Tags
              </label>

              <div className="relative">
                <Tag
                  size={16}
                  className="absolute left-4 top-1/2 mt-1 -translate-y-1/2 text-gray-400"
                />

                <input
                  name="tags"
                  value={form.tags}
                  onChange={handleChange}
                  placeholder="Array, Hashing"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
          </div>

          <p className="mt-2 text-xs text-gray-400">
            Separate multiple tags using commas.
          </p>
        </motion.section>

        {/* DESCRIPTION */}

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
              <AlignLeft size={21} />
            </div>

            <div>
              <h2 className="font-bold text-gray-900">Problem Description</h2>

              <p className="text-xs text-gray-500">
                Explain the problem clearly
              </p>
            </div>
          </div>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            placeholder="Describe the coding problem, requirements and examples..."
            className={`${inputClass} min-h-[280px] resize-y leading-6`}
          />
        </motion.section>
      </div>

      {/* ========================= */}
      {/* INPUT / OUTPUT + CONSTRAINTS */}
      {/* ========================= */}

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* IO */}

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
          className={sectionClass}
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
              <Braces size={21} />
            </div>

            <div>
              <h2 className="font-bold text-gray-900">Input / Output</h2>

              <p className="text-xs text-gray-500">Define data format</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Input Format
            </label>

            <textarea
              name="inputFormat"
              value={form.inputFormat}
              onChange={handleChange}
              placeholder="Describe the input format..."
              className={`${inputClass} min-h-28 resize-y`}
            />
          </div>

          <div className="mt-5">
            <label className="text-sm font-semibold text-gray-700">
              Output Format
            </label>

            <textarea
              name="outputFormat"
              value={form.outputFormat}
              onChange={handleChange}
              placeholder="Describe the expected output format..."
              className={`${inputClass} min-h-28 resize-y`}
            />
          </div>
        </motion.section>

        {/* CONSTRAINTS */}

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
          className={sectionClass}
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
              <Cpu size={21} />
            </div>

            <div>
              <h2 className="font-bold text-gray-900">Constraints</h2>

              <p className="text-xs text-gray-500">One constraint per line</p>
            </div>
          </div>

          <textarea
            name="constraints"
            value={form.constraints}
            onChange={handleChange}
            placeholder={"2 <= n <= 100000\n-10^9 <= nums[i] <= 10^9"}
            className={`${inputClass} min-h-[245px] resize-y font-mono text-sm`}
          />

          <p className="mt-3 text-xs text-gray-400">
            Each new line will be converted into a separate constraint.
          </p>
          {/* EXPECTED COMPLEXITY */}

          <div className="mt-5 border-t border-gray-100 pt-5">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-gray-900">
                Expected Complexity
              </h3>

              <p className="mt-1 text-xs text-gray-400">
                Optional. Tell students the expected time and space complexity.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Time Complexity
                </label>

                <div className="relative">
                  <Clock3
                    size={16}
                    className="absolute left-4 top-1/2 mt-1 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    name="timeComplexity"
                    value={form.timeComplexity}
                    onChange={handleChange}
                    placeholder="e.g. O(n), O(log n)"
                    className={`${inputClass} pl-10 font-mono`}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Space Complexity
                </label>

                <div className="relative">
                  <MemoryStick
                    size={16}
                    className="absolute left-4 top-1/2 mt-1 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    name="spaceComplexity"
                    value={form.spaceComplexity}
                    onChange={handleChange}
                    placeholder="e.g. O(1), O(n)"
                    className={`${inputClass} pl-10 font-mono`}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </div>

      {/* ========================= */}
      {/* EXECUTION SETTINGS */}
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
          delay: 0.24,
        }}
        className={`${sectionClass} mt-6`}
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Cpu size={21} />
          </div>

          <div>
            <h2 className="font-bold text-gray-900">Execution Settings</h2>

            <p className="text-xs text-gray-500">
              Configure code execution limits
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Time */}

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Time Limit
            </label>

            <div className="relative">
              <Clock3
                size={17}
                className="absolute left-4 top-1/2 mt-1 -translate-y-1/2 text-gray-400"
              />

              <input
                type="number"
                name="timeLimit"
                min="1"
                value={form.timeLimit}
                onChange={handleChange}
                className={`${inputClass} pl-11`}
              />
            </div>

            <p className="mt-1 text-xs text-gray-400">In seconds</p>
          </div>

          {/* Memory */}

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Memory Limit
            </label>

            <div className="relative">
              <MemoryStick
                size={17}
                className="absolute left-4 top-1/2 mt-1 -translate-y-1/2 text-gray-400"
              />

              <input
                type="number"
                name="memoryLimit"
                min="1"
                value={form.memoryLimit}
                onChange={handleChange}
                className={`${inputClass} pl-11`}
              />
            </div>

            <p className="mt-1 text-xs text-gray-400">In MB</p>
          </div>

          {/* Companies */}

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Companies
            </label>

            <div className="relative">
              <Building2
                size={17}
                className="absolute left-4 top-1/2 mt-1 -translate-y-1/2 text-gray-400"
              />

              <input
                name="companies"
                value={form.companies}
                onChange={handleChange}
                placeholder="Amazon, Capgemini"
                className={`${inputClass} pl-11`}
              />
            </div>

            <p className="mt-1 text-xs text-gray-400">Separate with comma</p>
          </div>
        </div>
      </motion.section>

      {/* ========================= */}
      {/* TEST CASES */}
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
          delay: 0.28,
        }}
        className={`${sectionClass} mt-6`}
      >
        {/* Header */}

        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pink-50 text-pink-600">
              <FlaskConical size={21} />
            </div>

            <div>
              <h2 className="font-bold text-gray-900">Test Cases</h2>

              <p className="text-xs text-gray-500">
                Add sample and hidden test cases
              </p>
            </div>
          </div>

          <motion.button
            type="button"
            onClick={addTestCase}
            whileTap={{
              scale: 0.97,
            }}
            className="flex w-fit items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100"
          >
            <Plus size={17} />
            Add Test Case
          </motion.button>
        </div>

        {/* Cases */}

        <div className="space-y-4">
          <AnimatePresence>
            {form.testCases.map((testCase, index) => (
              <motion.div
                key={index}
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  x: -20,
                }}
                transition={{
                  duration: 0.25,
                }}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50/40"
              >
                {/* Test Header */}

                <div className="flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600">
                      {index + 1}
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        Test Case {index + 1}
                      </h3>

                      <p className="text-xs text-gray-400">
                        {testCase.isHidden
                          ? "Hidden test case"
                          : "Visible sample"}
                      </p>
                    </div>
                  </div>

                  <motion.button
                    type="button"
                    whileTap={{
                      scale: 0.9,
                    }}
                    onClick={() => removeTestCase(index)}
                    className="rounded-lg p-2 text-red-500 transition hover:bg-red-50"
                    title="Delete test case"
                  >
                    <Trash2 size={17} />
                  </motion.button>
                </div>

                {/* Inputs */}

                <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">
                      Input
                    </label>

                    <textarea
                      value={testCase.input}
                      onChange={(e) =>
                        handleTestCaseChange(index, "input", e.target.value)
                      }
                      required
                      placeholder={"2 7 11 15\n9"}
                      className={`${inputClass} min-h-32 resize-y font-mono`}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-700">
                      Expected Output
                    </label>

                    <textarea
                      value={testCase.expectedOutput}
                      onChange={(e) =>
                        handleTestCaseChange(
                          index,
                          "expectedOutput",
                          e.target.value,
                        )
                      }
                      required
                      placeholder="[0, 1]"
                      className={`${inputClass} min-h-32 resize-y font-mono`}
                    />
                  </div>
                </div>

                {/* Hidden */}

                <div className="border-t border-gray-200 bg-white px-5 py-4">
                  <label className="flex cursor-pointer items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                          testCase.isHidden
                            ? "bg-violet-50 text-violet-600"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        <EyeOff size={17} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-700">
                          Hidden Test Case
                        </p>

                        <p className="text-xs text-gray-400">
                          Student won't see this test case
                        </p>
                      </div>
                    </div>

                    {/* Toggle */}

                    <button
                      type="button"
                      onClick={() =>
                        handleTestCaseChange(
                          index,
                          "isHidden",
                          !testCase.isHidden,
                        )
                      }
                      className={`relative h-6 w-11 rounded-full transition ${
                        testCase.isHidden ? "bg-indigo-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-all ${
                          testCase.isHidden ? "left-6" : "left-1"
                        }`}
                      />
                    </button>
                  </label>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.section>

      {/* ========================= */}
      {/* BOTTOM ACTIONS */}
      {/* ========================= */}

      <div className="mt-6 flex flex-col-reverse justify-end gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => navigate("/teacher/problems")}
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
              Creating...
            </>
          ) : (
            <>
              <Save size={17} />
              Create Problem
            </>
          )}
        </motion.button>
      </div>
    </motion.form>
  );
};

export default CreateProblem;
