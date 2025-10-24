import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTool, FiClock, FiCheckCircle, FiAlertCircle, FiUser, FiPhone, FiMail, FiPackage, FiDollarSign, FiTag, FiAward, FiCalendar } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import { serviceRequestsAPI, salaryPaymentsAPI } from '../config/api';

const MechanicDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [completedJobs, setCompletedJobs] = useState([]);
  const [todayStats, setTodayStats] = useState({
    totalJobs: 0,
    completedJobs: 0
  });
  const [loading, setLoading] = useState(true);
  const [showReloginNotice, setShowReloginNotice] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);

  const fetchMechanicJobs = async (mechanicId) => {
    try {
      const result = await serviceRequestsAPI.getMechanicJobs(mechanicId);

      if (result.success) {
        const assignedJobs = result.data || [];

        // Filter only completed jobs
        const completed = assignedJobs.filter(job => job.status === 'completed');

        setCompletedJobs(completed);

        // Update stats
        setTodayStats({
          totalJobs: completed.length,
          completedJobs: completed.length
        });
      } else {
        console.error('Failed to fetch jobs:', result.message);
      }
    } catch (error) {
      console.error('Error fetching mechanic jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentHistory = async (mechanicId) => {
    try {
      const result = await salaryPaymentsAPI.getMechanicPayments(mechanicId);
      if (result.success) {
        setPaymentHistory(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (!token || !userData) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userData);
    if (user.role !== 'mechanic') {
      navigate('/dashboard');
      return;
    }

    setUser(user);
    // Use mechanic_id if available, otherwise use id
    const mechanicId = user.mechanic_id || user.id;

    // Check if user data is outdated (missing mechanic_id or hourly_rate)
    if (!user.mechanic_id || user.hourly_rate === undefined) {
      setShowReloginNotice(true);
    }

    if (mechanicId) {
      fetchMechanicJobs(mechanicId);
      fetchPaymentHistory(mechanicId);
    } else {
      console.error('No mechanic ID found. Please log out and log back in.');
      setLoading(false);
    }
  }, [navigate]);

  const quickActions = [
    {
      title: 'View Jobs',
      description: 'See all assigned service jobs',
      icon: FiTool,
      color: 'bg-blue-500',
      action: () => navigate('/mechanic-jobs')
    },
    {
      title: 'Job History',
      description: 'View completed service history',
      icon: FiCheckCircle,
      color: 'bg-purple-500',
      action: () => navigate('/job-history')
    },
    {
      title: 'Payment History',
      description: 'View salary payment records',
      icon: FiDollarSign,
      color: 'bg-green-500',
      action: () => setShowPaymentHistory(!showPaymentHistory)
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

          {/* Relogin Notice */}
          {showReloginNotice && (
            <div className="card mb-6 bg-yellow-500/10 border border-yellow-500/30">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-yellow-400 font-semibold mb-1">Profile Update Required</h3>
                  <p className="text-yellow-200 text-sm mb-2">
                    Some profile information is missing. Please log out and log back in to update your profile data.
                  </p>
                  <button
                    onClick={() => setShowReloginNotice(false)}
                    className="text-yellow-400 hover:text-yellow-300 text-sm underline"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

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
                <FiTag className="text-primary-400" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="card text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">{todayStats.totalJobs}</div>
              <p className="text-dark-300">Total Jobs</p>
            </div>
            <div className="card text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">{todayStats.completedJobs}</div>
              <p className="text-dark-300">Completed</p>
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

          {/* Payment History Section */}
          {showPaymentHistory && (
            <div className="card mb-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <FiDollarSign className="mr-2 text-green-400" />
                  Salary Payment History
                </h3>
                <button
                  onClick={() => setShowPaymentHistory(false)}
                  className="text-dark-300 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {paymentHistory.length === 0 ? (
                <div className="text-center py-8">
                  <FiDollarSign className="text-dark-400 text-4xl mx-auto mb-4" />
                  <p className="text-dark-300">No payment records yet</p>
                </div>
              ) : (
                <>
                  {/* Payment Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-dark-700 rounded-lg p-4 border border-dark-600">
                      <div className="text-dark-300 text-sm mb-1">Total Earned</div>
                      <div className="text-2xl font-bold text-green-400">
                        ₹{paymentHistory.reduce((sum, p) => sum + parseFloat(p.total_amount), 0).toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-dark-700 rounded-lg p-4 border border-dark-600">
                      <div className="text-dark-300 text-sm mb-1">Total Payments</div>
                      <div className="text-2xl font-bold text-blue-400">
                        {paymentHistory.length}
                      </div>
                    </div>
                    <div className="bg-dark-700 rounded-lg p-4 border border-dark-600">
                      <div className="text-dark-300 text-sm mb-1">Average Payment</div>
                      <div className="text-2xl font-bold text-purple-400">
                        ₹{(paymentHistory.reduce((sum, p) => sum + parseFloat(p.total_amount), 0) / paymentHistory.length).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Payment Records */}
                  <div className="space-y-4">
                    {paymentHistory.map((payment) => (
                      <div key={payment.payment_id} className="border border-dark-600 rounded-lg p-4 hover:border-dark-500 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <FiCalendar className="text-dark-400" />
                              <span className="text-white font-medium">{formatDate(payment.payment_date)}</span>
                            </div>
                            <div className="text-sm text-dark-300">
                              Payment ID: #{payment.payment_id}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-400">
                              ₹{parseFloat(payment.total_amount).toFixed(2)}
                            </div>
                            <span className="text-xs text-dark-400">{payment.jobs_included?.length || 0} jobs</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-dark-700">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <FiClock className="text-blue-400 text-sm" />
                              <span className="text-dark-300 text-sm">Time-Based Pay</span>
                            </div>
                            <div className="text-white font-medium">
                              ₹{parseFloat(payment.time_based_pay).toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <FiAward className="text-green-400 text-sm" />
                              <span className="text-dark-300 text-sm">Bonus (3%)</span>
                            </div>
                            <div className="text-white font-medium">
                              ₹{parseFloat(payment.bonus_amount).toFixed(2)}
                            </div>
                          </div>
                        </div>

                        {payment.notes && (
                          <div className="mt-3 pt-3 border-t border-dark-700">
                            <p className="text-sm text-dark-300">{payment.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Completed Jobs */}
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Completed Jobs</h3>
            {completedJobs.length === 0 ? (
              <div className="text-center py-8">
                <FiCheckCircle className="text-dark-400 text-4xl mx-auto mb-4" />
                <p className="text-dark-300">No completed jobs yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {completedJobs.slice(0, 5).map((job) => {
                  const customer = job.customers || {};
                  const vehicle = job.vehicles || {};
                  const service = job.service_request_services?.[0]?.services || {};

                  return (
                    <div key={job.request_id} className="border border-dark-600 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-white font-medium">{service.name || 'Service'}</h4>
                          <p className="text-dark-300 text-sm">
                            {customer.name || 'Customer'} - {vehicle.registration_number} {vehicle.brand} {vehicle.model}
                          </p>
                          <p className="text-dark-400 text-xs">
                            Completed: {job.completion_date ? new Date(job.completion_date).toLocaleDateString() : 'Recently'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="inline-block px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">
                            COMPLETED
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-dark-300 text-sm">Final Cost: ₹{job.final_cost || job.estimated_cost || 'N/A'}</span>
                          {job.mechanic_notes && (
                            <p className="text-dark-400 text-xs mt-1">Notes: {job.mechanic_notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {completedJobs.length > 5 && (
                  <div className="text-center">
                    <button
                      onClick={() => navigate('/job-history')}
                      className="btn-secondary btn-sm"
                    >
                      View All Completed Jobs
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MechanicDashboard;