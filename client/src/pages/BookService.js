import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiClock, FiTag, FiUser, FiTruck, FiMessageSquare, FiArrowLeft, FiCheck } from 'react-icons/fi';

const BookService = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Get vehicle data passed from MyVehicles page
    const vehicleData = location.state?.vehicle;

    // Get pre-selected service from Services page
    const preSelectedService = location.state?.selectedService;
    const fromServices = location.state?.fromServices;

    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [customerNotes, setCustomerNotes] = useState('');
    const [scheduledDate, setScheduledDate] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        // If coming from Services page with pre-selected service, set it
        if (fromServices && preSelectedService) {
            // Convert the Services page service format to match the API format
            const convertedService = {
                service_id: preSelectedService.id,
                name: preSelectedService.name,
                description: preSelectedService.description,
                base_price: parseInt(preSelectedService.price.replace(/[₹,\s-]/g, '').split('-')[0]) || 0,
                estimated_time: convertDurationToMinutes(preSelectedService.duration),
                category: preSelectedService.category
            };
            setSelectedService(convertedService);
            setLoading(false);
        } else if (vehicleData) {
            // Original flow from MyVehicles page
            fetchServices();
        } else {
            // No valid entry point
            navigate('/');
        }
    }, [navigate, vehicleData, fromServices, preSelectedService]);

    const fetchServices = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/services');
            const data = await response.json();

            if (data.success) {
                setServices(data.data);
            } else {
                setError('Failed to load services');
            }
        } catch (error) {
            console.error('Error fetching services:', error);
            setError('Failed to load services');
        } finally {
            setLoading(false);
        }
    };

    const handleServiceSelect = (service) => {
        setSelectedService(service);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedService) {
            setError('Please select a service');
            return;
        }

        if (!scheduledDate) {
            setError('Please select a preferred date');
            return;
        }

        // If coming from Services page without vehicle data, redirect to add vehicle
        if (fromServices && !vehicleData) {
            setError('Please add your vehicle details first');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/service-requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    vehicle_id: vehicleData.vehicle_id,
                    service_id: selectedService.service_id,
                    scheduled_date: scheduledDate,
                    customer_notes: customerNotes,
                    estimated_cost: selectedService.base_price
                })
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/my-vehicles');
                }, 2000);
            } else {
                setError(data.message || 'Failed to book service');
            }
        } catch (error) {
            console.error('Error booking service:', error);
            setError('Failed to book service. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const formatCurrency = (amount) => {
        return '₹' + new Intl.NumberFormat('en-IN').format(amount);
    };

    const formatTime = (minutes) => {
        if (minutes < 60) {
            return `${minutes} mins`;
        } else {
            const hours = Math.floor(minutes / 60);
            const remainingMins = minutes % 60;
            return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours} hours`;
        }
    };

    const convertDurationToMinutes = (duration) => {
        // Convert duration strings like "30-45 mins", "2-4 hours" to minutes
        const match = duration.match(/(\d+)[-\s]*(\d+)?\s*(mins?|hours?)/i);
        if (match) {
            const value = parseInt(match[1]);
            const unit = match[3].toLowerCase();
            if (unit.includes('hour')) {
                return value * 60;
            } else {
                return value;
            }
        }
        return 60; // default to 1 hour
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
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/pic3.jpg')`
            }}
        >
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center mb-8">
                    <button
                        onClick={() => navigate(fromServices ? '/services' : '/my-vehicles')}
                        className="flex items-center text-white hover:text-blue-400 transition-colors mr-6"
                    >
                        <FiArrowLeft className="mr-2" size={20} />
                        {fromServices ? 'Back to Services' : 'Back to My Vehicles'}
                    </button>
                    <h1 className="text-3xl font-bold text-white">Book Service</h1>
                </div>

                {/* Vehicle Info Card - Only show if we have vehicle data */}
                {vehicleData && (
                    <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                            <FiTruck className="mr-2" />
                            Vehicle Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-gray-400">Vehicle</p>
                                <p className="text-white font-medium">{vehicleData.brand} {vehicleData.model} ({vehicleData.year})</p>
                            </div>
                            <div>
                                <p className="text-gray-400">Registration</p>
                                <p className="text-white font-medium">{vehicleData.registration_number}</p>
                            </div>
                            <div>
                                <p className="text-gray-400">Fuel Type</p>
                                <p className="text-white font-medium capitalize">{vehicleData.fuel_type}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Service booking for users without vehicle data */}
                {fromServices && !vehicleData && (
                    <div className="bg-yellow-600 text-white p-4 rounded-lg mb-6 flex items-center">
                        <FiTruck className="mr-2" />
                        <div>
                            <p className="font-medium">Add Vehicle Required</p>
                            <p className="text-sm">Please add your vehicle details first to book this service.</p>
                            <button
                                onClick={() => navigate('/add-vehicle')}
                                className="mt-2 bg-white text-yellow-600 px-4 py-1 rounded text-sm font-medium hover:bg-gray-100"
                            >
                                Add Vehicle
                            </button>
                        </div>
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="bg-green-600 text-white p-4 rounded-lg mb-6 flex items-center">
                        <FiCheck className="mr-2" />
                        Service request submitted successfully! Redirecting...
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="bg-red-600 text-white p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Services List - Always show */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h2 className="text-xl font-semibold text-white mb-6">Select a Service</h2>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                            {services.map((service) => (
                                <div
                                    key={service.service_id}
                                    onClick={() => handleServiceSelect(service)}
                                    className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedService?.service_id === service.service_id
                                        ? 'border-blue-500 bg-blue-900/20'
                                        : 'border-gray-600 hover:border-gray-500 bg-gray-700/50'
                                        }`}
                                >
                                    <h3 className="text-white font-medium mb-2">{service.name}</h3>
                                    <p className="text-gray-400 text-sm mb-3">{service.description}</p>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center space-x-4">
                                            <span className="flex items-center text-green-400 text-sm">
                                                <FiTag className="mr-1" size={14} />
                                                {formatCurrency(service.base_price)}
                                            </span>
                                            <span className="flex items-center text-blue-400 text-sm">
                                                <FiClock className="mr-1" size={14} />
                                                {formatTime(service.estimated_time)}
                                            </span>
                                        </div>
                                        <span className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded capitalize">
                                            {service.category}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Booking Form */}
                    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                        <h2 className="text-xl font-semibold text-white mb-6">Booking Details</h2>                        {selectedService ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Selected Service Summary */}
                                <div className="bg-gray-700 rounded-lg p-4">
                                    <h3 className="text-white font-medium mb-2">Selected Service</h3>
                                    <p className="text-gray-300">{selectedService.name}</p>
                                    <div className="flex justify-between items-center mt-3">
                                        <span className="text-green-400 font-medium">
                                            Estimated Cost: {formatCurrency(selectedService.base_price)}
                                        </span>
                                        <span className="text-blue-400">
                                            Duration: {formatTime(selectedService.estimated_time)}
                                        </span>
                                    </div>
                                </div>

                                {/* Preferred Date */}
                                <div>
                                    <label className="block text-white font-medium mb-2">
                                        Preferred Date
                                    </label>
                                    <input
                                        type="date"
                                        value={scheduledDate}
                                        onChange={(e) => setScheduledDate(e.target.value)}
                                        min={new Date().toISOString().slice(0, 10)}
                                        required
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
                                    />
                                </div>

                                {/* Customer Notes */}
                                <div>
                                    <label className="block text-white font-medium mb-2">
                                        <FiMessageSquare className="inline mr-2" />
                                        Additional Notes (Optional)
                                    </label>
                                    <textarea
                                        value={customerNotes}
                                        onChange={(e) => setCustomerNotes(e.target.value)}
                                        placeholder="Any specific concerns or requests..."
                                        rows={4}
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={submitting || (fromServices && !vehicleData)}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                                >
                                    {submitting ? 'Submitting Request...' : 'Book Service'}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center text-gray-400 py-8">
                                <FiUser size={48} className="mx-auto mb-4 opacity-50" />
                                <p>{fromServices ? 'Service selected. Please complete the booking details above.' : 'Please select a service to continue with booking'}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default BookService;