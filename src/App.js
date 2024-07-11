import React, { useState, useEffect } from "react";
import InputForm from "./components/InputForm";
import Map from "./components/Map";
import Modal from "./components/Modal";
import FeedbackForm from "./components/FeedbackForm";
import "./App.css";

const App = () => {
  const [legs, setLegs] = useState([]);
  const [showModal, setShowModal] = useState(true);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false); // Initially false

  const closeFeedback = () => {
    setIsFeedbackOpen(false);
  };

  const handleAddLeg = (leg) => {
    setLegs([...legs, leg]);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  useEffect(() => {
    // Automatically open the modal when the component mounts
    setShowModal(true);

    // Set a timeout to open the feedback form after 1 minute (60000 ms)
    const feedbackTimer = setTimeout(() => {
      setIsFeedbackOpen(true);
    }, 260000);

    // Clear the timeout if the component is unmounted to prevent memory leaks
    return () => clearTimeout(feedbackTimer);
  }, []);

  return (
    <div>
      <Modal showModal={showModal} handleClose={handleCloseModal} />
      <InputForm onAddLeg={handleAddLeg} />
      <Map legs={legs} />
      <button onClick={() => setIsFeedbackOpen(true)}>Give Feedback</button>
      {isFeedbackOpen && <FeedbackForm onClose={closeFeedback} />}
    </div>
  );
};

export default App;
