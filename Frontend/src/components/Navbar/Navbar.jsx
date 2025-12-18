import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useSearch } from "../../context/SearchContext";

const Navbar = () => {
  const { items } = useCart();
  const { user, signOut } = useAuth();
  const { searchTerm, setSearchTerm } = useSearch();
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef(null);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (_err) {
      // Non-blocking; auth state listener will handle UI updates.
    }
  };

  const toggleSearch = () => {
    setSearchOpen((prev) => !prev);
  };

  useEffect(() => {
    if (searchOpen) {
      inputRef.current?.focus();
    }
  }, [searchOpen]);

  return (
    <div className="navbar">
      <Link to="/">
        <img src={assets.logo} alt="Restaurant logo" className="logo" />
      </Link>
      <ul className="navbar-menu">
        <NavItem to="/" label="Home" />
        <NavItem to="/order" label="Order" />
        <NavItem to="/cart" label="Cart" />
      </ul>
      <div className="navbar-right">
        <div className={`navbar-search ${searchOpen ? "open" : ""}`}>
          <button type="button" className="icon-btn" onClick={toggleSearch} aria-label="Search">
            <img src={assets.search_icon} alt="search" />
          </button>
          {searchOpen && (
            <input
              ref={inputRef}
              type="text"
              placeholder="Search menu"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          )}
        </div>
        <Link to="/cart" className="navbar-search-icon">
          <img src={assets.basket_icon} alt="basket" />
          {items.length > 0 && <div className="dot">{items.length}</div>}
        </Link>
        {user ? (
          <div className="navbar-user">
            <span className="user-email">{user.email}</span>
            <button type="button" onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        ) : (
          <Link to="/auth" className="auth-link">
            Sign in
          </Link>
        )}
      </div>
    </div>
  );
};

const NavItem = ({ to, label }) => (
  <li>
    <NavLink to={to} className={({ isActive }) => (isActive ? "active" : "")}>
      {label}
    </NavLink>
  </li>
);

export default Navbar;
