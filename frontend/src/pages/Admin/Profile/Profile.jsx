import React, { useContext, useState, useEffect } from 'react'
import './Profile.css'
import { StoreContext } from '../../../Context/StoreContext'
import { assets } from '../../../assets/assets'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const AdminProfile = () => {
  const { url, token, setToken, currency } = useContext(StoreContext)
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalFoods: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      if (token) {
        try {
          const [foodsResponse, ordersResponse] = await Promise.all([
            axios.get(`${url}/api/food/list`, { headers: { token } }),
            axios.get(`${url}/api/order/list`, { headers: { token } })
          ]);

          if (foodsResponse.data.success && ordersResponse.data.success) {
            const orders = ordersResponse.data.data || [];
            setStats({
              totalFoods: foodsResponse.data.data?.length || 0,
              totalOrders: orders.length,
              pendingOrders: orders.filter(o => o.status !== 'Delivered').length,
              completedOrders: orders.filter(o => o.status === 'Delivered').length
            });
          }
        } catch (error) {
          console.error("Error fetching stats:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchStats();
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

  return (
    <div className="profile-container admin-profile">
      <div className="profile-header">
        <img src={assets.profile_image} alt="Admin Profile" className="profile-avatar" />
        <div className="profile-info">
          <h1>Admin Dashboard</h1>
          <p className="profile-email">Administrator Account</p>
          <span className="profile-role admin">ADMIN</span>
        </div>
      </div>

      <div className="profile-stats admin-stats">
        <div className="stat-card">
          <h3>{stats.totalFoods}</h3>
          <p>Total Food Items</p>
        </div>
        <div className="stat-card">
          <h3>{stats.totalOrders}</h3>
          <p>Total Orders</p>
        </div>
        <div className="stat-card">
          <h3>{stats.pendingOrders}</h3>
          <p>Pending Orders</p>
        </div>
        <div className="stat-card">
          <h3>{stats.completedOrders}</h3>
          <p>Completed Orders</p>
        </div>
      </div>

      <div className="profile-actions">
        <button className="profile-action-btn" onClick={() => navigate('/admin')}>
          Back to Dashboard
        </button>
        <button className="profile-action-btn secondary" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  )
}

export default AdminProfile

