// AssignedIssue.jsx - COMPLETE FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaClipboardList, 
  FaClock, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaArrowRight,
  FaSearch,
  FaFilter,
  FaSort,
  FaEye,
  FaEdit,
  FaCalendarDay,
  FaMapMarkerAlt,
  FaUser,
  FaTag,
  FaSync,
  FaChartBar,
  FaSpinner,
  FaTasks,
  FaHistory,
  FaComment,
  FaThumbsUp,
  FaCalendarAlt,
  FaTools,
  FaListOl,
  FaRegCheckCircle,
  FaRegClock,
  FaArrowUp,
  FaArrowDown,
  FaChevronRight,
  FaPlay,
  FaTimes,
  FaInfoCircle
} from 'react-icons/fa';

const AssignedIssue = () => {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [staffData, setStaffData] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    highPriority: 0,
    weeklyResolved: 0
  });
  
  // Filters and search
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [expandedIssue, setExpandedIssue] = useState(null);

  useEffect(() => {
    fetchStaffAssignedIssues();
  }, []);

  useEffect(() => {
    filterAndSortIssues();
  }, [issues, statusFilter, priorityFilter, categoryFilter, searchTerm, sortBy]);

  const fetchStaffAssignedIssues = async () => {
    try {
      setLoading(true);
      console.log('🔍 ===== FETCHING STAFF ISSUES START =====');
      
      // Get staff data from localStorage
      const user = localStorage.getItem('user');
      if (!user) {
        console.error('❌ No user found in localStorage');
        navigate('/login');
        return;
      }

      const parsedUser = JSON.parse(user);
      setStaffData(parsedUser);
      
      // Check if user is staff
      if (parsedUser.role !== 'staff') {
        console.error('❌ User is not staff');
        navigate('/dashboard');
        return;
      }

      console.log('👤 Staff user:', {
        email: parsedUser.email,
        name: parsedUser.name || parsedUser.displayName,
        id: parsedUser.id || parsedUser._id,
        role: parsedUser.role
      });

      let allAssignedIssues = [];

      // METHOD 1: Try the staff/issues endpoint
      try {
        console.log('📡 Trying /staff/issues endpoint...');
        const staffResponse = await axios.get(`http://localhost:3000/staff/issues`, {
          params: {
            staffEmail: parsedUser.email,
            staffId: parsedUser.id || parsedUser.email
          }
        });

        console.log('📊 Staff endpoint response:', staffResponse.data);

        if (staffResponse.data.success) {
          const issuesFromEndpoint = staffResponse.data.issues || [];
          console.log(`✅ Found ${issuesFromEndpoint.length} issues via staff endpoint`);
          allAssignedIssues = [...allAssignedIssues, ...issuesFromEndpoint];
        }
      } catch (endpointError) {
        console.log('⚠️ Staff endpoint failed:', endpointError.message);
      }

      // METHOD 2: Fetch all issues and filter manually
      try {
        console.log('📡 Fetching all issues for manual filtering...');
        const allIssuesResponse = await axios.get('http://localhost:3000/issues');
        
        if (allIssuesResponse.data.success) {
          const allIssues = allIssuesResponse.data.issues || [];
          console.log(`📋 Total issues in system: ${allIssues.length}`);
          
          // Debug: Show first 3 issues structure
          console.log('🔍 Sample issues structure:');
          allIssues.slice(0, 3).forEach((issue, idx) => {
            console.log(`${idx + 1}. ${issue.title}`);
            console.log(`   assignedTo:`, issue.assignedTo);
            console.log(`   Type: ${typeof issue.assignedTo}`);
          });

          // Filter for this staff member
          const manuallyFiltered = allIssues.filter(issue => {
            if (!issue.assignedTo) return false;
            
            const staffEmail = parsedUser.email?.toLowerCase();
            const staffName = parsedUser.name?.toLowerCase() || parsedUser.displayName?.toLowerCase();
            
            // Check if assignedTo matches this staff
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

          console.log(`✅ Manually found ${manuallyFiltered.length} additional issues`);
          
          // Add unique issues from manual filtering
          const existingIds = new Set(allAssignedIssues.map(i => i._id));
          const newIssues = manuallyFiltered.filter(issue => !existingIds.has(issue._id));
          allAssignedIssues = [...allAssignedIssues, ...newIssues];
        }
      } catch (allIssuesError) {
        console.error('❌ Error fetching all issues:', allIssuesError.message);
      }

      // METHOD 3: Try debug endpoint to see all issues
      try {
        console.log('📡 Checking debug endpoint...');
        const debugResponse = await axios.get('http://localhost:3000/debug/all-issues');
        if (debugResponse.data.success) {
          const debugIssues = debugResponse.data.issues || [];
          
          // Find issues assigned to this staff in debug data
          const debugFiltered = debugIssues.filter(issue => {
            if (!issue.assignedTo) return false;
            
            const staffEmail = parsedUser.email?.toLowerCase();
            const staffName = parsedUser.name?.toLowerCase() || parsedUser.displayName?.toLowerCase();
            
            if (typeof issue.assignedTo === 'string') {
              const assigned = issue.assignedTo.toLowerCase();
              return assigned.includes(staffEmail) || 
                     (staffName && assigned.includes(staffName));
            }
            
            return false;
          });

          console.log(`🔍 Debug endpoint shows ${debugFiltered.length} possible matches`);
          
          // Add unique issues
          const existingIds = new Set(allAssignedIssues.map(i => i._id));
          const newDebugIssues = debugFiltered.filter(issue => !existingIds.has(issue._id));
          allAssignedIssues = [...allAssignedIssues, ...newDebugIssues];
        }
      } catch (debugError) {
        console.log('⚠️ Debug endpoint not available:', debugError.message);
      }

      console.log(`🎯 FINAL: Total assigned issues found: ${allAssignedIssues.length}`);
      
      // Set debug info
      setDebugInfo(`Found ${allAssignedIssues.length} issues using multiple methods`);
      
      // Remove duplicates
      const uniqueIssues = Array.from(new Map(allAssignedIssues.map(item => [item._id, item])).values());
      
      setIssues(uniqueIssues);
      calculateStats(uniqueIssues);
      
    } catch (error) {
      console.error('❌ Critical error in fetchStaffAssignedIssues:', error);
      setDebugInfo(`Error: ${error.message}`);
      setIssues([]);
    } finally {
      setLoading(false);
      console.log('===== FETCHING STAFF ISSUES END =====');
    }
  };

  const calculateStats = (issuesData) => {
    const total = issuesData.length;
    const pending = issuesData.filter(issue => 
      issue.status === 'pending' || issue.status === 'Pending' || issue.status === 'assigned'
    ).length;
    
    const inProgress = issuesData.filter(issue => 
      issue.status === 'in progress' || issue.status === 'in-progress'
    ).length;
    
    const resolved = issuesData.filter(issue => 
      issue.status === 'resolved' || issue.status === 'Resolved'
    ).length;
    
    const highPriority = issuesData.filter(issue => 
      issue.priority === 'high' || issue.priority === 'High'
    ).length;
    
    // Calculate weekly resolved (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const weeklyResolved = issuesData.filter(issue => {
      if (issue.status === 'resolved' && issue.resolvedAt) {
        return new Date(issue.resolvedAt) >= oneWeekAgo;
      }
      return false;
    }).length;

    setStats({
      total,
      pending,
      inProgress,
      resolved,
      highPriority,
      weeklyResolved
    });
  };

  const filterAndSortIssues = () => {
    let result = [...issues];

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(issue => {
        const status = issue.status?.toLowerCase();
        return status === statusFilter.toLowerCase();
      });
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      result = result.filter(issue => {
        const priority = issue.priority?.toLowerCase();
        return priority === priorityFilter.toLowerCase();
      });
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      result = result.filter(issue => 
        issue.category === categoryFilter
      );
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(issue => 
        issue.title?.toLowerCase().includes(term) ||
        issue.description?.toLowerCase().includes(term) ||
        issue.location?.toLowerCase().includes(term) ||
        issue.category?.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    switch(sortBy) {
      case 'priority':
        const priorityOrder = { high: 1, medium: 2, low: 3, normal: 4 };
        result.sort((a, b) => 
          (priorityOrder[a.priority?.toLowerCase()] || 5) - 
          (priorityOrder[b.priority?.toLowerCase()] || 5)
        );
        break;
      case 'title':
        result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      case 'date':
        result.sort((a, b) => new Date(a.createdAt || a.reportedAt) - new Date(b.createdAt || b.reportedAt));
        break;
      case 'recent':
      default:
        result.sort((a, b) => new Date(b.createdAt || b.reportedAt) - new Date(a.createdAt || a.reportedAt));
        break;
    }

    setFilteredIssues(result);
  };

  const handleStatusUpdate = async (issueId, newStatus) => {
    try {
      if (!issueId) {
        alert('Invalid issue ID');
        return;
      }

      console.log(`Updating issue ${issueId} status to ${newStatus}`);
      
      // Call API to update status
      const response = await axios.post(`http://localhost:3000/issues/${issueId}/update-status`, {
        status: newStatus,
        message: `Status updated to ${newStatus} by staff member`,
        updatedBy: staffData?.name || staffData?.email || 'Staff',
        updatedByEmail: staffData?.email
      });

      console.log('Status update response:', response.data);

      if (response.data.success) {
        // Update local state
        const updatedIssues = issues.map(issue => {
          if (issue._id === issueId) {
            const updatedIssue = {
              ...issue,
              status: newStatus,
              updatedAt: new Date().toISOString()
            };
            
            // If resolved, add resolved timestamp and set progress to 100%
            if (newStatus === 'resolved') {
              updatedIssue.resolvedAt = new Date().toISOString();
              updatedIssue.progress = 100;
            }
            // If starting work, set progress to 10%
            else if (newStatus === 'in-progress') {
              updatedIssue.progress = 10;
            }
            
            return updatedIssue;
          }
          return issue;
        });

        setIssues(updatedIssues);
        
        alert(`✅ Issue status updated to ${newStatus}`);
        
        // Refresh stats
        calculateStats(updatedIssues);
      } else {
        alert('Failed to update issue status: ' + response.data.message);
      }
      
    } catch (error) {
      console.error('Error updating issue status:', error);
      alert('❌ Failed to update issue status. Please try again.');
    }
  };

  const handleViewDetails = (issueId) => {
    navigate(`/issues/${issueId}`);
  };

  const handleUpdateProgress = async (issueId, progress) => {
    try {
      const response = await axios.patch(`http://localhost:3000/issues/${issueId}`, {
        progress: progress,
        updatedAt: new Date().toISOString()
      });

      if (response.data.success) {
        const updatedIssues = issues.map(issue =>
          issue._id === issueId ? { ...issue, progress: progress } : issue
        );
        setIssues(updatedIssues);
        alert(`✅ Progress updated to ${progress}%`);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      alert('Failed to update progress');
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': 
      case 'assigned': 
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'in-progress': 
      case 'in progress': 
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'resolved': 
        return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected': 
        return 'bg-red-100 text-red-800 border-red-300';
      default: 
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'high': 
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': 
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': 
        return 'bg-green-100 text-green-800 border-green-300';
      default: 
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategories = () => {
    const categories = new Set(['all']);
    issues.forEach(issue => {
      if (issue.category) categories.add(issue.category);
    });
    return Array.from(categories);
  };

  const refreshData = () => {
    setLoading(true);
    fetchStaffAssignedIssues();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your assigned issues...</p>
              <p className="text-sm text-gray-400 mt-2">This may take a moment</p>
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
                <FaClipboardList className="text-blue-600" />
                My Assigned Issues
              </h1>
              <p className="text-gray-600 mt-2">
                Issues assigned to you for resolution • {staffData?.name || staffData?.email}
              </p>
              {debugInfo && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                  <FaInfoCircle className="inline mr-2" />
                  {debugInfo}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={refreshData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FaSync className="w-4 h-4" />
                Refresh
              </button>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {stats.total} Issues
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Assigned</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <FaClipboardList className="w-8 h-8 text-blue-500 opacity-80" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Pending/Assigned</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <FaClock className="w-8 h-8 text-yellow-500 opacity-80" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
              </div>
              <FaTasks className="w-8 h-8 text-blue-500 opacity-80" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <FaCheckCircle className="w-8 h-8 text-green-500 opacity-80" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">High Priority</p>
                <p className="text-2xl font-bold text-red-600">{stats.highPriority}</p>
              </div>
              <FaExclamationTriangle className="w-8 h-8 text-red-500 opacity-80" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Weekly Resolved</p>
                <p className="text-2xl font-bold text-purple-600">{stats.weeklyResolved}</p>
              </div>
              <FaChartBar className="w-8 h-8 text-purple-500 opacity-80" />
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
                placeholder="Search issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            
            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                {getCategories().filter(cat => cat !== 'all').map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="recent">Most Recent</option>
                <option value="priority">Priority</option>
                <option value="title">Title</option>
                <option value="date">Oldest First</option>
              </select>
            </div>
          </div>
          
          {/* Clear Filters Button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setPriorityFilter('all');
                setCategoryFilter('all');
              }}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
            >
              Clear all filters
            </button>
          </div>
        </div>

        {/* Issues List */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Assigned Issues ({filteredIssues.length})
                </h2>
                <p className="text-gray-600 text-sm">
                  Showing {filteredIssues.length} of {issues.length} issues assigned to you
                </p>
              </div>
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
          
          <div>
            {filteredIssues.length === 0 ? (
              <div className="p-12 text-center">
                <FaClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {issues.length === 0 ? 'No Issues Assigned' : 'No Issues Match Filters'}
                </h3>
                <p className="text-gray-500">
                  {issues.length === 0 
                    ? 'You don\'t have any assigned issues yet.' 
                    : 'Try changing your search or filter criteria.'}
                </p>
                {issues.length === 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-400">
                      Issues will appear here when an admin assigns them to you.
                    </p>
                    <button
                      onClick={() => navigate('/dashboard/staff')}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Back to Staff Dashboard
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredIssues.map((issue) => (
                  <div key={issue._id} className="p-6 hover:bg-gray-50 transition-colors">
                    {/* Issue Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(issue.status)}`}>
                            {issue.status?.toUpperCase() || 'PENDING'}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(issue.priority)}`}>
                            {issue.priority?.toUpperCase() || 'NORMAL'}
                          </span>
                          {issue.category && (
                            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold">
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
                        <button
                          onClick={() => setExpandedIssue(expandedIssue === issue._id ? null : issue._id)}
                          className="p-2 text-gray-500 hover:text-gray-700"
                        >
                          <FaChevronRight className={`w-5 h-5 transition-transform ${expandedIssue === issue._id ? 'rotate-90' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Issue Meta Info */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 text-sm">
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
                        <span>Reported: {formatDate(issue.reportedAt || issue.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <FaThumbsUp className="w-4 h-4 text-gray-400" />
                        <span>{issue.upvotes || 0} upvotes</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {(issue.status === 'in-progress' || issue.status === 'in progress' || issue.progress > 0) && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{issue.progress || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              issue.progress >= 100 ? 'bg-green-600' : 'bg-blue-600'
                            }`}
                            style={{ width: `${issue.progress || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-3 mb-4">
                      {issue.status === 'pending' || issue.status === 'assigned' ? (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(issue._id, 'in-progress')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                          >
                            <FaPlay className="w-4 h-4" />
                            Start Working
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(issue._id, 'resolved')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                          >
                            <FaCheckCircle className="w-4 h-4" />
                            Mark as Resolved
                          </button>
                        </>
                      ) : issue.status === 'in-progress' || issue.status === 'in progress' ? (
                        <>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">Update Progress:</span>
                            {[25, 50, 75, 100].map(progress => (
                              <button
                                key={progress}
                                onClick={() => handleUpdateProgress(issue._id, progress)}
                                className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm"
                              >
                                {progress}%
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={() => handleStatusUpdate(issue._id, 'resolved')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                          >
                            <FaCheckCircle className="w-4 h-4" />
                            Mark Complete
                          </button>
                        </>
                      ) : issue.status === 'resolved' ? (
                        <button
                          onClick={() => handleStatusUpdate(issue._id, 'in-progress')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          <FaEdit className="w-4 h-4" />
                          Re-open Issue
                        </button>
                      ) : null}
                      
                      <button
                        onClick={() => handleViewDetails(issue._id)}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                        <FaComment className="w-4 h-4" />
                        Add Comment
                      </button>
                    </div>

                    {/* Expanded Details */}
                    {expandedIssue === issue._id && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-3">Issue Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600 mb-1"><strong>Issue ID:</strong> {issue._id}</p>
                            <p className="text-gray-600 mb-1"><strong>Reported by Email:</strong> {issue.userEmail || issue.reportedBy}</p>
                            <p className="text-gray-600 mb-1"><strong>Category:</strong> {issue.category || 'Not specified'}</p>
                            <p className="text-gray-600 mb-1"><strong>Created:</strong> {formatDateTime(issue.createdAt || issue.reportedAt)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 mb-1"><strong>Assigned To:</strong> 
                              {typeof issue.assignedTo === 'object' 
                                ? ` ${issue.assignedTo?.name || 'Unknown'} (${issue.assignedTo?.email || 'No email'})`
                                : ` ${issue.assignedTo || 'Not assigned'}`}
                            </p>
                            <p className="text-gray-600 mb-1"><strong>Last Updated:</strong> {formatDateTime(issue.updatedAt)}</p>
                            {issue.resolvedAt && (
                              <p className="text-gray-600 mb-1"><strong>Resolved:</strong> {formatDateTime(issue.resolvedAt)}</p>
                            )}
                            <p className="text-gray-600 mb-1"><strong>Upvoted by:</strong> {(issue.upvotedBy || []).length} users</p>
                          </div>
                        </div>
                        
                        {/* Timeline Preview */}
                        {issue.timeline && issue.timeline.length > 0 && (
                          <div className="mt-4">
                            <h5 className="font-semibold text-gray-900 mb-2">Recent Activity</h5>
                            <div className="space-y-2">
                              {issue.timeline.slice(-3).map((entry, idx) => (
                                <div key={idx} className="flex items-start gap-3 text-sm">
                                  <div className={`w-2 h-2 mt-1 rounded-full ${getStatusColor(entry.status).split(' ')[0]}`}></div>
                                  <div>
                                    <p className="text-gray-800">{entry.message}</p>
                                    <p className="text-gray-500 text-xs">
                                      By {entry.updatedBy} • {formatDateTime(entry.updatedAt)}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Summary Footer */}
        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>
            Showing {filteredIssues.length} of {issues.length} issues • 
            Last updated: {new Date().toLocaleString()} • 
            Staff: {staffData?.name || staffData?.email}
          </p>
          <button
            onClick={refreshData}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
          >
            Click here to refresh
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignedIssue;