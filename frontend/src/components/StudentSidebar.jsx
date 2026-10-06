import {
  LayoutDashboard,
  KeyRound,
  Trophy,
  Code2,
  LogOut,
  Menu,
  X,
  ChevronRight,
  UserRound,
} from "lucide-react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  useState,
} from "react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import toast from "react-hot-toast";

import {
  useAuth,
} from "../context/AuthContext";

// ============================================================
// MENU
// ============================================================

const menu = [
  {
    name: "Dashboard",
    path: "/student",
    icon: LayoutDashboard,
  },
  // {
  //   name: "Join Test",
  //   path: "/student/join",
  //   icon: KeyRound,
  // },
  {
    name: "My Results",
    path: "/student/results",
    icon: Trophy,
  },
];

// ============================================================
// STUDENT SIDEBAR
// ============================================================

const StudentSidebar = () => {
  const navigate =
    useNavigate();

  const {
    logout,
    user,
  } = useAuth();

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout =
    async () => {
      try {
        await logout();

        toast.success(
          "Logged out successfully",
        );

        navigate(
          "/login",
          {
            replace: true,
          },
        );
      } catch (error) {
        console.error(
          "LOGOUT ERROR:",
          error,
        );

        toast.error(
          "Logout failed",
        );
      }
    };

  // ==========================================================
  // PROFILE
  // ==========================================================

  const handleProfile = () => {
    setMobileOpen(false);

    navigate(
      "/student/profile",
    );
  };

  const closeMobile = () => {
    setMobileOpen(false);
  };

  return (
    <>
      {/* ===================================================== */}
      {/* MOBILE TOP NAVBAR */}
      {/* ===================================================== */}

      <header
        className="
          fixed
          inset-x-0
          top-0
          z-40
          flex
          h-16
          items-center
          justify-between
          border-b
          border-gray-200/80
          bg-white/90
          px-4
          shadow-sm
          backdrop-blur-xl
          lg:hidden
        "
      >
        {/* LOGO */}

        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              bg-gradient-to-br
              from-indigo-500
              to-violet-600
              text-white
              shadow-md
              shadow-indigo-500/20
            "
          >
            <Code2 size={20} />
          </div>

          <div>
            <h1 className="text-sm font-bold tracking-tight text-gray-900">
              CodeAssess
            </h1>

            <div className="mt-0.5 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

              <p className="text-[10px] font-medium text-gray-400">
                Student Portal
              </p>
            </div>
          </div>
        </div>

        {/* MENU BUTTON */}

        <motion.button
          type="button"
          whileTap={{
            scale: 0.94,
          }}
          onClick={() =>
            setMobileOpen(true)
          }
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            border
            border-gray-200
            bg-gray-50
            text-gray-700
            transition
            hover:border-indigo-200
            hover:bg-indigo-50
            hover:text-indigo-600
          "
        >
          <Menu size={20} />
        </motion.button>
      </header>

      {/* ===================================================== */}
      {/* DESKTOP SIDEBAR */}
      {/* ===================================================== */}

      <aside
        className="
          relative
          hidden
          h-screen
          w-64
          shrink-0
          flex-col
          overflow-hidden
          border-r
          border-white/5
          bg-[#0f172a]
          text-white
          lg:flex
        "
      >
        <SidebarContent
          menu={menu}
          user={user}
          handleLogout={
            handleLogout
          }
          handleProfile={
            handleProfile
          }
        />
      </aside>

      {/* ===================================================== */}
      {/* MOBILE SIDEBAR */}
      {/* ===================================================== */}

      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* BACKDROP */}

            <motion.button
              type="button"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              onClick={
                closeMobile
              }
              className="
                fixed
                inset-0
                z-50
                bg-black/45
                backdrop-blur-[3px]
                lg:hidden
              "
            />

            {/* DRAWER */}

            <motion.aside
              initial={{
                x: "-100%",
              }}
              animate={{
                x: 0,
              }}
              exit={{
                x: "-100%",
              }}
              transition={{
                type: "spring",
                stiffness: 280,
                damping: 30,
              }}
              className="
                fixed
                inset-y-0
                left-0
                z-[60]
                flex
                w-[285px]
                flex-col
                overflow-hidden
                border-r
                border-white/5
                bg-[#0f172a]
                text-white
                shadow-2xl
                lg:hidden
              "
            >
              {/* CLOSE */}

              <motion.button
                type="button"
                whileTap={{
                  scale: 0.92,
                }}
                onClick={
                  closeMobile
                }
                className="
                  absolute
                  right-4
                  top-4
                  z-20
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-white/5
                  bg-white/5
                  text-slate-300
                  transition
                  hover:bg-white/10
                  hover:text-white
                "
              >
                <X size={18} />
              </motion.button>

              <SidebarContent
                menu={menu}
                user={user}
                handleLogout={
                  handleLogout
                }
                handleProfile={
                  handleProfile
                }
                onNavigate={
                  closeMobile
                }
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

// ============================================================
// SIDEBAR CONTENT
// ============================================================

const SidebarContent = ({
  menu,
  user,
  handleLogout,
  handleProfile,
  onNavigate,
}) => {
  const getInitials = () => {
    if (!user?.name) {
      return "S";
    }

    return user.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (word) =>
          word[0]?.toUpperCase(),
      )
      .join("");
  };

  return (
    <div className="relative flex h-full flex-col">
      {/* ===================================================== */}
      {/* BACKGROUND GLOW */}
      {/* ===================================================== */}

      <div
        className="
          pointer-events-none
          absolute
          -left-20
          -top-20
          h-52
          w-52
          rounded-full
          bg-indigo-600/20
          blur-[90px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-20
          -right-20
          h-52
          w-52
          rounded-full
          bg-violet-600/10
          blur-[90px]
        "
      />

      {/* ===================================================== */}
      {/* LOGO */}
      {/* ===================================================== */}

      <div className="relative px-5 pb-7 pt-6">
        <div className="flex items-center gap-3">
          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-2xl
              bg-gradient-to-br
              from-indigo-500
              to-violet-600
              text-white
              shadow-lg
              shadow-indigo-500/20
            "
          >
            <Code2 size={23} />
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">
              CodeAssess
            </h1>

            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

              <p className="text-[11px] font-medium text-slate-400">
                Student Portal
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* DIVIDER */}

      <div className="mx-5 h-px bg-white/5" />

      {/* ===================================================== */}
      {/* NAVIGATION */}
      {/* ===================================================== */}

      <nav className="relative flex-1 overflow-y-auto px-3 py-6">
        <p
          className="
            mb-3
            px-3
            text-[10px]
            font-bold
            uppercase
            tracking-[0.16em]
            text-slate-500
          "
        >
          Workspace
        </p>

        <div className="space-y-1.5">
          {menu.map(
            (item) => {
              const Icon =
                item.icon;

              return (
                <NavLink
                  key={
                    item.name
                  }
                  to={
                    item.path
                  }
                  end={
                    item.path ===
                    "/student"
                  }
                  onClick={
                    onNavigate
                  }
                  className={({
                    isActive,
                  }) =>
                    `
                      group
                      relative
                      flex
                      items-center
                      gap-3
                      overflow-hidden
                      rounded-xl
                      px-3.5
                      py-3
                      text-sm
                      font-medium
                      transition-all
                      duration-200

                      ${
                        isActive
                          ? "text-white shadow-md shadow-indigo-900/20"
                          : "text-slate-400 hover:bg-white/5 hover:text-white"
                      }
                    `
                  }
                >
                  {({
                    isActive,
                  }) => (
                    <>
                      {/* ACTIVE BG */}

                      {isActive && (
                        <motion.div
                          layoutId="student-sidebar-active"
                          className="
                            absolute
                            inset-0
                            bg-gradient-to-r
                            from-indigo-600
                            to-violet-600
                          "
                          transition={{
                            type: "spring",
                            stiffness:
                              350,
                            damping:
                              30,
                          }}
                        />
                      )}

                      {/* LINK CONTENT */}

                      <div className="relative z-10 flex w-full items-center gap-3">
                        <div
                          className={`
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            transition

                            ${
                              isActive
                                ? "bg-white/10 text-white"
                                : "bg-white/[0.03] text-slate-400 group-hover:bg-white/5 group-hover:text-white"
                            }
                          `}
                        >
                          <Icon
                            size={18}
                          />
                        </div>

                        <span className="flex-1">
                          {
                            item.name
                          }
                        </span>

                        <ChevronRight
                          size={15}
                          className={`
                            transition-all

                            ${
                              isActive
                                ? "translate-x-0 opacity-100"
                                : "-translate-x-1 opacity-0 group-hover:translate-x-0 group-hover:opacity-60"
                            }
                          `}
                        />
                      </div>
                    </>
                  )}
                </NavLink>
              );
            },
          )}
        </div>
      </nav>

      {/* ===================================================== */}
      {/* BOTTOM USER */}
      {/* ===================================================== */}

      <div className="relative border-t border-white/5 bg-[#0b1220]/30 p-4">
        {/* STUDENT PROFILE */}

        <motion.button
          type="button"
          whileHover={{
            y: -1,
          }}
          whileTap={{
            scale: 0.98,
          }}
          onClick={
            handleProfile
          }
          className="
            group
            mb-3
            flex
            w-full
            items-center
            gap-3
            rounded-2xl
            border
            border-white/[0.06]
            bg-white/[0.035]
            p-3
            text-left
            transition
            hover:border-indigo-400/20
            hover:bg-white/[0.07]
          "
        >
          {/* AVATAR */}

          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-gradient-to-br
              from-indigo-500
              to-violet-500
              text-sm
              font-bold
              uppercase
              text-white
              shadow-lg
              shadow-indigo-950/30
            "
          >
            {getInitials()}
          </div>

          {/* USER DETAILS */}

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {user?.name ||
                "Student"}
            </p>

            <div className="mt-1 flex items-center gap-1.5">
              <UserRound
                size={11}
                className="text-indigo-300"
              />

              <p className="text-[11px] font-medium text-slate-400">
                Student Account
              </p>
            </div>
          </div>

          <ChevronRight
            size={16}
            className="
              shrink-0
              -translate-x-1
              text-slate-500
              opacity-0
              transition-all
              group-hover:translate-x-0
              group-hover:text-indigo-300
              group-hover:opacity-100
            "
          />
        </motion.button>

        {/* LOGOUT */}

        <motion.button
          type="button"
          whileTap={{
            scale: 0.98,
          }}
          onClick={
            handleLogout
          }
          className="
            group
            flex
            w-full
            items-center
            gap-3
            rounded-xl
            px-3
            py-3
            text-sm
            font-medium
            text-slate-400
            transition
            hover:bg-red-500/10
            hover:text-red-400
          "
        >
          <div
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              bg-white/[0.03]
              transition
              group-hover:bg-red-500/10
            "
          >
            <LogOut
              size={17}
            />
          </div>

          <span className="flex-1 text-left">
            Logout
          </span>

          <ChevronRight
            size={15}
            className="opacity-0 transition group-hover:opacity-60"
          />
        </motion.button>
      </div>
    </div>
  );
};

export default StudentSidebar;