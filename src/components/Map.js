import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";
import { saveAs } from "file-saver";
import RecordRTC from "recordrtc";

const geocodingClient = MapboxGeocoding({
  accessToken: process.env.REACT_APP_MAPBOX_ACCESS_TOKEN,
});

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

const transportIcons = {
  driving: "car",
  walking: "walk",
  cycling: "bicycle",
  flying: "plane",
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

    // Animation logic here...
    // For the sake of simplicity, this example doesn't include full animation logic.
    // You can use map.flyTo, map.easeTo, and other mapbox-gl-js methods to animate the map.

    setTimeout(() => {
      setIsAnimating(false);
    }, 5000); // Example duration
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
    <div style={{ position: "relative" }}>
      <div ref={mapContainer} style={{ width: "100vw", height: "100vh" }} />
      <canvas
        ref={canvasRef}
        style={{ display: "none" }}
        width="1920"
        height="1080"
      />
      <button
        onClick={startAnimation}
        style={{ position: "absolute", top: 10, left: 10, zIndex: 1 }}
      >
        Play Animation
      </button>
      <button
        onClick={startRecording}
        style={{ position: "absolute", top: 50, left: 10, zIndex: 1 }}
      >
        Start Recording
      </button>
      <button
        onClick={stopRecording}
        style={{ position: "absolute", top: 90, left: 10, zIndex: 1 }}
      >
        Stop Recording
      </button>
    </div>
  );
};

export default Map;
