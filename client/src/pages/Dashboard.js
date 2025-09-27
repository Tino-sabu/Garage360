import React from 'react';
import { FiTruck, FiTool, FiUsers, FiDollarSign } from 'react-icons/fi';

const Dashboard = () => {
  const stats = [
    {
      title: 'Active Services',
      value: '24',
      change: '+12%',
      icon: FiTool,
      color: 'text-primary-400'
    },
    {
      title: 'Vehicles Managed',
      value: '142',
      change: '+8%',
      icon: FiTruck,
      color: 'text-green-400'
    },
    {
      title: 'Revenue Today',
      value: '$3,420',
      change: '+15%',
      icon: FiDollarSign,
      color: 'text-yellow-400'
    },
    {
      title: 'Customers',
      value: '89',
      change: '+5%',
      icon: FiUsers,
      color: 'text-purple-400'
    }
  ];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-dark-300">Welcome back! Here's what's happening at your garage.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-dark-300 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-green-400 text-sm">{stat.change} from last week</p>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-dark-700 flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="text-2xl" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="btn-primary w-full">
                <FiTool className="mr-2" />
                New Service Request
              </button>
              <button className="btn-secondary w-full">
                <FiTruck className="mr-2" />
                Add Vehicle
              </button>
              <button className="btn-secondary w-full">
                <FiUsers className="mr-2" />
                Add Customer
              </button>
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <p className="text-dark-300 text-sm">Service completed for BMW X5</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <p className="text-dark-300 text-sm">New service request received</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                <p className="text-dark-300 text-sm">Payment processed for invoice #1234</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-semibold text-white mb-4">Today's Schedule</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Oil Change</p>
                  <p className="text-dark-300 text-sm">Honda Civic - 10:00 AM</p>
                </div>
                <div className="w-3 h-3 bg-primary-400 rounded-full"></div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Brake Service</p>
                  <p className="text-dark-300 text-sm">Toyota Camry - 2:00 PM</p>
                </div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Full Inspection</p>
                  <p className="text-dark-300 text-sm">Ford F-150 - 4:00 PM</p>
                </div>
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;