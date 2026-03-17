import axios from 'axios';

const api = axios.create({

    // * Esta es la URL base del servidor Java.
    baseURL: 'http://localhost:8080/api/v1'
})


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