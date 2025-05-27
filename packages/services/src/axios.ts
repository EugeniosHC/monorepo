// lib/api.ts
import axios from "axios";

// Defina o endpoint da API aqui
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  validateStatus: (status) => {
    return status < 500;
  },
  timeout: 10000,
});

export default api;
