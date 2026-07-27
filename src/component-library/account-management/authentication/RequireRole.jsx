import React, { useContext } from "react";
import { Navigate } from "react-router";
import UserContext from "../../../Context/UserContext";
import LoadingScreen from "../../utils/LoadingScreen";

const RequireRole = ({ children, allowedRoles = [], fallbackUrl }) => {
  const { user, token } = useContext(UserContext) || {};

  if (token == null) {
    return <Navigate to="/login" replace />;
  }

  if (user == null) {
    return <LoadingScreen message="Verifying permissions..." />;
  }

  const role = user.role || (user.is_superuser || user.is_staff ? "platform_admin" : "");

  if (!role) {
    return <Navigate to="/role-selection" replace />;
  }

  const isAllowed =
    allowedRoles.length === 0 ||
    allowedRoles.includes(role) ||
    role === "platform_admin" ||
    user.is_superuser;

  if (!isAllowed) {
    let target = "/student";
    if (role === "teacher") target = "/teacher";
    else if (role === "school_admin") target = "/school";
    else if (role === "platform_admin") target = "/admin-dashboard";

    return <Navigate to={fallbackUrl || target} replace />;
  }

  return children;
};

export default RequireRole;
