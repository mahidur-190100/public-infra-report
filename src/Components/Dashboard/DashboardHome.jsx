// DashboardHome.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaPlus, FaEdit, FaStar, FaCrown, FaHistory, FaHome,
  FaClipboardList, FaUserShield, FaUserTimes, FaUsers, 
  FaUserCheck, FaMoneyBill, FaChartBar, FaExclamationTriangle,
  FaCheckCircle, FaClock, FaUser, FaSearch, FaFilter, FaTimes, FaSave
} from 'react-icons/fa';

const DashboardHome = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalIssues: 0,
    pendingIssues: 0,
    resolvedIssues: 0
  });
  const [loading, setLoading] = useState(true);
  
  // User management states
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Create a memoized version of fetchDashboardData
  const fetchDashboardData = useCallback(async (adminStatus) => {
    console.log("📊 fetchDashboardData called with adminStatus:", adminStatus);
    
    if (!adminStatus) {
      console.log("📊 Not admin, skipping data fetch");
      setLoading(false);
      return;
    }

    try {
      console.log("📊 Fetching admin stats...");
      
      // Fetch users data
      let users = [];
      try {
        const usersRes = await axios.get('http://localhost:3000/users');
        console.log("📊 Users response:", usersRes.data);
        
        // Handle different response formats
        if (Array.isArray(usersRes.data)) {
          users = usersRes.data;
        } else if (usersRes.data && Array.isArray(usersRes.data.users)) {
          users = usersRes.data.users;
        } else if (usersRes.data && typeof usersRes.data === 'object') {
          // If it's an object with user data
          users = Object.values(usersRes.data);
        }
        console.log("📊 Processed users:", users);
      } catch (usersError) {
        console.error("❌ Error fetching users:", usersError);
      }

      // Fetch issues data
      let issues = [];
      try {
        const issuesRes = await axios.get('http://localhost:3000/issues');
        console.log("📊 Issues response:", issuesRes.data);
        
        // Handle different response formats
        if (Array.isArray(issuesRes.data)) {
          issues = issuesRes.data;
        } else if (issuesRes.data && Array.isArray(issuesRes.data.issues)) {
          issues = issuesRes.data.issues;
        } else if (issuesRes.data && typeof issuesRes.data === 'object') {
          // If it's an object with issue data
          issues = Object.values(issuesRes.data);
        }
        console.log("📊 Processed issues:", issues);
      } catch (issuesError) {
        console.error("❌ Error fetching issues:", issuesError);
      }

      // Calculate stats
      const calculatedStats = {
        totalUsers: users.length,
        totalIssues: issues.length,
        pendingIssues: issues.filter(issue => 
          issue.status && issue.status.toLowerCase() === 'pending'
        ).length,
        resolvedIssues: issues.filter(issue => 
          issue.status && issue.status.toLowerCase() === 'resolved'
        ).length
      };

      console.log("📊 Calculated stats:", calculatedStats);
      setStats(calculatedStats);
      
    } catch (error) {
      console.error('❌ Error in fetchDashboardData:', error);
      
      // Try alternative endpoints or fallback data
      try {
        // Direct fetch as fallback
        const [usersResponse, issuesResponse] = await Promise.allSettled([
          fetch('http://localhost:3000/users').then(res => res.json()),
          fetch('http://localhost:3000/issues').then(res => res.json())
        ]);
        
        let users = [];
        let issues = [];
        
        if (usersResponse.status === 'fulfilled') {
          users = Array.isArray(usersResponse.value) ? usersResponse.value : [];
        }
        
        if (issuesResponse.status === 'fulfilled') {
          issues = Array.isArray(issuesResponse.value) ? issuesResponse.value : [];
        }
        
        setStats({
          totalUsers: users.length,
          totalIssues: issues.length,
          pendingIssues: issues.filter(issue => 
            issue.status && issue.status.toLowerCase() === 'pending'
          ).length,
          resolvedIssues: issues.filter(issue => 
            issue.status && issue.status.toLowerCase() === 'resolved'
          ).length
        });
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all users
  const fetchAllUsers = async () => {
    try {
      console.log('🔍 Fetching all users...');
      const response = await axios.get('http://localhost:3000/users');
      console.log('👥 Users API Response:', response.data);
      
      if (response.data.success && Array.isArray(response.data.users)) {
        const usersData = response.data.users;
        console.log('✅ Got users from response.data.users:', usersData.length);
        
        setUsers(usersData);
        setFilteredUsers(usersData);
        
        // Update stats with user counts
        const adminUsers = usersData.filter(user => user.role === 'admin').length;
        const regularUsers = usersData.filter(user => user.role === 'user' || !user.role).length;
        
        setStats(prev => ({
          ...prev,
          totalUsers: usersData.length,
          adminUsers: adminUsers,
          regularUsers: regularUsers
        }));
        
        console.log('✅ Users loaded successfully:', usersData.length, 'users');
      } else {
        console.log('❌ Unexpected response format:', response.data);
        setUsers([]);
        setFilteredUsers([]);
      }
      
    } catch (error) {
      console.error('❌ Error fetching users:', error);
    }
  };

  // Update user role
  const updateUserRole = async (userEmail) => {
    if (!newRole || !selectedUser) return;
    
    setUpdating(true);
    try {
      console.log(`🔄 Updating user ${userEmail} role to ${newRole}`);
      
      const response = await axios.post('http://localhost:3000/update-role', {
        email: userEmail,
        role: newRole
      });
      
      if (response.data.success) {
        // Update local state
        const updatedUsers = users.map(user => 
          user.email === userEmail ? { ...user, role: newRole } : user
        );
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
        
        // Also update stats if role changed to/from admin
        if (newRole === 'admin' || selectedUser.role === 'admin') {
          fetchDashboardData(isAdmin); // Refresh stats
        }
        
        alert('User role updated successfully!');
        setShowRoleModal(false);
        setSelectedUser(null);
        setNewRole('');
      }
    } catch (error) {
      console.error('❌ Error updating user role:', error);
      alert('Failed to update user role: ' + (error.response?.data?.message || error.message));
    } finally {
      setUpdating(false);
    }
  };

  // Filter users based on search and role
  useEffect(() => {
    let result = users;
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.email.toLowerCase().includes(term) ||
        (user.displayName && user.displayName.toLowerCase().includes(term))
      );
    }
    
    // Apply role filter
    if (roleFilter !== 'all') {
      result = result.filter(user => user.role === roleFilter);
    }
    
    setFilteredUsers(result);
  }, [searchTerm, roleFilter, users]);

  useEffect(() => {
    console.log("=== DASHBOARD HOME DEBUG START ===");
    
    // Get data directly from localStorage
    const admin = localStorage.getItem('admin');
    const user = localStorage.getItem('user');
    
    console.log("📱 DashboardHome - localStorage admin:", admin);
    console.log("📱 DashboardHome - localStorage user:", user);
    
    let currentIsAdmin = false;
    let currentUserData = null;
    
    if (admin) {
      try {
        const adminData = JSON.parse(admin);
        currentUserData = adminData;
        currentIsAdmin = adminData.role === 'admin' && adminData.isAdmin === true;
        console.log("📱 Admin check - role:", adminData.role, "isAdmin:", adminData.isAdmin);
      } catch (error) {
        console.error('Error parsing admin:', error);
      }
    } else if (user) {
      try {
        const userData = JSON.parse(user);
        currentUserData = userData;
        currentIsAdmin = false;
      } catch (error) {
        console.error('Error parsing user:', error);
      }
    }
    
    console.log("📱 Direct check - isAdmin:", currentIsAdmin);
    console.log("📱 Direct check - userData:", currentUserData);
    
    // Set state
    setUserData(currentUserData);
    setIsAdmin(currentIsAdmin);
    
    console.log("📱 State set - isAdmin:", currentIsAdmin);
    
    // Fetch dashboard data with the current admin status
    fetchDashboardData(currentIsAdmin);
    
    // If admin, fetch users
    if (currentIsAdmin) {
      fetchAllUsers();
    }
    
    console.log("=== DASHBOARD HOME DEBUG END ===");
  }, [navigate, fetchDashboardData]);

  // Refresh stats function
  const refreshStats = () => {
    setLoading(true);
    fetchDashboardData(isAdmin);
    if (isAdmin) {
      fetchAllUsers();
    }
  };

  // Role Update Modal Component
  const RoleUpdateModal = () => {
    if (!showRoleModal || !selectedUser) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Update User Role</h3>
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                  setNewRole('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">User Details:</p>
              <p className="font-medium">{selectedUser.displayName || selectedUser.email}</p>
              <p className="text-sm text-gray-500">{selectedUser.email}</p>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Role: <span className="font-bold capitalize">{selectedUser.role || 'user'}</span>
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select new role</option>
                <option value="user">User</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
              <p className="text-xs text-gray-500 mt-2">
                <strong>User:</strong> Can report issues and use basic features<br />
                <strong>Staff:</strong> Can be assigned issues and update progress<br />
                <strong>Admin:</strong> Full system access including user management
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                  setNewRole('');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={updating}
              >
                Cancel
              </button>
              <button
                onClick={() => updateUserRole(selectedUser.email)}
                disabled={!newRole || newRole === (selectedUser.role || 'user') || updating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {updating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <FaSave className="w-4 h-4" />
                    Update Role
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-32 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  console.log("🎯 DashboardHome - Rendering with isAdmin:", isAdmin);
  console.log("📊 Current stats:", stats);

  // Regular User Dashboard
  if (!isAdmin) {
    console.log("👤 Rendering USER dashboard");
    return (
      <div className="p-3 sm:p-4 md:p-6">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8 md:mb-10 text-center lg:text-left">
          <div className="flex flex-col sm:flex-row items-center sm:items-start lg:items-center justify-center lg:justify-start gap-3 sm:gap-4 mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl flex items-center justify-center flex-shrink-0">
              <FaHome className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">User Dashboard</h1>
              <p className="text-gray-600 text-sm sm:text-base mt-1">
                Welcome back, {userData?.displayName || userData?.email?.split('@')[0]}
              </p>
            </div>
          </div>
        </div>

        {/* Options Grid */}
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            
            {/* Submit New Issue Card */}
            <div onClick={() => navigate('/dashboard/submit-issue')} className="group block cursor-pointer">
              <div className="bg-white rounded-lg sm:rounded-xl shadow hover:shadow-lg sm:shadow-md sm:hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-300 overflow-hidden h-full">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-1 sm:h-2"></div>
                <div className="p-3 sm:p-4 md:p-6">
                  <div className="flex items-start gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
                    <div className="bg-green-100 text-green-600 p-2 sm:p-3 rounded-lg flex-shrink-0">
                      <FaPlus className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      Submit New Issue
                    </h3>
                  </div>
                  <p className="text-gray-600 text-xs sm:text-sm md:text-base mb-4 sm:mb-6">
                    Report new infrastructure problems in your area
                  </p>
                  <div className="flex items-center text-blue-600 font-medium text-xs sm:text-sm">
                    <span>Access Now</span>
                    <svg 
                      className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2 transform group-hover:translate-x-1 transition-transform" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* My Issues Card */}
            <div onClick={() => navigate('/dashboard/my-issues')} className="group block cursor-pointer">
              <div className="bg-white rounded-lg sm:rounded-xl shadow hover:shadow-lg sm:shadow-md sm:hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-300 overflow-hidden h-full">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-1 sm:h-2"></div>
                <div className="p-3 sm:p-4 md:p-6">
                  <div className="flex items-start gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
                    <div className="bg-blue-100 text-blue-600 p-2 sm:p-3 rounded-lg flex-shrink-0">
                      <FaEdit className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      My Issues
                    </h3>
                  </div>
                  <p className="text-gray-600 text-xs sm:text-sm md:text-base mb-4 sm:mb-6">
                    Manage your reported issues (only if pending)
                  </p>
                  <div className="flex items-center text-blue-600 font-medium text-xs sm:text-sm">
                    <span>Access Now</span>
                    <svg 
                      className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2 transform group-hover:translate-x-1 transition-transform" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Boost Priority Card */}
            <div onClick={() => navigate('/dashboard/boost-priority')} className="group block cursor-pointer">
              <div className="bg-white rounded-lg sm:rounded-xl shadow hover:shadow-lg sm:shadow-md sm:hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-300 overflow-hidden h-full">
                <div className="bg-gradient-to-r from-yellow-500 to-amber-600 h-1 sm:h-2"></div>
                <div className="p-3 sm:p-4 md:p-6">
                  <div className="flex items-start gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
                    <div className="bg-yellow-100 text-yellow-600 p-2 sm:p-3 rounded-lg flex-shrink-0">
                      <FaStar className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      Boost Priority
                    </h3>
                  </div>
                  <p className="text-gray-600 text-xs sm:text-sm md:text-base mb-4 sm:mb-6">
                    Increase priority level of your important issues
                  </p>
                  <div className="flex items-center text-blue-600 font-medium text-xs sm:text-sm">
                    <span>Access Now</span>
                    <svg 
                      className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2 transform group-hover:translate-x-1 transition-transform" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Subscription Card */}
            <div onClick={() => navigate('/dashboard/premium')} className="group block cursor-pointer">
              <div className="bg-white rounded-lg sm:rounded-xl shadow hover:shadow-lg sm:shadow-md sm:hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-300 overflow-hidden h-full">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-1 sm:h-2"></div>
                <div className="p-3 sm:p-4 md:p-6">
                  <div className="flex items-start gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
                    <div className="bg-purple-100 text-purple-600 p-2 sm:p-3 rounded-lg flex-shrink-0">
                      <FaCrown className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      Premium Subscription
                    </h3>
                  </div>
                  <p className="text-gray-600 text-xs sm:text-sm md:text-base mb-4 sm:mb-6">
                    Access premium features and priority support
                  </p>
                  <div className="flex items-center text-blue-600 font-medium text-xs sm:text-sm">
                    <span>Access Now</span>
                    <svg 
                      className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2 transform group-hover:translate-x-1 transition-transform" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Track Activities Card */}
            <div onClick={() => navigate('/dashboard/activities')} className="group block cursor-pointer">
              <div className="bg-white rounded-lg sm:rounded-xl shadow hover:shadow-lg sm:shadow-md sm:hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-300 overflow-hidden h-full">
                <div className="bg-gradient-to-r from-gray-500 to-gray-600 h-1 sm:h-2"></div>
                <div className="p-3 sm:p-4 md:p-6">
                  <div className="flex items-start gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
                    <div className="bg-gray-100 text-gray-600 p-2 sm:p-3 rounded-lg flex-shrink-0">
                      <FaHistory className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
                    </div>
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      Track Activities
                    </h3>
                  </div>
                  <p className="text-gray-600 text-xs sm:text-sm md:text-base mb-4 sm:mb-6">
                    View your issue history and activity log
                  </p>
                  <div className="flex items-center text-blue-600 font-medium text-xs sm:text-sm">
                    <span>Access Now</span>
                    <svg 
                      className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2 transform group-hover:translate-x-1 transition-transform" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  console.log("👑 Rendering ADMIN dashboard");
  return (
    <div className="p-3 sm:p-4 md:p-6">
      {/* Admin Welcome Section */}
      <div className="mb-6 sm:mb-8 md:mb-10">
        <div className="flex flex-col sm:flex-row items-center sm:items-start lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-r from-red-600 to-red-800 rounded-xl flex items-center justify-center flex-shrink-0">
              <FaChartBar className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 text-sm sm:text-base mt-1">
                System Administrator • {userData?.displayName || userData?.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={refreshStats}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <FaChartBar className="w-4 h-4" />
              Refresh Stats
            </button>
            <div className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
              Admin Mode
            </div>
          </div>
        </div>
      </div>

      {/* Admin Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Users</h3>
              <p className="text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
            </div>
            <FaUsers className="w-8 h-8 text-blue-500 opacity-80" />
          </div>
        </div>
        
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Issues</h3>
              <p className="text-2xl font-bold text-green-600">{stats.totalIssues}</p>
            </div>
            <FaClipboardList className="w-8 h-8 text-green-500 opacity-80" />
          </div>
        </div>
        
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow border border-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Pending Issues</h3>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingIssues}</p>
            </div>
            <FaClock className="w-8 h-8 text-yellow-500 opacity-80" />
          </div>
          {stats.totalIssues > 0 && (
            <div className="mt-2">
              <div className="text-xs text-gray-500 mb-1">
                {Math.round((stats.pendingIssues / stats.totalIssues) * 100)}% of total
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${(stats.pendingIssues / stats.totalIssues) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Resolved Issues</h3>
              <p className="text-2xl font-bold text-purple-600">{stats.resolvedIssues}</p>
            </div>
            <FaCheckCircle className="w-8 h-8 text-purple-500 opacity-80" />
          </div>
          {stats.totalIssues > 0 && (
            <div className="mt-2">
              <div className="text-xs text-gray-500 mb-1">
                {Math.round((stats.resolvedIssues / stats.totalIssues) * 100)}% of total
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full" 
                  style={{ width: `${(stats.resolvedIssues / stats.totalIssues) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Admin Actions Grid */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          
          {/* View All Issues Card */}
          <div onClick={() => navigate('/issues')} className="group block cursor-pointer">
            <div className="bg-white rounded-lg sm:rounded-xl shadow hover:shadow-lg sm:shadow-md sm:hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-300 overflow-hidden h-full">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-1 sm:h-2"></div>
              <div className="p-3 sm:p-4 md:p-6">
                <div className="flex items-start gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
                  <div className="bg-blue-100 text-blue-600 p-2 sm:p-3 rounded-lg flex-shrink-0">
                    <FaClipboardList className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    View All Issues
                  </h3>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm md:text-base mb-4 sm:mb-6">
                  View and manage all reported infrastructure issues
                </p>
                <div className="flex items-center text-blue-600 font-medium text-xs sm:text-sm">
                  <span>Access Now</span>
                  <svg 
                    className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2 transform group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Assign Staff Card */}
          <div onClick={() => navigate('/dashboard/admin/assign-staff')} className="group block cursor-pointer">
            <div className="bg-white rounded-lg sm:rounded-xl shadow hover:shadow-lg sm:shadow-md sm:hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-green-300 overflow-hidden h-full">
              <div className="bg-gradient-to-r from-green-500 to-green-600 h-1 sm:h-2"></div>
              <div className="p-3 sm:p-4 md:p-6">
                <div className="flex items-start gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
                  <div className="bg-green-100 text-green-600 p-2 sm:p-3 rounded-lg flex-shrink-0">
                    <FaUserShield className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                    Assign Staff
                  </h3>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm md:text-base mb-4 sm:mb-6">
                  Assign staff members to handle specific issues
                </p>
                <div className="flex items-center text-green-600 font-medium text-xs sm:text-sm">
                  <span>Access Now</span>
                  <svg 
                    className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2 transform group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Reject Issues Card */}
          <div onClick={() => navigate('/dashboard/admin/reject-issues')} className="group block cursor-pointer">
            <div className="bg-white rounded-lg sm:rounded-xl shadow hover:shadow-lg sm:shadow-md sm:hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-red-300 overflow-hidden h-full">
              <div className="bg-gradient-to-r from-red-500 to-red-600 h-1 sm:h-2"></div>
              <div className="p-3 sm:p-4 md:p-6">
                <div className="flex items-start gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
                  <div className="bg-red-100 text-red-600 p-2 sm:p-3 rounded-lg flex-shrink-0">
                    <FaUserTimes className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                    Reject Issues
                  </h3>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm md:text-base mb-4 sm:mb-6">
                  Review and reject invalid or duplicate issues
                </p>
                <div className="flex items-center text-red-600 font-medium text-xs sm:text-sm">
                  <span>Access Now</span>
                  <svg 
                    className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2 transform group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Manage Staff Card */}
          <div onClick={() => navigate('/dashboard/admin/manage-staff')} className="group block cursor-pointer">
            <div className="bg-white rounded-lg sm:rounded-xl shadow hover:shadow-lg sm:shadow-md sm:hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-purple-300 overflow-hidden h-full">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-1 sm:h-2"></div>
              <div className="p-3 sm:p-4 md:p-6">
                <div className="flex items-start gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
                  <div className="bg-purple-100 text-purple-600 p-2 sm:p-3 rounded-lg flex-shrink-0">
                    <FaUsers className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                    Manage Staff
                  </h3>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm md:text-base mb-4 sm:mb-6">
                  Add, remove, or update staff member accounts
                </p>
                <div className="flex items-center text-purple-600 font-medium text-xs sm:text-sm">
                  <span>Access Now</span>
                  <svg 
                    className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2 transform group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Manage Citizens Card */}
          <div onClick={() => navigate('/dashboard/admin/manage-citizens')} className="group block cursor-pointer">
            <div className="bg-white rounded-lg sm:rounded-xl shadow hover:shadow-lg sm:shadow-md sm:hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-teal-300 overflow-hidden h-full">
              <div className="bg-gradient-to-r from-teal-500 to-teal-600 h-1 sm:h-2"></div>
              <div className="p-3 sm:p-4 md:p-6">
                <div className="flex items-start gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
                  <div className="bg-teal-100 text-teal-600 p-2 sm:p-3 rounded-lg flex-shrink-0">
                    <FaUserCheck className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors">
                    Manage Citizens
                  </h3>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm md:text-base mb-4 sm:mb-6">
                  Manage citizen accounts and permissions
                </p>
                <div className="flex items-center text-teal-600 font-medium text-xs sm:text-sm">
                  <span>Access Now</span>
                  <svg 
                    className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2 transform group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* View Payments Card */}
          <div onClick={() => navigate('/dashboard/admin/payments')} className="group block cursor-pointer">
            <div className="bg-white rounded-lg sm:rounded-xl shadow hover:shadow-lg sm:shadow-md sm:hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-amber-300 overflow-hidden h-full">
              <div className="bg-gradient-to-r from-amber-500 to-amber-600 h-1 sm:h-2"></div>
              <div className="p-3 sm:p-4 md:p-6">
                <div className="flex items-start gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
                  <div className="bg-amber-100 text-amber-600 p-2 sm:p-3 rounded-lg flex-shrink-0">
                    <FaMoneyBill className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                    View Payments
                  </h3>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm md:text-base mb-4 sm:mb-6">
                  View payment history and manage subscriptions
                </p>
                <div className="flex items-center text-amber-600 font-medium text-xs sm:text-sm">
                  <span>Access Now</span>
                  <svg 
                    className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2 transform group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* User Management Section */}
      <div className="mt-8 bg-white rounded-xl shadow border">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FaUsers className="text-blue-600" /> User Management
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Manage all registered users and their roles
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          </div>
          
          {/* Search and Filter Bar */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search users by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex gap-4">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-1"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="user">User</option>
              </select>
              <button
                onClick={fetchAllUsers}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <FaSearch className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id || user.email} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {user.photoURL ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={user.photoURL}
                              alt={user.displayName || user.email}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=random`;
                              }}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-sm">
                                {(user.displayName || user.email).charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.displayName || 'No name'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.provider ? `Via ${user.provider}` : 'Direct signup'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      {user.uid && (
                        <div className="text-xs text-gray-500">
                          UID: {user.uid.substring(0, 8)}...
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin' 
                          ? 'bg-red-100 text-red-800' 
                          : user.role === 'staff'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role ? user.role.toUpperCase() : 'USER'}
                      </span>
                      {user.email === userData?.email && (
                        <span className="ml-2 text-xs text-blue-600 font-medium">(You)</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.createdAt 
                        ? new Date(user.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setNewRole(user.role || 'user');
                          setShowRoleModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-4 flex items-center gap-1"
                        disabled={user.email === userData?.email}
                      >
                        <FaEdit className="w-4 h-4" />
                        Change Role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <FaUsers className="w-12 h-12 mx-auto" />
                </div>
                <p className="text-gray-500 text-lg">No users found</p>
                <p className="text-gray-400 text-sm mt-2">
                  {searchTerm || roleFilter !== 'all' 
                    ? 'Try changing your search or filter criteria'
                    : 'Users will appear here once they register'}
                </p>
              </div>
            )}
          </div>
          
          {/* Summary */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="text-sm text-gray-500">
                Showing {filteredUsers.length} of {users.length} users • 
                <span className="ml-2">
                  <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1"></span>
                  {users.filter(u => u.role === 'admin').length} Admin
                </span>
                <span className="ml-4">
                  <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>
                  {users.filter(u => u.role === 'user' || !u.role).length} User
                </span>
              </div>
              <div className="text-sm">
                <span className="text-gray-600">Last updated: </span>
                <span className="font-medium">{new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Notice */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <FaExclamationTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-800">Admin Notice</p>
            <p className="text-sm text-blue-700">
              As an administrator, you have full access to system management tools. Regular user features like "Submit Issue" and "My Issues" are hidden in admin mode.
            </p>
          </div>
        </div>
      </div>
      
      {/* Role Update Modal */}
      {showRoleModal && <RoleUpdateModal />}
    </div>
  );
};

export default DashboardHome;