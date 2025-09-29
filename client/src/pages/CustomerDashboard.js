import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTruck, FiCalendar, FiClock, FiUser, FiPhone, FiMail, FiPlus } from 'react-icons/fi';
import Navbar from '../components/Navbar';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // TODO: Fetch user's vehicles and service requests from API
    setLoading(false);
  }, []);

  const quickActions = [
    {
      title: 'Add Vehicle',
      description: 'Add a new vehicle to your account',
      icon: FiPlus,
      color: 'bg-blue-500',
      action: () => navigate('/add-vehicle')
    },
    {
      title: 'My Vehicles',
      description: 'View and manage your vehicles',
      icon: FiTruck,
      color: 'bg-green-500',
      action: () => navigate('/my-vehicles')
    },
    {
      title: 'Book Service',
      description: 'Schedule a service for your vehicle',
      icon: FiCalendar,
      color: 'bg-purple-500',
      action: () => navigate('/my-vehicles') // Will redirect to vehicles first
    },
    {
      title: 'Service History',
      description: 'View past service records',
      icon: FiClock,
      color: 'bg-orange-500',
      action: () => console.log('Service History - Coming soon')
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: 'url(/car2.jpg)',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Dark overlay for better readability */}
      <div className="min-h-screen bg-black bg-opacity-70">
        <Navbar />

        <div className="container mx-auto px-4 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user?.name || 'Customer'}!
            </h1>
            <p className="text-dark-300">
              Manage your vehicles and service appointments from your customer dashboard
            </p>
          </div>

          {/* User Info Card */}
          <div className="card mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-3">
                <FiUser className="text-primary-400" />
                <div>
                  <p className="text-dark-300 text-sm">Name</p>
                  <p className="text-white">{user?.name || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FiMail className="text-primary-400" />
                <div>
                  <p className="text-dark-300 text-sm">Email</p>
                  <p className="text-white">{user?.email || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <FiPhone className="text-primary-400" />
                <div>
                  <p className="text-dark-300 text-sm">Phone</p>
                  <p className="text-white">{user?.phone || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <div
                  key={index}
                  onClick={action.action}
                  className="card hover:bg-dark-700 cursor-pointer transition-colors duration-200"
                >
                  <div className={`${action.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                    <action.icon className="text-white text-xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{action.title}</h3>
                  <p className="text-dark-300 text-sm">{action.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;