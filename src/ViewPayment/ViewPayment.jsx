import React, { useState, useEffect } from 'react';
import { 
  FaMoneyBill, 
  FaSearch, 
  FaFilter, 
  FaDownload, 
  FaEye, 
  FaCalendarAlt,
  FaUser,
  FaCreditCard,
  FaCheckCircle,
  FaTimesCircle,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaRupeeSign,
  FaSyncAlt,
  FaFileInvoice,
  FaRocket,
  FaFire,
  FaGem,
  FaChartLine,
  FaExclamationTriangle,
  FaDatabase,
  FaShieldAlt
} from 'react-icons/fa';
import axios from 'axios';

const ViewPayment = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortField, setSortField] = useState('paymentDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    totalRevenue: 0,
    today: 0,
    boostPayments: 0,
    subscriptionPayments: 0,
    boostRevenue: 0,
    subscriptionRevenue: 0
  });

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (showDetailsModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showDetailsModal]);

  useEffect(() => {
    fetchAllPayments();
    fetchPaymentStats();
  }, []);

  useEffect(() => {
    filterAndSortPayments();
  }, [payments, searchTerm, statusFilter, dateFilter, typeFilter, sortField, sortDirection]);

  const fetchAllPayments = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('🔍 Fetching all payments...');
      
      // Fetch regular payments (subscriptions)
      const paymentsResponse = await axios.get('https://public-infra-report-server.vercel.app/payments');
      console.log('✅ Regular payments response:', paymentsResponse.data);
      
      // Fetch boost payments
      const boostResponse = await axios.get('https://public-infra-report-server.vercel.app/boost-payments');
      console.log('🚀 Boost payments response:', boostResponse.data);
      
      let allPayments = [];
      
      // Process regular payments
      if (paymentsResponse.data.success && Array.isArray(paymentsResponse.data.payments)) {
        const regularPayments = paymentsResponse.data.payments.map(payment => ({
          ...payment,
          paymentType: 'subscription',
          typeLabel: 'Premium Subscription',
          typeIcon: <FaGem className="w-4 h-4 text-purple-500" />,
          boostType: null,
          issueTitle: null,
          issueId: null,
          // Ensure consistent field names
          _id: payment._id || payment.id,
          transactionId: payment.transactionId || `SUB-${payment._id?.substring(0, 8) || Date.now()}`,
          invoiceNumber: payment.invoiceNumber || `INV-${payment._id?.substring(0, 8) || Date.now()}`,
          userName: payment.userName || payment.displayName || payment.userEmail?.split('@')[0] || 'User',
          userEmail: payment.userEmail || payment.email || 'No email',
          userRole: payment.userRole || 'user',
          amount: Number(payment.amount) || 0,
          status: payment.status || 'completed',
          paymentDate: payment.paymentDate || payment.createdAt || new Date().toISOString()
        }));
        allPayments = [...allPayments, ...regularPayments];
        console.log(`📊 Loaded ${regularPayments.length} subscription payments`);
      } else {
        console.warn('⚠️ Regular payments data format unexpected:', paymentsResponse.data);
      }
      
      // Process boost payments
      if (boostResponse.data.success && Array.isArray(boostResponse.data.payments)) {
        const boostPayments = boostResponse.data.payments.map(payment => ({
          ...payment,
          paymentType: 'boost',
          typeLabel: payment.boostType === 'priority_boost' ? 'Priority Boost' : 'Issue Boost',
          typeIcon: <FaRocket className="w-4 h-4 text-orange-500" />,
          // Ensure consistent field names
          _id: payment._id || payment.id,
          transactionId: payment.transactionId || `BOOST-${payment._id?.substring(0, 8) || Date.now()}`,
          invoiceNumber: payment.invoiceNumber || payment.transactionId || `BOOST-INV-${payment._id?.substring(0, 8) || Date.now()}`,
          userName: payment.userName || payment.displayName || payment.userEmail?.split('@')[0] || 'User',
          userEmail: payment.userEmail || payment.email || 'No email',
          userRole: payment.userRole || 'user',
          amount: Number(payment.amount) || 0,
          status: payment.status || 'completed',
          paymentDate: payment.paymentDate || payment.createdAt || new Date().toISOString(),
          // Map boost-specific fields
          plan: payment.boostType === 'priority_boost' ? 'Priority Boost' : 'Issue Boost',
          subscriptionStart: null,
          subscriptionEnd: null,
          paymentMethod: payment.paymentMethod || 'Card'
        }));
        allPayments = [...allPayments, ...boostPayments];
        console.log(`🚀 Loaded ${boostPayments.length} boost payments`);
      } else {
        console.warn('⚠️ Boost payments data format unexpected:', boostResponse.data);
      }
      
      // Sort by date (newest first)
      allPayments.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));
      
      setPayments(allPayments);
      console.log(`💰 Total payments loaded: ${allPayments.length}`);
      
    } catch (error) {
      console.error('❌ Error fetching payments:', error);
      setError('Failed to load payments from database. Please check your server connection.');
      
      // Try to load at least regular payments
      try {
        const paymentsResponse = await axios.get('https://public-infra-report-server.vercel.app/payments');
        if (paymentsResponse.data.success && Array.isArray(paymentsResponse.data.payments)) {
          const regularPayments = paymentsResponse.data.payments.map(payment => ({
            ...payment,
            paymentType: 'subscription',
            typeLabel: 'Premium Subscription',
            typeIcon: <FaGem className="w-4 h-4 text-purple-500" />,
            boostType: null,
            issueTitle: null,
            issueId: null
          }));
          setPayments(regularPayments);
          console.log(`📊 Loaded ${regularPayments.length} payments (boost API failed)`);
        }
      } catch (error2) {
        console.error('Failed to load any payments:', error2);
        setPayments([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentStats = async () => {
    try {
      let statsData = {
        total: 0,
        completed: 0,
        totalRevenue: 0,
        today: 0,
        boostPayments: 0,
        subscriptionPayments: 0,
        boostRevenue: 0,
        subscriptionRevenue: 0
      };

      // Try to fetch regular payment stats
      try {
        const paymentsResponse = await axios.get('https://public-infra-report-server.vercel.app/payments/stats');
        if (paymentsResponse.data.success) {
          statsData = {
            ...statsData,
            ...paymentsResponse.data.stats,
            subscriptionPayments: paymentsResponse.data.stats.total || 0,
            subscriptionRevenue: paymentsResponse.data.stats.totalRevenue || 0
          };
        }
      } catch (regularStatsError) {
        console.log('Regular stats not available:', regularStatsError.message);
      }

      // Try to fetch boost payment stats
      try {
        const boostResponse = await axios.get('https://public-infra-report-server.vercel.app/boost-payments');
        if (boostResponse.data.success && Array.isArray(boostResponse.data.payments)) {
          const boostPayments = boostResponse.data.payments;
          const boostRevenue = boostPayments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
          const completedBoosts = boostPayments.filter(p => p.status === 'completed').length;
          
          statsData.boostPayments = boostPayments.length;
          statsData.boostRevenue = boostRevenue;
          statsData.total = (statsData.total || 0) + boostPayments.length;
          statsData.completed = (statsData.completed || 0) + completedBoosts;
          statsData.totalRevenue = (statsData.totalRevenue || 0) + boostRevenue;
          
          // Calculate today's boost payments
          const today = new Date().toDateString();
          const todayBoosts = boostPayments.filter(p => {
            const paymentDate = new Date(p.paymentDate || p.createdAt);
            return paymentDate.toDateString() === today && p.status === 'completed';
          });
          statsData.today = (statsData.today || 0) + todayBoosts.length;
        }
      } catch (boostError) {
        console.log('Boost stats not available:', boostError.message);
      }

      // If API calls failed, calculate from local payments data
      if (statsData.total === 0 && payments.length > 0) {
        const subscriptionPayments = payments.filter(p => p.paymentType === 'subscription');
        const boostPayments = payments.filter(p => p.paymentType === 'boost');
        
        const subscriptionRevenue = subscriptionPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
        const boostRevenue = boostPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
        
        const today = new Date().toDateString();
        const todayPayments = payments.filter(p => {
          const paymentDate = new Date(p.paymentDate || p.createdAt);
          return paymentDate.toDateString() === today && p.status === 'completed';
        });

        statsData = {
          total: payments.length,
          completed: payments.filter(p => p.status === 'completed').length,
          totalRevenue: subscriptionRevenue + boostRevenue,
          today: todayPayments.length,
          boostPayments: boostPayments.length,
          subscriptionPayments: subscriptionPayments.length,
          boostRevenue: boostRevenue,
          subscriptionRevenue: subscriptionRevenue
        };
      }
      
      setStats(statsData);
      
    } catch (error) {
      console.error('Error fetching payment stats:', error);
    }
  };

  const filterAndSortPayments = () => {
    let filtered = [...payments];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(payment =>
        (payment.userName && payment.userName.toLowerCase().includes(term)) ||
        (payment.userEmail && payment.userEmail.toLowerCase().includes(term)) ||
        (payment.transactionId && payment.transactionId.toLowerCase().includes(term)) ||
        (payment.invoiceNumber && payment.invoiceNumber.toLowerCase().includes(term)) ||
        (payment.issueTitle && payment.issueTitle.toLowerCase().includes(term)) ||
        (payment._id && payment._id.toLowerCase().includes(term))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => 
        payment.status && payment.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(payment => payment.paymentType === typeFilter);
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(payment => {
        if (!payment.paymentDate) return false;
        const paymentDate = new Date(payment.paymentDate);
        switch(dateFilter) {
          case 'today':
            return paymentDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return paymentDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return paymentDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle date fields
      if (sortField === 'paymentDate' || sortField === 'subscriptionStart' || sortField === 'subscriptionEnd') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }

      // Handle numeric fields
      if (sortField === 'amount') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      }

      // Handle string fields (case insensitive)
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredPayments(filtered);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleViewDetails = (payment) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
  };

  const handleRefresh = () => {
    fetchAllPayments();
    fetchPaymentStats();
  };

  const handleExportCSV = () => {
    if (filteredPayments.length === 0) {
      alert('No payments to export');
      return;
    }

    const csvContent = [
      ['Type', 'Invoice No', 'Transaction ID', 'User Name', 'Email', 'Plan/Boost', 'Amount', 'Status', 'Date', 'Related Issue', 'Payment Method'],
      ...filteredPayments.map(p => [
        p.paymentType === 'boost' ? 'Boost' : 'Subscription',
        p.invoiceNumber || 'N/A',
        p.transactionId || 'N/A',
        p.userName || 'N/A',
        p.userEmail || 'N/A',
        p.plan || (p.boostType === 'priority_boost' ? 'Priority Boost' : 'Issue Boost'),
        `₹${p.amount || 0}`,
        p.status || 'N/A',
        new Date(p.paymentDate).toLocaleDateString(),
        p.issueTitle || 'N/A',
        p.paymentMethod || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all_payments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      completed: { color: 'green', label: 'Completed' },
      pending: { color: 'yellow', label: 'Pending' },
      failed: { color: 'red', label: 'Failed' },
      refunded: { color: 'blue', label: 'Refunded' }
    };
    
    const statusInfo = statusMap[status?.toLowerCase()] || { color: 'gray', label: status || 'Unknown' };
    
    const colorClasses = {
      green: 'bg-green-100 text-green-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      red: 'bg-red-100 text-red-800',
      blue: 'bg-blue-100 text-blue-800',
      gray: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorClasses[statusInfo.color]}`}>
        {statusInfo.label.toUpperCase()}
      </span>
    );
  };

  const getPaymentTypeBadge = (paymentType, boostType) => {
    if (paymentType === 'boost') {
      return (
        <div className="flex items-center gap-2">
          <FaRocket className="w-4 h-4 text-orange-500" />
          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
            {boostType === 'priority_boost' ? 'PRIORITY BOOST' : 'ISSUE BOOST'}
          </span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2">
          <FaGem className="w-4 h-4 text-purple-500" />
          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
            SUBSCRIPTION
          </span>
        </div>
      );
    }
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="w-3 h-3 ml-1 text-gray-400" />;
    return sortDirection === 'asc' ? 
      <FaSortUp className="w-3 h-3 ml-1 text-blue-600" /> : 
      <FaSortDown className="w-3 h-3 ml-1 text-blue-600" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment data from MongoDB...</p>
          <p className="text-sm text-gray-500">Fetching subscriptions and boost payments</p>
          {error && (
            <p className="text-sm text-red-500 mt-2">{error}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FaMoneyBill className="text-green-600" />
                Payment Management
              </h1>
              <p className="text-gray-600 mt-2">
                Viewing {payments.length} payments from MongoDB
                {stats.subscriptionPayments > 0 && (
                  <span className="ml-2">
                    (<span className="text-purple-600">{stats.subscriptionPayments} subscriptions</span>
                    <span className="mx-2">•</span>
                    <span className="text-orange-600">{stats.boostPayments} boosts</span>)
                  </span>
                )}
              </p>
              {error && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 flex items-center gap-2">
                    <FaExclamationTriangle className="w-4 h-4" />
                    {error}
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
              >
                <FaSyncAlt className="w-4 h-4" />
                Refresh All
              </button>
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
              >
                <FaDownload className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Payments</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <FaGem className="w-3 h-3 text-purple-500" /> {stats.subscriptionPayments}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaRocket className="w-3 h-3 text-orange-500" /> {stats.boostPayments}
                  </span>
                </div>
              </div>
              <FaMoneyBill className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                <p className="text-xs text-gray-500 mt-1">All successful payments</p>
              </div>
              <FaCheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Today's Payments</p>
                <p className="text-2xl font-bold text-purple-600">{stats.today}</p>
                <p className="text-xs text-gray-500 mt-1">Completed today</p>
              </div>
              <FaCalendarAlt className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-orange-600">₹{stats.totalRevenue?.toLocaleString() || 0}</p>
                <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <FaGem className="w-3 h-3 text-purple-500" /> 
                    ₹{stats.subscriptionRevenue?.toLocaleString() || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <FaRocket className="w-3 h-3 text-orange-500" /> 
                    ₹{stats.boostRevenue?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
              <FaChartLine className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, email, issue, or transaction ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="subscription">Subscriptions</option>
                <option value="boost">Issue Boosts</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('invoiceNumber')}
                  >
                    <div className="flex items-center">
                      Invoice / Transaction
                      {renderSortIcon('invoiceNumber')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('userName')}
                  >
                    <div className="flex items-center">
                      User
                      {renderSortIcon('userName')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('plan')}
                  >
                    <div className="flex items-center">
                      Details
                      {renderSortIcon('plan')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('amount')}
                  >
                    <div className="flex items-center">
                      Amount
                      {renderSortIcon('amount')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('paymentDate')}
                  >
                    <div className="flex items-center">
                      Payment Date
                      {renderSortIcon('paymentDate')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPaymentTypeBadge(payment.paymentType, payment.boostType)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {payment.invoiceNumber || payment.transactionId || 'N/A'}
                        </div>
                        {payment.transactionId && payment.transactionId !== payment.invoiceNumber && (
                          <div className="text-xs text-gray-500">
                            {payment.transactionId}
                          </div>
                        )}
                        <div className="text-xs text-gray-400 font-mono mt-1">
                          ID: {payment._id?.substring(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <FaUser className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {payment.userName || payment.userEmail || 'Unknown User'}
                            </div>
                            <div className="text-xs text-gray-500 truncate max-w-xs">
                              {payment.userEmail || 'No email'}
                            </div>
                            <div className="text-xs text-gray-400">
                              {payment.userRole || 'user'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {payment.plan || 
                            (payment.boostType === 'priority_boost' ? 'Priority Boost' : 'Issue Boost')}
                        </div>
                        {payment.issueTitle && (
                          <div className="text-xs text-gray-500 truncate max-w-xs" title={payment.issueTitle}>
                            <FaFire className="w-3 h-3 inline mr-1 text-orange-500" />
                            Issue: {payment.issueTitle}
                          </div>
                        )}
                        {payment.subscriptionEnd && (
                          <div className="text-xs text-gray-500">
                            <FaCalendarAlt className="w-3 h-3 inline mr-1 text-purple-500" />
                            Until: {formatDate(payment.subscriptionEnd)}
                          </div>
                        )}
                        {payment.oldPriority && payment.newPriority && (
                          <div className="text-xs text-gray-500">
                            Priority: {payment.oldPriority} → {payment.newPriority}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900 flex items-center">
                          <FaRupeeSign className="w-3 h-3 mr-1" />
                          {(payment.amount || 0).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {payment.paymentMethod || 'Card'}
                          {payment.cardLastFour && (
                            <span className="ml-2">•••• {payment.cardLastFour}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(payment.paymentDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(payment)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1 transition-colors px-3 py-1 bg-blue-50 rounded-lg hover:bg-blue-100"
                        >
                          <FaEye className="w-4 h-4" />
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <div className="text-gray-400 mb-4">
                        <FaMoneyBill className="w-12 h-12 mx-auto" />
                      </div>
                      <p className="text-gray-500 text-lg">No payments found</p>
                      <p className="text-gray-400 text-sm mt-2">
                        {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || dateFilter !== 'all' 
                          ? 'Try changing your search or filter criteria'
                          : 'Payments will appear here once users make payments or boost issues'}
                      </p>
                      {payments.length === 0 && (
                        <button
                          onClick={handleRefresh}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
                        >
                          <FaSyncAlt className="w-4 h-4" />
                          Refresh Data
                        </button>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Summary */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-500">
                Showing {filteredPayments.length} of {payments.length} payments
                {typeFilter === 'all' && payments.length > 0 && (
                  <span className="ml-4">
                    <span className="text-purple-600">Subscriptions: {payments.filter(p => p.paymentType === 'subscription').length}</span>
                    <span className="mx-2">•</span>
                    <span className="text-orange-600">Boosts: {payments.filter(p => p.paymentType === 'boost').length}</span>
                  </span>
                )}
              </div>
              <div className="text-sm font-medium text-gray-900">
                Total Revenue: <span className="text-green-600">
                  ₹{(filteredPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Details Modal */}
      {showDetailsModal && selectedPayment && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowDetailsModal(false)}
          />
          
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {selectedPayment.paymentType === 'boost' ? (
                      <FaRocket className="w-6 h-6 text-orange-500" />
                    ) : (
                      <FaGem className="w-6 h-6 text-purple-500" />
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {selectedPayment.paymentType === 'boost' ? 'Boost Payment' : 'Subscription Payment'} Details
                      </h3>
                      <p className="text-sm text-gray-500">
                        {selectedPayment.paymentType === 'boost' ? 'Issue Priority Boost' : 'Premium Subscription'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    <FaTimesCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Customer Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <FaUser className="w-4 h-4" /> Customer Information
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">{selectedPayment.userName || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{selectedPayment.userEmail || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium">{selectedPayment.userPhone || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Role:</span>
                        <span className="font-medium">{selectedPayment.userRole || 'user'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">User ID:</span>
                        <span className="font-medium text-sm truncate max-w-xs">{selectedPayment.userId || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Payment Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <FaCreditCard className="w-4 h-4" /> Payment Information
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Type:</span>
                        {selectedPayment.paymentType === 'boost' ? 
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">BOOST</span> : 
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">SUBSCRIPTION</span>
                        }
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Invoice:</span>
                        <span className="font-medium">{selectedPayment.invoiceNumber || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transaction:</span>
                        <span className="font-medium">{selectedPayment.transactionId || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Plan/Boost:</span>
                        <span className="font-medium">{selectedPayment.plan || (selectedPayment.boostType === 'priority_boost' ? 'Priority Boost' : 'Issue Boost')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Method:</span>
                        <span className="font-medium">{selectedPayment.paymentMethod || 'Card'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-bold">₹{selectedPayment.amount || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Status:</span>
                        {getStatusBadge(selectedPayment.status)}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Boost-specific details */}
                {selectedPayment.paymentType === 'boost' && (
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg mb-6 border border-orange-200">
                    <h4 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                      <FaFire className="w-4 h-4" /> Boost Details
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Issue Title:</span>
                        <span className="font-medium truncate max-w-xs">{selectedPayment.issueTitle || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Issue ID:</span>
                        <span className="font-medium font-mono text-sm">{selectedPayment.issueId || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Boost Type:</span>
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                          {selectedPayment.boostType === 'priority_boost' ? 'PRIORITY BOOST' : 'ISSUE BOOST'}
                        </span>
                      </div>
                      {selectedPayment.oldPriority && selectedPayment.newPriority && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Priority Change:</span>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                              {selectedPayment.oldPriority.toUpperCase()}
                            </span>
                            <span className="text-gray-400">→</span>
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                              {selectedPayment.newPriority.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Subscription Details (only for subscriptions) */}
                {selectedPayment.paymentType === 'subscription' && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <FaCalendarAlt className="w-4 h-4" /> Subscription Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Payment Date</p>
                        <p className="font-medium">{formatDate(selectedPayment.paymentDate)}</p>
                      </div>
                      {selectedPayment.subscriptionStart && (
                        <div>
                          <p className="text-sm text-gray-500">Subscription Start</p>
                          <p className="font-medium">{formatDate(selectedPayment.subscriptionStart)}</p>
                        </div>
                      )}
                      {selectedPayment.subscriptionEnd && (
                        <div>
                          <p className="text-sm text-gray-500">Subscription End</p>
                          <p className="font-medium">{formatDate(selectedPayment.subscriptionEnd)}</p>
                        </div>
                      )}
                    </div>
                    {selectedPayment.subscriptionEnd && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-700">
                          Subscription active until {formatDate(selectedPayment.subscriptionEnd)}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* MongoDB Document Info */}
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                    <FaDatabase className="w-4 h-4" /> MongoDB Information
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Document ID:</span>
                      <span className="font-mono text-sm">{selectedPayment._id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Collection:</span>
                      <code className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {selectedPayment.paymentType === 'boost' ? 'boost_payment' : 'payments'}
                      </code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="text-sm">{formatDate(selectedPayment.createdAt)}</span>
                    </div>
                    {selectedPayment.updatedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Updated:</span>
                        <span className="text-sm">{formatDate(selectedPayment.updatedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Security Info */}
                <div className="mb-6 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start">
                    <FaShieldAlt className="w-4 h-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                    <p className="text-sm text-green-700">
                      This payment information is securely stored in MongoDB and is encrypted. 
                      Card details are tokenized and never stored in plain text.
                    </p>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t border-gray-200">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ViewPayment;