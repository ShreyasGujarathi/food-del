import React, { useState, useContext } from 'react'
import Header from '../../../components/Header/Header'
import ExploreMenu from '../../../components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../../components/FoodDisplay/FoodDisplay'
import AppDownload from '../../../components/AppDownload/AppDownload'
import { StoreContext } from '../../../Context/StoreContext'
import { useNavigate } from 'react-router-dom'
import './Home.css'

const Home = () => {

  const [category,setCategory] = useState("All")
  const { getTotalCartAmount } = useContext(StoreContext)
  const navigate = useNavigate()

  return (
    <>
      <Header/>
      <ExploreMenu setCategory={setCategory} category={category}/>
      {getTotalCartAmount() > 0 && (
        <div className="home-checkout-float">
          <div className="home-checkout-content">
            <span className="home-checkout-text">Total: ₹{getTotalCartAmount()}</span>
            <button className="home-checkout-btn" onClick={() => navigate('/cart')}>
              Checkout
            </button>
          </div>
        </div>
      )}
      <FoodDisplay category={category}/>
      <AppDownload/>
    </>
  )
}

export default Home

