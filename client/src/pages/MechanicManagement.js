import React, { useState, useEffect } from 'react';
import { FiMail, FiPhone, FiTool, FiCalendar, FiArrowLeft, FiSearch, FiUsers, FiBriefcase, FiAward } from 'react-icons/fi';
import Navbar from '../components/Navbar';

const MechanicManagement = () => {
    const [mechanics, setMechanics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [specializationFilter, setSpecializationFilter] = useState('all');
    const [mechanicStats, setMechanicStats] = useState({
        total: 0,
        avgExperience: 0
    });
    const [specializations, setSpecializations] = useState([]);

    // Fetch mechanics data
    const fetchMechanics = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:5000/api/mechanics', {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setMechanics(data.data || []);

                // Calculate stats
                const total = data.data?.length || 0;
                const avgExperience = total > 0 ?
                    Math.round(data.data.reduce((sum, m) => sum + (m.experience_years || 0), 0) / total) : 0;

                setMechanicStats({ total, avgExperience });

                // Extract unique specializations
                const uniqueSpecs = [...new Set(data.data?.map(m => m.specializations).filter(Boolean).flat())];
                setSpecializations(uniqueSpecs);
            } else {
                console.error('Failed to fetch mechanics:', response.status);
                setMechanics([]);
            }
        } catch (error) {
            console.error('Error fetching mechanics:', error);
            setMechanics([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMechanics();
    }, []);

    // Filter mechanics based on search term and specialization
    const filteredMechanics = mechanics.filter(mechanic => {
        const matchesSearch = mechanic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mechanic.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mechanic.phone.includes(searchTerm) ||
            mechanic.employee_id?.toString().includes(searchTerm);

        const matchesSpecialization = specializationFilter === 'all' ||
            (Array.isArray(mechanic.specializations) ?
                mechanic.specializations.includes(specializationFilter) :
                mechanic.specializations === specializationFilter);

        return matchesSearch && matchesSpecialization;
    });

    const goBack = () => {
        window.history.back();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-900">
                <Navbar />
                <div className="flex items-center justify-center h-64">
                    <div className="text-white">Loading mechanics...</div>
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
                            <h1 className="text-3xl font-bold text-white">Mechanic Management</h1>
                            <p className="text-dark-300 mt-1">View and manage all registered mechanics</p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="card text-center">
                        <FiUsers className="text-blue-400 text-2xl mx-auto mb-2" />
                        <div className="text-2xl font-bold text-blue-400 mb-1">{mechanicStats.total}</div>
                        <p className="text-dark-300 text-sm">Total Mechanics</p>
                    </div>

                    <div className="card text-center">
                        <FiAward className="text-orange-400 text-2xl mx-auto mb-2" />
                        <div className="text-2xl font-bold text-orange-400 mb-1">{mechanicStats.avgExperience}</div>
                        <p className="text-dark-300 text-sm">Average Experience (Years)</p>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="card mb-8">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex items-center space-x-2 bg-dark-700 rounded-lg px-3 py-2 flex-1 max-w-md">
                            <FiSearch className="text-dark-300" />
                            <input
                                type="text"
                                placeholder="Search by name, email, phone, or employee ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-transparent text-white placeholder-dark-300 outline-none flex-1"
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <FiTool className="text-dark-300" />
                            <select
                                value={specializationFilter}
                                onChange={(e) => setSpecializationFilter(e.target.value)}
                                className="bg-dark-700 border border-dark-600 text-white px-3 py-2 rounded-lg"
                            >
                                <option value="all">All Specializations</option>
                                {specializations.map((spec) => (
                                    <option key={spec} value={spec}>{spec}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Mechanics Table */}
                <div className="card">
                    <div className="overflow-x-auto">
                        {filteredMechanics.length === 0 ? (
                            <div className="text-center py-12">
                                <FiTool className="text-dark-400 text-4xl mx-auto mb-4" />
                                <p className="text-dark-300 text-lg">No mechanics found</p>
                                <p className="text-dark-400 text-sm mt-2">
                                    {searchTerm || specializationFilter !== 'all'
                                        ? 'Try adjusting your search or filter criteria'
                                        : 'No mechanics have been registered yet'
                                    }
                                </p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-dark-700">
                                    <tr>
                                        <th className="text-left p-4 text-white font-medium">Employee Info</th>
                                        <th className="text-left p-4 text-white font-medium">Personal Details</th>
                                        <th className="text-left p-4 text-white font-medium">Contact Info</th>
                                        <th className="text-left p-4 text-white font-medium">Professional Info</th>
                                        <th className="text-left p-4 text-white font-medium">Hire Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMechanics.map((mechanic) => (
                                        <tr key={mechanic.mechanic_id || mechanic.id} className="border-b border-dark-600 hover:bg-dark-700/50">
                                            <td className="p-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                                                        <FiTool className="text-white text-sm" />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium">{mechanic.name}</p>
                                                        <p className="text-dark-300 text-sm">ID: {mechanic.employee_id}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="p-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center space-x-2 text-blue-400">
                                                        <FiTool size={14} />
                                                        <span className="text-sm">
                                                            {Array.isArray(mechanic.specializations)
                                                                ? mechanic.specializations.join(', ')
                                                                : (mechanic.specializations || 'No specialization')}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-2 text-orange-400">
                                                        <FiBriefcase size={14} />
                                                        <span className="text-sm">{mechanic.experience_years} years exp.</span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="p-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center space-x-2 text-dark-300">
                                                        <FiMail size={14} />
                                                        <span className="text-sm">{mechanic.email}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2 text-dark-300">
                                                        <FiPhone size={14} />
                                                        <span className="text-sm">{mechanic.phone}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="p-4">
                                                <div className="space-y-1">
                                                    <div className="text-sm text-white">Rate: ₹ {mechanic.hourly_rate}/hr</div>
                                                    <div className="text-sm text-dark-300">
                                                        Verified: {mechanic.email_verified ? '✓' : '✗'} Email, {mechanic.phone_verified ? '✓' : '✗'} Phone
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="p-4">
                                                <div className="flex items-center space-x-2 text-dark-300">
                                                    <FiCalendar size={14} />
                                                    <span className="text-sm">
                                                        {new Date(mechanic.hire_date || mechanic.created_at).toLocaleDateString('en-US', {
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

                {/* Summary */}
                {filteredMechanics.length > 0 && (
                    <div className="card mt-6">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-dark-300">
                                Showing {filteredMechanics.length} of {mechanics.length} mechanics
                            </span>
                            <div className="flex space-x-4">
                                <span className="text-yellow-400">
                                    Specializations: {[...new Set(filteredMechanics.map(m => m.specializations).flat().filter(Boolean))].length}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MechanicManagement;