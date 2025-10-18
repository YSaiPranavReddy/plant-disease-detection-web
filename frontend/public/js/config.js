// Detect environment
const isDev =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "";

// Export API URLs
export const API_CONFIG = {
  NODE_API: isDev
    ? "http://localhost:3000/api"
    : "https://plant-disease-detection-web.onrender.com",
  FLASK_API: isDev
    ? "http://localhost:5000"
    : "https://plant-disease-detection-web-flask.onrender.com",
};

console.log("🌿 Bloom Config loaded");
console.log("Environment:", isDev ? "Development" : "Production");
console.log("API URL:", API_CONFIG.NODE_API);
