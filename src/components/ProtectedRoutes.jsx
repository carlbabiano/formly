import React from "react";
import { Navigate, Outlet } from "react-router-dom";

// Function to check if a valid JWT token exists
const isAuthenticated = () => {
  const token = localStorage.getItem("token"); // Retrieve the token from localStorage
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1])); // Decode the JWT payload
    const isTokenExpired = payload.exp * 1000 < Date.now(); // Check if the token is expired
    return !isTokenExpired; // Return true if the token is valid
  } catch (error) {
    return false; // If decoding fails, treat the token as invalid
  }
};

const ProtectedRoutes = () => {
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" />; // Redirect to login if not authenticated
};

export default ProtectedRoutes;