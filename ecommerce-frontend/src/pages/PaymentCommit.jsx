import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import './Cart.scss'; // Reutilizamos los estilos brutalistas

function PaymentCommit() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token_ws = searchParams.get('token_ws');
    const [status, setStatus] = useState('PROCESANDO'); // PROCESANDO, OK, ERROR

    useEffect(() => {
        const confirmPayment = async () => {
            if (!token_ws) {
                navigate('/cart');
                return;
            }

            try {
                // Le enviamos el token a Java para que haga el COMMIT con Transbank
                await api.post(`/payments/commit?token_ws=${token_ws}`);
                setStatus('OK');
            } catch (error) {
                setStatus('ERROR');
            }
        };

        confirmPayment();
    }, [token_ws, navigate]);

    return (
        <div className="neo-cart-page" style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div className="neo-form-box" style={{ textAlign: 'center', maxWidth: '500px' }}>

                {status === 'PROCESANDO' && (
                    <>
                        <h2 className="text-accent blink">/// VALIDANDO_TRANSACCIÓN ///</h2>
                        <p className="mono-label">Por favor no cierre esta ventana. Validando hash criptográfico con el banco...</p>
                    </>
                )}

                {status === 'OK' && (
                    <>
                        <h2 className="text-green">/// PAGO_CONFIRMADO ///</h2>
                        <p className="mono-label">La transacción ha sido validada. Su paquete será enviado a la brevedad.</p>
                        <button className="btn-brutal-action mt-2" onClick={() => navigate('/home')}>
                            [ RETORNAR_AL_SISTEMA ]
                        </button>
                    </>
                )}

                {status === 'ERROR' && (
                    <>
                        <h2 className="text-red">/// PAGO_RECHAZADO ///</h2>
                        <p className="mono-label">La transacción fue abortada o rechazada por la red bancaria.</p>
                        <button className="btn-brutal-alt text-red mt-2" onClick={() => navigate('/cart')}>
                            [ VOLVER_AL_CARRITO ]
                        </button>
                    </>
                )}

            </div>
        </div>
    );
}

export default PaymentCommit;