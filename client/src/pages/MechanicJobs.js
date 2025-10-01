import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiArrowLeft,
    FiUser,
    FiTruck,
    FiCalendar,
    FiClock,
    FiTag,
    FiMessageSquare,
    FiPlay,
    FiCheck,
    FiPause,
    FiEye,
    FiEdit3
} from 'react-icons/fi';

const MechanicJobs = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingJob, setUpdatingJob] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedJob, setSelectedJob] = useState(null);
    const [mechanicNotes, setMechanicNotes] = useState('');
    const [finalCost, setFinalCost] = useState('');
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [currentAction, setCurrentAction] = useState('');

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

        fetchJobs();
    }, [navigate]);

    const fetchJobs = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/service-requests/mechanic/jobs', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.success) {
                setJobs(data.data);
            } else {
                setError('Failed to load assigned jobs');
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
            setError('Failed to load assigned jobs');
        } finally {
            setLoading(false);
        }
    };

    const handleJobAction = async (jobId, action, notes = '', cost = '') => {
        setUpdatingJob(jobId);
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/service-requests/mechanic/jobs/${jobId}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action,
                    mechanic_notes: notes,
                    final_cost: cost ? parseFloat(cost) : undefined
                })
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(data.message);
                fetchJobs(); // Refresh the jobs list
                setShowNotesModal(false);
                setMechanicNotes('');
                setFinalCost('');
            } else {
                setError(data.message || `Failed to ${action} job`);
            }
        } catch (error) {
            console.error(`Error ${action} job:`, error);
            setError(`Failed to ${action} job`);
        } finally {
            setUpdatingJob(null);
        }
    };

    const openNotesModal = (job, action) => {
        setSelectedJob(job);
        setCurrentAction(action);
        setMechanicNotes(job.mechanic_notes || '');
        setFinalCost(action === 'complete' ? (job.final_cost || job.estimated_cost || '') : '');
        setShowNotesModal(true);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-600';
            case 'in-progress': return 'bg-blue-600';
            case 'completed': return 'bg-green-600';
            case 'cancelled': return 'bg-red-600';
            default: return 'bg-gray-600';
        }
    };

    const getActionButtons = (job) => {
        const buttons = [];

        switch (job.status) {
            case 'pending':
                buttons.push(
                    <button
                        key="start"
                        onClick={() => handleJobAction(job.request_id, 'start')}
                        disabled={updatingJob === job.request_id}
                        className="flex items-center bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                        <FiPlay className="mr-1" size={14} />
                        Start Job
                    </button>
                );
                break;

            case 'in-progress':
                buttons.push(
                    <button
                        key="complete"
                        onClick={() => openNotesModal(job, 'complete')}
                        disabled={updatingJob === job.request_id}
                        className="flex items-center bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors mr-2"
                    >
                        <FiCheck className="mr-1" size={14} />
                        Complete
                    </button>
                );
                buttons.push(
                    <button
                        key="queue"
                        onClick={() => handleJobAction(job.request_id, 'queue')}
                        disabled={updatingJob === job.request_id}
                        className="flex items-center bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                        <FiPause className="mr-1" size={14} />
                        Queue
                    </button>
                );
                break;

            case 'completed':
                buttons.push(
                    <span key="completed" className="text-green-400 text-sm">
                        ✅ Completed
                    </span>
                );
                break;

            default:
                break;
        }

        return buttons;
    };

    const filteredJobs = filterStatus === 'all'
        ? jobs
        : jobs.filter(job => job.status === filterStatus);

    const formatCurrency = (amount) => {
        if (!amount) return 'N/A';
        return '₹' + new Intl.NumberFormat('en-IN').format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatTime = (minutes) => {
        if (!minutes) return 'N/A';
        if (minutes < 60) {
            return `${minutes} mins`;
        } else {
            const hours = Math.floor(minutes / 60);
            const remainingMins = minutes % 60;
            return remainingMins > 0 ? `${hours}h ${remainingMins}m` : `${hours} hours`;
        }
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
                backgroundImage: 'url(/car3.jpg)',
                backgroundAttachment: 'fixed'
            }}
        >
            {/* Dark overlay for better readability */}
            <div className="min-h-screen bg-black bg-opacity-70">
                <div className="container mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center">
                            <button
                                onClick={() => navigate('/mechanic-dashboard')}
                                className="flex items-center text-white hover:text-blue-400 transition-colors mr-6"
                            >
                                <FiArrowLeft size={20} />
                            </button>
                            <h1 className="text-3xl font-bold text-white">My Jobs</h1>
                        </div>
                    </div>

                    {/* Success/Error Messages */}
                    {success && (
                        <div className="bg-green-600 text-white p-4 rounded-lg mb-6">
                            {success}
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-600 text-white p-4 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    {/* Filter Section */}
                    <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
                        <div className="flex items-center space-x-4">
                            <span className="text-white font-medium">Filter by Status:</span>
                            <div className="flex space-x-2">
                                {['all', 'pending', 'in-progress', 'completed'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setFilterStatus(status)}
                                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${filterStatus === status
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            }`}
                                    >
                                        {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Jobs List */}
                    <div className="space-y-4">
                        {filteredJobs.length === 0 ? (
                            <div className="bg-gray-800 rounded-lg p-8 text-center border border-gray-700">
                                <FiEye size={48} className="mx-auto text-gray-500 mb-4" />
                                <p className="text-gray-400">No jobs assigned yet</p>
                            </div>
                        ) : (
                            filteredJobs.map((job) => (
                                <div key={job.request_id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                        {/* Job Info */}
                                        <div className="lg:col-span-2">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h3 className="text-xl font-semibold text-white mb-2">
                                                        Job #{job.request_id}
                                                    </h3>
                                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium text-white ${getStatusColor(job.status)}`}>
                                                        {job.status}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-gray-400 text-sm">Scheduled</p>
                                                    <p className="text-white">{formatDate(job.scheduled_date)}</p>
                                                </div>
                                            </div>

                                            {/* Service Info */}
                                            <div className="bg-gray-700 rounded-lg p-4 mb-4">
                                                <h4 className="text-white font-medium mb-2">Service Details</h4>
                                                <p className="text-gray-300 font-medium">{job.service_name}</p>
                                                <p className="text-gray-400 text-sm mb-2">{job.service_description}</p>
                                                <div className="flex items-center space-x-4">
                                                    <span className="flex items-center text-green-400">
                                                        <FiTag className="mr-1" size={14} />
                                                        {formatCurrency(job.estimated_cost)}
                                                    </span>
                                                    <span className="flex items-center text-blue-400">
                                                        <FiClock className="mr-1" size={14} />
                                                        {formatTime(job.service_time)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Customer & Vehicle Info */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-gray-700 rounded-lg p-4">
                                                    <h4 className="text-white font-medium mb-2 flex items-center">
                                                        <FiUser className="mr-2" />
                                                        Customer
                                                    </h4>
                                                    <p className="text-gray-300">{job.customer_name}</p>
                                                    <p className="text-gray-400 text-sm">{job.customer_phone}</p>
                                                </div>

                                                <div className="bg-gray-700 rounded-lg p-4">
                                                    <h4 className="text-white font-medium mb-2 flex items-center">
                                                        <FiTruck className="mr-2" />
                                                        Vehicle
                                                    </h4>
                                                    <p className="text-gray-300">{job.brand} {job.model} ({job.year})</p>
                                                    <p className="text-gray-400 text-sm">{job.registration_number}</p>
                                                    <p className="text-gray-400 text-sm">{job.color} • {job.fuel_type}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Notes & Actions */}
                                        <div className="lg:col-span-2 space-y-4">
                                            {/* Customer Notes */}
                                            {job.customer_notes && (
                                                <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-4">
                                                    <h4 className="text-white font-medium mb-2 flex items-center">
                                                        <FiMessageSquare className="mr-2" />
                                                        Customer Notes
                                                    </h4>
                                                    <p className="text-blue-300">{job.customer_notes}</p>
                                                </div>
                                            )}

                                            {/* Mechanic Notes */}
                                            {job.mechanic_notes && (
                                                <div className="bg-green-900/20 border border-green-600 rounded-lg p-4">
                                                    <h4 className="text-white font-medium mb-2 flex items-center">
                                                        <FiEdit3 className="mr-2" />
                                                        My Notes
                                                    </h4>
                                                    <p className="text-green-300">{job.mechanic_notes}</p>
                                                </div>
                                            )}

                                            {/* Final Cost (if completed) */}
                                            {job.final_cost && job.status === 'completed' && (
                                                <div className="bg-gray-700 rounded-lg p-4">
                                                    <h4 className="text-white font-medium mb-2">Final Cost</h4>
                                                    <p className="text-green-400 font-bold">{formatCurrency(job.final_cost)}</p>
                                                </div>
                                            )}

                                            {/* Action Buttons */}
                                            <div className="flex items-center space-x-2">
                                                {getActionButtons(job)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Notes Modal */}
                    {showNotesModal && selectedJob && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
                                <h3 className="text-xl font-semibold text-white mb-4">
                                    {currentAction === 'complete' ? 'Complete Job' : 'Add Notes'}
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-white font-medium mb-2">
                                            Notes (Optional)
                                        </label>
                                        <textarea
                                            value={mechanicNotes}
                                            onChange={(e) => setMechanicNotes(e.target.value)}
                                            placeholder="Add any notes about the work performed..."
                                            rows={3}
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
                                        />
                                    </div>

                                    {currentAction === 'complete' && (
                                        <div>
                                            <label className="block text-white font-medium mb-2">
                                                Final Cost
                                            </label>
                                            <input
                                                type="number"
                                                value={finalCost}
                                                onChange={(e) => setFinalCost(e.target.value)}
                                                placeholder="Enter final cost"
                                                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex space-x-3 mt-6">
                                    <button
                                        onClick={() => setShowNotesModal(false)}
                                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => handleJobAction(selectedJob.request_id, currentAction, mechanicNotes, finalCost)}
                                        disabled={updatingJob === selectedJob.request_id}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                                    >
                                        {updatingJob === selectedJob.request_id ? 'Updating...' :
                                            currentAction === 'complete' ? 'Complete Job' : 'Update'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MechanicJobs;