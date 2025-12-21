import React, { useEffect, useMemo, useState } from "react";
import { API_URL } from "../../../lib/config";
import { useAuth } from "../../../context/AuthContext";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const { session } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleForm, setRoleForm] = useState({ email: "", user_id: "", role: "admin" });
  const [roleMessage, setRoleMessage] = useState("");

  const authHeaders = useMemo(() => {
    if (!session?.access_token) return {};
    return { Authorization: `Bearer ${session.access_token}` };
  }, [session]);

  const loadOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/orders`, { headers: authHeaders });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load orders");
      setOrders(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [session]);

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === "pending").length;
    const completed = orders.filter((o) => o.status === "completed").length;
    const revenue = orders.reduce((sum, o) => sum + Number(o.total_amount || 0), 0);
    return { total, pending, completed, revenue };
  }, [orders]);

  const getItemCount = (order) =>
    (order.order_items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);

  const visibleOrders = useMemo(() => {
    let result = [...orders];

    if (statusFilter !== "all") {
      result = result.filter((o) => o.status === statusFilter);
    }

    if (sortBy === "highest_price") {
      result.sort((a, b) => Number(b.total_amount || 0) - Number(a.total_amount || 0));
    } else if (sortBy === "highest_sold") {
      result.sort((a, b) => getItemCount(b) - getItemCount(a));
    } else {
      result.sort((a, b) => new Date(b.order_date) - new Date(a.order_date));
    }

    return result;
  }, [orders, sortBy, statusFilter]);

  const updateStatus = async (orderId, status) => {
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update order");
      setOrders((prev) => prev.map((o) => (o.order_id === orderId ? data : o)));
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm("Delete this order? This cannot be undone.")) return;
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/admin/orders/${orderId}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete order");
      setOrders((prev) => prev.filter((o) => o.order_id !== orderId));
    } catch (err) {
      setError(err.message);
    }
  };

  const updateUserRole = async (event) => {
    event.preventDefault();
    setRoleMessage("");
    if (!roleForm.email.trim() && !roleForm.user_id.trim()) {
      setRoleMessage("Provide an email or user id.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/admin/users/role`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({
          email: roleForm.email.trim() || null,
          user_id: roleForm.user_id.trim() || null,
          role: roleForm.role,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update role");
      setRoleMessage(`Role updated for user ${data.user_id || data.user?.id || ""}`);
      setRoleForm({ email: "", user_id: "", role: roleForm.role });
    } catch (err) {
      setRoleMessage(err.message);
    }
  };

  return (
    <div className="page admin-dashboard">
      <div className="admin-header">
        <h2>Admin dashboard</h2>
        <button type="button" onClick={loadOrders} className="ghost-btn">
          Refresh
        </button>
      </div>

      <div className="admin-stats">
        <div className="stat-card">
          <p>Total orders</p>
          <h3>{stats.total}</h3>
        </div>
        <div className="stat-card">
          <p>Pending</p>
          <h3>{stats.pending}</h3>
        </div>
        <div className="stat-card">
          <p>Completed</p>
          <h3>{stats.completed}</h3>
        </div>
        <div className="stat-card">
          <p>Revenue</p>
          <h3>{stats.revenue.toFixed(2)}</h3>
        </div>
      </div>

      <div className="admin-panel">
        <div className="panel-header">
          <h3>Order management</h3>
          <div className="panel-controls">
            <label>
              Status
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
              </select>
            </label>
            <label>
              Sort by
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="newest">Newest</option>
                <option value="highest_price">Highest price</option>
                <option value="highest_sold">Highest sold</option>
              </select>
            </label>
          </div>
        </div>

        {error && <p className="error-text">{error}</p>}
        {loading && <p className="muted">Loading orders...</p>}
        {!loading && !visibleOrders.length && <p className="muted">No orders found.</p>}

        {!loading && visibleOrders.length > 0 && (
          <div className="orders-table">
            <div className="orders-row orders-head">
              <span>Order</span>
              <span>Items</span>
              <span>Total</span>
              <span>Status</span>
              <span>Actions</span>
            </div>
            {visibleOrders.map((order) => (
              <div className="orders-row" key={order.order_id}>
                <span>
                  <strong>#{order.order_id}</strong>
                  <small>{new Date(order.order_date).toLocaleString()}</small>
                </span>
                <span>{getItemCount(order)}</span>
                <span>{Number(order.total_amount || 0).toFixed(2)}</span>
                <span className={`status-pill ${order.status || "pending"}`}>{order.status}</span>
                <span className="actions">
                  <button
                    type="button"
                    onClick={() => updateStatus(order.order_id, "completed")}
                    className="primary-btn"
                  >
                    Complete
                  </button>
                  <button
                    type="button"
                    onClick={() => updateStatus(order.order_id, "pending")}
                    className="ghost-btn"
                  >
                    Pending
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteOrder(order.order_id)}
                    className="danger-btn"
                  >
                    Delete
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="admin-panel">
        <h3>Role management</h3>
        <p className="muted">Promote or change a user role by email or user id.</p>
        <form className="role-form" onSubmit={updateUserRole}>
          <label>
            User email
            <input
              type="email"
              value={roleForm.email}
              onChange={(e) => setRoleForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="user@example.com"
            />
          </label>
          <label>
            User id
            <input
              type="text"
              value={roleForm.user_id}
              onChange={(e) => setRoleForm((prev) => ({ ...prev, user_id: e.target.value }))}
              placeholder="UUID"
            />
          </label>
          <label>
            Role
            <select
              value={roleForm.role}
              onChange={(e) => setRoleForm((prev) => ({ ...prev, role: e.target.value }))}
            >
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="customer">Customer</option>
            </select>
          </label>
          <button type="submit" className="primary-btn">
            Update role
          </button>
        </form>
        {roleMessage && <p className="muted">{roleMessage}</p>}
      </div>
    </div>
  );
};

export default AdminDashboard;
