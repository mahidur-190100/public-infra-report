
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { FaBan } from 'react-icons/fa';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const [isValid, setIsValid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const validateSession = async () => {
      setLoading(true);
      
      // Get user data from localStorage
      const adminData = localStorage.getItem('admin');
      const userData = localStorage.getItem('user');
      
      let email = null;
      let uid = null;
      let role = null;
      
      if (adminData) {
        try {
          const admin = JSON.parse(adminData);
          email = admin.email;
          uid = admin.uid;
          role = 'admin';
        } catch (e) {
          console.error('Error parsing admin data:', e);
        }
      } else if (userData) {
        try {
          const user = JSON.parse(userData);
          email = user.email;
          uid = user.uid;
          role = 'user';
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
      
      if (!email) {
        setIsValid(false);
        setLoading(false);
        return;
      }
      
      try {
        const response = await axios.post('https://public-infra-report-server.vercel.app/validate-user', {
          email: email,
          uid: uid
        });
        
        if (response.data.success && response.data.valid === true) {
          // Check if admin access is required
          if (requireAdmin && response.data.user.role !== 'admin') {
            setIsValid(false);
            setUserRole('user');
          } else {
            setIsValid(true);
            setUserRole(response.data.user.role);
          }
        } else {
          // User is blocked or invalid
          if (response.data.blocked) {
            localStorage.removeItem('admin');
            localStorage.removeItem('user');
          }
          setIsValid(false);
        }
      } catch (error) {
        console.error('Error validating session:', error);
        setIsValid(false);
      } finally {
        setLoading(false);
      }
    };
    
    validateSession();
    
    // Auto-refresh validation every minute
    const interval = setInterval(validateSession, 60000);
    
    return () => clearInterval(interval);
  }, [requireAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking your access...</p>
        </div>
      </div>
    );
  }

  if (isValid === false) {
    // Check if it's because user needs admin access
    if (requireAdmin && userRole === 'user') {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <FaBan className="w-16 h-16 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">Admin access is required for this page.</p>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
    
    // Session expired or blocked
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;