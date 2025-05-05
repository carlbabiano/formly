import React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./formly.css"
import Footer from "../components/footer"
import { FileText, Layers, Clock } from "lucide-react"

const Formly = () => {
  const navigate = useNavigate();
  const [recentForms, setRecentForms] = useState([]);

  const loadRecentForms = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.error("No user ID found. Cannot load recent forms.");
      setRecentForms([]); // Clear the state if no userId is found
      return;
    }
  
    try {
      // Fetch recent forms from the backend
      const response = await fetch(
        `http://localhost/systemsurvey/systemapp/src/backend/getRecentForms.php?userId=${userId}`
      );
      const recentForms = await response.json();
  
      if (Array.isArray(recentForms)) {
        console.log("Fetched recent forms from backend:", recentForms);
  
        // Update state and localStorage
        setRecentForms(recentForms);
        localStorage.setItem(`recentForms_${userId}`, JSON.stringify(recentForms));
      } else {
        console.error("Invalid response from backend:", recentForms);
        setRecentForms([]); // Clear the state if the response is invalid
      }
    } catch (error) {
      console.error("Failed to fetch recent forms from backend:", error);
      setRecentForms([]); // Clear the state if there is an error
    }
  };

  useEffect(() => {
    const fetchRecentForms = async () => {
      await loadRecentForms(); // Fetch the latest data from the backend
    };
  
    fetchRecentForms();
  
    // Listen for the custom event to update recent forms
    const handleRecentFormsUpdate = async () => {
      await loadRecentForms();
    };
  
    window.addEventListener("recentFormsUpdated", handleRecentFormsUpdate);
  
    return () => {
      window.removeEventListener("recentFormsUpdated", handleRecentFormsUpdate);
    };
  }, []);

 

  // Function to navigate to template selection when "Use a quick template" is clicked
  const handleUseTemplate = () => {
    navigate("/template-selection")
  }

  
   // Function to navigate to builderpage when "Start from scratch" is clicked
   const handleStartFromScratch = () => {
    const newSurvey = {
      id: Date.now(),
      title: "",
      description: "",
      questions: [
        {
          id: Date.now(),
          type: "multiple-choice",
          title: "",
          required: false,
          options: ["Option 1"],
        },
      ],
    };
  
    // Save the new survey to localStorage
    localStorage.setItem("draftSurvey", JSON.stringify(newSurvey));
  
    // Set a flag to indicate "Start from Scratch"
    localStorage.setItem("isStartFromScratch", "true");
  
    console.log("Navigating to BuilderPage with new survey:", newSurvey);
    navigate("/builderpage", { state: { form: newSurvey } });
  }

  const handleOpenRecentForm = (formId) => {
    console.log("Opening recent form with ID:", formId); // Debugging
  
    // Retrieve the recent forms from localStorage
    const userId = localStorage.getItem("userId");
    const recentFormsKey = `recentForms_${userId}`;
    const recentForms = JSON.parse(localStorage.getItem(recentFormsKey)) || [];
  
    // Find the form with the matching ID
    const selectedForm = recentForms.find((form) => form.id === formId);
  
    if (!selectedForm) {
      console.error("Form not found:", formId);
      alert("The selected form could not be found.");
      return;
    }
  
    // Navigate to the builder page with the selected form
    navigate("/builderpage", { state: { form: selectedForm } });
  };

  

  return (
    <div className="formly">
      {/* Main Content */}
      <main className="main-content">
        <h1 className="main-title">What do you want to do?</h1>
        <div className="cards-container">
          {/* Card 1 - Start from scratch */}
          <div className="card" onClick={handleStartFromScratch}>
            <div className="card-icon">
              <div className="icon-placeholder green">
                <FileText size={24} />
              </div>
            </div>
            <h2 className="card-title">Start from scratch</h2>
            <p className="card-description">Begin with a blank page, or copy and paste a survey you've written.</p>
          </div>

          {/* Card 2 - Use a quick template */}
          <div className="card" onClick={handleUseTemplate}>
            <div className="card-icon">
              <div className="icon-placeholder blue">
                <Layers size={24} />
              </div>
            </div>
            <h2 className="card-title">Use a quick template</h2>
            <p className="card-description">Use a template we've picked for you to create and send surveys faster.</p>
          </div>
        </div>

        {/* Recent Forms Section */}
        <h2 className="section-title">Recent Forms</h2>
        <div className="recent-forms-container">
          {recentForms.length > 0 ? (
            recentForms.map((form, index) => (
              <div
                key={`${form.id}-${index}`} // Combine form.id and index to ensure uniqueness
                className="recent-form-card"
                onClick={() => handleOpenRecentForm(form.id)} // Call the function to open the form
              >
                <div className="form-thumbnail">
                  {/* Placeholder for form thumbnail */}
                  <div className="thumbnail-placeholder">
                    <FileText size={32} />
                  </div>
                </div>
                <div className="form-details">
                  <h3 className="form-title">{form.title}</h3>
                  <div className="form-meta">
                    <Clock size={14} />
                    <span className="last-opened">{form.lastOpened || "Just now"}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-recent-forms">
              <p>No recent forms found. Start creating your first form!</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default Formly
