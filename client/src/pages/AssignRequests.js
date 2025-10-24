import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiUser,
    FiTruck,
    FiCalendar,
    FiClock,
    FiTag,
    FiMessageSquare,
    FiUserCheck,
    FiFilter,
    FiEye
} from 'react-icons/fi';
import { serviceRequestsAPI, mechanicsAPI } from '../config/api';
import Navbar from '../components/Navbar';
import PageHeader from '../components/PageHeader';

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
            const result = await serviceRequestsAPI.getAllRequests();
            if (result.success) {
                setServiceRequests(result.data);
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
            const result = await mechanicsAPI.getAllMechanics();

            if (result.success) {
                setMechanics(result.data);
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
            const result = await serviceRequestsAPI.assignMechanic(requestId, mechanicId);

            if (result.success) {
                setSuccess('Mechanic assigned successfully');
                fetchServiceRequests();
            } else {
                setError(result.message || 'Failed to assign mechanic');
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
        <div className="min-h-screen bg-gray-900">
            <Navbar />
            <PageHeader title="Assign Service Requests" />

            <div
                className="min-h-[calc(100vh-7rem)] bg-cover bg-center bg-no-repeat relative"
                style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url('/pic2.jpeg')`
                }}
            >
                <div className="container mx-auto px-3 xs:px-4 sm:px-6 py-4 sm:py-8 max-w-7xl">

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
                    <div className="bg-gray-800 rounded-lg p-3 xs:p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-700">
                        <div className="flex flex-col xs:flex-row items-start xs:items-center gap-3 xs:gap-4">
                            <div className="flex items-center gap-2">
                                <FiFilter className="text-white" size={18} />
                                <span className="text-white font-medium text-sm sm:text-base">Filter:</span>
                            </div>
                            <div className="flex flex-wrap gap-2 w-full xs:w-auto">
                                {['all', 'pending', 'in-progress', 'completed', 'cancelled'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setFilterStatus(status)}
                                        className={`px-2.5 xs:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${filterStatus === status
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
                            filteredRequests.map((request) => {
                                // Extract nested data
                                const customer = request.customers || {};
                                const vehicle = request.vehicles || {};
                                const mechanic = request.mechanics || {};
                                const serviceData = request.service_request_services?.[0]?.services || {};

                                return (
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
                                                        <p className="text-white">{formatDate(request.request_date || request.created_at)}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    {/* Customer Info */}
                                                    <div className="bg-gray-700 rounded-lg p-4">
                                                        <h4 className="text-white font-medium mb-2 flex items-center">
                                                            <FiUser className="mr-2" />
                                                            Customer
                                                        </h4>
                                                        <p className="text-gray-300">{customer.name || 'N/A'}</p>
                                                        <p className="text-gray-400 text-sm">{customer.email || 'N/A'}</p>
                                                        <p className="text-gray-400 text-sm">{customer.phone || 'N/A'}</p>
                                                    </div>

                                                    {/* Vehicle Info */}
                                                    <div className="bg-gray-700 rounded-lg p-4">
                                                        <h4 className="text-white font-medium mb-2 flex items-center">
                                                            <FiTruck className="mr-2" />
                                                            Vehicle
                                                        </h4>
                                                        <p className="text-gray-300">{vehicle.brand} {vehicle.model} ({vehicle.year || 'N/A'})</p>
                                                        <p className="text-gray-400 text-sm">{vehicle.registration_number}</p>
                                                    </div>
                                                </div>

                                                {/* Service Info */}
                                                <div className="bg-gray-700 rounded-lg p-4 mb-4">
                                                    <h4 className="text-white font-medium mb-2">Service Details</h4>
                                                    <p className="text-gray-300 font-medium">{serviceData.name || 'N/A'}</p>
                                                    <p className="text-gray-400 text-sm mb-2">{serviceData.description || 'No description'}</p>
                                                    <div className="flex items-center space-x-4">
                                                        <span className="flex items-center text-green-400">
                                                            <FiTag className="mr-1" size={14} />
                                                            {formatCurrency(request.estimated_cost || serviceData.base_price)}
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
                                                        <p className="text-green-400 font-medium">{mechanic.name || 'N/A'}</p>
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
                                                                        <p className="text-gray-400 text-sm">{mechanic.specialization || 'General'}</p>
                                                                        <p className="text-gray-400 text-xs">{mechanic.experience_years || 0} years experience</p>
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
                                )
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssignRequests;