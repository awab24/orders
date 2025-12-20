import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RequireRole = ({ allowed, children }) => {
  const { user, role, loading, roleLoading } = useAuth();
  const location = useLocation();

  if (loading || roleLoading) {
    return <p className="muted">Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  if (!allowed.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RequireRole;
