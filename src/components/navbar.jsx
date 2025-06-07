import React from "react"
import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import "./navbar.css"
import { Moon } from "lucide-react"
import { handleLogout } from "../pages/google"
import { assets } from "../assets/assets";

const Navbar = ({ user }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState(user) // Local state for user data
  const location = useLocation()
  const navigate = useNavigate()

  // Update local user state when the `user` prop changes or when the token in localStorage changes
  useEffect(() => {
    const updateUserFromToken = () => {
      const token = localStorage.getItem("token")
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]))
          setCurrentUser({
            email: payload.email,
            firstName: payload.firstName,
            lastName: payload.lastName,
          })
        } catch (error) {
          console.error("Error decoding token:", error)
        }
      } else {
        setCurrentUser(null) // Clear user if no token is found
      }
    }

    // Update user on component mount
    updateUserFromToken()

    // Listen for changes in localStorage
    const handleStorageChange = () => {
      updateUserFromToken()
    }

    window.addEventListener("storage", handleStorageChange)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [user])

  const toggleProfile = (e) => {
    e.stopPropagation()
    setIsProfileOpen((prev) => !prev)
  }

  const logout = () => {
    handleLogout(navigate)
    setCurrentUser(null) // Clear user data on logout
    localStorage.removeItem("token") // Remove token from localStorage
  }

  const isActive = (path) => {
    const currentPath = location.pathname.split("?")[0].replace(/\/+$/, "")
    const targetPath = path.replace(/\/+$/, "")
    return currentPath === targetPath
  }

  const getUserInitials = () => {
    if (currentUser?.firstName) {
      return currentUser.firstName.charAt(0).toUpperCase()
    }
    return currentUser?.email?.charAt(0).toUpperCase() || "U"
  }

  return (
    <header className="navbar">
      <div className="navbar-left">
        <Link to="/formly" className="logo">
        <img src={assets.formlyLogo} alt="Formly Logo" className="logo-image" />
        </Link>
        <nav className="nav-links">
          <Link to="/formly" className={`nav-link ${isActive("/") ? "active" : ""}`}>
            Home
          </Link>
          <Link to="/AdminDashboard" className={`nav-link ${isActive("/AdminDashboard") ? "active" : ""}`}>
            My Forms
          </Link>
        </nav>
      </div>
      <div className="navbar-right">
        <div className="navbar-divider"></div>
        <button className="theme-toggle">
          <Moon size={18} />
        </button>
        <div className="profile-icon" onClick={toggleProfile}>
          {getUserInitials()}
        </div>
        {isProfileOpen && (
          <div className={`profile-container ${isProfileOpen ? "open" : ""}`}>
            <div className="profile-header">
              <div className="profile-name">
                {currentUser?.firstName || "First Name"} {currentUser?.lastName || ""}
              </div>
              <div className="profile-email">{currentUser?.email || "user@example.com"}</div>
            </div>
            <button className="logout-button" onClick={logout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar
