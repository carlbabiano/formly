import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ isAuthenticated, children }) => {
  // Redirect unauthenticated users to the login page
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Render the protected content if authenticated
  return children;
};

export default ProtectedRoute;