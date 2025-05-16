import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BuilderPage from "./builderpage";

export default function SurveyView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false); // State to control the popup visibility

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setShowPopup(true); // Show the popup if the user is not logged in
      return;
    }

    const fetchSurvey = async () => {
      try {
        const response = await fetch(`http://localhost/formlydb/formly/src/backend/getSurvey.php?id=${id}`);
        const data = await response.json();
        if (data.success) {
          setSurvey(data.survey); // Set the fetched survey data
        }
      } catch (error) {
        console.error("Error fetching survey:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSurvey();
  }, [id]);

  const handleSignIn = () => {
    navigate("/login", { state: { from: `/surveyview/${id}` } }); // Redirect to login and preserve the original link
  };

  if (loading) {
    return <div>Loading survey...</div>;
  }

  if (!survey) {
    return <div>Survey not found.</div>;
  }

  return (
    <div>
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-container">
            <p>You need to sign in to view this survey.</p>
            <button onClick={handleSignIn}>Sign In</button>
          </div>
        </div>
      )}

      {!showPopup && <BuilderPage survey={survey} />}
    </div>
  );
}