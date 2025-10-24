import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FiDollarSign,
    FiCalendar,
    FiUser,
    FiTrendingUp,
    FiClock,
    FiAward,
    FiFilter,
    FiDownload
} from 'react-icons/fi';
import { salaryPaymentsAPI } from '../config/api';
import Navbar from '../components/Navbar';
import PageHeader from '../components/PageHeader';

const SalaryPayments = () => {
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState(null);
    const [filterPeriod, setFilterPeriod] = useState('all'); // all, month, week, today
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPayments();
        fetchStats();
    }, []);

    useEffect(() => {
        filterPayments();
    }, [payments, filterPeriod, searchTerm]);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const result = await salaryPaymentsAPI.getAllPayments();
            if (result.success) {
                setPayments(result.data);
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Failed to fetch payment history');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        const result = await salaryPaymentsAPI.getPaymentStats();
        if (result.success) {
            setStats(result.data);
        }
    };

    const filterPayments = () => {
        let filtered = [...payments];

        // Filter by search term (mechanic name)
        if (searchTerm) {
            filtered = filtered.filter(payment =>
                payment.mechanics?.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by time period
        const now = new Date();
        if (filterPeriod === 'today') {
            filtered = filtered.filter(payment => {
                const paymentDate = new Date(payment.payment_date);
                return paymentDate.toDateString() === now.toDateString();
            });
        } else if (filterPeriod === 'week') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            filtered = filtered.filter(payment => {
                const paymentDate = new Date(payment.payment_date);
                return paymentDate >= weekAgo;
            });
        } else if (filterPeriod === 'month') {
            filtered = filtered.filter(payment => {
                const paymentDate = new Date(payment.payment_date);
                return paymentDate.getMonth() === now.getMonth() &&
                    paymentDate.getFullYear() === now.getFullYear();
            });
        }

        setFilteredPayments(filtered);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const exportToCSV = () => {
        const headers = ['Date', 'Mechanic', 'Time-Based Pay', 'Bonus', 'Total', 'Jobs Count'];
        const rows = filteredPayments.map(payment => [
            formatDate(payment.payment_date),
            payment.mechanics?.name || 'N/A',
            payment.time_based_pay,
            payment.bonus_amount,
            payment.total_amount,
            payment.jobs_included?.length || 0
        ]);

        const csv = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `salary_payments_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-900">
                <Navbar />
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <Navbar />
            <PageHeader title="Salary Payment History" />

            <div
                className="min-h-[calc(100vh-7rem)] bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: 'url(/pic2.jpg)',
                    backgroundAttachment: 'fixed'
                }}
            >
                <div className="min-h-full bg-black bg-opacity-70">
                    <div className="container mx-auto px-3 xs:px-4 sm:px-6 py-4 sm:py-8 max-w-7xl">

                        {error && (
                            <div className="bg-red-900 bg-opacity-30 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
                                {error}
                            </div>
                        )}

                        {/* Statistics Cards */}
                        {stats && (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 sm:gap-6 mb-4 sm:mb-8">
                                <div className="bg-dark-800 rounded-lg p-3 xs:p-4 sm:p-6 border border-dark-700">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-dark-300 text-xs sm:text-sm">Total Paid</span>
                                        <FiDollarSign className="text-green-400 text-sm sm:text-base" />
                                    </div>
                                    <div className="text-lg xs:text-xl sm:text-2xl font-bold text-white">
                                        ₹{stats.totalPaid.toFixed(2)}
                                    </div>
                                    <div className="text-xs text-dark-400 mt-1">
                                        {stats.totalPayments} payments
                                    </div>
                                </div>

                                <div className="bg-dark-800 rounded-lg p-3 xs:p-4 sm:p-6 border border-dark-700">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-dark-300 text-xs sm:text-sm">This Month</span>
                                        <FiCalendar className="text-blue-400 text-sm sm:text-base" />
                                    </div>
                                    <div className="text-lg xs:text-xl sm:text-2xl font-bold text-white">
                                        ₹{stats.monthlyTotal.toFixed(2)}
                                    </div>
                                    <div className="text-xs text-dark-400 mt-1">
                                        {stats.monthlyPayments} payments
                                    </div>
                                </div>

                                <div className="bg-dark-800 rounded-lg p-3 xs:p-4 sm:p-6 border border-dark-700">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-dark-300 text-xs sm:text-sm">Avg Payment</span>
                                        <FiTrendingUp className="text-purple-400 text-sm sm:text-base" />
                                    </div>
                                    <div className="text-lg xs:text-xl sm:text-2xl font-bold text-white">
                                        ₹{stats.avgPayment.toFixed(2)}
                                    </div>
                                    <div className="text-xs text-dark-400 mt-1">
                                        per transaction
                                    </div>
                                </div>

                                <div className="bg-dark-800 rounded-lg p-3 xs:p-4 sm:p-6 border border-dark-700">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-dark-300 text-xs sm:text-sm">Mechanics Paid</span>
                                        <FiUser className="text-yellow-400 text-sm sm:text-base" />
                                    </div>
                                    <div className="text-lg xs:text-xl sm:text-2xl font-bold text-white">
                                        {stats.uniqueMechanics}
                                    </div>
                                    <div className="text-xs text-dark-400 mt-1">
                                        unique mechanics
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Filters and Search */}
                        <div className="bg-dark-800 rounded-lg p-3 xs:p-4 sm:p-6 border border-dark-700 mb-4 sm:mb-6">
                            <div className="flex flex-col gap-3 sm:gap-4">
                                <div className="flex flex-col xs:flex-row items-start xs:items-center gap-3">
                                    <FiFilter className="text-dark-300 hidden xs:block" />
                                    <select
                                        value={filterPeriod}
                                        onChange={(e) => setFilterPeriod(e.target.value)}
                                        className="w-full xs:w-auto bg-dark-700 border border-dark-600 text-white px-3 xs:px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                                    >
                                        <option value="all">All Time</option>
                                        <option value="today">Today</option>
                                        <option value="week">Last 7 Days</option>
                                        <option value="month">This Month</option>
                                    </select>

                                    <input
                                        type="text"
                                        placeholder="Search mechanic..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full xs:flex-1 bg-dark-700 border border-dark-600 text-white px-3 xs:px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 text-sm"
                                    />
                                </div>

                                <button
                                    onClick={exportToCSV}
                                    className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 w-full text-sm"
                                >
                                    <FiDownload />
                                    <span>Export CSV</span>
                                </button>
                            </div>

                            <div className="mt-4 text-sm text-dark-300">
                                Showing {filteredPayments.length} of {payments.length} payments
                            </div>
                        </div>

                        {/* Payments Table */}
                        <div className="bg-dark-800 rounded-lg border border-dark-700 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-dark-700">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-dark-300 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-dark-300 uppercase tracking-wider">
                                                Mechanic
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-dark-300 uppercase tracking-wider">
                                                Time-Based Pay
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-dark-300 uppercase tracking-wider">
                                                Bonus
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-dark-300 uppercase tracking-wider">
                                                Total
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-dark-300 uppercase tracking-wider">
                                                Jobs
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-dark-700">
                                        {filteredPayments.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="px-6 py-8 text-center text-dark-300">
                                                    No payment records found
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredPayments.map((payment) => (
                                                <tr
                                                    key={payment.payment_id}
                                                    className="hover:bg-dark-700 transition-colors duration-150"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center text-white">
                                                            <FiCalendar className="mr-2 text-dark-400" />
                                                            {formatDate(payment.payment_date)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-white font-medium">
                                                            {payment.mechanics?.name || 'N/A'}
                                                        </div>
                                                        <div className="text-sm text-dark-400">
                                                            {payment.mechanics?.email || ''}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center text-blue-400">
                                                            <FiClock className="mr-2" />
                                                            ₹{parseFloat(payment.time_based_pay).toFixed(2)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center text-green-400">
                                                            <FiAward className="mr-2" />
                                                            ₹{parseFloat(payment.bonus_amount).toFixed(2)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-white font-bold text-lg">
                                                            ₹{parseFloat(payment.total_amount).toFixed(2)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="bg-dark-600 text-dark-200 px-3 py-1 rounded-full text-sm">
                                                            {payment.jobs_included?.length || 0} jobs
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalaryPayments;
