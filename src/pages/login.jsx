import React from "react"
import { useState, useEffect } from "react"
import "./login.css"
import AuthLayout from "./AuthLayout"
import { assets } from "../assets/assets"
import { handleGoogleSignIn } from "./google" // Import the Google Sign-In function
import axios from "axios"
import { useNavigate } from "react-router-dom"

const { googleIcon } = assets

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [validationError, setValidationError] = useState("") // General validation error
  const [emailError, setEmailError] = useState("") // State for email validation error
  const [showPassword, setShowPassword] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false) // Track if the form has been submitted
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        const isTokenExpired = payload.exp * 1000 < Date.now()

        if (!isTokenExpired) {
          // User is already logged in, redirect to dashboard
          navigate("/formly", { replace: true })
        }
      } catch (error) {
        // Invalid token, do nothing
      }
    }
  }, [navigate])

  // Update the email validation to be more user-friendly
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Basic email format regex
    if (formData.email && !emailRegex.test(formData.email)) {
      setEmailError("Please enter a valid email address")
    } else {
      setEmailError("") // Clear error if email is valid or empty
    }
  }, [formData.email])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidationError("") // Clear any previous validation errors
    setFormSubmitted(true) // Mark the form as submitted

    // Check if both email and password are empty
    if (!formData.email && !formData.password) {
      setValidationError("Please provide an email and password.")
      return
    }

    if (!formData.email) {
      setValidationError("Please provide an email.")
      return
    }

    if (emailError) {
      setValidationError("Invalid email address.")
      return
    }

    if (!formData.password) {
      setValidationError("Please provide a password.")
      return
    }

    try {
      const response = await axios.post("https://formly-nu.vercel.app/formlydb/formly/src/backend/login.php", {
        email: formData.email,
        password: formData.password,
      })

      if (response.data.success) {
        const { token, user } = response.data // Assuming the backend returns a JWT token
        localStorage.setItem("token", token); // Store the token in localStorage
        localStorage.setItem("userId", user.id); // Store the userId in localStorage
        localStorage.setItem("email", user.email); // Store the token in localStorage
        navigate("/formly", { replace: true }) // Redirect and replace history entry
      } else {
        setValidationError(response.data.message || "Login failed. Please try again.")
      }
    } catch (err) {
      setValidationError("An error occurred. Please try again.")
    }
  }

  const isFieldEmpty = (fieldName) => {
    return formSubmitted && !formData[fieldName]
  }

  return (
    <AuthLayout>
      <div className="login-container">
        <h1>Login</h1>

        {/* Google Sign-In Button */}
        <button
          type="button"
          id="googleBtn"
          className="google-signin-button"
          onClick={() => handleGoogleSignIn(navigate, setValidationError)} // Pass setValidationError to handleGoogleSignIn
        >
          <img src={googleIcon || "/placeholder.svg"} alt="Google Logo" className="google-logo" />
          Sign in with Google
        </button>

        {/* Divider with text */}
        <div className="divider">
          <span>or continue with email</span>
        </div>

        {/* Login Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          {/* Update the email field to show the error styling more clearly */}
          <div
            className={`form-group ${emailError ? "input-error" : ""} ${isFieldEmpty("email") ? "input-error" : ""}`}
          >
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
            {emailError && <div className="email-error">{emailError}</div>}
          </div>
          <div className={`form-group ${isFieldEmpty("password") ? "input-error" : ""}`}>
            <label>Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div className="password-actions">
              <div className="show-password-container">
                <label className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    className="checkbox-input"
                    checked={showPassword}
                    onChange={() => setShowPassword(!showPassword)}
                  />
                  <span className="checkbox-custom"></span>
                  <span className="checkbox-label">Show password</span>
                </label>
              </div>
              <div className="forgot-password-container">
                <a href="/forgot-password" className="forgot-password-link">
                  Forgot Password?
                </a>
              </div>
            </div>
          </div>

          {/* Validation error message */}
          {validationError && <div className="validation-error">{validationError}</div>}

          <button type="submit" className="login-button">
            Login
          </button>
        </form>

        {/* Registration link */}
        <div className="login-link">
          Don't have an account?{" "}
          <a href="/register" className="login-text">
            Register
          </a>
        </div>
      </div>
    </AuthLayout>
  )
}

export default Login
