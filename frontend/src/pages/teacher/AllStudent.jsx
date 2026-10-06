import {
  useEffect,
  useState,
} from "react";

import {
  Search,
  Users,
  GraduationCap,
  Mail,
  Hash,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Trophy
} from "lucide-react";

import {
  motion,
} from "framer-motion";

import api from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function AllStudent() {
  const [
    students,
    setStudents,
  ] = useState([]);
  const navigate = useNavigate();
  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    page,
    setPage,
  ] = useState(1);

  const limit = 10;

  const [
    pagination,
    setPagination,
  ] = useState({
    currentPage: 1,
    totalPages: 1,
    totalStudents: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // =========================================
  // FETCH STUDENTS
  // =========================================

  const fetchStudents =
    async () => {
      try {
        setLoading(true);

        const response =
          await api.get(
            `/teacher/students?page=${page}&limit=${limit}`,
          );

        setStudents(
          response.data
            .students || [],
        );

        setPagination(
          response.data
            .pagination || {
            currentPage: 1,
            totalPages: 1,
            totalStudents: 0,
            hasNextPage:
              false,
            hasPrevPage:
              false,
          },
        );
      } catch (error) {
        console.error(
          "Fetch students error:",
          error,
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchStudents();
  }, [page]);

  // =========================================
  // SEARCH CURRENT PAGE
  // =========================================

  const filteredStudents =
    students.filter(
      (student) => {
        const query =
          search
            .trim()
            .toLowerCase();

        if (!query) {
          return true;
        }

        return (
          student.name
            ?.toLowerCase()
            .includes(
              query,
            ) ||
          student.email
            ?.toLowerCase()
            .includes(
              query,
            ) ||
          student.rollNo
            ?.toLowerCase()
            .includes(
              query,
            ) ||
          student.branch
            ?.toLowerCase()
            .includes(
              query,
            )
        );
      },
    );

  // =========================================
  // LOADING
  // =========================================

  if (loading) {
    return (
      <div className="flex min-h-[450px] items-center justify-center">
        <div className="text-center">
          <Loader2
            size={28}
            className="mx-auto animate-spin text-indigo-600"
          />

          <p className="mt-3 text-sm text-gray-500">
            Loading students...
          </p>
        </div>
      </div>
    );
  }

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
      className="mx-auto w-full max-w-[1600px] pb-12"
    >
      {/* HEADER */}

      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-indigo-600">
            <Users
              size={16}
            />

            Student Management
          </div>

          <h1 className="text-2xl font-bold text-gray-950 sm:text-3xl">
            All Students
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            View and manage
            registered students.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs text-gray-400">
            Total Students
          </p>

          <p className="mt-1 text-xl font-bold text-gray-900">
            {
              pagination.totalStudents
            }
          </p>
        </div>
      </div>

      {/* SEARCH */}

      <div className="mb-5">
        <div className="relative max-w-md">
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
            placeholder="Search by name, email, roll no..."
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
          />
        </div>
      </div>

      {/* EMPTY */}

      {filteredStudents.length ===
      0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <Users
            size={40}
            className="mx-auto text-gray-300"
          />

          <h2 className="mt-4 font-semibold text-gray-700">
            No students found
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Try another search.
          </p>
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE */}

          <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm md:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <TableHead>
                      Student
                    </TableHead>

                    <TableHead>
                      Roll No
                    </TableHead>

                    <TableHead>
                      Branch
                    </TableHead>

                    <TableHead>
                      Year
                    </TableHead>

                    <TableHead>
                      Solved
                    </TableHead>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredStudents.map(
                    (
                      student,
                    ) => (
                      <tr
                        key={
                          student._id
                        }
                        className="transition hover:bg-gray-50/70" onClick={() =>
  navigate(
    `/teacher/students/${student._id}`,
  )
}
                      >
                        <td className="px-5 py-4" >
                          <div className="flex items-center gap-3">
                            <StudentAvatar
                              name={
                                student.name
                              }
                            />

                            <div>
                              <p className="font-semibold text-gray-900">
                                {
                                  student.name
                                }
                              </p>

                              <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
                                <Mail
                                  size={
                                    12
                                  }
                                />

                                {
                                  student.email
                                }
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm font-medium text-gray-600">
                          {student.rollNo ||
                            "-"}
                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {student.branch ||
                            "-"}
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600">
                            {student.year
                              ? `${student.year} Year`
                              : "-"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-semibold text-gray-700">
                            {student
                              .solvedProblems
                              ?.length ||
                              0}
                          </span>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* MOBILE CARDS */}

          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredStudents.map(
              (
                student,
              ) => (
                <motion.div
                  key={
                    student._id
                  }
                  whileTap={{
                    scale: 0.99,
                  }}
                  className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <StudentAvatar
                      name={
                        student.name
                      }
                    />

                    <div className="min-w-0 flex-1">
                      <h2 className="truncate font-bold text-gray-900">
                        {
                          student.name
                        }
                      </h2>

                      <p className="mt-1 truncate text-sm text-gray-500">
                        {
                          student.email
                        }
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <StudentInfo
                      icon={Hash}
                      label="Roll No"
                      value={
                        student.rollNo ||
                        "-"
                      }
                    />

                    <StudentInfo
                      icon={
                        GraduationCap
                      }
                      label="Branch"
                      value={
                        student.branch ||
                        "-"
                      }
                    />

                    <StudentInfo
                      icon={
                        GraduationCap
                      }
                      label="Year"
                      value={
                        student.year
                          ? `${student.year} Year`
                          : "-"
                      }
                    />

                    <StudentInfo
                      icon={Trophy}
                      label="Solved"
                      value={
                        student
                          .solvedProblems
                          ?.length ||
                        0
                      }
                    />
                  </div>
                </motion.div>
              ),
            )}
          </div>
        </>
      )}

      {/* PAGINATION */}

      {pagination.totalPages >
        1 && (
        <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row">
          <p className="text-sm text-gray-500">
            Page{" "}
            <span className="font-semibold text-gray-800">
              {
                pagination.currentPage
              }
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-800">
              {
                pagination.totalPages
              }
            </span>
          </p>

          <div className="flex items-center gap-2">
            <button
              disabled={
                !pagination.hasPrevPage
              }
              onClick={() =>
                setPage(
                  (previous) =>
                    previous -
                    1,
                )
              }
              className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft
                size={16}
              />

              Previous
            </button>

            <button
              disabled={
                !pagination.hasNextPage
              }
              onClick={() =>
                setPage(
                  (previous) =>
                    previous +
                    1,
                )
              }
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next

              <ChevronRight
                size={16}
              />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// =========================================
// AVATAR
// =========================================

const StudentAvatar = ({
  name,
}) => {
  const initials =
    name
      ?.split(" ")
      .slice(0, 2)
      .map(
        (word) =>
          word[0],
      )
      .join("")
      .toUpperCase() ||
    "S";

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white">
      {initials}
    </div>
  );
};

// =========================================
// MOBILE INFO
// =========================================

const StudentInfo = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="rounded-xl bg-gray-50 p-3">
    <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-gray-400">
      <Icon size={12} />

      {label}
    </div>

    <p className="mt-1 truncate text-sm font-semibold text-gray-700">
      {value}
    </p>
  </div>
);

// =========================================
// TABLE HEADER
// =========================================

const TableHead = ({
  children,
}) => (
  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
    {children}
  </th>
);