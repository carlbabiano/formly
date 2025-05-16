import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./pages/login";
import Register from "./pages/register";
import Formly from "./pages/formly";
import BuilderPage from "./pages/builderpage";
import Answerpage from "./pages/answerpage";
import TemplateSelection from "./pages/template-selection";
import Navbar from "./components/navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";
import SurveyView from "./pages/SurveyView";
import axios from "axios";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
  
      try {
        const response = await axios.get(
          "http://localhost/formlydb/formly/src/backend/getUser.php",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
  
        if (response.data.success) {
          setUser(response.data.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserDetails();
  }, []); // Empty dependency array ensures this runs only once

  const loadRecentFormsAfterLogin = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost/formlydb/formly/src/backend/getRecentForms.php?userId=${userId}`
      );
      const recentForms = await response.json();

      // Update localStorage
      localStorage.setItem(`recentForms_${userId}`, JSON.stringify(recentForms));

      // Emit a custom event to notify other components
      const event = new Event("recentFormsUpdated");
      window.dispatchEvent(event);
    } catch (error) {
    }
  };

  const handleLogin = async (token, username, email, userId, navigate) => {
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    localStorage.setItem("email", email);
    localStorage.setItem("userId", userId);
  
    try {
      const userResponse = await axios.get(
        "http://localhost/formlydb/formly/src/backend/getUser.php",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (userResponse.data.success) {
        setUser(userResponse.data.user);
        setIsAuthenticated(true);
  
        // Load recent forms after login
        await loadRecentFormsAfterLogin(userId);
  
        // Navigate to Formly to trigger a re-render

        navigate("/formly", { replace: true });
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/formly"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Navbar user={user} />
              <Formly username={user?.username} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/AdminDashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Navbar user={user} />
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/survey/:id"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <SurveyView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/builderpage"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <BuilderPage currentUser={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/template-selection"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Navbar user={user} />
              <TemplateSelection />
            </ProtectedRoute>
          }
        />
        <Route
          path="/answerpage/:id"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Answerpage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;