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
    FiEdit3,
    FiPackage,
    FiPlus,
    FiX,
    FiShoppingCart
} from 'react-icons/fi';
import { serviceRequestsAPI, partsAPI } from '../config/api';

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

    // Parts management
    const [availableParts, setAvailableParts] = useState([]);
    const [selectedParts, setSelectedParts] = useState([]);
    const [showPartsModal, setShowPartsModal] = useState(false);
    const [searchPart, setSearchPart] = useState('');

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
        fetchParts();
    }, [navigate]);

    const fetchJobs = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            // Use mechanic_id if available, otherwise use id
            const mechanicId = user.mechanic_id || user.id;
            const result = await serviceRequestsAPI.getMechanicJobs(mechanicId);

            if (result.success) {
                setJobs(result.data);
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

    const fetchParts = async () => {
        try {
            const result = await partsAPI.getAllParts();
            if (result.success) {
                setAvailableParts(result.data.filter(part => part.current_stock > 0));
            }
        } catch (error) {
            console.error('Error fetching parts:', error);
        }
    };

    const handleJobAction = async (jobId, action, notes = '', cost = '') => {
        setUpdatingJob(jobId);
        setError('');
        setSuccess('');

        try {
            const statusMap = {
                'start': 'in_progress',
                'pause': 'approved',
                'complete': 'completed',
                'queue': 'approved'
            };

            // If completing, handle parts first
            if (action === 'complete' && selectedParts.length > 0) {
                // Update parts inventory
                for (const part of selectedParts) {
                    const updateResult = await partsAPI.updateStock(
                        part.id,
                        part.quantity,
                        'subtract'
                    );

                    if (!updateResult.success) {
                        throw new Error(`Failed to update stock for ${part.part_name}`);
                    }
                }

                // Save parts to service_parts table
                const partsResult = await serviceRequestsAPI.addServiceParts(
                    jobId,
                    selectedParts
                );

                if (!partsResult.success) {
                    throw new Error('Failed to save service parts');
                }
            }

            const result = await serviceRequestsAPI.updateStatus(
                jobId,
                statusMap[action] || action,
                notes,
                cost || null
            );

            if (result.success) {
                setSuccess(`Job ${action === 'complete' ? 'completed' : action + 'd'} successfully`);
                fetchJobs();
                fetchParts(); // Refresh parts inventory
                setShowNotesModal(false);
                setShowPartsModal(false);
                setMechanicNotes('');
                setFinalCost('');
                setSelectedParts([]);
            } else {
                setError(result.message || `Failed to ${action} job`);
            }
        } catch (error) {
            console.error(`Error ${action} job:`, error);
            setError(error.message || `Failed to ${action} job`);
        } finally {
            setUpdatingJob(null);
        }
    };

    const openNotesModal = (job, action) => {
        setSelectedJob(job);
        setCurrentAction(action);
        setMechanicNotes(job.mechanic_notes || '');
        setFinalCost(action === 'complete' ? (job.final_cost || job.estimated_cost || '') : '');
        setSelectedParts([]);
        setShowNotesModal(true);
    };

    const addPartToJob = (part) => {
        const existingPart = selectedParts.find(p => p.id === part.id);
        if (existingPart) {
            // Increase quantity
            setSelectedParts(selectedParts.map(p =>
                p.id === part.id
                    ? { ...p, quantity: Math.min(p.quantity + 1, part.current_stock) }
                    : p
            ));
        } else {
            // Add new part
            setSelectedParts([...selectedParts, {
                id: part.id,
                part_name: part.part_name,
                part_code: part.part_code,
                price: part.price,
                quantity: 1,
                maxStock: part.current_stock
            }]);
        }
    };

    const updatePartQuantity = (partId, newQuantity) => {
        if (newQuantity <= 0) {
            removePartFromJob(partId);
            return;
        }

        setSelectedParts(selectedParts.map(p => {
            if (p.id === partId) {
                return { ...p, quantity: Math.min(newQuantity, p.maxStock) };
            }
            return p;
        }));
    };

    const removePartFromJob = (partId) => {
        setSelectedParts(selectedParts.filter(p => p.id !== partId));
    };

    const getTotalPartsCost = () => {
        return selectedParts.reduce((total, part) => total + (part.price * part.quantity), 0);
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
            case 'approved':
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

            case 'in_progress':
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
                        Put in Queue
                    </button>
                );
                break;

            case 'completed':
                buttons.push(
                    <span key="completed" className="text-green-400 text-sm flex items-center">
                        <FiCheck className="mr-1" />
                        Completed
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
                                {['all', 'approved', 'in_progress', 'completed'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setFilterStatus(status)}
                                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${filterStatus === status
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            }`}
                                    >
                                        {status === 'all' ? 'All' : status === 'in_progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
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
                            filteredJobs.map((job) => {
                                // Extract nested data
                                const customer = job.customers || {};
                                const vehicle = job.vehicles || {};
                                const serviceData = job.service_request_services?.[0]?.services || {};

                                return (
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
                                                    <p className="text-gray-300 font-medium">{serviceData.name || 'N/A'}</p>
                                                    <p className="text-gray-400 text-sm mb-2">{serviceData.description || 'No description'}</p>
                                                    <div className="flex items-center space-x-4">
                                                        <span className="flex items-center text-green-400">
                                                            <FiTag className="mr-1" size={14} />
                                                            {formatCurrency(job.estimated_cost || serviceData.base_price)}
                                                        </span>
                                                        <span className="flex items-center text-blue-400">
                                                            <FiClock className="mr-1" size={14} />
                                                            {formatTime(serviceData.estimated_duration)}
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
                                                        <p className="text-gray-300">{customer.name || 'N/A'}</p>
                                                        <p className="text-gray-400 text-sm">{customer.phone || 'N/A'}</p>
                                                    </div>

                                                    <div className="bg-gray-700 rounded-lg p-4">
                                                        <h4 className="text-white font-medium mb-2 flex items-center">
                                                            <FiTruck className="mr-2" />
                                                            Vehicle
                                                        </h4>
                                                        <p className="text-gray-300">{vehicle.brand} {vehicle.model}</p>
                                                        <p className="text-gray-400 text-sm">{vehicle.registration_number}</p>
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
                                )
                            })
                        )}
                    </div>

                    {/* Notes Modal */}
                    {showNotesModal && selectedJob && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
                                <h3 className="text-xl font-semibold text-white mb-4">
                                    {currentAction === 'complete' ? 'Complete Job' : 'Add Notes'}
                                </h3>

                                <div className="space-y-4">
                                    {/* Notes Section */}
                                    <div>
                                        <label className="block text-white font-medium mb-2">
                                            Mechanic Notes {currentAction !== 'complete' && '(Optional)'}
                                        </label>
                                        <textarea
                                            value={mechanicNotes}
                                            onChange={(e) => setMechanicNotes(e.target.value)}
                                            placeholder="Add any notes about the work performed..."
                                            rows={3}
                                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
                                        />
                                    </div>

                                    {/* Parts Selection for Completion */}
                                    {currentAction === 'complete' && (
                                        <>
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="block text-white font-medium">
                                                        <FiPackage className="inline mr-1" />
                                                        Parts Used (Optional)
                                                    </label>
                                                    <button
                                                        onClick={() => setShowPartsModal(true)}
                                                        className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                                                    >
                                                        <FiPlus className="mr-1" size={14} />
                                                        Add Parts
                                                    </button>
                                                </div>

                                                {selectedParts.length > 0 ? (
                                                    <div className="bg-gray-700 rounded-lg p-4 space-y-2">
                                                        {selectedParts.map(part => (
                                                            <div key={part.id} className="flex items-center justify-between bg-gray-600 p-3 rounded">
                                                                <div className="flex-1">
                                                                    <p className="text-white font-medium">{part.part_name}</p>
                                                                    <p className="text-gray-400 text-sm">{part.part_code} - ₹{part.price}</p>
                                                                </div>
                                                                <div className="flex items-center space-x-2">
                                                                    <input
                                                                        type="number"
                                                                        min="1"
                                                                        max={part.maxStock}
                                                                        value={part.quantity}
                                                                        onChange={(e) => updatePartQuantity(part.id, parseInt(e.target.value))}
                                                                        className="w-16 bg-gray-700 border border-gray-500 rounded px-2 py-1 text-white text-center"
                                                                    />
                                                                    <span className="text-gray-300">× ₹{part.price}</span>
                                                                    <span className="text-green-400 font-medium min-w-[80px] text-right">
                                                                        ₹{(part.price * part.quantity).toFixed(2)}
                                                                    </span>
                                                                    <button
                                                                        onClick={() => removePartFromJob(part.id)}
                                                                        className="text-red-400 hover:text-red-300"
                                                                    >
                                                                        <FiX size={18} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <div className="border-t border-gray-600 pt-2 mt-2">
                                                            <div className="flex justify-between text-white font-bold">
                                                                <span>Parts Total:</span>
                                                                <span className="text-green-400">₹{getTotalPartsCost().toFixed(2)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="bg-gray-700 rounded-lg p-4 text-center text-gray-400">
                                                        <FiPackage className="mx-auto mb-2" size={32} />
                                                        <p>No parts added</p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Final Cost Section */}
                                            <div>
                                                <label className="block text-white font-medium mb-2">
                                                    Final Cost (₹)
                                                </label>
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="number"
                                                        value={finalCost}
                                                        onChange={(e) => setFinalCost(e.target.value)}
                                                        placeholder="Enter final cost"
                                                        className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                                                    />
                                                    {selectedParts.length > 0 && (
                                                        <button
                                                            onClick={() => {
                                                                const serviceCost = parseFloat(selectedJob?.estimated_cost || 0);
                                                                const partsCost = getTotalPartsCost();
                                                                setFinalCost((serviceCost + partsCost).toFixed(2));
                                                            }}
                                                            className="bg-gray-600 hover:bg-gray-500 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap"
                                                        >
                                                            Auto Calculate
                                                        </button>
                                                    )}
                                                </div>
                                                {selectedParts.length > 0 && (
                                                    <p className="text-gray-400 text-sm mt-1">
                                                        Service: ₹{selectedJob?.estimated_cost || 0} + Parts: ₹{getTotalPartsCost().toFixed(2)} = ₹{(parseFloat(selectedJob?.estimated_cost || 0) + getTotalPartsCost()).toFixed(2)}
                                                    </p>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="flex space-x-3 mt-6">
                                    <button
                                        onClick={() => {
                                            setShowNotesModal(false);
                                            setSelectedParts([]);
                                        }}
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

                    {/* Parts Selection Modal */}
                    {showPartsModal && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
                                <h3 className="text-xl font-semibold text-white mb-4">
                                    <FiShoppingCart className="inline mr-2" />
                                    Select Parts
                                </h3>

                                {/* Search */}
                                <div className="mb-4">
                                    <input
                                        type="text"
                                        value={searchPart}
                                        onChange={(e) => setSearchPart(e.target.value)}
                                        placeholder="Search parts by name or code..."
                                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                                    />
                                </div>

                                {/* Parts List */}
                                <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                                    {availableParts
                                        .filter(part =>
                                            searchPart === '' ||
                                            part.part_name.toLowerCase().includes(searchPart.toLowerCase()) ||
                                            part.part_code.toLowerCase().includes(searchPart.toLowerCase())
                                        )
                                        .map(part => {
                                            const isSelected = selectedParts.some(p => p.id === part.id);
                                            return (
                                                <div
                                                    key={part.id}
                                                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${isSelected
                                                        ? 'bg-blue-900/30 border border-blue-600'
                                                        : 'bg-gray-700 hover:bg-gray-600'
                                                        }`}
                                                    onClick={() => addPartToJob(part)}
                                                >
                                                    <div className="flex-1">
                                                        <p className="text-white font-medium">{part.part_name}</p>
                                                        <p className="text-gray-400 text-sm">
                                                            {part.part_code} • {part.category}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-green-400 font-bold">₹{part.price}</p>
                                                        <p className="text-gray-400 text-sm">Stock: {part.current_stock}</p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    }
                                    {availableParts.filter(part =>
                                        searchPart === '' ||
                                        part.part_name.toLowerCase().includes(searchPart.toLowerCase()) ||
                                        part.part_code.toLowerCase().includes(searchPart.toLowerCase())
                                    ).length === 0 && (
                                            <div className="text-center text-gray-400 py-8">
                                                <FiPackage size={48} className="mx-auto mb-2 opacity-50" />
                                                <p>No parts found</p>
                                            </div>
                                        )}
                                </div>

                                {/* Close Button */}
                                <button
                                    onClick={() => setShowPartsModal(false)}
                                    className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MechanicJobs;