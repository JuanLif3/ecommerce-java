import { createContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

// * Creamos el contexto (La mochila vacía)
export const CartContext = createContext();

// * Creamos el Proveedor (El encargado de ponerle la mochila a la app)
export function CartProvider({ children }) {
    // ! Aquí guardaremos los productos que el usuario agregue
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('neo_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        localStorage.setItem('neo_cart', JSON.stringify(cart));
    }, [cart]);


    // * Función para agregar un producto al carrito
    const addToCart = (product) => {
        setCart((prevCart) => {
            const exists = prevCart.find((item) => item.id === product.id);
            if (exists) {
                return prevCart.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                return [...prevCart, { ...product, quantity: 1 }];
            }
        });

        toast.success(`// [ + ] ${product.name} AÑADIDO`);
    };

    // ! Función para vaciar el carrito (la usaremos luego al pagar)
    const clearCart = () => {
        setCart([]);
        localStorage.removeItem('neo_cart'); // También lo borramos del disco
    };

    // * Compartimos el carrito y las funciones con toda la app
    return (
        <CartContext.Provider value={{ cart, addToCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
}