import React from "react"
import { useState, useEffect } from "react"
import {
  FileText, AlignLeft, List, CheckSquare, Star, Heart, ThumbsUp, Calendar, ChevronDown, BarChart, Grip, Plus, X,
  BadgeAlert, Clock, Eye, Upload, MoveVertical, Grid, CheckCircle2, XCircle, ToggleLeft, Trash2, Settings, Link, Save,
} from "lucide-react"
import "./builderpage.css"
import "react-datepicker/dist/react-datepicker.css"
import ReactDatePicker from "react-datepicker"
import { useLocation, useNavigate } from "react-router-dom"

export default function BuilderPage() {
const location = useLocation();
const form = location.state?.form; // Retrieve the form data from state

console.log("Form data received in BuilderPage:", form); // Debugging
  const templateId = location.state?.templateId;
  const navigate = useNavigate()
  const token = localStorage.getItem("token")
  

  // Declare all hooks at the top level
  const [userId, setUserId] = useState(null)
  const [surveyTitle, setSurveyTitle] = useState("")
  const [surveyDescription, setSurveyDescription] = useState("")
  const [questions, setQuestions] = useState([]);
  

  // Load survey data when the component mounts
  useEffect(() => {
    const isStartFromScratch = localStorage.getItem("isStartFromScratch");
  
    if (isStartFromScratch === "true") {
      console.log("Starting from scratch."); // Debugging
      const newSurveyId = Date.now();
      setSurveyId(newSurveyId);
      setSurveyTitle("");
      setSurveyDescription("");
      setQuestions([
        {
          id: Date.now(),
          type: "multiple-choice",
          title: "",
          required: false,
          options: ["Option 1"],
        },
      ]);
  
      // Save the new survey to localStorage
      const newSurveyData = {
        id: newSurveyId,
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
      saveSurveyToLocalStorage(newSurveyData);
  
      // Clear the "Start from Scratch" flag
      localStorage.removeItem("isStartFromScratch");
    } else {
      console.log("Loading survey from local storage."); // Debugging
      const savedSurvey = loadSurveyFromLocalStorage();
      if (savedSurvey) {
        setSurveyId(savedSurvey.id);
        setSurveyTitle(savedSurvey.title);
        setSurveyDescription(savedSurvey.description);
        setQuestions(savedSurvey.questions);
      } else {
        console.log("No data in local storage. Initializing a new survey."); // Debugging
        const newSurveyId = Date.now();
        setSurveyId(newSurveyId);
        setSurveyTitle("");
        setSurveyDescription("");
        setQuestions([
          {
            id: Date.now(),
            type: "multiple-choice",
            title: "",
            required: false,
            options: ["Option 1"],
          },
        ]);
  
        // Save the new survey to localStorage
        const newSurveyData = {
          id: newSurveyId,
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
        saveSurveyToLocalStorage(newSurveyData);
      }
    }
  }, []);

  const [isPreviewMode, setIsPreviewMode] = useState(false) // Declare isPreviewMode here
  const [draggedQuestion, setDraggedQuestion] = useState(null)
  const [isPublished, setIsPublished] = useState(false)
  const [showSettingsPopup, setShowSettingsPopup] = useState(false)
  const [surveyId, setSurveyId] = useState(null); // Add this line

  const saveRecentForm = async (surveyData) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      console.error("No user ID found. Cannot save recent form.");
      return;
    }
  
    console.log("Payload sent to backend:", {
      userId,
      formId: surveyData.id,
      title: surveyData.title,
    });
  
    try {
      const response = await fetch("http://localhost/systemsurvey/systemapp/src/backend/saveRecentForm.php", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          formId: surveyData.id,
          title: surveyData.title,
        }),
      });
  
      const result = await response.json();
      if (result.success) {
        console.log("Recent form saved successfully:", result.message);
      } else {
        console.error("Failed to save recent form:", result.error);
      }
    } catch (error) {
      console.error("Error saving recent form:", error);
    }
  };
  
  // Call this function when a survey is created
  const handleSaveSurvey = (surveyData) => {
    console.log("Survey data before saving:", surveyData); // Debugging
    saveRecentForm(surveyData);
  };
  

 

  const saveSurveyToLocalStorage = (surveyData) => {
    if (!surveyData || !surveyData.id) {
      console.error("Cannot save survey: Invalid survey data");
      return;
    }
    console.log("Saving to local storage:", surveyData); // Debugging
    localStorage.setItem("draftSurvey", JSON.stringify(surveyData));
  
    // Update recent forms
    updateRecentForms(surveyData);
  
    // Save the survey to the recent forms table
    handleSaveSurvey(surveyData);
  };

  const loadSurveyFromLocalStorage = () => {
    const savedSurvey = localStorage.getItem("draftSurvey");
    return savedSurvey ? JSON.parse(savedSurvey) : null;
  };
 

  
  // Add the new useEffect here
  useEffect(() => {
    if (!surveyId) return;
  
    const surveyData = {
      id: surveyId, // Ensure this is set
      title: surveyTitle,
      description: surveyDescription,
      questions,
    };
  
    saveSurveyToLocalStorage(surveyData);
  }, [surveyId, surveyTitle, surveyDescription, questions]);

  const updateRecentForms = async (surveyData) => {
  
    const userId = localStorage.getItem("userId"); // Retrieve the logged-in user's ID
    if (!userId) {
      console.error("No user ID found. Cannot update recent forms.");
      return;
    }
  
    const recentFormsKey = `recentForms_${userId}`; // Use a user-specific key
    const recentForms = JSON.parse(localStorage.getItem(recentFormsKey)) || []; // Ensure it's an array
  
    if (!Array.isArray(recentForms)) {
      console.error("Invalid recentForms data. Resetting to an empty array.");
      localStorage.setItem(recentFormsKey, JSON.stringify([]));
      return;
    }
  
    const updatedForms = [
      ...recentForms.filter((form) => form.id !== surveyData.id), // Remove duplicates
    ].slice(0, 5); // Keep only the latest 5 forms
  
    localStorage.setItem(recentFormsKey, JSON.stringify(updatedForms));
    console.log("Updated recent forms for user:", userId, updatedForms); // Debugging
  };
  

  // Validate token and set userId
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        console.error("No token found in localStorage.");
        navigate("/builderpage");
        return;
      }
  
      try {
        const response = await fetch("http://localhost/systemsurvey/systemapp/src/backend/validateToken.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
  
        const data = await response.json();
        console.log("Token Validation Response:", data);
  
        if (data.valid) {
          setUserId(data.userId); // Ensure userId is set
        } else {
          console.error("Token validation failed:", data.message);
          alert("Your session has expired. Please log in again.");
          navigate("/builderpage");
        }
      } catch (error) {
        console.error("Error validating token:", error);
        alert("An error occurred. Please log in again.");
        navigate("/builderpage");
      }
    };
  
    validateToken();
  }, [token, navigate]);

  // Save questions to localStorage whenever they change
  useEffect(() => {
    if (!surveyId) return; // Ensure surveyId is set before saving
    const surveyData = {
      id: surveyId,
      title: surveyTitle,
      description: surveyDescription,
      questions,
    };
    saveSurveyToLocalStorage(surveyData);
  }, [surveyId, surveyTitle, surveyDescription, questions]);

  const handlePublish = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found.");
      alert("Please log in again.");
      navigate("/builderpage");
      return;
    }
  
    console.log("Token:", token); // Debugging: Log the token
    console.log("Questions sent to backend:", questions);
  
    const survey = {
      id: Date.now(),
      creator_id: userId,
      title: surveyTitle || "Untitled Survey",
      description: surveyDescription || "",
      created_at: new Date().toISOString(),
      questions: questions.map((q) => ({
        id: q.id,
        type: q.type,
        title: q.title,
        required: q.required,
        options: q.type === "dropdown"
          ? q.dropdownOptions.map((opt, index) => opt || `Option ${index + 1}`)
          : q.type === "ranking"
          ? q.options.map((opt, index) => opt || `Item ${index + 1}`) // Handle ranking items
          
          : q.options, // Handle other question types
          rows:
          q.type === "multi-grid" || q.type === "checkbox-grid"
            ? q.rows.map((row, index) => row || `Row ${index + 1}`) // Replace empty rows with placeholders
            : q.rows,
        columns:
          q.type === "multi-grid" || q.type === "checkbox-grid"
            ? q.columns.map((col, index) => col || `Column ${index + 1}`) // Replace empty columns with placeholders
            : q.columns,
        answers: q.answers, // Include answers for grid-based questions
        ratingScale: q.ratingScale, // Include rating scale for rating questions
        ratingShape: q.ratingShape, // Include rating shape for rating questions
        minValue: q.minValue, // Include minValue
        maxValue: q.maxValue, // Include maxValue
        minLabel: q.minLabel, // Include minLabel
        maxLabel: q.maxLabel, // Include maxLabel
        templateId: templateId || null,
      })),
      token, // Include the token
    };
  
    console.log("Payload sent to backend:", survey); // Log the payload
  
    try {
      const response = await fetch("http://localhost/systemsurvey/systemapp/src/backend/publishSurvey.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(survey),
      });

      
  
      const data = await response.json();
      console.log("Backend Response:", data); // Log the backend response
  
      if (data.success && data.surveyId) {
        setIsPublished(true);
        setSurveyId(data.surveyId); // Save the survey ID returned by the backend
        alert(`Survey published successfully! Shareable link: ${data.shareableLink}`);
      } else {
        alert(`Failed to publish survey: ${data.message}`);
      }
    } catch (error) {
      console.error("Error publishing survey:", error);
      alert("An error occurred while publishing the survey.");
    }
  };

  const copyResponderLink = () => {
    if (!isPublished) {
      alert("Please publish the survey first to generate a shareable link.");
      return;
    }
  
    console.log("Survey ID:", surveyId); // Log the survey ID
    if (!surveyId) {
      alert("Survey ID is missing. Unable to generate the link.");
      return;
    }
  
    const baseUrl = window.location.origin; // Includes the correct port
    const link = `${baseUrl}/answerpage/${surveyId}`;
    console.log("Generated Link:", link); // Debugging: Log the generated link
  
    navigator.clipboard
      .writeText(link)
      .then(() => {
        alert("Responder link copied to clipboard!");
        setShowSettingsPopup(false);
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        alert("Failed to copy link. Please try again.");
      });
  };

  // Add a new state to track which question is being selected
  const [selectedQuestionId, setSelectedQuestionId] = useState(null)
  // Add a new state to track if the survey title card is selected
  const [isTitleCardSelected, setIsTitleCardSelected] = useState(false)

  useEffect(() => {
    if (templateId) {
      loadTemplateData(templateId); // Load the template data based on the templateId
    }
  }, [templateId]);
  console.log("Template ID:", templateId);

  const loadTemplateData = (templateId) => {
  console.log("Loading template data for:", templateId);

  let templateData = {};

    switch (templateId) {
      case "tshirt-signup":
        templateData = {
          title: "T-Shirt Order Form",
          description: "Please fill out this form to order your t-shirt",
          questions: [
            {
              id: Date.now(),
              type: "multiple-choice",
              title: "What size t-shirt would you like?",
              required: true,
              options: ["Small", "Medium", "Large", "X-Large", "XX-Large"],
            },
            {
              id: Date.now() + 1,
              type: "multiple-choice",
              title: "What color would you prefer?",
              required: true,
              options: ["Black", "White", "Blue", "Red", "Green"],
            },
            {
              id: Date.now() + 2,
              type: "short-text",
              title: "Please enter your name for the order",
              required: true,
            },
            {
              id: Date.now() + 3,
              type: "long-text",
              title: "Any special instructions for your order?",
              required: false,
            },
          ],
        }
        break

      case "contact-info":
        templateData = {
          title: "Contact Information Form",
          description: "Please provide your contact details",
          questions: [
            {
              id: Date.now(),
              type: "short-text",
              title: "Full Name",
              required: true,
            },
            {
              id: Date.now() + 1,
              type: "short-text",
              title: "Email Address",
              required: true,
            },
            {
              id: Date.now() + 2,
              type: "short-text",
              title: "Phone Number",
              required: true,
            },
          ],
        }
        break

      case "party-invite":
        templateData = {
          title: "Party Invitation RSVP",
          description: "Please let us know if you can attend our party",
          questions: [
            {
              id: Date.now(),
              type: "short-text",
              title: "Your Name",
              required: true,
            },
            {
              id: Date.now() + 1,
              type: "yes-no",
              title: "Will you be attending?",
              required: true,
            },
            {
              id: Date.now() + 2,
              type: "multiple-choice",
              title: "How many guests will you bring?",
              required: true,
              options: ["0", "1", "2", "3", "4+"],
            },
            {
              id: Date.now() + 3,
              type: "checkbox",
              title: "Any dietary restrictions?",
              required: false,
              options: ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Nut Allergy"],
            },
          ],
        }
        break

      case "wedding-rsvp":
        templateData = {
          title: "Wedding RSVP",
          description: "Please respond to our wedding invitation",
          questions: [
            {
              id: Date.now(),
              type: "short-text",
              title: "Your Name",
              required: true,
            },
            {
              id: Date.now() + 1,
              type: "yes-no",
              title: "Will you be attending our wedding?",
              required: true,
            },
            {
              id: Date.now() + 2,
              type: "multiple-choice",
              title: "Number of guests",
              required: true,
              options: ["Just me", "Me + 1", "Me + family"],
            },
            {
              id: Date.now() + 3,
              type: "dropdown",
              title: "Meal preference",
              required: true,
              dropdownOptions: ["Chicken", "Beef", "Fish", "Vegetarian"],
            },
          ],
        }
        break

      // Add more templates as needed

      default:
        // Default empty template
        templateData = {
          title: "Untitled Form",
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
        }
    }

    // Set the template data
    setSurveyTitle(templateData.title)
    setSurveyDescription(templateData.description)
    setQuestions(templateData.questions)
  }

  // Function to handle drag start
  const handleDragStart = (questionId) => {
    if (isPreviewMode) return
    setDraggedQuestion(questionId)
  }

  // Function to handle drag over
  const handleDragOver = (e, questionId) => {
    e.preventDefault()
    const targetQuestion = questions.find((q) => q.id === questionId)

    // Prevent dragging over the formtitle type
    if (
      isPreviewMode ||
      draggedQuestion === null ||
      draggedQuestion === questionId ||
      targetQuestion.type === "formtitle"
    ) {
      return
    }

    // Highlight the drop target
    setQuestions(
      questions.map((q) => ({
        ...q,
        isDropTarget: q.id === questionId,
      })),
    )
  }

  // Function to handle drop
  const handleDrop = (e, targetQuestionId) => {
    e.preventDefault()
    if (isPreviewMode || draggedQuestion === null || draggedQuestion === targetQuestionId) {
      return
    }

    // Reorder questions
    const draggedIndex = questions.findIndex((q) => q.id === draggedQuestion)
    const targetIndex = questions.findIndex((q) => q.id === targetQuestionId)

    const updatedQuestions = [...questions]
    const [draggedItem] = updatedQuestions.splice(draggedIndex, 1)
    updatedQuestions.splice(targetIndex, 0, draggedItem)

    setQuestions(
      updatedQuestions.map((q) => ({
        ...q,
        isDropTarget: false, // Clear drop target indicator
      })),
    )
    setDraggedQuestion(null)
  }

  // Function to handle drag end
  const handleDragEnd = () => {
    setDraggedQuestion(null)
    // Clear all drop indicators
    setQuestions(
      questions.map((q) => ({
        ...q,
        isDropTarget: false,
      })),
    )
  }



  const questionTypes = [
    {
      id: "multiple-choice",
      name: "Multiple Choice",
      description: "Choose one from options",
      icon: <List size={20} />,
    },
    { id: "short-text", name: "Short Text", description: "Single line text response", icon: <FileText size={20} /> },
    { id: "long-text", name: "Long Text", description: "Multiple line text response", icon: <AlignLeft size={20} /> },
    { id: "checkbox", name: "Checkbox", description: "Select multiple options", icon: <CheckSquare size={20} /> },
    { id: "rating", name: "Rating Scale", description: "1-5 or 1-10 scale rating", icon: <Star size={20} /> },
    { id: "dropdown", name: "Dropdown", description: "Choose from dropdown list", icon: <ChevronDown size={20} /> },
    { id: "linear-scaling", name: "Linear Scaling", description: "Linear Scale", icon: <BarChart size={20} /> },
    { id: "date", name: "Date", description: "Date selection", icon: <Calendar size={20} /> },
    { id: "time", name: "Time", description: "Time selection", icon: <Clock size={20} /> },
    { id: "ranking", name: "Ranking", description: "Rank items in order", icon: <MoveVertical size={20} /> },
    {
      id: "multi-grid",
      name: "Multi Grid",
      description: "Grid of multiple choice questions",
      icon: <Grid size={20} />,
    },
    { id: "checkbox-grid", name: "Checkbox Grid", description: "Grid of checkbox questions", icon: <Grid size={20} /> },
    { id: "yes-no", name: "Yes/No", description: "Simple yes or no question", icon: <ToggleLeft size={20} /> },
  ]


  const handleRatingChange = (questionId, rating) => {
    setQuestions(questions.map((q) => (q.id === questionId ? { ...q, selectedRating: rating } : q)))
  }

  const handleScaleChange = (questionId, newScale) => {
    console.log("Scale Change:", { questionId, newScale });
    setQuestions(
      questions.map((q) =>
        q.id === questionId ? { ...q, ratingScale: newScale } : q
      )
    );
  };

  const handleShapeChange = (questionId, newShape) => {
    setQuestions(
      questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              ratingShape: newShape,
              ratingScale: newShape === "emoji" ? Math.min(q.ratingScale || 5, 5) : q.ratingScale || 5,
            }
          : q,
      ),
    )
  }

  // Function to handle deleting an option from a question
  const handleDeleteOption = (questionId, optionIndex) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.options) {
          return {
            ...q,
            options: q.options.filter((_, index) => index !== optionIndex),
          }
        }
        return q
      }),
    )
  }

  // Function to handle deleting a question
  const handleDeleteQuestion = (id) => {
    setQuestions(questions.filter((question) => question.id !== id))
  }

  const handleAddQuestion = (type) => {
    const newQuestion = {
      id: Date.now(), // Use timestamp as a unique ID
      type,
      title: "",
      required: false,
      ...(type === "multiple-choice" && { options: ["Option 1"] }),
      ...(type === "short-text" && { shortText: "" }),
      ...(type === "long-text" && { longText: "" }),
      ...(type === "checkbox" && { options: ["Option 1"] }),
      ...(type === "rating" && { ratingShape: "star", ratingScale: 5 }),
      ...(type === "dropdown" && { dropdownOptions: ["Option 1"] }),
      ...(type === "linear-scaling" && { minValue: 1, maxValue: 10, minLabel: "Min", maxLabel: "Max" }),
      ...(type === "date" && { date: "" }),
      ...(type === "time" && { time: "" }),
      ...(type === "ranking" && { options: ["Item 1", "Item 2", "Item 3"], rankOrder: [] }),
      ...(type === "multi-grid" && { rows: ["Row 1"], columns: ["Column 1"], answers: {} }),
      ...(type === "checkbox-grid" && { rows: ["Row 1"], columns: ["Column 1"], answers: {} }),
      ...(type === "yes-no" && { answer: null }),
    }

    setQuestions([...questions, newQuestion])
  }

 
  // FIXED: Pass the current question as a parameter to renderRatingIcon
  const renderRatingIcon = (shape, index, isActive, isHovered, currentQuestion) => {
    switch (shape) {
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
            {/* Fill layer (behind) */}
            <ThumbsUp
              size={32}
              className={`rating-icon rating-thumbs-fill ${isActive ? "active" : ""} ${isHovered ? "hovered" : ""}`}
            />
            {/* Outline layer (in front) - always visible */}
            <ThumbsUp
              size={32}
              className={`rating-icon rating-thumbs-base ${isActive ? "active" : ""} ${isHovered ? "hovered" : ""}`}
            />
          </div>
        )
      case "emoji":
        // Improved emoji set with angry face
        // FIXED: Use currentQuestion instead of undefined question
        const emojis = currentQuestion.ratingScale === 3 ? ["😡", "😐", "😁"] : ["😡", "😠", "😕", "🙂", "😁"]

        return (
          <span className={`rating-emoji ${isActive ? "active" : ""} ${isHovered ? "hovered" : ""}`}>
            {emojis[index]}
          </span>
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

  const handleTitleChange = (e, questionId) => {
    setQuestions(questions.map((q) => (q.id === questionId ? { ...q, title: e.target.textContent } : q)))
  }

  const handleDropdownChange = (e, questionId) => {
    setQuestions(questions.map((q) => (q.id === questionId ? { ...q, selectedValue: e.target.value } : q)))
  }

  // Function to handle row text changes in grid questions
  const handleRowTextChange = (questionId, rowIndex, newText) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.rows) {
          const updatedRows = [...q.rows]
          updatedRows[rowIndex] = newText
          return { ...q, rows: updatedRows }
        }
        return q
      }),
    )
  }

  // Function to handle column text changes in grid questions
  const handleColumnTextChange = (questionId, colIndex, newText) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.columns) {
          const updatedColumns = [...q.columns]
          updatedColumns[colIndex] = newText
          return { ...q, columns: updatedColumns }
        }
        return q
      }),
    )
  }

  // Function to add a new row to grid questions
  const handleAddRow = (questionId) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.rows) {
          return { ...q, rows: [...q.rows, ""] }; // Add an empty row
        }
        return q;
      })
    );
  };

  // Function to add a new column to grid questions
  const handleAddColumn = (questionId) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.columns) {
          return { ...q, columns: [...q.columns, ""] }; // Add an empty column
        }
        return q;
      })
    );
  };

  // Function to delete a row from grid questions
  const handleDeleteRow = (questionId, rowIndex) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.rows && q.rows.length > 1) {
          return {
            ...q,
            rows: q.rows.filter((_, index) => index !== rowIndex),
          }
        }
        return q
      }),
    )
  }

  // Function to delete a column from grid questions
  const handleDeleteColumn = (questionId, colIndex) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.columns && q.columns.length > 1) {
          return {
            ...q,
            columns: q.columns.filter((_, index) => index !== colIndex),
          }
        }
        return q
      }),
    )
  }

  // Function to handle grid answer selection
  const handleGridAnswerChange = (questionId, rowIndex, colIndex) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const rowKey = `row_${rowIndex}`
          const updatedAnswers = { ...q.answers }
          updatedAnswers[rowKey] = colIndex
          return { ...q, answers: updatedAnswers }
        }
        return q
      }),
    )
  }

  // Function to handle checkbox grid answer selection
  const handleCheckboxGridAnswerChange = (questionId, rowIndex, colIndex) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const key = `row_${rowIndex}_col_${colIndex}`
          const updatedAnswers = { ...q.answers }
          updatedAnswers[key] = !updatedAnswers[key]
          return { ...q, answers: updatedAnswers }
        }
        return q
      }),
    )
  }

  // Function to handle yes/no answer selection
  const handleYesNoChange = (questionId, answer) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return { ...q, answer }
        }
        return q
      }),
    )
  }

  // Function to handle ranking item drag start
  const handleRankingDragStart = (e, questionId, itemIndex) => {
    e.dataTransfer.setData("itemIndex", itemIndex)
    e.dataTransfer.setData("questionId", questionId)
  }

  // Function to handle ranking item drop
  const handleRankingDrop = (e, questionId, targetIndex) => {
    e.preventDefault()
    const sourceIndex = Number.parseInt(e.dataTransfer.getData("itemIndex"))
    const sourceQuestionId = e.dataTransfer.getData("questionId")

    if (sourceQuestionId !== questionId.toString()) return

    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.options) {
          const updatedOptions = [...q.options]
          const [movedItem] = updatedOptions.splice(sourceIndex, 1)
          updatedOptions.splice(targetIndex, 0, movedItem)

          // Update the rank order
          const updatedRankOrder = updatedOptions.map((_, index) => index)

          return { ...q, options: updatedOptions, rankOrder: updatedRankOrder }
        }
        return q
      }),
    )
  }

  // Function to handle ranking item drag over
  const handleRankingDragOver = (e) => {
    e.preventDefault()
  }

  // Add decorative background elements to the survey-builder div
  return (
    <div className="survey-builder">
      {/* Add decorative background elements */}

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
            <span>{questions.length} Questions</span>
          </div>
          <button className="header-button preview-button" onClick={() => setIsPreviewMode(!isPreviewMode)}>
            <Eye size={16} />
            <span>{isPreviewMode ? "Exit Preview" : "Preview"}</span>
          </button>
          <div className="publish-button-container">
            <button
              className={`header-button publish-button ${isPublished ? "published" : ""}`}
              onClick={handlePublish}
            >
              {isPublished ? (
                <>
                  <CheckCircle2 size={16} />
                  <span>Published</span>
                </>
              ) : (
                <>
                  <Upload size={16} />
                  <span>Publish</span>
                </>
              )}
            </button>
            {isPublished && (
              <>
                <button className="settings-button" onClick={() => setShowSettingsPopup(!showSettingsPopup)}>
                  <Settings size={16} />
                </button>
                {showSettingsPopup && (
                  <div className="settings-popup">
                    <button className="popup-option" onClick={copyResponderLink}>
                      <Link size={14} />
                      <span>Copy responder link</span>
                    </button>
                    <button
                      className="popup-option"
                      onClick={() => {
                        handlePublish()
                        setShowSettingsPopup(false)
                      }}
                    >
                      <Save size={14} />
                      <span>Save</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </header>

      {/* questiontypes */}
      <div className="survey-content">
        {!isPreviewMode && (
          <div className="question-types-panel">
            <h2>Question Types</h2>
            <p className="panel-description">Choose and click a question type to add</p>

            <div className="question-types-list">
              {questionTypes.map((type) => (
                <div key={type.id} className="question-type-item" onClick={() => handleAddQuestion(type.id)}>
                  <div className="question-type-icon">{type.icon}</div>
                  <div className="question-type-info">
                    <h3>{type.name}</h3>
                    <p>{type.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* createdby */}
        <div className="survey-questions-panel">
          <div className="preview-header">
            <h2>Created By:</h2>
            <p className="created-by">example@gmail.com</p>
          </div>

          {/* Survey Title and Description */}
          <div
            className={`survey-title-card ${
              isPreviewMode ? "preview-card" : ""
            } ${isPreviewMode && !surveyDescription ? "no-description" : ""} ${isTitleCardSelected ? "selected" : ""}`}
            onClick={() => {
              if (!isPreviewMode) {
                // When clicking on the title card, select it and deselect any question
                setIsTitleCardSelected(true)
                setSelectedQuestionId(null)
              }
            }}
          >
            {isPreviewMode ? (
              <div>
                <h2 className="survey-title-preview">{surveyTitle || "Untitled Survey"}</h2>
                {surveyDescription && <p className="survey-description-preview">{surveyDescription}</p>}
              </div>
            ) : (
              <div>
                <textarea
                  className="survey-title"
                  value={surveyTitle}
                  onChange={(e) => setSurveyTitle(e.target.value)}
                  onInput={(e) => {
                    e.target.style.height = "auto" // Reset height to auto
                    e.target.style.height = `${e.target.scrollHeight}px` // Adjust height based on content
                  }}
                  placeholder="Untitled Survey"
                  rows={1} // Default to 1 line
                  style={{ overflow: "hidden" }} // Prevent scrollbar
                />
                <textarea
                  className="survey-description"
                  value={surveyDescription}
                  onChange={(e) => setSurveyDescription(e.target.value)}
                  onInput={(e) => {
                    e.target.style.height = "auto" // Reset height to auto
                    e.target.style.height = `${e.target.scrollHeight}px` // Adjust height based on content
                  }}
                  placeholder="Survey Description"
                  rows={1} // Default to 1 line
                  style={{ overflow: "hidden" }} // Prevent scrollbar
                />
              </div>
            )}
          </div>

          <div className="survey-questions-list">
            {questions.map((question) => (
              <div
                key={question.id}
                className={`question-card ${
                  isPreviewMode ? "preview-card" : ""
                } ${draggedQuestion === question.id ? "dragging" : ""} ${question.isDropTarget ? "drop-target" : ""} ${selectedQuestionId === question.id ? "selected" : ""}`}
                draggable={false}
                onDragOver={(e) => handleDragOver(e, question.id)}
                onDrop={(e) => handleDrop(e, question.id)}
                onDragEnd={handleDragEnd}
                onClick={() => {
                  if (!isPreviewMode) {
                    setSelectedQuestionId(question.id)
                    setIsTitleCardSelected(false)
                  }
                }}
              >
                {/*multiple choice question*/}
                {question.type === "multiple-choice" ? (
                  <div className="multiple-choice-question">
                    <div className="question-header">
                      <div className="question-icon">
                        <List size={18} />
                      </div>
                      {isPreviewMode ? (
                        <div className="question-title-preview">
                          {question.title || "Untitled Question"}
                          {question.required && <span className="required-indicator">*</span>}
                        </div>
                      ) : (
                        <div className="question-title-container">
                          <textarea
                            className="question-title"
                            value={question.title}
                            placeholder="Multiple choice"
                            onChange={(e) => {
                              setQuestions(
                                questions.map((q) => (q.id === question.id ? { ...q, title: e.target.value } : q)),
                              )
                            }}
                            onInput={(e) => {
                              e.target.style.height = "auto" // Reset height to auto
                              e.target.style.height = `${e.target.scrollHeight}px` // Adjust height based on content
                            }}
                            rows={1}
                            style={{ overflow: "hidden", resize: "none" }} // Prevent resizing and hide scrollbar
                          />
                        </div>
                      )}
                    </div>
                    {!isPreviewMode && (
                      <div className="drag-handle" draggable={true} onDragStart={() => handleDragStart(question.id)}>
                        <Grip size={18} />
                      </div>
                    )}
                    <div className="options-list">
                      {question.options?.map((option, index) => (
                        <div key={index} className="option-item">
                          {/* Radio button input */}
                          <input
                            type="radio"
                            name={`multiple-choice-${question.id}`}
                            id={`radio-${question.id}-${index}`}
                            disabled={!isPreviewMode}
                            checked={question.selectedOption === index}
                            onChange={() => {
                              if (isPreviewMode) {
                                setQuestions(
                                  questions.map((q) => (q.id === question.id ? { ...q, selectedOption: index } : q)),
                                )
                              }
                            }}
                            style={{
                              cursor: isPreviewMode ? "pointer" : "default",
                              width: "18px",
                              height: "18px",
                              backgroundColor: "white",
                              appearance: "none",
                              border:
                                question.selectedOption === index ? "4px solid var(--primary-color)" : "1px solid #ccc",
                              borderRadius: "50%",
                              outline: "none",
                            }}
                          />
                          {isPreviewMode ? (
                            <span className="option-input-preview">{option || `Option ${index + 1}`}</span>
                          ) : (
                            <textarea
                              className="option-input"
                              value={option || ""}
                              onChange={(e) => {
                                setQuestions(
                                  questions.map((q) =>
                                    q.id === question.id
                                      ? {
                                          ...q,
                                          options: q.options.map((opt, i) => (i === index ? e.target.value : opt)),
                                        }
                                      : q,
                                  ),
                                )
                              }}
                              onInput={(e) => {
                                e.target.style.height = "auto" // Reset height to auto
                                e.target.style.height = `${e.target.scrollHeight}px` // Adjust height based on content
                              }}
                              placeholder={`Option ${index + 1}`} // Dynamic placeholder
                              rows={1}
                              style={{ overflow: "hidden", resize: "none" }} // Prevent resizing and hide scrollbar
                            />
                          )}

                          {!isPreviewMode && (
                            <button className="delete-option" onClick={() => handleDeleteOption(question.id, index)}>
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                      {!isPreviewMode && (
                        <button
                          className="add-option-button"
                          onClick={() =>
                            setQuestions(
                              questions.map((q) =>
                                q.id === question.id
                                  ? {
                                      ...q,
                                      options: [...q.options, ""], // Add an empty option
                                    }
                                  : q,
                              ),
                            )
                          }
                        >
                          <Plus size={16} /> Add Option
                        </button>
                      )}
                    </div>

                    {!isPreviewMode && (
                      <div
                        className={`question-actions-vertical ${selectedQuestionId === question.id ? "visible" : ""}`}
                      >
                        <button
                          className={`icon-button required-badge ${question.required ? "active" : ""}`}
                          onClick={() => {
                            setQuestions(
                              questions.map((q) => (q.id === question.id ? { ...q, required: !q.required } : q)),
                            )
                          }}
                          title={question.required ? "Required" : "Optional"}
                        >
                          <BadgeAlert size={18} />
                        </button>
                        <button
                          className="icon-button"
                          onClick={() => handleDeleteQuestion(question.id)}
                          title="Delete question"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                ) : question.type === "short-text" ? (
                  <div className="short-text-question">
                    <div className="question-header">
                      <div className="question-icon">
                        <FileText size={18} />
                      </div>
                      {isPreviewMode ? (
                        <div className="question-title-preview">
                          {question.title || "Untitled Question"}
                          {question.required && <span className="required-indicator">*</span>}
                        </div>
                      ) : (
                        <div className="question-title-container">
                          <textarea
                            className="question-title"
                            value={question.title}
                            onChange={(e) => {
                              setQuestions(
                                questions.map((q) => (q.id === question.id ? { ...q, title: e.target.value } : q)),
                              )
                            }}
                            onInput={(e) => {
                              e.target.style.height = "auto" // Reset height to auto
                              e.target.style.height = `${e.target.scrollHeight}px` // Adjust height based on content
                            }}
                            placeholder="Short text"
                            rows={1}
                            style={{ overflow: "hidden", resize: "none" }} // Prevent resizing and hide scrollbar
                          />
                        </div>
                      )}
                    </div>
                    {!isPreviewMode && (
                      <div className="drag-handle" draggable={true} onDragStart={() => handleDragStart(question.id)}>
                        <Grip size={18} />
                      </div>
                    )}
                    <input
                      className="short-text-input"
                      value={question.shortText || ""} // Bind to the specific question's shortText property
                      onChange={(e) => {
                        if (isPreviewMode) {
                          // Only allow changes in preview mode
                          setQuestions(
                            questions.map(
                              (q) => (q.id === question.id ? { ...q, shortText: e.target.value } : q), // Update the shortText for the specific question
                            ),
                          )
                        }
                      }}
                      placeholder="Answer..."
                      style={{ overflow: "hidden", resize: "none" }} // Prevent resizing and hide scrollbar
                      disabled={!isPreviewMode} // Disable input when not in preview mode
                    />
                    {!isPreviewMode && (
                      <div
                        className={`question-actions-vertical ${selectedQuestionId === question.id ? "visible" : ""}`}
                      >
                        <button
                          className={`icon-button required-badge ${question.required ? "active" : ""}`}
                          onClick={() => {
                            setQuestions(
                              questions.map((q) => (q.id === question.id ? { ...q, required: !q.required } : q)),
                            )
                          }}
                          title={question.required ? "Required" : "Optional"}
                        >
                          <BadgeAlert size={18} />
                        </button>
                        <button
                          className="icon-button"
                          onClick={() => handleDeleteQuestion(question.id)}
                          title="Delete question"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                ) : question.type === "long-text" ? (
                  <div className="long-text-question">
                    <div className="question-header">
                      <div className="question-icon">
                        <FileText size={18} />
                      </div>
                      {isPreviewMode ? (
                        <div className="question-title-preview">
                          {question.title || "Untitled Question"}
                          {question.required && <span className="required-indicator">*</span>}
                        </div>
                      ) : (
                        <div className="question-title-container">
                          <textarea
                            className="question-title"
                            value={question.title || ""} // Ensure value is an empty string if title is undefined
                            onChange={(e) => {
                              setQuestions(
                                questions.map((q) => (q.id === question.id ? { ...q, title: e.target.value } : q)),
                              )
                            }}
                            onInput={(e) => {
                              e.target.style.height = "auto" // Reset height to auto
                              e.target.style.height = `${e.target.scrollHeight}px` // Adjust height based on content
                            }}
                            placeholder="Long text" // Placeholder text
                            rows={1}
                            style={{ overflow: "hidden", resize: "none" }} // Prevent resizing and hide scrollbar
                          />
                        </div>
                      )}
                    </div>
                    {!isPreviewMode && (
                      <div className="drag-handle" draggable={true} onDragStart={() => handleDragStart(question.id)}>
                        <Grip size={18} />
                      </div>
                    )}
                    <textarea
                      className="long-text-input"
                      value={question.longText || ""} // Bind to the specific question's longText property
                      onChange={(e) => {
                        if (isPreviewMode) {
                          // Only allow changes in preview mode
                          setQuestions(
                            questions.map(
                              (q) => (q.id === question.id ? { ...q, longText: e.target.value } : q), // Update the longText for the specific question
                            ),
                          )
                        }
                      }}
                      onInput={(e) => {
                        e.target.style.height = "auto" // Reset height to auto
                        e.target.style.height = `${e.target.scrollHeight}px` // Adjust height based on content
                      }}
                      placeholder="Answer..."
                      rows={4}
                      style={{ overflow: "hidden" }} // Prevent scrollbar
                      disabled={!isPreviewMode} // Disable input when not in preview mode
                    />
                    {!isPreviewMode && (
                      <div
                        className={`question-actions-vertical ${selectedQuestionId === question.id ? "visible" : ""}`}
                      >
                        <button
                          className={`icon-button required-badge ${question.required ? "active" : ""}`}
                          onClick={() => {
                            setQuestions(
                              questions.map((q) => (q.id === question.id ? { ...q, required: !q.required } : q)),
                            )
                          }}
                          title={question.required ? "Required" : "Optional"}
                        >
                          <BadgeAlert size={18} />
                        </button>
                        <button
                          className="icon-button"
                          onClick={() => handleDeleteQuestion(question.id)}
                          title="Delete question"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                ) : question.type === "checkbox" ? (
                  <div className="checkbox-question">
                    <div className="question-header">
                      <div className="question-icon">
                        <CheckSquare size={18} />
                      </div>
                      {isPreviewMode ? (
                        <div className="question-title-preview">
                          {question.title || "Untitled Question"}
                          {question.required && <span className="required-indicator">*</span>}
                        </div>
                      ) : (
                        <div className="question-title-container">
                          <textarea
                            className="question-title"
                            value={question.title || ""}
                            onChange={(e) => {
                              setQuestions(
                                questions.map((q) => (q.id === question.id ? { ...q, title: e.target.value } : q)),
                              )
                            }}
                            onInput={(e) => {
                              e.target.style.height = "auto" // Reset height to auto
                              e.target.style.height = `${e.target.scrollHeight}px` // Adjust height based on content
                            }}
                            placeholder="Checkbox"
                            rows={1}
                            style={{ overflow: "hidden", resize: "none" }} // Prevent resizing and hide scrollbar
                          />
                        </div>
                      )}
                    </div>
                    {!isPreviewMode && (
                      <div className="drag-handle" draggable={true} onDragStart={() => handleDragStart(question.id)}>
                        <Grip size={18} />
                      </div>
                    )}
                    <div className="options-list">
                      {question.options?.map((option, index) => (
                        <div key={index} className="option-item">
                          <label
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              cursor: isPreviewMode ? "pointer" : "default",
                            }}
                          >
                            <input
                              type="checkbox"
                              id={`checkbox-${question.id}-${index}`}
                              style={{ display: "none" }} // Hide the actual checkbox
                              disabled={!isPreviewMode} // Disable checkbox in non-preview mode
                              checked={question.selectedOptions?.includes(index)} // Track checked state
                              onChange={(e) => {
                                if (isPreviewMode) {
                                  // Update the selectedOptions array for this question
                                  const currentSelected = question.selectedOptions || []
                                  const newSelected = e.target.checked
                                    ? [...currentSelected, index]
                                    : currentSelected.filter((i) => i !== index)

                                  setQuestions(
                                    questions.map((q) =>
                                      q.id === question.id ? { ...q, selectedOptions: newSelected } : q,
                                    ),
                                  )
                                }
                              }}
                            />
                            <div className="option-checkbox"></div> {/* Styled checkbox */}
                          </label>

                          {isPreviewMode ? (
                            <span className="option-input-preview">{option || `Option ${index + 1}`}</span>
                          ) : (
                            <textarea
                              className="option-input"
                              value={option || ""}
                              onChange={(e) => {
                                setQuestions(
                                  questions.map((q) =>
                                    q.id === question.id
                                      ? {
                                          ...q,
                                          options: q.options.map((opt, i) => (i === index ? e.target.value : opt)),
                                        }
                                      : q,
                                  ),
                                )
                              }}
                              onInput={(e) => {
                                e.target.style.height = "auto" // Reset height to auto
                                e.target.style.height = `${e.target.scrollHeight}px` // Adjust height based on content
                              }}
                              placeholder={`Option ${index + 1}`} // Dynamic placeholder
                              rows={1}
                              style={{ overflow: "hidden", resize: "none" }} // Prevent resizing and hide scrollbar
                            />
                          )}

                          {!isPreviewMode && (
                            <button className="delete-option" onClick={() => handleDeleteOption(question.id, index)}>
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                      {!isPreviewMode && (
                        <button
                          className="add-option-button"
                          onClick={() =>
                            setQuestions(
                              questions.map((q) =>
                                q.id === question.id
                                  ? {
                                      ...q,
                                      options: [...q.options, ""], // Add an empty option
                                    }
                                  : q,
                              ),
                            )
                          }
                        >
                          <Plus size={16} /> Add Option
                        </button>
                      )}
                    </div>
                    {!isPreviewMode && (
                      <div
                        className={`question-actions-vertical ${selectedQuestionId === question.id ? "visible" : ""}`}
                      >
                        <button
                          className={`icon-button required-badge ${question.required ? "active" : ""}`}
                          onClick={() => {
                            setQuestions(
                              questions.map((q) => (q.id === question.id ? { ...q, required: !q.required } : q)),
                            )
                          }}
                          title={question.required ? "Required" : "Optional"}
                        >
                          <BadgeAlert size={18} />
                        </button>
                        <button
                          className="icon-button"
                          onClick={() => handleDeleteQuestion(question.id)}
                          title="Delete question"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                ) : question.type === "rating" ? (
                  <div className="rating-question">
                    <div className="question-header">
                      <div className="question-icon">
                        <Star size={18} />
                      </div>
                      {isPreviewMode ? (
                        <div className="question-title-preview">
                          {question.title || "Untitled Rating Question"}
                          {question.required && <span className="required-indicator">*</span>}
                        </div>
                      ) : (
                        <div className="question-title-container">
                          <textarea
                            className="question-title"
                            value={question.title || ""}
                            onChange={(e) =>
                              setQuestions(
                                questions.map((q) => (q.id === question.id ? { ...q, title: e.target.value } : q)),
                              )
                            }
                            placeholder="Rating"
                            rows={1}
                            style={{ overflow: "hidden", resize: "none" }}
                          />
                        </div>
                      )}
                    </div>
                    {!isPreviewMode && (
                      <div className="drag-handle" draggable={true} onDragStart={() => handleDragStart(question.id)}>
                        <Grip size={18} />
                      </div>
                    )}

                    {!isPreviewMode ? (
                      <div className="rating-settings">
                        <div className="rating-settings-group">
                          <label htmlFor={`rating-${question.id}`}>Rating</label>
                          <select
                            id={`rating-${question.id}`}
                            value={question.ratingScale || 5}
                            onChange={(e) => handleScaleChange(question.id, Number.parseInt(e.target.value))} // Use handleScaleChange
                          >
                            {question.ratingShape === "emoji" ? (
                              <>
                                <option value="3">3</option>
                                <option value="5">5</option>
                              </>
                            ) : (
                              <>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                                <option value="6">6</option>
                                <option value="7">7</option>
                                <option value="8">8</option>
                                <option value="9">9</option>
                                <option value="10">10</option>
                              </>
                            )}
                          </select>
                        </div>

                        <div className="rating-settings-group">
                          <label htmlFor={`rating-shape-${question.id}`}>Rating Shape</label>
                          <select
                            id={`rating-shape-${question.id}`}
                            value={question.ratingShape || "star"}
                            onChange={(e) => handleShapeChange(question.id, e.target.value)} // Use handleShapeChange
                          >
                            <option value="star">Stars</option>
                            <option value="heart">Hearts</option>
                            <option value="like">Thumbs Up</option>
                            <option value="emoji">Emojis</option>
                          </select>
                        </div>
                      </div>
                    ) : (
                      <div className="rating-preview">
                      {[...Array(question.ratingScale || 5)].map((_, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleRatingChange(question.id, index + 1)} // Use handleRatingChange
                          onMouseEnter={() =>
                            setQuestions(
                              questions.map((q) => (q.id === question.id ? { ...q, hoveredRating: index + 1 } : q)),
                            )
                          }
                          onMouseLeave={() =>
                            setQuestions(
                              questions.map((q) => (q.id === question.id ? { ...q, hoveredRating: null } : q)),
                            )
                          }
                          className={`rating-button ${
                            question.hoveredRating && index < question.hoveredRating ? "hovered" : ""
                          }`}
                          aria-label={`Rate ${index + 1} out of ${question.ratingScale || 5}`}
                        >
                          {renderRatingIcon(
                            question.ratingShape || "star",
                            index,
                            question.selectedRating ? index < question.selectedRating : false,
                            question.hoveredRating ? index < question.hoveredRating : false,
                            question,
                          )}
                        </button>
                      ))}
                    </div>
                    )}

                    {/* Add Question Actions */}
                    {!isPreviewMode && (
                      <div
                        className={`question-actions-vertical ${selectedQuestionId === question.id ? "visible" : ""}`}
                      >
                        <button
                          className={`icon-button required-badge ${question.required ? "active" : ""}`}
                          onClick={() =>
                            setQuestions(
                              questions.map((q) => (q.id === question.id ? { ...q, required: !q.required } : q)),
                            )
                          }
                          title={question.required ? "Required" : "Optional"}
                        >
                          <BadgeAlert size={18} />
                        </button>
                        <button
                          className="icon-button"
                          onClick={() => handleDeleteQuestion(question.id)}
                          title="Delete question"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                ) : question.type === "dropdown" ? (
                  <div className="dropdown-question">
                    <div className="question-header">
                      <div className="question-icon">
                        <ChevronDown size={18} />
                      </div>
                      {isPreviewMode ? (
                        <div className="question-title-preview">
                          {question.title || "Untitled Question"}
                          {question.required && <span className="required-indicator">*</span>}
                        </div>
                      ) : (
                        <div className="question-title-container">
                          <textarea
                            className="question-title"
                            value={question.title}
                            placeholder="Dropdown"
                            onChange={(e) => {
                              setQuestions(
                                questions.map((q) => (q.id === question.id ? { ...q, title: e.target.value } : q)),
                              )
                            }}
                            onInput={(e) => {
                              e.target.style.height = "auto" // Reset height to auto
                              e.target.style.height = `${e.target.scrollHeight}px` // Adjust height based on content
                            }}
                            rows={1}
                            style={{ overflow: "hidden", resize: "none" }} // Prevent resizing and hide scrollbar
                          />
                        </div>
                      )}
                    </div>
                    {!isPreviewMode && (
                      <div className="drag-handle" draggable={true} onDragStart={() => handleDragStart(question.id)}>
                        <Grip size={18} />
                      </div>
                    )}

                    {isPreviewMode ? (
                      <select className="dropdown-select" onChange={(e) => handleDropdownChange(e, question.id)}>
                        {question.dropdownOptions?.length > 0 ? (
                          question.dropdownOptions.map((option, index) => (
                            <option key={index} value={option}>
                              {option || `Option ${index + 1}`} {/* Display placeholder if option is empty */}
                            </option>
                          ))
                        ) : (
                          <option>No options available</option>
                        )}
                      </select>
                    ) : (
                      <div className="dropdown-options-list">
                        {question.dropdownOptions?.map((option, index) => (
                          <div key={index} className="option-item">
                            <input
                              type="text"
                              className="dropdown-option-input"
                              value={option || ""}
                              onChange={(e) => {
                                setQuestions(
                                  questions.map((q) =>
                                    q.id === question.id
                                      ? {
                                          ...q,
                                          dropdownOptions: q.dropdownOptions.map((opt, i) =>
                                            i === index ? e.target.value : opt,
                                          ),
                                        }
                                      : q,
                                  ),
                                )
                              }}
                              placeholder={`Option ${index + 1}`} // Dynamic placeholder
                            />
                            <button
                              className="delete-option"
                              onClick={() => {
                                setQuestions(
                                  questions.map((q) =>
                                    q.id === question.id
                                      ? {
                                          ...q,
                                          dropdownOptions: q.dropdownOptions.filter((_, i) => i !== index),
                                        }
                                      : q,
                                  ),
                                )
                              }}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                        <button
                          className="add-option-button"
                          onClick={() =>
                            setQuestions(
                              questions.map((q) =>
                                q.id === question.id
                                  ? {
                                      ...q,
                                      dropdownOptions: [...q.dropdownOptions, ""], // Add an empty option
                                    }
                                  : q,
                              ),
                            )
                          }
                        >
                          <Plus size={16} /> Add Option
                        </button>
                      </div>
                    )}

                    {/* Add Question Actions */}
                    {!isPreviewMode && (
                      <div
                        className={`question-actions-vertical ${selectedQuestionId === question.id ? "visible" : ""}`}
                      >
                        <button
                          className={`icon-button required-badge ${question.required ? "active" : ""}`}
                          onClick={() =>
                            setQuestions(
                              questions.map((q) => (q.id === question.id ? { ...q, required: !q.required } : q)),
                            )
                          }
                          title={question.required ? "Required" : "Optional"}
                        >
                          <BadgeAlert size={18} />
                        </button>
                        <button
                          className="icon-button"
                          onClick={() => handleDeleteQuestion(question.id)}
                          title="Delete question"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                ) : question.type === "linear-scaling" ? (
                  <div className="linear-scaling-question">
                    <div className="question-header">
                      <div className="question-icon">
                        <BarChart size={18} />
                      </div>
                      {isPreviewMode ? (
                        <div className="question-title-preview">
                          {question.title || "Untitled Question"}
                          {question.required && <span className="required-indicator">*</span>}
                        </div>
                      ) : (
                        <div className="question-title-container">
                          <textarea
                            className="question-title"
                            value={question.title}
                            placeholder="Linear scaling"
                            onChange={(e) => {
                              setQuestions(
                                questions.map((q) => (q.id === question.id ? { ...q, title: e.target.value } : q)),
                              )
                            }}
                            onInput={(e) => {
                              e.target.style.height = "auto" // Reset height to auto
                              e.target.style.height = `${e.target.scrollHeight}px` // Adjust height based on content
                            }}
                            rows={1}
                            style={{ overflow: "hidden", resize: "none" }} // Prevent resizing and hide scrollbar
                          />
                        </div>
                      )}
                    </div>
                    {!isPreviewMode && (
                      <div className="drag-handle" draggable={true} onDragStart={() => handleDragStart(question.id)}>
                        <Grip size={18} />
                      </div>
                    )}

                    {/* Edit Mode: Min/Max Settings */}
                    {!isPreviewMode ? (
                      <div className="linear-scaling-settings">
                      <div className="linear-scaling-row">
                        <div className="linear-scaling-item">
                          <label>Minimum Value</label>
                          <select
                            value={question.minValue}
                            onChange={(e) =>
                              setQuestions(
                                questions.map((q) =>
                                  q.id === question.id ? { ...q, minValue: Number.parseInt(e.target.value) } : q
                                )
                              )
                            }
                          >
                            {[0, 1].map((value) => (
                              <option key={value} value={value}>
                                {value}
                              </option>
                            ))}
                          </select>
                          <label>Minimum Label</label>
                          <input
                            type="text"
                            value={question.minLabel || ""}
                            onChange={(e) =>
                              setQuestions(
                                questions.map((q) => (q.id === question.id ? { ...q, minLabel: e.target.value } : q))
                              )
                            }
                            placeholder="e.g., Not at all likely"
                          />
                        </div>
                        <div className="linear-scaling-item">
                          <label>Maximum Value</label>
                          <select
                            value={question.maxValue}
                            onChange={(e) =>
                              setQuestions(
                                questions.map((q) =>
                                  q.id === question.id ? { ...q, maxValue: Number.parseInt(e.target.value) } : q
                                )
                              )
                            }
                          >
                            {[...Array(9)].map((_, i) => (
                              <option key={i + 2} value={i + 2}>
                                {i + 2}
                              </option>
                            ))}
                          </select>
                          <label>Maximum Label</label>
                          <input
                            type="text"
                            value={question.maxLabel || ""}
                            onChange={(e) =>
                              setQuestions(
                                questions.map((q) => (q.id === question.id ? { ...q, maxLabel: e.target.value } : q))
                              )
                            }
                            placeholder="e.g., Extremely likely"
                          />
                        </div>
                      </div>
                    </div>
                    ) : (
                      // Preview Mode: Full Structure with Radio Buttons
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
                                  onChange={(e) =>
                                    setQuestions(
                                      questions.map((q) =>
                                        q.id === question.id
                                          ? { ...q, selectedValue: Number.parseInt(e.target.value) }
                                          : q
                                      )
                                    )
                                  }
                                />
                                <div className="radio-circle"></div>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!isPreviewMode && (
                      <div
                        className={`question-actions-vertical ${selectedQuestionId === question.id ? "visible" : ""}`}
                      >
                        <button
                          className={`icon-button required-badge ${question.required ? "active" : ""}`}
                          onClick={() => {
                            setQuestions(
                              questions.map((q) => (q.id === question.id ? { ...q, required: !q.required } : q)),
                            )
                          }}
                          title={question.required ? "Required" : "Optional"}
                        >
                          <BadgeAlert size={18} />
                        </button>
                        <button
                          className="icon-button"
                          onClick={() => handleDeleteQuestion(question.id)}
                          title="Delete question"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                ) : question.type === "date" ? (
                  <div className="date-question">
                    <div className="question-header">
                      <div className="question-icon">
                        <Calendar size={18} />
                      </div>
                      {isPreviewMode ? (
                        <div className="question-title-preview">
                          {question.title || "Untitled Question"}
                          {question.required && <span className="required-indicator">*</span>}
                        </div>
                      ) : (
                        <div className="question-title-container">
                          <textarea
                            className="question-title"
                            value={question.title}
                            placeholder="Date input"
                            onChange={(e) => {
                              setQuestions(
                                questions.map((q) => (q.id === question.id ? { ...q, title: e.target.value } : q)),
                              )
                            }}
                            onInput={(e) => {
                              e.target.style.height = "auto" // Reset height to auto
                              e.target.style.height = `${e.target.scrollHeight}px` // Adjust height based on content
                            }}
                            rows={1}
                            style={{ overflow: "hidden", resize: "none" }} // Prevent resizing and hide scrollbar
                          />
                        </div>
                      )}
                    </div>
                    {!isPreviewMode && (
                      <div className="drag-handle" draggable={true} onDragStart={() => handleDragStart(question.id)}>
                        <Grip size={18} />
                      </div>
                    )}
                    <div className="date-input-container">
                      <ReactDatePicker
                        selected={question.selectedDate}
                        onChange={(date) => {
                          if (isPreviewMode) {
                            setQuestions(
                              questions.map((q) => (q.id === question.id ? { ...q, selectedDate: date } : q)),
                            )
                          }
                        }}
                        placeholderText="Select a date"
                        className="date-input"
                        disabled={!isPreviewMode} // Disable input in non-preview mode
                        popperPlacement="bottom-start"
                        popperModifiers={{
                          preventOverflow: {
                            enabled: true,
                          },
                        }}
                        portalId="date-picker-portal"
                      />
                      <Calendar size={18} />
                    </div>

                    {/* Question Actions */}
                    {!isPreviewMode && (
                      <div
                        className={`question-actions-vertical ${selectedQuestionId === question.id ? "visible" : ""}`}
                      >
                        <button
                          className={`icon-button required-badge ${question.required ? "active" : ""}`}
                          onClick={() => {
                            setQuestions(
                              questions.map((q) => (q.id === question.id ? { ...q, required: !q.required } : q)),
                            )
                          }}
                          title={question.required ? "Required" : "Optional"}
                        >
                          <BadgeAlert size={18} />
                        </button>
                        <button
                          className="icon-button"
                          onClick={() => handleDeleteQuestion(question.id)}
                          title="Delete question"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                ) : question.type === "time" ? (
                  <div className="time-question">
                    <div className="question-header">
                      <div className="question-icon">
                        <Clock size={18} />
                      </div>
                      {isPreviewMode ? (
                        <div className="question-title-preview">
                          {question.title || "Untitled Question"}
                          {question.required && <span className="required-indicator">*</span>}
                        </div>
                      ) : (
                        <div className="question-title-container">
                          <textarea
                            className="question-title"
                            value={question.title}
                            placeholder="Time input"
                            onChange={(e) => {
                              setQuestions(
                                questions.map((q) => (q.id === question.id ? { ...q, title: e.target.value } : q)),
                              )
                            }}
                            onInput={(e) => {
                              e.target.style.height = "auto" // Reset height to auto
                              e.target.style.height = `${e.target.scrollHeight}px` // Adjust height based on content
                            }}
                            rows={1}
                            style={{ overflow: "hidden", resize: "none" }} // Prevent resizing and hide scrollbar
                          />
                        </div>
                      )}
                    </div>
                    {!isPreviewMode && (
                      <div className="drag-handle" draggable={true} onDragStart={() => handleDragStart(question.id)}>
                        <Grip size={18} />
                      </div>
                    )}
                    <div className="time-input-container">
                      <ReactDatePicker
                        selected={question.selectedTime}
                        onChange={(time) => {
                          if (isPreviewMode) {
                            setQuestions(
                              questions.map((q) => (q.id === question.id ? { ...q, selectedTime: time } : q)),
                            )
                          }
                        }}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        timeCaption="Time"
                        dateFormat="h:mm aa"
                        placeholderText="Select a time"
                        className="time-input"
                        disabled={!isPreviewMode} // Disable input in non-preview mode
                        popperPlacement="bottom-start"
                        popperModifiers={{
                          preventOverflow: {
                            enabled: true,
                          },
                        }}
                        portalId="time-picker-portal"
                      />
                      <Clock size={20} className="time-icon" />
                    </div>
                    {!isPreviewMode && (
                      <div
                        className={`question-actions-vertical ${selectedQuestionId === question.id ? "visible" : ""}`}
                      >
                        <button
                          className={`icon-button required-badge ${question.required ? "active" : ""}`}
                          onClick={() => {
                            setQuestions(
                              questions.map((q) => (q.id === question.id ? { ...q, required: !q.required } : q)),
                            )
                          }}
                          title={question.required ? "Required" : "Optional"}
                        >
                          <BadgeAlert size={18} />
                        </button>
                        <button
                          className="icon-button"
                          onClick={() => handleDeleteQuestion(question.id)}
                          title="Delete question"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>

                  
                ) : question.type === "yes-no" ? (
                  // Yes/No Question Type
                  <div className="yes-no-question">
                    <div className="question-header">
                      <div className="question-icon">
                        <ToggleLeft size={18} />
                      </div>
                      {isPreviewMode ? (
                        <div className="question-title-preview">
                          {question.title || "Untitled Question"}
                          {question.required && <span className="required-indicator">*</span>}
                        </div>
                      ) : (
                        <div className="question-title-container">
                          <textarea
                            className="question-title"
                            value={question.title}
                            placeholder="Yes/No question"
                            onChange={(e) => {
                              setQuestions(
                                questions.map((q) => (q.id === question.id ? { ...q, title: e.target.value } : q)),
                              )
                            }}
                            onInput={(e) => {
                              e.target.style.height = "auto"
                              e.target.style.height = `${e.target.scrollHeight}px`
                            }}
                            rows={1}
                            style={{ overflow: "hidden", resize: "none" }}
                          />
                          {question.required && <span className="required-indicator">*</span>}
                        </div>
                      )}
                    </div>
                    {!isPreviewMode && (
                      <div className="drag-handle" draggable={true} onDragStart={() => handleDragStart(question.id)}>
                        <Grip size={18} />
                      </div>
                    )}

                    <div className="yes-no-options">
                      <div className="yes-no-option">
                        <input
                          type="radio"
                          id={`yes-${question.id}`}
                          name={`yes-no-${question.id}`}
                          checked={question.answer === true}
                          onChange={() => {
                            if (isPreviewMode) {
                              handleYesNoChange(question.id, true)
                            }
                          }}
                          disabled={!isPreviewMode}
                          style={{
                            cursor: isPreviewMode ? "pointer" : "default",
                            width: "18px",
                            height: "18px",
                            backgroundColor: "white",
                            appearance: "none",
                            border: question.answer === true ? "4px solid var(--primary-color)" : "1px solid #ccc",
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
                          checked={question.answer === false}
                          onChange={() => {
                            if (isPreviewMode) {
                              handleYesNoChange(question.id, false)
                            }
                          }}
                          disabled={!isPreviewMode}
                          style={{
                            cursor: isPreviewMode ? "pointer" : "default",
                            width: "18px",
                            height: "18px",
                            backgroundColor: "white",
                            appearance: "none",
                            border: question.answer === false ? "4px solid var(--primary-color)" : "1px solid #ccc",
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

                    {!isPreviewMode && (
                      <div
                        className={`question-actions-vertical ${selectedQuestionId === question.id ? "visible" : ""}`}
                      >
                        <button
                          className={`icon-button required-badge ${question.required ? "active" : ""}`}
                          onClick={() => {
                            setQuestions(
                              questions.map((q) => (q.id === question.id ? { ...q, required: !q.required } : q)),
                            )
                          }}
                          title={question.required ? "Required" : "Optional"}
                        >
                          <BadgeAlert size={18} />
                        </button>
                        <button
                          className="icon-button"
                          onClick={() => handleDeleteQuestion(question.id)}
                          title="Delete question"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                ) : question.type === "ranking" ? (
                  // Ranking Question Type
                  <div className="ranking-question">
                    <div className="question-header">
                      <div className="question-icon">
                        <MoveVertical size={18} />
                      </div>
                      {isPreviewMode ? (
                        <div className="question-title-preview">
                          {question.title || "Untitled Question"}
                          {question.required && <span className="required-indicator">*</span>}
                        </div>
                      ) : (
                        <div className="question-title-container">
                          <textarea
                            className="question-title"
                            value={question.title}
                            placeholder="Ranking question"
                            onChange={(e) => {
                              setQuestions(
                                questions.map((q) => (q.id === question.id ? { ...q, title: e.target.value } : q)),
                              )
                            }}
                            onInput={(e) => {
                              e.target.style.height = "auto"
                              e.target.style.height = `${e.target.scrollHeight}px`
                            }}
                            rows={1}
                            style={{ overflow: "hidden", resize: "none" }}
                          />
                        </div>
                      )}
                    </div>
                    {!isPreviewMode && (
                      <div className="drag-handle" draggable={true} onDragStart={() => handleDragStart(question.id)}>
                        <Grip size={18} />
                      </div>
                    )}

                    <div className="ranking-items">
                      {question.options?.map((item, index) => (
                        <div
                          key={index}
                          className={`ranking-item ${isPreviewMode ? "preview" : ""}`}
                          draggable={isPreviewMode}
                          onDragStart={(e) => isPreviewMode && handleRankingDragStart(e, question.id, index)}
                          onDragOver={(e) => isPreviewMode && handleRankingDragOver(e)}
                          onDrop={(e) => isPreviewMode && handleRankingDrop(e, question.id, index)}
                        >
                          <div className="ranking-item-number">{index + 1}</div>
                          {isPreviewMode ? (
                            <div className="ranking-item-text">
                              {item || `Item ${index + 1}`} {/* Always show placeholder text in preview mode */}
                            </div>
                          ) : (
                            <textarea
                              className="ranking-item-input"
                              value={item}
                              onChange={(e) => {
                                setQuestions(
                                  questions.map((q) =>
                                    q.id === question.id
                                      ? {
                                          ...q,
                                          options: q.options.map((opt, i) => (i === index ? e.target.value : opt)),
                                        }
                                      : q,
                                  ),
                                )
                              }}
                              onInput={(e) => {
                                e.target.style.height = "auto"
                                e.target.style.height = `${e.target.scrollHeight}px`
                              }}
                              placeholder={`Item ${index + 1}`} // Always show placeholder text
                              rows={1}
                              style={{
                                overflow: "hidden",
                                resize: "none",
                                color: item ? "inherit" : "var(--text-secondary)", // Greyed-out text for empty items
                              }}
                            />
                          )}
                          {!isPreviewMode && (
                            <button className="delete-option" onClick={() => handleDeleteOption(question.id, index)}>
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                      {!isPreviewMode && (
                        <button
                          className="add-option-button"
                          onClick={() =>
                            setQuestions(
                              questions.map((q) =>
                                q.id === question.id
                                  ? { ...q, options: [...q.options, ""] } // Add an empty option for new items
                                  : q,
                              ),
                            )
                          }
                        >
                          <Plus size={16} /> Add Item
                        </button>
                      )}
                    </div>

                    {isPreviewMode && (
                      <div className="ranking-instructions">
                        <p>Drag and drop items to rank them in order of preference.</p>
                      </div>
                    )}

                    {!isPreviewMode && (
                      <div
                        className={`question-actions-vertical ${selectedQuestionId === question.id ? "visible" : ""}`}
                      >
                        <button
                          className={`icon-button required-badge ${question.required ? "active" : ""}`}
                          onClick={() => {
                            setQuestions(
                              questions.map((q) => (q.id === question.id ? { ...q, required: !q.required } : q)),
                            )
                          }}
                          title={question.required ? "Required" : "Optional"}
                        >
                          <BadgeAlert size={18} />
                        </button>
                        <button
                          className="icon-button"
                          onClick={() => handleDeleteQuestion(question.id)}
                          title="Delete question"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                ) : question.type === "multi-grid" ? (
                  // Multi Grid Question Type
                  <div className="grid-question multi-grid-question">
                    <div className="question-header">
                      <div className="question-icon">
                        <Grid size={18} />
                      </div>
                      {isPreviewMode ? (
                        <div className="question-title-preview">
                          {question.title || "Untitled Question"}
                          {question.required && <span className="required-indicator">*</span>}
                        </div>
                      ) : (
                        <div className="question-title-container">
                          <textarea
                            className="question-title"
                            value={question.title}
                            placeholder="Multi grid question"
                            onChange={(e) => {
                              setQuestions(
                                questions.map((q) => (q.id === question.id ? { ...q, title: e.target.value } : q)),
                              )
                            }}
                            onInput={(e) => {
                              e.target.style.height = "auto"
                              e.target.style.height = `${e.target.scrollHeight}px`
                            }}
                            rows={1}
                            style={{ overflow: "hidden", resize: "none" }}
                          />
                          {question.required && <span className="required-indicator">*</span>}
                        </div>
                      )}
                    </div>
                    {!isPreviewMode && (
                      <div className="drag-handle" draggable={true} onDragStart={() => handleDragStart(question.id)}>
                        <Grip size={18} />
                      </div>
                    )}

                    {isPreviewMode ? (
                      <div className="grid-container">
                      <table className="grid-table">
                        <thead>
                          <tr>
                            <th></th>
                            {question.columns?.map((column, colIndex) => (
                              <th key={colIndex}>
                                {column || `Column ${colIndex + 1}`} {/* Show placeholder for empty columns */}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {question.rows?.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              <td>
                                {row || `Row ${rowIndex + 1}`} {/* Show placeholder for empty rows */}
                              </td>
                              {question.columns?.map((_, colIndex) => (
                                <td key={colIndex}>
                                  <input
                                    type="radio"
                                    name={`grid-${question.id}-row-${rowIndex}`}
                                    checked={question.answers?.[`row_${rowIndex}`] === colIndex}
                                    onChange={() => handleGridAnswerChange(question.id, rowIndex, colIndex)}
                                    style={{
                                      cursor: "pointer",
                                      width: "18px",
                                      height: "18px",
                                      backgroundColor: "white",
                                      appearance: "none",
                                      border:
                                        question.answers?.[`row_${rowIndex}`] === colIndex
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
                    ) : (
                      <div className="grid-editor">
  <div className="grid-section">
    <div className="grid-section-header">Columns</div>
    <div className="grid-items-list">
      {question.columns?.map((column, colIndex) => (
        <div key={colIndex} className="grid-item">
          <input
            type="text"
            className="grid-item-input"
            value={column || ""}
            onChange={(e) => handleColumnTextChange(question.id, colIndex, e.target.value)}
            placeholder={`Column ${colIndex + 1}`} // Placeholder for empty columns
            style={{
              color: column ? "inherit" : "grey", // Grey out empty columns in editor mode
            }}
          />
          {question.columns.length > 1 && (
            <button
              className="delete-grid-item"
              onClick={() => handleDeleteColumn(question.id, colIndex)}
            >
              <X size={14} />
            </button>
          )}
        </div>
      ))}
      <button className="add-option-button" onClick={() => handleAddColumn(question.id)}>
        <Plus size={16} /> Add Column
      </button>
    </div>
  </div>

  <div className="grid-section">
    <div className="grid-section-header">Rows</div>
    <div className="grid-items-list">
      {question.rows?.map((row, rowIndex) => (
        <div key={rowIndex} className="grid-item">
          <input
            type="text"
            className="grid-item-input"
            value={row || ""}
            onChange={(e) => handleRowTextChange(question.id, rowIndex, e.target.value)}
            placeholder={`Row ${rowIndex + 1}`} // Placeholder for empty rows
            style={{
              color: row ? "inherit" : "grey", // Grey out empty rows in editor mode
            }}
          />
          {question.rows.length > 1 && (
            <button
              className="delete-grid-item"
              onClick={() => handleDeleteRow(question.id, rowIndex)}
            >
              <X size={14} />
            </button>
          )}
        </div>
      ))}
      <button className="add-option-button" onClick={() => handleAddRow(question.id)}>
        <Plus size={16} /> Add Row
      </button>
    </div>
  </div>
</div>
                    )}

                    {!isPreviewMode && (
                      <div
                        className={`question-actions-vertical ${selectedQuestionId === question.id ? "visible" : ""}`}
                      >
                        <button
                          className={`icon-button required-badge ${question.required ? "active" : ""}`}
                          onClick={() => {
                            setQuestions(
                              questions.map((q) => (q.id === question.id ? { ...q, required: !q.required } : q)),
                            )
                          }}
                          title={question.required ? "Required" : "Optional"}
                        >
                          <BadgeAlert size={18} />
                        </button>
                        <button
                          className="icon-button"
                          onClick={() => handleDeleteQuestion(question.id)}
                          title="Delete question"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                ) : question.type === "checkbox-grid" ? (
                  // Checkbox Grid Question Type
                  <div className="grid-question checkbox-grid-question">
                    <div className="question-header">
                      <div className="question-icon">
                        <Grid size={18} />
                      </div>
                      {isPreviewMode ? (
                        <div className="question-title-preview">
                          {question.title || "Untitled Question"}
                          {question.required && <span className="required-indicator">*</span>}
                        </div>
                      ) : (
                        <div className="question-title-container">
                          <textarea
                            className="question-title"
                            value={question.title}
                            placeholder="Checkbox grid question"
                            onChange={(e) => {
                              setQuestions(
                                questions.map((q) => (q.id === question.id ? { ...q, title: e.target.value } : q)),
                              )
                            }}
                            onInput={(e) => {
                              e.target.style.height = "auto"
                              e.target.style.height = `${e.target.scrollHeight}px`
                            }}
                            rows={1}
                            style={{ overflow: "hidden", resize: "none" }}
                          />
                          {question.required && <span className="required-indicator">*</span>}
                        </div>
                      )}
                    </div>
                    {!isPreviewMode && (
                      <div className="drag-handle" draggable={true} onDragStart={() => handleDragStart(question.id)}>
                        <Grip size={18} />
                      </div>
                    )}

                    {isPreviewMode ? (
                      <div className="grid-container">
                      <table className="grid-table">
                        <thead>
                          <tr>
                            <th></th>
                            {question.columns?.map((column, colIndex) => (
                              <th key={colIndex}>
                                {column || `Column ${colIndex + 1}`} {/* Show placeholder for empty columns */}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {question.rows?.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                              <td>
                                {row || `Row ${rowIndex + 1}`} {/* Show placeholder for empty rows */}
                              </td>
                              {question.columns?.map((_, colIndex) => (
                                <td key={colIndex}>
                                  <input
                                    type="checkbox"
                                    checked={!!question.answers?.[`row_${rowIndex}_col_${colIndex}`]}
                                    onChange={() => handleCheckboxGridAnswerChange(question.id, rowIndex, colIndex)}
                                    style={{
                                      cursor: "pointer",
                                      width: "18px",
                                      height: "18px",
                                      backgroundColor: "white",
                                      appearance: "none",
                                      border: "1px solid #ccc",
                                      borderRadius: "4px",
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
                    ) : (
                      <div className="grid-editor">
                        <div className="grid-section">
                          <div className="grid-section-header">Columns</div>
                          <div className="grid-items-list">
                            {question.columns?.map((column, colIndex) => (
                              <div key={colIndex} className="grid-item">
                                <input
                                  type="text"
                                  className="grid-item-input"
                                  value={column || ""}
                                  onChange={(e) => handleColumnTextChange(question.id, colIndex, e.target.value)}
                                  placeholder={`Column ${colIndex + 1}`} // Placeholder for empty columns
                                  style={{
                                    color: column ? "inherit" : "grey", // Grey out empty columns in editor mode
                                  }}
                                />
                                {question.columns.length > 1 && (
                                  <button
                                    className="delete-grid-item"
                                    onClick={() => handleDeleteColumn(question.id, colIndex)}
                                  >
                                    <X size={14} />
                                  </button>
                                )}
                              </div>
                            ))}
                            <button className="add-option-button" onClick={() => handleAddColumn(question.id)}>
                              <Plus size={16} /> Add Column
                            </button>
                          </div>
                        </div>

                        <div className="grid-section">
                          <div className="grid-section-header">Rows</div>
                          <div className="grid-items-list">
                            {question.rows?.map((row, rowIndex) => (
                              <div key={rowIndex} className="grid-item">
                                <input
                                  type="text"
                                  className="grid-item-input"
                                  value={row || ""}
                                  onChange={(e) => handleRowTextChange(question.id, rowIndex, e.target.value)}
                                  placeholder={`Row ${rowIndex + 1}`} // Placeholder for empty rows
                                  style={{
                                    color: row ? "inherit" : "grey", // Grey out empty rows in editor mode
                                  }}
                                />
                                {question.rows.length > 1 && (
                                  <button
                                    className="delete-grid-item"
                                    onClick={() => handleDeleteRow(question.id, rowIndex)}
                                  >
                                    <X size={14} />
                                  </button>
                                )}
                              </div>
                            ))}
                            <button className="add-option-button" onClick={() => handleAddRow(question.id)}>
                              <Plus size={16} /> Add Row
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {!isPreviewMode && (
                      <div
                        className={`question-actions-vertical ${selectedQuestionId === question.id ? "visible" : ""}`}
                      >
                        <button
                          className={`icon-button required-badge ${question.required ? "active" : ""}`}
                          onClick={() => {
                            setQuestions(
                              questions.map((q) => (q.id === question.id ? { ...q, required: !q.required } : q)),
                            )
                          }}
                          title={question.required ? "Required" : "Optional"}
                        >
                          <BadgeAlert size={18} />
                        </button>
                        <button
                          className="icon-button"
                          onClick={() => handleDeleteQuestion(question.id)}
                          title="Delete question"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

