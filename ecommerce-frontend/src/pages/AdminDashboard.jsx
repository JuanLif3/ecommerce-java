import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import './AdminDashboard.scss';

function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    // Estados para el Inventario
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [inventoryView, setInventoryView] = useState('list'); // 'list', 'new_product', 'new_category'
    const [orders, setOrders] = useState([]);

    // Estados para los formularios
    const [newCategory, setNewCategory] = useState({ name: '', description: '' });
    const [newProduct, setNewProduct] = useState({ sku: '', name: '', description: '', price: '', categoryId: '' });

    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role !== 'ROLE_ADMIN') navigate('/home');
    }, [navigate]);

    // Cada vez que entramos a la pestaña de inventario, pedimos los datos a Java
    useEffect(() => {
        if (activeTab === 'inventory') {
            fetchInventoryData();
        } else if (activeTab === 'orders') {
            fetchOrdersData();
        }
    }, [activeTab]);

    const fetchInventoryData = async () => {
        try {
            // Hacemos las dos peticiones al mismo tiempo para que sea más rápido
            const [prodRes, catRes] = await Promise.all([
                api.get('/products'),
                api.get('/categories')
            ]);
            setProducts(prodRes.data);
            setCategories(catRes.data);
        } catch (error) {
            toast.error('// ERROR_DE_CONEXIÓN: No se pudo leer el inventario.');
        }
    };

    const fetchOrdersData = async () => {
        try {
            const response = await api.get('/orders');
            setOrders(response.data);
        } catch (error) {
            toast.error('// ERROR_DE_CONEXIÓN: No se pudieron leer las transacciones.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    // --- FUNCIONES DE CREACIÓN ---
    const handleCreateCategory = async (e) => {
        e.preventDefault();
        try {
            await api.post('/categories', newCategory);
            toast.success('// CATEGORÍA_CREADA_EXITOSAMENTE');
            setNewCategory({ name: '', description: '' });
            setInventoryView('list');
            fetchInventoryData(); // Recargamos la tabla
        } catch (error) {
            toast.error('// ERROR_AL_CREAR_CATEGORÍA');
        }
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        try {
            await api.post('/products', newProduct);
            toast.success('// PRODUCTO_AÑADIDO_AL_SISTEMA');
            setNewProduct({ sku: '', name: '', description: '', price: '', categoryId: '' });
            setInventoryView('list');
            fetchInventoryData(); // Recargamos la tabla
        } catch (error) {
            toast.error('// ERROR_AL_CREAR_PRODUCTO (Verifica el SKU)');
        }
    };

    // --- RENDERIZADOR DEL PANEL CENTRAL ---
    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="admin-panel overview-panel">
                        <h2>MÉTRICAS_DEL_SISTEMA</h2>
                        <div className="stats-grid">
                            <div className="stat-box">
                                <span className="mono-label">PRODUCTOS_REGISTRADOS</span>
                                <div className="stat-value text-cyan">{products.length}</div>
                            </div>
                            <div className="stat-box">
                                <span className="mono-label">CATEGORÍAS_ACTIVAS</span>
                                <div className="stat-value text-accent">{categories.length}</div>
                            </div>
                            <div className="stat-box">
                                <span className="mono-label">ESTADO_DEL_SERVIDOR</span>
                                <div className="stat-value text-green">ONLINE</div>
                            </div>
                        </div>
                    </div>
                );

            case 'inventory':
                return (
                    <div className="admin-panel inventory-panel">
                        <div className="panel-header">
                            <h2>GESTOR_DE_INVENTARIO.exe</h2>

                            {/* Controles de vista */}
                            {inventoryView === 'list' ? (
                                <div className="action-buttons">
                                    <button className="btn-brutal-action" onClick={() => setInventoryView('new_product')}>[ + PRODUCTO ]</button>
                                    <button className="btn-brutal-alt" onClick={() => setInventoryView('new_category')}>[ + CATEGORÍA ]</button>
                                </div>
                            ) : (
                                <button className="btn-brutal-alt text-red" onClick={() => setInventoryView('list')}>[ CANCELAR / VOLVER ]</button>
                            )}
                        </div>

                        {/* VISTA 1: LA TABLA DE PRODUCTOS */}
                        {inventoryView === 'list' && (
                            <div className="neo-table-container">
                                <table className="neo-table">
                                    <thead>
                                    <tr>
                                        <th>SKU</th>
                                        <th>NOMBRE</th>
                                        <th>PRECIO</th>
                                        <th>STOCK</th>
                                        <th>CATEGORÍA</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {products.length === 0 ? (
                                        <tr><td colSpan="5" className="text-center">VACÍO // NO HAY DATOS</td></tr>
                                    ) : (
                                        products.map(p => (
                                            <tr key={p.id}>
                                                <td className="text-accent">{p.sku}</td>
                                                <td>{p.name}</td>
                                                <td className="text-cyan">${p.price}</td>
                                                <td>{p.stock}</td>
                                                <td className="text-dim">ID: {p.categoryId || 'N/A'}</td>
                                            </tr>
                                        ))
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* VISTA 2: FORMULARIO NUEVA CATEGORÍA */}
                        {inventoryView === 'new_category' && (
                            <form className="neo-form-box" onSubmit={handleCreateCategory}>
                                <h3 className="text-cyan">/// NUEVA_CATEGORIA</h3>
                                <div className="input-group">
                                    <label>_NOMBRE_CATEGORIA</label>
                                    <input required value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})} placeholder="Ej. Laptops" />
                                </div>
                                <div className="input-group">
                                    <label>_DESCRIPCION</label>
                                    <input required value={newCategory.description} onChange={e => setNewCategory({...newCategory, description: e.target.value})} placeholder="Equipos portátiles" />
                                </div>
                                <button type="submit" className="btn-brutal-submit">[ EJECUTAR_CREACIÓN ]</button>
                            </form>
                        )}

                        {/* VISTA 3: FORMULARIO NUEVO PRODUCTO */}
                        {inventoryView === 'new_product' && (
                            <form className="neo-form-box" onSubmit={handleCreateProduct}>
                                <h3 className="text-accent">/// NUEVO_PRODUCTO</h3>

                                <div className="form-grid">
                                    <div className="input-group">
                                        <label>_SKU (Único)</label>
                                        <input required value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} placeholder="Ej. MAC-M3-001" />
                                    </div>

                                    <div className="input-group">
                                        <label>_CATEGORÍA</label>
                                        <select required value={newProduct.categoryId} onChange={e => setNewProduct({...newProduct, categoryId: e.target.value})}>
                                            <option value="">-- SELECCIONE UN NODO --</option>
                                            {categories.map(c => (
                                                <option key={c.id} value={c.id}>[{c.id}] {c.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="input-group full-width">
                                        <label>_NOMBRE_DEL_PRODUCTO</label>
                                        <input required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="MacBook Pro M3" />
                                    </div>

                                    <div className="input-group full-width">
                                        <label>_DESCRIPCIÓN</label>
                                        <textarea required rows="3" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} placeholder="Especificaciones técnicas..."></textarea>
                                    </div>

                                    <div className="input-group">
                                        <label>_PRECIO_USD</label>
                                        <input required type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} placeholder="1999.99" />
                                    </div>
                                </div>

                                <button type="submit" className="btn-brutal-submit mt-2">[ GRABAR_EN_BASE_DE_DATOS ]</button>
                            </form>
                        )}
                    </div>
                );

            case 'orders':
                return (
                    <div className="admin-panel">
                        <div className="panel-header">
                            <h2>REGISTRO_DE_TRANSACCIONES.exe</h2>
                            <button className="btn-brutal-alt" onClick={fetchOrdersData}>[ ACTUALIZAR_RADAR ]</button>
                        </div>

                        <div className="neo-table-container mt-2">
                            <table className="neo-table">
                                <thead>
                                <tr>
                                    <th>ID_ORDEN</th>
                                    <th>CLIENTE (ID)</th>
                                    <th>MONTO_TOTAL</th>
                                    <th>ESTADO</th>
                                    <th>FECHA_SISTEMA</th>
                                </tr>
                                </thead>
                                <tbody>
                                {orders.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center">VACÍO // SIN TRANSACCIONES</td></tr>
                                ) : (
                                    orders.map(order => (
                                        <tr key={order.id}>
                                            <td className="text-accent">#{order.id}</td>
                                            {/* Dependiendo de cómo Java envíe el customer, ajustamos esto */}
                                            <td className="text-dim">CUST_{order.customerId || 'UNKNOWN'}</td>
                                            <td className="text-cyan">${order.totalAmount || order.total}</td>
                                            <td>
                                                {/* Colores dinámicos según el estado de la orden */}
                                                <span className={order.status === 'PENDING' ? 'text-accent' : 'text-green'}>
                            [{order.status || 'PROCESADA'}]
                          </span>
                                            </td>
                                            <td>{new Date(order.createdAt).toLocaleString()}</td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );

            default: return null;
        }
    };

    return (
        <div className="neo-admin-layout">
            {/* SIDEBAR */}
            <aside className="admin-sidebar">
                <div className="sidebar-brand">
                    <span className="icon">⚙️</span>
                    <h2>SYS_ADMIN</h2>
                </div>
                <nav className="sidebar-nav">
                    <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>&gt; GENERAL</button>
                    <button className={activeTab === 'inventory' ? 'active' : ''} onClick={() => setActiveTab('inventory')}>&gt; INVENTARIO</button>
                    <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>&gt; PEDIDOS</button>
                </nav>
                <button className="btn-exit" onClick={handleLogout}>[ DESCONECTAR ]</button>
            </aside>

            {/* MAIN CONTENT */}
            <main className="admin-main">
                <header className="admin-topbar">
                    <span className="mono-label">NODO_CENTRAL // ACCESO: NIVEL OMEGA</span>
                    <div className="status-dot"></div>
                </header>
                <div className="admin-content-area">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}

export default AdminDashboard;