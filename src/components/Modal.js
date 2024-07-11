import React from 'react';
import './Modal.css';

const Modal = ({ showModal, handleClose }) => {
  if (!showModal) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={handleClose}>&times;</span>
        <h2>Welcome to the Travel Simulator</h2>
        <p>This app allows you to simulate travel routes using different modes of transportation. Add legs to your journey and visualize them on the map.</p>
        <button onClick={handleClose}>Close</button>
      </div>
    </div>
  );
};

export default Modal;
