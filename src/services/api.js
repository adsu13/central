import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080", // ou sua URL em produção
});

// Interceptor que adiciona o token automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
