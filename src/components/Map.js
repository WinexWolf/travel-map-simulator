import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";

const geocodingClient = MapboxGeocoding({
  accessToken: "pk.eyJ1IjoiYW51a3JpdGoiLCJhIjoiY2xmdWsxcTVnMDJ1MzNma3hydXpiZTlrdSJ9.KZj4Cssj0zBohNt0ZXoZfg",
});

mapboxgl.accessToken =
  "pk.eyJ1IjoiYW51a3JpdGoiLCJhIjoiY2xmdWsxcTVnMDJ1MzNma3hydXpiZTlrdSJ9.KZj4Cssj0zBohNt0ZXoZfg";

const Map = ({ legs }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return; // Initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-74.5, 40],
      zoom: 2,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
  }, []);

  useEffect(() => {
    if (!map.current) return;

    const plotRoute = async (departure, arrival) => {
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

        new mapboxgl.Marker().setLngLat(depCoords).addTo(map.current);
        new mapboxgl.Marker().setLngLat(arrCoords).addTo(map.current);
      } catch (error) {
        console.error("Error plotting route: ", error);
      }
    };

    legs.forEach(({ departure, arrival }) => {
      plotRoute(departure, arrival);
    });
  }, [legs]);

  return <div ref={mapContainer} style={{ width: "100vw", height: "100vh" }} />;
};

export default Map;
