import React, { useState, useEffect } from "react";
import InputForm from "./components/InputForm";
import Map from "./components/Map";
import Modal from "./components/Modal";
import "./App.css";

const App = () => {
  const [legs, setLegs] = useState([]);
  const [showModal, setShowModal] = useState(true);

  const handleAddLeg = (leg) => {
    setLegs([...legs, leg]);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  useEffect(() => {
    // Automatically open the modal when the component mounts
    setShowModal(true);
  }, []);

  return (
    <div>
      <Modal showModal={showModal} handleClose={handleCloseModal} />
      <InputForm onAddLeg={handleAddLeg} />
      <Map legs={legs} />
    </div>
  );
};

export default App;