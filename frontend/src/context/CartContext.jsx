import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('cartItems');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      // Auto-correct any legacy items that were saved with the wrong headphone fallback image
      return parsed.map((item) => {
        if (item.image && item.image.includes('photo-1505740420928') && item.title?.toLowerCase().includes('shoe')) {
          return { ...item, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80' };
        }
        return item;
      });
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, qty = 1) => {
    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item._id === product._id);
      const resolvedImage =
        product.image ||
        (Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null) ||
        (product.title?.toLowerCase().includes('shoe')
          ? 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80');

      if (existingIndex > -1) {
        const updated = [...prevItems];
        const newQty = updated[existingIndex].qty + qty;
        updated[existingIndex] = {
          ...updated[existingIndex],
          qty: Math.min(newQty, product.stock || 99),
          image: resolvedImage || updated[existingIndex].image,
        };
        return updated;
      } else {
        return [
          ...prevItems,
          {
            _id: product._id,
            title: product.title,
            price: product.discountPrice > 0 ? product.discountPrice : product.price,
            originalPrice: product.price,
            image: resolvedImage,
            stock: product.stock,
            qty: Math.min(qty, product.stock || 1),
          },
        ];
      }
    });
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item._id !== id));
  };

  const updateQty = (id, qty) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item._id === id ? { ...item, qty } : item))
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cartItems');
  };

  // Calculations
  const itemsCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shippingPrice = itemsPrice > 150 || itemsPrice === 0 ? 0 : 15;
  const taxPrice = Number((0.08 * itemsPrice).toFixed(2));
  const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

  return (
    <CartContext.Provider
      value={{
        cartItems,
        itemsCount,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
