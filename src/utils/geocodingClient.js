import MapboxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";

const geocodingClient = MapboxGeocoding({
  accessToken:
    "pk.eyJ1IjoiYW51a3JpdGoiLCJhIjoiY2xmdWsxcTVnMDJ1MzNma3hydXpiZTlrdSJ9.KZj4Cssj0zBohNt0ZXoZfg",
});

export default geocodingClient;
