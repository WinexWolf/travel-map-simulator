import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";
import { saveAs } from "file-saver";
import RecordRTC from "recordrtc";
import axios from "axios";
import "./Map.css"; // Import the CSS file
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faVideo,
  faStop,
  faShare,
} from "@fortawesome/free-solid-svg-icons";

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
  const [recordingBlob, setRecordingBlob] = useState(null);

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
        .forwardGeocode({ query: departure, limit: 1 })
        .send()
        .then((response) => {
          const departureCoords =
            response.body.features[0].geometry.coordinates;

          geocodingClient
            .forwardGeocode({ query: arrival, limit: 1 })
            .send()
            .then((response) => {
              const arrivalCoords =
                response.body.features[0].geometry.coordinates;

              map.current.flyTo({
                center: arrivalCoords,
                zoom: 10,
                speed: 0.5,
                curve: 2,
                easing: (t) => t,
              });

              currentIndex += 1;

              setTimeout(animateLeg, 3000); // Wait for 3 seconds before animating to the next leg
            });
        });
    };

    animateLeg();
  };

  const startRecording = () => {
    if (isAnimating) return; // Prevent starting recording during animation

    const resetAndRecord = () => {
      map.current.flyTo({
        center: [-74.5, 40],
        zoom: 2,
        speed: 0.5,
        curve: 1,
        easing: (t) => t,
      });

      const canvas = canvasRef.current;
      const stream = canvas.captureStream();
      const recorder = new RecordRTC(stream, { type: "video" });
      recorder.startRecording();
      setRecording(recorder);

      // Start the animation after resetting
      setTimeout(startAnimation, 2000); // Adding a delay to ensure map reset is complete
    };

    resetAndRecord();
  };

  const stopRecording = () => {
    if (recording) {
      recording.stopRecording(() => {
        const blob = recording.getBlob();
        setRecordingBlob(blob);
        saveAs(blob, "map-animation.mp4");
        setRecording(null);
      });
    }
  };

  const uploadVideo = async (blob) => {
    const formData = new FormData();
    formData.append("file", blob, "map-animation.mp4");

    try {
      const response = await axios.post("YOUR_UPLOAD_URL", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.url; // Assume the server returns the URL of the uploaded file
    } catch (error) {
      console.error("Error uploading video: ", error);
    }
  };

  const shareVideo = async () => {
    if (!recordingBlob) return;

    const url = await uploadVideo(recordingBlob);

    if (navigator.share) {
      navigator
        .share({
          title: "Map Animation",
          text: "Check out this map animation!",
          url,
        })
        .then(() => console.log("Video shared successfully"))
        .catch((error) => console.error("Error sharing video:", error));
    } else {
      // Fallback for browsers that do not support Web Share API
      alert(`Share this link: ${url}`);
    }
  };

  return (
    <div className="map-container">
      <div ref={mapContainer} className="map" />
      <canvas
        ref={canvasRef}
        className="hidden-canvas"
        width="auto"
        height="auto"
      />
      <button
        onClick={startAnimation}
        className="control-button"
        title="Play Animation"
      >
        <FontAwesomeIcon icon={faPlay} />
      </button>
      <button
        onClick={startRecording}
        className="control-button"
        title="Start Recording"
      >
        <FontAwesomeIcon icon={faVideo} />
      </button>
      <button
        onClick={stopRecording}
        className="control-button"
        title="Stop Recording"
      >
        <FontAwesomeIcon icon={faStop} />
      </button>
      <button
        onClick={shareVideo}
        className="control-button"
        title="Share Video"
      >
        <FontAwesomeIcon icon={faShare} />
      </button>
    </div>
  );
};

export default Map;
