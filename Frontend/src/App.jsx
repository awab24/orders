import React from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home/Home";
import Cart from "./pages/Cart/Cart";
import PlaceOrder from "./pages/PlaceOrder/PlaceOrder";
import Auth from "./pages/Auth/Auth";
import RequireAuth from "./components/RequireAuth";

function App() {
  return (
    <div className="app">
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<Cart />} />
        <Route
          path="/order"
          element={
            <RequireAuth>
              <PlaceOrder />
            </RequireAuth>
          }
        />
        <Route path="/auth" element={<Auth />} />
      </Routes>

      <Footer />
    </div>
  );
}

export default App;
