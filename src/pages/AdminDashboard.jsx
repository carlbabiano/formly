import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./admin-dashboard.module.css";
import { FileText, Search, Calendar, Filter, MoreVertical, Plus, Trash2, Eye, ArrowLeft } from "lucide-react";

export default function AdminDashboard() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // newest, oldest, alphabetical
  const [activeDropdown, setActiveDropdown] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSurveys = async () => {
      try {
        const userId = localStorage.getItem("userId");

        if (!userId) {
          return;
        }

        const response = await fetch(`http://localhost/formlydb/formly/src/backend/createdSurveys.php?userId=${userId}`);
        const data = await response.json();

        if (data.success) {
          setSurveys(data.surveys);
        } else {
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchSurveys();
  }, []);

  // Format date to a more readable format
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle sort change
  const handleSortChange = (sortType) => {
    setSortBy(sortType);
  };

  // Toggle dropdown menu for a survey
  const toggleDropdown = (surveyId) => {
    if (activeDropdown === surveyId) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(surveyId);
    }
  };

  // Navigate back to the dashboard or main page
  const handleBackClick = () => {
    navigate("/formly");
  };

  // Open survey details
  const handleViewSurvey = (surveyId) => {
    navigate(`/survey/${surveyId}`);
  };

  // Filter and sort surveys
  const filteredAndSortedSurveys = surveys
    .filter((survey) => survey.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === "alphabetical") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

  return (
    <div className={styles.adminDashboardContainer}>
      <div className={styles.adminDashboard}>
        <div className={styles.dashboardHeader}>
          <div className={styles.headerTop}>
            <button className={styles.backButton} onClick={handleBackClick}>
              <ArrowLeft size={18} />
              <span>Back to Dashboard</span>
            </button>
            <h1 className={styles.dashboardTitle}>Created Surveys</h1>
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
            <div className={styles.filterContainer}>
              <button className={styles.filterButton}>
                <Filter size={18} />
                <span>Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}</span>
              </button>
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
            </div>
          </div>
        </div>

        <div className={styles.formsContainer}>
          {loading ? (
            <div className={styles.loadingState}>Loading surveys...</div>
          ) : filteredAndSortedSurveys.length === 0 ? (
            <div className={styles.noForms}>
              <FileText size={48} />
              <p>No surveys found. Create your first survey!</p>
            </div>
          ) : (
            <div className={styles.formsGrid}>
  {filteredAndSortedSurveys.map((survey) => (
    <div
      key={survey.id}
      className={styles.formCard}
      onClick={() => handleViewSurvey(survey.id)} // Make the entire card clickable
      style={{ cursor: "pointer" }} // Add a pointer cursor for better UX
    >
      <div className={styles.formThumbnail}>
        <FileText size={32} color="#4169e1" />
      </div>
      <div className={styles.formDetails}>
        <h3 className={styles.formTitle}>{survey.title}</h3>
        <div className={styles.formMeta}>
          <div className={styles.metaItem}>
            <Calendar size={14} />
            <span>Created: {formatDate(survey.createdAt)}</span>
          </div>
          <div className={styles.metaItem}>
            <Calendar size={14} />
            <span>Last Modified: {formatDate(survey.lastModified)}</span>
          </div>
          <div className={styles.metaItem}>
            <FileText size={14} />
            <span>Responses: {survey.responseCount}</span>
          </div>
        </div>
      </div>
      <div className={styles.formActions}>
        <button
          className={`${styles.actionButton} ${styles.moreButton}`}
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering the card click
            toggleDropdown(survey.id);
          }}
        >
          <MoreVertical size={18} />
        </button>
        {activeDropdown === survey.id && (
          <div className={styles.actionDropdown}>
            <button
              className={styles.dropdownItem}
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering the card click
                handleViewSurvey(survey.id);
              }}
            >
              <Eye size={16} />
              <span>View</span>
            </button>
            <button
              className={`${styles.dropdownItem} ${styles.delete}`}
              onClick={(e) => e.stopPropagation()} // Prevent triggering the card click
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
    </div>
  );
}
