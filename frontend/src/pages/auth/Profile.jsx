import {
  useEffect,
  useState,
} from "react";

import {
  User,
  Mail,
  GraduationCap,
  ShieldCheck,
  CalendarDays,
  Pencil,
  Save,
  X,
  BookOpen,
  Loader2,
} from "lucide-react";

import toast from "react-hot-toast";

import api from "../../services/api";

const Profile = () => {
  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [editing, setEditing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [form, setForm] =
    useState({
      name: "",
      branch: "",
      year: "",
    });

  // ==============================
  // FETCH PROFILE
  // ==============================

  const fetchProfile =
    async () => {
      try {
        setLoading(true);

        const response =
          await api.get(
            "/users/me",
          );

        const currentUser =
          response.data.user;

        setUser(
          currentUser,
        );

        setForm({
          name:
            currentUser.name ||
            "",
          branch:
            currentUser.branch ||
            "",
          year:
            currentUser.year ||
            "",
        });
      } catch (error) {
        console.error(
          "PROFILE ERROR:",
          error.response?.data ||
            error,
        );

        toast.error(
          error.response?.data
            ?.message ||
            "Failed to load profile",
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ==============================
  // INPUT CHANGE
  // ==============================

  const handleChange = (
    e,
  ) => {
    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==============================
  // UPDATE PROFILE
  // ==============================

  const handleUpdate =
    async (e) => {
      e.preventDefault();

      if (
        !form.name.trim()
      ) {
        toast.error(
          "Name is required",
        );

        return;
      }

      try {
        setSaving(true);

        const response =
          await api.put(
            "/users/me",
            {
              name:
                form.name.trim(),
              branch:
                form.branch.trim(),
              year:
                form.year
                  ? Number(
                      form.year,
                    )
                  : undefined,
            },
          );

        setUser(
          response.data.user,
        );

        setEditing(false);

        toast.success(
          response.data
            ?.message ||
            "Profile updated successfully",
        );
      } catch (error) {
        console.error(
          "UPDATE PROFILE ERROR:",
          error.response?.data ||
            error,
        );

        toast.error(
          error.response?.data
            ?.message ||
            "Failed to update profile",
        );
      } finally {
        setSaving(false);
      }
    };

  // ==============================
  // CANCEL EDIT
  // ==============================

  const handleCancel = () => {
    setForm({
      name:
        user?.name || "",
      branch:
        user?.branch || "",
      year:
        user?.year || "",
    });

    setEditing(false);
  };

  // ==============================
  // LOADING
  // ==============================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Loader2
            size={36}
            className="mx-auto animate-spin text-indigo-600"
          />

          <p className="mt-3 text-sm text-gray-500">
            Loading profile...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500">
          Profile not found
        </p>
      </div>
    );
  }

  const role =
    user.role || "student";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* ====================== */}
      {/* PROFILE HEADER */}
      {/* ====================== */}

      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
        <div className="h-36 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600" />

        <div className="px-6 pb-7 sm:px-8">
          <div className="-mt-14 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              {/* AVATAR */}

              <div className="flex h-28 w-28 items-center justify-center rounded-3xl border-4 border-white bg-indigo-50 text-indigo-600 shadow-lg">
                <User
                  size={52}
                />
              </div>

              {/* USER INFO */}

              <div className="pb-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-950 sm:text-3xl">
                    {user.name}
                  </h1>

                  <RoleBadge
                    role={
                      role
                    }
                  />
                </div>

                <p className="mt-1 text-sm text-gray-500">
                  {user.email}
                </p>
              </div>
            </div>

            {!editing && (
              <button
                onClick={() =>
                  setEditing(
                    true,
                  )
                }
                className="flex w-fit items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                <Pencil
                  size={17}
                />

                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ====================== */}
      {/* ROLE CARD */}
      {/* ====================== */}

      <div className="grid gap-5 md:grid-cols-3">
        <InfoCard
          icon={
            <Mail
              size={20}
            />
          }
          title="Email"
          value={
            user.email
          }
        />

        <InfoCard
          icon={
            <GraduationCap
              size={20}
            />
          }
          title="Branch"
          value={
            user.branch ||
            "Not provided"
          }
        />

        <InfoCard
          icon={
            <BookOpen
              size={20}
            />
          }
          title="Year"
          value={
            user.year
              ? `${user.year}${getYearSuffix(
                  user.year,
                )} Year`
              : "Not provided"
          }
        />
      </div>

      {/* ====================== */}
      {/* DETAILS */}
      {/* ====================== */}

      {!editing ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* PERSONAL DETAILS */}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
            <h2 className="text-lg font-semibold text-gray-900">
              Personal Information
            </h2>

            <div className="mt-6 divide-y divide-gray-100">
              <DetailRow
                label="Full Name"
                value={
                  user.name
                }
              />

              <DetailRow
                label="Email"
                value={
                  user.email
                }
              />

              <DetailRow
                label="Branch"
                value={
                  user.branch ||
                  "-"
                }
              />

              <DetailRow
                label="Year"
                value={
                  user.year ||
                  "-"
                }
              />

              <DetailRow
                label="Role"
                value={
                  capitalize(
                    role,
                  )
                }
              />
            </div>
          </div>

          {/* ACCOUNT INFO */}

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Account
            </h2>

            <div className="mt-5 space-y-4">
              <SmallInfo
                icon={
                  <ShieldCheck
                    size={
                      18
                    }
                  />
                }
                label="Account Role"
                value={
                  capitalize(
                    role,
                  )
                }
              />

              <SmallInfo
                icon={
                  <CalendarDays
                    size={
                      18
                    }
                  />
                }
                label="Joined"
                value={
                  user.createdAt
                    ? new Date(
                        user.createdAt,
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          day: "numeric",
                          month:
                            "short",
                          year:
                            "numeric",
                        },
                      )
                    : "-"
                }
              />

              {role ===
                "student" && (
                <SmallInfo
                  icon={
                    <BookOpen
                      size={
                        18
                      }
                    />
                  }
                  label="Solved Problems"
                  value={
                    user
                      .solvedProblems
                      ?.length ||
                    0
                  }
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        // ======================
        // EDIT FORM
        // ======================

        <form
          onSubmit={
            handleUpdate
          }
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Edit Profile
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Update your
                personal
                information.
              </p>
            </div>

            <button
              type="button"
              onClick={
                handleCancel
              }
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Full Name
              </label>

              <input
                name="name"
                value={
                  form.name
                }
                onChange={
                  handleChange
                }
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email
              </label>

              <input
                value={
                  user.email
                }
                disabled
                className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-gray-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Branch
              </label>

              <input
                name="branch"
                value={
                  form.branch
                }
                onChange={
                  handleChange
                }
                placeholder="Example: CSE"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Year
              </label>

              <select
                name="year"
                value={
                  form.year
                }
                onChange={
                  handleChange
                }
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none transition focus:border-indigo-500"
              >
                <option value="">
                  Select Year
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

          <div className="mt-7 flex justify-end gap-3">
            <button
              type="button"
              onClick={
                handleCancel
              }
              className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                saving
              }
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? (
                <Loader2
                  size={
                    17
                  }
                  className="animate-spin"
                />
              ) : (
                <Save
                  size={
                    17
                  }
                />
              )}

              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

// ==============================
// ROLE BADGE
// ==============================

const RoleBadge = ({
  role,
}) => {
  const styles = {
    student:
      "bg-blue-50 text-blue-700 border-blue-100",

    teacher:
      "bg-violet-50 text-violet-700 border-violet-100",

    admin:
      "bg-red-50 text-red-700 border-red-100",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-semibold ${
        styles[role] ||
        "bg-gray-50 text-gray-600"
      }`}
    >
      {capitalize(role)}
    </span>
  );
};

// ==============================
// INFO CARD
// ==============================

const InfoCard = ({
  icon,
  title,
  value,
}) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs text-gray-400">
            {title}
          </p>

          <p className="mt-1 truncate font-semibold text-gray-800">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

// ==============================
// DETAIL ROW
// ==============================

const DetailRow = ({
  label,
  value,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="text-sm font-medium text-gray-900">
        {value}
      </p>
    </div>
  );
};

// ==============================
// SMALL INFO
// ==============================

const SmallInfo = ({
  icon,
  label,
  value,
}) => {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
      <div className="text-indigo-600">
        {icon}
      </div>

      <div>
        <p className="text-xs text-gray-400">
          {label}
        </p>

        <p className="mt-1 text-sm font-semibold text-gray-800">
          {value}
        </p>
      </div>
    </div>
  );
};

// ==============================
// HELPERS
// ==============================

const capitalize = (
  value = "",
) => {
  return (
    value
      .charAt(0)
      .toUpperCase() +
    value.slice(1)
  );
};

const getYearSuffix = (
  year,
) => {
  if (Number(year) === 1)
    return "st";

  if (Number(year) === 2)
    return "nd";

  if (Number(year) === 3)
    return "rd";

  return "th";
};

export default Profile;