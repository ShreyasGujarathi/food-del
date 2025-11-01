import React, { useState, useEffect } from 'react'
import './Navbar.css'
import { assets } from '../../../assets/assets'
import { Link, useNavigate } from 'react-router-dom'
import DarkModeToggle from '../../DarkModeToggle/DarkModeToggle'

const AdminNavbar = () => {
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setShowDropdown(false);
    navigate('/');
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.admin-navbar-right')) {
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
    <div className='navbar admin-navbar'>
      <Link to='/admin'><img className='logo' src={assets.logo} alt="" /></Link>
      <div className="admin-navbar-right">
        <DarkModeToggle />
        <span>Admin Panel</span>
        <div style={{ position: 'relative' }}>
          <img 
            className='profile' 
            src={assets.profile_image} 
            alt="" 
            onClick={() => setShowDropdown(!showDropdown)} 
            style={{cursor: 'pointer'}} 
          />
          {showDropdown && (
            <ul className='admin-profile-dropdown'>
              <li onClick={() => { navigate('/admin/profile'); setShowDropdown(false); }}>
                <img src={assets.profile_icon} alt="" /> <p>Profile</p>
              </li>
              <hr />
              <li onClick={logout}>
                <img src={assets.logout_icon} alt="" /> <p>Logout</p>
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminNavbar

