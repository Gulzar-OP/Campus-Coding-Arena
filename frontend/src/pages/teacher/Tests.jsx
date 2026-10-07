import { useEffect, useMemo, useState } from "react";

import { Link } from "react-router-dom";

import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  ClipboardList,
  Clock3,
  FileCode2,
  CalendarDays,
  Sparkles,
  Hash,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import api from "../../services/api";

const Tests = () => {
  // ==========================================================
  // STATE
  // ==========================================================

  const [tests, setTests] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [deletingId, setDeletingId] = useState(null);

  // ==========================================================
  // FETCH TESTS
  // ==========================================================

  const fetchTests = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/tests");

      setTests(response.data.tests || []);
    } catch (error) {
      console.error("FETCH TESTS ERROR:", error);

      setError(error.response?.data?.message || "Failed to load tests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  // ==========================================================
  // SEARCH
  // Client side search
  // API call har key press par nahi hoga
  // ==========================================================

  const filteredTests = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return tests;
    }

    return tests.filter((test) => {
      const title = test.title?.toLowerCase() || "";

      const code = test.accessCode?.toLowerCase() || "";

      const status = test.status?.toLowerCase() || "";

      return (
        title.includes(query) || code.includes(query) || status.includes(query)
      );
    });
  }, [tests, search]);

  // ==========================================================
  // DELETE TEST
  // ==========================================================

  const deleteTest = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this test?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);

      setError("");

      await api.delete(`/tests/${id}/delete-test`);

      setTests((prev) => prev.filter((test) => test._id !== id));
    } catch (error) {
      console.error("DELETE TEST ERROR:", error);

      setError(error.response?.data?.message || "Failed to delete test");
    } finally {
      setDeletingId(null);
    }
  };

  // ==========================================================
  // STATUS STYLE
  // ==========================================================

  const statusStyle = (status) => {
    switch (status) {
      case "published":
        return "border-emerald-100 bg-emerald-50 text-emerald-600";

      case "draft":
        return "border-amber-100 bg-amber-50 text-amber-600";

      case "completed":
        return "border-gray-200 bg-gray-100 text-gray-600";

      default:
        return "border-gray-200 bg-gray-100 text-gray-600";
    }
  };

  // ==========================================================
  // RUNTIME STATUS
  // published test ke liye live / upcoming / ended
  // ==========================================================

  const getRuntimeStatus = (test) => {
    if (test.status !== "published") {
      return test.status;
    }

    const now = new Date();

    const start = new Date(test.startTime);

    const end = new Date(test.endTime);

    if (now.getTime() < start.getTime()) {
      return "upcoming";
    }

    if (now.getTime() > end.getTime()) {
      return "ended";
    }

    return "live";
  };

  const runtimeStatusStyle = (status) => {
    switch (status) {
      case "live":
        return "border-emerald-100 bg-emerald-50 text-emerald-600";

      case "upcoming":
        return "border-indigo-100 bg-indigo-50 text-indigo-600";

      case "ended":
        return "border-gray-200 bg-gray-100 text-gray-500";

      case "draft":
        return "border-amber-100 bg-amber-50 text-amber-600";

      default:
        return statusStyle(status);
    }
  };

  // ==========================================================
  // DATE FORMATTER
  // ==========================================================

  const formatDateTime = (value) => {
    if (!value) return "-";

    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    });
  };

  // ==========================================================
  // UI
  // ==========================================================

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
      className="mx-auto w-full max-w-[1600px]"
    >
      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-indigo-600">
            <Sparkles size={16} />
            Assessment Management
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl lg:text-4xl">
            All Tests
          </h1>

          <p className="mt-2 text-sm text-gray-500 sm:text-base">
            Manage coding assessments, questions and test schedules.
          </p>
        </div>

        <Link
          to="/teacher/tests/create"
          className="
            flex w-fit
            items-center gap-2
            rounded-xl
            bg-gradient-to-r
            from-indigo-600
            to-violet-600
            px-5 py-3
            text-sm font-semibold
            text-white
            shadow-lg
            shadow-indigo-500/20
            transition
            hover:shadow-indigo-500/30
          "
        >
          <Plus size={18} />
          Create Test
        </Link>
      </div>

      {/* ================================================== */}
      {/* ERROR */}
      {/* ================================================== */}

      {error && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />

          <div>
            <p className="text-sm font-semibold text-red-700">
              Something went wrong
            </p>

            <p className="mt-1 text-sm text-red-500">{error}</p>
          </div>
        </div>
      )}

      {/* ================================================== */}
      {/* SEARCH */}
      {/* ================================================== */}

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
        className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
      >
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by test name, code or status..."
            className="
              w-full rounded-xl
              border border-gray-200
              bg-gray-50/70
              py-3 pl-11 pr-4
              text-sm
              outline-none
              transition
              placeholder:text-gray-400
              hover:border-gray-300
              focus:border-indigo-500
              focus:bg-white
              focus:ring-4
              focus:ring-indigo-500/10
            "
          />
        </div>

        {!loading && (
          <div className="mt-3 flex items-center justify-between px-1 text-xs text-gray-400">
            <span>
              {filteredTests.length} test
              {filteredTests.length !== 1 ? "s" : ""} found
            </span>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="font-medium text-indigo-600 hover:text-indigo-700"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </motion.div>

      {/* ================================================== */}
      {/* DESKTOP TABLE */}
      {/* ================================================== */}

      <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Test
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Code
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Duration
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Questions
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Start Time
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Status
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <Loader2
                        size={28}
                        className="animate-spin text-indigo-600"
                      />

                      <p className="mt-3 text-sm text-gray-500">
                        Loading tests...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredTests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-16 text-center">
                    <ClipboardList
                      size={38}
                      className="mx-auto text-gray-300"
                    />

                    <h3 className="mt-3 font-semibold text-gray-800">
                      No tests found
                    </h3>

                    <p className="mt-1 text-sm text-gray-400">
                      {search
                        ? "Try a different search."
                        : "Create your first coding assessment."}
                    </p>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {filteredTests.map((test, index) => {
                    const runtimeStatus = getRuntimeStatus(test);

                    const questionCount = test.problems?.length || 0;

                    return (
                      <motion.tr
                        key={test._id}
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

                          x: -20,
                        }}
                        transition={{
                          delay: index * 0.03,
                        }}
                        className="border-t border-gray-100 transition hover:bg-indigo-50/30"
                      >
                        {/* TEST */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                              <ClipboardList size={18} />
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-[240px] truncate font-semibold text-gray-900">
                                {test.title}
                              </p>

                              <p className="mt-1 text-xs text-gray-400">
                                Coding Assessment
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* CODE */}

                        <td className="px-5 py-4">
                          <span className="rounded-lg bg-gray-100 px-3 py-1.5 font-mono text-xs font-semibold tracking-wider text-gray-600">
                            {test.accessCode || "-"}
                          </span>
                        </td>

                        {/* DURATION */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock3 size={15} />
                            {test.duration} min
                          </div>
                        </td>

                        {/* QUESTIONS */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FileCode2 size={15} />

                            <span className="font-semibold">
                              {questionCount}
                            </span>

                            <span className="text-gray-400">
                              {questionCount === 1 ? "Question" : "Questions"}
                            </span>
                          </div>
                        </td>

                        {/* START TIME */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <CalendarDays size={15} />

                            {formatDateTime(test.startTime)}
                          </div>
                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${runtimeStatusStyle(
                              runtimeStatus,
                            )}`}
                          >
                            {runtimeStatus}
                          </span>
                        </td>

                        {/* ACTIONS */}

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-1">
                            <Link
                              to={`/teacher/tests/${test._id}`}
                              title="View test"
                              className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                            >
                              <Eye size={17} />
                            </Link>

                            <Link
                              to={`/teacher/tests/${test._id}/edit`}
                              title="Edit test"
                              className="rounded-lg p-2 text-indigo-600 transition hover:bg-indigo-50"
                            >
                              <Pencil size={17} />
                            </Link>

                            <button
                              type="button"
                              disabled={deletingId === test._id}
                              onClick={() => deleteTest(test._id)}
                              title="Delete test"
                              className="rounded-lg p-2 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deletingId === test._id ? (
                                <Loader2 size={17} className="animate-spin" />
                              ) : (
                                <Trash2 size={17} />
                              )}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================================================== */}
      {/* MOBILE CARDS */}
      {/* ================================================== */}

      <div className="space-y-4 md:hidden">
        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
            <Loader2
              size={28}
              className="mx-auto animate-spin text-indigo-600"
            />

            <p className="mt-3 text-sm text-gray-500">Loading tests...</p>
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
            <ClipboardList size={36} className="mx-auto text-gray-300" />

            <h3 className="mt-3 font-semibold text-gray-800">No tests found</h3>

            <p className="mt-1 text-sm text-gray-400">
              {search ? "Try a different search." : "Create your first test."}
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {filteredTests.map((test, index) => {
              const runtimeStatus = getRuntimeStatus(test);

              const questionCount = test.problems?.length || 0;

              return (
                <motion.div
                  key={test._id}
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
                    delay: index * 0.04,
                  }}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  {/* HEADER */}

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                        <ClipboardList size={18} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-gray-900">
                          {test.title}
                        </h3>

                        <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                          <Hash size={12} />

                          {test.accessCode || "No code"}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${runtimeStatusStyle(
                        runtimeStatus,
                      )}`}
                    >
                      {runtimeStatus}
                    </span>
                  </div>

                  {/* INFO */}

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-gray-50 p-3">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock3 size={13} />
                        Duration
                      </div>

                      <p className="mt-1 text-sm font-semibold text-gray-700">
                        {test.duration} min
                      </p>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-3">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <FileCode2 size={13} />
                        Questions
                      </div>

                      <p className="mt-1 text-sm font-semibold text-gray-700">
                        {questionCount}
                      </p>
                    </div>
                  </div>

                  {/* DATE */}

                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-gray-50 p-3 text-xs text-gray-500">
                    <CalendarDays size={14} />

                    {formatDateTime(test.startTime)}
                  </div>

                  {/* ACTIONS */}

                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                    <Link
                      to={`/teacher/tests/${test._id}`}
                      className="flex items-center gap-2 text-sm font-semibold text-indigo-600"
                    >
                      View Test
                      <Eye size={16} />
                    </Link>

                    <div className="flex gap-1">
                      <Link
                        to={`/teacher/tests/${test._id}/edit`}
                        title="Edit test"
                        className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50"
                      >
                        <Pencil size={17} />
                      </Link>

                      <button
                        type="button"
                        disabled={deletingId === test._id}
                        onClick={() => deleteTest(test._id)}
                        title="Delete test"
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === test._id ? (
                          <Loader2 size={17} className="animate-spin" />
                        ) : (
                          <Trash2 size={17} />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
};

export default Tests;
