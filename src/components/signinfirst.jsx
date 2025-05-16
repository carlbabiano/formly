import React from "react";
import "./signinfirst.css"; // Add your CSS for styling the popup

export default function Popup({ message, onConfirm }) {
  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <p>{message}</p>
        <button onClick={onConfirm}>Sign In</button>
      </div>
    </div>
  );
}