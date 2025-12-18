import React from "react";
import { Link, NavLink } from "react-router-dom";
import "./Navbar.css";
import { assets } from "../../assets/assets";
import { useCart } from "../../context/CartContext";

const Navbar = () => {
  const { items } = useCart();

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
        <button type="button">Sign in</button>
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
