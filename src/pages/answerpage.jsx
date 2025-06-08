import React from "react"
import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { assets } from "../assets/assets"
import {
  FileText,
  List,
  AlignLeft,
  CheckSquare,
  Star,
  ChevronDown,
  BarChart,
  Calendar,
  CheckCircle2,
  Grid,
  Clock,
  MoveVertical,
  Heart,
  ThumbsUp,
  XCircle,
  Mail,
} from "lucide-react"
import ReactDatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import "./builderpage.css"

function AnswerPage() {
  const { id: surveyId } = useParams()
  const [survey, setSurvey] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState({})
  const [hoveredRatings, setHoveredRatings] = useState({})
  const [creatorEmail, setCreatorEmail] = useState("")
  const [isAcceptingResponses, setIsAcceptingResponses] = useState(true)
  const [respondentEmail, setRespondentEmail] = useState("")
  const [validationErrors, setValidationErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getSessionData = (key) => {
    try {
      return sessionStorage.getItem(key)
    } catch (error) {
      console.error("Error accessing sessionStorage:", error)
      return null
    }
  }

  const setSessionData = (key, value) => {
    try {
      sessionStorage.setItem(key, value)
    } catch (error) {
      console.error("Error setting sessionStorage:", error)
    }
  }

  const removeSessionData = (key) => {
    try {
      sessionStorage.removeItem(key)
    } catch (error) {
      console.error("Error removing from sessionStorage:", error)
    }
  }

  useEffect(() => {
    removeSessionData("answerPageUserData")
    setSessionData("isPublicAnswerSession", "true")

    return () => {
      removeSessionData("isPublicAnswerSession")
    }
  }, [])

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        console.log("Survey ID from URL:", surveyId)
        const response = await fetch(`https://formly-production.up.railway.app/getSurvey.php?id=${surveyId}`)
        const data = await response.json()
        console.log("Backend Response:", data)

        if (data.success) {
          console.log("Survey Data:", data.survey)

          const acceptingResponses = data.survey.accepting_responses !== "0" && data.survey.accepting_responses !== 0
          setIsAcceptingResponses(acceptingResponses)

          const transformedSurvey = {
            ...data.survey,
            questions: data.survey.questions.map((q) => {
              let questionType = q.question_type || q.type

              if (q.question_type === "rating") {
                questionType = "rating"
              } else if (["linear scaling", "linear-scaling", "linear-scaling"].includes(q.question_type)) {
                questionType = "linear-scaling"
              }

              return {
                id: q.id,
                type: questionType,
                title: q.question_text || q.title,
                required: q.required === "1" || q.required === 1 || q.required === true,
                options: typeof q.options === "string" ? JSON.parse(q.options) : q.options,
                rows:
                  questionType === "multi-grid" || questionType === "checkbox-grid"
                    ? typeof q.rows === "string"
                      ? JSON.parse(q.rows || "[]")
                      : q.rows || []
                    : undefined,
                columns:
                  questionType === "multi-grid" || questionType === "checkbox-grid"
                    ? typeof q.columns === "string"
                      ? JSON.parse(q.columns || "[]")
                      : q.columns || []
                    : undefined,
                answers:
                  questionType === "multi-grid" || questionType === "checkbox-grid" ? q.answers || {} : undefined,
                minValue:
                  questionType === "linear-scaling" ? Number.parseInt(q.min_value || q.minValue || 1, 10) : null,
                maxValue:
                  questionType === "linear-scaling" ? Number.parseInt(q.max_value || q.maxValue || 10, 10) : null,
                minLabel: questionType === "linear-scaling" ? q.min_label || q.minLabel || "Min" : undefined,
                maxLabel: questionType === "linear-scaling" ? q.max_label || q.maxLabel || "Max" : undefined,
                ratingScale:
                  questionType === "rating" && q.rating_scale !== undefined
                    ? Number.parseInt(q.rating_scale, 10)
                    : null,
                ratingShape: questionType === "rating" && q.rating_shape !== undefined ? q.rating_shape : null,
              }
            }),
          }

          console.log("Transformed Survey:", transformedSurvey)
          setSurvey(transformedSurvey)
          setCreatorEmail(data.survey.creator_email || "")
        } else {
          setError(data.message || "Failed to fetch survey.")
        }
      } catch (err) {
        console.error("Error fetching survey:", err)
        setError("An error occurred while fetching the survey.")
      } finally {
        setLoading(false)
      }
    }

    if (surveyId) {
      fetchSurvey()
    } else {
      setError("Invalid survey ID.")
      setLoading(false)
    }
  }, [surveyId])

  const validateForm = () => {
    const errors = {}
  
    // Validate required questions
    survey.questions.forEach((question) => {
      const answer = answers[question.id]
  
      switch (question.type) {
        case "multiple-choice":
        case "dropdown":
        case "rating":
        case "linear-scaling":
        case "yes-no":
        case "date":
        case "time":
          if (answer === undefined || answer === null || answer === "") {
            // Remove validation error for required questions
            // errors[question.id] = "This question is required"
          }
          break
  
        case "short-text":
        case "long-text":
          if (!answer || answer.trim() === "") {
            // Remove validation error for required questions
            // errors[question.id] = "This question is required"
          }
          break
  
        case "checkbox":
          if (!answer || !Array.isArray(answer) || answer.length === 0) {
            // Remove validation error for required questions
            // errors[question.id] = "Please select at least one option"
          }
          break
  
        case "ranking":
          if (!answer || answer.length === 0) {
            // Remove validation error for required questions
            // errors[question.id] = "Please rank the items"
          }
          break
  
        case "multi-grid":
          if (!answer || Object.keys(answer).length === 0) {
            // Remove validation error for required questions
            // errors[question.id] = "Please answer all rows"
          } else {
            const requiredRows = question.rows?.length || 0
            const answeredRows = Object.keys(answer).length
            if (answeredRows < requiredRows) {
              // Remove validation error for required questions
              // errors[question.id] = "Please answer all rows"
            }
          }
          break
  
        case "checkbox-grid":
          if (!answer || Object.keys(answer).length === 0) {
            // Remove validation error for required questions
            // errors[question.id] = "Please select at least one option"
          }
          break
      }
    })
  
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => {
      const updatedAnswers = {
        ...prev,
        [questionId]: value,
      }
      console.log("Updated answers:", updatedAnswers)

      setSessionData(`survey_${surveyId}_answers`, JSON.stringify(updatedAnswers))

      // Clear validation error for this question
      if (validationErrors[questionId]) {
        setValidationErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[questionId]
          return newErrors
        })
      }

      return updatedAnswers
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (isSubmitting) return;
  
    // Validate email before submitting
    if (!respondentEmail) {
      setValidationErrors((prev) => ({ ...prev, email: "Email is required." }));
      alert("Please provide a valid email address.");
      return;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(respondentEmail)) {
      setValidationErrors((prev) => ({ ...prev, email: "Invalid email format." }));
      alert("Please provide a valid email address.");
      return;
    }
  
    if (!validateForm()) {
      alert("Please fill in all required fields before submitting.");
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      const response = await fetch("https://formly-production.up.railway.app/submitSurvey.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surveyId,
          answers,
          respondentEmail: respondentEmail || "anonymous@example.com",
        }),
      });
      const data = await response.json();
  
      if (data.success) {
        alert("Survey submitted successfully!");
        // Keep the email in state
        setValidationErrors({});
      } else {
        alert(`Failed to submit survey: ${data.message}`);
      }
    } catch (err) {
      console.error("Error submitting survey:", err);
      alert("An error occurred while submitting the survey.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGridAnswerChange = (questionId, rowIndex, colIndex) => {
    setAnswers((prev) => {
      const currentQuestionAnswers = prev[questionId] || {}
      const updatedAnswers = {
        ...prev,
        [questionId]: {
          ...currentQuestionAnswers,
          [`row_${rowIndex}`]: colIndex,
        },
      }

      setSessionData(`survey_${surveyId}_answers`, JSON.stringify(updatedAnswers))

      return updatedAnswers
    })
  }

  useEffect(() => {
    const savedAnswers = getSessionData(`survey_${surveyId}_answers`)
    if (savedAnswers) {
      try {
        setAnswers(JSON.parse(savedAnswers))
      } catch (error) {
        console.error("Error parsing saved answers:", error)
      }
    }
  }, [surveyId])

  const renderRatingIcon = (shape, index, isActive, isHovered, currentQuestion) => {
    switch (shape) {
      case "emoji":
        const emojis = currentQuestion.ratingScale === 3 ? ["😡", "😐", "😁"] : ["😡", "😠", "😕", "🙂", "😁"]
        return (
          <span className={`rating-emoji ${isActive ? "active" : ""} ${isHovered ? "hovered" : ""}`}>
            {emojis[index]}
          </span>
        )
      case "star":
        return (
          <Star
            size={32}
            className={`rating-icon rating-star ${isActive ? "active" : ""} ${isHovered ? "hovered" : ""}`}
          />
        )
      case "heart":
        return (
          <Heart
            size={32}
            className={`rating-icon rating-heart ${isActive ? "active" : ""} ${isHovered ? "hovered" : ""}`}
          />
        )
      case "like":
        return (
          <div className="rating-thumbs-container">
            <ThumbsUp
              size={32}
              className={`rating-icon rating-thumbs-fill ${isActive ? "active" : ""} ${isHovered ? "hovered" : ""}`}
            />
            <ThumbsUp
              size={32}
              className={`rating-icon rating-thumbs-base ${isActive ? "active" : ""} ${isHovered ? "hovered" : ""}`}
            />
          </div>
        )
      default:
        return (
          <Star
            size={32}
            className={`rating-icon rating-star ${isActive ? "active" : ""} ${isHovered ? "hovered" : ""}`}
          />
        )
    }
  }

  const handleRankingDragStart = (e, questionId, itemIndex) => {
    e.dataTransfer.setData("itemIndex", itemIndex)
    e.dataTransfer.setData("questionId", questionId)
  }

  const handleRankingDrop = (e, questionId, targetIndex) => {
    e.preventDefault()
    const sourceIndex = Number(e.dataTransfer.getData("itemIndex"))
    const sourceQuestionId = e.dataTransfer.getData("questionId")

    if (sourceQuestionId !== questionId.toString()) return

    setAnswers((prevAnswers) => {
      const currentOptions = survey.questions.find((q) => q.id === questionId)?.options || []
      const currentRankOrder = prevAnswers[questionId] || currentOptions
      const updatedRankOrder = [...currentRankOrder]

      const [movedItem] = updatedRankOrder.splice(sourceIndex, 1)
      updatedRankOrder.splice(targetIndex, 0, movedItem)

      const newAnswers = {
        ...prevAnswers,
        [questionId]: updatedRankOrder,
      }

      setSessionData(`survey_${surveyId}_answers`, JSON.stringify(newAnswers))

      return newAnswers
    })
  }

  if (loading) {
    return (
      <div className="survey-builder">
        <div className="loading-state">Loading survey...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="survey-builder">
        <div className="error-message">
          <p>Error: {error}</p>
        </div>
      </div>
    )
  }

  if (!survey || !survey.questions) {
    return (
      <div className="survey-builder">
        <div className="error-message">No survey found or no questions available.</div>
      </div>
    )
  }

  if (!isAcceptingResponses) {
    return (
      <div className="survey-builder">
        <header className="survey-header">
          <div className="logo">
            <div className="logo-icon">
              <img src={assets?.formlyLogo || "/placeholder.svg"} alt="Formly Logo" className="logo-image" />
            </div>
            <h1>Formly</h1>
          </div>
        </header>
        <div className="survey-content">
          <div className="survey-questions-panel">
            <div className="not-accepting-container">
              <div className="not-accepting-icon">
                <svg className="lock-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>

              <h2>Form Not Accepting Responses</h2>
              <p className="not-accepting-subtitle">This form is no longer accepting new responses.</p>

              <div className="not-accepting-details">
                <h3>{survey?.title || "Untitled Survey"}</h3>
                {survey?.description && <p>{survey.description}</p>}

                <div className="survey-meta">
                  <div className="survey-meta-item">
                    <svg className="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span>{survey?.questions?.length || 0} Questions</span>
                  </div>
                  <div className="survey-meta-item">
                    <span>Created by: {creatorEmail}</span>
                  </div>
                </div>
              </div>

              <div className="contact-notice">Contact the form creator if you believe this is an error.</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="survey-builder">
      <header className="survey-header">
        <div className="logo">
          <div className="logo-icon">
            <img src={assets.formlyLogo || "/placeholder.svg"} alt="Formly Logo" className="logo-image" />
          </div>
          <h1>Formly</h1>
        </div>
        <div className="header-actions">
          <div className="question-count-badge">
            <FileText size={16} />
            <span>{survey?.questions?.length || 0} Questions</span>
          </div>
        </div>
      </header>

      <div className="survey-content">
        <div className="survey-questions-panel">
          <div className="preview-header">
            <h2>Created By:</h2>
            <p className="created-by">{creatorEmail || "Loading..."}</p>
          </div>
          <div className="email-input-section">
            <h2 className="email-input-title">
              Answered By: <span className="required-asterisk">*</span>
            </h2>
            <input
              className={`email-input ${validationErrors.email ? "error" : ""}`}
              type="email"
              value={respondentEmail}
              onChange={(e) => {
                const email = e.target.value;
                setRespondentEmail(email);

                // Real-time email validation
                if (!email) {
                  setValidationErrors((prev) => ({ ...prev, email: "Email is required." }));
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                  setValidationErrors((prev) => ({ ...prev, email: "Invalid email format." }));
                } else {
                  setValidationErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.email;
                    return newErrors;
                  });
                }
              }}
              placeholder="Enter your email..."
              required
            />
            {validationErrors.email && <div className="validation-error">{validationErrors.email}</div>}
          </div>

          <div className="survey-title-card preview-card">
            <div>
              <h2 className="survey-title-preview">{survey?.title || "Untitled Survey"}</h2>
              {survey?.description && <p className="survey-description-preview">{survey.description}</p>}
            </div>
          </div>


          <div className="survey-questions-list">
            {survey.questions.map((question) => {
              const questionType = question.type
              const questionTitle = question.title
              const isRequired = question.required
              const options = question.options || []
              const hasError = validationErrors[question.id]

              return (
                <div key={question.id} className={`question-card preview-card ${hasError ? "error" : ""}`}>
                  {questionType === "multiple-choice" ? (
                    <div className="multiple-choice-question">
                      <div className="question-header">
                        <div className="question-icon">
                          <List size={18} />
                        </div>
                        <div className="question-title-preview">
                          {questionTitle || "Untitled Question"}
                          {isRequired && <span className="required-indicator">*</span>}
                        </div>
                      </div>
                      <div className="options-list">
                        {options.map((option, index) => (
                          <div key={index} className="option-item">
                            <input
                              type="radio"
                              name={`multiple-choice-${question.id}`}
                              id={`radio-${question.id}-${index}`}
                              checked={answers[question.id] === index}
                              onChange={() => handleAnswerChange(question.id, index)}
                              style={{
                                cursor: "pointer",
                                width: "18px",
                                height: "18px",
                                backgroundColor: "white",
                                appearance: "none",
                                border:
                                  answers[question.id] === index ? "4px solid var(--primary-color)" : "1px solid #ccc",
                                borderRadius: "50%",
                                outline: "none",
                              }}
                            />
                            <span className="option-input-preview">{option || `Option ${index + 1}`}</span>
                          </div>
                        ))}
                      </div>
                      {hasError && <div className="validation-error">{hasError}</div>}
                    </div>
                  ) : questionType === "short-text" ? (
                    <div className="short-text-question">
                      <div className="question-header">
                        <div className="question-icon">
                          <FileText size={18} />
                        </div>
                        <div className="question-title-preview">
                          {questionTitle || "Untitled Question"}
                          {isRequired && <span className="required-indicator">*</span>}
                        </div>
                      </div>
                      <input
                        className="short-text-input"
                        value={answers[question.id] || ""}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        placeholder="Your answer..."
                      />
                      {hasError && <div className="validation-error">{hasError}</div>}
                    </div>
                  ) : questionType === "long-text" ? (
                    <div className="long-text-question">
                      <div className="question-header">
                        <div className="question-icon">
                          <AlignLeft size={18} />
                        </div>
                        <div className="question-title-preview">
                          {questionTitle || "Untitled Question"}
                          {isRequired && <span className="required-indicator">*</span>}
                        </div>
                      </div>
                      <textarea
                        className="long-text-input"
                        value={answers[question.id] || ""}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        placeholder="Your answer..."
                        rows={4}
                      />
                      {hasError && <div className="validation-error">{hasError}</div>}
                    </div>
                  ) : questionType === "checkbox" ? (
                    <div className="checkbox-question">
                      <div className="question-header">
                        <div className="question-icon">
                          <CheckSquare size={18} />
                        </div>
                        <div className="question-title-preview">
                          {questionTitle || "Untitled Question"}
                          {isRequired && <span className="required-indicator">*</span>}
                        </div>
                      </div>
                      <div className="options-list">
                        {options.map((option, index) => {
                          const isChecked = Array.isArray(answers[question.id]) && answers[question.id].includes(index)

                          return (
                            <div key={index} className="option-item">
                              <label className="checkbox-wrapper">
                                <input
                                  type="checkbox"
                                  id={`checkbox-${question.id}-${index}`}
                                  className="grid-checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    const currentSelections = Array.isArray(answers[question.id])
                                      ? [...answers[question.id]]
                                      : []

                                    let newSelections
                                    if (currentSelections.includes(index)) {
                                      newSelections = currentSelections.filter((i) => i !== index)
                                    } else {
                                      newSelections = [...currentSelections, index]
                                    }

                                    handleAnswerChange(question.id, newSelections)
                                  }}
                                />
                                <span className="checkbox-custom"></span>
                              </label>
                              <span className="option-input-preview">{option || `Option ${index + 1}`}</span>
                            </div>
                          )
                        })}
                      </div>
                      {hasError && <div className="validation-error">{hasError}</div>}
                    </div>
                  ) : questionType === "rating" ? (
                    <div className="rating-question">
                      <div className="question-header">
                        <div className="question-icon">
                          <Star size={18} />
                        </div>
                        <div className="question-title-preview">
                          {questionTitle || "Untitled Question"}
                          {isRequired && <span className="required-indicator">*</span>}
                        </div>
                      </div>
                      <div className="rating-preview">
                        {[...Array(question.ratingScale || 5)].map((_, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleAnswerChange(question.id, index + 1)}
                            onMouseEnter={() =>
                              setHoveredRatings((prev) => ({
                                ...prev,
                                [question.id]: index + 1,
                              }))
                            }
                            onMouseLeave={() =>
                              setHoveredRatings((prev) => ({
                                ...prev,
                                [question.id]: null,
                              }))
                            }
                            className={`rating-button ${
                              question.ratingShape === "emoji"
                                ? answers[question.id] === index + 1
                                  ? "active"
                                  : ""
                                : answers[question.id] >= index + 1
                                  ? "active"
                                  : ""
                            } ${
                              question.ratingShape === "emoji"
                                ? hoveredRatings[question.id] === index + 1
                                  ? "hovered"
                                  : ""
                                : hoveredRatings[question.id] >= index + 1
                                  ? "hovered"
                                  : ""
                            }`}
                            aria-label={`Rate ${index + 1} out of ${question.ratingScale || 5}`}
                          >
                            {renderRatingIcon(
                              question.ratingShape || "star",
                              index,
                              question.ratingShape === "emoji"
                                ? answers[question.id] === index + 1
                                : answers[question.id] >= index + 1,
                              question.ratingShape === "emoji"
                                ? hoveredRatings[question.id] === index + 1
                                : hoveredRatings[question.id] >= index + 1,
                              question,
                            )}
                          </button>
                        ))}
                      </div>
                      {hasError && <div className="validation-error">{hasError}</div>}
                    </div>
                  ) : questionType === "dropdown" ? (
                    <div className="dropdown-question">
                      <div className="question-header">
                        <div className="question-icon">
                          <ChevronDown size={18} />
                        </div>
                        <div className="question-title-preview">
                          {questionTitle || "Untitled Question"}
                          {isRequired && <span className="required-indicator">*</span>}
                        </div>
                      </div>
                      <select
                        className="dropdown-select"
                        value={answers[question.id] || ""}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      >
                        <option value="" disabled>
                          Select an option
                        </option>
                        {options.map((option, index) => (
                          <option key={index} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      {hasError && <div className="validation-error">{hasError}</div>}
                    </div>
                  ) : questionType === "linear-scaling" ? (
                    <div className="linear-scaling-question">
                      <div className="question-header">
                        <div className="question-icon">
                          <BarChart size={18} />
                        </div>
                        <div className="question-title-preview">
                          {questionTitle || "Untitled Question"}
                          {isRequired && <span className="required-indicator">*</span>}
                        </div>
                      </div>
                      <div className="linear-scaling-preview">
                        <div className="linear-scaling-labels">
                          <span className="min-label">{question.minLabel || "Min"}</span>
                          <span className="max-label">{question.maxLabel || "Max"}</span>
                        </div>
                        <div className="linear-scaling-scale">
                          {(() => {
                            const minVal = question.minValue || 1
                            const maxVal = question.maxValue || 10
                            const range = maxVal - minVal + 1

                            return [...Array(range)].map((_, i) => (
                              <div key={i} className="scale-point">
                                <label>
                                  <div className="scale-number">{minVal + i}</div>
                                  <input
                                    type="radio"
                                    name={`linear-scaling-${question.id}`}
                                    value={minVal + i}
                                    checked={answers[question.id] === minVal + i}
                                    onChange={(e) => handleAnswerChange(question.id, Number(e.target.value))}
                                  />
                                  <div className="radio-circle"></div>
                                </label>
                              </div>
                            ))
                          })()}
                        </div>
                      </div>
                      {hasError && <div className="validation-error">{hasError}</div>}
                    </div>
                  ) : questionType === "date" ? (
                    <div className="date-question">
                      <div className="question-header">
                        <div className="question-icon">
                          <Calendar size={18} />
                        </div>
                        <div className="question-title-preview">
                          {questionTitle || "Untitled Question"}
                          {isRequired && <span className="required-indicator">*</span>}
                        </div>
                      </div>
                      <div className="date-input-container">
                        <ReactDatePicker
                          selected={answers[question.id] || null}
                          onChange={(date) => handleAnswerChange(question.id, date)}
                          placeholderText="Select a date"
                          className="date-input"
                          popperPlacement="bottom-start"
                          popperModifiers={{
                            preventOverflow: {
                              enabled: true,
                            },
                          }}
                        />
                        <Calendar size={18} />
                      </div>
                      {hasError && <div className="validation-error">{hasError}</div>}
                    </div>
                  ) : questionType === "time" ? (
                    <div className="time-question">
                      <div className="question-header">
                        <div className="question-icon">
                          <Clock size={18} />
                        </div>
                        <div className="question-title-preview">
                          {questionTitle || "Untitled Question"}
                          {isRequired && <span className="required-indicator">*</span>}
                        </div>
                      </div>
                      <div className="time-input-container">
                        <ReactDatePicker
                          selected={answers[question.id] ? new Date(`1970-01-01T${answers[question.id]}`) : null}
                          onChange={(time) =>
                            handleAnswerChange(question.id, time.toISOString().split("T")[1].slice(0, 5))
                          }
                          showTimeSelect
                          showTimeSelectOnly
                          timeIntervals={15}
                          timeCaption="Time"
                          dateFormat="h:mm aa"
                          placeholderText="Select a time"
                          className="time-input"
                          popperPlacement="bottom-start"
                          popperModifiers={{
                            preventOverflow: {
                              enabled: true,
                            },
                          }}
                        />
                        <Clock size={20} className="time-icon" />
                      </div>
                      {hasError && <div className="validation-error">{hasError}</div>}
                    </div>
                  ) : questionType === "ranking" ? (
                    <div className="ranking-question">
                      <div className="question-header">
                        <div className="question-icon">
                          <MoveVertical size={18} />
                        </div>
                        <div className="question-title-preview">
                          {questionTitle || "Untitled Question"}
                          {isRequired && <span className="required-indicator">*</span>}
                        </div>
                      </div>
                      <div className="ranking-items">
                        <ol className="ranking-list" onDragOver={(e) => e.preventDefault()}>
                          {(answers[question.id] || options).map((option, index) => (
                            <li
                              key={index}
                              className="ranking-item preview"
                              draggable={true}
                              onDragStart={(e) => handleRankingDragStart(e, question.id, index)}
                              onDrop={(e) => handleRankingDrop(e, question.id, index)}
                            >
                              <div className="ranking-item-number">{index + 1}</div>
                              <div className="ranking-item-text">{option}</div>
                            </li>
                          ))}
                        </ol>
                        <div className="ranking-instructions">
                          <p>Drag and drop items to rank them in order of preference.</p>
                        </div>
                      </div>
                      {hasError && <div className="validation-error">{hasError}</div>}
                    </div>
                  ) : questionType === "multi-grid" ? (
                    <div className="grid-question multi-grid-question">
                      <div className="question-header">
                        <div className="question-icon">
                          <Grid size={18} />
                        </div>
                        <div className="question-title-preview">
                          {questionTitle || "Untitled Question"}
                          {isRequired && <span className="required-indicator">*</span>}
                        </div>
                      </div>
                      {question.rows?.length === 0 || question.columns?.length === 0 ? (
                        <p>No rows or columns available for this question.</p>
                      ) : (
                        <div className="grid-container">
                          <table className="grid-table">
                            <thead>
                              <tr>
                                <th></th>
                                {question.columns?.map((column, colIndex) => (
                                  <th key={colIndex}>{column}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {question.rows?.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                  <td>{row}</td>
                                  {question.columns?.map((_, colIndex) => (
                                    <td key={colIndex}>
                                      <input
                                        type="radio"
                                        name={`grid-${question.id}-row-${rowIndex}`}
                                        checked={
                                          answers[question.id] && answers[question.id][`row_${rowIndex}`] === colIndex
                                        }
                                        onChange={() => handleGridAnswerChange(question.id, rowIndex, colIndex)}
                                        className="radio-input"
                                      />
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      {hasError && <div className="validation-error">{hasError}</div>}
                    </div>
                  ) : questionType === "checkbox-grid" ? (
                    <div className="grid-question checkbox-grid-question">
                      <div className="question-header">
                        <div className="question-icon">
                          <CheckSquare size={18} />
                        </div>
                        <div className="question-title-preview">
                          {questionTitle || "Untitled Question"}
                          {isRequired && <span className="required-indicator">*</span>}
                        </div>
                      </div>
                      {question.rows?.length === 0 || question.columns?.length === 0 ? (
                        <p>No rows or columns available for this question.</p>
                      ) : (
                        <div className="grid-container">
                          <table className="grid-table">
                            <thead>
                              <tr>
                                <th></th>
                                {question.columns?.map((column, colIndex) => (
                                  <th key={colIndex}>{column}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {question.rows?.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                  <td>{row}</td>
                                  {question.columns?.map((_, colIndex) => {
                                    const key = `row_${rowIndex}_col_${colIndex}`
                                    const isChecked = answers[question.id] && answers[question.id][key] === true

                                    return (
                                      <td key={colIndex}>
                                        <label className="checkbox-wrapper">
                                          <input
                                            type="checkbox"
                                            id={`checkbox-${question.id}-${rowIndex}-${colIndex}`}
                                            className="grid-checkbox"
                                            checked={isChecked}
                                            onChange={() => {
                                              const currentAnswers = answers[question.id] || {}
                                              const newValue = !isChecked

                                              handleAnswerChange(question.id, {
                                                ...currentAnswers,
                                                [key]: newValue,
                                              })
                                            }}
                                          />
                                          <span className="checkbox-custom"></span>
                                        </label>
                                      </td>
                                    )
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      {hasError && <div className="validation-error">{hasError}</div>}
                    </div>
                  ) : questionType === "yes-no" ? (
                    <div className="yes-no-question">
                      <div className="question-header">
                        <div className="question-icon">
                          <CheckCircle2 size={18} />
                        </div>
                        <div className="question-title-preview">
                          {questionTitle || "Untitled Question"}
                          {isRequired && <span className="required-indicator">*</span>}
                        </div>
                      </div>
                      <div className="yes-no-options">
                        <div className="yes-no-option">
                        <input
                            type="radio"
                            id={`yes-${question.id}`}
                            name={`yes-no-${question.id}`}
                            value="yes"
                            checked={answers[question.id] === "yes"}
                            onChange={() => handleAnswerChange(question.id, "yes")}
                            style={{
                              cursor: "pointer",
                              width: "18px",
                              height: "18px",
                              backgroundColor: "white",
                              appearance: "none",
                              border:
                                answers[question.id] === "yes" ? "4px solid var(--primary-color)" : "1px solid #ccc",
                              borderRadius: "50%",
                              outline: "none",
                            }}
                          />
                          <label htmlFor={`yes-${question.id}`} className="yes-no-label">
                            <div className="yes-no-icon yes">
                              <CheckCircle2 size={18} />
                            </div>
                            Yes
                          </label>
                        </div>
                        <div className="yes-no-option">
                        <input
                            type="radio"
                            id={`no-${question.id}`}
                            name={`yes-no-${question.id}`}
                            value="no"
                            checked={answers[question.id] === "no"}
                            onChange={() => handleAnswerChange(question.id, "no")}
                            style={{
                              cursor: "pointer",
                              width: "18px",
                              height: "18px",
                              backgroundColor: "white",
                              appearance: "none",
                              border:
                                answers[question.id] === "no" ? "4px solid var(--primary-color)" : "1px solid #ccc",
                              borderRadius: "50%",
                              outline: "none",
                            }}
                          />
                          <label htmlFor={`no-${question.id}`} className="yes-no-label">
                            <div className="yes-no-icon no">
                              <XCircle size={18} />
                            </div>
                            No
                          </label>
                        </div>
                      </div>
                      {hasError && <div className="validation-error">{hasError}</div>}
                    </div>
                  ) : (
                    <p>Unsupported question type: {questionType}</p>
                  )}
                </div>
              )
            })}
          </div>

          <button
            type="button" // Prevent default form submission behavior
            className={`publish-button ${isSubmitting ? "submitting" : ""}`}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Survey"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AnswerPage
