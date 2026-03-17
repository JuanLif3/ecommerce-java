import axios from 'axios';

const baseURL = 'http://techstore-backend.us-east-2.elasticbeanstalk.com/api/v1';

const api = axios.create({
    baseURL: baseURL,
});

    // * El Interceptor de Peticiones.
    // * Esto intercepta TODAS las peticiones antes de que salgan hacia Java y les "pega" automáticamente la Pulsera VIP (el Token JWT) si es que existe.
    api.interceptors.request.use((config) => {

        // * Buscamos el token en la memoria del navegador
        const token = localStorage.getItem('token');

        // * Si hay token, lo agregamos en la cabecera tal cual como se hacia en Postman
        if(token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

export default api;