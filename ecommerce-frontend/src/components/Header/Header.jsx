import { useNavigate } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { useContext } from 'react';
import './Header.scss';

function Header() {
    const navigate = useNavigate();
    // * Extraemos el carrito de la mochila global
    const { cart } = useContext(CartContext);

    // * Calculamos el total de artículos (sumando las cantidades)
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <header className="neo-header">
            {/* LOGO ESTILO TERMINAL */}
            <div className="logo-container" onClick={() => navigate('/home')}>
                <span className="logo-icon">⚡</span>
                <h1>TECH_STORE<span className="cursor">_</span></h1>
            </div>

            {/* NAVEGACIÓN TIPO DIRECTORIO */}
            <nav className="nav-links">
                <a href="#catalogo">_CATÁLOGO</a>
                <a href="#ofertas">_OFERTAS</a>
                <a href="#soporte">_SOPORTE</a>
            </nav>

            {/* ACCIONES DE USUARIO */}
            <div className="user-actions">
                {/* El botón del carrito ahora es una terminal */}
                <button className="btn-neo-cart" onClick={() => navigate('/cart')}>
                    [ CARRITO {totalItems > 0 && <span className="badge">: {totalItems}</span>} ]
                </button>

                <button className="btn-neo-logout" onClick={handleLogout}>
                    [ SALIR ]
                </button>
            </div>
        </header>
    );
}

export default Header;