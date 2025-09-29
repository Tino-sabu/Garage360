import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTool, FiClock, FiCheckCircle, FiAlertCircle, FiUser, FiPhone, FiMail, FiPackage, FiDollarSign } from 'react-icons/fi';
import Navbar from '../components/Navbar';

const MechanicDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [assignedJobs, setAssignedJobs] = useState([]);
  const [todayStats, setTodayStats] = useState({
    totalJobs: 0,
    completedJobs: 0,
    pendingJobs: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // TODO: Fetch mechanic's assigned jobs and stats from API
    setLoading(false);
  }, []);

  const quickActions = [
    {
      title: 'View Jobs',
      description: 'See all assigned service jobs',
      icon: FiTool,
      color: 'bg-blue-500',
      action: () => console.log('View Jobs')
    },
    {
      title: 'Clock In/Out',
      description: 'Track your working hours',
      icon: FiClock,
      color: 'bg-green-500',
      action: () => console.log('Clock In/Out')
    },
    {
      title: 'Job History',
      description: 'View completed service history',
      icon: FiCheckCircle,
      color: 'bg-purple-500',
      action: () => console.log('Job History')
    },
    {
      title: 'Stock Management',
      description: 'Manage parts and inventory',
      icon: FiPackage,
      color: 'bg-orange-500',
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
              Welcome back, {user?.name || 'Mechanic'}!
            </h1>
            <p className="text-dark-300">
              Manage your service assignments and track your work progress
            </p>
          </div>

          {/* Mechanic Info Card */}
          <div className="card mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Mechanic Profile</h2>
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
                <FiDollarSign className="text-primary-400" />
                <div>
                  <p className="text-dark-300 text-sm">Hourly Rate</p>
                  <p className="text-white">₹{user?.hourly_rate || 'N/A'}</p>
                </div>
              </div>
            </div>
            {user?.specializations && user.specializations.length > 0 && (
              <div className="mt-4">
                <p className="text-dark-300 text-sm mb-2">Specializations</p>
                <div className="flex flex-wrap gap-2">
                  {user.specializations.map((spec, index) => (
                    <span key={index} className="bg-primary-500/20 text-primary-400 px-3 py-1 rounded-full text-sm">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Today's Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="card text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">{todayStats.totalJobs}</div>
              <p className="text-dark-300"> Jobs for the day</p>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">{todayStats.completedJobs}</div>
              <p className="text-dark-300">Completed</p>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">{todayStats.pendingJobs}</div>
              <p className="text-dark-300">Pending</p>
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

          {/* Assigned Jobs */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Today's Assigned Jobs</h3>
            {assignedJobs.length === 0 ? (
              <div className="text-center py-8">
                <FiTool className="text-dark-400 text-4xl mx-auto mb-4" />
                <p className="text-dark-300">No jobs assigned for today</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignedJobs.map((job) => (
                  <div key={job.id} className="border border-dark-600 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-white font-medium">{job.service}</h4>
                        <p className="text-dark-300 text-sm">{job.customer} - {job.vehicle}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {job.priority === 'high' && (
                          <FiAlertCircle className="text-red-400" />
                        )}
                        <span className={`inline-block px-2 py-1 rounded text-xs ${job.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                          job.status === 'in-progress' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                          {job.status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-dark-300 text-sm">Est. Time: {job.estimatedTime}</span>
                      <div className="space-x-2">
                        <button className="btn-secondary btn-sm">View Details</button>
                        {job.status === 'pending' && (
                          <button className="btn-primary btn-sm">Start Job</button>
                        )}
                        {job.status === 'in-progress' && (
                          <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm">
                            Complete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MechanicDashboard;