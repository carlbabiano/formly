import React from "react"

import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import "./register.css"
import AuthLayout from "./AuthLayout"

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  })

  const [responseMessage, setResponseMessage] = useState("")
  const [responseType, setResponseType] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Basic validation
    if (!formData.username || !formData.email || !formData.password) {
      setResponseMessage("Please fill in all fields.")
      setResponseType("error")
      return
    }

    setLoading(true)
    setResponseMessage("")

    try {
      const response = await axios.post("http://localhost/systemsurvey/systemapp/src/backend/register.php", formData, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      // Handle success response
      if (response.data.success) {
        setResponseMessage("Registration successful! Redirecting to login...")
        setResponseType("success")
        setTimeout(() => navigate("/"), 2000) // Redirect to login page after 2 seconds
      } else {
        setResponseMessage(response.data.message)
        setResponseType("error")
      }
    } catch (error) {
      // Handle error response
      setResponseMessage(error.response?.data?.message || "An error occurred. Please try again.")
      setResponseType("error")
    } finally {
      setLoading(false)
    }
  }

  // Handle navigation to the login page
  const handleLoginRedirect = () => {
    navigate("/")
  }

  // Use the AuthLayout component to handle centering
  return (
    <AuthLayout>
      <div className="register-container">
        <h1>Create Account</h1>
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="register-button" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>
        {responseMessage && <p className={`response-message ${responseType}`}>{responseMessage}</p>}
        <button type="button" className="login-button" onClick={handleLoginRedirect}>
          Already have an account? Login
        </button>
      </div>
    </AuthLayout>
  )
}

export default Register
