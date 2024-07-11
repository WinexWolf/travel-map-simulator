import MapboxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";

const geocodingClient = MapboxGeocoding({
  accessToken:
process.env.REACT_APP_MAPBOX_ACCESS_TOKEN});

export default geocodingClient;
