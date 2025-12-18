import React, { useMemo, useState } from "react";
import "./PlaceOrder.css";
import { useCart } from "../../context/CartContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const PlaceOrder = () => {
  const { items, total, clearCart } = useCart();
  const [customer, setCustomer] = useState({ name: "", email: "", phone: "" });
  const [reservation, setReservation] = useState({ reservation_date: "", party_size: "" });
  const [status, setStatus] = useState({ loading: false, message: "", error: "" });

  const orderItems = useMemo(
    () => items.map((i) => ({ item_id: i.item_id, quantity: i.quantity })),
    [items]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orderItems.length) {
      setStatus({ loading: false, message: "", error: "Add at least one item to order." });
      return;
    }

    setStatus({ loading: true, message: "", error: "" });
    try {
      const orderRes = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer,
          items: orderItems,
          payment_method: "cash",
          status: "pending"
        })
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || "Failed to place order");

      if (reservation.reservation_date && reservation.party_size) {
        await fetch(`${API_URL}/api/reservations`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer,
            reservation_date: reservation.reservation_date,
            party_size: Number(reservation.party_size)
          })
        });
      }

      clearCart();
      setStatus({ loading: false, message: "Order placed successfully!", error: "" });
    } catch (err) {
      setStatus({ loading: false, message: "", error: err.message });
    }
  };

  return (
    <div className="page place-order">
      <h2>Checkout</h2>
      <form onSubmit={handleSubmit} className="checkout-form">
        <section>
          <h3>Contact</h3>
          <label>
            Name
            <input
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              required
            />
          </label>
          <label>
            Email
            <input
              type="email"
              value={customer.email}
              onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
              required
            />
          </label>
          <label>
            Phone
            <input
              value={customer.phone}
              onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
            />
          </label>
        </section>

        <section>
          <h3>Reservation (optional)</h3>
          <label>
            Date & time
            <input
              type="datetime-local"
              value={reservation.reservation_date}
              onChange={(e) => setReservation({ ...reservation, reservation_date: e.target.value })}
            />
          </label>
          <label>
            Party size
            <input
              type="number"
              min="1"
              value={reservation.party_size}
              onChange={(e) => setReservation({ ...reservation, party_size: e.target.value })}
            />
          </label>
        </section>

        <section className="summary">
          <h3>Summary</h3>
          <p>Items: {items.length}</p>
          <p className="total">Total: ₺{total.toFixed(2)}</p>
          <button type="submit" disabled={status.loading}>
            {status.loading ? "Processing..." : "Place order"}
          </button>
          {status.message && <p className="success">{status.message}</p>}
          {status.error && <p className="error-text">{status.error}</p>}
        </section>
      </form>
    </div>
  );
};

export default PlaceOrder;
