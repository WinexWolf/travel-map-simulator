import React, { useState } from "react";

const InputForm = ({ onAddLeg }) => {
  const [departure, setDeparture] = useState("");
  const [arrival, setArrival] = useState("");
  const [transport, setTransport] = useState("flight");
  const [cities, setCities] = useState([]); // State to store fetched cities

  // Function to fetch cities based on search term (use your chosen API)
  const fetchCities = async (searchTerm) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchTerm
        )}.json?access_token=pk.eyJ1IjoiYW51a3JpdGoiLCJhIjoiY2xmdWsxcTVnMDJ1MzNma3hydXpiZTlrdSJ9.KZj4Cssj0zBohNt0ZXoZfg`
      );
      const data = await response.json();
      const cities = data.features.map((feature) => ({
        name: feature.place_name,
        coordinates: feature.geometry.coordinates,
      }));
      setCities(cities);
    } catch (error) {
      console.error("Error fetching cities: ", error);
      setCities([]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddLeg({ departure, arrival, transport });
    setDeparture("");
    setArrival("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Departure City"
        value={departure}
        onChange={(e) => {
          setDeparture(e.target.value);
          fetchCities(e.target.value); // Fetch cities on input change
        }}
        required
        list="departure-cities" // Add a list attribute for autocomplete
      />
      <datalist id="departure-cities">
        {cities.map((city) => (
          <option key={city.name} value={city.name}>
            {city.name}
          </option>
        ))}
      </datalist>
      {/* Similar implementation for arrival city with another datalist */}
      <input
        type="text"
        placeholder="Arrival City"
        value={arrival}
        onChange={(e) => {
          setArrival(e.target.value);
          fetchCities(e.target.value); // Fetch cities on input change
        }}
        required
        list="arrival-cities" // Add a list attribute for autocomplete
      />
      <datalist id="arrival-cities">
        {cities.map((city) => (
          <option key={city.name} value={city.name}>
            {city.name}
          </option>
        ))}
      </datalist>
      <select value={transport} onChange={(e) => setTransport(e.target.value)}>
        <option value="flight">Flight</option>
        <option value="train">Train</option>
        <option value="car">Car</option>
      </select>
      <button type="submit">Add Leg</button>
    </form>
  );
};

export default InputForm;
