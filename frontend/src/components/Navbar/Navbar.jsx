import React, { useContext, useEffect, useState } from 'react'
import './Navbar.css'
import { assets } from '../../assets/assets'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { StoreContext } from '../../Context/StoreContext'
import DarkModeToggle from '../DarkModeToggle/DarkModeToggle'
import SearchPopup from '../SearchPopup/SearchPopup'

const Navbar = ({ setShowLogin }) => {

  const [menu, setMenu] = useState("home");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { getTotalCartAmount, token ,setToken } = useContext(StoreContext);
  const navigate = useNavigate();
  const location = useLocation();

  const role = localStorage.getItem('role');
  
  // Handle navigation to sections (works from any page)
  const handleSectionClick = (sectionId) => {
    if (location.pathname !== '/') {
      // Navigate to home with hash, then scroll
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    } else {
      // Already on home page, just scroll
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };
  
  // Handle search - show search popup
  const handleSearchClick = () => {
    setShowSearch(true);
  };
  
  // Handle hash navigation when component mounts or location changes
  useEffect(() => {
    if (location.pathname === '/' && location.hash) {
      const sectionId = location.hash.substring(1); // Remove #
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [location]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken("");
    setShowDropdown(false);
    navigate('/')
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.navbar-profile')) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <>
      {showSearch && <SearchPopup setShowSearch={setShowSearch} />}
      <div className='navbar'>
        <Link to='/'><img className='logo' src={assets.logo} alt="" /></Link>
      <ul className="navbar-menu">
        {role === 'admin' ? (
          <>
            <Link to="/admin" onClick={() => setMenu("admin")} className={`${menu === "admin" ? "active" : ""}`}>Dashboard</Link>
            <Link to="/admin/add" onClick={() => setMenu("add")} className={`${menu === "add" ? "active" : ""}`}>Add Items</Link>
            <Link to="/admin/list" onClick={() => setMenu("list")} className={`${menu === "list" ? "active" : ""}`}>List Items</Link>
            <Link to="/admin/orders" onClick={() => setMenu("orders")} className={`${menu === "orders" ? "active" : ""}`}>Orders</Link>
          </>
        ) : (
          <>
            <Link to="/" onClick={() => setMenu("home")} className={`${menu === "home" ? "active" : ""}`}>home</Link>
            <a 
              href='#explore-menu' 
              onClick={(e) => {
                e.preventDefault();
                setMenu("menu");
                handleSectionClick("explore-menu");
              }} 
              className={`${menu === "menu" ? "active" : ""}`}
            >
              menu
            </a>
            <a 
              href='#app-download' 
              onClick={(e) => {
                e.preventDefault();
                setMenu("mob-app");
                handleSectionClick("app-download");
              }} 
              className={`${menu === "mob-app" ? "active" : ""}`}
            >
              mobile app
            </a>
            <a 
              href='#footer' 
              onClick={(e) => {
                e.preventDefault();
                setMenu("contact");
                handleSectionClick("footer");
              }} 
              className={`${menu === "contact" ? "active" : ""}`}
            >
              contact us
            </a>
          </>
        )}
      </ul>
      <div className="navbar-right">
        <DarkModeToggle />
        <img 
          src={assets.search_icon} 
          alt="Search" 
          onClick={handleSearchClick}
          style={{ cursor: 'pointer' }}
        />
        <Link to='/cart' className='navbar-search-icon'>
          <img src={assets.basket_icon} alt="" />
          <div className={getTotalCartAmount() > 0 ? "dot" : ""}></div>
        </Link>
        {!token ? <button onClick={() => setShowLogin(true)}>sign in</button>
          : <div className='navbar-profile'>
            <img src={assets.profile_icon} alt="" onClick={() => setShowDropdown(!showDropdown)} />
            {showDropdown && (
              <ul className='navbar-profile-dropdown'>
                {role !== 'admin' && (
                  <li onClick={() => { navigate('/myorders'); setShowDropdown(false); }}> <img src={assets.bag_icon} alt="" /> <p>Orders</p></li>
                )}
                {role !== 'admin' && <hr />}
                <li onClick={() => { role === 'admin' ? navigate('/admin/profile') : navigate('/profile'); setShowDropdown(false); }}> <img src={assets.profile_icon} alt="" /> <p>Profile</p></li>
                <hr />
                <li onClick={logout}> <img src={assets.logout_icon} alt="" /> <p>Logout</p></li> 
              </ul>
            )}
          </div>
        }

      </div>
      </div>
    </>
  )
}

export default Navbar
