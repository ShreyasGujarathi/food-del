import React, { useContext, useState, useEffect } from 'react'
import './Profile.css'
import { StoreContext } from '../../../Context/StoreContext'
import { assets } from '../../../assets/assets'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const Profile = () => {
  const { url, token, setToken, currency } = useContext(StoreContext)
  const navigate = useNavigate()
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    role: 'user'
  })
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      if (token) {
        try {
          // Decode token to get user info
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          }).join(''));
          const decoded = JSON.parse(jsonPayload);
          
          // Fetch user details and orders
          try {
            const [userResponse, ordersResponse] = await Promise.all([
              axios.post(`${url}/api/user/get`, { userId: decoded.id }, { headers: { token } }).catch(() => ({ data: { success: false } })),
              axios.post(`${url}/api/order/userorders`, {}, { headers: { token } })
            ]);

            if (userResponse.data.success) {
              setUserData({
                name: userResponse.data.data?.name || 'User',
                email: userResponse.data.data?.email || '',
                role: localStorage.getItem('role') || decoded.role || 'user'
              });
              localStorage.setItem('userName', userResponse.data.data?.name || 'User');
            } else {
              // Fallback if endpoint doesn't exist
              setUserData({
                name: localStorage.getItem('userName') || 'User',
                email: '',
                role: localStorage.getItem('role') || decoded.role || 'user'
              });
            }

            if (ordersResponse && ordersResponse.data.success) {
              setOrders(ordersResponse.data.data || []);
            }
          } catch (error) {
            // Fallback
            setUserData({
              name: localStorage.getItem('userName') || 'User',
              email: '',
              role: localStorage.getItem('role') || decoded.role || 'user'
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [token, url]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken("");
    navigate('/');
    toast.success("Logged out successfully");
  };

  if (loading) {
    return <div className="profile-loading">Loading...</div>;
  }

  if (!token) {
    return (
      <div className="profile-container">
        <div className="profile-error">
          <h2>Please Login</h2>
          <p>You need to be logged in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img src={assets.profile_icon} alt="Profile" className="profile-avatar" />
        <div className="profile-info">
          <h1>{userData.name}</h1>
          <p className="profile-email">{userData.email}</p>
          <span className={`profile-role ${userData.role}`}>{userData.role.toUpperCase()}</span>
        </div>
      </div>

      <div className="profile-stats">
        <div className="stat-card">
          <h3>{orders.length}</h3>
          <p>Total Orders</p>
        </div>
        <div className="stat-card">
          <h3>{orders.filter(o => o.status === 'Delivered').length}</h3>
          <p>Completed</p>
        </div>
        <div className="stat-card">
          <h3>{orders.filter(o => o.status !== 'Delivered').length}</h3>
          <p>Active Orders</p>
        </div>
      </div>

      <div className="profile-actions">
        <button className="profile-action-btn" onClick={() => navigate('/myorders')}>
          View All Orders
        </button>
        <button className="profile-action-btn secondary" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  )
}

export default Profile

