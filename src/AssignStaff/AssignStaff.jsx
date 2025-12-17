import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  FaUserPlus,
  FaSearch,
  FaFilter,
  FaClock,
  FaUser,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTools,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaSyncAlt,
  FaListAlt,
  FaUsers,
  FaTachometerAlt,
  FaRegCheckCircle,
  FaRegClock,
  FaTimesCircle,
} from 'react-icons/fa';

const AssignStaff = () => {
  const [pendingIssues, setPendingIssues] = useState([]);
  const [inProgressIssues, setInProgressIssues] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [loading, setLoading] = useState({
    issues: true,
    staff: true,
    stats: true
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0
  });

  useEffect(() => {
    fetchIssues();
    fetchStaffMembers();
    fetchIssueStats();
  }, []);

  const filteredPendingIssues = pendingIssues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || issue.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || issue.priority === priorityFilter;

    return matchesSearch && matchesCategory && matchesPriority;
  });

  const getStaffName = (assignedTo) => {
    if (!assignedTo) return 'Unassigned';

    if (typeof assignedTo === 'string') return assignedTo;

    if (typeof assignedTo === 'object' && assignedTo !== null) {
      return assignedTo.name || assignedTo.displayName || 'Staff Member';
    }

    return 'Unassigned';
  };

  const fetchIssues = async () => {
    try {
      setLoading(prev => ({ ...prev, issues: true }));
      const response = await axios.get('https://public-infra-report-server.vercel.app/issues');

      if (response.data.success) {
        const allIssues = response.data.issues;

        const cleanIssues = allIssues.map(issue => {
          if (issue.assignedTo && typeof issue.assignedTo === 'object') {
            return {
              ...issue,
              assignedTo: getStaffName(issue.assignedTo)
            };
          }
          return issue;
        });

        const pending = cleanIssues.filter(issue =>
          issue.status === 'pending' || issue.status === 'Pending'
        );
        const inProgress = cleanIssues.filter(issue =>
          issue.status === 'in progress' || issue.status === 'in-progress'
        );

        setPendingIssues(pending);
        setInProgressIssues(inProgress);
      }
    } catch (error) {
      alert('Failed to load issues');
    } finally {
      setLoading(prev => ({ ...prev, issues: false }));
    }
  };

  const fetchStaffMembers = async () => {
    try {
      setLoading(prev => ({ ...prev, staff: true }));

      const response = await axios.get('https://public-infra-report-server.vercel.app/users');

      if (response.data.success) {
        const staffUsers = response.data.users.filter(user =>
          user.role && user.role.toLowerCase() === 'staff'
        );

        const inProgressIssuesResponse = await axios.get('https://public-infra-report-server.vercel.app/issues');
        const allIssues = inProgressIssuesResponse.data.success ? inProgressIssuesResponse.data.issues : [];

        const staffWithDetails = staffUsers.map(staff => {
          const currentTasks = allIssues.filter(issue => {
            if (!issue.assignedTo) return false;

            if (typeof issue.assignedTo === 'string') {
              return issue.assignedTo === (staff.displayName || staff.name || staff.email.split('@')[0]);
            } else if (typeof issue.assignedTo === 'object' && issue.assignedTo._id) {
              return issue.assignedTo._id === staff._id;
            }
            return false;
          }).length;

          const maxTasks = 5;
          const available = currentTasks < maxTasks;

          return {
            _id: staff._id,
            name: staff.displayName || staff.name || staff.email.split('@')[0],
            email: staff.email,
            role: staff.role,
            phone: staff.phone || 'Not provided',
            createdAt: staff.createdAt,
            isPremium: staff.isPremium || false,
            currentTasks: currentTasks,
            available: available,
            maxTasks: maxTasks
          };
        });

        setStaffMembers(staffWithDetails);
      }
    } catch (error) {
      alert('Note: Could not load staff members. Please ensure you have users with "staff" role in your database.');
      setStaffMembers([]);
    } finally {
      setLoading(prev => ({ ...prev, staff: false }));
    }
  };

  const fetchIssueStats = async () => {
    try {
      setLoading(prev => ({ ...prev, stats: true }));
      const response = await axios.get('https://public-infra-report-server.vercel.app/issues-stats');

      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
    } finally {
      setLoading(prev => ({ ...prev, stats: false }));
    }
  };

  const handleAssignStaff = async () => {
    if (!selectedIssue || !selectedStaff) {
      alert('Please select an issue and a staff member');
      return;
    }

    try {
      const assignedToData = {
        id: selectedStaff._id || selectedStaff.email,
        name: selectedStaff.name,
        email: selectedStaff.email,
        role: selectedStaff.role || 'staff',
        assignedDate: new Date().toISOString(),
        assignedBy: 'Admin'
      };

      const response = await axios.post(
        `https://public-infra-report-server.vercel.app/issues/${selectedIssue._id}/assign`,
        {
          staffId: selectedStaff._id || selectedStaff.email,
          staffName: selectedStaff.name,
          staffEmail: selectedStaff.email
        }
      );

      if (response.data.success) {
        fetchIssues();
        fetchStaffMembers();
        fetchIssueStats();

        alert(`Successfully assigned "${selectedIssue.title}" to ${selectedStaff.name}`);
        setShowAssignModal(false);
        setSelectedIssue(null);
        setSelectedStaff(null);
      } else {
        alert('Assignment failed: ' + response.data.message);
      }

    } catch (error) {
      try {
        const fallbackResponse = await axios.patch(
          `https://public-infra-report-server.vercel.app/issues/${selectedIssue._id}`,
          {
            status: 'assigned',
            assignedTo: {
              id: selectedStaff._id || selectedStaff.email,
              name: selectedStaff.name,
              email: selectedStaff.email
            },
            assignedDate: new Date().toISOString(),
            progress: 0,
            updatedAt: new Date().toISOString(),
            timeline: [
              ...(selectedIssue.timeline || []),
              {
                status: 'assigned',
                message: `Issue assigned to staff: ${selectedStaff.name} (${selectedStaff.email})`,
                updatedBy: 'Admin',
                updatedAt: new Date().toISOString()
              }
            ]
          }
        );

        if (fallbackResponse.data.success) {
          alert(`Successfully assigned "${selectedIssue.title}" to ${selectedStaff.name}`);

          fetchIssues();
          fetchStaffMembers();
          fetchIssueStats();

          setShowAssignModal(false);
          setSelectedIssue(null);
          setSelectedStaff(null);
        }
      } catch (fallbackError) {
        alert('Failed to assign staff.');
      }
    }
  };

  const getPriorityBadge = (priority) => {
    const priorityMap = {
      critical: 'bg-red-100 text-red-800 border border-red-200',
      high: 'bg-orange-100 text-orange-800 border border-orange-200',
      medium: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      normal: 'bg-blue-100 text-blue-800 border border-blue-200',
      low: 'bg-green-100 text-green-800 border border-green-200'
    };

    const priorityKey = priority?.toLowerCase() || 'normal';

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${priorityMap[priorityKey] || 'bg-gray-100 text-gray-800'}`}>
        {priority?.toUpperCase() || 'NORMAL'}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      'in progress': 'bg-blue-100 text-blue-800 border border-blue-200',
      'in-progress': 'bg-blue-100 text-blue-800 border border-blue-200',
      resolved: 'bg-green-100 text-green-800 border border-green-200',
      completed: 'bg-green-100 text-green-800 border border-green-200'
    };

    const statusKey = status?.toLowerCase() || 'pending';

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusMap[statusKey] || 'bg-gray-100 text-gray-800'}`}>
        {status?.toUpperCase()?.replace('-', ' ') || 'PENDING'}
      </span>
    );
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

  const getCategories = () => {
    const categories = new Set();
    pendingIssues.forEach(issue => {
      if (issue.category) categories.add(issue.category);
    });
    inProgressIssues.forEach(issue => {
      if (issue.category) categories.add(issue.category);
    });
    return ['all', ...Array.from(categories)];
  };

  const getPriorities = () => {
    const priorities = new Set();
    pendingIssues.forEach(issue => {
      if (issue.priority) priorities.add(issue.priority);
    });
    return ['all', ...Array.from(priorities)];
  };

  const getAvailabilityStatus = (staff) => {
    if (staff.currentTasks >= staff.maxTasks) {
      return { text: 'Fully Booked', color: 'text-red-600', bg: 'bg-red-100' };
    } else if (staff.currentTasks >= staff.maxTasks * 0.7) {
      return { text: 'Busy', color: 'text-orange-600', bg: 'bg-orange-100' };
    } else {
      return { text: 'Available', color: 'text-green-600', bg: 'bg-green-100' };
    }
  };

  if (loading.issues && loading.staff) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading assignment dashboard...</p>
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
                <FaUserPlus className="text-blue-600" />
                Assign Staff to Issues
              </h1>
              <p className="text-gray-600 mt-2">
                Manage and assign pending infrastructure issues to available staff members
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  fetchIssues();
                  fetchStaffMembers();
                  fetchIssueStats();
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
              >
                <FaSyncAlt className="w-4 h-4" />
                Refresh All
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Issues</p>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <FaListAlt className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border border-yellow-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Issues</p>
                <p className="text-2xl font-bold text-yellow-600">{filteredPendingIssues.length}</p>
              </div>
              <FaRegClock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">In Progress</p>
                <p className="text-2xl font-bold text-purple-600">{stats.inProgress}</p>
              </div>
              <FaTachometerAlt className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Resolved</p>
                <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <FaRegCheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Staff Summary */}
        <div className="mb-6 bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaUsers className="text-purple-600" />
            Staff Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {staffMembers.filter(s => s.currentTasks < s.maxTasks).length}
              </p>
              <p className="text-sm text-gray-600">Available Staff</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {staffMembers.reduce((sum, staff) => sum + staff.currentTasks, 0)}
              </p>
              <p className="text-sm text-gray-600">Total Assigned Tasks</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">
                {staffMembers.filter(s => s.currentTasks >= s.maxTasks).length}
              </p>
              <p className="text-sm text-gray-600">Fully Booked Staff</p>
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
                placeholder="Search issues by title, description, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {getCategories().map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {getPriorities().map(priority => (
                  <option key={priority} value={priority}>
                    {priority === 'all' ? 'All Priorities' : priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setPriorityFilter('all');
                }}
                className="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Pending Issues */}
          <div>
            <div className="bg-white rounded-xl shadow overflow-hidden mb-6">
              <div className="bg-yellow-50 border-b border-yellow-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FaExclamationTriangle className="text-yellow-600" />
                  Pending Issues ({filteredPendingIssues.length})
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Issues waiting for staff assignment
                </p>
              </div>

              <div className="max-h-[600px] overflow-y-auto">
                {filteredPendingIssues.length > 0 ? (
                  filteredPendingIssues.map((issue) => (
                    <div key={issue._id} className="p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getPriorityBadge(issue.priority)}
                            {getStatusBadge(issue.status)}
                          </div>
                          <h3 className="font-bold text-gray-900 text-lg mb-2">{issue.title}</h3>
                          <p className="text-gray-600 mb-3">{issue.description}</p>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-500">
                              <FaMapMarkerAlt className="w-4 h-4" />
                              <span>{issue.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500">
                              <FaTools className="w-4 h-4" />
                              <span>{issue.category || 'Uncategorized'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500">
                              <FaUser className="w-4 h-4" />
                              <span>Reported by: {issue.reportedBy}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500">
                              <FaCalendarAlt className="w-4 h-4" />
                              <span>{formatDate(issue.reportedAt)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="ml-4">
                          <button
                            onClick={() => {
                              setSelectedIssue(issue);
                              setShowAssignModal(true);
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                          >
                            <FaUserPlus className="w-4 h-4" />
                            Assign Staff
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <div className="text-gray-400 mb-4">
                      <FaCheckCircle className="w-12 h-12 mx-auto" />
                    </div>
                    <p className="text-gray-500 text-lg">No pending issues found</p>
                    <p className="text-gray-400 text-sm mt-2">
                      {searchTerm || categoryFilter !== 'all' || priorityFilter !== 'all'
                        ? 'Try changing your search or filter criteria'
                        : 'All issues have been assigned'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - In Progress Issues & Staff */}
          <div className="space-y-8">
            {/* In Progress Issues - View Only */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="bg-blue-50 border-b border-blue-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FaTachometerAlt className="text-blue-600" />
                  Issues In Progress ({inProgressIssues.length})
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Issues currently being worked on by staff
                </p>
              </div>

              <div className="max-h-[300px] overflow-y-auto">
                {inProgressIssues.length > 0 ? (
                  inProgressIssues.map((issue) => (
                    <div key={issue._id} className="p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors">
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-gray-900">{issue.title}</h3>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(issue.status)}
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-500 mb-1">
                            <span>Progress</span>
                            <span>{issue.progress || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${issue.progress || 0}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-500">
                            <FaUser className="w-4 h-4" />
                            <span>Assigned to: {getStaffName(issue.assignedTo)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-500">
                            <FaCalendarAlt className="w-4 h-4" />
                            <span>Since: {formatDate(issue.assignedDate)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center">
                    <div className="text-gray-400 mb-4">
                      <FaTachometerAlt className="w-12 h-12 mx-auto" />
                    </div>
                    <p className="text-gray-500">No issues in progress</p>
                    <p className="text-gray-400 text-sm mt-2">
                      Assign staff to pending issues to see them here
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Staff Members */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="bg-purple-50 border-b border-purple-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FaUsers className="text-purple-600" />
                  Staff Members ({staffMembers.length})
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Users with "staff" role from MongoDB
                </p>
              </div>

              <div className="max-h-[300px] overflow-y-auto">
                {staffMembers.length > 0 ? (
                  staffMembers.map((staff) => {
                    const availability = getAvailabilityStatus(staff);
                    return (
                      <div key={staff._id} className="p-6 border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${availability.bg}`}>
                              <FaUser className={`w-5 h-5 ${availability.color}`} />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900">{staff.name}</h3>
                              <p className="text-xs text-gray-400">
                                {staff.email}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {staff.currentTasks}/{staff.maxTasks} tasks
                            </div>
                            <div className={`text-xs font-medium ${availability.color}`}>
                              {availability.text}
                            </div>
                            {staff.isPremium && (
                              <div className="text-xs text-yellow-600 mt-1">Premium</div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center">
                    <div className="text-gray-400 mb-4">
                      <FaUsers className="w-12 h-12 mx-auto" />
                    </div>
                    <p className="text-gray-500">No staff members found</p>
                    <p className="text-gray-400 text-sm mt-2">
                      Add users with "staff" role to your MongoDB users collection
                    </p>
                    <div className="mt-4 text-xs text-gray-500">
                      <p>Tip: Use the admin panel to update user roles to "staff"</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assign Staff Modal */}
      {showAssignModal && selectedIssue && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowAssignModal(false)}
          />

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <div className="sticky top-0 bg-white z-10 p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-900">Assign Staff to Issue</h3>
                  <button
                    onClick={() => setShowAssignModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <FaTimesCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3">Issue Details</h4>
                  <div className="space-y-2">
                    <p><span className="text-gray-600">Title:</span> {selectedIssue.title}</p>
                    <p><span className="text-gray-600">Description:</span> {selectedIssue.description}</p>
                    <p><span className="text-gray-600">Category:</span> {selectedIssue.category}</p>
                    <p><span className="text-gray-600">Location:</span> {selectedIssue.location}</p>
                    <p><span className="text-gray-600">Priority:</span> {getPriorityBadge(selectedIssue.priority)}</p>
                    <p><span className="text-gray-600">Reported by:</span> {selectedIssue.reportedBy}</p>
                    <p><span className="text-gray-600">Reported on:</span> {formatDate(selectedIssue.reportedAt)}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Select Staff Member</h4>

                  {staffMembers.length === 0 ? (
                    <div className="text-center p-8 border border-gray-200 rounded-lg">
                      <FaExclamationTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                      <p className="text-gray-500">No staff members available</p>
                      <p className="text-gray-400 text-sm mt-2">
                        Please add users with "staff" role to your database
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {staffMembers
                          .filter(staff => staff.currentTasks < staff.maxTasks)
                          .map((staff) => {
                            const availability = getAvailabilityStatus(staff);
                            return (
                              <button
                                key={staff._id}
                                onClick={() => setSelectedStaff(staff)}
                                className={`p-4 border rounded-lg text-left transition-all ${selectedStaff?._id === staff._id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                  }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${availability.bg}`}>
                                      <FaUser className={`w-5 h-5 ${availability.color}`} />
                                    </div>
                                    <div>
                                      <h5 className="font-bold text-gray-900">{staff.name}</h5>
                                      <p className="text-xs text-gray-400">{staff.email}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm text-gray-600">
                                      {staff.currentTasks}/{staff.maxTasks} tasks
                                    </div>
                                    <div className={`text-xs font-medium ${availability.color}`}>
                                      {availability.text}
                                    </div>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                      </div>

                      {staffMembers.filter(staff => staff.currentTasks >= staff.maxTasks).length > 0 && (
                        <div className="mt-4">
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Fully Booked Staff</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {staffMembers
                              .filter(staff => staff.currentTasks >= staff.maxTasks)
                              .map((staff) => (
                                <div
                                  key={staff._id}
                                  className="p-3 border border-gray-200 rounded-lg bg-gray-50 opacity-75"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                                        <FaUser className="w-4 h-4 text-red-600" />
                                      </div>
                                      <div>
                                        <h5 className="text-sm font-medium text-gray-900">{staff.name}</h5>
                                        <p className="text-xs text-gray-400">{staff.email}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-xs text-red-600 font-medium">Fully Booked</div>
                                      <div className="text-xs text-gray-500">{staff.currentTasks} tasks</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {selectedStaff && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">Selected Staff</h4>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-blue-900">{selectedStaff.name}</p>
                        <p className="text-xs text-blue-600">{selectedStaff.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-blue-600">Current tasks: {selectedStaff.currentTasks}</p>
                        <p className="text-sm font-medium text-blue-900">Will be assigned to:</p>
                        <p className="text-sm text-blue-700">{selectedIssue.title}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="sticky bottom-0 bg-white pt-4 pb-2">
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setShowAssignModal(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAssignStaff}
                      disabled={!selectedStaff}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      <FaUserPlus className="w-4 h-4" />
                      Assign Staff
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

export default AssignStaff;