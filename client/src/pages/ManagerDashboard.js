import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiUser, FiPhone, FiMail, FiShield, FiPackage, FiTool, FiTruck, FiClipboard, FiTrash2 } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import { customersAPI, mechanicsAPI, vehiclesAPI, serviceRequestsAPI } from '../config/api';

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
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);

  // Show background for 0.5 seconds before displaying content
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 1000); // Show content after 1 seconds

    return () => clearTimeout(timer);
  }, []);

  // Fetch dashboard stats from Supabase API
  const fetchDashboardStats = async () => {
    try {
      // Fetch all counts in parallel
      const [customersResult, mechanicsResult, vehiclesResult] = await Promise.all([
        customersAPI.getAllCustomers(),
        mechanicsAPI.getAllMechanics(),
        vehiclesAPI.getAllVehicles()
      ]);

      setDashboardStats({
        totalCustomers: customersResult.success ? customersResult.data.length : 0,
        totalMechanics: mechanicsResult.success ? mechanicsResult.data.length : 0,
        totalVehicles: vehiclesResult.success ? vehiclesResult.data.length : 0
      });

      console.log('Dashboard stats updated:', {
        customers: customersResult.success ? customersResult.data.length : 0,
        mechanics: mechanicsResult.success ? mechanicsResult.data.length : 0,
        vehicles: vehiclesResult.success ? vehiclesResult.data.length : 0
      });
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

  const handleClearAllRequests = async () => {
    setClearing(true);
    try {
      const response = await serviceRequestsAPI.clearAll();

      if (response.success) {
        alert('✅ All service requests and related data have been cleared successfully!');
        setShowClearConfirm(false);
        // Refresh stats
        fetchDashboardStats();
      } else {
        alert('❌ Failed to clear requests: ' + response.message);
      }
    } catch (error) {
      alert('❌ Error: ' + error.message);
    } finally {
      setClearing(false);
    }
  };

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
            <div className="container mx-auto px-4 py-8">
              {/* Welcome Section */}
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                      Manager Dashboard
                    </h1>
                    <p className="text-dark-300 text-sm sm:text-base">
                      Monitor operations, manage staff, and oversee business performance
                    </p>
                  </div>

                  {/* Clear All Requests Button - Desktop Only */}
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="hidden sm:flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 whitespace-nowrap shadow-lg"
                  >
                    <FiTrash2 />
                    <span>Clear All Requests</span>
                  </button>
                </div>

                {/* Manager Info Card with Clear Button on Mobile */}
                <div className="card">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                    <h2 className="text-lg sm:text-xl font-semibold text-white">Manager Profile</h2>
                    
                    {/* Clear All Requests Button - Mobile Only */}
                    <button
                      onClick={() => setShowClearConfirm(true)}
                      className="sm:hidden flex items-center space-x-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-3 py-2 rounded-lg transition-colors duration-200 text-sm shadow-lg w-full sm:w-auto justify-center"
                    >
                      <FiTrash2 className="text-base" />
                      <span>Clear All Requests</span>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="flex items-center space-x-3 p-3 sm:p-0 bg-dark-700 sm:bg-transparent rounded-lg">
                      <FiUser className="text-primary-400 text-lg sm:text-xl" />
                      <div>
                        <p className="text-dark-300 text-xs sm:text-sm">Name</p>
                        <p className="text-white text-sm sm:text-base">{user?.name || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 sm:p-0 bg-dark-700 sm:bg-transparent rounded-lg">
                      <FiMail className="text-primary-400 text-lg sm:text-xl" />
                      <div>
                        <p className="text-dark-300 text-xs sm:text-sm">Email</p>
                        <p className="text-white text-sm sm:text-base truncate">{user?.email || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 sm:p-0 bg-dark-700 sm:bg-transparent rounded-lg">
                      <FiPhone className="text-primary-400 text-lg sm:text-xl" />
                      <div>
                        <p className="text-dark-300 text-xs sm:text-sm">Phone</p>
                        <p className="text-white text-sm sm:text-base">{user?.phone || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 sm:p-0 bg-dark-700 sm:bg-transparent rounded-lg">
                      <FiShield className="text-primary-400 text-lg sm:text-xl" />
                      <div>
                        <p className="text-dark-300 text-xs sm:text-sm">Department</p>
                        <p className="text-white text-sm sm:text-base">{user?.department || 'Management'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Stats - Single Row on Mobile */}
              <div className="grid grid-cols-3 md:grid-cols-3 gap-3 sm:gap-6 mb-8">
                {/* Customers */}
                <div className="card-compact text-center hover:bg-dark-700 transition-all cursor-pointer">
                  <FiUsers className="text-blue-400 text-xl sm:text-3xl mx-auto mb-1 sm:mb-2" />
                  <div className="text-xl sm:text-3xl font-bold text-blue-400 mb-0.5 sm:mb-1">
                    {dashboardStats.totalCustomers}
                  </div>
                  <p className="text-dark-300 text-xs sm:text-sm">Customers</p>
                </div>

                {/* Mechanics */}
                <div className="card-compact text-center hover:bg-dark-700 transition-all cursor-pointer">
                  <FiTool className="text-green-400 text-xl sm:text-3xl mx-auto mb-1 sm:mb-2" />
                  <div className="text-xl sm:text-3xl font-bold text-green-400 mb-0.5 sm:mb-1">
                    {dashboardStats.totalMechanics}
                  </div>
                  <p className="text-dark-300 text-xs sm:text-sm">Mechanics</p>
                </div>

                {/* Vehicles */}
                <div className="card-compact text-center hover:bg-dark-700 transition-all cursor-pointer">
                  <FiTruck className="text-purple-400 text-xl sm:text-3xl mx-auto mb-1 sm:mb-2" />
                  <div className="text-xl sm:text-3xl font-bold text-purple-400 mb-0.5 sm:mb-1">
                    {dashboardStats.totalVehicles}
                  </div>
                  <p className="text-dark-300 text-xs sm:text-sm">Vehicles</p>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="mb-8">
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">Management Tools</h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                  {quickActions.map((action, index) => (
                    <div
                      key={index}
                      onClick={action.action}
                      className="card-compact hover:bg-dark-700 active:bg-dark-600 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      <div className={`${action.color} w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center mb-2 sm:mb-4 mx-auto sm:mx-0 shadow-lg`}>
                        <action.icon className="text-white text-lg sm:text-xl" />
                      </div>
                      <h3 className="text-sm sm:text-lg font-semibold text-white mb-1 sm:mb-2">{action.title}</h3>
                      <p className="text-dark-300 text-xs sm:text-sm hidden sm:block">{action.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-800 rounded-lg p-4 sm:p-6 max-w-md w-full border border-red-500 shadow-2xl">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-red-600 p-2 sm:p-3 rounded-full">
                  <FiTrash2 className="text-white text-lg sm:text-xl" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white">Clear All Requests?</h3>
              </div>

              <p className="text-dark-300 mb-4 sm:mb-6 text-sm sm:text-base">
                This will permanently delete all service requests, service-request relationships, and service parts data. This action cannot be undone!
              </p>

              <div className="bg-red-900 bg-opacity-30 border border-red-600 rounded-lg p-3 mb-4 sm:mb-6">
                <p className="text-red-400 text-xs sm:text-sm font-semibold">⚠️ Warning:</p>
                <ul className="text-red-300 text-xs sm:text-sm mt-2 space-y-1 ml-4 list-disc">
                  <li>All service requests will be deleted</li>
                  <li>All service-request-services links will be removed</li>
                  <li>All service parts records will be cleared</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  disabled={clearing}
                  className="flex-1 bg-dark-700 hover:bg-dark-600 active:bg-dark-500 text-white px-4 py-2.5 sm:py-2 rounded-lg transition-colors duration-200 text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAllRequests}
                  disabled={clearing}
                  className="flex-1 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white px-4 py-2.5 sm:py-2 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  {clearing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Clearing...</span>
                    </>
                  ) : (
                    <>
                      <FiTrash2 />
                      <span>Clear All</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagerDashboard;