import { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import {
  Plus,
  Search,
  Pencil,
  Eye,
  Trash2,
  FileCode2,
  Filter,
  Sparkles,
  Code2,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import toast from "react-hot-toast";

import api from "../../services/api";

const Problems = () => {
  const navigate =
    useNavigate();

  const [
    problems,
    setProblems,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    difficulty,
    setDifficulty,
  ] = useState("");

  // =========================
  // FETCH PROBLEMS
  // =========================

  const fetchProblems =
    async () => {
      try {
        setLoading(true);

        const params = {};

        if (search.trim()) {
          params.search =
            search.trim();
        }

        if (difficulty) {
          params.difficulty =
            difficulty;
        }

        const response =
          await api.get(
            "/problems/teacher/my",
            {
              params,
            },
          );

        setProblems(
          Array.isArray(
            response.data
              ?.problems,
          )
            ? response.data
                .problems
            : [],
        );
      } catch (error) {
        console.error(
          "FETCH PROBLEMS ERROR:",
          error.response?.data ||
            error,
        );

        toast.error(
          error.response?.data
            ?.message ||
            "Failed to load problems",
        );

        setProblems([]);
      } finally {
        setLoading(false);
      }
    };

  // =========================
  // FETCH WITH DEBOUNCE
  // =========================

  useEffect(() => {
    const timer =
      setTimeout(() => {
        fetchProblems();
      }, 300);

    return () =>
      clearTimeout(timer);
  }, [
    search,
    difficulty,
  ]);

  // =========================
  // DELETE
  // =========================

  const deleteProblem =
    async (id) => {
      const confirmDelete =
        window.confirm(
          "Are you sure you want to delete this problem?",
        );

      if (!confirmDelete) {
        return;
      }

      try {
        const response =
          await api.delete(
            `/problems/${id}`,
          );

        toast.success(
          response.data
            ?.message ||
            "Problem deleted successfully",
        );

        setProblems(
          (prev) =>
            prev.filter(
              (problem) =>
                problem._id !==
                id,
            ),
        );
      } catch (error) {
        console.error(
          "DELETE PROBLEM ERROR:",
          error.response
            ?.data || error,
        );

        toast.error(
          error.response?.data
            ?.message ||
            "Failed to delete problem",
        );
      }
    };

  // =========================
  // EDIT
  // =========================

  const editProblem = (
    id,
  ) => {
    navigate(
      `/teacher/problems/${id}/edit`,
    );
  };

  // =========================
  // VIEW
  // =========================

  const viewProblem = (
    id,
  ) => {
    navigate(
      `/teacher/problems/${id}`,
    );
  };

  // =========================
  // DIFFICULTY STYLE
  // =========================

  const difficultyStyle = (
    value,
  ) => {
    if (value === "Easy") {
      return "bg-emerald-50 text-emerald-600 border-emerald-100";
    }

    if (
      value === "Medium"
    ) {
      return "bg-amber-50 text-amber-600 border-amber-100";
    }

    return "bg-red-50 text-red-600 border-red-100";
  };

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
      {/* ========================= */}
      {/* HEADER */}
      {/* ========================= */}

      <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-indigo-600">
            <Sparkles
              size={16}
            />

            Problem Bank
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl lg:text-4xl">
            All Problems
          </h1>

          <p className="mt-2 text-sm text-gray-500 sm:text-base">
            Create, manage and
            organize your coding
            problem bank.
          </p>
        </div>

        <Link
          to="/teacher/problems/create"
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
          Add Problem
        </Link>
      </div>

      {/* ========================= */}
      {/* STATS */}
      {/* ========================= */}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Total Problems
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            {
              problems.length
            }
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Easy Problems
          </p>

          <h2 className="mt-2 text-2xl font-bold text-emerald-600">
            {
              problems.filter(
                (problem) =>
                  problem.difficulty ===
                  "Easy",
              ).length
            }
          </h2>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">
            Medium / Hard
          </p>

          <h2 className="mt-2 text-2xl font-bold text-amber-600">
            {
              problems.filter(
                (problem) =>
                  problem.difficulty !==
                  "Easy",
              ).length
            }
          </h2>
        </div>
      </div>

      {/* ========================= */}
      {/* FILTERS */}
      {/* ========================= */}

      <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value,
                )
              }
              placeholder="Search problem by title..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-indigo-500"
            />
          </div>

          <div className="relative">
            <Filter
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <select
              value={
                difficulty
              }
              onChange={(e) =>
                setDifficulty(
                  e.target
                    .value,
                )
              }
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-10 text-sm outline-none md:w-52"
            >
              <option value="">
                All Difficulty
              </option>

              <option value="Easy">
                Easy
              </option>

              <option value="Medium">
                Medium
              </option>

              <option value="Hard">
                Hard
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* ========================= */}
      {/* DESKTOP TABLE */}
      {/* ========================= */}

      <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500">
                  Problem
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500">
                  Difficulty
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500">
                  Topic
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500">
                  Test Cases
                </th>

                <th className="px-5 py-4 text-left text-xs font-semibold text-gray-500">
                  Created
                </th>

                <th className="px-5 py-4 text-right text-xs font-semibold text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-16 text-center"
                  >
                    Loading
                    problems...
                  </td>
                </tr>
              ) : problems.length ===
                0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-16 text-center"
                  >
                    No problems found
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {problems.map(
                    (
                      problem,
                      index,
                    ) => (
                      <motion.tr
                        key={
                          problem._id
                        }
                        initial={{
                          opacity: 0,
                          y: 10,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        transition={{
                          delay:
                            index *
                            0.03,
                        }}
                        className="border-t border-gray-100 hover:bg-indigo-50/30"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                              <Code2
                                size={
                                  18
                                }
                              />
                            </div>

                            <div>
                              <p className="font-semibold">
                                {
                                  problem.title
                                }
                              </p>

                              <p className="text-xs text-gray-400">
                                {
                                  problem.slug
                                }
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs ${difficultyStyle(
                              problem.difficulty,
                            )}`}
                          >
                            {
                              problem.difficulty
                            }
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm">
                          {
                            problem.topic
                          }
                        </td>

                        <td className="px-5 py-4">
                          {
                            problem
                              .testCases
                              ?.length ??
                            0
                          }
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-500">
                          {problem.createdAt
                            ? new Date(
                                problem.createdAt,
                              ).toLocaleDateString()
                            : "-"}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() =>
                                viewProblem(
                                  problem._id,
                                )
                              }
                              title="View"
                              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                            >
                              <Eye
                                size={
                                  17
                                }
                              />
                            </button>

                            <button
                              onClick={() =>
                                editProblem(
                                  problem._id,
                                )
                              }
                              title="Edit"
                              className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50"
                            >
                              <Pencil
                                size={
                                  17
                                }
                              />
                            </button>

                            <button
                              onClick={() =>
                                deleteProblem(
                                  problem._id,
                                )
                              }
                              title="Delete"
                              className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                            >
                              <Trash2
                                size={
                                  17
                                }
                              />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ),
                  )}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================= */}
      {/* MOBILE */}
      {/* ========================= */}

      <div className="space-y-4 md:hidden">
        {loading ? (
          <div className="rounded-2xl border bg-white p-10 text-center">
            Loading problems...
          </div>
        ) : (
          problems.map(
            (problem) => (
              <div
                key={
                  problem._id
                }
                className="rounded-2xl border border-gray-200 bg-white p-5"
              >
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold">
                      {
                        problem.title
                      }
                    </h3>

                    <p className="text-xs text-gray-400">
                      {
                        problem.slug
                      }
                    </p>
                  </div>

                  <span
                    className={`rounded-full border px-2 py-1 text-xs ${difficultyStyle(
                      problem.difficulty,
                    )}`}
                  >
                    {
                      problem.difficulty
                    }
                  </span>
                </div>

                <div className="mt-5 flex justify-end gap-1">
                  <button
                    onClick={() =>
                      viewProblem(
                        problem._id,
                      )
                    }
                    className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                  >
                    <Eye
                      size={17}
                    />
                  </button>

                  <button
                    onClick={() =>
                      editProblem(
                        problem._id,
                      )
                    }
                    className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50"
                  >
                    <Pencil
                      size={17}
                    />
                  </button>

                  <button
                    onClick={() =>
                      deleteProblem(
                        problem._id,
                      )
                    }
                    className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                  >
                    <Trash2
                      size={17}
                    />
                  </button>
                </div>
              </div>
            ),
          )
        )}
      </div>
    </motion.div>
  );
};

export default Problems;
