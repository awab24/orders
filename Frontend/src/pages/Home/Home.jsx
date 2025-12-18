import React, { useEffect, useRef, useState } from 'react'
import './Home.css'
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import FoodList from '../../components/FoodList/FoodList'
import { useSearch } from "../../context/SearchContext";

const Home = () => {
  const [category, setCategory] = useState("All");
  const { searchTerm } = useSearch();
  const resultsRef = useRef(null);

  useEffect(() => {
    if (!searchTerm.trim()) return;
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [searchTerm]);

  return (
    <div className="page home">
      <Header/>
      <ExploreMenu category={category} setCategory={setCategory}/>
      <div id="menu-results" ref={resultsRef}>
        <FoodList category={category} searchTerm={searchTerm}/>
      </div>

   </div>
  )
}

export default Home
