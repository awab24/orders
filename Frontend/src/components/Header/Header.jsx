import React from 'react'
import './Header.css'
const Header = () => {
  const handleViewMenu = () => {
    const target = document.getElementById("menu-results");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div>
    <div className='header'>
      <div className="header-contents">
           <h2>order your favourite food here</h2>
        <p>choose from a diverse menu featuring a delectable array of dishes crafted with the finest ingredients and culinary expertise. Our mission is to satisfy your craving and elevate your dining experience, one delicious meal at a time. </p>
        <button type="button" onClick={handleViewMenu}>View Menu</button>
      </div>
    </div>
    </div>
  )
}

export default Header
