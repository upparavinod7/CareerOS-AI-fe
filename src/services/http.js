import axios from "axios";

// Resolve API base URL, safely defaulting to port 5000 if not configured or if legacy port 5001 was specified
const envBase = import.meta.env.VITE_API_BASE_URL;
const baseURL =
  envBase && !envBase.includes("5001")
    ? envBase
    : "http://localhost:5000/api/v1";

const http = axios.create({
  baseURL,
  timeout: 20000,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("careeros_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // If unauthorized and not already on login/register page
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login") &&
        !window.location.pathname.includes("/register")
      ) {
        localStorage.removeItem("careeros_token");
        localStorage.removeItem("careeros_user");
      }
    }
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "An unexpected error occurred";
    return Promise.reject(new Error(message));
  }
);

export default http;

