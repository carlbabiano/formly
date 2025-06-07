import React from "react"
const AuthLayout = ({ children }) => {
    // These styles are completely isolated and won't affect other components
    const layoutStyle = {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#f8fafc",
      backgroundImage: "linear-gradient(to bottom, #f8fafc, #f1f5f9)",
      zIndex: 1000, // High z-index to ensure it's on top
      overflow: "auto",
    }
  
    return <div style={layoutStyle}>{children}</div>
  }
  
  export default AuthLayout
  