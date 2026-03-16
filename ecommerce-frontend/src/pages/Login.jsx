import { useState } from 'react';
import api from '../services/api'; // Nuestro cartero configurado con Axios
import './Login.scss';
import {defaultAllowedOrigins} from "vite"; // Importamos su "Traje" (Estilos)

function Login() {

    // * EL ESTADO (La memoria del componente)
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMensaje, setErrorMensaje] = useState('');

    // * LA LOGICA (Lo que pasa al hacer clic en "Entrar")
    const handleSubmit = async (e)  => {
        e.preventDefault(); // ! Evita que la página recargue (comportamiento por defecto de HTML)
        setErrorMensaje('') // ! Limpiamos errores anteriores

        try {
            // ! Le decimos al cartero que haga un POST al backend
            const response = await api.post('auth/login', {
                email: email,
                password: password
            });

            // ! Si java responde 200 OK, sacamos el token de la respuesta
            const token = response.data.token;

            // ! Guardamos la pulsera VIP en el navegador (localStorage)
            localStorage.setItem('token', token);

            alert('Login exitoso');
        } catch (error) {
            setErrorMensaje('Credenciales incorrectas');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>Iniciar sesion</h2>

                <form className="login-form" onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label>Email</label>
                        <input
                        type="email"
                        placeholder="correo@ejemplo.com"
                        value={email}
                            // Guarda esa letra en nuestra variable 'email'.
                            // onChange se dispara cada vez que tecleas una letra.
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        />
                    </div>

                    <div className="form-group">
                        <label>Contraseña</label>
                        <input
                        type="password"
                        placeholder="*********"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        />
                    </div>

                    <button type="submit" className="btn-primary">Entrar</button>
                </form>
            </div>
        </div>
    );
}

export default Login;