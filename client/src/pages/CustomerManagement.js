import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiArrowLeft, FiSearch, FiUsers } from 'react-icons/fi';
import Navbar from '../components/Navbar';

const CustomerManagement = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [customerStats, setCustomerStats] = useState({
        total: 0
    });

    // Fetch customers data
    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/customers', {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setCustomers(data.data || []);

                // Calculate stats
                const total = data.data?.length || 0;

                setCustomerStats({ total });
            } else {
                console.error('Failed to fetch customers:', response.status);
                setCustomers([]);
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
            setCustomers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    // Filter customers based on search term and status
    const filteredCustomers = customers.filter(customer => {
        const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            customer.phone.includes(searchTerm);

        return matchesSearch;
    });

    const goBack = () => {
        window.history.back();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-900">
                <Navbar />
                <div className="flex items-center justify-center h-64">
                    <div className="text-white">Loading customers...</div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen bg-cover bg-center bg-no-repeat"
            style={{
                backgroundImage: 'url(/car2.jpg)',
                backgroundAttachment: 'fixed'
            }}
        >
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={goBack}
                            className="text-dark-300 hover:text-white p-2 rounded-lg hover:bg-dark-700"
                        >
                            <FiArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Customer Management</h1>
                            <p className="text-dark-300 mt-1">View and manage all registered customers</p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mb-8 max-w-md">
                    <div className="card text-center">
                        <FiUsers className="text-blue-400 text-2xl mx-auto mb-2" />
                        <div className="text-2xl font-bold text-blue-400 mb-1">{customerStats.total}</div>
                        <p className="text-dark-300 text-sm">Total Customers</p>
                    </div>
                </div>

                {/* Search */}
                <div className="card mb-8">
                    <div className="flex items-center space-x-2 bg-dark-700 rounded-lg px-3 py-2 max-w-md">
                        <FiSearch className="text-dark-300" />
                        <input
                            type="text"
                            placeholder="Search customers by name, email, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent text-white placeholder-dark-300 outline-none flex-1"
                        />
                    </div>
                </div>

                {/* Customers Table */}
                <div className="card">
                    <div className="overflow-x-auto">
                        {filteredCustomers.length === 0 ? (
                            <div className="text-center py-12">
                                <FiUser className="text-dark-400 text-4xl mx-auto mb-4" />
                                <p className="text-dark-300 text-lg">No customers found</p>
                                <p className="text-dark-400 text-sm mt-2">
                                    {searchTerm
                                        ? 'Try adjusting your search criteria'
                                        : 'No customers have been registered yet'
                                    }
                                </p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-dark-700">
                                    <tr>
                                        <th className="text-left p-4 text-white font-medium">Customer ID</th>
                                        <th className="text-left p-4 text-white font-medium">Name</th>
                                        <th className="text-left p-4 text-white font-medium">Contact Info</th>
                                        <th className="text-left p-4 text-white font-medium">Address</th>
                                        <th className="text-left p-4 text-white font-medium">Registration Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCustomers.map((customer) => (
                                        <tr key={customer.customer_id || customer.id} className="border-b border-dark-600 hover:bg-dark-700/50">
                                            <td className="p-4 text-white font-mono">
                                                #{customer.customer_id || customer.id}
                                            </td>

                                            <td className="p-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                                                        <FiUser className="text-white text-sm" />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium">{customer.name}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="p-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center space-x-2 text-dark-300">
                                                        <FiMail size={14} />
                                                        <span className="text-sm">{customer.email}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2 text-dark-300">
                                                        <FiPhone size={14} />
                                                        <span className="text-sm">{customer.phone}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="p-4">
                                                <div className="flex items-center space-x-2 text-dark-300">
                                                    <FiMapPin size={14} />
                                                    <span className="text-sm">{customer.address || 'Not provided'}</span>
                                                </div>
                                            </td>

                                            <td className="p-4">
                                                <div className="flex items-center space-x-2 text-dark-300">
                                                    <FiCalendar size={14} />
                                                    <span className="text-sm">
                                                        {new Date(customer.created_at).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Footer Summary */}
                {filteredCustomers.length > 0 && (
                    <div className="mt-6 p-4 bg-dark-800 rounded-lg">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-dark-300">
                                Showing {filteredCustomers.length} of {customers.length} customers
                            </span>
                            <div className="flex space-x-4">
                                <span className="text-green-400">
                                    Active: {filteredCustomers.filter(c => c.status === 'active').length}
                                </span>
                                <span className="text-red-400">
                                    Inactive: {filteredCustomers.filter(c => c.status === 'inactive').length}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerManagement;