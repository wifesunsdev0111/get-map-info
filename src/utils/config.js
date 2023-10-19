export const REACT_APP_BASE_URL =
  process.env.NODE_ENV !== "development" ? "" : "http://localhost:7000";
export const GET_BY_CID_AND_ID_URL =
  "https://maps.googleapis.com/maps/api/place/details/json";
export const GET_BY_PLACE_FINDER_URL =
  "https://maps.googleapis.com/maps/api/place/findplacefromtext/json";
