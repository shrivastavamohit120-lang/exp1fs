// src/components/ProtectedRoute.jsx
//
// Route guard (Experiment 3, section 7).
//   <ProtectedRoute> children </ProtectedRoute>                -> any logged-in user
//   <ProtectedRoute allowedRoles={["admin"]}> ... </ProtectedRoute>  -> RBAC-restricted

import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="page-loading">Checking session…</div>;
  }

  if (!isAuthenticated) {
    // Remember where they were headed so Login can send them back.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
