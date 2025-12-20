import React, { useEffect, useState } from "react";
import "./AdminOrders.css";
import { supabase } from "../../lib/supabaseClient";

const STATUS_OPTIONS = ["pending", "preparing", "ready", "delivered", "cancelled"];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState(null);

  const loadOrders = async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from("orders")
      .select("*, order_items(*), payments(*)")
      .order("order_date", { ascending: false });
    if (fetchError) {
      setError(fetchError.message);
      setOrders([]);
    } else {
      setOrders(data || []);
      setError("");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId, nextStatus) => {
    setSavingId(orderId);
    const { data, error: updateError } = await supabase
      .from("orders")
      .update({ status: nextStatus })
      .eq("order_id", orderId)
      .select()
      .single();
    if (updateError) {
      setError(updateError.message);
    } else {
      setOrders((prev) => prev.map((order) => (order.order_id === orderId ? data : order)));
      setError("");
    }
    setSavingId(null);
  };

  if (loading) return <p className="muted">Loading orders...</p>;
  if (error) return <p className="error-text">Failed to load orders: {error}</p>;
  if (!orders.length) return <p className="muted">No orders yet.</p>;

  return (
    <div className="admin-orders page">
      <div className="admin-orders-header">
        <h2>Orders</h2>
        <button type="button" onClick={loadOrders} className="refresh-btn">
          Refresh
        </button>
      </div>
      <div className="admin-orders-list">
        {orders.map((order) => (
          <article className="admin-order-card" key={order.order_id}>
            <div className="admin-order-meta">
              <div>
                <p className="label">Order</p>
                <p className="value">#{order.order_id}</p>
              </div>
              <div>
                <p className="label">Date</p>
                <p className="value">{new Date(order.order_date).toLocaleString()}</p>
              </div>
              <div>
                <p className="label">Total</p>
                <p className="value">${Number(order.total_amount || 0).toFixed(2)}</p>
              </div>
              <div>
                <p className="label">Items</p>
                <p className="value">{order.order_items?.length || 0}</p>
              </div>
            </div>
            <div className="admin-order-actions">
              <label>
                Status
                <select
                  value={order.status || "pending"}
                  onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                  disabled={savingId === order.order_id}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              {savingId === order.order_id && <span className="muted">Saving...</span>}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default AdminOrders;
