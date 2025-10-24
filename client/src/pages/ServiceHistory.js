import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiArrowLeft,
    FiCheckCircle,
    FiClock,
    FiTool,
    FiDollarSign,
    FiFileText,
    FiTruck,
    FiCalendar,
    FiUser,
    FiDownload
} from 'react-icons/fi';
import Navbar from '../components/Navbar';
import { serviceRequestsAPI } from '../config/api';

const ServiceHistory = () => {
    const navigate = useNavigate();
    const [completedServices, setCompletedServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCompletedServices();
    }, []);

    const fetchCompletedServices = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user) {
                setError('Please log in to view your service history');
                setLoading(false);
                return;
            }

            const result = await serviceRequestsAPI.getCustomerRequests(user.id);
            if (result.success) {
                const completed = result.data.filter(service => service.status === 'completed');
                setCompletedServices(completed);
            } else {
                setError('Failed to load service history');
            }
        } catch (error) {
            console.error('Error fetching service history:', error);
            setError('Network error occurred while loading service history');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return '₹' + new Intl.NumberFormat('en-IN').format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not specified';
        return new Date(dateString).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getDaysAgo = (dateString) => {
        if (!dateString) return '';
        const completionDate = new Date(dateString);
        const today = new Date();
        const diffTime = Math.abs(today - completionDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return '1 day ago';
        if (diffDays < 30) return `${diffDays} days ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
        return `${Math.floor(diffDays / 365)} year${Math.floor(diffDays / 365) > 1 ? 's' : ''} ago`;
    };

    if (loading) {
        return (
            <div
                className="min-h-screen relative"
                style={{
                    backgroundImage: 'url(/pic2.jpeg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed'
                }}
            >
                <div className="absolute inset-0 bg-black bg-opacity-70"></div>
                <div className="relative z-10 flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-white text-lg">Loading service history...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen relative"
            style={{
                backgroundImage: 'url(/pic2.jpeg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            }}
        >
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black bg-opacity-70"></div>

            <div className="relative z-10">
                <Navbar />

                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center">
                            <button
                                onClick={() => navigate('/customer-dashboard')}
                                className="flex items-center justify-center text-white hover:text-blue-400 transition-colors mr-6 bg-gray-700 hover:bg-gray-600 w-10 h-10 rounded-lg"
                            >
                                <FiArrowLeft size={20} />
                            </button>
                            <div>
                                <h1 className="text-4xl font-bold text-white flex items-center">
                                    <FiClock className="mr-3 text-orange-400" />
                                    Service History
                                </h1>
                                <p className="text-gray-300 mt-2 text-lg">View all your completed service records</p>
                            </div>
                        </div>

                        {completedServices.length > 0 && (
                            <div className="text-right bg-white bg-opacity-10 backdrop-blur-sm p-4 rounded-lg border border-white border-opacity-20">
                                <p className="text-white text-xl font-bold">{completedServices.length} Completed Service{completedServices.length !== 1 ? 's' : ''}</p>
                                <p className="text-gray-300 text-sm">Total saved in your history</p>
                            </div>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-500 bg-opacity-80 backdrop-blur-sm text-white p-4 rounded-lg mb-6 flex items-center border border-red-400 border-opacity-30">
                            <FiFileText className="mr-3" size={20} />
                            {error}
                        </div>
                    )}

                    {/* Service History */}
                    {completedServices.length === 0 ? (
                        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-12 border border-white border-opacity-20 text-center">
                            <FiCheckCircle className="text-gray-400 text-8xl mx-auto mb-6" />
                            <h2 className="text-3xl font-bold text-white mb-4">No Service History Found</h2>
                            <p className="text-gray-300 mb-8 text-lg">You haven't completed any services yet. Start by booking your first service!</p>
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={() => navigate('/my-vehicles')}
                                    className="bg-blue-600 bg-opacity-80 hover:bg-opacity-100 text-white px-8 py-3 rounded-lg transition-all duration-300 flex items-center backdrop-blur-sm border border-blue-400 border-opacity-30"
                                >
                                    <FiTruck className="mr-2" />
                                    View My Vehicles
                                </button>
                                <button
                                    onClick={() => navigate('/book-service')}
                                    className="bg-green-600 bg-opacity-80 hover:bg-opacity-100 text-white px-8 py-3 rounded-lg transition-all duration-300 flex items-center backdrop-blur-sm border border-green-400 border-opacity-30"
                                >
                                    <FiCalendar className="mr-2" />
                                    Book Service
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {completedServices.map((service) => {
                                // Extract nested data
                                const vehicle = service.vehicles || {};
                                const mechanic = service.mechanics || {};
                                const serviceInfo = service.service_request_services?.[0]?.services || {};

                                return (
                                    <div key={service.request_id} className="bg-white bg-opacity-10 backdrop-blur-md rounded-xl p-6 border border-white border-opacity-20">

                                        {/* Header with Completion Badge */}
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-start space-x-4">
                                                <div className="bg-green-500 bg-opacity-20 p-3 rounded-full backdrop-blur-sm border border-green-400 border-opacity-30">
                                                    <FiCheckCircle className="text-green-400 text-xl" />
                                                </div>
                                                <div>
                                                    <h2 className="text-2xl font-bold text-white mb-1">
                                                        {serviceInfo.name || 'Service Request'}
                                                    </h2>
                                                    <p className="text-gray-300 text-sm">
                                                        Request ID: #{service.request_id} • Completed {getDaysAgo(service.completion_date)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className="bg-green-500 bg-opacity-20 text-green-400 px-4 py-2 rounded-full text-sm font-bold border border-green-400 border-opacity-30 mb-2 backdrop-blur-sm">
                                                    COMPLETED
                                                </div>
                                                {service.final_cost && (
                                                    <p className="text-white font-bold text-xl">{formatCurrency(service.final_cost)}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Service Details Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

                                            {/* Vehicle Information */}
                                            <div className="bg-white bg-opacity-5 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-10">
                                                <h3 className="text-white font-bold mb-3 flex items-center">
                                                    <FiTruck className="mr-2 text-blue-400" />
                                                    Vehicle Details
                                                </h3>
                                                <div className="space-y-2">
                                                    <p className="text-gray-300">
                                                        <span className="text-gray-400">Vehicle:</span> {vehicle.brand || 'N/A'} {vehicle.model || ''}
                                                    </p>
                                                    <p className="text-gray-300">
                                                        <span className="text-gray-400">Registration:</span> {vehicle.registration_number || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Service Timeline */}
                                            <div className="bg-white bg-opacity-5 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-10">
                                                <h3 className="text-white font-bold mb-3 flex items-center">
                                                    <FiCalendar className="mr-2 text-purple-400" />
                                                    Service Timeline
                                                </h3>
                                                <div className="space-y-2">
                                                    <p className="text-gray-300 text-sm">
                                                        <span className="text-gray-400">Scheduled:</span> {formatDate(service.scheduled_date)}
                                                    </p>
                                                    <p className="text-gray-300 text-sm">
                                                        <span className="text-gray-400">Completed:</span> {formatDate(service.completion_date)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Mechanic Information */}
                                        {mechanic.name && (
                                            <div className="bg-blue-500 bg-opacity-10 backdrop-blur-sm border border-blue-400 border-opacity-30 rounded-lg p-4 mb-6">
                                                <h3 className="text-white font-bold mb-3 flex items-center">
                                                    <FiUser className="mr-2 text-blue-400" />
                                                    Service Technician
                                                </h3>
                                                <p className="text-gray-300 font-medium">{mechanic.name}</p>
                                            </div>
                                        )}

                                        {/* Cost Breakdown */}
                                        <div className="bg-white bg-opacity-5 backdrop-blur-sm rounded-lg p-4 mb-6 border border-white border-opacity-10">
                                            <h3 className="text-white font-bold mb-3 flex items-center">
                                                <FiDollarSign className="mr-2 text-green-400" />
                                                Cost Summary
                                            </h3>
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="text-gray-400 text-sm">Estimated Cost</p>
                                                    <p className="text-gray-300 text-lg font-medium">{formatCurrency(service.estimated_cost)}</p>
                                                </div>
                                                {service.final_cost && (
                                                    <div className="text-right">
                                                        <p className="text-gray-400 text-sm">Final Amount Paid</p>
                                                        <p className="text-green-400 font-bold text-2xl">{formatCurrency(service.final_cost)}</p>
                                                    </div>
                                                )}
                                            </div>
                                            {service.final_cost !== service.estimated_cost && (
                                                <div className="mt-3 pt-3 border-t border-white border-opacity-20">
                                                    <p className="text-sm text-gray-300">
                                                        Difference:
                                                        <span className={`ml-1 font-bold ${service.final_cost > service.estimated_cost ? 'text-red-400' : 'text-green-400'}`}>
                                                            {service.final_cost > service.estimated_cost ? '+' : ''}{formatCurrency(service.final_cost - service.estimated_cost)}
                                                        </span>
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Service Notes */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                            {/* Customer Notes */}
                                            {service.customer_notes && (
                                                <div className="bg-white bg-opacity-5 backdrop-blur-sm rounded-lg p-4 border border-white border-opacity-10">
                                                    <h3 className="text-white font-bold mb-3 flex items-center">
                                                        <FiFileText className="mr-2 text-yellow-400" />
                                                        Your Notes
                                                    </h3>
                                                    <p className="text-gray-300 text-sm">{service.customer_notes}</p>
                                                </div>
                                            )}

                                            {/* Mechanic Notes */}
                                            {service.mechanic_notes && (
                                                <div className="bg-blue-500 bg-opacity-10 backdrop-blur-sm border border-blue-400 border-opacity-30 rounded-lg p-4">
                                                    <h3 className="text-white font-bold mb-3 flex items-center">
                                                        <FiTool className="mr-2 text-blue-400" />
                                                        Technician's Report
                                                    </h3>
                                                    <p className="text-gray-300 text-sm">{service.mechanic_notes}</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex justify-end mt-6 pt-4 border-t border-white border-opacity-20">
                                            <button
                                                onClick={() => {
                                                    // This could open a detailed view or download receipt
                                                    alert(`Service details for Request #${service.request_id}\n\nIn a full implementation, this would:\n• Show detailed receipt\n• Download PDF report\n• Allow you to book similar service again`);
                                                }}
                                                className="text-blue-400 hover:text-blue-300 transition-colors flex items-center text-sm bg-white bg-opacity-10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white border-opacity-20 hover:bg-opacity-20"
                                            >
                                                <FiDownload className="mr-1" size={14} />
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ServiceHistory;