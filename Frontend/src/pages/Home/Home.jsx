import React, { useState } from 'react'
import './Home.css'
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import FoodList from '../../components/FoodList/FoodList'

const Home = () => {
  const [category, setCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="page home">
      <Header/>
      <ExploreMenu category={category} setCategory={setCategory}/>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search dishes, categories, or ingredients"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <FoodList category={category} searchTerm={searchTerm}/>

   </div>
  )
}

export default Home
