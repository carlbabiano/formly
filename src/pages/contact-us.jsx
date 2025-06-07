import React from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import "./contact-us.css"

const ContactUs = () => {
  const navigate = useNavigate()

  const handleGoBack = () => {
    navigate("/formly")
  }

  return (
    <div className="contact-page">
      <div className="contact-container">
        <header className="page-header">
          <div className="back-button" onClick={handleGoBack}>
            <ArrowLeft size={20} />
            <span>Back</span>
          </div>
          <h1 className="page-title">Contact Us</h1>
        </header>

        <div className="content-section">
          <div className="hero-section">
            <h2 className="section-title">Get in Touch</h2>
            <p className="hero-text">
              Have questions, feedback, or need support? We'd love to hear from you. Reach out to us using any of the
              methods below.
            </p>
          </div>

          <div className="contact-info-grid">
            <div className="contact-method">
              <div className="method-icon">
                <span className="icon-placeholder email-icon">@</span>
              </div>
              <h3 className="method-title">Email</h3>
              <p className="method-description">Send us an email for any inquiries</p>
              <a href="" className="contact-link">
                officialformly@gmail.com
              </a>
            </div>

            <div className="contact-method">
              <div className="method-icon">
                <span className="icon-placeholder phone-icon">📞</span>
              </div>
              <h3 className="method-title">Phone</h3>
              <p className="method-description">Call us</p>
              <a href="" className="contact-link">
                09628588782
              </a>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactUs
