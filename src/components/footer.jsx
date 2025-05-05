import React from "react"
import "./footer.css"

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-links">
          {/* Temporarily replaced Link components with spans */}
          <span className="footer-link">About Us</span>
          <span>•</span>
          <span className="footer-link">Careers</span>
          <span>•</span>
          <span className="footer-link">Developers</span>
          <span>•</span>
          <span className="footer-link">Privacy Notice</span>
          <span>•</span>
          <span className="footer-link">Help</span>
        </div>
        {/* Removed footer logo section */}
      </div>
    </footer>
  )
}

export default Footer
