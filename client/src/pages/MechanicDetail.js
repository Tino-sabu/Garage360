import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    FiUser,
    FiMail,
    FiPhone,
    FiTool,
    FiBriefcase,
    FiDollarSign,
    FiAward,
    FiEdit3,
    FiSave,
    FiX,
    FiTrash2,
    FiCheckCircle,
    FiCalendar,
    FiClock
} from 'react-icons/fi';
import { mechanicsAPI, serviceRequestsAPI, salaryPaymentsAPI } from '../config/api';
import Navbar from '../components/Navbar';
import PageHeader from '../components/PageHeader';

const MechanicDetail = () => {
    const { mechanicId } = useParams();
    const navigate = useNavigate();
    const [mechanic, setMechanic] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editingRate, setEditingRate] = useState(false);
    const [newRate, setNewRate] = useState('');
    const [saving, setSaving] = useState(false);
    const [showDismissConfirm, setShowDismissConfirm] = useState(false);
    const [dismissing, setDismissing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [completedJobs, setCompletedJobs] = useState([]);
    const [bonusEarned, setBonusEarned] = useState(0);
    const [totalSalary, setTotalSalary] = useState(0);
    const [showPaySalary, setShowPaySalary] = useState(false);
    const [editableSalary, setEditableSalary] = useState(0);

    useEffect(() => {
        fetchMechanicDetails();
    }, [mechanicId]);

    const fetchMechanicDetails = async () => {
        try {
            setLoading(true);
            let foundMechanic = null;

            // Fetch mechanic info
            const mechanicsResult = await mechanicsAPI.getAllMechanics();
            if (mechanicsResult.success) {
                foundMechanic = mechanicsResult.data.find(m => m.mechanic_id === parseInt(mechanicId));
                if (foundMechanic) {
                    setMechanic(foundMechanic);
                    setNewRate(foundMechanic.hourly_rate || 0);
                } else {
                    setError('Mechanic not found');
                    return;
                }
            }

            // Fetch mechanic's completed jobs (only unpaid ones)
            const jobsResult = await serviceRequestsAPI.getMechanicJobs(parseInt(mechanicId));
            if (jobsResult.success) {
                // Filter for completed AND unpaid jobs only
                const unpaidCompleted = jobsResult.data.filter(job =>
                    job.status === 'completed' && job.is_paid !== true
                );
                setCompletedJobs(unpaidCompleted);

                // Calculate bonus (3% of each unpaid completed job)
                const totalBonus = unpaidCompleted.reduce((sum, job) => {
                    const cost = parseFloat(job.final_cost) || parseFloat(job.estimated_cost) || 0;
                    return sum + (cost * 0.03);
                }, 0);
                setBonusEarned(totalBonus);

                // Calculate salary: (estimated_duration * hourly_rate) for all unpaid completed jobs + bonus
                const hourlyRate = foundMechanic?.hourly_rate || 0;
                const timeBasedSalary = unpaidCompleted.reduce((sum, job) => {
                    // Get estimated_duration from services table (in minutes) and convert to hours
                    const service = job.service_request_services?.[0]?.services || {};
                    const estimatedDurationMinutes = parseFloat(service.estimated_duration) || 0;
                    const estimatedHours = estimatedDurationMinutes / 60; // Convert minutes to hours
                    return sum + (estimatedHours * hourlyRate);
                }, 0);

                const calculatedSalary = timeBasedSalary + totalBonus;
                setTotalSalary(calculatedSalary);
                setEditableSalary(calculatedSalary);
            }
        } catch (error) {
            console.error('Error fetching mechanic details:', error);
            setError('Failed to load mechanic details');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRate = async () => {
        if (!newRate || parseFloat(newRate) <= 0) {
            setError('Please enter a valid hourly rate');
            return;
        }

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const { data, error } = await mechanicsAPI.updateMechanic(mechanicId, {
                hourly_rate: parseFloat(newRate)
            });

            if (error) {
                setError('Failed to update hourly rate');
            } else {
                setSuccess('Hourly rate updated successfully');
                setEditingRate(false);
                setMechanic({ ...mechanic, hourly_rate: parseFloat(newRate) });
            }
        } catch (error) {
            setError('Error updating hourly rate');
        } finally {
            setSaving(false);
        }
    };

    const handleDismissMechanic = async () => {
        setDismissing(true);
        setError('');

        try {
            const result = await mechanicsAPI.deleteMechanic(mechanicId);

            if (result.success) {
                alert('✅ Mechanic dismissed successfully');
                navigate('/mechanic-management');
            } else {
                setError(result.message || 'Failed to dismiss mechanic');
            }
        } catch (error) {
            setError('Error dismissing mechanic');
        } finally {
            setDismissing(false);
            setShowDismissConfirm(false);
        }
    };

    if (loading) {
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
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="text-white text-xl">Loading mechanic details...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (!mechanic) {
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
                        <div className="card text-center">
                            <p className="text-red-400 text-xl">Mechanic not found</p>
                            <button
                                onClick={() => navigate('/mechanic-management')}
                                className="btn-primary mt-4"
                            >
                                Back to Management
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <Navbar />
            <PageHeader title="Mechanic Details" />

            <div
                className="min-h-[calc(100vh-7rem)] bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: 'url(/car3.jpg)',
                    backgroundAttachment: 'fixed'
                }}
            >
                <div className="min-h-full bg-black bg-opacity-70">
                    <div className="container mx-auto px-3 xs:px-4 sm:px-6 py-4 sm:py-8 max-w-7xl">
                        {/* Dismiss Button */}
                        <div className="flex justify-end mb-4 sm:mb-6">
                            <button
                                onClick={() => setShowDismissConfirm(true)}
                                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                            >
                                <FiTrash2 />
                                <span>Dismiss Mechanic</span>
                            </button>
                        </div>

                        {/* Success/Error Messages */}
                        {error && (
                            <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded mb-6">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-3 rounded mb-6">
                                {success}
                            </div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column - Profile Info */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Basic Info Card */}
                                <div className="card">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center">
                                                <FiUser className="text-white text-2xl" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-white">{mechanic.name}</h2>
                                                <p className="text-dark-300">ID: {mechanic.mechanic_id}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center space-x-3">
                                            <FiMail className="text-primary-400" />
                                            <div>
                                                <p className="text-dark-300 text-sm">Email</p>
                                                <p className="text-white">{mechanic.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <FiPhone className="text-primary-400" />
                                            <div>
                                                <p className="text-dark-300 text-sm">Phone</p>
                                                <p className="text-white">{mechanic.phone}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <FiBriefcase className="text-primary-400" />
                                            <div>
                                                <p className="text-dark-300 text-sm">Experience</p>
                                                <p className="text-white">{mechanic.experience_years} years</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <FiAward className="text-primary-400" />
                                            <div>
                                                <p className="text-dark-300 text-sm">Rating</p>
                                                <p className="text-white">{mechanic.rating || 0} / 5</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Specializations */}
                                    {mechanic.specializations && mechanic.specializations.length > 0 && (
                                        <div className="mt-6 pt-6 border-t border-dark-600">
                                            <p className="text-dark-300 text-sm mb-3">Specializations</p>
                                            <div className="flex flex-wrap gap-2">
                                                {mechanic.specializations.map((spec, index) => (
                                                    <span key={index} className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                                                        <FiTool className="inline mr-1" size={12} />
                                                        {spec}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Hourly Rate Card */}
                                <div className="card">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-semibold text-white flex items-center">
                                            <FiDollarSign className="mr-2 text-green-400" />
                                            Hourly Rate
                                        </h3>
                                        {!editingRate && (
                                            <button
                                                onClick={() => setEditingRate(true)}
                                                className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
                                            >
                                                <FiEdit3 size={16} />
                                                <span>Edit</span>
                                            </button>
                                        )}
                                    </div>

                                    {editingRate ? (
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-1">
                                                <input
                                                    type="number"
                                                    value={newRate}
                                                    onChange={(e) => setNewRate(e.target.value)}
                                                    className="w-full bg-dark-700 border border-dark-600 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500"
                                                    placeholder="Enter hourly rate"
                                                    min="0"
                                                    step="0.01"
                                                />
                                            </div>
                                            <button
                                                onClick={handleUpdateRate}
                                                disabled={saving}
                                                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                                            >
                                                <FiSave size={16} />
                                                <span>{saving ? 'Saving...' : 'Save'}</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingRate(false);
                                                    setNewRate(mechanic.hourly_rate);
                                                }}
                                                className="flex items-center space-x-2 bg-dark-700 hover:bg-dark-600 text-white px-4 py-2 rounded-lg transition-colors"
                                            >
                                                <FiX size={16} />
                                                <span>Cancel</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-3xl font-bold text-green-400">
                                            ₹{mechanic.hourly_rate || 0}/hr
                                        </div>
                                    )}
                                </div>

                                {/* Unpaid Completed Jobs */}
                                <div className="card">
                                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                                        <FiCheckCircle className="mr-2 text-green-400" />
                                        Unpaid Completed Jobs ({completedJobs.length})
                                    </h3>

                                    {completedJobs.length === 0 ? (
                                        <p className="text-dark-300 text-center py-8">No unpaid jobs. All payments up to date! ✅</p>
                                    ) : (
                                        <div className="space-y-3 max-h-96 overflow-y-auto">
                                            {completedJobs.map((job) => {
                                                const customer = job.customers || {};
                                                const vehicle = job.vehicles || {};
                                                const service = job.service_request_services?.[0]?.services || {};
                                                const cost = parseFloat(job.final_cost) || parseFloat(job.estimated_cost) || 0;
                                                const bonus = cost * 0.03;
                                                // Get estimated_duration from services table (in minutes) and convert to hours
                                                const estimatedDurationMinutes = parseFloat(service.estimated_duration) || 0;
                                                const estimatedHours = estimatedDurationMinutes / 60;
                                                const timeBasedPay = estimatedHours * (mechanic.hourly_rate || 0);

                                                return (
                                                    <div key={job.request_id} className="bg-dark-700 p-4 rounded-lg">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <p className="text-white font-medium">{service.name || 'Service'}</p>
                                                                <p className="text-dark-300 text-sm">
                                                                    {customer.name} - {vehicle.brand} {vehicle.model}
                                                                </p>
                                                                <div className="flex items-center space-x-3 mt-1">
                                                                    <p className="text-dark-400 text-xs">
                                                                        <FiCalendar className="inline mr-1" size={12} />
                                                                        {job.completion_date ? new Date(job.completion_date).toLocaleDateString() : 'Recently'}
                                                                    </p>
                                                                    <p className="text-blue-400 text-xs">
                                                                        <FiClock className="inline mr-1" size={12} />
                                                                        {estimatedHours.toFixed(1)}h ({estimatedDurationMinutes}min)
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-white font-medium">₹{cost.toFixed(2)}</p>
                                                                <p className="text-blue-400 text-xs">Time: ₹{timeBasedPay.toFixed(2)}</p>
                                                                <p className="text-green-400 text-xs">Bonus: ₹{bonus.toFixed(2)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Right Column - Stats */}
                            <div className="space-y-6">
                                {/* Total Salary Card */}
                                <div className="card text-center">
                                    <FiDollarSign className="text-yellow-400 text-4xl mx-auto mb-4" />
                                    <p className="text-dark-300 text-sm mb-2">Total Salary Due</p>
                                    <p className="text-3xl font-bold text-yellow-400 mb-1">₹{totalSalary.toFixed(2)}</p>
                                    <p className="text-dark-400 text-xs mb-4">Time-based + Bonus</p>
                                    <button
                                        onClick={() => setShowPaySalary(true)}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                                    >
                                        Pay Salary
                                    </button>
                                </div>

                                {/* Bonus Earned Card */}
                                <div className="card text-center">
                                    <FiDollarSign className="text-green-400 text-4xl mx-auto mb-4" />
                                    <p className="text-dark-300 text-sm mb-2">Total Bonus Earned</p>
                                    <p className="text-3xl font-bold text-green-400 mb-1">₹{bonusEarned.toFixed(2)}</p>
                                    <p className="text-dark-400 text-xs">3% of completed jobs</p>
                                </div>

                                {/* Stats Card */}
                                <div className="card">
                                    <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-dark-300">Unpaid Completed Jobs</span>
                                            <span className="text-white font-medium">{completedJobs.length}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-dark-300">Average Job Value</span>
                                            <span className="text-white font-medium">
                                                ₹{completedJobs.length > 0
                                                    ? (completedJobs.reduce((sum, job) => {
                                                        return sum + (parseFloat(job.final_cost) || parseFloat(job.estimated_cost) || 0);
                                                    }, 0) / completedJobs.length).toFixed(2)
                                                    : '0.00'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-dark-300">Availability</span>
                                            <span className={`px-2 py-1 rounded text-sm ${mechanic.available ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                                }`}>
                                                {mechanic.availability_status || (mechanic.available ? 'Available' : 'Offline')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pay Salary Modal */}
                    {showPaySalary && (
                        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                            <div className="bg-dark-800 rounded-lg p-6 max-w-2xl w-full border border-green-500">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="bg-green-600 p-3 rounded-full">
                                            <FiDollarSign className="text-white text-xl" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white">Pay Salary - {mechanic.name}</h3>
                                    </div>
                                    <button
                                        onClick={() => setShowPaySalary(false)}
                                        className="text-dark-300 hover:text-white"
                                    >
                                        <FiX size={24} />
                                    </button>
                                </div>

                                {/* Salary Breakdown */}
                                <div className="space-y-4 mb-6">
                                    <div className="bg-dark-700 rounded-lg p-4">
                                        <h4 className="text-white font-semibold mb-3">Salary Breakdown</h4>

                                        {/* Job Details */}
                                        <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                                            {completedJobs.map((job) => {
                                                const service = job.service_request_services?.[0]?.services || {};
                                                // Get estimated_duration from services table (in minutes) and convert to hours
                                                const estimatedDurationMinutes = parseFloat(service.estimated_duration) || 0;
                                                const estimatedHours = estimatedDurationMinutes / 60;
                                                const hourlyRate = mechanic.hourly_rate || 0;
                                                const timeBasedPay = estimatedHours * hourlyRate;
                                                const cost = parseFloat(job.final_cost) || parseFloat(job.estimated_cost) || 0;
                                                const bonus = cost * 0.03;

                                                return (
                                                    <div key={job.request_id} className="flex justify-between items-center text-sm border-b border-dark-600 pb-2">
                                                        <div className="flex-1">
                                                            <p className="text-white">{service.name || 'Service'}</p>
                                                            <p className="text-dark-400 text-xs">
                                                                <FiClock className="inline mr-1" size={10} />
                                                                {estimatedHours.toFixed(1)}h ({estimatedDurationMinutes}min) × ₹{hourlyRate}/hr = ₹{timeBasedPay.toFixed(2)}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-blue-400">₹{timeBasedPay.toFixed(2)}</p>
                                                            <p className="text-green-400 text-xs">+₹{bonus.toFixed(2)}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Summary */}
                                        <div className="border-t border-dark-600 pt-3 space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-dark-300">Time-based Pay:</span>
                                                <span className="text-blue-400">
                                                    ₹{(completedJobs.reduce((sum, job) => {
                                                        const service = job.service_request_services?.[0]?.services || {};
                                                        const estimatedDurationMinutes = parseFloat(service.estimated_duration) || 0;
                                                        const estimatedHours = estimatedDurationMinutes / 60;
                                                        return sum + (estimatedHours * (mechanic.hourly_rate || 0));
                                                    }, 0)).toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-dark-300">Bonus (3%):</span>
                                                <span className="text-green-400">₹{bonusEarned.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-lg font-bold border-t border-dark-600 pt-2">
                                                <span className="text-white">Total:</span>
                                                <span className="text-yellow-400">₹{totalSalary.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Editable Amount */}
                                    <div className="bg-dark-700 rounded-lg p-4">
                                        <label className="text-white font-semibold mb-2 block">
                                            Adjust Final Amount (Optional)
                                        </label>
                                        <div className="flex items-center space-x-3">
                                            <span className="text-dark-300">₹</span>
                                            <input
                                                type="number"
                                                value={editableSalary}
                                                onChange={(e) => setEditableSalary(parseFloat(e.target.value) || 0)}
                                                className="flex-1 bg-dark-800 border border-dark-600 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-green-500 text-lg"
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                        <p className="text-dark-400 text-xs mt-2">
                                            You can adjust the amount before processing payment
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => setShowPaySalary(false)}
                                        className="flex-1 bg-dark-700 hover:bg-dark-600 text-white px-4 py-3 rounded-lg transition-colors duration-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={async () => {
                                            try {
                                                setSaving(true);

                                                // Calculate time-based pay and bonus for the payment record
                                                const hourlyRate = mechanic.hourly_rate || 0;
                                                let timeBasedPayTotal = 0;
                                                let bonusTotal = 0;

                                                completedJobs.forEach(job => {
                                                    // Calculate time-based pay
                                                    const service = job.service_request_services?.[0]?.services;
                                                    const estimatedDurationMinutes = parseFloat(service?.estimated_duration) || 0;
                                                    const estimatedHours = estimatedDurationMinutes / 60;
                                                    timeBasedPayTotal += estimatedHours * hourlyRate;

                                                    // Calculate bonus (3% of job cost)
                                                    const jobCost = parseFloat(job.final_cost) || parseFloat(job.estimated_cost) || 0;
                                                    bonusTotal += jobCost * 0.03;
                                                });

                                                // Get all job IDs
                                                const jobIds = completedJobs.map(job => job.request_id);

                                                if (jobIds.length > 0) {
                                                    // Mark jobs as paid in database
                                                    const result = await serviceRequestsAPI.markJobsAsPaid(jobIds);

                                                    if (!result.success) {
                                                        setError('Failed to mark jobs as paid');
                                                        setSaving(false);
                                                        return;
                                                    }

                                                    // Create payment record in salary_payments table
                                                    const currentUser = JSON.parse(localStorage.getItem('user'));
                                                    const paymentRecord = await salaryPaymentsAPI.createPayment({
                                                        mechanic_id: parseInt(mechanicId),
                                                        time_based_pay: timeBasedPayTotal,
                                                        bonus_amount: bonusTotal,
                                                        total_amount: parseFloat(editableSalary),
                                                        jobs_included: jobIds,
                                                        paid_by: currentUser?.user_id || null,
                                                        notes: `Payment for ${jobIds.length} completed job(s)`
                                                    });

                                                    if (!paymentRecord.success) {
                                                        console.warn('Payment record not created:', paymentRecord.message);
                                                    }
                                                }

                                                // Show payment confirmation
                                                alert(`✅ Payment of ₹${editableSalary.toFixed(2)} processed successfully for ${mechanic.name}`);

                                                // Reset salary and bonus to zero
                                                setCompletedJobs([]);
                                                setTotalSalary(0);
                                                setBonusEarned(0);
                                                setEditableSalary(0);

                                                // Close modal
                                                setShowPaySalary(false);

                                                // Show success message
                                                setSuccess('Payment processed successfully! Salary and bonus reset to ₹0.');

                                                // Clear success message after 3 seconds
                                                setTimeout(() => setSuccess(''), 3000);

                                            } catch (error) {
                                                console.error('Payment error:', error);
                                                setError('Failed to process payment');
                                            } finally {
                                                setSaving(false);
                                            }
                                        }}
                                        disabled={saving || completedJobs.length === 0}
                                        className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                                    >
                                        {saving ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                <span>Processing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FiCheckCircle />
                                                <span>Process Payment: ₹{editableSalary.toFixed(2)}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Dismiss Confirmation Modal */}
                    {showDismissConfirm && (
                        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                            <div className="bg-dark-800 rounded-lg p-6 max-w-md w-full border border-red-500">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="bg-red-600 p-3 rounded-full">
                                        <FiTrash2 className="text-white text-xl" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">Dismiss Mechanic?</h3>
                                </div>

                                <p className="text-dark-300 mb-6">
                                    Are you sure you want to dismiss <span className="text-white font-semibold">{mechanic.name}</span>?
                                    This will permanently delete their account and all related data.
                                </p>

                                <div className="bg-red-900 bg-opacity-30 border border-red-600 rounded-lg p-3 mb-6">
                                    <p className="text-red-400 text-sm font-semibold">⚠️ Warning:</p>
                                    <ul className="text-red-300 text-sm mt-2 space-y-1 ml-4 list-disc">
                                        <li>Mechanic account will be deleted</li>
                                        <li>All service assignments will be removed</li>
                                        <li>This action cannot be undone</li>
                                    </ul>
                                </div>

                                <div className="flex space-x-3">
                                    <button
                                        onClick={() => setShowDismissConfirm(false)}
                                        disabled={dismissing}
                                        className="flex-1 bg-dark-700 hover:bg-dark-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleDismissMechanic}
                                        disabled={dismissing}
                                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                                    >
                                        {dismissing ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                <span>Dismissing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <FiTrash2 />
                                                <span>Dismiss</span>
                                            </>
                                        )}
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

export default MechanicDetail;
