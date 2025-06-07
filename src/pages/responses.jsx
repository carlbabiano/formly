import React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { assets } from "../assets/assets"
import {
  ArrowLeft,
  FileText,
  Users,
  Calendar,
  BarChart3,
  RefreshCw,
  Star,
  CheckCircle2,
  Grid,
  List,
  AlignLeft,
  CheckSquare,
  ChevronDown,
  Clock,
  MoveVertical,
  AlertCircle,
} from "lucide-react"
import "./builderpage.css"

export default function ResponsesAnalytics() {
  const { id: surveyId } = useParams()
  const navigate = useNavigate()

  const [survey, setSurvey] = useState(null)
  const [responses, setResponses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [analytics, setAnalytics] = useState({})

  useEffect(() => {
    fetchSurveyAndResponses()
  }, [surveyId])

  const fetchSurveyAndResponses = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch survey details
      const surveyResponse = await fetch(`http://localhost/formlydb/formly/src/backend/getSurvey.php?id=${surveyId}`)
      const surveyData = await surveyResponse.json()

      if (!surveyData.success) {
        throw new Error(surveyData.message || "Failed to fetch survey")
      }

      setSurvey(surveyData.survey)

      // Fetch responses
      try {
        const responsesResponse = await fetch(
          `http://localhost/formlydb/formly/src/backend/getResponses.php?surveyId=${surveyId}`,
        )
        const responseText = await responsesResponse.text()

        let responsesData
        try {
          responsesData = JSON.parse(responseText)
        } catch (parseError) {
          console.error("Failed to parse response:", responseText.substring(0, 200))
          throw new Error("Invalid response format from server")
        }

        if (responsesData.success) {
          setResponses(responsesData.responses || [])
          processAnalytics(surveyData.survey, responsesData.responses || [])
        } else {
          console.warn("Responses fetch failed:", responsesData.message)
          setResponses([])
          processAnalytics(surveyData.survey, [])
        }
      } catch (responsesError) {
        console.error("Error fetching responses:", responsesError)
        setResponses([])
        processAnalytics(surveyData.survey, [])
      }
    } catch (err) {
      console.error("Error fetching data:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const processAnalytics = (surveyData, responsesData) => {
    if (!surveyData || !surveyData.questions) {
      setAnalytics({})
      return
    }

    const analytics = {}

    surveyData.questions.forEach((question) => {
      const questionId = question.id
      const questionType = question.question_type
      const answers = responsesData
        .map((response) => {
          if (!response.answers) return undefined
          const parsedAnswers = typeof response.answers === "string" ? JSON.parse(response.answers) : response.answers
          return {
            answer: parsedAnswers[questionId],
            respondent: response.respondent_identifier || response.respondent_email || "Anonymous",
            submittedAt: response.submitted_at,
          }
        })
        .filter((item) => item.answer !== undefined && item.answer !== null && item.answer !== "")

      analytics[questionId] = analyzeQuestion(question, answers)
    })

    setAnalytics(analytics)
  }

  const analyzeQuestion = (question, answersWithMetadata) => {
    const questionType = question.question_type
    const answers = answersWithMetadata.map((item) => item.answer)
    const totalResponses = answers.length

    switch (questionType) {
      case "multiple-choice":
      case "dropdown":
        return analyzeMultipleChoice(question, answersWithMetadata, totalResponses)

      case "checkbox":
        return analyzeCheckbox(question, answersWithMetadata, totalResponses)

      case "rating":
        return analyzeRating(question, answersWithMetadata, totalResponses)

      case "linear-scaling":
        return analyzeLinearScaling(question, answersWithMetadata, totalResponses)

      case "yes-no":
        return analyzeYesNo(answersWithMetadata, totalResponses)

      case "short-text":
      case "long-text":
        return analyzeText(answersWithMetadata, totalResponses)

      case "date":
        return analyzeDate(answersWithMetadata, totalResponses)

      case "time":
        return analyzeTime(answersWithMetadata, totalResponses)

      case "ranking":
        return analyzeRanking(question, answersWithMetadata, totalResponses)

      case "multi-grid":
      case "checkbox-grid":
        return analyzeGrid(question, answersWithMetadata, totalResponses)

      default:
        return { totalResponses, type: questionType, rawAnswers: answersWithMetadata }
    }
  }

  // Add a fallback function to handle cases where option names might be missing
  function getOptionName(option, index) {
    if (option === undefined || option === null || option === "") {
      return `Option ${index + 1}`
    }
    return option
  }

  // Update the analyzeMultipleChoice function to use the fallback function
  const analyzeMultipleChoice = (question, answersWithMetadata, totalResponses) => {
    // Parse options (handle JSON string or array)
    const options = typeof question.options === "string" ? JSON.parse(question.options) : question.options || []
    console.log("Options:", options) // Debugging log
    const counts = {}

    // Initialize counts with proper option names
    options.forEach((option, index) => {
      counts[index] = {
        option: option || `Option ${index + 1}`, // Use custom name or fallback
        count: 0,
      }
    })

    // Count responses
    answersWithMetadata.forEach(({ answer }) => {
      const answerIndex = Number.parseInt(answer)
      if (counts[answerIndex]) {
        counts[answerIndex].count++
      }
    })

    // Create chart data
    const chartData = Object.values(counts).map((item) => ({
      label: item.option, // Display the actual option name
      value: item.count,
      percentage: totalResponses > 0 ? ((item.count / totalResponses) * 100).toFixed(1) : 0,
    }))

    console.log("Chart Data:", chartData) // Debugging log

    return {
      type: "multiple-choice",
      totalResponses,
      chartData,
    }
  }

  // Update the analyzeCheckbox function to use the fallback function
  const analyzeCheckbox = (question, answersWithMetadata, totalResponses) => {
    const options = typeof question.options === "string" ? JSON.parse(question.options) : question.options || []
    const counts = {}

    // Initialize counts with proper option names
    options.forEach((option, index) => {
      counts[index] = { option: getOptionName(option, index), count: 0 }
    })

    // Count responses
    answersWithMetadata.forEach(({ answer }) => {
      if (Array.isArray(answer)) {
        answer.forEach((selectedIndex) => {
          const index = Number.parseInt(selectedIndex)
          if (counts[index]) {
            counts[index].count++
          }
        })
      }
    })

    const chartData = Object.values(counts).map((item) => ({
      label: item.option,
      value: item.count,
      percentage: totalResponses > 0 ? ((item.count / totalResponses) * 100).toFixed(1) : 0,
    }))

    return {
      type: "checkbox",
      totalResponses,
      chartData,
    }
  }

  const analyzeRating = (question, answersWithMetadata, totalResponses) => {
    const ratingScale = question.rating_scale || 5
    const responseDetails = []

    // Process responses
    answersWithMetadata.forEach(({ answer }) => {
      const rating = Number.parseInt(answer)
      if (rating >= 1 && rating <= ratingScale) {
        responseDetails.push(rating)
      }
    })

    const average =
      responseDetails.length > 0
        ? (responseDetails.reduce((sum, rating) => sum + rating, 0) / responseDetails.length).toFixed(1)
        : 0

    return {
      type: "rating",
      totalResponses,
      average,
      ratingScale,
      ratingShape: question.rating_shape || "star",
    }
  }

  const analyzeLinearScaling = (question, answersWithMetadata, totalResponses) => {
    const minValue = question.min_value || 1
    const maxValue = question.max_value || 10
    const distribution = {}

    // Initialize distribution
    for (let i = minValue; i <= maxValue; i++) {
      distribution[i] = { count: 0 }
    }

    // Process responses
    answersWithMetadata.forEach(({ answer }) => {
      const value = Number.parseInt(answer)
      if (value >= minValue && value <= maxValue) {
        distribution[value].count++
      }
    })

    const chartData = Object.entries(distribution).map(([value, data]) => ({
      label: `${value}`,
      value: data.count,
      percentage: totalResponses > 0 ? ((data.count / totalResponses) * 100).toFixed(1) : 0,
    }))

    return {
      type: "linear-scaling",
      totalResponses,
      chartData,
      minValue,
      maxValue,
      minLabel: question.min_label || "Low",
      maxLabel: question.max_label || "High",
    }
  }

  const analyzeYesNo = (answersWithMetadata, totalResponses) => {
    const yesResponses = []
    const noResponses = []

    answersWithMetadata.forEach(({ answer, respondent, submittedAt }) => {
      if (answer === "yes" || answer === true || answer === "true") {
        yesResponses.push({ respondent, submittedAt })
      } else if (answer === "no" || answer === false || answer === "false") {
        noResponses.push({ respondent, submittedAt })
      }
    })

    const chartData = [
      {
        label: "Yes",
        value: yesResponses.length,
        percentage: totalResponses > 0 ? ((yesResponses.length / totalResponses) * 100).toFixed(1) : 0,
        respondents: yesResponses,
      },
      {
        label: "No",
        value: noResponses.length,
        percentage: totalResponses > 0 ? ((noResponses.length / totalResponses) * 100).toFixed(1) : 0,
        respondents: noResponses,
      },
    ]

    return {
      type: "yes-no",
      totalResponses,
      chartData,
      yesPercentage: totalResponses > 0 ? ((yesResponses.length / totalResponses) * 100).toFixed(1) : 0,
    }
  }

  const analyzeText = (answersWithMetadata, totalResponses) => {
    const textResponses = answersWithMetadata.filter(({ answer }) => typeof answer === "string" && answer.trim() !== "")

    return {
      type: "text",
      totalResponses,
      allResponses: textResponses,
    }
  }

  const analyzeDate = (answersWithMetadata, totalResponses) => {
    const dateResponses = answersWithMetadata.filter(({ answer }) => answer && typeof answer === "string")

    const allDates = []

    dateResponses.forEach(({ answer }) => {
      const date = new Date(answer)
      if (!isNaN(date)) {
        allDates.push(answer)
      }
    })

    return {
      type: "date",
      totalResponses,
      allDates: allDates.sort(),
    }
  }

  const analyzeTime = (answersWithMetadata, totalResponses) => {
    const timeResponses = answersWithMetadata.filter(({ answer }) => answer && typeof answer === "string")

    const allTimes = []

    timeResponses.forEach(({ answer }) => {
      allTimes.push(answer)
    })

    return {
      type: "time",
      totalResponses,
      allTimes: allTimes.sort(),
    }
  }

  // Update the analyzeRanking function to properly use option names
  const analyzeRanking = (question, answersWithMetadata, totalResponses) => {
    const options = typeof question.options === "string" ? JSON.parse(question.options) : question.options || []
    const rankings = {}

    // Initialize rankings with actual option names
    options.forEach((option) => {
      rankings[option] = { totalScore: 0, appearances: 0 }
    })

    // Process rankings
    answersWithMetadata.forEach(({ answer }) => {
      if (Array.isArray(answer)) {
        answer.forEach((item, index) => {
          if (rankings[item]) {
            const score = options.length - index
            rankings[item].totalScore += score
            rankings[item].appearances++
          }
        })
      }
    })

    const chartData = Object.entries(rankings)
      .map(([option, data]) => ({
        label: option,
        value: data.appearances > 0 ? (data.totalScore / data.appearances).toFixed(1) : 0,
        appearances: data.appearances,
      }))
      .sort((a, b) => b.value - a.value)

    return {
      type: "ranking",
      totalResponses,
      chartData,
    }
  }

  // Update the analyzeGrid function to use the fallback function
  const analyzeGrid = (question, answersWithMetadata, totalResponses) => {
    const rows = typeof question.rows === "string" ? JSON.parse(question.rows) : question.rows || []
    const columns = typeof question.columns === "string" ? JSON.parse(question.columns) : question.columns || []

    // Process row and column names with fallbacks
    const processedRows = rows.map((row, index) => getOptionName(row, index))
    const processedColumns = columns.map((col, index) => getOptionName(col, index))

    const gridAnalysis = {}

    // Initialize grid with processed names
    processedRows.forEach((row) => {
      gridAnalysis[row] = {}
      processedColumns.forEach((col) => {
        gridAnalysis[row][col] = { count: 0 }
      })
    })

    // Process responses
    answersWithMetadata.forEach(({ answer }) => {
      if (typeof answer === "object" && answer !== null) {
        Object.entries(answer).forEach(([key, value]) => {
          if (key.startsWith("row_")) {
            const rowIndex = Number.parseInt(key.split("_")[1])
            if (rowIndex >= 0 && rowIndex < rows.length) {
              const rowName = processedRows[rowIndex]
              if (question.question_type === "multi-grid") {
                const colIndex = Number.parseInt(value)
                if (colIndex >= 0 && colIndex < columns.length) {
                  const colName = processedColumns[colIndex]
                  gridAnalysis[rowName][colName].count++
                }
              } else if (question.question_type === "checkbox-grid" && key.includes("_col_")) {
                const parts = key.split("_")
                const colIndex = Number.parseInt(parts[3])
                if (colIndex >= 0 && colIndex < columns.length && value) {
                  const colName = processedColumns[colIndex]
                  gridAnalysis[rowName][colName].count++
                }
              }
            }
          }
        })
      }
    })

    return {
      type: "grid",
      totalResponses,
      gridAnalysis,
      rows: processedRows,
      columns: processedColumns,
    }
  }

  const getRatingIcon = (shape, rating) => {
    switch (shape) {
      case "star":
        return "⭐"
      case "heart":
        return "❤️"
      case "like":
        return "👍"
      case "emoji":
        if (rating <= 2) return "😢"
        if (rating <= 3) return "😐"
        return "😊"
      default:
        return "⭐"
    }
  }

  const getTimeOfDay = (hour) => {
    if (hour < 6) return "Early Morning (12-6 AM)"
    if (hour < 12) return "Morning (6-12 PM)"
    if (hour < 18) return "Afternoon (12-6 PM)"
    return "Evening (6-12 AM)"
  }

  const getQuestionIcon = (type) => {
    switch (type) {
      case "multiple-choice":
        return <List size={18} />
      case "short-text":
      case "long-text":
        return <AlignLeft size={18} />
      case "checkbox":
        return <CheckSquare size={18} />
      case "rating":
        return <Star size={18} />
      case "dropdown":
        return <ChevronDown size={18} />
      case "linear-scaling":
        return <BarChart3 size={18} />
      case "date":
        return <Calendar size={18} />
      case "time":
        return <Clock size={18} />
      case "ranking":
        return <MoveVertical size={18} />
      case "multi-grid":
      case "checkbox-grid":
        return <Grid size={18} />
      case "yes-no":
        return <CheckCircle2 size={18} />
      default:
        return <FileText size={18} />
    }
  }

  if (loading) {
    return (
      <div className="survey-builder">
        <div className="loading-state">
          <RefreshCw size={24} className="spinning" />
          <p>Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="survey-builder">
        <div className="error-message">
          <AlertCircle size={48} />
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="header-button">
            <ArrowLeft size={16} />
            Go Back
          </button>
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
        <div className="header-actions">{/* View Survey and Export buttons removed as requested */}</div>
      </header>

      <div className="survey-content">
        <div className="survey-questions-panel analytics-panel">
          <div className="back-button" onClick={() => navigate(`/builderpage/${surveyId}`)}>
            <ArrowLeft size={20} />
            <span>Back to Survey</span>
          </div>

          <div className="analytics-header">
            <h1>Response Analytics</h1>
            <div className="survey-info">
              <h2>{survey?.title || "Untitled Survey"}</h2>
              {survey?.description && <p>{survey.description}</p>}
            </div>
          </div>

          <div className="analytics-summary">
            <div className="summary-card">
              <div className="summary-icon">
                <Users size={24} />
              </div>
              <div className="summary-content">
                <h3>Total Responses</h3>
                <p className="summary-number">{responses.length}</p>
              </div>
            </div>

            <div className="summary-card">
              <div className="summary-icon">
                <FileText size={24} />
              </div>
              <div className="summary-content">
                <h3>Questions</h3>
                <p className="summary-number">{survey?.questions?.length || 0}</p>
              </div>
            </div>

            {/* Completion Rate card removed as requested */}

            <div className="summary-card">
              <div className="summary-icon">
                <Calendar size={24} />
              </div>
              <div className="summary-content">
                <h3>Last Response</h3>
                <p className="summary-text">
                  {responses.length > 0 ? new Date(responses[0].submitted_at).toLocaleDateString() : "No responses yet"}
                </p>
              </div>
            </div>
          </div>

          {responses.length === 0 ? (
            <div className="no-responses">
              <div className="no-responses-icon">
                <BarChart3 size={48} />
              </div>
              <h3>No Responses Yet</h3>
              <p>Once people start responding to your survey, their analytics will appear here.</p>
            </div>
          ) : (
            <div className="questions-analytics">
              {survey?.questions?.map((question, index) => {
                const questionAnalytics = analytics[question.id]
                if (!questionAnalytics) return null

                return (
                  <div key={question.id} className="question-analytics-card">
                    <div className="question-analytics-header">
                      <div className="question-info">
                        <div className="question-number">Q{index + 1}</div>
                        <div className="question-icon">{getQuestionIcon(question.question_type)}</div>
                        <div className="question-details">
                          <h3>{question.question_text || "Untitled Question"}</h3>
                          <p className="question-type">{question.question_type}</p>
                        </div>
                      </div>
                      <div className="response-count">
                        <span>{questionAnalytics.totalResponses} responses</span>
                      </div>
                    </div>

                    <div className="question-analytics-content">
                      <QuestionAnalyticsChart analytics={questionAnalytics} question={question} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Component for rendering different chart types based on question type
function QuestionAnalyticsChart({ analytics, question }) {
  const { type, totalResponses } = analytics

  if (totalResponses === 0) {
    return (
      <div className="no-data">
        <p>No responses for this question yet.</p>
      </div>
    )
  }

  switch (type) {
    case "multiple-choice":
    case "dropdown":
      return <MultipleChoiceChart data={analytics} />

    case "checkbox":
      return <CheckboxChart data={analytics} />

    case "rating":
      return <RatingChart data={analytics} />

    case "linear-scaling":
      return <LinearScalingChart data={analytics} />

    case "yes-no":
      return <YesNoChart data={analytics} />

    case "text":
      return <TextChart data={analytics} />

    case "date":
      return <DateChart data={analytics} />

    case "time":
      return <TimeChart data={analytics} />

    case "ranking":
      return <RankingChart data={analytics} />

    case "grid":
      return <GridChart data={analytics} question={question} />

    default:
      return (
        <div className="unsupported-analytics">
          <p>Analytics not available for this question type yet.</p>
          {analytics.rawAnswers && (
            <div className="raw-answers">
              <h4>Raw Responses:</h4>
              <div className="responses-list">
                {analytics.rawAnswers.slice(0, 10).map((item, index) => (
                  <div key={index} className="response-item">
                    <strong>{item.respondent}:</strong> {JSON.stringify(item.answer)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )
  }
}

// Individual chart components
// Simplified Multiple Choice Chart
function MultipleChoiceChart({ data }) {
  console.log("Chart Data for Multiple Choice:", data.chartData) // Debugging log
  return (
    <div className="simple-chart">
      <div className="chart-bars">
        {data.chartData.map((item, index) => (
          <div key={index} className="chart-bar-item">
            <div className="bar-info">
              {/* Render the label */}
              <span className="bar-label">{item.label}</span>
              <span className="bar-count">
                {item.value} ({item.percentage}%)
              </span>
            </div>
            <div className="bar-visual">
              <div className="bar-track">
                <div className="bar-progress" style={{ width: `${item.percentage}%` }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Simplified Checkbox Chart
function CheckboxChart({ data }) {
  return (
    <div className="simple-chart">
      <div className="chart-bars">
        {data.chartData.map((item, index) => (
          <div key={index} className="chart-bar-item">
            <div className="bar-info">
              <span className="bar-label">{item.label}</span>
              <span className="bar-count">
                {item.value} selections ({item.percentage}%)
              </span>
            </div>
            <div className="bar-visual">
              <div className="bar-track">
                <div className="bar-progress" style={{ width: `${item.percentage}%` }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Simplified Rating Chart - just show average
function RatingChart({ data }) {
  const getRatingDisplay = (shape) => {
    switch (shape) {
      case "star":
        return "⭐"
      case "heart":
        return "❤️"
      case "like":
        return "👍"
      case "emoji":
        return "😊"
      default:
        return "⭐"
    }
  }

  return (
    <div className="simple-chart">
      <div className="rating-average">
        <div className="average-display">
          <span className="rating-icon">{getRatingDisplay(data.ratingShape)}</span>
          <span className="average-score">
            {data.average} / {data.ratingScale}
          </span>
          <span className="average-label">Average Rating</span>
        </div>
      </div>
    </div>
  )
}

// Simplified Linear Scaling Chart
function LinearScalingChart({ data }) {
  return (
    <div className="simple-chart">
      <div className="scale-info">
        <div className="scale-labels">
          <span className="scale-label">
            {data.minLabel} ({data.minValue})
          </span>
          <span className="scale-label">
            {data.maxLabel} ({data.maxValue})
          </span>
        </div>
      </div>
      <div className="chart-bars">
        {data.chartData.map((item, index) => (
          <div key={index} className="chart-bar-item">
            <div className="bar-info">
              <span className="bar-label">Item {item.label}</span>
              <span className="bar-count">
                {item.value} responses ({item.percentage}%)
              </span>
            </div>
            <div className="bar-visual">
              <div className="bar-track">
                <div className="bar-progress" style={{ width: `${item.percentage}%` }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Simplified Yes/No Chart
function YesNoChart({ data }) {
  return (
    <div className="simple-chart">
      <div className="chart-bars">
        {data.chartData.map((item, index) => (
          <div key={index} className="chart-bar-item">
            <div className="bar-info">
              <span className="bar-label">{item.label}</span>
              <span className="bar-count">
                {item.value} responses ({item.percentage}%)
              </span>
            </div>
            <div className="bar-visual">
              <div className="bar-track">
                <div className="bar-progress" style={{ width: `${item.percentage}%` }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Simplified Text Chart - just show the answers
function TextChart({ data }) {
  return (
    <div className="simple-chart">
      <div className="text-responses">
        <h4>Text Responses ({data.allResponses.length})</h4>
        <div className="answers-list">
          {data.allResponses.map((response, index) => (
            <div key={index} className="answer-item">
              <p>"{response.answer}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Simplified Date Chart - just show all dates answered
function DateChart({ data }) {
  return (
    <div className="simple-chart">
      <div className="date-responses">
        <h4>All Dates Answered ({data.allDates.length})</h4>
        <div className="date-grid">
          {data.allDates.map((date, index) => (
            <div key={index} className="date-item">
              {new Date(date).toLocaleDateString()}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Simplified Time Chart - just show all times answered
function TimeChart({ data }) {
  return (
    <div className="simple-chart">
      <div className="time-responses">
        <h4>All Times Answered ({data.allTimes.length})</h4>
        <div className="time-grid">
          {data.allTimes.map((time, index) => (
            <div key={index} className="time-item">
              {time}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Simplified Ranking Chart - just show rankings from highest to lowest
function RankingChart({ data }) {
  return (
    <div className="simple-chart">
      <div className="ranking-results">
        <h4>Ranking Results (Highest to Lowest)</h4>
        <div className="ranking-list">
          {data.chartData.map((item, index) => (
            <div key={item.label} className="ranking-item">
              <div className="rank-position">#{index + 1}</div>
              <div className="rank-details">
                <span className="rank-label">{item.label}</span>
                <span className="rank-info">
                  Average score: {item.value} ({item.appearances} times ranked)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Simplified Grid Chart - remove individual responses
function GridChart({ data, question }) {
  return (
    <div className="simple-chart">
      <div className="grid-summary">
        <table className="simple-grid-table">
          <thead>
            <tr>
              <th></th>
              {data.columns.map((col, index) => (
                <th key={index}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td className="row-header">{row}</td>
                {data.columns.map((col, colIndex) => {
                  const cellData = data.gridAnalysis[row][col]
                  return (
                    <td key={colIndex} className="grid-cell">
                      {cellData.count}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
