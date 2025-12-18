import React from "react";
import { Link } from "react-router-dom";
import "./Cart.css";
import { useCart } from "../../context/CartContext";

const Cart = () => {
  const { items, total, updateQuantity } = useCart();

  if (!items.length) {
    return (
      <div className="page cart-page">
        <h2>Your cart is empty</h2>
        <p className="muted">Add some dishes from the menu to get started.</p>
        <Link className="primary" to="/">
          Browse menu
        </Link>
      </div>
    );
  }

  return (
    <div className="page cart-page">
      <h2>Cart</h2>
      <div className="cart-list">
        {items.map((item) => (
          <div className="cart-item" key={item.item_id}>
            <div>
              <h3>{item.name}</h3>
              <p className="muted">{item.category}</p>
            </div>
            <div className="cart-actions">
              <span className="price">₺{Number(item.price).toFixed(2)}</span>
              <input
                type="number"
                min="0"
                value={item.quantity}
                onChange={(e) => updateQuantity(item.item_id, Number(e.target.value))}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="cart-summary">
        <p>Items: {items.length}</p>
        <p className="total">Total: ₺{total.toFixed(2)}</p>
      </div>
      <Link className="primary" to="/order">
        Continue to checkout
      </Link>
    </div>
  );
};

export default Cart;
