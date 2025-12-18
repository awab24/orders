import React, { useEffect, useMemo, useState } from "react";
import "./FoodList.css";
import { assets, food_list } from "../../assets/assets";
import { useCart } from "../../context/CartContext";
import { supabase } from "../../lib/supabaseClient";

const FoodList = ({ category, searchTerm = "" }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToCart } = useCart();

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      const { data, error: supabaseError } = await supabase.from("menu_items").select("*").order("name");
      if (!active) return;
      if (supabaseError) {
        setError(supabaseError.message);
      } else {
        setItems(data || []);
        setError("");
      }
      setLoading(false);
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    let result = items;
    if (category !== "All") {
      result = result.filter((item) => item.category?.toLowerCase() === category.toLowerCase());
    }

    const query = searchTerm.trim().toLowerCase();
    if (query) {
      result = result.filter((item) => {
        const nameMatch = item.name?.toLowerCase().includes(query);
        const descriptionMatch = item.description?.toLowerCase().includes(query);
        const categoryMatch = item.category?.toLowerCase().includes(query);
        return nameMatch || descriptionMatch || categoryMatch;
      });
    }

    return result;
  }, [items, category, searchTerm]);

  const hasQuery = searchTerm.trim().length > 0;

  if (loading) return <p className="muted">Loading menu...</p>;
  if (error) return <p className="error-text">Failed to load menu: {error}</p>;
  if (!filtered.length) {
    return <p className="muted">{hasQuery ? "No items match your search." : "No items in this category yet."}</p>;
  }

  return (
    <div className="food-grid">
      {filtered.map((item) => (
        <article className="food-card" key={item.item_id}>
          <img src={getImageForCategory(item.category)} alt={item.name} className="food-img" />
          <div className="food-content">
            <div className="food-head">
              <h3>{item.name}</h3>
              <span className="price">ƒ'§{Number(item.price).toFixed(2)}</span>
            </div>
            <p className="description">{item.description}</p>
            <div className="food-meta">
              <span className="pill">{item.category}</span>
              <button onClick={() => addToCart(item)} className="add-btn">
                Add to cart
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
};

function getImageForCategory(category) {
  const match = food_list.find((food) => food.category.toLowerCase() === category?.toLowerCase());
  return match?.image || assets.parcel_icon;
}

export default FoodList;
