import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import AdminDashboard from "./pages/AdminDashboard.jsx";
import './App.scss';
import Cart from './pages/Cart';
import { CartProvider } from './context/CartContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PaymentCommit from './pages/PaymentCommit';

function App() {
    return (
        // BrowserRouter envuelve toda tu app para activar la navegación
        <CartProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/payment/commit" element={<PaymentCommit />} />
                </Routes>
            </BrowserRouter>
            <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />
        </CartProvider>
    );
}

export default App;