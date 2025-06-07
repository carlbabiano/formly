import React from "react"
import { useNavigate } from "react-router-dom"
import { Shirt, PartyPopper, UserRound, Building, Calendar, Gift, CreditCard, Clipboard, ArrowLeft } from "lucide-react"
import "./template-selection.css"
import Footer from "../components/footer"

const TemplateSelection = () => {
  const navigate = useNavigate()

  // Template data with categories and templates
  const templateCategories = [
    {
      id: "personal",
      name: "Personal",
      templates: [
        {
          id: "tshirt-signup",
          name: "T-Shirt Sign Up",
          description: "Collect sizes and preferences for t-shirt orders",
          icon: <Shirt size={24} />,
          iconColor: "blue",
        },
        {
          id: "contact-info",
          name: "Contact Information",
          description: "Collect contact details and preferences",
          icon: <UserRound size={24} />,
          iconColor: "green",
        },
      ],
    },
    {
      id: "events",
      name: "Events",
      templates: [
        {
          id: "party-invite",
          name: "Party Invitation",
          description: "Create invitations for birthday parties and gatherings",
          icon: <PartyPopper size={24} />,
          iconColor: "pink",
        },
        {
          id: "wedding-rsvp",
          name: "Wedding Invitation",
          description: "Collect responses for wedding invitations",
          icon: <Gift size={24} />,
          iconColor: "red",
        },
        {
          id: "event-feedback",
          name: "Event Feedback",
          description: "Gather feedback after hosting an event",
          icon: <Clipboard size={24} />,
          iconColor: "orange",
        },
      ],
    },
    {
      id: "business",
      name: "Business",
      templates: [
        {
          id: "customer-feedback",
          name: "Customer Feedback",
          description: "Collect feedback about your products or services",
          icon: <Building size={24} />,
          iconColor: "teal",
        },
        {
          id: "order-form",
          name: "Order Form",
          description: "Take orders for your products or services",
          icon: <CreditCard size={24} />,
          iconColor: "indigo",
        },
      ],
    },
  ]

  // Function to handle template selection
  const handleSelectTemplate = (templateId) => {
    // In a real implementation, you would load the selected template data
    // and pass it to the builder page
    navigate("/builderpage", { state: { templateId } })
  }

  // Function to go back to the main page
  const handleGoBack = () => {
    navigate("/formly")
  }

  return (
    <div className="formly template-selection">
      {/* Main Content */}
      <main className="main-content">
        <div className="back-button" onClick={handleGoBack}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </div>

        <h1 className="templates-main-title">Choose a Template</h1>

        {templateCategories.map((category) => (
          <div key={category.id} className="template-category">
            <h2 className="category-title">{category.name}</h2>
            <div className="templates-grid">
              {category.templates.map((template) => (
                <div key={template.id} className="template-card" onClick={() => handleSelectTemplate(template.id)}>
                  <div className={`template-icon ${template.iconColor}`}>{template.icon}</div>
                  <h3 className="template-title">{template.name}</h3>
                  <p className="template-description">{template.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>
    </div>
  )
}

export default TemplateSelection
