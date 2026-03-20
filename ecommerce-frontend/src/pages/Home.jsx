import { useState, useEffect, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import api from '../services/api.js';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import './Home.scss';

function Home() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { addToCart } = useContext(CartContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null); // Producto para el modal
    const [currentImageIndex, setCurrentImageIndex] = useState(0); // Índice del carrusel

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        let interval;
        if (selectedProduct && selectedProduct.imageUrls && selectedProduct.imageUrls.length > 1) {
            interval = setInterval(() => {
                setCurrentImageIndex(prev => (prev + 1) % selectedProduct.imageUrls.length);
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [selectedProduct]);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data);
            setLoading(false);
        } catch (err) {
            setError('No se pudieron cargar los productos. ¿Tu token es válido?');
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

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
            <section className="bento-hero scanlines">
                <div className="bento-main">
                    <h1 className="glitch-title" data-text="EL FUTURO NO">EL FUTURO NO<br /><span className="outline-text">ES GENÉRICO.</span></h1>
                    <p className="typewriter-text">&gt; Hardware brutal para mentes excepcionales. Sin compromisos.</p>
                </div>
                <div className="bento-side bento-1 interactable">
                    <div className="bento-content">
                        <span className="mono-label">[ 01 ]</span>
                        <h3>LAPTOPS PRO</h3>
                        <div className="overlay-scan"></div>
                    </div>
                </div>
                <div className="bento-side bento-2 interactable">
                    <div className="bento-content">
                        <span className="mono-label">[ 02 ]</span>
                        <h3>COMPONENTES</h3>
                        <div className="overlay-scan"></div>
                    </div>
                </div>
            </section>

            {/* NUEVA SECCIÓN 1: DIAGNÓSTICO DEL SISTEMA */}
            <section className="sys-diagnostics">
                <div className="diag-box">
                    <span className="mono-label">LATENCIA_RED</span>
                    <h3 className="text-cyan">12ms</h3>
                </div>
                <div className="diag-box">
                    <span className="mono-label">ENCRIPTACIÓN</span>
                    <h3 className="text-accent">AES-256 SECURE</h3>
                </div>
                <div className="diag-box">
                    <span className="mono-label">NODOS_ACTIVOS</span>
                    <h3>{products.length} / 999</h3>
                </div>
                <div className="diag-box">
                    <span className="mono-label">ESTADO_SERVIDOR</span>
                    <h3 className="blink text-green">ONLINE</h3>
                </div>
            </section>

            {/* NUEVA SECCIÓN 2: NODOS DE ACCESO RAPIDO */}
            <section className="access-nodes">
                <div className="section-title">
                    <h2>/// SECTORES_DISPONIBLES</h2>
                </div>
                <div className="nodes-grid">
                    <div className="node-card">
                        <div className="node-icon">💻</div>
                        <h4>PORTÁTILES</h4>
                        <p>Terminales de movilidad táctica</p>
                        <button className="btn-node">[ ACCEDER ]</button>
                    </div>
                    <div className="node-card">
                        <div className="node-icon">⚙️</div>
                        <h4>HARDWARE</h4>
                        <p>Componentes de grado militar</p>
                        <button className="btn-node">[ ACCEDER ]</button>
                    </div>
                    <div className="node-card">
                        <div className="node-icon">🎧</div>
                        <h4>PERIFÉRICOS</h4>
                        <p>Interfaces neuronales y audio</p>
                        <button className="btn-node">[ ACCEDER ]</button>
                    </div>
                    <div className="node-card">
                        <div className="node-icon">🔋</div>
                        <h4>ENERGÍA</h4>
                        <p>Fuentes y almacenamiento</p>
                        <button className="btn-node">[ ACCEDER ]</button>
                    </div>
                </div>
            </section>

            {/* NUEVA SECCIÓN 3: CONSOLA DE INTERCEPTACIÓN */}
            <section className="cyber-terminal-deco">
                <div className="terminal-window">
                    <div className="terminal-bar">
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="title">root@techstore:~</span>
                    </div>
                    <div className="terminal-body">
                        <p>&gt; Estableciendo handshake con el servidor remoto...</p>
                        <p>&gt; Obteniendo llaves de descifrado... <span className="text-green">[OK]</span></p>
                        <p>&gt; Descargando catálogo de inventario global...</p>
                        <p>&gt; <span className="text-accent">ALERTA:</span> Detectada ruptura de precios en sector 7.</p>
                        <p>&gt; Cargando interfaz gráfica de usuario (GUI)... <span className="text-green">[COMPLETADO]</span></p>
                        <p>&gt; <span className="blink">_</span></p>
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
                        <div className="error-box">
                            <h2 className="text-red">404: ENTIDAD NO ENCONTRADA</h2>
                            <p className="mono-label">Ajuste sus parámetros de búsqueda.</p>
                        </div>
                    ) : (
                        filteredProducts.map((product) => (
                            <div className="brutal-card">
                                <div className="card-wireframe" onClick={() => { setSelectedProduct(product); setCurrentImageIndex(0); }}>
                                    <div className="card-top-bar">
                                        {/* ... */}
                                    </div>
                                    <div className="card-image-box" style={{ padding: '0', overflow: 'hidden' }}>
                                        {/* Usamos la primera imagen del array */}
                                        {product.imageUrls && product.imageUrls.length > 0 ? (
                                            <img src={product.imageUrls[0]} alt={product.name} className="cyber-image" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <span className="emoji-huge">💻</span>
                                        )}
                                        <div className="image-scanline"></div>
                                    </div>
                                    <div className="card-data">
                                        <h3 className="product-title">{product.name.toUpperCase()}</h3>
                                        <p className="product-desc">{product.description}</p>
                                        <div className="brutal-action">
                                            <div className="price-tag">
                                                <span className="currency">$</span>
                                                <span className="amount">{product.price}</span>
                                            </div>
                                            {/* IMPORTANTE: e.stopPropagation() evita que el click en el botón abra el modal */}
                                            <button className="btn-brutal" onClick={(e) => { e.stopPropagation(); addToCart(product); }}>
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

            {/* MODAL CIBERPUNK DE DETALLE DE PRODUCTO */}
            {selectedProduct && (
                <div className="neo-modal-overlay" onClick={() => setSelectedProduct(null)}>
                    <div className="neo-modal-content" onClick={(e) => e.stopPropagation()}>

                        <div className="modal-header">
                            <h2 className="glitch-text">{selectedProduct.name}</h2>
                            <button className="btn-close" onClick={() => setSelectedProduct(null)}>[ X ]</button>
                        </div>

                        <div className="modal-body">
                            {/* CARRUSEL DE IMÁGENES */}
                            <div className="carousel-container">
                                <div className="carousel-track" style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}>
                                    {selectedProduct.imageUrls && selectedProduct.imageUrls.length > 0 ? (
                                        selectedProduct.imageUrls.map((url, idx) => (
                                            <img key={idx} src={url} alt={`${selectedProduct.name} ${idx}`} className="carousel-image" />
                                        ))
                                    ) : (
                                        <div className="no-image">SIN IMAGEN</div>
                                    )}
                                </div>

                                {/* Indicadores del carrusel */}
                                {selectedProduct.imageUrls && selectedProduct.imageUrls.length > 1 && (
                                    <div className="carousel-indicators">
                                        {selectedProduct.imageUrls.map((_, idx) => (
                                            <span key={idx} className={`indicator ${idx === currentImageIndex ? 'active' : ''}`}></span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* DATOS DEL PRODUCTO */}
                            <div className="product-details-panel">
                                <div className="detail-row">
                                    <span className="mono-label">_ID:</span>
                                    <span className="text-accent">{selectedProduct.id.toString().padStart(4, '0')}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="mono-label">_CATEGORÍA:</span>
                                    <span className="text-cyan">NODO {selectedProduct.categoryId || 'GENERAL'}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="mono-label">_ESTADO:</span>
                                    <span className={selectedProduct.stock > 0 ? 'text-green' : 'text-red'}>
                                        {selectedProduct.stock > 0 ? 'ONLINE' : 'OFFLINE'}
                                    </span>
                                </div>

                                <div className="desc-box">
                                    <span className="mono-label">_ESPECIFICACIONES:</span>
                                    <p>{selectedProduct.description}</p>
                                </div>

                                <div className="modal-footer-action">
                                    <h2 className="price-huge">${selectedProduct.price}</h2>
                                    <button className="btn-brutal-action" onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}>
                                        [ AÑADIR_AL_INVENTARIO ]
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}

export default Home;