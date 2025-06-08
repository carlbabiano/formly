import React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import "./login.css" // Reusing login styles
import AuthLayout from "./AuthLayout"
import axios from "axios"

const ResetPassword = () => {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [token, setToken] = useState("")
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [confirmPasswordError, setConfirmPasswordError] = useState("")
  const [tokenValid, setTokenValid] = useState(true)
  const [isVerifying, setIsVerifying] = useState(true)

  const navigate = useNavigate()
  const location = useLocation()

  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: "",
    color: "",
  })

  useEffect(() => {
    // Extract token from URL query parameters
    const queryParams = new URLSearchParams(location.search)
    const tokenFromUrl = queryParams.get("token")

    if (tokenFromUrl) {
      setToken(tokenFromUrl)
      // Verify token validity
      verifyToken(tokenFromUrl)
    } else {
      setIsVerifying(false)
      setTokenValid(false)
      setMessage("Invalid or missing reset token. Please request a new password reset link.")
    }
  }, [location])

  const verifyToken = async (token) => {
    setIsVerifying(true)
    try {
      const response = await axios.post("https://formly-production.up.railway.app/verify-token.php", {
        token: token,
      })

      if (!response.data.success) {
        setTokenValid(false)
        setMessage(response.data.message || "Invalid or expired token. Please request a new password reset link.")
      }
    } catch (error) {
      setTokenValid(false)
      setMessage("An error occurred. Please try again later.")
      console.error("Error:", error)
    } finally {
      setIsVerifying(false)
    }
  }

  // Calculate password strength in real-time
  useEffect(() => {
    if (!password) {
      setPasswordStrength({ score: 0, label: "", color: "" })
      return
    }

    let score = 0
    let label = ""
    let color = ""

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
  }, [password])

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Reset error states
    setPasswordError("")
    setConfirmPasswordError("")
    setMessage("")

    // Validate password
    if (!password) {
      setPasswordError("Please enter a new password")
      return
    }

    if (passwordStrength.label === "Weak" || passwordStrength.label === "") {
      setPasswordError("Password must be at least 'Fair' strength")
      return
    }

    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password")
      return
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      const response = await axios.post("https://formly-1edkal5au-zxcv123s-projects.vercel.app/formlydb/formly/src/backend/reset-password.php", {
        token: token,
        password: password,
      })

      if (response.data.success) {
        setIsSuccess(true)
        setMessage("Your password has been reset successfully. You will be redirected to login page.")

        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate("/login")
        }, 3000)
      } else {
        setIsSuccess(false)
        setMessage(response.data.message || "Failed to reset password. Please try again.")
      }
    } catch (error) {
      setIsSuccess(false)
      setMessage("An error occurred. Please try again later.")
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="login-container">
        <h1>Reset Password</h1>

        {isVerifying ? (
          <div className="loading-message">Verifying your reset link...</div>
        ) : !tokenValid ? (
          <div className="response-message">
            {message}
            <div className="login-link" style={{ marginTop: "1rem" }}>
              <a href="/forgot-password" className="login-text">
                Request New Reset Link
              </a>
            </div>
          </div>
        ) : (
          <form className="login-form" onSubmit={handleSubmit}>
            <div className={`form-group ${passwordError ? "input-error" : ""}`}>
              <label>New Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {passwordError && <div className="email-error">{passwordError}</div>}

              {/* Password strength indicator */}
              {password && (
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

            <div className={`form-group ${confirmPasswordError ? "input-error" : ""}`}>
              <label>Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              {confirmPasswordError && <div className="email-error">{confirmPasswordError}</div>}
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
            </div>

            {message && <div className={`response-message ${isSuccess ? "success" : ""}`}>{message}</div>}

            <button type="submit" className="login-button" disabled={isLoading || !tokenValid}>
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>

            <div className="login-link">
              <a href="/login" className="login-text">
                Back to Login
              </a>
            </div>
          </form>
        )}
      </div>
    </AuthLayout>
  )
}

export default ResetPassword
