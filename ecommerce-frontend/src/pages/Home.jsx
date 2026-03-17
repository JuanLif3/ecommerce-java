import { useState, useEffect, useContext} from "react";
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import api from '../services/api.js';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import './Home.scss';

function Home() {

    // * useNavigate es un gancho que permite empujar al usuario a otra URL
    const navigate = useNavigate();

    // * LOS ESTADOS
    const [products, setProducts] = useState([]); // Array vacío al principio
    const [loading, setLoading] = useState(true); // Para mostrar un "Cargando..."
    const [error, setError] = useState('');
    const { addToCart } = useContext(CartContext); // la función para agregar cosas a la mochila
    const [searchTerm, setSearchTerm] = useState(''); // Estado para el buscador de productos

    // * EL EFECTO SECUNDARIO (Se ejecuta solo al abrir la página)
    useEffect(() => {
        fetchProducts();
    }, []); // ! <-- Ese arreglo vacío [] significa "Ejecuta esto UNA SOLA VEZ"

    // * LA LLAMADA A JAVA
    const fetchProducts = async () => {
        try {
            // ! El cartero (api) ya tiene el Token guardado, así que el guardia lo dejará pasar
            const response = await api.get('/products');

            // ! Guardamos la respuesta de Java en nuestra variable 'products'
            setProducts(response.data);
            setLoading(false); // Apagamos el "Cargando..."
        } catch (err) {
            console.error(err);
            setError('No se pudieron cargar los productos. ¿Tu token es válido?');
            setLoading(false);
        }
    };


    // * Función para cerrar sesión
    const handleLogout = () => {
        localStorage.removeItem('token'); // ! Destruimos la "Pulsera VIP" de la billetera del navegador
        navigate('/login'); // ! Lo pateamos de vuelta a la pantalla de Login
    };

    // * RENDERIZADOS CONDICIONALES (Manejo de UX)
    if (loading) {
        return (
            <div className="neo-loader-screen">
                <div className="loader-terminal">
                    <span className="mono-label">SYS_BOOT_SEQUENCE_INITIATED</span>
                    <h2 className="glitch-text">CARGANDO_NODO...</h2>

                    <div className="progress-bar-container">
                        <div className="progress-bar"></div>
                    </div>

                    <p className="mono-label blink">_estableciendo conexión segura</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="home-container">
                <h2 className="error-text">{error}</h2>
                <button className="btn-logout" onClick={handleLogout}>Volver al Login</button>
            </div>
        );
    }

    // * Filtramos los productos en tiempo real según lo que el usuario escriba
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="neo-home">
            <Header />

            {/* CINTA DESLIZANTE TIPO CIBERPUNK */}
            <div className="marquee-container">
                <div className="marquee-content">
                    <span>/// NUEVO STOCK RECIBIDO /// ENVÍOS CUÁNTICOS EN 24H /// RUPTURA DE PRECIOS /// ÚLTIMA TECNOLOGÍA ///</span>
                    <span>/// NUEVO STOCK RECIBIDO /// ENVÍOS CUÁNTICOS EN 24H /// RUPTURA DE PRECIOS /// ÚLTIMA TECNOLOGÍA ///</span>
                </div>
            </div>

            {/* HERO SECTION BENTO BOX */}
            <section className="bento-hero">
                <div className="bento-main">
                    <h1>EL FUTURO NO<br/><span className="outline-text">ES GENÉRICO.</span></h1>
                    <p>Hardware brutal para mentes excepcionales. Sin compromisos.</p>
                </div>
                <div className="bento-side bento-1">
                    <div className="bento-content">
                        <span className="mono-label">[ 01 ]</span>
                        <h3>LAPTOPS PRO</h3>
                    </div>
                </div>
                <div className="bento-side bento-2">
                    <div className="bento-content">
                        <span className="mono-label">[ 02 ]</span>
                        <h3>COMPONENTES</h3>
                    </div>
                </div>
            </section>

            {/* CATÁLOGO ESTILO WIREFRAME */}
            <main id="catalogo" className="neo-catalog">
                <div className="terminal-header">
                    <div className="status-dot"></div>
                    <h2>INVENTARIO_GLOBAL.exe</h2>

                    <div className="neo-search">
                        <span className="mono-label">&gt; buscar:</span>
                        <input
                            type="text"
                            placeholder="_escribe_aqui"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="brutal-grid">
                    {filteredProducts.length === 0 ? (
                        <div className="error-box">404: ENTIDAD NO ENCONTRADA</div>
                    ) : (
                        filteredProducts.map((product) => (
                            <div key={product.id} className="brutal-card">
                                <div className="card-wireframe">
                                    <div className="card-top-bar">
                                        <span className="mono-label">ID:{product.id.toString().padStart(4, '0')}</span>
                                        <span className="mono-label">{product.stock > 0 ? 'ONLINE' : 'OFFLINE'}</span>
                                    </div>

                                    <div className="card-image-box">
                                        <span className="emoji-huge">💻</span>
                                    </div>

                                    <div className="card-data">
                                        <h3 className="product-title">{product.name.toUpperCase()}</h3>
                                        <p className="product-desc">{product.description}</p>

                                        <div className="brutal-action">
                                            <div className="price-tag">
                                                <span className="currency">$</span>
                                                <span className="amount">{product.price}</span>
                                            </div>
                                            <button className="btn-brutal" onClick={() => addToCart(product)}>
                                                [ EXTRAER ]
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default Home;
