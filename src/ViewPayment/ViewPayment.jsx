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
  FaFileInvoice
} from 'react-icons/fa';
import axios from 'axios';

const ViewPayment = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortField, setSortField] = useState('paymentDate');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    totalRevenue: 0,
    today: 0
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
  }, [payments, searchTerm, statusFilter, dateFilter, sortField, sortDirection]);

  const fetchAllPayments = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3000/payments');
      
      if (response.data.success && Array.isArray(response.data.payments)) {
        setPayments(response.data.payments);
        console.log(`📊 Loaded ${response.data.payments.length} payments from MongoDB`);
      } else {
        console.error('Invalid response format:', response.data);
        setPayments([]);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentStats = async () => {
    try {
      const response = await axios.get('http://localhost:3000/payments/stats');
      
      if (response.data.success) {
        setStats(response.data.stats);
      }
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
        payment.userName?.toLowerCase().includes(term) ||
        payment.userEmail?.toLowerCase().includes(term) ||
        (payment.transactionId && payment.transactionId.toLowerCase().includes(term)) ||
        (payment.invoiceNumber && payment.invoiceNumber.toLowerCase().includes(term))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(payment => {
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

      if (sortField === 'paymentDate' || sortField === 'subscriptionStart' || sortField === 'subscriptionEnd') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }

      if (sortField === 'amount') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
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
      ['Invoice No', 'User Name', 'Email', 'Plan', 'Amount', 'Status', 'Date', 'Transaction ID'],
      ...filteredPayments.map(p => [
        p.invoiceNumber || 'N/A',
        p.userName || 'N/A',
        p.userEmail || 'N/A',
        p.plan || 'N/A',
        `₹${p.amount || 0}`,
        p.status || 'N/A',
        new Date(p.paymentDate).toLocaleDateString(),
        p.transactionId || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-blue-100 text-blue-800'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status ? status.toUpperCase() : 'UNKNOWN'}
      </span>
    );
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="w-3 h-3 ml-1" />;
    return sortDirection === 'asc' ? 
      <FaSortUp className="w-3 h-3 ml-1" /> : 
      <FaSortDown className="w-3 h-3 ml-1" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment data from MongoDB...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FaMoneyBill className="text-green-600" />
                Payment Management
              </h1>
              <p className="text-gray-600 mt-2">
                Viewing {payments.length} payments from MongoDB database
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
              >
                <FaSyncAlt className="w-4 h-4" />
                Refresh
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
              </div>
              <FaMoneyBill className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <FaCheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Today's Payments</p>
                <p className="text-2xl font-bold text-purple-600">{stats.today}</p>
              </div>
              <FaCalendarAlt className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow border border-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-orange-600">₹{stats.totalRevenue?.toLocaleString() || 0}</p>
              </div>
              <FaRupeeSign className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, email, or transaction ID..."
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
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('invoiceNumber')}
                  >
                    <div className="flex items-center">
                      Invoice
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
                      Plan
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
                        <div className="text-sm font-medium text-gray-900">
                          {payment.invoiceNumber || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {payment.transactionId || 'No transaction ID'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <FaUser className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {payment.userName || payment.userEmail || 'Unknown User'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {payment.userEmail || 'No email'}
                            </div>
                            <div className="text-xs text-gray-400">
                              {payment.userRole || 'user'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {payment.plan || 'Premium Subscription'}
                        </div>
                        {payment.subscriptionEnd && (
                          <div className="text-xs text-gray-500">
                            Until: {formatDate(payment.subscriptionEnd)}
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
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment.status)}
                        {payment.cardLastFour && (
                          <div className="text-xs text-gray-500 mt-1">
                            Card: •••• {payment.cardLastFour}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(payment.paymentDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(payment)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1 transition-colors"
                        >
                          <FaEye className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="text-gray-400 mb-4">
                        <FaMoneyBill className="w-12 h-12 mx-auto" />
                      </div>
                      <p className="text-gray-500 text-lg">No payments found in database</p>
                      <p className="text-gray-400 text-sm mt-2">
                        {searchTerm || statusFilter !== 'all' || dateFilter !== 'all' 
                          ? 'Try changing your search or filter criteria'
                          : 'Payments will appear here once users make payments'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Summary */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Showing {filteredPayments.length} of {payments.length} payments
              </div>
              <div className="text-sm font-medium text-gray-900">
                Total Revenue: <span className="text-green-600">
                  ₹{(filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Details Modal - Fixed Version */}
      {showDetailsModal && selectedPayment && (
        <>
          {/* Background overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowDetailsModal(false)}
          />
          
          {/* Modal container */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              {/* Sticky header */}
              <div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-900">Payment Details</h3>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FaTimesCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* Scrollable content area */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Customer Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <FaUser className="w-4 h-4" /> Customer Information
                    </h4>
                    <div className="space-y-2">
                      <p><span className="text-gray-600">Name:</span> {selectedPayment.userName || 'N/A'}</p>
                      <p><span className="text-gray-600">Email:</span> {selectedPayment.userEmail || 'N/A'}</p>
                      <p><span className="text-gray-600">Phone:</span> {selectedPayment.userPhone || 'N/A'}</p>
                      <p><span className="text-gray-600">Role:</span> {selectedPayment.userRole || 'user'}</p>
                      <p><span className="text-gray-600">User ID:</span> {selectedPayment.userId || 'N/A'}</p>
                    </div>
                  </div>
                  
                  {/* Payment Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <FaCreditCard className="w-4 h-4" /> Payment Information
                    </h4>
                    <div className="space-y-2">
                      <p><span className="text-gray-600">Invoice:</span> {selectedPayment.invoiceNumber || 'N/A'}</p>
                      <p><span className="text-gray-600">Transaction:</span> {selectedPayment.transactionId || 'N/A'}</p>
                      <p><span className="text-gray-600">Plan:</span> {selectedPayment.plan || 'N/A'}</p>
                      <p><span className="text-gray-600">Method:</span> {selectedPayment.paymentMethod || 'N/A'}</p>
                      <p><span className="text-gray-600">Amount:</span> ₹{selectedPayment.amount || 0}</p>
                      <p><span className="text-gray-600">Status:</span> {getStatusBadge(selectedPayment.status)}</p>
                    </div>
                  </div>
                </div>
                
                {/* Subscription Details */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FaCalendarAlt className="w-4 h-4" /> Subscription Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Payment Date</p>
                      <p className="font-medium">{formatDate(selectedPayment.paymentDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Subscription Start</p>
                      <p className="font-medium">{formatDate(selectedPayment.subscriptionStart)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Subscription End</p>
                      <p className="font-medium">{formatDate(selectedPayment.subscriptionEnd)}</p>
                    </div>
                  </div>
                </div>
                
                {/* MongoDB Document ID */}
                <div className="mb-6 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>MongoDB Document ID:</strong> {selectedPayment._id}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Stored in: <code>payments</code> collection
                  </p>
                </div>
                
                {/* Action Buttons - sticky bottom */}
                <div className="sticky bottom-0 bg-white pt-4 pb-2">
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