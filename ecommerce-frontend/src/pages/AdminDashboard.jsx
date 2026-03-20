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
    const [inventoryView, setInventoryView] = useState('list');

    // Estados para Órdenes y Logística
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // NUEVO: Estados para los buscadores
    const [historySearch, setHistorySearch] = useState('');
    const [customerSearch, setCustomerSearch] = useState('');

    const [editingProductId, setEditingProductId] = useState(null);
    const [newCategory, setNewCategory] = useState({ name: '', description: '' });
    const [newProduct, setNewProduct] = useState({ sku: '', name: '', description: '', price: '', categoryId: '', imageUrls: [] });
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    useEffect(() => {
        const role = localStorage.getItem('role');
        if (role !== 'ROLE_ADMIN') navigate('/home');
    }, [navigate]);

    useEffect(() => {
        if (activeTab === 'inventory') fetchInventoryData();
        // Cargamos las órdenes tanto para 'orders', como 'history' y 'customers'
        if (activeTab === 'orders' || activeTab === 'history' || activeTab === 'customers') fetchOrdersData();
    }, [activeTab]);

    const fetchInventoryData = async () => {
        try {
            const [prodRes, catRes] = await Promise.all([api.get('/products'), api.get('/categories')]);
            setProducts(prodRes.data);
            setCategories(catRes.data);
        } catch (error) { toast.error('// ERROR_DE_CONEXIÓN: Inventario offline.'); }
    };

    const fetchOrdersData = async () => {
        try {
            const response = await api.get('/orders');
            setOrders(response.data);
        } catch (error) { toast.error('// ERROR_DE_CONEXIÓN: Radar de transacciones offline.'); }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    // --- FUNCIONES CLOUDINARY E INVENTARIO (Se mantienen intactas) ---
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploadingImage(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'techstore_preset');
        try {
            const res = await fetch('https://api.cloudinary.com/v1_1/dvjfif618/image/upload', { method: 'POST', body: formData });
            const data = await res.json();
            setNewProduct(prev => ({ ...prev, imageUrls: [...prev.imageUrls, data.secure_url] }));
            toast.success('// IMAGEN_AÑADIDA');
        } catch (err) { toast.error('// ERROR_AL_SUBIR_ARCHIVO'); }
        finally { setIsUploadingImage(false); }
    };

    const resetProductForm = () => { setNewProduct({ sku: '', name: '', description: '', price: '', categoryId: '', imageUrls: [] }); setEditingProductId(null); };

    const handleCreateCategory = async (e) => {
        e.preventDefault();
        try { await api.post('/categories', newCategory); toast.success('// CATEGORÍA_CREADA'); setNewCategory({ name: '', description: '' }); setInventoryView('list'); fetchInventoryData();
        } catch (error) { toast.error('// ERROR_AL_CREAR_CATEGORÍA'); }
    };

    const handleSubmitProduct = async (e) => {
        e.preventDefault();
        try {
            if (editingProductId) { await api.put(`/products/${editingProductId}`, newProduct); toast.success('// PRODUCTO_ACTUALIZADO'); }
            else { await api.post('/products', newProduct); toast.success('// PRODUCTO_CREADO'); }
            resetProductForm(); setInventoryView('list'); fetchInventoryData();
        } catch (error) { toast.error('// ERROR_DE_SISTEMA'); }
    };

    const handleEditClick = (prod) => {
        setEditingProductId(prod.id);
        setNewProduct({ sku: prod.sku, name: prod.name, description: prod.description, price: prod.price, categoryId: prod.categoryId || (categories[0]?.id || ''), imageUrls: prod.imageUrls || [] });
        setInventoryView('new_product');
    };

    const handleDeactivate = async (id, name) => {
        if (window.confirm(`> ¿Pasar a OFFLINE [ ${name} ]?`)) {
            try { await api.patch(`/products/${id}/deactivate`); toast.success(`// DESCONECTADO`); fetchInventoryData();
            } catch (error) { toast.error('// ERROR'); }
        }
    };

    const handlePackOrder = async (orderId) => {
        try {
            await api.post(`/orders/${orderId}/ship`);
            toast.success('// PEDIDO_EMPAQUETADO');
            setSelectedOrder(null);
            fetchOrdersData();
        } catch (error) { toast.error(`// ERROR AL EMPAQUETAR`); }
    };

    // --- NUEVO: LÓGICA DE PROCESAMIENTO DE CLIENTES Y BÚSQUEDAS ---

    // 1. Historial: Solo enviados
    const historyOrders = orders.filter(o => o.status === 'SHIPPED');
    const filteredHistory = historyOrders.filter(o =>
        o.orderId.toString().includes(historySearch) ||
        (o.customerName && o.customerName.toLowerCase().includes(historySearch.toLowerCase())) ||
        (o.customerEmail && o.customerEmail.toLowerCase().includes(historySearch.toLowerCase()))
    );

    // 2. Clientes: Agrupados por EMAIL
    const processCustomers = () => {
        const clientMap = {};
        orders.forEach(order => {
            const email = order.customerEmail || 'SIN_CORREO_REGISTRADO';

            // Si el correo no existe en nuestro diccionario, lo creamos
            if (!clientMap[email]) {
                clientMap[email] = {
                    email: email,
                    name: order.customerName, // Tomamos el nombre del primer pedido que encontremos
                    totalSpent: 0,
                    totalOrders: 0,
                    totalItems: 0
                };
            }

            // Sumamos los datos
            clientMap[email].totalOrders += 1;
            clientMap[email].totalSpent += parseFloat(order.totalAmount || 0);
            const itemsInOrder = order.items ? order.items.reduce((acc, item) => acc + item.quantity, 0) : 0;
            clientMap[email].totalItems += itemsInOrder;
        });

        // Convertimos el diccionario a un Array y lo filtramos por búsqueda
        return Object.values(clientMap).filter(c =>
            c.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
            c.name.toLowerCase().includes(customerSearch.toLowerCase())
        ).sort((a, b) => b.totalSpent - a.totalSpent); // Los ordenamos por quién gasta más
    };
    const customerList = processCustomers();


    // --- RENDERIZADOR DEL PANEL CENTRAL ---
    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                // Cálculos automáticos para el Dashboard
                const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
                const offlineProducts = products.filter(p => p.isActive === false).length;
                const pendingOrders = orders.filter(o => o.status === 'PAID').length;

                return (
                    <div className="admin-panel overview-panel" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', minHeight: '100%' }}>
                        <h2 className="glitch-text text-accent" style={{ margin: 0, fontSize: '2rem' }}>/// CENTRO_DE_MANDO_CENTRAL</h2>

                        {/* FILA 1: TARJETAS DE MÉTRICAS GLOBALES */}
                        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                            <div className="stat-box" style={{ border: '2px solid #333', padding: '1.5rem', background: '#0a0a0a' }}>
                                <span className="mono-label text-dim">_INGRESOS_TOTALES</span>
                                <div className="stat-value text-green" style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '1rem 0', fontFamily: '"Space Mono", monospace' }}>
                                    ${totalRevenue.toLocaleString()}
                                </div>
                                <div className="stat-chart" style={{ height: '4px', background: '#333', width: '100%' }}>
                                    <div className="bar" style={{ height: '100%', background: '#00ff00', width: '75%' }}></div>
                                </div>
                            </div>

                            <div className="stat-box" style={{ border: '2px solid #333', padding: '1.5rem', background: '#0a0a0a' }}>
                                <span className="mono-label text-dim">_ÓRDENES_PROCESADAS</span>
                                <div className="stat-value text-cyan" style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '1rem 0', fontFamily: '"Space Mono", monospace' }}>
                                    {orders.length}
                                </div>
                                <div className="stat-chart" style={{ height: '4px', background: '#333', width: '100%' }}>
                                    <div className="bar" style={{ height: '100%', background: '#00f0ff', width: '60%' }}></div>
                                </div>
                            </div>

                            <div className="stat-box" style={{ border: '2px solid #333', padding: '1.5rem', background: '#0a0a0a' }}>
                                <span className="mono-label text-dim">_NODOS_DE_HARDWARE</span>
                                <div className="stat-value text-main" style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '1rem 0', fontFamily: '"Space Mono", monospace' }}>
                                    {products.length} <span style={{ fontSize: '1rem', color: '#888' }}>[{categories.length} CAT]</span>
                                </div>
                                <div className="stat-chart" style={{ height: '4px', background: '#333', width: '100%' }}>
                                    <div className="bar" style={{ height: '100%', background: '#ccff00', width: '90%' }}></div>
                                </div>
                            </div>

                            <div className="stat-box" style={{ border: `2px solid ${offlineProducts > 0 ? '#ff003c' : '#333'}`, padding: '1.5rem', background: '#0a0a0a' }}>
                                <span className="mono-label text-dim">_STATUS_INVENTARIO</span>
                                <div className={`stat-value ${offlineProducts > 0 ? 'text-red' : 'text-green'}`} style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '1rem 0', fontFamily: '"Space Mono", monospace' }}>
                                    {offlineProducts > 0 ? `${offlineProducts} ERR` : '100% OK'}
                                </div>
                                <div className="stat-chart" style={{ height: '4px', background: '#333', width: '100%' }}>
                                    <div className="bar" style={{ height: '100%', background: offlineProducts > 0 ? '#ff003c' : '#00ff00', width: offlineProducts > 0 ? '40%' : '100%' }}></div>
                                </div>
                            </div>
                        </div>

                        {/* FILA 2: PANELES COMPLEJOS (TERMINAL Y ALERTAS) */}
                        <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', flexGrow: 1 }}>

                            {/* PANEL IZQUIERDO: TERMINAL EN VIVO */}
                            <div className="terminal-box" style={{ border: '2px solid #333', background: '#000', display: 'flex', flexDirection: 'column' }}>
                                <div className="terminal-header" style={{ background: '#333', color: '#fff', padding: '0.5rem 1rem', fontFamily: '"Space Mono", monospace', fontSize: '0.85rem' }}>
                                    root@techstore:~/sys_activity_log.sh
                                </div>
                                <div className="terminal-body" style={{ padding: '1.5rem', fontFamily: '"Space Mono", monospace', fontSize: '0.9rem', lineHeight: '1.8', height: '300px', overflowY: 'auto' }}>
                                    <p className="text-dim">&gt; Iniciando secuencia de arranque de la interfaz...</p>
                                    <p className="text-green">&gt; [OK] Conexión establecida con base de datos Neon PostgreSQL.</p>
                                    <p className="text-dim">&gt; Sincronizando módulos de seguridad y firewalls...</p>
                                    <p className="text-cyan">&gt; Escáner de inventario: {products.length} productos detectados en la red.</p>
                                    <p className="text-dim">&gt; Analizando registros de la pasarela Transbank...</p>
                                    {orders.slice(-4).reverse().map((o, i) => (
                                        <p key={i} className={o.status === 'SHIPPED' ? 'text-dim' : 'text-accent'}>
                                            &gt; Orden #{o.orderId} detectada. Status: [{o.status}] - Monto: ${o.totalAmount}
                                        </p>
                                    ))}
                                    <p className="text-main">&gt; Base de clientes actualizada: {customerList.length} usuarios únicos registrados.</p>
                                    <p>&gt; Sistema esperando instrucciones<span style={{ display: 'inline-block', width: '10px', height: '1em', background: '#0f0', animation: 'blink 1s infinite', verticalAlign: 'middle', marginLeft: '5px' }}></span></p>
                                </div>
                            </div>

                            {/* PANEL DERECHO: ALERTAS TÁCTICAS */}
                            <div className="alerts-box" style={{ border: '2px solid #333', background: '#0a0a0a', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                                <h3 className="text-red" style={{ margin: '0 0 1.5rem 0', borderBottom: '1px dashed #333', paddingBottom: '0.5rem' }}>
                                    /// ALERTAS_TÁCTICAS
                                </h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flexGrow: 1 }}>

                                    {/* Alerta de Pedidos */}
                                    <div style={{ borderLeft: `4px solid ${pendingOrders > 0 ? '#ff003c' : '#00ff00'}`, paddingLeft: '1rem' }}>
                                        <span className={`mono-label ${pendingOrders > 0 ? 'text-red' : 'text-green'}`} style={{ fontWeight: 'bold' }}>
                                            {pendingOrders > 0 ? 'PRIORIDAD MÁXIMA' : 'LOGÍSTICA AL DÍA'}
                                        </span>
                                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.95rem', color: '#ccc' }}>
                                            {pendingOrders > 0
                                                ? <>Existen <strong>{pendingOrders}</strong> pedidos pagados esperando en la fila de empaquetado.</>
                                                : 'No hay pedidos pendientes de empaquetado en este momento.'}
                                        </p>
                                    </div>

                                    {/* Alerta de Inventario */}
                                    <div style={{ borderLeft: `4px solid ${offlineProducts > 0 ? '#ff003c' : '#ccff00'}`, paddingLeft: '1rem' }}>
                                        <span className="mono-label text-accent" style={{ fontWeight: 'bold' }}>ESTADO DE CATÁLOGO</span>
                                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.95rem', color: '#ccc' }}>
                                            {offlineProducts > 0
                                                ? <>Atención: <strong>{offlineProducts}</strong> productos se encuentran marcados como OFFLINE.</>
                                                : 'Todo el hardware del catálogo se encuentra disponible en la red.'}
                                        </p>
                                    </div>

                                    {/* Botón de acceso rápido */}
                                    <div style={{ marginTop: 'auto' }}>
                                        <button
                                            className="btn-brutal-alt"
                                            style={{ width: '100%', padding: '1rem', display: 'block', textAlign: 'center' }}
                                            onClick={() => setActiveTab('orders')}
                                        >
                                            [ IR AL RADAR DE ENVÍOS ]
                                        </button>
                                    </div>
                                </div>
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
                                    <thead><tr><th>SKU</th><th>NOMBRE</th><th>PRECIO</th><th>ESTADO</th><th>COMANDOS</th></tr></thead>
                                    <tbody>
                                    {products.map(p => (
                                        <tr key={p.id} className={p.isActive === false ? 'offline-row' : ''}>
                                            <td className="text-accent">{p.sku}</td><td>{p.name}</td><td className="text-cyan">${p.price}</td>
                                            <td>{p.isActive !== false ? <span className="text-green">ONLINE</span> : <span className="text-red">OFFLINE</span>}</td>
                                            <td className="table-actions">
                                                <button className="action-btn edit-btn" onClick={() => handleEditClick(p)} disabled={p.isActive === false}>[ EDITAR ]</button>
                                                {p.isActive !== false && <button className="action-btn kill-btn" onClick={() => handleDeactivate(p.id, p.name)}>[ BAJA ]</button>}
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* VISTA 2 y 3 (Se mantienen resumidas para el código, tu original funciona igual) */}
                        {inventoryView === 'new_category' && (
                            <form className="neo-form-box" onSubmit={handleCreateCategory}>
                                <h3 className="text-cyan">/// NUEVA_CATEGORIA</h3>
                                <div className="input-group"><label>_NOMBRE_CATEGORIA</label><input required value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})} /></div>
                                <div className="input-group"><label>_DESCRIPCION</label><input required value={newCategory.description} onChange={e => setNewCategory({...newCategory, description: e.target.value})} /></div>
                                <button type="submit" className="btn-brutal-submit">[ CREAR ]</button>
                            </form>
                        )}

                        {inventoryView === 'new_product' && (
                            <form className="neo-form-box" onSubmit={handleSubmitProduct}>
                                <h3 className="text-accent">{editingProductId ? '/// MODO_EDICIÓN' : '/// NUEVO_PRODUCTO'}</h3>
                                <div className="input-group full-width mb-2">
                                    <label>_IMÁGENES</label>
                                    <div className="image-upload-box">
                                        <div className="image-gallery-preview" style={{ display: 'flex', gap: '10px', overflowX: 'auto', width: '100%', justifyContent: 'center' }}>
                                            {newProduct.imageUrls.length > 0 ? newProduct.imageUrls.map((url, idx) => (<img key={idx} src={url} alt={`Prev`} style={{ height: '100px', border: '1px solid #00f0ff' }} />)) : (<div className="img-placeholder" style={{ padding: '2rem' }}>{isUploadingImage ? 'CARGANDO...' : 'SIN_IMÁGENES'}</div>)}
                                        </div>
                                        <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploadingImage} className="file-input mt-2" />
                                    </div>
                                </div>
                                <div className="form-grid">
                                    <div className="input-group"><label>_SKU</label><input required value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} disabled={!!editingProductId} /></div>
                                    <div className="input-group"><label>_CATEGORÍA</label><select required value={newProduct.categoryId} onChange={e => setNewProduct({...newProduct, categoryId: e.target.value})}><option value="">-- SELECCIONE --</option>{categories.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}</select></div>
                                    <div className="input-group full-width"><label>_NOMBRE</label><input required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} /></div>
                                    <div className="input-group full-width"><label>_DESCRIPCIÓN</label><textarea required rows="3" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})}></textarea></div>
                                    <div className="input-group"><label>_PRECIO</label><input required type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} /></div>
                                </div>
                                <button type="submit" className="btn-brutal-submit mt-2">{editingProductId ? '[ ACTUALIZAR ]' : '[ CREAR ]'}</button>
                            </form>
                        )}
                    </div>
                );

            case 'orders':
                return (
                    <div className="admin-panel">
                        <div className="panel-header">
                            <h2>SISTEMA_LOGÍSTICA.exe</h2>
                            <button className="btn-brutal-alt" onClick={fetchOrdersData}>[ ACTUALIZAR ]</button>
                        </div>
                        <div className="neo-table-container mt-2">
                            <table className="neo-table">
                                <thead><tr><th>ID</th><th>CLIENTE // VOLUMEN</th><th>MONTO</th><th>ESTADO</th><th>ACCIÓN</th></tr></thead>
                                <tbody>
                                {orders.filter(o => o.status !== 'SHIPPED').map(order => {
                                    const totalItems = order.items ? order.items.reduce((acc, item) => acc + item.quantity, 0) : 0;
                                    return (
                                        <tr key={order.orderId}>
                                            <td className="text-accent">#{order.orderId}</td>
                                            <td><div className="text-main font-bold">{order.customerName}</div><div className="mono-label text-cyan">{totalItems} UNIDADES</div></td>
                                            <td className="text-cyan">${order.totalAmount}</td>
                                            <td><span className={order.status === 'PAID' ? 'text-green' : 'text-accent'}>[{order.status}]</span></td>
                                            <td><button className="btn-brutal-action" style={{padding: '0.5rem'}} onClick={() => setSelectedOrder(order)}>[ EMPAQUETAR ]</button></td>
                                        </tr>
                                    )
                                })}
                                </tbody>
                            </table>
                        </div>

                        {/* MODAL DE EMPAQUETADO (Intacto) */}
                        {selectedOrder && (
                            <div className="neo-modal-overlay" onClick={() => setSelectedOrder(null)}>
                                <div className="neo-modal-content" style={{maxWidth: '600px'}} onClick={(e) => e.stopPropagation()}>
                                    <div className="modal-header"><h2 className="glitch-text text-accent">/// MANIFIESTO_DE_CARGA</h2><button className="btn-close" onClick={() => setSelectedOrder(null)}>[ X ]</button></div>
                                    <div className="modal-body" style={{display: 'block', padding: '2rem'}}>
                                        <div style={{marginBottom: '2rem', borderBottom: '1px dashed #333', paddingBottom: '1rem', lineHeight: '1.8'}}>
                                            <span className="mono-label">_ID: </span><span className="text-cyan font-bold">#{selectedOrder.orderId}</span><br/>
                                            <span className="mono-label">_DESTINATARIO: </span><span className="text-main">{selectedOrder.customerName} ({selectedOrder.customerEmail})</span><br/>
                                            <span className="mono-label">_TELÉFONO: </span><span className="text-main">{selectedOrder.customerPhone || 'NO_REGISTRADO'}</span><br/>
                                            <span className="mono-label">_DIRECCIÓN: </span><span className="text-main" style={{color: '#ccff00'}}>{selectedOrder.shippingAddress}</span>
                                        </div>
                                        <h3 className="mono-label text-dim mb-2">&gt; HARDWARE:</h3>
                                        <div className="items-manifest" style={{background: '#000', border: '1px solid #333', padding: '1rem', marginBottom: '2rem'}}>
                                            {selectedOrder.items?.map((item, idx) => (
                                                <div key={idx} style={{display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #111', padding: '0.5rem 0'}}>
                                                    <span className="text-main">&gt; {item.productName}</span><span className="text-accent font-bold">x{item.quantity}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end'}}>
                                            <button className="btn-brutal-alt text-red" onClick={() => setSelectedOrder(null)}>[ SALIR ]</button>
                                            <button className="btn-brutal-action" onClick={() => handlePackOrder(selectedOrder.orderId)}>[ PEDIDO EMPAQUETADO ]</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );

            // NUEVA PESTAÑA: HISTORIAL (Solo enviados)
            case 'history':
                return (
                    <div className="admin-panel">
                        <div className="table-header-controls">
                            <h2>HISTORIAL_DE_ENVÍOS.log</h2>
                            <input
                                type="text"
                                className="cyber-search"
                                placeholder="_buscar_por_id_o_correo..."
                                value={historySearch}
                                onChange={e => setHistorySearch(e.target.value)}
                            />
                        </div>

                        <div className="neo-table-container">
                            <table className="neo-table">
                                <thead><tr><th>ID_ORDEN</th><th>COMPRADOR</th><th>CORREO</th><th>TOTAL</th><th>FECHA_SISTEMA</th></tr></thead>
                                <tbody>
                                {filteredHistory.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center">NO HAY REGISTROS QUE COINCIDAN</td></tr>
                                ) : (
                                    filteredHistory.map(order => (
                                        <tr key={order.orderId} className="offline-row">
                                            <td className="text-dim">#{order.orderId}</td>
                                            <td className="text-dim">{order.customerName}</td>
                                            <td className="text-dim">{order.customerEmail}</td>
                                            <td className="text-dim">${order.totalAmount}</td>
                                            <td className="text-dim">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))
                                )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );

            // NUEVA PESTAÑA: CLIENTES (Agrupados por Correo)
            case 'customers':
                return (
                    <div className="admin-panel">
                        <div className="table-header-controls">
                            <h2>BASE_DE_DATOS_CLIENTES.exe</h2>
                            <input
                                type="text"
                                className="cyber-search"
                                placeholder="_buscar_cliente..."
                                value={customerSearch}
                                onChange={e => setCustomerSearch(e.target.value)}
                            />
                        </div>

                        <div className="neo-table-container">
                            <table className="neo-table">
                                <thead>
                                <tr>
                                    <th>NIVEL_ACCESO</th>
                                    <th>CORREO_ÚNICO (ID)</th>
                                    <th>ALIAS_PRINCIPAL</th>
                                    <th>PEDIDOS_TOTALES</th>
                                    <th>HARDWARE_COMPRADO</th>
                                    <th>INVERSIÓN_TOTAL</th>
                                </tr>
                                </thead>
                                <tbody>
                                {customerList.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center">BASE DE DATOS VACÍA</td></tr>
                                ) : (
                                    customerList.map((client, index) => (
                                        <tr key={client.email}>
                                            {/* Si ha gastado más de 100.000, le damos estatus VIP */}
                                            <td className={client.totalSpent > 100000 ? "text-accent font-bold" : "text-dim"}>
                                                {client.totalSpent > 100000 ? '[ VIP ]' : '[ ESTÁNDAR ]'}
                                            </td>
                                            <td className="text-cyan">{client.email}</td>
                                            <td className="text-main">{client.name}</td>
                                            <td className="text-center">{client.totalOrders}</td>
                                            <td className="text-center">{client.totalItems} UNIDADES</td>
                                            <td className="text-green font-bold">${client.totalSpent.toLocaleString()}</td>
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
            <aside className="admin-sidebar">
                <div className="sidebar-brand">
                    <span className="icon">⚙️</span>
                    <h2>SYS_ADMIN</h2>
                </div>
                <nav className="sidebar-nav">
                    <button className={activeTab === 'overview' ? 'active' : ''} onClick={() => setActiveTab('overview')}>&gt; GENERAL</button>
                    <button className={activeTab === 'inventory' ? 'active' : ''} onClick={() => setActiveTab('inventory')}>&gt; INVENTARIO</button>
                    <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>&gt; LOGÍSTICA</button>
                    {/* NUEVOS BOTONES DEL MENÚ */}
                    <button className={activeTab === 'history' ? 'active' : ''} onClick={() => setActiveTab('history')}>&gt; HISTORIAL_ENVÍOS</button>
                    <button className={activeTab === 'customers' ? 'active' : ''} onClick={() => setActiveTab('customers')}>&gt; BASE_CLIENTES</button>
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