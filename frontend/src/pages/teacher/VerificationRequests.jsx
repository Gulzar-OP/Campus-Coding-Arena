import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
  Clock3,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";

import toast from "react-hot-toast";

import api from "../../services/api";

const VerificationRequests = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [actionLoading, setActionLoading] =
    useState(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const { data } = await api.get(
        "/users/verification-requests",
      );

      setUsers(data.users || []);
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load requests",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredUsers = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    if (!keyword) return users;

    return users.filter((user) => {
      return (
        user.name
          ?.toLowerCase()
          .includes(keyword) ||
        user.email
          ?.toLowerCase()
          .includes(keyword) ||
        user.rollNo
          ?.toLowerCase()
          .includes(keyword) ||
        user.branch
          ?.toLowerCase()
          .includes(keyword)
      );
    });
  }, [search, users]);

  const handleVerify = async (
    userId,
  ) => {
    try {
      setActionLoading(userId);

      const { data } = await api.patch(
        `/users/${userId}/verify`,
      );

      toast.success(
        data.message ||
          "Student verified successfully",
      );

      setUsers((prev) =>
        prev.filter(
          (user) =>
            user._id !== userId,
        ),
      );
    } catch (error) {
      console.error(
        "VERIFY ERROR:",
        error.response?.data,
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to verify student",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemove = async (
    userId,
    name,
  ) => {
    const confirmed =
      window.confirm(
        `Are you sure you want to reject ${name}'s registration request?`,
      );

    if (!confirmed) return;

    try {
      setActionLoading(userId);

      const { data } = await api.delete(
        `/users/${userId}/remove-request`,
      );

      toast.success(
        data.message ||
          "Request removed successfully",
      );

      setUsers((prev) =>
        prev.filter(
          (user) =>
            user._id !== userId,
        ),
      );
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to remove request",
      );
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="relative mb-7 overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">

          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-violet-100 blur-3xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex items-start gap-4">

              <div className="flex h-13 w-13 items-center justify-center rounded-2xl border border-violet-200 bg-violet-50 shadow-sm">
                <UserCheck className="h-6 w-6 text-violet-600" />
              </div>

              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
                  Teacher Portal
                </p>

                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Verification Requests
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                  Review newly registered students
                  before allowing them to access
                  assessments.
                </p>
              </div>
            </div>

            <div className="inline-flex w-fit items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
                <Clock3 className="h-5 w-5 text-amber-500" />
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Pending Requests
                </p>

                <p className="text-xl font-bold text-slate-900">
                  {users.length}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* STATS */}
        <div className="mb-7 grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Pending
                </p>

                <p className="mt-2 text-2xl font-bold text-slate-900">
                  {users.length}
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 p-3">
                <Clock3 className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Status
                </p>

                <p className="mt-2 text-base font-semibold text-emerald-600">
                  Verification Active
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">
                  Access Type
                </p>

                <p className="mt-2 text-base font-semibold text-slate-900">
                  Student Only
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-3">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

        </div>

        {/* TOOLBAR */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div className="relative w-full sm:max-w-lg">

            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value,
                )
              }
              placeholder="Search student, email, roll number..."
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />

          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm">
            Showing{" "}
            <span className="font-semibold text-slate-900">
              {filteredUsers.length}
            </span>{" "}
            requests
          </div>

        </div>

        {/* LOADING */}
        {loading && (
          <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center shadow-sm">

            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-violet-600" />

            <p className="text-sm text-slate-500">
              Loading verification requests...
            </p>

          </div>
        )}

        {/* EMPTY STATE */}
        {!loading &&
          filteredUsers.length === 0 && (
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">

              <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-50 blur-3xl" />

              <div className="relative">

                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50">
                  <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                </div>

                <h2 className="text-xl font-semibold text-slate-900">
                  You're all caught up
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  There are currently no pending
                  student verification requests.
                  New registrations will appear
                  here automatically.
                </p>

                <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-600">
                  <ShieldCheck className="h-4 w-4" />
                  All requests reviewed
                </div>

              </div>
            </div>
          )}

        {/* REQUEST LIST */}
        {!loading &&
          filteredUsers.length > 0 && (
            <div className="space-y-3">

              {filteredUsers.map(
                (user) => (
                  <div
                    key={user._id}
                    className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:border-violet-200 hover:shadow-md"
                  >

                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                      {/* USER */}
                      <div className="flex min-w-0 items-center gap-4">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-blue-50 font-semibold text-violet-700">
                          {user.name
                            ?.charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate font-semibold text-slate-900">
                              {user.name}
                            </h3>

                            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-600">
                              Pending
                            </span>
                          </div>

                          <p className="mt-1 truncate text-sm text-slate-500">
                            {user.email}
                          </p>

                        </div>
                      </div>

                      {/* DETAILS */}
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:flex lg:items-center">

                        <InfoBox
                          label="Roll Number"
                          value={
                            user.rollNo ||
                            "N/A"
                          }
                        />

                        <InfoBox
                          label="Branch"
                          value={
                            user.branch ||
                            "N/A"
                          }
                        />

                        <InfoBox
                          label="Year"
                          value={
                            user.year
                              ? `Year ${user.year}`
                              : "N/A"
                          }
                        />

                      </div>

                      {/* ACTIONS */}
                      <div className="flex gap-3">

                        <button
                          onClick={() =>
                            handleVerify(
                              user._id,
                            )
                          }
                          disabled={
                            actionLoading ===
                            user._id
                          }
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 lg:flex-none"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Verify
                        </button>

                        <button
                          onClick={() =>
                            handleRemove(
                              user._id,
                              user.name,
                            )
                          }
                          disabled={
                            actionLoading ===
                            user._id
                          }
                          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50 lg:flex-none"
                        >
                          <Trash2 className="h-4 w-4" />
                          Reject
                        </button>

                      </div>

                    </div>
                  </div>
                ),
              )}

            </div>
          )}

      </div>
    </div>
  );
};

const InfoBox = ({
  label,
  value,
}) => {
  return (
    <div className="min-w-[110px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">

      <p className="text-[11px] uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-medium text-slate-700">
        {value}
      </p>

    </div>
  );
};

export default VerificationRequests;