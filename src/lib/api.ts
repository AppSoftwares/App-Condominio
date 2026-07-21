import axios from 'axios';
import { supabase } from './supabase';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para inyectar el token de Supabase en cada petición
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export default api;
