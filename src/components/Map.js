import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";
import { saveAs } from "file-saver";
import RecordRTC from "recordrtc";
import "./Map.css"; // Import the CSS file

const geocodingClient = MapboxGeocoding({
  accessToken: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN,
});

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const transportIcons = {
  driving: "car",
  walking: "walk",
  cycling: "bicycle",
  flight: "flight",
};

const Map = ({ legs }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const canvasRef = useRef(null);
  const [recording, setRecording] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (map.current) return; // Initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-74.5, 40],
      zoom: 2,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.current.on("render", () => {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(mapContainer.current.querySelector("canvas"), 0, 0);
    });
  }, []);

  useEffect(() => {
    if (!map.current) return;

    const plotRoute = async (departure, arrival, mode) => {
      try {
        const [departureCoords, arrivalCoords] = await Promise.all([
          geocodingClient.forwardGeocode({ query: departure, limit: 1 }).send(),
          geocodingClient.forwardGeocode({ query: arrival, limit: 1 }).send(),
        ]);

        const depCoords = departureCoords.body.features[0].geometry.coordinates;
        const arrCoords = arrivalCoords.body.features[0].geometry.coordinates;

        const route = {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [depCoords, arrCoords],
          },
        };

        map.current.addSource(`${departure}-${arrival}`, {
          type: "geojson",
          data: route,
        });

        map.current.addLayer({
          id: `${departure}-${arrival}`,
          type: "line",
          source: `${departure}-${arrival}`,
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": "red",
            "line-width": 6,
          },
        });

        new mapboxgl.Marker({
          element: createIconElement(mode),
        })
          .setLngLat(depCoords)
          .addTo(map.current);

        new mapboxgl.Marker({
          element: createIconElement(mode),
        })
          .setLngLat(arrCoords)
          .addTo(map.current);
      } catch (error) {
        console.error("Error plotting route: ", error);
      }
    };

    legs.forEach(({ departure, arrival, mode }) => {
      plotRoute(departure, arrival, mode);
    });
  }, [legs]);

  const createIconElement = (mode) => {
    const icon = document.createElement("div");
    icon.className = `transport-icon ${transportIcons[mode]}`;
    return icon;
  };

  const startAnimation = () => {
    if (isAnimating) return;
    setIsAnimating(true);

    let currentIndex = 0;

    const animateLeg = () => {
      if (currentIndex >= legs.length) {
        setIsAnimating(false);
        return;
      }

      const { departure, arrival } = legs[currentIndex];

      geocodingClient
        .forwardGeocode({ query: arrival, limit: 1 })
        .send()
        .then((response) => {
          const arrivalCoords = response.body.features[0].geometry.coordinates;

          map.current.flyTo({
            center: arrivalCoords,
            zoom: 12,
            speed: 0.5,
            curve: 2,
            easing: (t) => t,
          });

          currentIndex += 1;

          setTimeout(animateLeg, 3000); // Wait for 3 seconds before animating to the next leg
        });
    };

    animateLeg();
  };

  const startRecording = () => {
    const canvas = canvasRef.current;
    const stream = canvas.captureStream();
    const recorder = new RecordRTC(stream, { type: "video" });
    recorder.startRecording();
    setRecording(recorder);
  };

  const stopRecording = () => {
    if (recording) {
      recording.stopRecording(() => {
        const blob = recording.getBlob();
        saveAs(blob, "map-animation.mp4");
        setRecording(null);
      });
    }
  };

  return (
    <div className="map-container">
      <div ref={mapContainer} className="map" />
      <canvas
        ref={canvasRef}
        className="hidden-canvas"
        width="1920"
        height="1080"
      />
      <button onClick={startAnimation} className="control-button">
        Play Animation
      </button>
      <button onClick={startRecording} className="control-button">
        Start Recording
      </button>
      <button onClick={stopRecording} className="control-button">
        Stop Recording
      </button>
    </div>
  );
};

export default Map;
