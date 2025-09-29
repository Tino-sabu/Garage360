import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiArrowLeft, FiGrid, FiTruck } from 'react-icons/fi';
import Navbar from '../components/Navbar';

const CarTypes = () => {
    const [carTypes, setCarTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [brandFilter, setBrandFilter] = useState('all');
    const [bodyTypeFilter, setBodyTypeFilter] = useState('all');
    const [brands, setBrands] = useState([]);
    const [bodyTypes, setBodyTypes] = useState([]);
    const [carTypeStats, setCarTypeStats] = useState({
        total: 0,
        brands: 0,
        bodyTypes: 0
    });

    // Fetch car types data
    const fetchCarTypes = async () => {
        try {
            setLoading(true);
            const brandParam = brandFilter !== 'all' ? `brand=${encodeURIComponent(brandFilter)}` : '';
            const bodyTypeParam = bodyTypeFilter !== 'all' ? `body_type=${encodeURIComponent(bodyTypeFilter)}` : '';
            const searchParam = searchTerm ? `search=${encodeURIComponent(searchTerm)}` : '';

            const params = [brandParam, bodyTypeParam, searchParam].filter(Boolean).join('&');
            const url = `http://localhost:5000/api/cartypes${params ? `?${params}` : ''}`;

            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setCarTypes(data.data || []);

                // Calculate stats
                const total = data.data?.length || 0;
                const uniqueBrands = [...new Set(data.data?.map(car => car.brand))].length;
                const uniqueBodyTypes = [...new Set(data.data?.map(car => car.body_type))].length;

                setCarTypeStats({ total, brands: uniqueBrands, bodyTypes: uniqueBodyTypes });
            } else {
                console.error('Failed to fetch car types:', response.status);
                setCarTypes([]);
            }
        } catch (error) {
            console.error('Error fetching car types:', error);
            setCarTypes([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch brands and body types for filters
    const fetchFilters = async () => {
        try {
            const [brandsResponse, bodyTypesResponse] = await Promise.all([
                fetch('http://localhost:5000/api/cartypes/brands'),
                fetch('http://localhost:5000/api/cartypes/body-types')
            ]);

            if (brandsResponse.ok) {
                const brandsData = await brandsResponse.json();
                setBrands(brandsData.data || []);
            }

            if (bodyTypesResponse.ok) {
                const bodyTypesData = await bodyTypesResponse.json();
                setBodyTypes(bodyTypesData.data || []);
            }
        } catch (error) {
            console.error('Error fetching filters:', error);
        }
    };

    useEffect(() => {
        fetchCarTypes();
    }, [brandFilter, bodyTypeFilter, searchTerm]);

    useEffect(() => {
        fetchFilters();
    }, []);

    const goBack = () => {
        window.history.back();
    };

    const getCarImage = (model) => {
        const modelLower = model.toLowerCase().replace(/\s+/g, '').replace(/-/g, '');
        switch (modelLower) {
            // Maruti Suzuki
            case 'baleno':
                return '/baleno.webp';
            case 'dzire':
                return '/Dzire.webp';
            case 'ertiga':
                return '/ertiga.png';
            case 'swift':
                return '/swift.webp';
            case 'creta':
                return '/creta.webp';
            // Honda
            case 'civic':
                return '/civic.avif';
            case 'crv':
                return '/crv.avif';
            case 'amaze':
                return '/honda_amaze.avif';
            case 'city':
                return '/honda_city.png';
            // Toyota
            case 'camry':
                return '/camry.avif';
            case 'corolla':
                return '/corolla.avif';
            case 'fortuner':
                return '/fortuner.avif';
            case 'innovacrysta':
                return '/crysta.webp';
            // Hyundai
            case 'i20':
                return '/i20.avif';
            case 'verna':
                return '/verna.avif';
            case 'tucson':
                return '/tucson.jpg';
            // Tata
            case 'harrier':
                return '/harrier.avif';
            case 'nexon':
                return '/nexon.avif';
            case 'nexonev':
                return '/nexon-ev.jpg';
            case 'safari':
                return '/safari.webp';
            // Mahindra
            case 'scorpio':
                return '/scorpio.avif';
            case 'thar':
                return '/thar.jpg';
            case 'xuv700':
                return '/xuv700.avif';
            // Kia
            case 'seltos':
                return '/seltos.png';
            case 'sonet':
                return '/sonet.avif';
            // BMW
            case '3series':
                return '/bmw3series.png';
            // Mercedes
            case 'cclass':
                return '/cclass.jpg';
            // Audi
            case 'a4':
                return '/audia4.avif';
            // Tesla
            case 'model3':
                return '/model3.webp';
            // MG
            case 'zsev':
                return '/zs-ev.avif';
            default:
                return null; // No specific image for other models
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black">
                <div className="flex items-center justify-center h-64">
                    <div className="text-white text-lg">Loading services...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            <div className="min-h-screen">                <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={goBack}
                            className="text-gray-100 hover:text-white p-2 rounded-lg hover:bg-white hover:bg-opacity-20 backdrop-blur-sm"
                        >
                            <FiArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-4xl font-bold text-white drop-shadow-lg">Popular Models</h1>
                            <p className="text-gray-200 mt-1 drop-shadow">Explore the models that frequently visit us</p>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-gray-800 bg-opacity-90 rounded-lg p-6 mb-8 border border-gray-600">
                    <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center space-x-2 bg-gray-700 rounded-lg px-3 py-2 flex-1 max-w-md">
                            <FiSearch className="text-gray-300" />
                            <input
                                type="text"
                                placeholder="Search services by brand or model..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-transparent text-white placeholder-gray-300 outline-none flex-1"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="flex items-center space-x-2">
                                <FiFilter className="text-gray-300" />
                                <select
                                    value={brandFilter}
                                    onChange={(e) => setBrandFilter(e.target.value)}
                                    className="bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg"
                                >
                                    <option value="all">All Brands</option>
                                    {brands.map((brand) => (
                                        <option key={brand} value={brand}>{brand}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center space-x-2">
                                <FiTruck className="text-gray-300" />
                                <select
                                    value={bodyTypeFilter}
                                    onChange={(e) => setBodyTypeFilter(e.target.value)}
                                    className="bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg"
                                >
                                    <option value="all">All Categories</option>
                                    {bodyTypes.map((bodyType) => (
                                        <option key={bodyType} value={bodyType}>
                                            {bodyType.charAt(0).toUpperCase() + bodyType.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Services Display */}
                <div className="bg-gray-800 bg-opacity-90 rounded-lg p-6 border border-gray-600">
                    {carTypes.length === 0 ? (
                        <div className="text-center py-12">
                            <FiTruck className="text-gray-400 text-4xl mx-auto mb-4" />
                            <p className="text-gray-300 text-lg">No services found</p>
                            <p className="text-gray-400 text-sm mt-2">
                                {searchTerm || brandFilter !== 'all' || bodyTypeFilter !== 'all'
                                    ? 'Try adjusting your search or filter criteria'
                                    : 'No services have been added yet'
                                }
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {carTypes.map((car) => {
                                const carImage = getCarImage(car.model);
                                return (
                                    <div
                                        key={car.cartype_id}
                                        className="relative rounded-lg p-8 hover:scale-105 transition-all duration-300 border border-gray-300 shadow-lg overflow-hidden bg-gray-800 h-48"
                                        style={carImage ? {
                                            backgroundImage: `url(${carImage})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            backgroundRepeat: 'no-repeat'
                                        } : {}}
                                    >
                                        {/* Content */}
                                        <div className="relative z-10 flex flex-col justify-center h-full">
                                            <h3 className="text-2xl font-bold text-white mb-3 drop-shadow-2xl">
                                                {car.brand}
                                            </h3>
                                            <p className="text-xl text-gray-100 font-medium drop-shadow-2xl">
                                                {car.model}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>                {/* Footer Summary */}
                {carTypes.length > 0 && (
                    <div className="mt-6 p-4 bg-gray-800 bg-opacity-90 rounded-lg border border-gray-600">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-300">
                                Showing {carTypes.length} services available
                            </span>
                            <div className="flex space-x-4">
                                <span className="text-blue-400">
                                    Brands: {[...new Set(carTypes.map(c => c.brand))].length}
                                </span>
                                <span className="text-green-400">
                                    Models: {carTypes.length}
                                </span>
                                <span className="text-yellow-400">
                                    Categories: {[...new Set(carTypes.map(c => c.body_type))].length}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            </div>
        </div>
    );
};

export default CarTypes;