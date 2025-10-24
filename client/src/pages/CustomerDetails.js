import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiMail, FiPhone, FiMapPin, FiTruck, FiCalendar, FiTool, FiCheckCircle } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import API from '../config/api';

const CustomerDetails = () => {
    const { customerId } = useParams();
    const navigate = useNavigate();
    const [customer, setCustomer] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCustomerData();
    }, [customerId]);

    const fetchCustomerData = async () => {
        try {
            setLoading(true);

            // Fetch customer details
            const customerResult = await API.customers.getAllCustomers();
            if (customerResult.success) {
                const foundCustomer = customerResult.data.find(c => c.customer_id === parseInt(customerId));
                setCustomer(foundCustomer);
            }

            // Fetch customer vehicles with service history
            const vehiclesResult = await API.vehicles.getCustomerVehicles(customerId);
            if (vehiclesResult.success) {
                // For each vehicle, fetch its service requests
                const vehiclesWithServices = await Promise.all(
                    vehiclesResult.data.map(async (vehicle) => {
                        const servicesResult = await API.serviceRequests.getCustomerRequests(customerId);

                        // Filter services for this specific vehicle
                        const vehicleServices = servicesResult.success
                            ? servicesResult.data.filter(s => s.vehicle_id === vehicle.vehicle_id)
                            : [];

                        // Find the last completed service
                        const completedServices = vehicleServices.filter(s => s.status === 'completed');
                        const lastService = completedServices.length > 0
                            ? completedServices.sort((a, b) => new Date(b.completion_date) - new Date(a.completion_date))[0]
                            : null;

                        return {
                            ...vehicle,
                            lastServiceDate: lastService?.completion_date || null,
                            totalServices: vehicleServices.length,
                            completedServices: completedServices.length
                        };
                    })
                );

                setVehicles(vehiclesWithServices);
            }
        } catch (error) {
            console.error('Error fetching customer data:', error);
        } finally {
            setLoading(false);
        }
    };

    const goBack = () => {
        navigate('/customer-management');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-900">
                <Navbar />
                <div className="flex items-center justify-center h-64">
                    <div className="text-white">Loading customer details...</div>
                </div>
            </div>
        );
    }

    if (!customer) {
        return (
            <div className="min-h-screen bg-dark-900">
                <Navbar />
                <div className="flex items-center justify-center h-64">
                    <div className="text-white">Customer not found</div>
                </div>
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
            {/* Dark overlay */}
            <div className="min-h-screen bg-black bg-opacity-75">
                <Navbar />

                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex items-center space-x-4 mb-8">
                        <button
                            onClick={goBack}
                            className="text-dark-300 hover:text-white p-2 rounded-lg hover:bg-dark-700"
                        >
                            <FiArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Customer Details</h1>
                            <p className="text-dark-300 mt-1">View customer information and vehicle history</p>
                        </div>
                    </div>

                    {/* Customer Info Card */}
                    <div className="card mb-8">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center">
                                    <FiUser className="text-white text-2xl" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{customer.name}</h2>
                                    <p className="text-dark-300">Customer ID: #{customer.customer_id}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="flex items-center space-x-3">
                                <FiMail className="text-primary-400" />
                                <div>
                                    <p className="text-dark-300 text-sm">Email</p>
                                    <p className="text-white">{customer.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <FiPhone className="text-primary-400" />
                                <div>
                                    <p className="text-dark-300 text-sm">Phone</p>
                                    <p className="text-white">{customer.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <FiMapPin className="text-primary-400" />
                                <div>
                                    <p className="text-dark-300 text-sm">Address</p>
                                    <p className="text-white">{customer.address || 'Not provided'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-dark-600">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-dark-700 rounded-lg">
                                    <FiTruck className="text-blue-400 text-xl mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-blue-400">{vehicles.length}</div>
                                    <p className="text-dark-300 text-sm">Vehicles</p>
                                </div>
                                <div className="text-center p-4 bg-dark-700 rounded-lg">
                                    <FiTool className="text-yellow-400 text-xl mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-yellow-400">
                                        {vehicles.reduce((sum, v) => sum + v.totalServices, 0)}
                                    </div>
                                    <p className="text-dark-300 text-sm">Total Services</p>
                                </div>
                                <div className="text-center p-4 bg-dark-700 rounded-lg">
                                    <FiCheckCircle className="text-green-400 text-xl mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-green-400">
                                        {vehicles.reduce((sum, v) => sum + v.completedServices, 0)}
                                    </div>
                                    <p className="text-dark-300 text-sm">Completed</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Vehicles Section */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-white mb-4">Registered Vehicles</h2>

                        {vehicles.length === 0 ? (
                            <div className="card text-center py-12">
                                <FiTruck className="text-dark-400 text-4xl mx-auto mb-4" />
                                <p className="text-dark-300 text-lg">No vehicles registered</p>
                                <p className="text-dark-400 text-sm mt-2">This customer hasn't added any vehicles yet</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {vehicles.map((vehicle) => (
                                    <div key={vehicle.vehicle_id} className="card hover:shadow-xl transition-shadow">
                                        {/* Vehicle Header */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                                                    <FiTruck className="text-white text-xl" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-bold text-white">{vehicle.brand}</h3>
                                                    <p className="text-dark-300 text-sm">{vehicle.model}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Vehicle Details */}
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center py-2 border-b border-dark-600">
                                                <span className="text-dark-300 text-sm">Registration</span>
                                                <span className="text-white font-semibold">{vehicle.registration_number}</span>
                                            </div>

                                            <div className="flex justify-between items-center py-2 border-b border-dark-600">
                                                <span className="text-dark-300 text-sm">Year</span>
                                                <span className="text-white">{vehicle.year}</span>
                                            </div>

                                            <div className="flex justify-between items-center py-2 border-b border-dark-600">
                                                <span className="text-dark-300 text-sm">Color</span>
                                                <span className="text-white capitalize">{vehicle.color || 'N/A'}</span>
                                            </div>

                                            <div className="flex justify-between items-center py-2 border-b border-dark-600">
                                                <span className="text-dark-300 text-sm">Fuel Type</span>
                                                <span className="text-white capitalize">{vehicle.fuel_type || 'N/A'}</span>
                                            </div>

                                            <div className="flex justify-between items-center py-2 border-b border-dark-600">
                                                <span className="text-dark-300 text-sm">Mileage</span>
                                                <span className="text-white">{vehicle.mileage || 0} km</span>
                                            </div>

                                            {/* Service Info */}
                                            <div className="mt-4 pt-4 border-t border-dark-600">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-dark-300 text-sm">Last Service</span>
                                                    {vehicle.lastServiceDate ? (
                                                        <div className="flex items-center space-x-2">
                                                            <FiCalendar className="text-green-400 text-sm" />
                                                            <span className="text-green-400 text-sm">
                                                                {new Date(vehicle.lastServiceDate).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric'
                                                                })}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-orange-400 text-sm">No service yet</span>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <span className="text-dark-300 text-sm">Services Count</span>
                                                    <span className="text-blue-400 font-semibold">
                                                        {vehicle.completedServices} / {vehicle.totalServices}
                                                    </span>
                                                </div>
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

export default CustomerDetails;
