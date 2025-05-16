import React from "react"
import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import "./builderpage.css" 
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
} from "lucide-react"
import ReactDatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

export default function AnswerPage() {
  const { id: surveyId } = useParams() // Extract the survey ID from the URL
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState({})
  const [hoveredRatings, setHoveredRatings] = useState({}) // Add hoveredRating state
  const [creatorEmail, setCreatorEmail] = useState("");
  const [showPopup, setShowPopup] = useState(false); // State to control the popup visibility
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("No token found. Showing popup.");
      setShowPopup(true); // Show the popup if the user is not logged in
      return;
    }

    const fetchSurvey = async () => {
      try {
        const response = await fetch(
          `http://localhost/formlydb/formly/src/backend/getSurvey.php?id=${surveyId}`
        );
        const data = await response.json();
        if (data.success) {
          setSurvey(data.survey);
          setCreatorEmail(data.survey.creator_email || "");
        } else {
          setError(data.message || "Failed to fetch survey.");
        }
      } catch (err) {
        console.error("Error fetching survey:", err);
        setError("An error occurred while fetching the survey.");
      } finally {
        setLoading(false);
      }
    };

    if (surveyId) {
      fetchSurvey();
    } else {
      setError("Invalid survey ID.");
      setLoading(false);
    }
  }, [surveyId]);

  const handleSignIn = () => {
    navigate("/", { state: { from: `/answerpage/${surveyId}` } }); // Redirect to login when the user clicks "Sign In"
  };

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        console.log("Survey ID from URL:", surveyId);
        const response = await fetch(`http://localhost/formlydb/formly/src/backend/getSurvey.php?id=${surveyId}`);
        const data = await response.json();
        console.log("Backend Response:", data);
  
        if (data.success) {
          console.log("Survey Data:", data.survey);
  
          // Transform questions
          const transformedSurvey = {
            ...data.survey,
            questions: data.survey.questions.map((q) => {
              let questionType = q.question_type || q.type;
  
              // Map question types
              if (q.question_type === "rating") {
                questionType = "rating";
              } else if (["linear scaling", "linear-scaling", "linear-scaling"].includes(q.question_type)) {
                questionType = "linear-scaling";
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
                // Linear Scale Fields
                minValue:
                  questionType === "linear-scaling" && q.minValue !== undefined
                    ? Number.parseInt(q.minValue, 10)
                    : null,
                maxValue:
                  questionType === "linear-scaling" && q.maxValue !== undefined
                    ? Number.parseInt(q.maxValue, 10)
                    : null,
                minLabel: questionType === "linear-scaling" ? q.minLabel || "Min" : undefined,
                maxLabel: questionType === "linear-scaling" ? q.maxLabel || "Max" : undefined,
                // Rating Scale Fields
                ratingScale:
                  questionType === "rating" && q.ratingScale !== undefined ? Number.parseInt(q.ratingScale, 10) : null,
                ratingShape: questionType === "rating" && q.ratingShape !== undefined ? q.ratingShape : null,
              };
            }),
          };
  
          console.log("Transformed Survey:", transformedSurvey);
          setSurvey(transformedSurvey);
  
          // Set the creator's email
          setCreatorEmail(data.survey.creator_email || ""); // Use the creator's email from the backend
        } else {
          setError(data.message || "Failed to fetch survey.");
        }
      } catch (err) {
        console.error("Error fetching survey:", err);
        setError("An error occurred while fetching the survey.");
      } finally {
        setLoading(false);
      }
    };
  
    if (surveyId) {
      fetchSurvey();
    } else {
      setError("Invalid survey ID.");
      setLoading(false);
    }
  }, [surveyId]);
  

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => {
      const updatedAnswers = {
        ...prev,
        [questionId]: value,
      }
      console.log("Updated answers:", updatedAnswers) // Debugging
      return updatedAnswers
    })
  }

  const handleSubmit = async () => {
    try {
      const response = await fetch("http://localhost/formlydb/formly/src/backend/submitSurvey.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ surveyId, answers }), // Sending surveyId and answers
      });
      const data = await response.json();
  
      if (data.success) {
        alert("Survey submitted successfully!");
      } else {
        alert(`Failed to submit survey: ${data.message}`);
      }
    } catch (err) {
      console.error("Error submitting survey:", err);
      alert("An error occurred while submitting the survey.");
    }
  };

  // Fixed: Properly handle grid answers by updating the answers state
  const handleGridAnswerChange = (questionId, rowIndex, colIndex) => {
    setAnswers((prev) => {
      const currentQuestionAnswers = prev[questionId] || {}
      return {
        ...prev,
        [questionId]: {
          ...currentQuestionAnswers,
          [`row_${rowIndex}`]: colIndex,
        },
      }
    })
  }
  

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
      const currentOptions = survey.questions.find((q) => q.id === questionId)?.options || [] // Get options from the question
      const currentRankOrder = prevAnswers[questionId] || currentOptions // Use existing rank order or default to options
      const updatedRankOrder = [...currentRankOrder]

      // Move the dragged item to the new position
      const [movedItem] = updatedRankOrder.splice(sourceIndex, 1)
      updatedRankOrder.splice(targetIndex, 0, movedItem)

      return {
        ...prevAnswers,
        [questionId]: updatedRankOrder,
      }
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

  return (
            <div className="survey-builder">
              {showPopup && (
          <div className="popup-overlay">
            <div className="popup-container">
              <p>You need to sign in to answer this survey.</p>
              <button onClick={handleSignIn}>Sign In</button>
            </div>
          </div>
        )}

        {!showPopup && (
          <>
          <header className="survey-header">
            <div className="logo">
              <div className="logo-icon">
                <FileText size={24} color="#4169E1" />
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
                <p className="created-by">
                  {creatorEmail || "Loading..."}
                  {creatorEmail === localStorage.getItem("email") ? " (You)" : ""}
                </p>
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

                  return (
                    <div key={question.id} className="question-card preview-card">
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
                                      answers[question.id] === index
                                        ? "4px solid var(--primary-color)"
                                        : "1px solid #ccc",
                                    borderRadius: "50%",
                                    outline: "none",
                                  }}
                                />
                                <span className="option-input-preview">{option || `Option ${index + 1}`}</span>
                              </div>
                            ))}
                          </div>
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
                              const isChecked =
                                Array.isArray(answers[question.id]) && answers[question.id].includes(index)

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
                                          // Remove if already selected
                                          newSelections = currentSelections.filter((i) => i !== index)
                                        } else {
                                          // Add if not selected
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
                                    [question.id]: index + 1, // Set hovered rating for this question
                                  }))
                                }
                                onMouseLeave={() =>
                                  setHoveredRatings((prev) => ({
                                    ...prev,
                                    [question.id]: null, // Clear hovered rating for this question
                                  }))
                                }
                                className={`rating-button ${
                                  question.ratingShape === "emoji"
                                    ? answers[question.id] === index + 1 // For emojis, only the selected one is active
                                      ? "active"
                                      : ""
                                    : answers[question.id] >= index + 1 // For other shapes, shade all previous ones
                                      ? "active"
                                      : ""
                                } ${
                                  question.ratingShape === "emoji"
                                    ? hoveredRatings[question.id] === index + 1 // For emojis, only the hovered one is highlighted
                                      ? "hovered"
                                      : ""
                                    : hoveredRatings[question.id] >= index + 1 // For other shapes, highlight all previous ones
                                      ? "hovered"
                                      : ""
                                }`}
                                aria-label={`Rate ${index + 1} out of ${question.ratingScale || 5}`}
                              >
                                {renderRatingIcon(
                                  question.ratingShape || "star",
                                  index,
                                  question.ratingShape === "emoji"
                                    ? answers[question.id] === index + 1 // For emojis, only the selected one is active
                                    : answers[question.id] >= index + 1, // For other shapes, shade all previous ones
                                  question.ratingShape === "emoji"
                                    ? hoveredRatings[question.id] === index + 1 // For emojis, only the hovered one is highlighted
                                    : hoveredRatings[question.id] >= index + 1, // For other shapes, highlight all previous ones
                                  question,
                                )}
                              </button>
                            ))}
                          </div>
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
                              {[...Array(question.maxValue - question.minValue + 1)].map((_, i) => (
                                <div key={i} className="scale-point">
                                  <label>
                                    <div className="scale-number">{question.minValue + i}</div>
                                    <input
                                      type="radio"
                                      name={`linear-scaling-${question.id}`}
                                      value={question.minValue + i}
                                      checked={answers[question.id] === question.minValue + i}
                                      onChange={(e) => handleAnswerChange(question.id, Number(e.target.value))}
                                    />
                                    <div className="radio-circle"></div>
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
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
                              timeIntervals={15} // Adjust intervals as needed
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
                            <ol
                              className="ranking-list"
                              onDragOver={(e) => e.preventDefault()} // Allow drag-over events
                            >
                              {(answers[question.id] || options).map((option, index) => (
                                <li
                                  key={index}
                                  className="ranking-item preview"
                                  draggable={true} // Enable drag-and-drop
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
                        </div>
                      ) : questionType === "multi-grid" ? (
                        <div className="grid-question multi-grid-question">
                          <div className="question-header">
                            <div className="question-icon">
                              <Grid size={18} /> {/* Multi-grid icon */}
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
                                              answers[question.id] &&
                                              answers[question.id][`row_${rowIndex}`] === colIndex
                                            }
                                            onChange={() => handleGridAnswerChange(question.id, rowIndex, colIndex)}
                                            style={{
                                              cursor: "pointer",
                                              width: "18px",
                                              height: "18px",
                                              backgroundColor: "white",
                                              appearance: "none",
                                              border:
                                                answers[question.id] &&
                                                answers[question.id][`row_${rowIndex}`] === colIndex
                                                  ? "4px solid var(--primary-color)"
                                                  : "1px solid #ccc",
                                              borderRadius: "50%",
                                              outline: "none",
                                            }}
                                          />
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
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
                                    answers[question.id] === "yes"
                                      ? "4px solid var(--primary-color)"
                                      : "1px solid #ccc",
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
                        </div>
                      ) : (
                        <p>Unsupported question type: {questionType}</p>
                      )}
                    </div>
                  )
                })}
              </div>

              <button className="publish-button" onClick={handleSubmit}>
                Submit Survey
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
