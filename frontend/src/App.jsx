import React, { useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './components/DarkModeToggle/DarkModeToggle.css';

// Customer Components
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import LoginPopup from './components/LoginPopup/LoginPopup'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'

// Customer Pages
import Home from './pages/Customer/Home/Home'
import Cart from './pages/Customer/Cart/Cart'
import PlaceOrder from './pages/Customer/PlaceOrder/PlaceOrder'
import MyOrders from './pages/Customer/MyOrders/MyOrders'
import Verify from './pages/Customer/Verify/Verify'
import Profile from './pages/Customer/Profile/Profile'

// Admin Components
import AdminNavbar from './components/Admin/Navbar/Navbar'
import Sidebar from './components/Admin/Sidebar/Sidebar'

// Admin Pages
import Dashboard from './pages/Admin/Dashboard/Dashboard'
import Add from './pages/Admin/Add/Add'
import List from './pages/Admin/List/List'
import Orders from './pages/Admin/Orders/Orders'
import AdminProfile from './pages/Admin/Profile/Profile'

const App = () => {
  const [showLogin, setShowLogin] = useState(false);
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      <ToastContainer />
      {showLogin && <LoginPopup setShowLogin={setShowLogin} />}
      
      {isAdminRoute ? (
        // Admin Layout
        <div className='app admin-app'>
          <AdminNavbar />
          <hr />
          <div className="app-content">
            <Sidebar />
            <Routes>
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/add"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Add />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/list"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <List />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/profile"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="*"
                element={
                  <div style={{ padding: '20px', textAlign: 'center' }}>
                    <h2>404 - Page Not Found</h2>
                    <p>The requested admin page does not exist.</p>
                  </div>
                }
              />
            </Routes>
          </div>
        </div>
      ) : (
        // Customer Layout
        <div className='app'>
          <Navbar setShowLogin={setShowLogin} />
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/cart' element={<Cart />} />
            <Route path='/order' element={<PlaceOrder />} />
            <Route path='/myorders' element={<MyOrders />} />
            <Route path='/verify' element={<Verify />} />
            <Route path='/profile' element={<Profile />} />
          </Routes>
          <Footer />
        </div>
      )}
    </>
  )
}

export default App
