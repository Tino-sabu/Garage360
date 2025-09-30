import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiArrowLeft,
    FiCheckCircle,
    FiClock,
    FiTool,
    FiCreditCard,
    FiDollarSign,
    FiFileText,
    FiTruck,
    FiCalendar,
    FiUser,
    FiPhone
} from 'react-icons/fi';
import Navbar from '../components/Navbar';

const ServiceTracking = () => {
    const navigate = useNavigate();
    const [serviceRequests, setServiceRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [paymentProcessing, setPaymentProcessing] = useState({});

    useEffect(() => {
        fetchServiceRequests();
    }, []);

    const fetchServiceRequests = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Please log in to view your services');
                setLoading(false);
                return;
            }

            const response = await fetch('http://localhost:5000/api/service-requests/customer', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                console.log('API Response:', result); // Debug log
                setServiceRequests(result.success ? result.data : []);
            } else {
                const errorText = await response.text();
                console.error('Response error:', response.status, response.statusText, errorText);
                setError(`Failed to fetch service requests. Status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error fetching service requests:', error);
            setError('Failed to load service tracking data');
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async (requestId, amount) => {
        setPaymentProcessing(prev => ({ ...prev, [requestId]: true }));

        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Show payment simulation message
            alert(`Payment Simulation Complete!\n\nAmount: ${formatCurrency(amount)}\nRequest ID: ${requestId}\n\nIn a real system, this would integrate with a payment gateway like Stripe, PayPal, or Razorpay.`);

        } catch (error) {
            console.error('Payment error:', error);
            alert('Payment simulation failed. Please try again.');
        } finally {
            setPaymentProcessing(prev => ({ ...prev, [requestId]: false }));
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'in_progress':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            case 'pending':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'cancelled':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status) {
            case 'paid':
                return 'bg-green-500/20 text-green-400';
            case 'pending':
                return 'bg-yellow-500/20 text-yellow-400';
            case 'failed':
                return 'bg-red-500/20 text-red-400';
            default:
                return 'bg-gray-500/20 text-gray-400';
        }
    };

    const formatCurrency = (amount) => {
        return '₹' + new Intl.NumberFormat('en-IN').format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not completed';
        return new Date(dateString).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'long',
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
            className="min-h-screen bg-cover bg-center bg-no-repeat"
            style={{
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url('/pic3.jpg')`
            }}
        >
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center mb-8">
                    <button
                        onClick={() => navigate('/customer-dashboard')}
                        className="flex items-center text-white hover:text-blue-400 transition-colors mr-6"
                    >
                        <FiArrowLeft className="mr-2" size={20} />
                        Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-bold text-white">Track Your Services</h1>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-600 text-white p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                {/* Service Requests */}
                {serviceRequests.length === 0 ? (
                    <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center">
                        <FiTool className="text-gray-400 text-6xl mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-white mb-2">No Service Requests Found</h2>
                        <p className="text-gray-400 mb-6">You haven't booked any services yet.</p>
                        <button
                            onClick={() => navigate('/my-vehicles')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                        >
                            Book a Service
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {serviceRequests.map((request) => (
                            <div key={request.request_id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                                {/* Header with Status */}
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-xl font-semibold text-white mb-2">
                                            {request.service_name || 'Service Request'}
                                        </h2>
                                        <p className="text-gray-400">
                                            Request ID: #{request.request_id}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(request.status)}`}>
                                        {request.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                </div>

                                {/* Vehicle Information */}
                                <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
                                    <h3 className="text-white font-medium mb-3 flex items-center">
                                        <FiTruck className="mr-2" />
                                        Vehicle Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-gray-300">
                                                <span className="text-gray-400">Vehicle:</span> {request.brand} {request.model} ({request.year})
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-300">
                                                <span className="text-gray-400">Registration:</span> {request.registration_number}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-gray-300">
                                                <span className="text-gray-400">Scheduled:</span> {formatDate(request.scheduled_date)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Completion Time */}
                                {request.completion_date && (
                                    <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
                                        <h3 className="text-white font-medium mb-3 flex items-center">
                                            <FiClock className="mr-2" />
                                            Completion Time
                                        </h3>
                                        <p className="text-gray-300">{formatDate(request.completion_date)}</p>
                                    </div>
                                )}

                                {/* Cost Information */}
                                <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
                                    <h3 className="text-white font-medium mb-3 flex items-center">
                                        <FiDollarSign className="mr-2" />
                                        Cost Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-gray-400 text-sm">Estimated Cost</p>
                                            <p className="text-gray-300 font-medium">{formatCurrency(request.estimated_cost)}</p>
                                        </div>
                                        {request.final_cost && (
                                            <div>
                                                <p className="text-gray-400 text-sm">Final Cost</p>
                                                <p className="text-white font-medium text-lg">{formatCurrency(request.final_cost)}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Customer Notes */}
                                {request.customer_notes && (
                                    <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
                                        <h3 className="text-white font-medium mb-3 flex items-center">
                                            <FiFileText className="mr-2" />
                                            Your Notes
                                        </h3>
                                        <p className="text-gray-300">{request.customer_notes}</p>
                                    </div>
                                )}

                                {/* Mechanic Notes */}
                                {request.mechanic_notes && (
                                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-4">
                                        <h3 className="text-white font-medium mb-3 flex items-center">
                                            <FiTool className="mr-2 text-blue-400" />
                                            Mechanic's Notes
                                        </h3>
                                        <p className="text-gray-300">{request.mechanic_notes}</p>
                                    </div>
                                )}

                                {/* Mechanic Information */}
                                {request.mechanic_name && (
                                    <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
                                        <h3 className="text-white font-medium mb-3 flex items-center">
                                            <FiUser className="mr-2" />
                                            Assigned Mechanic
                                        </h3>
                                        <p className="text-gray-300 font-medium">{request.mechanic_name}</p>
                                    </div>
                                )}

                                {/* Payment Section - Show for completed services with final cost */}
                                {request.status === 'completed' && request.final_cost && (
                                    <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="text-white font-medium flex items-center">
                                                    <FiCreditCard className="mr-2 text-green-400" />
                                                    Payment Required
                                                </h3>
                                                <p className="text-gray-300 mt-1">
                                                    Final Amount: <span className="text-green-400 font-semibold text-lg">{formatCurrency(request.final_cost)}</span>
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => handlePayment(request.request_id, request.final_cost)}
                                                disabled={paymentProcessing[request.request_id]}
                                                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center"
                                            >
                                                {paymentProcessing[request.request_id] ? (
                                                    <>
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        Processing...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FiCreditCard className="mr-2" />
                                                        Pay Now
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ServiceTracking;