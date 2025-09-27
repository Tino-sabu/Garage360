import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomerDashboard from '../pages/CustomerDashboard';
import MechanicDashboard from '../pages/MechanicDashboard';
import ManagerDashboard from '../pages/ManagerDashboard';

const RoleBasedDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }

    try {
      const user = JSON.parse(userData);
      
      // Redirect based on role to specific dashboard routes
      switch (user.role) {
        case 'customer':
          navigate('/customer-dashboard');
          break;
        case 'mechanic':
          navigate('/mechanic-dashboard');
          break;
        case 'manager':
          navigate('/manager-dashboard');
          break;
        default:
          // Default to customer dashboard if role is not recognized
          navigate('/customer-dashboard');
          break;
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      navigate('/login');
    }
  }, [navigate]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className="text-white text-lg">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
};

export default RoleBasedDashboard;