import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  Hash,
  Loader2,
  Mail,
  Trophy,
  User,
} from "lucide-react";

import {
  motion,
} from "framer-motion";

import toast from "react-hot-toast";

import api from "../../services/api";

const StudentDetails = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [student, setStudent] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const fetchStudent =
      async () => {
        try {
          const response =
            await api.get(
              `/teacher/students/${id}`,
            );

          setStudent(
            response.data.student,
          );
        } catch (error) {
          console.error(
            "Student details error:",
            error,
          );

          toast.error(
            error.response?.data
              ?.message ||
              "Failed to fetch student details",
          );
        } finally {
          setLoading(false);
        }
      };

    fetchStudent();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[450px] items-center justify-center">
        <div className="text-center">
          <Loader2
            size={28}
            className="mx-auto animate-spin text-indigo-600"
          />

          <p className="mt-3 text-sm text-gray-500">
            Loading student...
          </p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex min-h-[450px] items-center justify-center">
        <div className="text-center">
          <User
            size={42}
            className="mx-auto text-gray-300"
          />

          <h2 className="mt-4 text-xl font-bold text-gray-900">
            Student not found
          </h2>

          <button
            onClick={() =>
              navigate(
                "/teacher/students",
              )
            }
            className="mt-4 text-sm font-semibold text-indigo-600"
          >
            Back to Students
          </button>
        </div>
      </div>
    );
  }

  const solvedCount =
    student.solvedProblems
      ?.length || 0;

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
      className="mx-auto w-full max-w-[1400px] pb-12"
    >
      {/* BACK */}

      <button
        onClick={() =>
          navigate(
            "/teacher/students",
          )
        }
        className="mb-5 flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-indigo-600"
      >
        <ArrowLeft size={16} />

        Back to Students
      </button>

      {/* HERO */}

      <section className="mb-6 overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-xl font-bold text-white shadow-lg shadow-indigo-500/20">
              {getInitials(
                student.name,
              )}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                Student Profile
              </p>

              <h1 className="mt-1 text-2xl font-bold text-gray-950 sm:text-3xl">
                {student.name}
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                {student.email}
              </p>
            </div>
          </div>

          <div className="flex w-fit items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-600">
            <CheckCircle2
              size={17}
            />

            Active Student
          </div>
        </div>
      </section>

      {/* STATS */}

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={Trophy}
          title="Solved Problems"
          value={solvedCount}
        />

        <StatCard
          icon={GraduationCap}
          title="Year"
          value={
            student.year
              ? `${student.year} Year`
              : "-"
          }
        />

        <StatCard
          icon={BookOpen}
          title="Branch"
          value={
            student.branch || "-"
          }
        />

        <StatCard
          icon={CalendarDays}
          title="Joined"
          value={
            student.createdAt
              ? new Date(
                  student.createdAt,
                ).toLocaleDateString()
              : "-"
          }
        />
      </div>

      {/* INFO */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* PERSONAL INFO */}

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">
              Student Information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Basic academic and
              account details.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoCard
              icon={User}
              label="Name"
              value={
                student.name
              }
            />

            <InfoCard
              icon={Mail}
              label="Email"
              value={
                student.email
              }
            />

            <InfoCard
              icon={Hash}
              label="Roll Number"
              value={
                student.rollNo ||
                "-"
              }
            />

            <InfoCard
              icon={
                GraduationCap
              }
              label="Branch"
              value={
                student.branch ||
                "-"
              }
            />

            <InfoCard
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

            <InfoCard
              icon={
                CalendarDays
              }
              label="Registered"
              value={
                student.createdAt
                  ? new Date(
                      student.createdAt,
                    ).toLocaleString()
                  : "-"
              }
            />
          </div>
        </section>

        {/* SOLVED PROBLEMS */}

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Solved Problems
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Problems completed by
                this student.
              </p>
            </div>

            <span className="rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600">
              {solvedCount}
            </span>
          </div>

          {student.solvedProblems
            ?.length > 0 ? (
            <div className="space-y-3">
              {student.solvedProblems.map(
                (
                  problem,
                  index,
                ) => (
                  <div
                    key={
                      problem._id ||
                      index
                    }
                    className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/70 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                        <CheckCircle2
                          size={17}
                        />
                      </div>

                      <div>
                        <p className="font-semibold text-gray-800">
                          {problem.title ||
                            `Problem ${
                              index + 1
                            }`}
                        </p>

                        {problem.topic && (
                          <p className="mt-1 text-xs text-gray-400">
                            {
                              problem.topic
                            }
                          </p>
                        )}
                      </div>
                    </div>

                    {problem.difficulty && (
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${difficultyClass(
                          problem.difficulty,
                        )}`}
                      >
                        {
                          problem.difficulty
                        }
                      </span>
                    )}
                  </div>
                ),
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 p-10 text-center">
              <Trophy
                size={36}
                className="mx-auto text-gray-300"
              />

              <p className="mt-3 text-sm font-medium text-gray-500">
                No solved problems yet.
              </p>
            </div>
          )}
        </section>
      </div>
    </motion.div>
  );
};

// ==========================================
// STAT CARD
// ==========================================

const StatCard = ({
  icon: Icon,
  title,
  value,
}) => (
  <motion.div
    whileHover={{
      y: -3,
    }}
    className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 sm:text-sm">
          {title}
        </p>

        <p className="mt-2 truncate text-xl font-bold text-gray-950 sm:text-2xl">
          {value}
        </p>
      </div>

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
        <Icon size={19} />
      </div>
    </div>
  </motion.div>
);

// ==========================================
// INFO CARD
// ==========================================

const InfoCard = ({
  icon: Icon,
  label,
  value,
}) => (
  <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4">
    <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
      <Icon size={14} />

      {label}
    </div>

    <p className="mt-2 break-words text-sm font-semibold text-gray-800">
      {value || "-"}
    </p>
  </div>
);

// ==========================================
// HELPERS
// ==========================================

const getInitials = (
  name,
) => {
  return (
    name
      ?.split(" ")
      .slice(0, 2)
      .map(
        (item) =>
          item[0],
      )
      .join("")
      .toUpperCase() || "S"
  );
};

const difficultyClass = (
  difficulty,
) => {
  if (
    difficulty === "Easy"
  ) {
    return "border-emerald-100 bg-emerald-50 text-emerald-600";
  }

  if (
    difficulty === "Medium"
  ) {
    return "border-amber-100 bg-amber-50 text-amber-600";
  }

  return "border-red-100 bg-red-50 text-red-600";
};

export default StudentDetails;