import {
  Navigate,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";

const ProtectedRoute = ({
  children,
  roles = [],
}) => {
  const {
    user,
    authLoading,
  } = useAuth();

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Checking authentication...
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    roles.length > 0 &&
    !roles.includes(
      user.role,
    )
  ) {
    return (
      <Navigate
        to={
          user.role ===
            "teacher" ||
          user.role ===
            "admin"
            ? "/teacher"
            : "/student"
        }
        replace
      />
    );
  }

  return children;
};

export default ProtectedRoute;