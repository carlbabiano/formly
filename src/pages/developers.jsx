import React from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import "./developers.css"

const Developers = () => {
  const navigate = useNavigate()

  const handleGoBack = () => {
    navigate("/formly")
  }

  return (
    <div className="developers-page">
      <div className="developers-container">
        <header className="page-header">
          <div className="back-button" onClick={handleGoBack}>
            <ArrowLeft size={20} />
            <span>Back</span>
          </div>
          <h1 className="page-title">Our Development Team</h1>
        </header>

        <div className="content-section">
          <div className="hero-section">
            <h2 className="section-title">Meet the Developers</h2>
            <p className="hero-text">
              Our talented development team works tirelessly to bring you the best form-building experience. Get to know
              the people behind Formly and their expertise.
            </p>
          </div>

          <div className="team-grid">
            <div className="developer-card">
              <div className="developer-avatar">
                <span className="avatar-initials">CB</span>
              </div>
              <h3 className="developer-name">Carl Jethro Babiano</h3>
              <p className="developer-role">Full Stack Developer</p>
              <p className="developer-description">
                Works across both frontend and backend, seamlessly bridging the gap between design and functionality.
                From crafting smooth user interfaces to building scalable backend systems, ensuring Formly runs
                efficiently from end to end.
              </p>
              <div className="developer-skills">
                <span className="skill-tag">React</span>
                <span className="skill-tag">MySql</span>
                <span className="skill-tag">PHP</span>
                <span className="skill-tag">APIs</span>
              </div>
            </div>

            <div className="developer-card">
              <div className="developer-avatar">
                <span className="avatar-initials">JS</span>
              </div>
              <h3 className="developer-name">John Achilles Sarmiento</h3>
              <p className="developer-role">Frontend Developer</p>
              <p className="developer-description">
                Focuses on building clean, responsive interfaces using modern web technologies. With an eye for detail
                and a user-first mindset, helps make Formly intuitive and visually engaging.
              </p>
              <div className="developer-skills">
                <span className="skill-tag">React</span>
                <span className="skill-tag">CSS</span>
                <span className="skill-tag">Express</span>
                <span className="skill-tag">UI/UX</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Developers
