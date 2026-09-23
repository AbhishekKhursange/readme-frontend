import React from "react";
import { Navigate } from "react-router-dom";

export default function RequireAdmin({ children }) {
  const stored = localStorage.getItem("ReadMe_user");
  const user = stored ? JSON.parse(stored) : null;

  if (!user || !user.admin) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
