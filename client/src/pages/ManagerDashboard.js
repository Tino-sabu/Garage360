import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiUser, FiPhone, FiMail, FiShield, FiPackage, FiTool, FiTruck, FiClipboard } from 'react-icons/fi';
import Navbar from '../components/Navbar';

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showContent, setShowContent] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalCustomers: 0,
    totalMechanics: 0,
    totalVehicles: 0
  });
  const [loading, setLoading] = useState(true);

  // Show background for 0.5 seconds before displaying content
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 1000); // Show content after 1 seconds

    return () => clearTimeout(timer);
  }, []);

  // Fetch dashboard stats from API
  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Dashboard stats fetched:', data); // Debug log
        setDashboardStats(data.data);
      } else {
        console.error('Failed to fetch stats:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Fetch dashboard stats initially
    fetchDashboardStats();
    setLoading(false);

    // Set up auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      fetchDashboardStats();
    }, 30000); // Refresh every 30 seconds

    // Clean up interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []);

  const quickActions = [
    {
      title: 'Assign Requests',
      description: 'Assign service requests to mechanics',
      icon: FiClipboard,
      color: 'bg-orange-500',
      action: () => navigate('/assign-requests')
    },
    {
      title: 'Manage Staff',
      description: 'View mechanics available',
      icon: FiUsers,
      color: 'bg-blue-500',
      action: () => navigate('/mechanic-management')
    },
    {
      title: 'Customer Management',
      description: 'View registered customers',
      icon: FiUser,
      color: 'bg-purple-500',
      action: () => navigate('/customer-management')
    },
    {
      title: 'Stock Holdings',
      description: 'View and manage parts inventory',
      icon: FiPackage,
      color: 'bg-indigo-500',
      action: () => navigate('/parts-management')
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
        backgroundImage: 'url(/car3.jpg)',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Dark overlay for better readability */}
      <div className="min-h-screen bg-black bg-opacity-70">
        <Navbar />

        {/* Content */}
        {showContent && (
          <div className="animate-fade-in">
            <div className="container mx-auto px-4 py-8">{/* Welcome Section */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">
                  Manager Dashboard - {user?.name || 'Manager'}
                </h1>
                <p className="text-dark-300">
                  Monitor operations, manage staff, and oversee business performance
                </p>
              </div>

              {/* Manager Info Card */}
              <div className="card mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Manager Profile</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <div className="flex items-center space-x-3">
                    <FiShield className="text-primary-400" />
                    <div>
                      <p className="text-dark-300 text-sm">Department</p>
                      <p className="text-white">{user?.department || 'Management'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="card text-center">
                  <FiUsers className="text-blue-400 text-2xl mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-400 mb-1">{dashboardStats.totalCustomers}</div>
                  <p className="text-dark-300 text-sm">Customers</p>
                </div>
                <div className="card text-center">
                  <FiTool className="text-green-400 text-2xl mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-400 mb-1">{dashboardStats.totalMechanics}</div>
                  <p className="text-dark-300 text-sm">Mechanics</p>
                </div>
                <div className="card text-center">
                  <FiTruck className="text-purple-400 text-2xl mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-400 mb-1">{dashboardStats.totalVehicles}</div>
                  <p className="text-dark-300 text-sm">Vehicles</p>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Management Tools</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;