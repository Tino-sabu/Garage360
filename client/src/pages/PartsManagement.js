import React, { useState, useEffect } from 'react';
import { FiPackage, FiEdit2, FiSave, FiX, FiAlertTriangle, FiSearch, FiFilter, FiShoppingCart, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import Navbar from '../components/Navbar';
import PageHeader from '../components/PageHeader';
import { partsAPI } from '../config/api';

const PartsManagement = () => {
    const [parts, setParts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [stockFilter, setStockFilter] = useState('all');
    const [categories, setCategories] = useState([]);
    const [editingPart, setEditingPart] = useState(null);
    const [stockAction, setStockAction] = useState('set');
    const [stockValue, setStockValue] = useState('');
    const [partsStats, setPartsStats] = useState({
        total: 0,
        lowStock: 0,
        inStock: 0,
        totalValue: 0
    });

    // Fetch parts data
    const fetchParts = async () => {
        try {
            setLoading(true);
            const filters = {};
            if (categoryFilter !== 'all') filters.category = categoryFilter;

            const result = await partsAPI.getAllParts(filters);

            if (result.success) {
                setParts(result.data || []);

                // Calculate stats
                const total = result.data?.length || 0;
                const lowStock = result.data?.filter(part => part.current_stock <= part.stock_min).length || 0;
                const inStock = total - lowStock;
                const totalValue = result.data?.reduce((sum, part) => sum + (part.current_stock * part.avg_cost), 0) || 0;

                setPartsStats({ total, lowStock, inStock, totalValue });
            } else {
                setParts([]);
            }
        } catch (error) {
            console.error('Error fetching parts:', error);
            setParts([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch categories
    const fetchCategories = async () => {
        try {
            const result = await partsAPI.getCategories();
            if (result.success) {
                setCategories(result.data || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    useEffect(() => {
        fetchParts();
        fetchCategories();
    }, [categoryFilter]);

    // Update stock function
    const updateStock = async (partId, stockValue, action) => {
        try {
            const result = await partsAPI.updateStock(partId, stockValue, action);

            if (result.success) {
                await fetchParts();
                setEditingPart(null);
                setStockValue('');
                alert('✅ Stock updated successfully!');
            } else {
                alert(`❌ Error updating stock: ${result.message}`);
            }
        } catch (error) {
            console.error('Error updating stock:', error);
            alert('❌ Error updating stock. Please try again.');
        }
    };

    // Handle stock edit
    const handleStockEdit = (part) => {
        setEditingPart(part.id);
        setStockValue(part.current_stock.toString());
        setStockAction('set');
    };

    // Handle stock save
    const handleStockSave = (partId) => {
        if (!stockValue || stockValue < 0) {
            alert('Please enter a valid stock value');
            return;
        }
        updateStock(partId, stockValue, stockAction);
    };

    // Handle stock cancel
    const handleStockCancel = () => {
        setEditingPart(null);
        setStockValue('');
    };

    // Filter parts based on search term, category, and stock status
    const filteredParts = parts.filter(part => {
        const matchesSearch = part.part_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            part.part_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            part.category.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCategory = categoryFilter === 'all' || part.category === categoryFilter;

        let matchesStock = true;
        if (stockFilter === 'low') {
            matchesStock = part.current_stock <= part.stock_min;
        } else if (stockFilter === 'in-stock') {
            matchesStock = part.current_stock > part.stock_min;
        }

        return matchesSearch && matchesCategory && matchesStock;
    });

    const goBack = () => {
        window.history.back();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-900">
                <Navbar />
                <div className="flex items-center justify-center h-64">
                    <div className="text-white">Loading parts inventory...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <Navbar />
            <PageHeader title="Parts Inventory Manager" />

            <div
                className="min-h-[calc(100vh-7rem)] bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: 'url(/car2.jpg)',
                    backgroundAttachment: 'fixed'
                }}
            >
                {/* Dark overlay for better readability */}
                <div className="min-h-full bg-black bg-opacity-70">
                    <div className="container mx-auto px-3 xs:px-4 sm:px-6 py-4 sm:py-8 max-w-7xl">

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 xs:gap-4 sm:gap-6 mb-4 sm:mb-8">
                            <div className="card text-center">
                                <FiPackage className="text-blue-400 text-2xl mx-auto mb-2" />
                                <div className="text-2xl font-bold text-blue-400 mb-1">{partsStats.total}</div>
                                <p className="text-dark-300 text-sm">Total Parts</p>
                            </div>

                            <div className="card text-center">
                                <FiTrendingUp className="text-green-400 text-2xl mx-auto mb-2" />
                                <div className="text-2xl font-bold text-green-400 mb-1">{partsStats.inStock}</div>
                                <p className="text-dark-300 text-sm">In Stock</p>
                            </div>

                            <div className="card text-center">
                                <FiTrendingDown className="text-red-400 text-2xl mx-auto mb-2" />
                                <div className="text-2xl font-bold text-red-400 mb-1">{partsStats.lowStock}</div>
                                <p className="text-dark-300 text-sm">Low Stock</p>
                            </div>

                            <div className="card text-center">
                                <FiShoppingCart className="text-yellow-400 text-2xl mx-auto mb-2" />
                                <div className="text-2xl font-bold text-yellow-400 mb-1">₹{partsStats.totalValue.toLocaleString()}</div>
                                <p className="text-dark-300 text-sm">Total Value</p>
                            </div>
                        </div>

                        {/* Search and Filters */}
                        <div className="card mb-4 sm:mb-8">
                            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                                <div className="flex items-center space-x-2 bg-dark-700 rounded-lg px-3 py-2 flex-1 max-w-md">
                                    <FiSearch className="text-dark-300" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, code, or category..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="bg-transparent text-white placeholder-dark-300 outline-none flex-1"
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-2">
                                    <div className="flex items-center space-x-2">
                                        <FiFilter className="text-dark-300" />
                                        <select
                                            value={categoryFilter}
                                            onChange={(e) => setCategoryFilter(e.target.value)}
                                            className="bg-dark-700 border border-dark-600 text-white px-3 py-2 rounded-lg"
                                        >
                                            <option value="all">All Categories</option>
                                            {categories.map((category) => (
                                                <option key={category} value={category}>{category}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <FiPackage className="text-dark-300" />
                                        <select
                                            value={stockFilter}
                                            onChange={(e) => setStockFilter(e.target.value)}
                                            className="bg-dark-700 border border-dark-600 text-white px-3 py-2 rounded-lg"
                                        >
                                            <option value="all">All Stock Levels</option>
                                            <option value="in-stock">In Stock</option>
                                            <option value="low">Low Stock</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Parts Table */}
                        <div className="card">
                            <div className="overflow-x-auto">
                                {filteredParts.length === 0 ? (
                                    <div className="text-center py-12">
                                        <FiPackage className="text-dark-400 text-4xl mx-auto mb-4" />
                                        <p className="text-dark-300 text-lg">No parts found</p>
                                        <p className="text-dark-400 text-sm mt-2">
                                            {searchTerm || categoryFilter !== 'all' || stockFilter !== 'all'
                                                ? 'Try adjusting your search or filter criteria'
                                                : 'No parts have been added to inventory yet'
                                            }
                                        </p>
                                    </div>
                                ) : (
                                    <table className="w-full">
                                        <thead className="bg-dark-700 sticky top-0">
                                            <tr>
                                                <th className="text-left p-4 text-white font-medium">Part Details</th>
                                                <th className="text-left p-4 text-white font-medium">Category</th>
                                                <th className="text-left p-4 text-white font-medium">Current Stock</th>
                                                <th className="text-left p-4 text-white font-medium">Min Stock</th>
                                                <th className="text-left p-4 text-white font-medium">Status</th>
                                                <th className="text-left p-4 text-white font-medium">Cost (₹)</th>
                                                <th className="text-left p-4 text-white font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredParts.map((part) => (
                                                <tr key={part.id} className="border-b border-dark-600 hover:bg-dark-700/50">
                                                    <td className="p-4">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                                                                <FiPackage className="text-white text-sm" />
                                                            </div>
                                                            <div>
                                                                <p className="text-white font-medium">{part.part_name}</p>
                                                                <p className="text-dark-300 text-sm font-mono">{part.part_code}</p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="p-4">
                                                        <span className="px-2 py-1 bg-dark-600 text-dark-200 rounded text-sm">
                                                            {part.category}
                                                        </span>
                                                    </td>

                                                    {/* Stock Column with Edit Functionality */}
                                                    <td className="p-4">
                                                        {editingPart === part.id ? (
                                                            <div className="flex items-center space-x-2">
                                                                <select
                                                                    value={stockAction}
                                                                    onChange={(e) => setStockAction(e.target.value)}
                                                                    className="bg-dark-600 text-white text-xs px-2 py-1 rounded"
                                                                >
                                                                    <option value="set">Set</option>
                                                                    <option value="add">Add</option>
                                                                    <option value="subtract">Remove</option>
                                                                </select>
                                                                <input
                                                                    type="number"
                                                                    value={stockValue}
                                                                    onChange={(e) => setStockValue(e.target.value)}
                                                                    className="bg-dark-600 text-white w-16 px-2 py-1 rounded text-sm"
                                                                    min="0"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <span className={`font-semibold ${part.current_stock <= part.stock_min
                                                                ? 'text-red-400'
                                                                : 'text-green-400'
                                                                }`}>
                                                                {part.current_stock} {part.stock_unit}
                                                            </span>
                                                        )}
                                                    </td>

                                                    <td className="p-4 text-orange-300">{part.stock_min}</td>

                                                    {/* Stock Status */}
                                                    <td className="p-4">
                                                        {part.current_stock <= part.stock_min ? (
                                                            <span className="flex items-center text-red-400 text-sm">
                                                                <FiAlertTriangle size={14} className="mr-1" />
                                                                Low Stock
                                                            </span>
                                                        ) : (
                                                            <span className="text-green-400 text-sm">In Stock</span>
                                                        )}
                                                    </td>

                                                    <td className="p-4 text-dark-300">₹{part.avg_cost}</td>

                                                    {/* Actions */}
                                                    <td className="p-4">
                                                        {editingPart === part.id ? (
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    onClick={() => handleStockSave(part.id)}
                                                                    className="text-green-400 hover:text-green-300 p-1 hover:bg-green-400/10 rounded"
                                                                    title="Save"
                                                                >
                                                                    <FiSave size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={handleStockCancel}
                                                                    className="text-red-400 hover:text-red-300 p-1 hover:bg-red-400/10 rounded"
                                                                    title="Cancel"
                                                                >
                                                                    <FiX size={16} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleStockEdit(part)}
                                                                className="text-blue-400 hover:text-blue-300 p-1 hover:bg-blue-400/10 rounded"
                                                                title="Edit Stock"
                                                            >
                                                                <FiEdit2 size={16} />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>

                        {/* Footer Summary */}
                        {filteredParts.length > 0 && (
                            <div className="mt-6 p-4 bg-dark-800 rounded-lg">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-dark-300">
                                        Showing {filteredParts.length} of {parts.length} parts
                                    </span>
                                    <div className="flex space-x-4">
                                        <span className="text-green-400">
                                            In Stock: {filteredParts.filter(p => p.current_stock > p.stock_min).length}
                                        </span>
                                        <span className="text-red-400">
                                            Low Stock: {filteredParts.filter(p => p.current_stock <= p.stock_min).length}
                                        </span>
                                        <span className="text-yellow-400">
                                            Total Value: ₹{filteredParts.reduce((sum, p) => sum + (p.current_stock * p.avg_cost), 0).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PartsManagement;