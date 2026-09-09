// Vite exposes only variables prefixed with VITE_ to the browser.
// Override this in .env.local or in the deployment's environment settings.
const configuredApiUrl = import.meta.env.VITE_API_BASE_URL;
const defaultApiUrl = import.meta.env.PROD
  ? "https://agri-flow.onrender.com/api"
  : "http://localhost:5000/api";

export const API_BASE_URL = (
  configuredApiUrl || defaultApiUrl
).replace(/\/$/, "");

console.log(API_BASE_URL);
