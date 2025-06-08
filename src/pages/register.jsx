
import React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./register.css"
import AuthLayout from "./AuthLayout"
import { assets } from "../assets/assets"
import axios from "axios"
import { handleGoogleSignIn } from "./google" // Import the Google Sign-In function

const { googleIcon } = assets

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [validationError, setValidationError] = useState("")
  const [emailError, setEmailError] = useState("") // State for email validation error
  const [firstNameError, setFirstNameError] = useState("") // State for first name validation error
  const [lastNameError, setLastNameError] = useState("") // State for last name validation error
  const navigate = useNavigate()

  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: "",
    color: "",
  })

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

  // Real-time email validation
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Basic email format regex
    if (formData.email && !emailRegex.test(formData.email)) {
      setEmailError("Please enter a valid email address")
    } else {
      setEmailError("") // Clear error if email is valid or empty
    }
  }, [formData.email])

  // Calculate password strength in real-time
  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength({ score: 0, label: "", color: "" })
      return
    }

    let score = 0
    let label = ""
    let color = ""

    const password = formData.password

    // Length (max 30 pts)
    if (password.length >= 8) score += 10
    if (password.length >= 10) score += 10
    if (password.length >= 12) score += 10

    // Character variety (max 40 pts)
    let types = 0
    if (/[a-z]/.test(password)) types++
    if (/[A-Z]/.test(password)) types++
    if (/[0-9]/.test(password)) types++
    if (/[^A-Za-z0-9]/.test(password)) types++
    score += types * 10

    // Pattern checks (max 30 pts)
    if (password.length >= 8 && !/(.)\1{2,}/.test(password)) score += 10
    if (password.length >= 8 && !/(1234|abcd|qwerty|password|admin)/i.test(password)) score += 10
    if (password.length >= 8 && !/^\d{4,}$/.test(password)) score += 10

    // Label
    if (score < 40) {
      label = "Weak"
      color = "#ef4444"
    } else if (score < 65) {
      label = "Fair"
      color = "#f59e0b"
    } else if (score < 85) {
      label = "Good"
      color = "#3b82f6"
    } else {
      label = "Strong"
      color = "#10b981"
    }

    // Ensure the bar is full (100%) when the password is strong
    if (label === "Strong") {
      score = 100
    }

    setPasswordStrength({ score, label, color })
  }, [formData.password])

  // Real-time first name validation
  useEffect(() => {
    if (formData.firstName) {
      if (formData.firstName.length === 1) {
        setFirstNameError("first name too short")
      } else if (/[^a-zA-Z\s]/.test(formData.firstName)) {
        setFirstNameError("are you sure you type your first name correct?")
      } else {
        setFirstNameError("") // Clear error if valid
      }
    } else {
      setFirstNameError("") // Clear error if empty
    }
  }, [formData.firstName])

  // Real-time last name validation
  useEffect(() => {
    if (formData.lastName) {
      if (formData.lastName.length === 1) {
        setLastNameError("last name too short")
      } else if (/[^a-zA-Z\s]/.test(formData.lastName)) {
        setLastNameError("are you sure you type your first name correct?")
      } else {
        setLastNameError("") // Clear error if valid
      }
    } else {
      setLastNameError("") // Clear error if empty
    }
  }, [formData.lastName])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Mark the form as submitted to trigger validation styling
    setFormSubmitted(true)

    // Check if required fields are empty
    if (!formData.firstName || !formData.email || !formData.password) {
      setValidationError("Please fill in all required fields.")
      return // Stop submission if any required field is empty
    }

    // Check if the email is invalid
    if (emailError) {
      setValidationError("Please provide a valid email address.")
      return
    }

    // Check if the first name is invalid
    if (firstNameError) {
      setValidationError(firstNameError)
      return
    }

    // Check if the last name is invalid (only if last name is provided)
    if (formData.lastName && lastNameError) {
      setValidationError(lastNameError)
      return
    }

    // Check if the password strength is "Fair" or above
    if (passwordStrength.label === "Weak" || passwordStrength.label === "") {
      setValidationError("Password must be at least 'Fair' strength.")
      return // Stop submission if the password is too weak
    }

    // Clear validation error if all validations pass
    setValidationError("")

    // Submit the registration form
    try {
      const response = await axios.post(`${backendUrl}/register.php`, {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName || null,
      });
    
      if (response.data.success) {
        const { token, user } = response.data;
        localStorage.setItem("token", token);
        localStorage.setItem("userId", user.id);
        localStorage.setItem("email", user.email);
        navigate("/formly", { replace: true });
      } else {
        setValidationError(response.data.message || "Registration failed.");
      }
    } catch (err) {
      console.error("An error occurred during registration:", err);
      setValidationError("An error occurred. Please try again.");
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  // Check if a field is empty and the form has been submitted
  const isFieldEmpty = (fieldName) => {
    return formSubmitted && !formData[fieldName]
  }

  return (
    <AuthLayout>
      <div className="register-container">
        <h1>Create Account</h1>

        {/* Google Sign-In Button */}
        <button
          type="button"
          id="googleBtn"
          className="google-signin-button"
          onClick={() => handleGoogleSignIn(navigate, setValidationError)}
        >
          <img src={googleIcon || "/placeholder.svg"} alt="Google Logo" className="google-logo" />
          Continue with Google
        </button>

        {/* Divider with text */}
        <div className="divider">
          <span>or continue with email</span>
        </div>

        {/* Manual Registration Form */}
        <form className="register-form" onSubmit={handleSubmit}>
          <div
            className={`form-group ${firstNameError ? "input-error" : ""} ${isFieldEmpty("firstName") ? "input-error" : ""}`}
          >
            <label>First Name</label>
            <input
              type="text"
              name="firstName"
              placeholder="Enter your first name"
              value={formData.firstName}
              onChange={handleChange}
            />
            {firstNameError && <div className="email-error">{firstNameError}</div>}
          </div>

          <div className={`form-group ${lastNameError ? "input-error" : ""}`}>
            <label>Last Name (Optional)</label>
            <input
              type="text"
              name="lastName"
              placeholder="Enter your last name"
              value={formData.lastName}
              onChange={handleChange}
            />
            {lastNameError && <div className="email-error">{lastNameError}</div>}
          </div>

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
            {emailError && <div className="email-error">{emailError}</div>} {/* Email error message */}
          </div>

          <div className={`form-group ${isFieldEmpty("password") ? "input-glow" : ""}`}>
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
                    onChange={togglePasswordVisibility}
                  />
                  <span className="checkbox-custom"></span>
                  <span className="checkbox-label">Show password</span>
                </label>
              </div>
            </div>

            {/* Password strength indicator */}
            {formData.password && (
              <div className="password-strength">
                <div className="strength-header">
                  <span className="strength-label">Password strength:</span>
                  <span className="strength-text" style={{ color: passwordStrength.color }}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="strength-bar-container">
                  <div
                    className="strength-bar"
                    style={{
                      width: `${passwordStrength.score}%`,
                      backgroundColor: passwordStrength.color,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Validation error message */}
          {validationError && <div className="validation-error">{validationError}</div>}

          <button type="submit" className="register-button">
            Sign Up
          </button>
        </form>

        <div className="login-link">
          Already have an account?{" "}
          <a href="/login" className="login-text">
            Login
          </a>
        </div>
      </div>
    </AuthLayout>
  )
}

export default Register
