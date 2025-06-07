
import React from "react"
import { Link } from "react-router-dom"
import { FileText, BarChart3, Shield } from "lucide-react"
import "./landing-page.css"

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">Create Beautiful Forms & Surveys in Minutes</h1>
            <p className="hero-description">
              Build professional forms and surveys with our intuitive drag-and-drop builder. Collect responses, analyze
              data, and make informed decisions faster than ever.
            </p>
            <div className="hero-buttons">
              <Link to="/register" className="primary-button">
                Get Started
              </Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card">
              <div className="hero-card-header">
                <div className="hero-card-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
              <div className="hero-card-content">
                <div className="form-preview">
                  <div className="form-field">
                    <div className="field-label"></div>
                    <div className="field-input"></div>
                  </div>
                  <div className="form-field">
                    <div className="field-label"></div>
                    <div className="field-options">
                      <div className="option"></div>
                      <div className="option"></div>
                      <div className="option"></div>
                    </div>
                  </div>
                  <div className="form-button"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="features-container">
          <div className="section-header">
            <h2 className="section-title">Everything you need to create amazing forms</h2>
            <p className="section-description">
              Powerful features designed to help you build, share, and analyze forms with ease.
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <div className="icon-placeholder blue">
                  <FileText size={24} />
                </div>
              </div>
              <h3 className="feature-title">Drag & Drop Builder</h3>
              <p className="feature-description">
                Create forms effortlessly with our intuitive drag-and-drop interface. No coding required.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <div className="icon-placeholder purple">
                  <BarChart3 size={24} />
                </div>
              </div>
              <h3 className="feature-title">Advanced Analytics</h3>
              <p className="feature-description">
                Get detailed insights into your form performance with comprehensive analytics and reporting.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <div className="icon-placeholder orange">
                  <Shield size={24} />
                </div>
              </div>
              <h3 className="feature-title">Secure & Reliable</h3>
              <p className="feature-description">
                Your data is protected with enterprise-grade security. GDPR compliant and SOC 2 certified.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-nav">
              <Link to="/about-us" className="footer-nav-link">
                About Us
              </Link>
              <Link to="/developers" className="footer-nav-link">
                Developers
              </Link>
              <Link to="/contact-us" className="footer-nav-link">
                Contact Us
              </Link>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="footer-copyright">© 2024 Formly. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
