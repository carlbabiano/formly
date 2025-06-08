
import React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./forgot-password.css"
import AuthLayout from "./AuthLayout"
import axios from "axios"

const ForgotPassword = () => {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [emailError, setEmailError] = useState("")
  const [codeSent, setCodeSent] = useState(false)
  const [otp, setOtp] = useState("")
  const [otpError, setOtpError] = useState("")
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [tempToken, setTempToken] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [confirmPasswordError, setConfirmPasswordError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [resettingPassword, setResettingPassword] = useState(false)
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [canTryAgainAt, setCanTryAgainAt] = useState("")
  const [remainingAttempts, setRemainingAttempts] = useState(null)
  const [errorType, setErrorType] = useState("")
  const navigate = useNavigate()

  // Password strength state
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    label: "",
    color: "",
  })

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const formatTimeRemaining = (targetTime) => {
    const now = new Date()
    const target = new Date(targetTime)
    const diff = target - now

    if (diff <= 0) {
      return "now"
    }

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""} and ${minutes} minute${minutes > 1 ? "s" : ""}`
    } else {
      return `${minutes} minute${minutes > 1 ? "s" : ""}`
    }
  }

  const handleSendCode = async (e) => {
    e.preventDefault()

    // Reset states
    setMessage("")
    setEmailError("")
    setIsRateLimited(false)
    setCanTryAgainAt("")
    setRemainingAttempts(null)
    setErrorType("")

    // Validate email
    if (!email) {
      setEmailError("Please enter your email address")
      return
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address")
      return
    }

    setIsLoading(true)

    try {
      const response = await axios.post("https://formly-production.up.railway.app/forgot-password.php", {
        email: email,
      })

      if (response.data.success) {
        setIsSuccess(true)
        setMessage("Password reset code has been sent to your email")
        setCodeSent(true)
        if (response.data.remaining_attempts !== undefined) {
          setRemainingAttempts(response.data.remaining_attempts)
        }
      } else {
        setIsSuccess(false)
        setErrorType(response.data.error_type || "")

        // Handle different error types
        if (response.data.error_type === "rate_limited") {
          setIsRateLimited(true)
          setCanTryAgainAt(response.data.can_try_again_at)
        }

        setMessage(response.data.message || "Failed to send reset code. Please try again.")
      }
    } catch (error) {
      setIsSuccess(false)
      setMessage("An error occurred. Please try again later.")
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()

    // Reset error state
    setOtpError("")
    setMessage("")

    // Validate OTP
    if (!otp) {
      setOtpError("Please enter the verification code")
      return
    }

    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setOtpError("Please enter a valid 6-digit code")
      return
    }

    setVerifyingOtp(true)

    try {
      const response = await axios.post("https://formly-production.up.railway.app/verify-otp.php", {
        email: email,
        otp: otp,
      })

      if (response.data.success) {
        setIsSuccess(true)
        setMessage("Code verified successfully. You can now reset your password.")
        setTempToken(response.data.temp_token)
      } else {
        setIsSuccess(false)
        setOtpError(response.data.message || "Invalid code. Please try again.")
      }
    } catch (error) {
      setIsSuccess(false)
      setOtpError("An error occurred. Please try again.")
      console.error("Error:", error)
    } finally {
      setVerifyingOtp(false)
    }
  }

  // Calculate password strength in real-time
  React.useEffect(() => {
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

  const handleResetPassword = async (e) => {
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

    setResettingPassword(true)

    try {
      const response = await axios.post("https://formly-production.up.railway.app/reset-password.php", {
        temp_token: tempToken,
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
      setResettingPassword(false)
    }
  }

  // Render different forms based on the current step
  const renderForm = () => {
    if (isRateLimited) {
      // Rate limited view
      return (
        <div className="rate-limit-container">
          <div className="response-message">{message}</div>

          {canTryAgainAt && (
            <div className="rate-limit-info">
              <p>Time remaining: {formatTimeRemaining(canTryAgainAt)}</p>
            </div>
          )}

          <div className="login-link">
            <a href="/login" className="login-text">
              Back to Login
            </a>
          </div>
        </div>
      )
    }

    if (!codeSent) {
      // Step 1: Email form
      return (
        <form className="login-form" onSubmit={handleSendCode}>
          <div className={`form-group ${emailError ? "input-error" : ""}`}>
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {emailError && <div className="email-error">{emailError}</div>}
          </div>

          {message && <div className={`response-message ${isSuccess ? "success" : ""}`}>{message}</div>}

          {remainingAttempts !== null && remainingAttempts > 0 && (
            <div className="attempts-remaining">
              <p>You have {remainingAttempts} password reset attempts remaining in the next 24 hours.</p>
            </div>
          )}

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Reset Code"}
          </button>

          <div className="login-link">
            <a href="/login" className="login-text">
              Back to Login
            </a>
          </div>
        </form>
      )
    } else if (!tempToken) {
      // Step 2: OTP verification form
      return (
        <form className="login-form" onSubmit={handleVerifyOtp}>
          <div className={`form-group ${otpError ? "input-error" : ""}`}>
            <label>Verification Code</label>
            <input
              type="text"
              name="otp"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              className="otp-input"
            />
            {otpError && <div className="email-error">{otpError}</div>}
          </div>

          {message && <div className={`response-message ${isSuccess ? "success" : ""}`}>{message}</div>}

          <button type="submit" className="login-button" disabled={verifyingOtp}>
            {verifyingOtp ? "Verifying..." : "Verify Code"}
          </button>

          <div className="login-link">
            <button type="button" onClick={handleSendCode} className="text-button" disabled={isLoading}>
              {isLoading ? "Sending..." : "Resend Code"}
            </button>
          </div>

          <div className="login-link">
            <a href="/login" className="login-text">
              Back to Login
            </a>
          </div>
        </form>
      )
    } else {
      // Step 3: New password form
      return (
        <form className="login-form" onSubmit={handleResetPassword}>
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

          <button type="submit" className="login-button" disabled={resettingPassword}>
            {resettingPassword ? "Resetting..." : "Reset Password"}
          </button>

          <div className="login-link">
            <a href="/login" className="login-text">
              Back to Login
            </a>
          </div>
        </form>
      )
    }
  }

  return (
    <AuthLayout>
      <div className="login-container">
        <h1>Reset Password</h1>
        {renderForm()}
      </div>
    </AuthLayout>
  )
}

export default ForgotPassword
