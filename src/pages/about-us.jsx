import React from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import "./about-us.css"

const AboutUs = () => {
  const navigate = useNavigate()

  const handleGoBack = () => {
    navigate("/formly")
  }

  return (
    <div className="about-us-page">
      <div className="about-us-container">
        <header className="page-header">
          <div className="back-button" onClick={handleGoBack}>
            <ArrowLeft size={20} />
            <span>Back</span>
          </div>
          <h1 className="page-title">About Us</h1>
          <p className="about-text"></p>
        </header>

        <div className="content-section">
          <div className="hero-section">
            <h2 className="section-title">Our Mission</h2>
            <p className="hero-text">
              At Formly, our mission is to make form creation effortless, elegant, and effective. Whether you're
              gathering feedback, conducting surveys, or collecting data, we empower you to build beautiful, powerful
              forms—no coding, no clutter.
            </p>
          </div>

          <div className="info-grid">
            <div className="info-card">
              <h3 className="card-title">Why Formly?</h3>
              <p className="card-text">
                Most form builders are either too simple to scale or too complex to enjoy. Formly strikes the perfect
                balance. We offer a clean, intuitive interface backed by smart features, so anyone—from casual users to
                professionals—can create forms that work beautifully and perform reliably.
              </p>
            </div>

            <div className="info-card">
              <h3 className="card-title">Our Values</h3>
              <ul className="values-list">
                <li>Simplicity in design and functionality</li>
                <li>User-focused development</li>
                <li>Continuous innovation</li>
                <li>Data privacy and security</li>
              </ul>
            </div>

            <div className="info-card">
              <h3 className="card-title">Our Team</h3>
              <p className="card-text">
                We are a passionate team of developers, designers, and product managers committed to building the best
                form creation experience possible. Our diverse backgrounds bring unique perspectives to every feature we
                build.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutUs
