import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTruck, FiSave, FiArrowLeft, FiUser, FiHash, FiCalendar, FiTool, FiDroplet, FiActivity, FiClock } from 'react-icons/fi';
import Navbar from '../components/Navbar';

const AddVehicle = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState('');
    const [formData, setFormData] = useState({
        registration_number: '',
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        color: '',
        fuel_type: 'petrol',
        vin: '',
        engine_number: '',
        chassis_number: '',
        km_driven: '',
        last_oil_change: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        // Get user data from localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        } else {
            navigate('/login');
            return;
        }

        // Fetch brands
        fetchBrands();
    }, [navigate]);

    const fetchBrands = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/vehicles/brands', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setBrands(data.data);
            } else {
                console.error('Failed to fetch brands');
            }
        } catch (error) {
            console.error('Error fetching brands:', error);
        }
    };

    const fetchModels = async (brand) => {
        if (!brand) {
            setModels([]);
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/vehicles/brands/${encodeURIComponent(brand)}/models`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setModels(data.data);
            } else {
                console.error('Failed to fetch models');
                setModels([]);
            }
        } catch (error) {
            console.error('Error fetching models:', error);
            setModels([]);
        }
    };

    const handleBrandChange = (brand) => {
        setSelectedBrand(brand);
        setFormData(prev => ({
            ...prev,
            brand: brand,
            model: '' // Reset model when brand changes
        }));
        fetchModels(brand);
        // Clear brand error if it exists
        if (errors.brand) {
            setErrors(prev => ({ ...prev, brand: '' }));
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.registration_number.trim()) {
            newErrors.registration_number = 'Registration number is required';
        }

        if (!formData.brand) {
            newErrors.brand = 'Brand is required';
        }

        if (!formData.model) {
            newErrors.model = 'Model is required';
        }

        if (!formData.year || formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
            newErrors.year = `Year must be between 1900 and ${new Date().getFullYear() + 1}`;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (!user) {
            alert('User not found. Please log in again.');
            navigate('/login');
            return;
        }

        // Debug: log user object to see what fields are available
        console.log('User object:', user);

        // For customers, the login API returns customer_id as 'id'
        // For other roles, we might need to use role-specific IDs
        const customerId = user.role === 'customer' ? user.id : (user.customer_id || user.user_id || user.id);
        console.log('Customer ID to use:', customerId);

        if (!customerId) {
            alert('Unable to identify customer. Please log in again.');
            navigate('/login');
            return;
        }

        setLoading(true);

        try {
            const vehicleData = {
                ...formData,
                customer_id: customerId
            };

            console.log('Vehicle data being sent:', vehicleData);

            const response = await fetch('http://localhost:5000/api/vehicles', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(vehicleData)
            });

            const data = await response.json();

            if (response.ok) {
                alert('Vehicle added successfully!');
                navigate('/customer-dashboard'); // Navigate back to customer dashboard
            } else {
                console.error('Server error:', data);
                alert(`Error: ${data.message}`);
            }
        } catch (error) {
            console.error('Error adding vehicle:', error);
            alert('Failed to add vehicle. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1950 + 2 }, (_, i) => currentYear + 1 - i);

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
                    <div className="flex items-center mb-8">
                        <button
                            onClick={() => navigate('/customer-dashboard')}
                            className="mr-4 p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                        >
                            <FiArrowLeft className="text-white text-xl" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Add New Vehicle</h1>
                            <p className="text-gray-300">Add your vehicle details to get started with our services</p>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="card max-w-4xl mx-auto">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Customer Info */}
                            <div className="bg-gray-800 p-4 rounded-lg">
                                <div className="flex items-center mb-3">
                                    <FiUser className="text-blue-400 mr-2" />
                                    <h3 className="text-lg font-semibold text-white">Vehicle Owner</h3>
                                </div>
                                <p className="text-gray-300">{user?.name} ({user?.email})</p>
                            </div>

                            {/* Vehicle Basic Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="registration_number" className="block text-sm font-medium text-gray-300 mb-2">
                                        <FiHash className="inline mr-1" />
                                        Registration Number *
                                    </label>
                                    <input
                                        type="text"
                                        id="registration_number"
                                        name="registration_number"
                                        value={formData.registration_number}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 bg-gray-800 border rounded-md focus:outline-none focus:ring-2 text-white ${errors.registration_number ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                                            }`}
                                        placeholder="e.g., KA01AB1234"
                                    />
                                    {errors.registration_number && (
                                        <p className="text-red-500 text-sm mt-1">{errors.registration_number}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="year" className="block text-sm font-medium text-gray-300 mb-2">
                                        <FiCalendar className="inline mr-1" />
                                        Year *
                                    </label>
                                    <select
                                        id="year"
                                        name="year"
                                        value={formData.year}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 bg-gray-800 border rounded-md focus:outline-none focus:ring-2 text-white ${errors.year ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                                            }`}
                                    >
                                        {years.map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                    {errors.year && (
                                        <p className="text-red-500 text-sm mt-1">{errors.year}</p>
                                    )}
                                </div>
                            </div>

                            {/* Brand and Model */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="brand" className="block text-sm font-medium text-gray-300 mb-2">
                                        <FiTruck className="inline mr-1" />
                                        Brand *
                                    </label>
                                    <select
                                        id="brand"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={(e) => handleBrandChange(e.target.value)}
                                        className={`w-full px-3 py-2 bg-gray-800 border rounded-md focus:outline-none focus:ring-2 text-white ${errors.brand ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                                            }`}
                                    >
                                        <option value="">Select Brand</option>
                                        {brands.map(brand => (
                                            <option key={brand} value={brand}>{brand}</option>
                                        ))}
                                    </select>
                                    {errors.brand && (
                                        <p className="text-red-500 text-sm mt-1">{errors.brand}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="model" className="block text-sm font-medium text-gray-300 mb-2">
                                        <FiTruck className="inline mr-1" />
                                        Model *
                                    </label>
                                    <select
                                        id="model"
                                        name="model"
                                        value={formData.model}
                                        onChange={handleInputChange}
                                        disabled={!selectedBrand}
                                        className={`w-full px-3 py-2 bg-gray-800 border rounded-md focus:outline-none focus:ring-2 text-white disabled:opacity-50 disabled:cursor-not-allowed ${errors.model ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'
                                            }`}
                                    >
                                        <option value="">Select Model</option>
                                        {models.map(model => (
                                            <option key={model} value={model}>{model}</option>
                                        ))}
                                    </select>
                                    {errors.model && (
                                        <p className="text-red-500 text-sm mt-1">{errors.model}</p>
                                    )}
                                </div>
                            </div>

                            {/* Additional Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="color" className="block text-sm font-medium text-gray-300 mb-2">
                                        Color
                                    </label>
                                    <input
                                        type="text"
                                        id="color"
                                        name="color"
                                        value={formData.color}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                                        placeholder="e.g., Red, Blue, White"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="fuel_type" className="block text-sm font-medium text-gray-300 mb-2">
                                        <FiDroplet className="inline mr-1" />
                                        Fuel Type
                                    </label>
                                    <select
                                        id="fuel_type"
                                        name="fuel_type"
                                        value={formData.fuel_type}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                                    >
                                        <option value="petrol">Petrol</option>
                                        <option value="diesel">Diesel</option>
                                        <option value="electric">Electric</option>
                                        <option value="hybrid">Hybrid</option>
                                        <option value="cng">CNG</option>
                                    </select>
                                </div>
                            </div>

                            {/* Usage Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="km_driven" className="block text-sm font-medium text-gray-300 mb-2">
                                        <FiActivity className="inline mr-1" />
                                        Kilometers Driven
                                    </label>
                                    <input
                                        type="number"
                                        id="km_driven"
                                        name="km_driven"
                                        value={formData.km_driven}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                                        placeholder="e.g., 15000"
                                        min="0"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="last_oil_change" className="block text-sm font-medium text-gray-300 mb-2">
                                        <FiClock className="inline mr-1" />
                                        Last Oil Change
                                    </label>
                                    <input
                                        type="date"
                                        id="last_oil_change"
                                        name="last_oil_change"
                                        value={formData.last_oil_change}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                                        placeholder="dd-mm-yyyy"
                                    />
                                </div>
                            </div>

                            {/* Optional Technical Details */}
                            <div className="bg-gray-800 p-4 rounded-lg">
                                <h3 className="text-lg font-semibold text-white mb-4">
                                    <FiTool className="inline mr-2" />
                                    Technical Details (Optional)
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label htmlFor="vin" className="block text-sm font-medium text-gray-300 mb-2">
                                            VIN Number
                                        </label>
                                        <input
                                            type="text"
                                            id="vin"
                                            name="vin"
                                            value={formData.vin}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                                            placeholder="17 character VIN"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="engine_number" className="block text-sm font-medium text-gray-300 mb-2">
                                            Engine Number
                                        </label>
                                        <input
                                            type="text"
                                            id="engine_number"
                                            name="engine_number"
                                            value={formData.engine_number}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                                            placeholder="Engine number"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="chassis_number" className="block text-sm font-medium text-gray-300 mb-2">
                                            Chassis Number
                                        </label>
                                        <input
                                            type="text"
                                            id="chassis_number"
                                            name="chassis_number"
                                            value={formData.chassis_number}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                                            placeholder="Chassis number"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={() => navigate('/customer-dashboard')}
                                    className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    <FiSave className="mr-2" />
                                    {loading ? 'Adding...' : 'Add Vehicle'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddVehicle;