import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaUsers, 
  FaClipboardList, 
  FaChartBar, 
  FaCog, 
  FaSignOutAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaUserShield,
  FaUserTimes,
  FaUserCheck,
  FaMoneyBill,
  FaRefresh,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSave,
  FaSearch,
  FaFilter
} from 'react-icons/fa';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState({
    totalIssues: 0,
    pendingIssues: 0,
    resolvedIssues: 0,
    totalUsers: 0,
    adminUsers: 0,
    regularUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Check if user is admin
  useEffect(() => {
    const adminData = localStorage.getItem('admin');
    
    if (adminData) {
      try {
        const parsedAdmin = JSON.parse(adminData);
        
        // Simple session check (24 hours)
        const lastLogin = new Date(parsedAdmin.lastLogin);
        const hoursSinceLogin = (new Date() - lastLogin) / (1000 * 60 * 60);
        
        if (hoursSinceLogin < 24 && parsedAdmin.role === 'admin') {
          setAdmin(parsedAdmin);
          fetchDashboardData();
          fetchAllUsers();
        } else {
          // Session expired or not admin
          localStorage.removeItem('admin');
          navigate('/login');
        }
      } catch (error) {
        console.error('Error parsing admin data:', error);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      
      console.log('🔍 Fetching dashboard data...');
      
      // Fetch issue statistics
      const issuesRes = await axios.get('http://localhost:3000/issues-stats');
      console.log('📊 Issues stats response:', issuesRes.data);
      
      // Fetch all issues for more detailed stats
      const allIssuesRes = await axios.get('http://localhost:3000/issues');
      console.log('📊 All issues response:', allIssuesRes.data);
      
      // Fetch user statistics
      const usersRes = await axios.get('http://localhost:3000/users');
      console.log('👥 Users response:', usersRes.data);
      
      // Process issues data
      let issuesData = [];
      if (issuesRes.data.success && issuesRes.data.stats) {
        // From issues-stats endpoint
        const statsData = issuesRes.data.stats;
        setStats(prev => ({
          ...prev,
          totalIssues: statsData.total || 0,
          pendingIssues: statsData.pending || 0,
          resolvedIssues: statsData.resolved || 0
        }));
      } else if (allIssuesRes.data.success && Array.isArray(allIssuesRes.data.issues)) {
        // From issues endpoint (structured response)
        issuesData = allIssuesRes.data.issues;
      } else if (Array.isArray(allIssuesRes.data)) {
        // From issues endpoint (raw array)
        issuesData = allIssuesRes.data;
      }
      
      // Calculate issues stats manually if needed
      if (issuesData.length > 0) {
        const totalIssues = issuesData.length;
        const pendingIssues = issuesData.filter(issue => 
          issue.status && issue.status.toLowerCase() === 'pending'
        ).length;
        const resolvedIssues = issuesData.filter(issue => 
          issue.status && issue.status.toLowerCase() === 'resolved'
        ).length;
        
        console.log(`📊 Calculated: Total=${totalIssues}, Pending=${pendingIssues}, Resolved=${resolvedIssues}`);
        
        setStats(prev => ({
          ...prev,
          totalIssues: totalIssues,
          pendingIssues: pendingIssues,
          resolvedIssues: resolvedIssues
        }));
      }
      
      // Process users data for stats
      if (usersRes.data.success && Array.isArray(usersRes.data.users)) {
        const usersData = usersRes.data.users;
        const totalUsers = usersData.length;
        const adminUsers = usersData.filter(user => user.role === 'admin').length;
        const regularUsers = usersData.filter(user => user.role === 'user' || !user.role).length;
        
        console.log(`👥 Calculated: Total=${totalUsers}, Admins=${adminUsers}, Users=${regularUsers}`);
        
        setStats(prev => ({
          ...prev,
          totalUsers: totalUsers,
          adminUsers: adminUsers,
          regularUsers: regularUsers
        }));
      }
      
      console.log('✅ Final stats:', stats);
      
    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      console.log('🔍 Fetching all users...');
      const response = await axios.get('http://localhost:3000/users');
      console.log('👥 Users API Response:', response.data);
      
      // Your API returns: { success: true, count: 6, users: [...] }
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
      console.error('❌ Error details:', error.response ? {
        status: error.response.status,
        data: error.response.data
      } : error.message);
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
        console.log('✅ Role updated successfully:', response.data);
        
        // Update local state
        const updatedUsers = users.map(user => 
          user.email === userEmail ? { ...user, role: newRole } : user
        );
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
        
        // Update stats if role changed to/from admin
        const adminUsers = updatedUsers.filter(user => user.role === 'admin').length;
        const regularUsers = updatedUsers.filter(user => user.role === 'user' || !user.role).length;
        
        setStats(prev => ({
          ...prev,
          adminUsers: adminUsers,
          regularUsers: regularUsers
        }));
        
        alert('User role updated successfully!');
        setShowRoleModal(false);
        setSelectedUser(null);
        setNewRole('');
      } else {
        alert('Failed to update user role: ' + response.data.message);
      }
    } catch (error) {
      console.error('❌ Error updating user role:', error);
      alert('Failed to update user role: ' + (error.response?.data?.message || error.message));
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin');
    navigate('/login');
  };

  const handleRefresh = () => {
    fetchDashboardData();
    fetchAllUsers();
  };

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <FaChartBar className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-gray-300">
                  {admin?.displayName || admin?.email}
                </p>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  <FaRefresh className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span className="text-sm">Refresh</span>
                </button>
                <span className="text-sm bg-gray-700 px-3 py-1 rounded-full">
                  {admin?.email}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Stats Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
          
          {/* Stats Cards - 2 rows of 3 cards each */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Total Issues Card */}
            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2"></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Total Issues</h3>
                  <FaClipboardList className="w-8 h-8 text-blue-500" />
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-blue-600 mb-2">{stats.totalIssues}</p>
                  <p className="text-sm text-gray-500">All reported issues</p>
                </div>
              </div>
            </div>
            
            {/* Pending Issues Card */}
            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-2"></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Pending Issues</h3>
                  <FaClock className="w-8 h-8 text-yellow-500" />
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-yellow-600 mb-2">{stats.pendingIssues}</p>
                  <p className="text-sm text-gray-500">Awaiting resolution</p>
                </div>
                {stats.totalIssues > 0 && (
                  <div className="mt-4">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-500"
                        style={{ width: `${(stats.pendingIssues / stats.totalIssues) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-right">
                      {Math.round((stats.pendingIssues / stats.totalIssues) * 100)}% of total
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Resolved Issues Card */}
            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-green-600 h-2"></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Resolved Issues</h3>
                  <FaCheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-green-600 mb-2">{stats.resolvedIssues}</p>
                  <p className="text-sm text-gray-500">Successfully resolved</p>
                </div>
                {stats.totalIssues > 0 && (
                  <div className="mt-4">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500"
                        style={{ width: `${(stats.resolvedIssues / stats.totalIssues) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-right">
                      {Math.round((stats.resolvedIssues / stats.totalIssues) * 100)}% of total
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Total Users Card */}
            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2"></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
                  <FaUsers className="w-8 h-8 text-purple-500" />
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-purple-600 mb-2">{stats.totalUsers}</p>
                  <p className="text-sm text-gray-500">Registered users</p>
                </div>
              </div>
            </div>
            
            {/* Admin Users Card */}
            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-red-600 h-2"></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Admin Users</h3>
                  <FaUserShield className="w-8 h-8 text-red-500" />
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-red-600 mb-2">{stats.adminUsers}</p>
                  <p className="text-sm text-gray-500">System administrators</p>
                </div>
              </div>
            </div>
            
            {/* Regular Users Card */}
            <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-teal-500 to-teal-600 h-2"></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">Regular Users</h3>
                  <FaUserCheck className="w-8 h-8 text-teal-500" />
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-teal-600 mb-2">{stats.regularUsers}</p>
                  <p className="text-sm text-gray-500">Citizen users</p>
                </div>
              </div>
            </div>
            
          </div>
        </div>

        {/* User Management Section */}
        <div className="bg-white rounded-xl shadow border mb-8">
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
                  <FaRefresh className="w-4 h-4" />
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
                        {user.email === admin?.email && (
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
                          disabled={user.email === admin?.email}
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
                  <span className="ml-4">
                    <span className="inline-block w-3 h-3 bg-purple-500 rounded-full mr-1"></span>
                    {users.filter(u => u.role === 'staff').length} Staff
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow border hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaClipboardList className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">View All Issues</h3>
                <p className="text-sm text-gray-500">Browse all reported issues</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow border hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FaUserShield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Manage Staff</h3>
                <p className="text-sm text-gray-500">Assign staff to issues</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow border hover:shadow-lg transition-shadow cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <FaUserTimes className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Reject Issues</h3>
                <p className="text-sm text-gray-500">Review and reject invalid issues</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Role Update Modal */}
      {showRoleModal && <RoleUpdateModal />}
    </div>
  );
};

export default AdminDashboard;