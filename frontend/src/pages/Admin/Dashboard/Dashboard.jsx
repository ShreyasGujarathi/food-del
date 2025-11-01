import React from 'react'
import { Link } from 'react-router-dom'
import './Dashboard.css'

const Dashboard = () => {
  return (
    <div className='admin-dashboard'>
      <h1>Admin Dashboard</h1>
      <div className="dashboard-cards">
        <Link to="/admin/add" className="dashboard-card">
          <h2>Add Items</h2>
          <p>Add new food items to the menu</p>
        </Link>
        <Link to="/admin/list" className="dashboard-card">
          <h2>List Items</h2>
          <p>View and manage all food items</p>
        </Link>
        <Link to="/admin/orders" className="dashboard-card">
          <h2>Orders</h2>
          <p>Manage customer orders</p>
        </Link>
      </div>
    </div>
  )
}

export default Dashboard

