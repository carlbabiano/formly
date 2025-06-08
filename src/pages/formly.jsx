import React from "react"
import { useNavigate } from "react-router-dom"
import "./formly.css"
import { FileText, Layers, Clock } from "lucide-react"

const Formly = () => {
  const navigate = useNavigate();
  
 

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
  
    navigate("/builderpage", { state: { form: newSurvey } });
  }

  
  

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

       
      </main>

    </div>
  )
}

export default Formly
