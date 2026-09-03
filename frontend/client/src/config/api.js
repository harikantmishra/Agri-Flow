// Vite exposes only variables prefixed with VITE_ to the browser.
// Override this in .env.local when you want to use a different backend.
const configuredApiUrl = import.meta.env.VITE_API_BASE_URL;

export const API_BASE_URL = (
  configuredApiUrl || "http://localhost:5000/api"
).replace(/\/$/, "");
