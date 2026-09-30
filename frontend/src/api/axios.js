import axios from "axios";

const api = axios.create({
  baseURL:
    "https://car-rental-backend-aiac.onrender.com/api",
});

export default api;