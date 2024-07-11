import React from "react";
import "./Modal.css"; // Add the CSS for the modal here

const Modal = ({ showModal, handleClose }) => {
  if (!showModal) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Travel Simulation Info</h2>
        <p>
          Welcome to the travel simulation app! You can plan and visualize your
          journey using various modes of transport such as flight, train, and
          car. Enter your departure and arrival cities, select your mode of
          transport, and see your route plotted on the map.
        </p>
        <button onClick={handleClose}>Close</button>
      </div>
    </div>
  );
};

export default Modal;
