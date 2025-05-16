import React from "react";
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./navbar.css";
import { Grid, Bell, HelpCircle, LogOut } from "lucide-react";

const Navbar = ({ user }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const getUserInitials = () => {
    if (!user || !user.username) return "U";
    return user.username.charAt(0).toUpperCase();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isProfileOpen && !event.target.closest(".profile-icon") && !event.target.closest(".profile-container")) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen]);

  const toggleProfile = (e) => {
    e.stopPropagation();
    setIsProfileOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const recentFormsKey = `recentForms_${userId}`;
      const recentForms = localStorage.getItem(recentFormsKey);
  
      // Call the backend logout endpoint
      await fetch("http://localhost/formlydb/formly/src/backend/logout.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: localStorage.getItem("token"),
        }),
      });
  
      // Clear all localStorage data except recent forms
      localStorage.clear();
  
      if (recentForms) {
        localStorage.setItem(recentFormsKey, recentForms);
      }
  
      // Navigate to the login page and replace the current history entry
      navigate("/", { replace: true });
    } catch (error) {
    }
  };

  const isActive = (path) => {
    const currentPath = location.pathname.split("?")[0].replace(/\/+$/, ""); // Remove trailing slashes and query parameters
    const targetPath = path.replace(/\/+$/, ""); // Remove trailing slashes from the target path
  
    return currentPath === targetPath;
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <Link to="/" className="logo">
          <div className="logo-placeholder">LOGO</div>
        </Link>
        <nav className="nav-links">
          <Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>
            Home
          </Link>
          <Link to="/AdminDashboard" className={`nav-link ${isActive("/AdminDashboard") ? "active" : ""}`}>
            Admin
          </Link>
        </nav>
      </div>
      <div className="navbar-right">
        <button className="icon-btn">
          <Grid size={20} />
        </button>
        <button className="icon-btn">
          <Bell size={20} />
        </button>
        <button className="icon-btn">
          <HelpCircle size={20} />
        </button>
        <div className="profile-icon" onClick={toggleProfile}>
          {getUserInitials()}
        </div>
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
  );
};

export default Navbar;