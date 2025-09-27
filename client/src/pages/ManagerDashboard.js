import React, { useState, useEffect } from 'react';
import { FiUsers, FiTool, FiTruck, FiDollarSign, FiBarChart, FiCalendar, FiUser, FiPhone, FiMail, FiShield } from 'react-icons/fi';
import Navbar from '../components/Navbar';

const ManagerDashboard = () => {
  const [user, setUser] = useState(null);
  const [showContent, setShowContent] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    totalCustomers: 0,
    totalMechanics: 0,
    totalVehicles: 0,
    monthlyRevenue: 0,
    pendingJobs: 0,
    completedJobs: 0
  });
  const [loading, setLoading] = useState(true);

  // Show background for 0.5 seconds before displaying content
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 500); // Show content after 0.5 seconds

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    // TODO: Fetch management stats from API
    setLoading(false);
  }, []);

  const quickActions = [
    {
      title: 'Manage Staff',
      description: 'Add, edit, or remove mechanics',
      icon: FiUsers,
      color: 'bg-blue-500',
      action: () => console.log('Manage Staff')
    },
    {
      title: 'Service Overview',
      description: 'Monitor all service requests',
      icon: FiTool,
      color: 'bg-green-500',
      action: () => console.log('Service Overview')
    },
    {
      title: 'Customer Management',
      description: 'View and manage customers',
      icon: FiUser,
      color: 'bg-purple-500',
      action: () => console.log('Customer Management')
    },
    {
      title: 'Reports',
      description: 'Generate business reports',
      icon: FiBarChart,
      color: 'bg-orange-500',
      action: () => console.log('Reports')
    },
    {
      title: 'Vehicle Database',
      description: 'Manage vehicle information',
      icon: FiTruck,
      color: 'bg-indigo-500',
      action: () => console.log('Vehicle Database')
    },
    {
      title: 'Financial Overview',
      description: 'View revenue and expenses',
      icon: FiDollarSign,
      color: 'bg-red-500',
      action: () => console.log('Financial Overview')
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'service_completed',
      message: 'Oil change completed for John Doe - Honda Civic',
      time: '2 hours ago',
      mechanic: 'Mike Johnson'
    },
    {
      id: 2,
      type: 'new_customer',
      message: 'New customer registered: Sarah Wilson',
      time: '4 hours ago',
      mechanic: null
    },
    {
      id: 3,
      type: 'service_assigned',
      message: 'Brake inspection assigned to Tom Davis',
      time: '6 hours ago',
      mechanic: 'Tom Davis'
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
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: 'url(/car1.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black bg-opacity-70"></div>
      
      {/* Content - Show after 0.5 seconds */}
      {showContent && (
        <div className="relative z-10 animate-fade-in">
          <Navbar />
          
          <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
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
          <div className="card text-center">
            <FiDollarSign className="text-yellow-400 text-2xl mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-400 mb-1">${dashboardStats.monthlyRevenue}</div>
            <p className="text-dark-300 text-sm">Monthly Revenue</p>
          </div>
          <div className="card text-center">
            <FiCalendar className="text-orange-400 text-2xl mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-400 mb-1">{dashboardStats.pendingJobs}</div>
            <p className="text-dark-300 text-sm">Pending Jobs</p>
          </div>
          <div className="card text-center">
            <FiBarChart className="text-primary-400 text-2xl mx-auto mb-2" />
            <div className="text-2xl font-bold text-primary-400 mb-1">{dashboardStats.completedJobs}</div>
            <p className="text-dark-300 text-sm">Completed</p>
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

        {/* Recent Activity */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          {recentActivities.length === 0 ? (
            <div className="text-center py-8">
              <FiBarChart className="text-dark-400 text-4xl mx-auto mb-4" />
              <p className="text-dark-300">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="border border-dark-600 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-white">{activity.message}</p>
                      {activity.mechanic && (
                        <p className="text-dark-300 text-sm mt-1">Mechanic: {activity.mechanic}</p>
                      )}
                    </div>
                    <span className="text-dark-400 text-sm whitespace-nowrap ml-4">
                      {activity.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;