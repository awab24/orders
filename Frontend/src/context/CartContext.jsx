import React, { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({});

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev[item.item_id] || { ...item, quantity: 0 };
      return {
        ...prev,
        [item.item_id]: { ...existing, quantity: existing.quantity + 1 }
      };
    });
  };

  const updateQuantity = (itemId, quantity) => {
    setCart((prev) => {
      if (quantity <= 0) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: { ...prev[itemId], quantity } };
    });
  };

  const clearCart = () => setCart({});

  const items = useMemo(() => Object.values(cart), [cart]);
  const total = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.price || 0) * item.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider value={{ cart, items, total, addToCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
