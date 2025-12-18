import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div>
          <h3>Contact us</h3>
          <p>Phone: +1 (415) 555-0137</p>
          <p>Email: hello@restaurantapp.test</p>
          <p>Address: 142 Market Street, San Francisco, CA</p>
        </div>
        <div>
          <h3>Hours</h3>
          <p>Mon–Fri: 11:00 AM – 10:00 PM</p>
          <p>Sat–Sun: 10:00 AM – 11:00 PM</p>
        </div>
        <div>
          <h3>Visit</h3>
          <p>Walk-ins welcome</p>
          <p>Reservations: available online</p>
          <p>Delivery: 11:30 AM – 9:30 PM</p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2025 Restaurant App. All rights reserved.</span>
      </div>
    </footer>
  );
};

export default Footer;
