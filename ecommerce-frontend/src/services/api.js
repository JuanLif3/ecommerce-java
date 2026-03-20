import axios from 'axios';

// 1. Detectamos si estamos en local o en producción
const isDevelopment = window.location.hostname === 'localhost';

// 2. Definimos la URL por defecto (Asegurando el HTTPS para Railway)
const defaultURL = isDevelopment
    ? 'http://localhost:8080/api/v1'
    : 'https://ecommerce-java-production.up.railway.app/api/v1';

// 3. MAGIA: Intentamos leer la variable de Vercel primero.
// Si no existe, usamos la URL por defecto que definimos arriba.
const baseURL = import.meta.env.VITE_API_URL || defaultURL;

const api = axios.create({
    baseURL: baseURL,
});

// El Interceptor de Peticiones
// Esto intercepta TODAS las peticiones antes de que salgan hacia Java y les "pega"
// automáticamente la Pulsera VIP (el Token JWT) si es que existe.
api.interceptors.request.use((config) => {
    // Buscamos el token en la memoria del navegador
    const token = localStorage.getItem('token');

    // Si hay token, lo agregamos en la cabecera tal cual como se hacía en Postman
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;