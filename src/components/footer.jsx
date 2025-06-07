import React from "react"
import { Link } from "react-router-dom"
import "./footer.css"

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-links">
          <Link to="/about-us" className="footer-link">
            About Us
          </Link>
          <span>•</span>
          <Link to="/developers" className="footer-link">
            Developers
          </Link>
          <span>•</span>
          <Link to="/contact-us" className="footer-link">
            Contact Us
          </Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer
