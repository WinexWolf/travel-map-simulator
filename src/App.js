import React, { useState } from "react";
import InputForm from "./components/InputForm";
import Map from "./components/Map";
import "./App.css";

const App = () => {
  const [legs, setLegs] = useState([]);

  const addLeg = (leg) => {
    setLegs([...legs, leg]);
  };

  return (
    <div className="App">
{/*       <h1>Travel Map Simulator</h1>
 */}      <InputForm onAddLeg={addLeg} />
      <Map legs={legs} />
    </div>
  );
};

export default App;
