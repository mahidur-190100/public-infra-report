import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaCheckCircle, 
  FaHistory, 
  FaSearch, 
  FaFilter, 
  FaCalendarAlt,
  FaChartLine,
  FaThumbsUp,
  FaUser,
  FaMapMarkerAlt,
  FaTag,
  FaEye,
  FaDownload,
  FaSync,
  FaClock,
  FaStar,
  FaRegChartBar,
  FaRegCalendarCheck,
  FaArrowRight,
  FaTimesCircle,
  FaInfoCircle,
  FaFileExport
} from 'react-icons/fa';

const ResolvedIssues = () => {
  const navigate = useNavigate();
  const [resolvedIssues, setResolvedIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [staffData, setStaffData] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    thisWeek: 0,
    thisMonth: 0,
    averageResolutionTime: 0,
    highPriorityResolved: 0,
    rating: 0
  });

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedIssue, setSelectedIssue] = useState(null);

  useEffect(() => {
    fetchStaffResolvedIssues();
  }, []);

  useEffect(() => {
    filterAndSortIssues();
  }, [resolvedIssues, categoryFilter, priorityFilter, dateFilter, searchTerm, sortBy]);

  const fetchStaffResolvedIssues = async () => {
    try {
      setLoading(true);
      
      // Get staff data from localStorage
      const user = localStorage.getItem('user');
      if (!user) {
        navigate('/login');
        return;
      }

      const parsedUser = JSON.parse(user);
      setStaffData(parsedUser);
      
      // Check if user is staff
      if (parsedUser.role !== 'staff') {
        navigate('/dashboard');
        return;
      }

      console.log('👤 Fetching resolved issues for staff:', parsedUser.email);

      // Method 1: Get all issues and filter for resolved ones
      try {
        const response = await axios.get('https://public-infra-report-server.vercel.app/issues');
        
        if (response.data.success) {
          const allIssues = response.data.issues || [];
          
          // Filter: issues that are resolved AND assigned to this staff
          const staffResolvedIssues = allIssues.filter(issue => {
            // Check if issue is resolved
            const isResolved = issue.status?.toLowerCase() === 'resolved';
            if (!isResolved) return false;
            
            // Check if assigned to this staff
            const staffEmail = parsedUser.email?.toLowerCase();
            const staffName = parsedUser.name?.toLowerCase() || parsedUser.displayName?.toLowerCase();
            
            if (!issue.assignedTo) return false;
            
            if (typeof issue.assignedTo === 'string') {
              const assigned = issue.assignedTo.toLowerCase();
              return assigned.includes(staffEmail) || 
                     (staffName && assigned.includes(staffName));
            }
            
            if (typeof issue.assignedTo === 'object' && issue.assignedTo !== null) {
              const assignedEmail = issue.assignedTo.email?.toLowerCase();
              const assignedName = issue.assignedTo.name?.toLowerCase();
              const assignedId = issue.assignedTo.id?.toString();
              
              return assignedEmail === staffEmail ||
                     (staffName && assignedName === staffName) ||
                     assignedId === (parsedUser.id || parsedUser.email);
            }
            
            return false;
          });

          console.log(`✅ Found ${staffResolvedIssues.length} resolved issues assigned to this staff`);
          setResolvedIssues(staffResolvedIssues);
          calculateStats(staffResolvedIssues);
        }
      } catch (error) {
        console.error('Error fetching all issues:', error);
        // Try alternative method
        try {
          const staffResponse = await axios.get(`https://public-infra-report-server.vercel.app/staff/issues`, {
            params: {
              staffEmail: parsedUser.email,
              staffId: parsedUser.id || parsedUser.email
            }
          });

          if (staffResponse.data.success) {
            const staffIssues = staffResponse.data.issues || [];
            const resolvedIssues = staffIssues.filter(issue => 
              issue.status?.toLowerCase() === 'resolved'
            );
            setResolvedIssues(resolvedIssues);
            calculateStats(resolvedIssues);
          }
        } catch (staffError) {
          console.error('Error fetching staff issues:', staffError);
        }
      }

    } catch (error) {
      console.error('Critical error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (issues) => {
    const total = issues.length;
    
    // This week resolved
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeek = issues.filter(issue => {
      if (!issue.resolvedAt) return false;
      return new Date(issue.resolvedAt) >= oneWeekAgo;
    }).length;
    
    // This month resolved
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const thisMonth = issues.filter(issue => {
      if (!issue.resolvedAt) return false;
      return new Date(issue.resolvedAt) >= oneMonthAgo;
    }).length;
    
    // High priority resolved
    const highPriorityResolved = issues.filter(issue => 
      issue.priority?.toLowerCase() === 'high'
    ).length;
    
    // Calculate average resolution time
    let totalResolutionTime = 0;
    let resolvedWithTimes = 0;
    
    issues.forEach(issue => {
      if (issue.resolvedAt && (issue.createdAt || issue.reportedAt)) {
        const created = new Date(issue.createdAt || issue.reportedAt);
        const resolved = new Date(issue.resolvedAt);
        const diffTime = Math.abs(resolved - created);
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        totalResolutionTime += diffDays;
        resolvedWithTimes++;
      }
    });
    
    const averageResolutionTime = resolvedWithTimes > 0 
      ? (totalResolutionTime / resolvedWithTimes).toFixed(1)
      : 0;
    
    // Calculate rating based on upvotes and resolution time
    let rating = 0;
    if (issues.length > 0) {
      const totalUpvotes = issues.reduce((sum, issue) => sum + (issue.upvotes || 0), 0);
      const avgUpvotes = totalUpvotes / issues.length;
      
      // Simple rating calculation
      rating = Math.min(5, (avgUpvotes / 2) + (issues.length / 10));
      rating = Math.max(1, rating.toFixed(1));
    }
    
    setStats({
      total,
      thisWeek,
      thisMonth,
      averageResolutionTime,
      highPriorityResolved,
      rating: parseFloat(rating)
    });
  };

  const filterAndSortIssues = () => {
    let result = [...resolvedIssues];

    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(issue => issue.category === categoryFilter);
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      result = result.filter(issue => 
        issue.priority?.toLowerCase() === priorityFilter.toLowerCase()
      );
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      result = result.filter(issue => {
        if (!issue.resolvedAt) return false;
        const resolvedDate = new Date(issue.resolvedAt);
        
        switch(dateFilter) {
          case 'today':
            return resolvedDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return resolvedDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return resolvedDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(issue => 
        issue.title?.toLowerCase().includes(term) ||
        issue.description?.toLowerCase().includes(term) ||
        issue.location?.toLowerCase().includes(term) ||
        issue.category?.toLowerCase().includes(term) ||
        issue.reportedBy?.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    switch(sortBy) {
      case 'upvotes':
        result.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
        break;
      case 'title':
        result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'date-old':
        result.sort((a, b) => new Date(a.resolvedAt) - new Date(b.resolvedAt));
        break;
      case 'priority':
        const priorityOrder = { high: 1, medium: 2, low: 3, normal: 4 };
        result.sort((a, b) => 
          (priorityOrder[a.priority?.toLowerCase()] || 5) - 
          (priorityOrder[b.priority?.toLowerCase()] || 5)
        );
        break;
      case 'recent':
      default:
        result.sort((a, b) => new Date(b.resolvedAt) - new Date(a.resolvedAt));
        break;
    }

    setFilteredIssues(result);
  };

  const getCategories = () => {
    const categories = new Set(['all']);
    resolvedIssues.forEach(issue => {
      if (issue.category) categories.add(issue.category);
    });
    return Array.from(categories);
  };

  const getPriorities = () => {
    const priorities = new Set(['all']);
    resolvedIssues.forEach(issue => {
      if (issue.priority) priorities.add(issue.priority.toLowerCase());
    });
    return Array.from(priorities);
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

  const formatTimeSince = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
      }
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
    } else {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months !== 1 ? 's' : ''} ago`;
    }
  };

  const calculateResolutionTime = (createdAt, resolvedAt) => {
    if (!createdAt || !resolvedAt) return 'N/A';
    
    const created = new Date(createdAt);
    const resolved = new Date(resolvedAt);
    const diffTime = Math.abs(resolved - created);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays === 0) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    }
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
  };

  const handleViewDetails = (issueId) => {
    navigate(`/issues/${issueId}`);
  };

  const handleExportCSV = () => {
    if (filteredIssues.length === 0) {
      alert('No issues to export');
      return;
    }

    const csvContent = [
      ['Issue ID', 'Title', 'Category', 'Priority', 'Location', 'Reported By', 'Reported Date', 'Resolved Date', 'Resolution Time', 'Upvotes', 'Status'],
      ...filteredIssues.map(issue => [
        issue._id,
        issue.title,
        issue.category,
        issue.priority,
        issue.location,
        issue.reportedBy,
        formatDate(issue.reportedAt),
        formatDate(issue.resolvedAt),
        calculateResolutionTime(issue.createdAt || issue.reportedAt, issue.resolvedAt),
        issue.upvotes || 0,
        issue.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resolved_issues_${staffData?.name || staffData?.email}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const refreshData = () => {
    setLoading(true);
    fetchStaffResolvedIssues();
  };

  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Road Damage': 'bg-blue-100 text-blue-800',
      'Street Lights': 'bg-yellow-100 text-yellow-800',
      'Garbage': 'bg-green-100 text-green-800',
      'Water Leakage': 'bg-blue-100 text-blue-800',
      'Footpaths': 'bg-purple-100 text-purple-800',
      'Drainage': 'bg-indigo-100 text-indigo-800',
      'Traffic Signs': 'bg-red-100 text-red-800',
      'Parks': 'bg-green-100 text-green-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your resolved issues...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FaCheckCircle className="text-green-600" />
                My Resolved Issues
              </h1>
              <p className="text-gray-600 mt-2">
                Issues that you have successfully resolved • {staffData?.name || staffData?.email}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={refreshData}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <FaSync className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                disabled={filteredIssues.length === 0}
              >
                <FaDownload className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.total}</p>
              </div>
              <FaCheckCircle className="w-8 h-8 text-green-500 opacity-80" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">This Week</p>
                <p className="text-2xl font-bold text-blue-600">{stats.thisWeek}</p>
              </div>
              <FaRegCalendarCheck className="w-8 h-8 text-blue-500 opacity-80" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">This Month</p>
                <p className="text-2xl font-bold text-purple-600">{stats.thisMonth}</p>
              </div>
              <FaCalendarAlt className="w-8 h-8 text-purple-500 opacity-80" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Avg Resolution Time</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.averageResolutionTime}d</p>
              </div>
              <FaClock className="w-8 h-8 text-yellow-500 opacity-80" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">High Priority Resolved</p>
                <p className="text-2xl font-bold text-red-600">{stats.highPriorityResolved}</p>
              </div>
              <FaStar className="w-8 h-8 text-red-500 opacity-80" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Performance Rating</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.rating}/5</p>
              </div>
              <FaRegChartBar className="w-8 h-8 text-indigo-500 opacity-80" />
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search resolved issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Categories</option>
                {getCategories().filter(cat => cat !== 'all').map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Priority</option>
                {getPriorities().filter(pri => pri !== 'all').map(priority => (
                  <option key={priority} value={priority}>
                    {priority.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
            
            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="recent">Most Recent</option>
                <option value="date-old">Oldest First</option>
                <option value="upvotes">Most Upvoted</option>
                <option value="title">Title A-Z</option>
                <option value="priority">Priority</option>
              </select>
            </div>
          </div>
          
          {/* Clear Filters Button */}
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {filteredIssues.length} issues match your criteria
            </div>
            <button
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
                setPriorityFilter('all');
                setDateFilter('all');
                setSortBy('recent');
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Clear all filters
            </button>
          </div>
        </div>

        {/* Resolved Issues List */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Resolved Issues History ({filteredIssues.length})
                </h2>
                <p className="text-gray-600 text-sm">
                  Issues you have successfully resolved and closed
                </p>
              </div>
              <div className="text-sm text-gray-500">
                Staff: {staffData?.name || staffData?.email}
              </div>
            </div>
          </div>
          
          <div>
            {filteredIssues.length === 0 ? (
              <div className="p-12 text-center">
                <FaCheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {resolvedIssues.length === 0 ? 'No Resolved Issues' : 'No Issues Match Filters'}
                </h3>
                <p className="text-gray-500">
                  {resolvedIssues.length === 0 
                    ? 'You haven\'t resolved any issues yet. Start working on assigned issues!' 
                    : 'Try changing your filter criteria.'}
                </p>
                {resolvedIssues.length === 0 && (
                  <button
                    onClick={() => navigate('/dashboard/staff/assigned')}
                    className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <FaArrowRight className="w-4 h-4" />
                    Go to Assigned Issues
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredIssues.map((issue) => (
                  <div key={issue._id} className="p-6 hover:bg-green-50 transition-colors">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold border border-green-300">
                            RESOLVED
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(issue.priority)}`}>
                            {issue.priority?.toUpperCase() || 'NORMAL'}
                          </span>
                          {issue.category && (
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getCategoryColor(issue.category)}`}>
                              {issue.category}
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{issue.title}</h3>
                        <p className="text-gray-600 mb-3 line-clamp-2">{issue.description}</p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleViewDetails(issue._id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          <FaEye className="w-4 h-4" />
                          View Details
                        </button>
                      </div>
                    </div>

                    {/* Issue Meta Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FaMapMarkerAlt className="w-4 h-4 text-gray-400" />
                        <span className="truncate">{issue.location || 'Location not specified'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <FaUser className="w-4 h-4 text-gray-400" />
                        <span>Reported by: {issue.reportedBy || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <FaCalendarAlt className="w-4 h-4 text-gray-400" />
                        <span>Resolved: {formatTimeSince(issue.resolvedAt)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <FaThumbsUp className="w-4 h-4 text-gray-400" />
                        <span>{issue.upvotes || 0} upvotes</span>
                      </div>
                    </div>

                    {/* Resolution Details */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Reported Date</p>
                          <p className="font-medium">{formatDate(issue.reportedAt || issue.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Resolved Date</p>
                          <p className="font-medium">{formatDate(issue.resolvedAt)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Resolution Time</p>
                          <p className="font-medium text-green-700">
                            {calculateResolutionTime(issue.createdAt || issue.reportedAt, issue.resolvedAt)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Timeline Summary */}
                      {issue.timeline && issue.timeline.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-green-200">
                          <p className="text-sm text-gray-600 mb-2">Resolution Summary:</p>
                          <div className="text-sm text-gray-700">
                            {issue.timeline.map((entry, idx) => (
                              entry.status?.toLowerCase() === 'resolved' && (
                                <div key={idx} className="flex items-start gap-2 mb-1">
                                  <FaCheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                                  <span>{entry.message}</span>
                                </div>
                              )
                            )).filter(Boolean)[0] || 'No resolution notes available'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Summary Footer */}
        <div className="mt-6 bg-white rounded-xl shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Performance Summary</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Total Issues Resolved: {stats.total}</p>
                <p>• Average Resolution Time: {stats.averageResolutionTime} days</p>
                <p>• This Week's Performance: {stats.thisWeek} issues</p>
                <p>• High Priority Resolved: {stats.highPriorityResolved}</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Recognition</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Performance Rating: <span className="font-bold text-green-600">{stats.rating}/5</span></p>
                <p>• Community Impact: {resolvedIssues.reduce((sum, issue) => sum + (issue.upvotes || 0), 0)} total upvotes</p>
                <p>• Most Resolved Category: {
                  resolvedIssues.length > 0 
                    ? (() => {
                        const categories = {};
                        resolvedIssues.forEach(issue => {
                          categories[issue.category] = (categories[issue.category] || 0) + 1;
                        });
                        const mostCommon = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
                        return mostCommon ? `${mostCommon[0]} (${mostCommon[1]})` : 'N/A';
                      })()
                    : 'N/A'
                }</p>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2"> Quick Actions</h3>
              <div className="space-y-3">
                <button
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm text-center"
                >
                  View Assigned Issues
                </button>
                <button
                  onClick={handleExportCSV}
                  disabled={filteredIssues.length === 0}
                  className={`w-full px-4 py-2 rounded-lg transition-colors text-sm text-center ${
                    filteredIssues.length === 0
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  Export Resolved Issues
                </button>
                <button
                  onClick={refreshData}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm text-center"
                >
                  Refresh Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResolvedIssues;