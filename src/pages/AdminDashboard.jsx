import React from "react"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import styles from "./admin-dashboard.module.css"
import { FileText, Search, Calendar, Filter, MoreVertical, Trash2, ArrowLeft, AlertTriangle } from "lucide-react"

export default function AdminDashboard() {
  const [surveys, setSurveys] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest") // newest, oldest, alphabetical
  const [activeDropdown, setActiveDropdown] = useState(null)
  const navigate = useNavigate()
  const [deleteConfirmation, setDeleteConfirmation] = useState({ show: false, surveyId: null, surveyTitle: "" })
  const dropdownRef = useRef(null)
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false)
  const sortDropdownRef = useRef(null)

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const userId = localStorage.getItem("userId")

        if (!userId) {
          return
        }

        const response = await fetch(`https://formly-production.up.railway.app/createdSurveys.php?userId=${userId}`)
        const data = await response.json()

        if (data.success) {
          setSurveys(data.surveys)
        } else {
        }
      } catch (error) {
      } finally {
        setLoading(false)
      }
    }

    fetchSurveys()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close action dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null)
      }
      // Close sort dropdown
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target)) {
        setSortDropdownOpen(false)
      }
    }

    // Add event listener when any dropdown is open
    if (activeDropdown !== null || sortDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [activeDropdown, sortDropdownOpen])

  // Format date to a more readable format
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  // Handle sort change
  const handleSortChange = (sortType) => {
    setSortBy(sortType)
    setSortDropdownOpen(false)
  }

  // Toggle dropdown menu for a survey
  const toggleDropdown = (surveyId) => {
    if (activeDropdown === surveyId) {
      setActiveDropdown(null)
    } else {
      setActiveDropdown(surveyId)
    }
  }

  // Handle delete confirmation
  const handleDeleteClick = (surveyId, surveyTitle, e) => {
    e.stopPropagation()
    setDeleteConfirmation({ show: true, surveyId, surveyTitle })
    setActiveDropdown(null) // Close dropdown
  }

  // Confirm delete
  const confirmDelete = async () => {
    try {
      const response = await fetch("https://formly-production.up.railway.app/deleteSurvey.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ surveyId: deleteConfirmation.surveyId }),
      })

      const data = await response.json()

      if (data.success) {
        // Remove the survey from the local state
        setSurveys(surveys.filter((survey) => survey.id !== deleteConfirmation.surveyId))
        setDeleteConfirmation({ show: false, surveyId: null, surveyTitle: "" })
      } else {
        alert("Failed to delete survey: " + data.message)
      }
    } catch (error) {
      alert("Error deleting survey: " + error.message)
    }
  }

  // Cancel delete
  const cancelDelete = () => {
    setDeleteConfirmation({ show: false, surveyId: null, surveyTitle: "" })
  }

  // Navigate back to the dashboard or main page
  const handleBackClick = () => {
    navigate("/formly")
  }

  // Filter and sort surveys
  const filteredAndSortedSurveys = surveys
    .filter((survey) => survey.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt)
      } else if (sortBy === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt)
      } else if (sortBy === "alphabetical") {
        return a.title.localeCompare(b.title)
      }
      return 0
    })

  return (
    
    <div className={styles.adminDashboardContainer}>
      <div className={styles.adminDashboard}>
        <div className={styles.dashboardHeader}>
          <div className={styles.headerTop}>
            <button className={styles.backButton} onClick={handleBackClick}>
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>
            <h1 className={styles.dashboardTitle}>Created Forms</h1>
          </div>
          <div className={styles.dashboardActions}>
            <div className={styles.searchContainer}>
              <Search size={18} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search surveys..."
                className={styles.searchInput}
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <div className={styles.filterContainer} ref={sortDropdownRef}>
              <button className={styles.filterButton} onClick={() => setSortDropdownOpen(!sortDropdownOpen)}>
                <Filter size={18} />
                <span>Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}</span>
              </button>
              {sortDropdownOpen && (
                <div className={styles.filterDropdown}>
                  <button
                    className={`${styles.filterOption} ${sortBy === "newest" ? styles.active : ""}`}
                    onClick={() => handleSortChange("newest")}
                  >
                    Newest First
                  </button>
                  <button
                    className={`${styles.filterOption} ${sortBy === "oldest" ? styles.active : ""}`}
                    onClick={() => handleSortChange("oldest")}
                  >
                    Oldest First
                  </button>
                  <button
                    className={`${styles.filterOption} ${sortBy === "alphabetical" ? styles.active : ""}`}
                    onClick={() => handleSortChange("alphabetical")}
                  >
                    Alphabetical
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.formsContainer}>
          {loading ? (
            <div className={styles.loadingState}>Loading surveys...</div>
          ) : filteredAndSortedSurveys.length === 0 ? (
            <div className={styles.noForms}>
              <FileText size={48} />
              <p>No forms found!</p>
            </div>
          ) : (
            <div className={styles.formsGrid}>
              {filteredAndSortedSurveys.map((survey) => (
                <div
                  key={survey.id}
                  className={styles.formCard}
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/builderpage/${survey.id}`)}
                >
                  <div className={styles.formThumbnail}>
                    <FileText size={32} color="#4169e1" />
                  </div>
                  <div className={styles.formDetails}>
                    <h3 className={styles.formTitle}>{survey.title}</h3>
                    <div className={styles.formMeta}>
                      <div className={styles.metaItem}>
                        <Calendar size={14} />
                        <span>Last Modified: {formatDate(survey.lastModified)}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <Calendar size={14} />
                        <span>Created: {formatDate(survey.createdAt)}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <FileText size={14} />
                        <span>Responses: {survey.responseCount}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <span
                          className={`${styles.statusBadge} ${survey.accepting_responses === "1" || survey.accepting_responses === 1 ? styles.accepting : styles.notAccepting}`}
                        >
                          {survey.accepting_responses === "1" || survey.accepting_responses === 1
                            ? "Accepting Responses"
                            : "Not Accepting Responses"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.formActions} ref={activeDropdown === survey.id ? dropdownRef : null}>
                    <button
                      className={styles.moreVerticalButton}
                      onClick={(e) => {
                        e.stopPropagation() // Prevent triggering the card click
                        toggleDropdown(survey.id)
                      }}
                    >
                      <MoreVertical size={16} />
                    </button>
                    {activeDropdown === survey.id && (
                      <div className={styles.actionDropdown}>
                        <button
                          className={`${styles.dropdownItem} ${styles.delete}`}
                          onClick={(e) => handleDeleteClick(survey.id, survey.title, e)}
                        >
                          <Trash2 size={16} />
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {deleteConfirmation.show && (
        <div className={styles.adminDashboardConfirmationOverlay}>
          <div className={styles.adminDashboardConfirmationDialog}>
            <div className={styles.adminDashboardConfirmationHeader}>
              <div className={styles.adminDashboardConfirmationIcon}>
                <AlertTriangle size={28} />
              </div>
              <h3>Delete Survey</h3>
            </div>
            <div className={styles.adminDashboardConfirmationContent}>
              <p>
                Are you sure you want to delete
                <span className={styles.adminDashboardSurveyTitle}>"{deleteConfirmation.surveyTitle}"</span>?
              </p>
              <div className={styles.adminDashboardWarningText}>
                <AlertTriangle size={16} />
                This action cannot be undone.
              </div>
            </div>
            <div className={styles.adminDashboardConfirmationButtons}>
              <button className={styles.adminDashboardCancelButton} onClick={cancelDelete}>
                Cancel
              </button>
              <button className={styles.adminDashboardDeleteButton} onClick={confirmDelete}>
                Delete Survey
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
