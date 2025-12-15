// DashboardHome.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaPlus, FaEdit, FaStar, FaCrown, FaHistory, FaHome,
  FaClipboardList, FaUserShield, FaUserTimes, FaUsers, 
  FaUserCheck, FaMoneyBill, FaChartBar, FaExclamationTriangle,
  FaCheckCircle, FaClock, FaUserTie
} from 'react-icons/fa';

const DashboardHome = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [userRole, setUserRole] = useState('user'); // 'user', 'staff', or 'admin'
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalIssues: 0,
    pendingIssues: 0,
    resolvedIssues: 0
  });
  const [loading, setLoading] = useState(true);

  // Create a memoized version of fetchDashboardData
  const fetchDashboardData = useCallback(async (role) => {
    console.log("📊 fetchDashboardData called with role:", role);
    
    // Only fetch admin stats if user is admin
    if (role !== 'admin') {
      console.log("📊 Not admin, skipping admin data fetch");
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

  useEffect(() => {
    console.log("=== DASHBOARD HOME DEBUG START ===");
    
    // Get data directly from localStorage
    const admin = localStorage.getItem('admin');
    const user = localStorage.getItem('user');
    
    console.log("📱 DashboardHome - localStorage admin:", admin);
    console.log("📱 DashboardHome - localStorage user:", user);
    
    let currentUserData = null;
    let currentUserRole = 'user';
    
    if (admin) {
      try {
        const adminData = JSON.parse(admin);
        currentUserData = adminData;
        currentUserRole = 'admin';
        console.log("📱 Admin check - role: admin");
      } catch (error) {
        console.error('Error parsing admin:', error);
      }
    } else if (user) {
      try {
        const userData = JSON.parse(user);
        currentUserData = userData;
        // Check if user has a role property in localStorage
        currentUserRole = userData.role || 'user';
        console.log("📱 User check - role:", currentUserRole);
      } catch (error) {
        console.error('Error parsing user:', error);
      }
    }
    
    console.log("📱 Direct check - userRole:", currentUserRole);
    console.log("📱 Direct check - userData:", currentUserData);
    
    // Set state
    setUserData(currentUserData);
    setUserRole(currentUserRole);
    
    console.log("📱 State set - userRole:", currentUserRole);
    
    // Fetch dashboard data with the current user role
    fetchDashboardData(currentUserRole);
    
    console.log("=== DASHBOARD HOME DEBUG END ===");
  }, [navigate, fetchDashboardData]);

  // Refresh stats function (for admin only)
  const refreshStats = () => {
    setLoading(true);
    fetchDashboardData(userRole);
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

  console.log("🎯 DashboardHome - Rendering with userRole:", userRole);
  console.log("📊 Current stats:", stats);

  // ==================== STAFF DASHBOARD ====================
  if (userRole === 'staff') {
    console.log("👔 Rendering STAFF dashboard");
    
    // Check if user should be redirected to staff dashboard
    // Staff should always use the StaffDashboard component, not DashboardHome
    // This is a fallback if they somehow land here
    useEffect(() => {
      console.log("🔄 Staff user detected, redirecting to staff dashboard...");
      navigate('/dashboard/staff');
    }, [navigate]);
    
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Redirecting to Staff Dashboard...</p>
      </div>
    );
  }

  // ==================== REGULAR USER DASHBOARD ====================
  if (userRole === 'user') {
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
                <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                  Regular User
                </span>
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
            

          </div>
        </div>
      </div>
    );
  }

  // ==================== ADMIN DASHBOARD ====================
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
                <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded-full">
                  Admin
                </span>
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

          {/* Manage Staff & Users Card */}
          <div onClick={() => navigate('/dashboard/admin/manage-staff')} className="group block cursor-pointer">
            <div className="bg-white rounded-lg sm:rounded-xl shadow hover:shadow-lg sm:shadow-md sm:hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-purple-300 overflow-hidden h-full">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-1 sm:h-2"></div>
              <div className="p-3 sm:p-4 md:p-6">
                <div className="flex items-start gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
                  <div className="bg-purple-100 text-purple-600 p-2 sm:p-3 rounded-lg flex-shrink-0">
                    <FaUsers className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                    Manage Staff & Users
                  </h3>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm md:text-base mb-4 sm:mb-6">
                  Manage user roles, permissions, and access levels
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

      {/* Admin Notice */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <FaExclamationTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <p className="font-medium text-blue-800">Admin Notice</p>
            <p className="text-sm text-blue-700">
              As an administrator, you have full access to system management tools. 
              Use the "Manage Staff & Users" option to modify user roles and permissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;