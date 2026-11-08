import axios from "axios";

/**
 * Central axios instance for all API calls.
 *
 * baseURL points to /api which Vite proxies to http://localhost:5001
 * (see vite.config.js).  This way we never hard-code the backend URL
 * in component code — swapping it for production is a one-line change
 * in the proxy config.
 *
 * withCredentials: true  →  the browser sends the httpOnly JWT cookie
 * automatically on every request.
 */
const api = axios.create({
    baseURL: "/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    config.headers.set("X-Timezone-Offset", String(-new Date().getTimezoneOffset()));
    return config;
});

export default api;
