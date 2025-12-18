import React from "react";
import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { items } = useCart();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (_err) {
      // Non-blocking; auth state listener will handle UI updates.
    }
  };

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
        <img src={assets.search_icon} alt="search" />
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
