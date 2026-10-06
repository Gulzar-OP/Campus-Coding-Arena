import { useEffect, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import {
  Activity,
  AlignLeft,
  ArrowLeft,
  Braces,
  Building2,
  Check,
  Clock3,
  Code2,
  Cpu,
  Eye,
  EyeOff,
  FileCode2,
  Gauge,
  Languages,
  Loader2,
  MemoryStick,
  Plus,
  Save,
  Sparkles,
  Tag,
  Terminal,
  Trash2,
  X,
} from "lucide-react";

import { AnimatePresence, motion } from "framer-motion";

import toast from "react-hot-toast";

import api from "../../services/api";

const emptyTestCase = {
  input: "",
  expectedOutput: "",
  isHidden: false,
};

const allowedLanguages = ["C++", "Java"];

const EditProblem = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    topic: "",
    difficulty: "Easy",
    description: "",

    timeComplexity: "",
    spaceComplexity: "",

    tags: [],
    languages: [],

    inputFormat: "",
    outputFormat: "",

    constraints: [],
    companies: [],

    testCases: [],

    timeLimit: 2,
    memoryLimit: 256,

    isActive: true,
  });

  const [tagInput, setTagInput] = useState("");

  const [constraintInput, setConstraintInput] = useState("");

  const [companyInput, setCompanyInput] = useState("");

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        setLoading(true);

        const response = await api.get(`/problems/id/${id}`);

        const problem = response.data?.problem;

        if (!problem) {
          toast.error("Problem not found");

          navigate("/teacher/problems");

          return;
        }

        setForm({
          title: problem.title || "",

          topic: problem.topic || "",

          difficulty: problem.difficulty || "Easy",

          description: problem.description || "",

          timeComplexity: problem.timeComplexity || "",

          spaceComplexity: problem.spaceComplexity || "",

          tags: problem.tags || [],

          languages: (problem.languages || []).filter((language) =>
            allowedLanguages.includes(language),
          ),

          inputFormat: problem.inputFormat || "",

          outputFormat: problem.outputFormat || "",

          constraints: problem.constraints || [],

          companies: problem.companies || [],

          testCases: problem.testCases?.length
            ? problem.testCases
            : [
                {
                  ...emptyTestCase,
                },
              ],

          timeLimit: problem.timeLimit ?? 2,

          memoryLimit: problem.memoryLimit ?? 256,

          isActive: problem.isActive ?? true,
        });
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

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,

      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const toggleLanguage = (language) => {
    setForm((prev) => {
      const exists = prev.languages.includes(language);

      return {
        ...prev,

        languages: exists
          ? prev.languages.filter((item) => item !== language)
          : [...prev.languages, language],
      };
    });
  };

  const addUniqueItem = (input, setInput, field, duplicateMessage) => {
    const value = input.trim();

    if (!value) {
      return;
    }

    const exists = form[field].some(
      (item) => item.toLowerCase() === value.toLowerCase(),
    );

    if (exists) {
      toast.error(duplicateMessage);

      return;
    }

    setForm((prev) => ({
      ...prev,

      [field]: [...prev[field], value],
    }));

    setInput("");
  };

  const removeArrayItem = (field, index) => {
    setForm((prev) => ({
      ...prev,

      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const addTag = () => {
    addUniqueItem(tagInput, setTagInput, "tags", "Tag already added");
  };

  const addConstraint = () => {
    addUniqueItem(
      constraintInput,
      setConstraintInput,
      "constraints",
      "Constraint already added",
    );
  };

  const addCompany = () => {
    addUniqueItem(
      companyInput,
      setCompanyInput,
      "companies",
      "Company already added",
    );
  };

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

  const updateTestCase = (index, field, value) => {
    setForm((prev) => ({
      ...prev,

      testCases: prev.testCases.map((testCase, i) =>
        i === index
          ? {
              ...testCase,

              [field]: value,
            }
          : testCase,
      ),
    }));
  };

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

  const validateForm = () => {
    if (!form.title.trim()) {
      toast.error("Title is required");

      return false;
    }

    if (!form.topic.trim()) {
      toast.error("Topic is required");

      return false;
    }

    if (!form.description.trim()) {
      toast.error("Description is required");

      return false;
    }

    if (form.languages.length === 0) {
      toast.error("Select at least one language");

      return false;
    }

    if (Number(form.timeLimit) <= 0) {
      toast.error("Time limit must be greater than 0");

      return false;
    }

    if (Number(form.memoryLimit) <= 0) {
      toast.error("Memory limit must be greater than 0");

      return false;
    }

    if (form.testCases.length === 0) {
      toast.error("At least one test case is required");

      return false;
    }

    for (let i = 0; i < form.testCases.length; i++) {
      const testCase = form.testCases[i];

      if (!testCase.input?.trim()) {
        toast.error(`Test case ${i + 1}: input is required`);

        return false;
      }

      if (!testCase.expectedOutput?.trim()) {
        toast.error(`Test case ${i + 1}: expected output is required`);

        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const payload = {
        title: form.title.trim(),

        topic: form.topic.trim(),

        difficulty: form.difficulty,

        description: form.description.trim(),

        timeComplexity: form.timeComplexity.trim(),

        spaceComplexity: form.spaceComplexity.trim(),

        tags: form.tags,

        languages: form.languages,

        inputFormat: form.inputFormat.trim(),

        outputFormat: form.outputFormat.trim(),

        constraints: form.constraints,

        companies: form.companies,

        testCases: form.testCases.map((testCase) => ({
          input: testCase.input,

          expectedOutput: testCase.expectedOutput,

          isHidden: Boolean(testCase.isHidden),
        })),

        timeLimit: Number(form.timeLimit),

        memoryLimit: Number(form.memoryLimit),

        isActive: form.isActive,
      };

      const response = await api.put(`/problems/${id}`, payload);

      toast.success(response.data?.message || "Problem updated successfully");

      navigate(`/teacher/problems/${id}`);
    } catch (error) {
      console.error("UPDATE PROBLEM ERROR:", error);

      toast.error(error.response?.data?.message || "Failed to update problem");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[520px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
            <Loader2 size={25} className="animate-spin text-indigo-600" />
          </div>

          <p className="mt-4 font-semibold text-gray-700">Loading problem</p>

          <p className="mt-1 text-sm text-gray-400">Preparing editor...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
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
      className="mx-auto w-full max-w-[1500px] pb-12"
    >
      <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
        <div>
          <button
            type="button"
            onClick={() => navigate(`/teacher/problems/${id}`)}
            className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-indigo-600"
          >
            <ArrowLeft size={16} />
            Back to Problem
          </button>

          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-indigo-600">
            <Sparkles size={16} />
            Problem Editor
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl lg:text-4xl">
            Edit Problem
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
            Update problem statement, complexity, execution settings and test
            cases.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate(`/teacher/problems/${id}`)}
            className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            Cancel
          </button>

          <motion.button
            type="submit"
            whileTap={{
              scale: 0.98,
            }}
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <Save size={17} />
            )}

            {saving ? "Saving..." : "Save Changes"}
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Section
          icon={FileCode2}
          title="Basic Information"
          subtitle="General problem details"
        >
          <Field
            label="Problem Title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Longest Consecutive Sequence"
            required
          />

          <Field
            label="Topic"
            name="topic"
            value={form.topic}
            onChange={handleChange}
            placeholder="e.g. Arrays & Hashing"
            className="mt-5"
            required
          />

          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-gray-700">
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
        </Section>

        <Section
          icon={AlignLeft}
          title="Problem Description"
          subtitle="Explain the problem clearly"
        >
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            placeholder="Describe the coding problem..."
            className={`${inputClass} min-h-[285px] resize-y leading-6`}
          />
        </Section>
      </div>

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
          delay: 0.08,
        }}
        className="mt-6 overflow-hidden rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/70 shadow-sm"
      >
        <div className="border-b border-indigo-100 px-5 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <Gauge size={21} />
            </div>

            <div>
              <h2 className="font-bold text-gray-900">Expected Complexity</h2>

              <p className="text-xs text-gray-500">
                Complexity students should target
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Clock3 size={18} />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-800">
                  Time Complexity
                </label>

                <p className="text-xs text-gray-400">
                  Expected algorithm runtime
                </p>
              </div>
            </div>

            <input
              name="timeComplexity"
              value={form.timeComplexity}
              onChange={handleChange}
              placeholder="e.g. O(n), O(log n)"
              className={`${inputClass} font-mono`}
            />
          </div>

          <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <MemoryStick size={18} />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-800">
                  Space Complexity
                </label>

                <p className="text-xs text-gray-400">
                  Expected extra memory usage
                </p>
              </div>
            </div>

            <input
              name="spaceComplexity"
              value={form.spaceComplexity}
              onChange={handleChange}
              placeholder="e.g. O(1), O(n)"
              className={`${inputClass} font-mono`}
            />
          </div>
        </div>
      </motion.div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Section
          icon={Braces}
          title="Input / Output"
          subtitle="Define data format"
        >
          <TextareaField
            label="Input Format"
            name="inputFormat"
            value={form.inputFormat}
            onChange={handleChange}
            placeholder="Describe input format..."
          />

          <TextareaField
            label="Output Format"
            name="outputFormat"
            value={form.outputFormat}
            onChange={handleChange}
            placeholder="Describe expected output..."
            className="mt-5"
          />
        </Section>

        <Section
          icon={Cpu}
          title="Execution Settings"
          subtitle="Configure runner limits"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Time Limit
              </label>

              <div className="relative">
                <Clock3
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
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

              <p className="mt-2 text-xs text-gray-400">
                Maximum execution time in seconds.
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Memory Limit
              </label>

              <div className="relative">
                <MemoryStick
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
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

              <p className="mt-2 text-xs text-gray-400">
                Maximum memory in MB.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50/60 p-4">
            <p className="text-xs leading-5 text-amber-700">
              Complexity describes the expected algorithm. Execution limits
              define how much time and memory the runner allows.
            </p>
          </div>
        </Section>
      </div>

      <Section
        icon={Languages}
        title="Supported Languages"
        subtitle="Languages available to students"
        className="mt-6"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {allowedLanguages.map((language) => {
            const selected = form.languages.includes(language);

            return (
              <motion.button
                key={language}
                type="button"
                whileTap={{
                  scale: 0.98,
                }}
                onClick={() => toggleLanguage(language)}
                className={`flex items-center justify-between rounded-2xl border p-4 text-left transition ${
                  selected
                    ? "border-indigo-200 bg-indigo-50/70"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      selected
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <Code2 size={18} />
                  </div>

                  <div>
                    <p className="font-semibold text-gray-900">{language}</p>

                    <p className="mt-0.5 text-xs text-gray-400">
                      Code execution enabled
                    </p>
                  </div>
                </div>

                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full ${
                    selected
                      ? "bg-indigo-600 text-white"
                      : "border border-gray-300 text-transparent"
                  }`}
                >
                  <Check size={14} />
                </div>
              </motion.button>
            );
          })}
        </div>
      </Section>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Section icon={Tag} title="Tags" subtitle="Problem categories">
          <ArrayEditor
            value={tagInput}
            setValue={setTagInput}
            onAdd={addTag}
            items={form.tags}
            onRemove={(index) => removeArrayItem("tags", index)}
            placeholder="e.g. Array"
            tone="indigo"
          />
        </Section>

        <Section
          icon={Building2}
          title="Companies"
          subtitle="Commonly asked by"
        >
          <ArrayEditor
            value={companyInput}
            setValue={setCompanyInput}
            onAdd={addCompany}
            items={form.companies}
            onRemove={(index) => removeArrayItem("companies", index)}
            placeholder="e.g. Amazon"
            tone="gray"
          />
        </Section>

        <Section icon={Activity} title="Status" subtitle="Problem availability">
          <button
            type="button"
            onClick={() =>
              setForm((prev) => ({
                ...prev,

                isActive: !prev.isActive,
              }))
            }
            className="flex w-full items-center justify-between gap-5 rounded-2xl border border-gray-200 bg-gray-50/60 p-4 text-left"
          >
            <div>
              <p className="font-semibold text-gray-900">Active Problem</p>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Students can use this problem in assessments.
              </p>
            </div>

            <span
              className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                form.isActive ? "bg-indigo-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
                  form.isActive ? "left-6" : "left-1"
                }`}
              />
            </span>
          </button>
        </Section>
      </div>

      <Section
        icon={Terminal}
        title="Constraints"
        subtitle="Input boundaries"
        className="mt-6"
      >
        <ArrayEditor
          value={constraintInput}
          setValue={setConstraintInput}
          onAdd={addConstraint}
          items={form.constraints}
          onRemove={(index) => removeArrayItem("constraints", index)}
          placeholder="e.g. 1 <= n <= 100000"
          tone="violet"
          mono
        />
      </Section>

      <Section
        icon={Terminal}
        title="Test Cases"
        subtitle={`${form.testCases.length} test case${form.testCases.length === 1 ? "" : "s"} configured`}
        className="mt-6"
        action={
          <motion.button
            type="button"
            whileTap={{
              scale: 0.97,
            }}
            onClick={addTestCase}
            className="flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100"
          >
            <Plus size={16} />
            Add Test Case
          </motion.button>
        }
      >
        <div className="space-y-4">
          <AnimatePresence>
            {form.testCases.map((testCase, index) => (
              <motion.div
                layout
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
                  duration: 0.2,
                }}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-gray-50/30"
              >
                <div className="flex flex-col justify-between gap-3 border-b border-gray-200 bg-white px-5 py-4 sm:flex-row sm:items-center">
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
                          ? "Hidden from students"
                          : "Visible sample"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <motion.button
                      type="button"
                      whileTap={{
                        scale: 0.96,
                      }}
                      onClick={() =>
                        updateTestCase(index, "isHidden", !testCase.isHidden)
                      }
                      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                        testCase.isHidden
                          ? "bg-violet-50 text-violet-600"
                          : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      {testCase.isHidden ? (
                        <EyeOff size={14} />
                      ) : (
                        <Eye size={14} />
                      )}

                      {testCase.isHidden ? "Hidden" : "Visible"}
                    </motion.button>

                    <motion.button
                      type="button"
                      whileTap={{
                        scale: 0.9,
                      }}
                      onClick={() => removeTestCase(index)}
                      className="rounded-xl p-2.5 text-red-500 transition hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 p-5 lg:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Input
                    </label>

                    <textarea
                      value={testCase.input}
                      onChange={(event) =>
                        updateTestCase(index, "input", event.target.value)
                      }
                      placeholder="Enter test input..."
                      className="min-h-[150px] w-full resize-y rounded-xl border border-gray-200 bg-white p-4 font-mono text-sm leading-6 text-gray-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Expected Output
                    </label>

                    <textarea
                      value={testCase.expectedOutput}
                      onChange={(event) =>
                        updateTestCase(
                          index,
                          "expectedOutput",
                          event.target.value,
                        )
                      }
                      placeholder="Enter expected output..."
                      className="min-h-[150px] w-full resize-y rounded-xl border border-gray-200 bg-white p-4 font-mono text-sm leading-6 text-gray-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </Section>

      <div className="mt-6 flex flex-col-reverse justify-end gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => navigate(`/teacher/problems/${id}`)}
          className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
        >
          Cancel
        </button>

        <motion.button
          type="submit"
          whileTap={{
            scale: 0.98,
          }}
          disabled={saving}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? (
            <Loader2 size={17} className="animate-spin" />
          ) : (
            <Save size={17} />
          )}

          {saving ? "Saving Changes..." : "Save Changes"}
        </motion.button>
      </div>
    </motion.form>
  );
};

const inputClass = `
  mt-2
  w-full
  rounded-xl
  border border-gray-200
  bg-gray-50/70
  px-4 py-3
  text-sm text-gray-900
  outline-none
  transition
  placeholder:text-gray-400
  hover:border-gray-300
  focus:border-indigo-500
  focus:bg-white
  focus:ring-4
  focus:ring-indigo-500/10
`;

const Section = ({
  icon: Icon,
  title,
  subtitle,
  action,
  children,
  className = "",
}) => (
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
    <div className="flex flex-col justify-between gap-4 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Icon size={18} />
          </div>
        )}

        <div>
          <h2 className="font-bold text-gray-900">{title}</h2>

          {subtitle && (
            <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
      </div>

      {action}
    </div>

    <div className="p-5 sm:p-6">{children}</div>
  </motion.section>
);

const Field = ({ label, className = "", ...props }) => (
  <div className={className}>
    <label className="text-sm font-semibold text-gray-700">{label}</label>

    <input {...props} className={inputClass} />
  </div>
);

const TextareaField = ({ label, className = "", ...props }) => (
  <div className={className}>
    <label className="text-sm font-semibold text-gray-700">{label}</label>

    <textarea
      {...props}
      className={`${inputClass} min-h-[120px] resize-y leading-6`}
    />
  </div>
);

const ArrayEditor = ({
  value,
  setValue,
  onAdd,
  items,
  onRemove,
  placeholder,
  tone = "indigo",
  mono = false,
}) => {
  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();

      onAdd();
    }
  };

  const toneMap = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",

    violet: "bg-violet-50 text-violet-600 border-violet-100",

    gray: "bg-gray-100 text-gray-600 border-gray-200",
  };

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`flex-1 rounded-xl border border-gray-200 bg-gray-50/70 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 ${
            mono ? "font-mono" : ""
          }`}
        />

        <motion.button
          type="button"
          whileTap={{
            scale: 0.97,
          }}
          onClick={onAdd}
          className="flex items-center justify-center gap-2 rounded-xl bg-gray-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          <Plus size={16} />
          Add
        </motion.button>
      </div>

      <AnimatePresence>
        {items?.length > 0 && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            className="mt-4 flex flex-wrap gap-2"
          >
            {items.map((item, index) => (
              <motion.div
                layout
                key={`${item}-${index}`}
                initial={{
                  opacity: 0,

                  scale: 0.9,
                }}
                animate={{
                  opacity: 1,

                  scale: 1,
                }}
                exit={{
                  opacity: 0,

                  scale: 0.9,
                }}
                className={`flex max-w-full items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${
                  toneMap[tone]
                } ${mono ? "font-mono" : ""}`}
              >
                <span className="break-all">{item}</span>

                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="shrink-0 opacity-50 transition hover:opacity-100"
                >
                  <X size={13} />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EditProblem;
