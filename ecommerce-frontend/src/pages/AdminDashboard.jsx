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

    // ESTADO DE ÓRDENES (El que React no encontraba)
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null); // Para el modal de empaquetar

    // Estado para saber si estamos editando un producto (guarda el ID)
    const [editingProductId, setEditingProductId] = useState(null);

    // Estados para los formularios
    const [newCategory, setNewCategory] = useState({ name: '', description: '' });
    const [newProduct, setNewProduct] = useState({ sku: '', name: '', description: '', price: '', categoryId: '', imageUrls: [] });
    const [isUploadingImage, setIsUploadingImage] = useState(false);

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

    // --- SUBIR IMAGEN A CLOUDINARY ---
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploadingImage(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'techstore_preset');

        try {
            const res = await fetch('https://api.cloudinary.com/v1_1/dvjfif618/image/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            // AGREGAMOS LA NUEVA IMAGEN AL ARRAY
            setNewProduct(prev => ({
                ...prev,
                imageUrls: [...prev.imageUrls, data.secure_url]
            }));

            toast.success('// IMAGEN_AÑADIDA_AL_SECUENCIADOR');
        } catch (err) {
            toast.error('// ERROR_AL_SUBIR_ARCHIVO');
        } finally {
            setIsUploadingImage(false);
        }
    };

    // --- FUNCIONES DE CREACIÓN / EDICIÓN ---
    const resetProductForm = () => {
        setNewProduct({ sku: '', name: '', description: '', price: '', categoryId: '', imageUrls: [] });
        setEditingProductId(null);
    };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        try {
            await api.post('/categories', newCategory);
            toast.success('// CATEGORÍA_CREADA_EXITOSAMENTE');
            setNewCategory({ name: '', description: '' });
            setInventoryView('list');
            fetchInventoryData();
        } catch (error) {
            toast.error('// ERROR_AL_CREAR_CATEGORÍA');
        }
    };

    const handleSubmitProduct = async (e) => {
        e.preventDefault();
        try {
            if (editingProductId) {
                await api.put(`/products/${editingProductId}`, newProduct);
                toast.success('// PRODUCTO_SOBREESCRITO_EXITOSAMENTE');
            } else {
                await api.post('/products', newProduct);
                toast.success('// PRODUCTO_AÑADIDO_AL_SISTEMA');
            }
            resetProductForm();
            setInventoryView('list');
            fetchInventoryData();
        } catch (error) {
            toast.error(editingProductId ? '// ERROR_AL_ACTUALIZAR_PRODUCTO' : '// ERROR_AL_CREAR_PRODUCTO (Verifica el SKU)');
        }
    };

    const handleEditClick = (prod) => {
        setEditingProductId(prod.id);
        setNewProduct({
            sku: prod.sku,
            name: prod.name,
            description: prod.description,
            price: prod.price,
            categoryId: prod.categoryId || (categories[0]?.id || ''),
            imageUrls: prod.imageUrls || []
        });
        setInventoryView('new_product');
    };

    const handleDeactivate = async (id, name) => {
        if (window.confirm(`> ADVERTENCIA: ¿Seguro que deseas pasar a OFFLINE el hardware [ ${name} ]?`)) {
            try {
                await api.patch(`/products/${id}/deactivate`);
                toast.success(`// [ ${name} ] DESCONECTADO_DE_LA_RED`);
                fetchInventoryData();
            } catch (error) {
                toast.error('// ERROR: Imposible cortar conexión.');
            }
        }
    };

    // --- FUNCIÓN PARA EMPAQUETAR EL PEDIDO ---
    const handlePackOrder = async (orderId) => {
        try {
            // ! Usamos POST, el protocolo más confiable para acciones directas
            await api.post(`/orders/${orderId}/ship`);

            toast.success('// PEDIDO_EMPAQUETADO_Y_LISTO_PARA_ENVÍO');
            setSelectedOrder(null);
            fetchOrdersData();
        } catch (error) {
            // Si Java se queja, lo imprimimos en la consola para ver el motivo real
            console.error("/// MOTIVO DEL RECHAZO: ", error.response?.data);

            const errorMsg = error.response?.data?.message || "Error desconocido";
            toast.error(`// ERROR: ${errorMsg}`);
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
                            {inventoryView === 'list' ? (
                                <div className="action-buttons">
                                    <button className="btn-brutal-action" onClick={() => { resetProductForm(); setInventoryView('new_product'); }}>[ + PRODUCTO ]</button>
                                    <button className="btn-brutal-alt" onClick={() => setInventoryView('new_category')}>[ + CATEGORÍA ]</button>
                                </div>
                            ) : (
                                <button className="btn-brutal-alt text-red" onClick={() => { resetProductForm(); setInventoryView('list'); }}>[ CANCELAR / VOLVER ]</button>
                            )}
                        </div>

                        {/* VISTA 1: TABLA PRODUCTOS */}
                        {inventoryView === 'list' && (
                            <div className="neo-table-container">
                                <table className="neo-table">
                                    <thead>
                                    <tr>
                                        <th>SKU</th>
                                        <th>NOMBRE</th>
                                        <th>PRECIO</th>
                                        <th>ESTADO</th>
                                        <th>COMANDOS</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {products.length === 0 ? (
                                        <tr><td colSpan="5" className="text-center">VACÍO // NO HAY DATOS</td></tr>
                                    ) : (
                                        products.map(p => (
                                            <tr key={p.id} className={p.isActive === false ? 'offline-row' : ''}>
                                                <td className="text-accent">{p.sku}</td>
                                                <td>{p.name}</td>
                                                <td className="text-cyan">${p.price}</td>
                                                <td>
                                                    {p.isActive !== false ? <span className="text-green">ONLINE</span> : <span className="text-red">OFFLINE</span>}
                                                </td>
                                                <td className="table-actions">
                                                    <button
                                                        className="action-btn edit-btn"
                                                        onClick={() => handleEditClick(p)}
                                                        disabled={p.isActive === false}
                                                    >
                                                        [ EDITAR ]
                                                    </button>
                                                    {p.isActive !== false && (
                                                        <button
                                                            className="action-btn kill-btn"
                                                            onClick={() => handleDeactivate(p.id, p.name)}
                                                        >
                                                            [ BAJA ]
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* VISTA 2: NUEVA CATEGORÍA */}
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

                        {/* VISTA 3: NUEVO/EDITAR PRODUCTO */}
                        {inventoryView === 'new_product' && (
                            <form className="neo-form-box" onSubmit={handleSubmitProduct}>
                                <h3 className="text-accent">
                                    {editingProductId ? '/// MODO_EDICIÓN_ACTIVADO' : '/// NUEVO_PRODUCTO'}
                                </h3>

                                <div className="input-group full-width mb-2">
                                    <label>_IMÁGENES_DEL_PRODUCTO (AWS S3 / Cloudinary)</label>
                                    <div className="image-upload-box">
                                        <div className="image-gallery-preview" style={{ display: 'flex', gap: '10px', overflowX: 'auto', width: '100%', justifyContent: 'center' }}>
                                            {newProduct.imageUrls.length > 0 ? (
                                                newProduct.imageUrls.map((url, idx) => (
                                                    <img key={idx} src={url} alt={`Preview ${idx}`} style={{ height: '100px', border: '1px solid #00f0ff' }} />
                                                ))
                                            ) : (
                                                <div className="img-placeholder" style={{ padding: '2rem' }}>
                                                    {isUploadingImage ? 'CARGANDO_BYTES...' : 'SIN_IMÁGENES'}
                                                </div>
                                            )}
                                        </div>
                                        <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploadingImage} className="file-input mt-2" />
                                    </div>
                                </div>

                                <div className="form-grid">
                                    <div className="input-group">
                                        <label>_SKU (Único)</label>
                                        <input
                                            required
                                            value={newProduct.sku}
                                            onChange={e => setNewProduct({...newProduct, sku: e.target.value})}
                                            placeholder="Ej. MAC-M3-001"
                                            disabled={!!editingProductId}
                                        />
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

                                <button type="submit" className="btn-brutal-submit mt-2">
                                    {editingProductId ? '[ SOBRESCRIBIR_DATOS ]' : '[ GRABAR_EN_BASE_DE_DATOS ]'}
                                </button>
                            </form>
                        )}
                    </div>
                );

            case 'orders':
                return (
                    <div className="admin-panel">
                        <div className="panel-header">
                            <h2>SISTEMA_DE_ENVÍOS_Y_LOGÍSTICA.exe</h2>
                            <button className="btn-brutal-alt" onClick={fetchOrdersData}>[ ACTUALIZAR_RADAR ]</button>
                        </div>

                        <div className="neo-table-container mt-2">
                            <table className="neo-table">
                                <thead>
                                <tr>
                                    <th>ID_ORDEN</th>
                                    <th>CLIENTE // VOLUMEN</th>
                                    <th>MONTO</th>
                                    <th>ESTADO_LOGÍSTICO</th>
                                    <th>ACCIÓN</th>
                                </tr>
                                </thead>
                                <tbody>
                                {orders.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center">VACÍO // SIN ENVÍOS PENDIENTES</td></tr>
                                ) : (
                                    orders.map(order => {
                                        const totalItems = order.items ? order.items.reduce((acc, item) => acc + item.quantity, 0) : 0;
                                        return (
                                        <tr key={order.orderId} className={order.status === 'SHIPPED' ? 'offline-row' : ''}>
                                            <td className="text-accent">#{order.orderId}</td>
                                            <td>
                                                <div className="text-main font-bold">{order.customerName || 'USUARIO_DESCONOCIDO'}</div>
                                                <div className="mono-label text-cyan">{totalItems} UNIDAD(ES) DE HARDWARE</div>
                                            </td>
                                            <td className="text-cyan">${order.totalAmount || order.total}</td>
                                            <td>
                                                    <span className={order.status === 'PAID' ? 'text-green' : (order.status === 'SHIPPED' ? 'text-dim' : 'text-accent')}>
                                                        [{order.status || 'PENDIENTE'}]
                                                    </span>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn-brutal-action"
                                                    style={{padding: '0.5rem', fontSize: '0.8rem'}}
                                                    onClick={() => setSelectedOrder(order)}
                                                    disabled={order.status === 'SHIPPED'}
                                                >
                                                    {order.status === 'SHIPPED' ? '[ FINALIZADO ]' : '[ EMPAQUETAR ]'}
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                    })
                                )}
                                </tbody>
                            </table>
                        </div>

                        {/* MODAL CIBERPUNK DE EMPAQUETADO (MANIFIESTO) */}
                        {selectedOrder && (
                            <div className="neo-modal-overlay" onClick={() => setSelectedOrder(null)}>
                                <div className="neo-modal-content" style={{maxWidth: '600px'}} onClick={(e) => e.stopPropagation()}>

                                    <div className="modal-header">
                                        <h2 className="glitch-text text-accent">/// MANIFIESTO_DE_CARGA</h2>
                                        <button className="btn-close" onClick={() => setSelectedOrder(null)}>[ X ]</button>
                                    </div>

                                    <div className="modal-body" style={{display: 'block', padding: '2rem'}}>

                                        {/* DATOS DEL CLIENTE PARA EL ENVÍO */}
                                        <div style={{marginBottom: '2rem', borderBottom: '1px dashed #333', paddingBottom: '1rem', lineHeight: '1.8'}}>
                                            <span className="mono-label">_ID_ORDEN: </span>
                                            <span className="text-cyan font-bold">#{selectedOrder.orderId}</span><br/>

                                            <span className="mono-label">_DESTINATARIO: </span>
                                            <span className="text-main">{selectedOrder.customerName}</span><br/>

                                            <span className="mono-label">_TELÉFONO: </span>
                                            <span className="text-main">{selectedOrder.customerPhone || 'NO_REGISTRADO'}</span><br/>

                                            <span className="mono-label">_DIRECCIÓN_FÍSICA: </span>
                                            <span className="text-main" style={{color: '#ccff00'}}>{selectedOrder.shippingAddress || 'RETIRO EN TIENDA'}</span>
                                        </div>

                                        <h3 className="mono-label text-dim mb-2">&gt; HARDWARE_A_ENSAMBLAR:</h3>

                                        <div className="items-manifest" style={{background: '#000', border: '1px solid #333', padding: '1rem', marginBottom: '2rem'}}>
                                            {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                                selectedOrder.items.map((item, idx) => (
                                                    <div key={idx} style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #111', padding: '0.5rem 0'}}>
                                                        <span className="text-main" style={{fontFamily: 'Space Mono', fontSize: '0.9rem'}}>
                                                            &gt; {item.productName || `PRODUCTO_ID_${item.productId}`}
                                                        </span>
                                                        <span className="text-accent font-bold" style={{fontFamily: 'Space Mono'}}>
                                                            x{item.quantity}
                                                        </span>
                                                    </div>
                                                ))
                                            ) : (
                                                <span className="text-red">ERROR: LISTA_DE_CARGA_VACÍA</span>
                                            )}
                                        </div>

                                        {/* BOTONES */}
                                        <div style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end'}}>
                                            <button
                                                className="btn-brutal-alt text-red"
                                                onClick={() => setSelectedOrder(null)}
                                            >
                                                [ SALIR ]
                                            </button>
                                            <button
                                                className="btn-brutal-action"
                                                // CORRECCIÓN: Enviamos orderId
                                                onClick={() => handlePackOrder(selectedOrder.orderId)}
                                            >
                                                [ PEDIDO EMPAQUETADO ]
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );

            default: return null;
        }
    };

    return (
        <div className="neo-admin-layout">
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