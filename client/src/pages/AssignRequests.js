import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiArrowLeft,
    FiUser,
    FiTruck,
    FiCalendar,
    FiClock,
    FiTag,
    FiMessageSquare,
    FiUserCheck,
    FiFilter,
    FiRefreshCw,
    FiEye
} from 'react-icons/fi';

const AssignRequests = () => {
    const navigate = useNavigate();
    const [serviceRequests, setServiceRequests] = useState([]);
    const [mechanics, setMechanics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMechanics, setLoadingMechanics] = useState(false);
    const [assigningRequest, setAssigningRequest] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        // Check if user is logged in and is a manager
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (!token || !user) {
            navigate('/login');
            return;
        }

        const userData = JSON.parse(user);
        if (userData.role !== 'manager') {
            navigate('/dashboard');
            return;
        }

        fetchServiceRequests();
        fetchMechanics();
    }, [navigate]);

    const fetchServiceRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/service-requests/all', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                setServiceRequests(data.data);
            } else {
                setError('Failed to load service requests');
            }
        } catch (error) {
            console.error('Error fetching service requests:', error);
            setError('Failed to load service requests');
        } finally {
            setLoading(false);
        }
    };

    const fetchMechanics = async () => {
        setLoadingMechanics(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/mechanics', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                setMechanics(data.data);
            }
        } catch (error) {
            console.error('Error fetching mechanics:', error);
        } finally {
            setLoadingMechanics(false);
        }
    };

    const assignMechanic = async (requestId, mechanicId) => {
        setAssigningRequest(requestId);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/service-requests/${requestId}/assign`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ mechanic_id: mechanicId })
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Mechanic assigned successfully');
                fetchServiceRequests(); // Refresh the list
            } else {
                setError(data.message || 'Failed to assign mechanic');
            }
        } catch (error) {
            console.error('Error assigning mechanic:', error);
            setError('Failed to assign mechanic');
        } finally {
            setAssigningRequest(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-600';
            case 'in-progress': return 'bg-blue-600';
            case 'completed': return 'bg-green-600';
            case 'cancelled': return 'bg-red-600';
            default: return 'bg-gray-600';
        }
    };

    const filteredRequests = filterStatus === 'all'
        ? serviceRequests
        : serviceRequests.filter(request => request.status === filterStatus);

    const formatCurrency = (amount) => {
        if (!amount) return 'N/A';
        return '₹' + new Intl.NumberFormat('en-IN').format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen bg-cover bg-center bg-no-repeat relative"
            style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url('/pic2.jpeg')`
            }}
        >
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center">
                        <button
                            onClick={() => navigate('/manager-dashboard')}
                            className="flex items-center text-white hover:text-blue-400 transition-colors mr-6"
                        >
                            <FiArrowLeft className="mr-2" size={20} />
                            Back to Dashboard
                        </button>
                        <h1 className="text-3xl font-bold text-white">Assign Service Requests</h1>
                    </div>

                    <button
                        onClick={fetchServiceRequests}
                        className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        <FiRefreshCw className="mr-2" size={16} />
                        Refresh
                    </button>
                </div>

                {/* Success/Error Messages */}
                {success && (
                    <div className="bg-green-600 text-white p-4 rounded-lg mb-6">
                        {success}
                    </div>
                )}

                {error && (
                    <div className="bg-red-600 text-white p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Filter Section */}
                <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
                    <div className="flex items-center space-x-4">
                        <FiFilter className="text-white" size={20} />
                        <span className="text-white font-medium">Filter by Status:</span>
                        <div className="flex space-x-2">
                            {['all', 'pending', 'in-progress', 'completed', 'cancelled'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${filterStatus === status
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                        }`}
                                >
                                    {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Service Requests List */}
                <div className="space-y-4">
                    {filteredRequests.length === 0 ? (
                        <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
                            <FiEye size={48} className="mx-auto text-gray-500 mb-4" />
                            <p className="text-gray-400">No service requests found</p>
                        </div>
                    ) : (
                        filteredRequests.map((request) => (
                            <div key={request.request_id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Request Info */}
                                    <div className="lg:col-span-2">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-xl font-semibold text-white mb-2">
                                                    Request #{request.request_id}
                                                </h3>
                                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(request.status)}`}>
                                                    {request.status}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-gray-400 text-sm">Requested</p>
                                                <p className="text-white">{formatDate(request.request_date)}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            {/* Customer Info */}
                                            <div className="bg-gray-700 rounded-lg p-4">
                                                <h4 className="text-white font-medium mb-2 flex items-center">
                                                    <FiUser className="mr-2" />
                                                    Customer
                                                </h4>
                                                <p className="text-gray-300">{request.customer_name}</p>
                                                <p className="text-gray-400 text-sm">{request.customer_email}</p>
                                                <p className="text-gray-400 text-sm">{request.customer_phone}</p>
                                            </div>

                                            {/* Vehicle Info */}
                                            <div className="bg-gray-700 rounded-lg p-4">
                                                <h4 className="text-white font-medium mb-2 flex items-center">
                                                    <FiTruck className="mr-2" />
                                                    Vehicle
                                                </h4>
                                                <p className="text-gray-300">{request.brand} {request.model} ({request.year})</p>
                                                <p className="text-gray-400 text-sm">{request.registration_number}</p>
                                            </div>
                                        </div>

                                        {/* Service Info */}
                                        <div className="bg-gray-700 rounded-lg p-4 mb-4">
                                            <h4 className="text-white font-medium mb-2">Service Details</h4>
                                            <p className="text-gray-300 font-medium">{request.service_name}</p>
                                            <p className="text-gray-400 text-sm mb-2">{request.service_description}</p>
                                            <div className="flex items-center space-x-4">
                                                <span className="flex items-center text-green-400">
                                                    <FiTag className="mr-1" size={14} />
                                                    {formatCurrency(request.estimated_cost)}
                                                </span>
                                                <span className="flex items-center text-blue-400">
                                                    <FiCalendar className="mr-1" size={14} />
                                                    {formatDate(request.scheduled_date)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Customer Notes */}
                                        {request.customer_notes && (
                                            <div className="bg-gray-700 rounded-lg p-4">
                                                <h4 className="text-white font-medium mb-2 flex items-center">
                                                    <FiMessageSquare className="mr-2" />
                                                    Customer Notes
                                                </h4>
                                                <p className="text-gray-300">{request.customer_notes}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Assignment Section */}
                                    <div className="space-y-4">
                                        {/* Current Assignment */}
                                        {request.assigned_mechanic ? (
                                            <div className="bg-green-900/20 border border-green-600 rounded-lg p-4">
                                                <h4 className="text-white font-medium mb-2 flex items-center">
                                                    <FiUserCheck className="mr-2" />
                                                    Assigned Mechanic
                                                </h4>
                                                <p className="text-green-400 font-medium">{request.mechanic_name}</p>
                                                <p className="text-gray-400 text-sm">Currently handling this request</p>
                                            </div>
                                        ) : (
                                            <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4">
                                                <h4 className="text-white font-medium mb-4 flex items-center">
                                                    <FiUserCheck className="mr-2" />
                                                    Assign Mechanic
                                                </h4>

                                                {loadingMechanics ? (
                                                    <div className="text-center py-4">
                                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {mechanics.map((mechanic) => (
                                                            <button
                                                                key={mechanic.mechanic_id}
                                                                onClick={() => assignMechanic(request.request_id, mechanic.mechanic_id)}
                                                                disabled={assigningRequest === request.request_id}
                                                                className="w-full text-left bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 p-3 rounded-lg transition-colors"
                                                            >
                                                                <p className="text-white font-medium">{mechanic.name}</p>
                                                                <p className="text-gray-400 text-sm">{mechanic.specialization}</p>
                                                                <p className="text-gray-400 text-xs">{mechanic.experience_years} years experience</p>
                                                            </button>
                                                        ))}

                                                        {mechanics.length === 0 && (
                                                            <p className="text-gray-400 text-sm">No mechanics available</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssignRequests;