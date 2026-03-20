import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { toast } from 'react-toastify';
import api from '../services/api';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import './Cart.scss';

function Cart() {
    const { cart, clearCart, removeFromCart } = useContext(CartContext);
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);


    // Datos del cliente para el envío
    const [customerData, setCustomerData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'Chile' // Valor por defecto
    });

    const totalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    const handleCheckout = async (e) => {
        e.preventDefault();
        if (cart.length === 0) return;

        setIsProcessing(true);

        try {
            // 1. PRIMERO: CREAMOS EL PERFIL DE CLIENTE (Customer)
            const customerPayload = {
                firstName: customerData.firstName,
                lastName: customerData.lastName,
                email: customerData.email,
                phone: customerData.phone,
                street: customerData.street,
                city: customerData.city,
                zipCode: customerData.zipCode
            };

            try {
                await api.post('/customers', customerPayload);
                console.log("/// PERFIL DE CLIENTE CREADO/ACTUALIZADO");
            } catch (custError) {
                console.log("/// AVISO: El perfil de cliente podría ya existir o hubo un problema menor.", custError.response?.data);
            }

            // 2. SEGUNDO: ENVIAMOS LA ORDEN DE COMPRA (Order)
            // Agrupamos la calle, ciudad y código postal en un solo String para el "shippingAddress" de Java
            const direccionCompleta = `${customerData.street}, ${customerData.city}, CP: ${customerData.zipCode}`;

            const orderPayload = {
                items: cart.map(item => ({
                    productoId: item.id,
                    quantity: item.quantity
                })),
                shippingAddress: direccionCompleta // ¡NUEVO! Enviamos la dirección al backend
            };

            const orderResponse = await api.post('/orders', orderPayload);
            const orderId = orderResponse.data.orderId;

            console.log(`/// ORDEN #${orderId} GENERADA EN LA BASE DE DATOS`);
            toast.info('// INICIANDO_PROTOCOLO_TRANSBANK...');

            // 3. TERCERO: PEDIR EL LINK DE PAGO A TRANSBANK
            const tbkRes = await api.post(`/payments/init/${orderId}`);

            // 4. MAGIA: TELETRANSPORTAR AL USUARIO A WEBPAY
            // Creamos un formulario invisible en el HTML
            const form = document.createElement('form');
            form.action = tbkRes.data.url; // La URL segura de Transbank
            form.method = 'POST';

            // Le inyectamos el Token (La llave de la transacción)
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'token_ws';
            input.value = tbkRes.data.token;

            form.appendChild(input);
            document.body.appendChild(form);

            // Limpiamos el carrito local porque el usuario ya se va a pagar
            clearCart();

            // ¡Despegue! Esto recargará la página hacia Transbank
            form.submit();

        } catch (error) {
            console.error("/// REPORTE DE RECHAZO DEL SERVIDOR:", error.response?.data);
            toast.error(`// ERROR_CRÍTICO: No se pudo conectar con la pasarela de pago.`);
            setIsProcessing(false);
        }
    };

    return (
        <div className="neo-cart-page">
            <Header />

            <main className="cart-container">
                <div className="cart-header">
                    <span className="status-dot"></span>
                    <h2>TERMINAL_DE_PAGO.exe</h2>
                </div>

                {cart.length === 0 ? (
                    <div className="empty-cart-box">
                        <h3>[ MEMORIA_VACÍA ]</h3>
                        <p className="mono-label">No hay elementos en cola para procesar.</p>
                        <button className="btn-brutal" onClick={() => navigate('/home')}>&lt; RETORNAR_AL_CATÁLOGO</button>
                    </div>
                ) : (
                    <form className="cart-grid" onSubmit={handleCheckout}>

                        {/* Columna Izquierda: Productos y Formulario de Envío */}
                        <div className="checkout-details">

                            <div className="cart-items">
                                <div className="table-header">
                                    <span className="col-desc">_ITEM</span>
                                    <span className="col-qty">_CANT</span>
                                    <span className="col-price">_SUBTOTAL</span>
                                </div>

                                {cart.map((item, index) => (
                                    <div key={index} className="cart-row" style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                                        <div className="col-desc">
                                            <h4>{item.name}</h4>
                                            <span className="mono-label">ID:{item.id} // P.U: ${item.price}</span>
                                        </div>
                                        <div className="col-qty">
                                            <span className="qty-box">x{item.quantity}</span>
                                        </div>
                                        <div className="col-price" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <span className="text-cyan">${(item.price * item.quantity).toFixed(2)}</span>

                                            {/* NUEVO BOTÓN DE ELIMINAR */}
                                            <button
                                                type="button"
                                                onClick={() => removeFromCart(item.id)}
                                                style={{
                                                    background: 'transparent',
                                                    border: '1px solid #ff003c',
                                                    color: '#ff003c',
                                                    fontFamily: '"Space Mono", monospace',
                                                    fontWeight: 'bold',
                                                    cursor: 'pointer',
                                                    padding: '0.2rem 0.5rem',
                                                    transition: '0.2s'
                                                }}
                                                onMouseOver={(e) => { e.target.style.background = '#ff003c'; e.target.style.color = '#fff'; }}
                                                onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#ff003c'; }}
                                            >
                                                [ X ]
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Formulario de Envío Brutalista */}
                            <div className="shipping-form neo-form-box">
                                <h3 className="text-accent">/// DATOS_DE_ENVÍO</h3>

                                <div className="form-grid">
                                    <div className="input-group">
                                        <label>_NOMBRES</label>
                                        <input required value={customerData.firstName} onChange={e => setCustomerData({...customerData, firstName: e.target.value})} placeholder="Ej. John" />
                                    </div>
                                    <div className="input-group">
                                        <label>_APELLIDOS</label>
                                        <input required value={customerData.lastName} onChange={e => setCustomerData({...customerData, lastName: e.target.value})} placeholder="Ej. Doe" />
                                    </div>
                                    <div className="input-group full-width">
                                        <label>_EMAIL_DE_CONTACTO</label>
                                        <input required type="email" value={customerData.email} onChange={e => setCustomerData({...customerData, email: e.target.value})} placeholder="usuario@sistema.com" />
                                    </div>
                                    <div className="input-group full-width">
                                        <label>_TELÉFONO</label>
                                        <input required value={customerData.phone} onChange={e => setCustomerData({...customerData, phone: e.target.value})} placeholder="+56 9 1234 5678" />
                                    </div>
                                    <div className="input-group full-width">
                                        <label>_DIRECCIÓN_FÍSICA (Calle y Número)</label>
                                        <input required value={customerData.street} onChange={e => setCustomerData({...customerData, street: e.target.value})} placeholder="Av. Siempre Viva 742" />
                                    </div>
                                    <div className="input-group">
                                        <label>_CIUDAD</label>
                                        <input required value={customerData.city} onChange={e => setCustomerData({...customerData, city: e.target.value})} placeholder="Santiago" />
                                    </div>
                                    <div className="input-group">
                                        <label>_CÓDIGO_POSTAL</label>
                                        <input required value={customerData.zipCode} onChange={e => setCustomerData({...customerData, zipCode: e.target.value})} placeholder="8320000" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Columna Derecha: Recibo */}
                        <div className="receipt-box">
                            <h3 className="receipt-title">/// RECIBO_PRELIMINAR</h3>

                            <div className="receipt-lines">
                                <div className="line"><span className="mono-label">_SUBTOTAL:</span> <span>${totalAmount.toFixed(2)}</span></div>
                                <div className="line"><span className="mono-label">_IMPUESTOS_RED:</span> <span>CALCULANDO...</span></div>
                                <div className="line divider"></div>
                                <div className="line total">
                                    <span className="mono-label">_TOTAL_A_PAGAR:</span>
                                    <span className="text-accent">${totalAmount.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn-checkout"
                                disabled={isProcessing}
                            >
                                {isProcessing ? '[ CONECTANDO_A_LA_RED... ]' : '[ EJECUTAR_PAGO_SEGURO ]'}
                            </button>
                        </div>
                    </form>
                )}
            </main>

            <Footer />
        </div>
    );
}

export default Cart;