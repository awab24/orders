import React, { useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import "./AddMenuItem.css";

const AddMenuItem = () => {
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    image_url: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    if (!form.name.trim() || !form.price) {
      setMessage("Name and price are required.");
      return;
    }

    setSubmitting(true);
    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      category: form.category.trim() || null,
      description: form.description.trim() || null,
      image_url: form.image_url.trim() || null,
    };

    const { error } = await supabase.from("menu_items").insert(payload);
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Menu item created.");
      setForm({
        name: "",
        price: "",
        category: "",
        description: "",
        image_url: "",
      });
    }
    setSubmitting(false);
  };

  return (
    <div className="page add-menu-item">
      <h2>Add menu item</h2>
      <p className="muted">Admins only.</p>

      <form className="add-menu-form" onSubmit={handleSubmit}>
        <label>
          Name
          <input
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="Chicken Shawarma"
          />
        </label>

        <label>
          Price
          <input
            name="price"
            type="number"
            step="0.01"
            value={form.price}
            onChange={handleChange}
            placeholder="65.00"
          />
        </label>

        <label>
          Category
          <input
            name="category"
            type="text"
            value={form.category}
            onChange={handleChange}
            placeholder="Rolls"
          />
        </label>

        <label>
          Description
          <textarea
            name="description"
            rows="4"
            value={form.description}
            onChange={handleChange}
            placeholder="Short description"
          />
        </label>

        <label>
          Image URL
          <input
            name="image_url"
            type="url"
            value={form.image_url}
            onChange={handleChange}
            placeholder="https://..."
          />
        </label>

        <button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : "Add item"}
        </button>
        {message && <p className="form-message">{message}</p>}
      </form>
    </div>
  );
};

export default AddMenuItem;
