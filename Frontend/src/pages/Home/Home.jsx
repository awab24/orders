import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import Header from "../../components/Header/Header";
import ExploreMenu from "../../components/ExploreMenu/ExploreMenu";
import FoodList from "../../components/FoodList/FoodList";
import { useSearch } from "../../context/SearchContext";
import { useAuth } from "../../context/AuthContext";

const Home = () => {
  const [category, setCategory] = useState("All");
  const { searchTerm } = useSearch();
  const { role } = useAuth();
  const resultsRef = useRef(null);

  useEffect(() => {
    if (!searchTerm.trim()) return;
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [searchTerm]);

  return (
    <div className="page home">
      <Header/>
      {role === "admin" && (
        <Link className="admin-add-button" to="/admin/menu-items/new" aria-label="Add menu item">
          +
        </Link>
      )}
      <ExploreMenu category={category} setCategory={setCategory}/>
      <div id="menu-results" ref={resultsRef}>
        <FoodList category={category} searchTerm={searchTerm}/>
      </div>

   </div>
  )
}

export default Home
