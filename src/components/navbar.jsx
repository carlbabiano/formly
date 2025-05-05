"use client"
import React from "react"
import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import "./navbar.css"
import { Grid, Bell, HelpCircle, LogOut } from "lucide-react"

const Navbar = ({ user }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const navigate = useNavigate()

  // Get user initials for the profile icon
  const getUserInitials = () => {
    if (!user || !user.username) return "U"
    return user.username.charAt(0).toUpperCase()
  }

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileOpen && !event.target.closest(".profile-icon") && !event.target.closest(".profile-container")) {
        setIsProfileOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isProfileOpen])

  const toggleProfile = (e) => {
    e.stopPropagation()
    setIsProfileOpen((prev) => !prev)
  }

  const handleLogout = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const recentFormsKey = `recentForms_${userId}`;
      const recentForms = localStorage.getItem(recentFormsKey); // Retrieve recent forms before clearing
  
      // Call the backend logout endpoint
      await fetch("http://localhost/systemsurvey/systemapp/src/backend/logout.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: localStorage.getItem("token"),
        }),
      });
  
      // Clear localStorage except for recent forms
      localStorage.clear();
  
      // Restore recent forms after clearing localStorage
      if (recentForms) {
        localStorage.setItem(recentFormsKey, recentForms);
      }
  
      // Redirect to login page
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <Link to="/" className="logo">
          <div className="logo-placeholder">LOGO</div>
        </Link>
        <nav className="nav-links">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/admin" className="nav-link">
            Admin
          </Link>
        </nav>
      </div>
      <div className="navbar-right">
        {/* Removed the "Create survey" button */}
        <button className="icon-btn">
          <Grid size={20} />
        </button>
        <button className="icon-btn">
          <Bell size={20} />
        </button>
        <button className="icon-btn">
          <HelpCircle size={20} />
        </button>

        {/* Profile Icon */}
        <div className="profile-icon" onClick={toggleProfile}>
          {getUserInitials()}
        </div>

        {/* Profile Dropdown */}
        {isProfileOpen && (
          <div className={`profile-container ${isProfileOpen ? "open" : ""}`}>
            <div className="profile-header">
              <div className="profile-name">{user?.username || "User"}</div>
              <div className="profile-email">{user?.email || "user@example.com"}</div>
            </div>
            <button className="logout-button" onClick={handleLogout}>
              <LogOut size={16} style={{ marginRight: "8px" }} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar
