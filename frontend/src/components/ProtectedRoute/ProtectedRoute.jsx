import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'

// Helper function to decode JWT token
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    let role = localStorage.getItem('role');

    // Check if user is authenticated
    if (!token) {
      console.log('ProtectedRoute: No token found');
      setHasAccess(false);
      setIsChecking(false);
      return;
    }

    // If role is not in localStorage, try to decode it from the token
    if (!role && token) {
      const decoded = decodeToken(token);
      if (decoded && decoded.role) {
        role = decoded.role;
        localStorage.setItem('role', role);
        console.log('ProtectedRoute: Role decoded from token:', role);
      } else {
        console.log('ProtectedRoute: Could not decode role from token');
      }
    }

    // Check if user has required role
    if (allowedRoles.length > 0) {
      // Trim and normalize role for comparison
      const normalizedRole = role ? role.trim().toLowerCase() : null;
      const normalizedAllowedRoles = allowedRoles.map(r => r.trim().toLowerCase());
      
      console.log('ProtectedRoute: Checking role', normalizedRole, 'against allowed roles', normalizedAllowedRoles);
      
      if (!normalizedRole || !normalizedAllowedRoles.includes(normalizedRole)) {
        console.log('ProtectedRoute: Access denied - role mismatch');
        setHasAccess(false);
        setIsChecking(false);
        return;
      }
    }

    console.log('ProtectedRoute: Access granted');
    setHasAccess(true);
    setIsChecking(false);
  }, [allowedRoles]);

  if (isChecking) {
    // Show minimal loading state while checking
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh',
        fontSize: '18px',
        color: 'var(--text-muted)'
      }}>
        Verifying access...
      </div>
    );
  }

  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute
