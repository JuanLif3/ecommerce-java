import { useState } from 'react';
import api from '../services/api'; // Nuestro cartero configurado con Axios
import { useNavigate } from 'react-router-dom';
import './Login.scss';
import { toast } from 'react-toastify';

function Login() {

    // * EL ESTADO (La memoria del componente)
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMensaje, setErrorMensaje] = useState('');

    // * LA LOGICA (Lo que pasa al hacer clic en "Entrar")
    const handleSubmit = async (e)  => {
        e.preventDefault(); // ! Evita que la página recargue (comportamiento por defecto de HTML)
        setErrorMensaje('') // ! Limpiamos errores anteriores

        try {
            const response = await api.post('/auth/login', {
                email: email,
                password: password
            });

            // ¡NUEVO! Vamos a espiar qué nos mandó Java
            console.log("/// DATOS DEL SERVIDOR: ", response.data);

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('role', response.data.role);

            // Bifurcación de caminos según el rol
            if (response.data.role === 'ROLE_ADMIN') {
                toast.success('// OVERRIDE_ADMINISTRADOR_ACEPTADO');
                navigate('/admin');
            } else {
                toast.success('// ACCESO_CONCEDIDO: Bienvenido a la red.');
                navigate('/home');
            }

        } catch (error) {
            toast.error('Acceso denegado. Credenciales incorrectasn');
        }
    };

    return (
        <div className="neo-login-container">
            <div className="neo-login-card">
                <div className="login-header">
                    <span className="mono-label">SYS_LOGIN v2.0</span>
                    <div className="status-dot"></div>
                </div>

                <h2>IDENTIFICACIÓN<span className="cursor">_</span></h2>

                <form className="neo-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>_USUARIO</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="user@system.com"
                        />
                    </div>

                    <div className="input-group">
                        <label>_CLAVE_DE_ACCESO</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="******"
                        />
                    </div>

                    <button type="submit" className="btn-neo-submit">
                        [ INICIAR_SESIÓN ]
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;