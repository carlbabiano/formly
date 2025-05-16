import React, { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate, useLocation } from "react-router-dom"
import "./login.css"
import AuthLayout from "./AuthLayout"

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const [responseMessage, setResponseMessage] = useState("")
  const [responseType, setResponseType] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Redirect to /formly if the user is already authenticated and on the login page
    const token = localStorage.getItem("token")
    if (token && location.pathname === "/") {
      // Use a timeout to prevent immediate re-rendering
      setTimeout(() => {
        navigate("/formly", { replace: true })
      }, 0)
    }
  }, [location.pathname, navigate]) // Add dependencies to ensure proper behavior

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.email.trim() || !formData.password.trim()) {
      setResponseMessage("Please fill in all fields.")
      setResponseType("error")
      return
    }

    setLoading(true)
    setResponseMessage("")

    try {
      const response = await axios.post("http://localhost/formlydb/formly/src/backend/login.php", formData, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.data.success) {
        // Store the token and username in localStorage
        localStorage.clear()

        // Pass the token, username, and navigate function to the parent component
        onLogin(response.data.token, response.data.username, response.data.email, response.data.userId, navigate)

        setResponseMessage("Login successful!")
        setResponseType("success")
        navigate("/formly", { replace: true }) // Redirect to /formly and replace the login page in the history stack
      } else {
        setResponseMessage(response.data.message || "Invalid credentials.")
        setResponseType("error")
      }
    } catch (error) {
      console.error("Login error:", error)
      setResponseMessage("An error occurred. Please try again.")
      setResponseType("error")
    } finally {
      setLoading(false)
    }
  }

  // Redirect to the register page
  const handleRegisterRedirect = () => {
    navigate("/register")
  }

  // Use the AuthLayout component to handle centering
  return (
    <AuthLayout>
      <div className="login-container">
        <h1>Welcome Back</h1>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        {responseMessage && <p className={`response-message ${responseType}`}>{responseMessage}</p>}
        <button type="button" className="register-button" onClick={handleRegisterRedirect}>
          Don't have an account? Sign up
        </button>
      </div>
    </AuthLayout>
  )
}

export default Login