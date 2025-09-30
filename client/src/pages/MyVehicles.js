import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiTruck, FiPlus, FiEdit3, FiTrash2, FiCalendar, FiDroplet, FiHash, FiArrowLeft, FiActivity, FiClock } from 'react-icons/fi';
import Navbar from '../components/Navbar';

const MyVehicles = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Get pre-selected service from Services page
    const selectedService = location.state?.selectedService;
    const fromServices = location.state?.fromServices;

    const [user, setUser] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get user data from localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        } else {
            navigate('/login');
            return;
        }

        fetchVehicles();
    }, [navigate]);

    const fetchVehicles = async () => {
        const userData = localStorage.getItem('user');
        if (!userData) return;

        const user = JSON.parse(userData);
        console.log('User object in MyVehicles:', user);

        // For customers, the login API returns customer_id as 'id'
        const customerId = user.role === 'customer' ? user.id : (user.customer_id || user.user_id || user.id);
        console.log('Customer ID for fetching vehicles:', customerId);

        if (!customerId) {
            console.error('No customer ID found');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/vehicles/customer/${customerId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Vehicles fetched:', data);
                setVehicles(data.data);
            } else {
                console.error('Failed to fetch vehicles, status:', response.status);
                const errorData = await response.json();
                console.error('Error data:', errorData);
            }
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteVehicle = async (vehicleId, registrationNumber) => {
        if (!window.confirm(`Are you sure you want to delete vehicle ${registrationNumber}? This action cannot be undone.`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/vehicles/${vehicleId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                alert('Vehicle deleted successfully!');
                fetchVehicles(); // Refresh the list
            } else {
                const data = await response.json();
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error('Error deleting vehicle:', error);
            alert('Failed to delete vehicle. Please try again.');
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getFuelTypeIcon = (fuelType) => {
        switch (fuelType?.toLowerCase()) {
            case 'electric':
                return '⚡';
            case 'diesel':
                return '⛽';
            case 'hybrid':
                return '🔋';
            case 'cng':
                return '💨';
            default:
                return '⛽';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white">Loading your vehicles...</div>
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
            <div className="min-h-screen bg-black bg-opacity-70">
                <Navbar />

                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center">
                            <button
                                onClick={() => navigate('/customer-dashboard')}
                                className="mr-4 p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                            >
                                <FiArrowLeft className="text-white text-xl" />
                            </button>
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">My Vehicles</h1>
                                <p className="text-gray-300">Manage your registered vehicles</p>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/add-vehicle')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center"
                        >
                            <FiPlus className="mr-2" />
                            Add New Vehicle
                        </button>
                    </div>

                    {/* Vehicles List */}
                    {vehicles.length === 0 ? (
                        <div className="card text-center py-16">
                            <FiTruck className="text-6xl text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">No Vehicles Found</h3>
                            <p className="text-gray-400 mb-6">You haven't added any vehicles yet. Add your first vehicle to get started!</p>
                            <button
                                onClick={() => navigate('/add-vehicle')}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors inline-flex items-center"
                            >
                                <FiPlus className="mr-2" />
                                Add Your First Vehicle
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {vehicles.map((vehicle) => (
                                <div key={vehicle.vehicle_id} className="card hover:bg-gray-700 transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center">
                                            <FiTruck className="text-blue-400 text-2xl mr-3" />
                                            <div>
                                                <h3 className="text-lg font-semibold text-white">
                                                    {vehicle.brand} {vehicle.model}
                                                </h3>
                                                <p className="text-gray-400 text-sm">{vehicle.year}</p>
                                            </div>
                                        </div>

                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => navigate(`/edit-vehicle/${vehicle.vehicle_id}`)}
                                                className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-600 rounded-lg transition-colors"
                                                title="Edit vehicle"
                                            >
                                                <FiEdit3 />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteVehicle(vehicle.vehicle_id, vehicle.registration_number)}
                                                className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-600 rounded-lg transition-colors"
                                                title="Delete vehicle"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center text-gray-300">
                                            <FiHash className="mr-2 text-sm" />
                                            <span className="font-medium">{vehicle.registration_number}</span>
                                        </div>

                                        {vehicle.color && (
                                            <div className="flex items-center text-gray-300">
                                                <div className="w-4 h-4 rounded-full mr-2 bg-gradient-to-r from-gray-400 to-gray-600"></div>
                                                <span>{vehicle.color}</span>
                                            </div>
                                        )}

                                        <div className="flex items-center text-gray-300">
                                            <span className="mr-2">{getFuelTypeIcon(vehicle.fuel_type)}</span>
                                            <span className="capitalize">{vehicle.fuel_type || 'Petrol'}</span>
                                        </div>

                                        {vehicle.km_driven && (
                                            <div className="flex items-center text-gray-300">
                                                <FiActivity className="mr-2 text-sm" />
                                                <span>{vehicle.km_driven.toLocaleString()} km</span>
                                            </div>
                                        )}

                                        {vehicle.last_oil_change && (
                                            <div className="flex items-center text-gray-300">
                                                <FiClock className="mr-2 text-sm" />
                                                <span>Oil changed: {formatDate(vehicle.last_oil_change)}</span>
                                            </div>
                                        )}

                                        <div className="flex items-center text-gray-400 text-sm">
                                            <FiCalendar className="mr-2" />
                                            <span>Added on {formatDate(vehicle.created_at)}</span>
                                        </div>

                                        {/* Additional Details (if available) */}
                                        {(vehicle.vin || vehicle.engine_number || vehicle.chassis_number) && (
                                            <div className="border-t border-gray-600 pt-3 mt-3">
                                                <p className="text-gray-400 text-sm mb-2">Technical Details:</p>
                                                <div className="space-y-1 text-xs text-gray-500">
                                                    {vehicle.vin && (
                                                        <div>VIN: {vehicle.vin}</div>
                                                    )}
                                                    {vehicle.engine_number && (
                                                        <div>Engine: {vehicle.engine_number}</div>
                                                    )}
                                                    {vehicle.chassis_number && (
                                                        <div>Chassis: {vehicle.chassis_number}</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex space-x-2 mt-6">
                                        <button
                                            onClick={() => navigate('/book-service', {
                                                state: {
                                                    vehicle,
                                                    selectedService: selectedService,
                                                    fromServices: fromServices
                                                }
                                            })}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors text-sm"
                                        >
                                            Book Service
                                        </button>
                                        <button
                                            onClick={() => navigate(`/service-history/${vehicle.vehicle_id}`)}
                                            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors text-sm"
                                        >
                                            History
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Summary */}
                    {vehicles.length > 0 && (
                        <div className="card mt-8">
                            <h3 className="text-lg font-semibold text-white mb-4">Vehicle Summary</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-400">{vehicles.length}</div>
                                    <div className="text-gray-400 text-sm">Total Vehicles</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-400">
                                        {new Set(vehicles.map(v => v.brand)).size}
                                    </div>
                                    <div className="text-gray-400 text-sm">Brands</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-400">
                                        {Math.round(vehicles.reduce((acc, v) => acc + v.year, 0) / vehicles.length)}
                                    </div>
                                    <div className="text-gray-400 text-sm">Avg. Year</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-yellow-400">
                                        {new Set(vehicles.map(v => v.fuel_type)).size}
                                    </div>
                                    <div className="text-gray-400 text-sm">Fuel Types</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyVehicles;