import React, { useState } from "react";

const FeedbackForm = ({ onClose }) => {
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Feedback submitted:", { rating, comments });
    // Handle the feedback submission, e.g., send to a server
    onClose();
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>
          &times;
        </span>
        <h2>Give Feedback</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Rating:
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
            >
              <option value="0">Select a rating</option>
              <option value="1">1 - Very Poor</option>
              <option value="2">2 - Poor</option>
              <option value="3">3 - Average</option>
              <option value="4">4 - Good</option>
              <option value="5">5 - Excellent</option>
            </select>
          </label>
          <label>
            Comments:
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </label>
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm;
