import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiArrowLeft,
    FiCheckCircle,
    FiCalendar,
    FiUser,
    FiTruck,
    FiDollarSign,
    FiMessageSquare,
    FiSearch
} from 'react-icons/fi';

const JobHistory = () => {
    const navigate = useNavigate();
    const [completedJobs, setCompletedJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // Check if user is logged in and is a mechanic
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (!token || !user) {
            navigate('/login');
            return;
        }

        const userData = JSON.parse(user);
        if (userData.role !== 'mechanic') {
            navigate('/dashboard');
            return;
        }

        fetchCompletedJobs();
    }, [navigate]);

    const fetchCompletedJobs = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/service-requests/mechanic/jobs', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const result = await response.json();
                // Handle the correct API response format
                const jobs = result.success ? result.data : [];
                const completed = jobs.filter(job => job.status === 'completed');
                setCompletedJobs(completed);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Failed to fetch job history');
            }
        } catch (error) {
            console.error('Error fetching completed jobs:', error);
            setError('Error loading job history');
        } finally {
            setLoading(false);
        }
    };

    const filteredJobs = completedJobs.filter(job =>
        (job.service_name && job.service_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (job.customer_name && job.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (job.brand && job.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (job.model && job.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (job.registration_number && job.registration_number.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: 'url(/car2.jpg)',
                    backgroundAttachment: 'fixed'
                }}
            >
                <div className="min-h-screen bg-black bg-opacity-70 flex items-center justify-center">
                    <div className="text-white text-xl">Loading job history...</div>
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
            <div className="min-h-screen bg-black bg-opacity-70">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/mechanic-dashboard')}
                                className="flex items-center space-x-2 text-primary-400 hover:text-primary-300"
                            >
                                <FiArrowLeft />
                                <span>Back to Dashboard</span>
                            </button>
                        </div>
                        <h1 className="text-3xl font-bold text-white">Job History</h1>
                        <div className="w-32"></div> {/* Spacer for centering */}
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded mb-6">
                            {error}
                        </div>
                    )}

                    {/* Search Bar */}
                    <div className="card mb-6">
                        <div className="relative">
                            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400" />
                            <input
                                type="text"
                                placeholder="Search by service, customer, or vehicle..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input pl-10 w-full"
                            />
                        </div>
                    </div>

                    {/* Stats Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="card text-center">
                            <FiCheckCircle className="text-green-400 text-3xl mx-auto mb-2" />
                            <div className="text-2xl font-bold text-green-400 mb-1">{completedJobs.length}</div>
                            <p className="text-dark-300">Total Completed</p>
                        </div>
                        <div className="card text-center">
                            <FiDollarSign className="text-blue-400 text-3xl mx-auto mb-2" />
                            <div className="text-2xl font-bold text-blue-400 mb-1">
                                ₹{completedJobs.reduce((sum, job) => {
                                    const cost = parseFloat(job.final_cost) || parseFloat(job.estimated_cost) || 0;
                                    return sum + cost;
                                }, 0).toFixed(2)}
                            </div>
                            <p className="text-dark-300">Total Earnings</p>
                        </div>
                        <div className="card text-center">
                            <FiCalendar className="text-purple-400 text-3xl mx-auto mb-2" />
                            <div className="text-2xl font-bold text-purple-400 mb-1">
                                {completedJobs.filter(job => {
                                    if (!job.completion_date) return false;
                                    return new Date(job.completion_date).toDateString() === new Date().toDateString();
                                }).length}
                            </div>
                            <p className="text-dark-300">Completed Today</p>
                        </div>
                    </div>

                    {/* Completed Jobs List */}
                    <div className="card">
                        <h2 className="text-xl font-semibold text-white mb-6">Completed Jobs</h2>

                        {filteredJobs.length === 0 ? (
                            <div className="text-center py-12">
                                <FiCheckCircle className="text-dark-400 text-6xl mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-dark-300 mb-2">
                                    {searchTerm ? 'No jobs found' : 'No completed jobs yet'}
                                </h3>
                                <p className="text-dark-400">
                                    {searchTerm ? 'Try adjusting your search terms' : 'Completed jobs will appear here'}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredJobs.map((job) => (
                                    <div key={job.request_id} className="border border-dark-600 rounded-lg p-6 hover:border-dark-500 transition-colors">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-white">{job.service_name}</h3>
                                                    <span className="inline-block px-3 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                                                        COMPLETED
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                    <div className="flex items-center space-x-2">
                                                        <FiUser className="text-primary-400" />
                                                        <span className="text-dark-300">Customer:</span>
                                                        <span className="text-white">{job.customer_name}</span>
                                                    </div>

                                                    <div className="flex items-center space-x-2">
                                                        <FiTruck className="text-primary-400" />
                                                        <span className="text-dark-300">Vehicle:</span>
                                                        <span className="text-white">{job.registration_number} - {job.brand} {job.model} ({job.year})</span>
                                                    </div>

                                                    <div className="flex items-center space-x-2">
                                                        <FiCalendar className="text-primary-400" />
                                                        <span className="text-dark-300">Completed:</span>
                                                        <span className="text-white">
                                                            {job.completion_date ? new Date(job.completion_date).toLocaleDateString() : 'Recently'}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center space-x-2">
                                                        <FiDollarSign className="text-primary-400" />
                                                        <span className="text-dark-300">Final Cost:</span>
                                                        <span className="text-white">₹{job.final_cost || job.estimated_cost}</span>
                                                    </div>
                                                </div>

                                                {job.customer_notes && (
                                                    <div className="mt-3 p-3 bg-dark-700 rounded">
                                                        <div className="flex items-start space-x-2">
                                                            <FiMessageSquare className="text-blue-400 mt-1" />
                                                            <div>
                                                                <span className="text-dark-300 text-sm">Customer Notes:</span>
                                                                <p className="text-white text-sm mt-1">{job.customer_notes}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {job.mechanic_notes && (
                                                    <div className="mt-3 p-3 bg-primary-500/10 rounded">
                                                        <div className="flex items-start space-x-2">
                                                            <FiMessageSquare className="text-primary-400 mt-1" />
                                                            <div>
                                                                <span className="text-dark-300 text-sm">Your Notes:</span>
                                                                <p className="text-white text-sm mt-1">{job.mechanic_notes}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
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

export default JobHistory;