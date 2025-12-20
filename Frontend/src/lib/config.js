const DEFAULT_API_URL = import.meta.env.PROD ? "https://orders-9ov7.onrender.com" : "http://localhost:4000";

export const API_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/+$/, "");
