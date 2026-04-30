import axios from 'axios';

// The backend URL is set via VITE_API_URL environment variable.
// On Netlify, set this to: https://reta-aspis.onrender.com
// Locally, falls back to localhost:5000
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 30000, // 30s timeout to handle Render cold starts
});

export default api;
