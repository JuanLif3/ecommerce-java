import axios from 'axios';

// Detectamos si estamos corriendo en la computadora local
const isDevelopment = window.location.hostname === 'localhost';

// Asignamos la URL automáticamente según el entorno
const baseURL = isDevelopment
    ? 'http://localhost:8080/api/v1'
    : 'http://ecommerce-java-production.up.railway.app/api/v1';

const api = axios.create({
    baseURL: baseURL,
});

// El Interceptor de Peticiones
// Esto intercepta TODAS las peticiones antes de que salgan hacia Java y les "pega"
// automáticamente la Pulsera VIP (el Token JWT) si es que existe.
api.interceptors.request.use((config) => {

    // Buscamos el token en la memoria del navegador
    const token = localStorage.getItem('token');

    // Si hay token, lo agregamos en la cabecera tal cual como se hacia en Postman
    if(token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;