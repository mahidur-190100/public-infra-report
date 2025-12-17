import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FaUsers, FaEdit, FaSave, FaTimes, FaSearch,
  FaFilter, FaSyncAlt, FaUserShield, FaUser,
  FaUserCheck, FaCrown, FaStar, FaIdCard,
  FaEnvelope, FaCalendarAlt, FaKey,
} from 'react-icons/fa';

const ManageStaff = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    staff: 0,
    users: 0,
    premium: 0
  });

  // Fetch all users
  const fetchAllUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://public-infra-report-server.vercel.app/users');
      
      if (response.data.success && Array.isArray(response.data.users)) {
        const usersData = response.data.users;
        
        setUsers(usersData);
        setFilteredUsers(usersData);
        
        const stats = {
          total: usersData.length,
          admins: usersData.filter(user => user.role === 'admin').length,
          staff: usersData.filter(user => user.role === 'staff').length,
          users: usersData.filter(user => user.role === 'user' || !user.role).length,
          premium: usersData.filter(user => user.isPremium === true).length
        };
        
        setStats(stats);
      } else {
        setUsers([]);
        setFilteredUsers([]);
      }
    } catch (error) {
      alert('Failed to load users. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user role
  const updateUserRole = async (userEmail) => {
    if (!newRole || !selectedUser) return;
    
    setUpdating(true);
    try {
      const response = await axios.post('https://public-infra-report-server.vercel.app/update-role', {
        email: userEmail,
        role: newRole
      });
      
      if (response.data.success) {
        const updatedUsers = users.map(user => 
          user.email === userEmail ? { ...user, role: newRole } : user
        );
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
        
        const updatedStats = {
          total: updatedUsers.length,
          admins: updatedUsers.filter(user => user.role === 'admin').length,
          staff: updatedUsers.filter(user => user.role === 'staff').length,
          users: updatedUsers.filter(user => user.role === 'user' || !user.role).length,
          premium: updatedUsers.filter(user => user.isPremium === true).length
        };
        setStats(updatedStats);
        
        alert('User role updated successfully!');
        setShowRoleModal(false);
        setSelectedUser(null);
        setNewRole('');
      } else {
        alert('Failed to update user role: ' + response.data.message);
      }
    } catch (error) {
      alert('Failed to update user role: ' + (error.response?.data?.message || error.message));
    } finally {
      setUpdating(false);
    }
  };

  // Filter users based on search and role
  useEffect(() => {
    let result = users;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.email.toLowerCase().includes(term) ||
        (user.displayName && user.displayName.toLowerCase().includes(term)) ||
        (user.uid && user.uid.toLowerCase().includes(term))
      );
    }
    
    if (roleFilter !== 'all') {
      if (roleFilter === 'premium') {
        result = result.filter(user => user.isPremium === true);
      } else {
        result = result.filter(user => user.role === roleFilter);
      }
    }
    
    setFilteredUsers(result);
  }, [searchTerm, roleFilter, users]);

  // Initial fetch
  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  // Role Update Modal Component
  const RoleUpdateModal = () => {
    if (!showRoleModal || !selectedUser) return null;
    
    const isCurrentUserAdmin = selectedUser.role === 'admin';
    const isEditingSelf = selectedUser.email === JSON.parse(localStorage.getItem('admin'))?.email;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
        <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl w-full max-w-xs sm:max-w-md max-h-[95vh] overflow-y-auto mx-2 sm:mx-0">
          <div className="p-4 sm:p-6">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Update User Role</h3>
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                  setNewRole('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                {selectedUser.photoURL ? (
                  <img
                    className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover"
                    src={selectedUser.photoURL}
                    alt={selectedUser.displayName}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.displayName || selectedUser.email)}&background=random`;
                    }}
                  />
                ) : (
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-sm sm:text-lg">
                      {(selectedUser.displayName || selectedUser.email).charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                    {selectedUser.displayName || 'No Name'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">{selectedUser.email}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <FaIdCard className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                  <span className="text-gray-600">ID:</span>
                  <span className="font-mono text-xs truncate">{selectedUser.uid?.substring(0, 12)}...</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                  <span className="text-gray-600">Joined:</span>
                  <span className="truncate">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'N/A'}</span>
                </div>
                {selectedUser.provider && (
                  <div className="flex items-center gap-2">
                    <FaKey className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                    <span className="text-gray-600">Provider:</span>
                    <span className="capitalize truncate">{selectedUser.provider}</span>
                  </div>
                )}
                {selectedUser.isPremium && (
                  <div className="flex items-center gap-2 col-span-full">
                    <FaCrown className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
                    <span className="text-yellow-600 font-medium text-sm">Premium User</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Role
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1.5 text-sm font-semibold rounded-lg ${
                  selectedUser.role === 'admin' 
                    ? 'bg-red-100 text-red-800 border border-red-200' 
                    : selectedUser.role === 'staff'
                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                    : 'bg-green-100 text-green-800 border border-green-200'
                }`}>
                  {selectedUser.role ? selectedUser.role.toUpperCase() : 'USER'}
                </span>
                {isCurrentUserAdmin && (
                  <span className="text-xs text-red-600 font-medium px-2 py-1 bg-red-50 rounded">
                    Admin privileges
                  </span>
                )}
              </div>
            </div>
            
            <div className="mb-4 sm:mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select New Role
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                {[
                  { value: 'user', label: 'User', color: 'green', icon: FaUser },
                  { value: 'staff', label: 'Staff', color: 'purple', icon: FaUserShield },
                  { value: 'admin', label: 'Admin', color: 'red', icon: FaCrown }
                ].map((role) => {
                  const Icon = role.icon;
                  const isSelected = newRole === role.value;
                  const isDisabled = isEditingSelf && role.value !== 'admin';
                  
                  return (
                    <button
                      key={role.value}
                      onClick={() => !isDisabled && setNewRole(role.value)}
                      disabled={isDisabled}
                      className={`p-2 sm:p-3 rounded-lg border-2 flex flex-col items-center justify-center transition-all ${
                        isSelected
                          ? `border-${role.color}-500 bg-${role.color}-50`
                          : `border-gray-200 hover:border-${role.color}-300 hover:bg-${role.color}-25`
                      } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <Icon className={`w-5 h-5 sm:w-6 sm:h-6 mb-1 sm:mb-2 text-${role.color}-500`} />
                      <span className={`text-xs sm:text-sm font-medium ${
                        isSelected ? `text-${role.color}-700` : 'text-gray-700'
                      }`}>
                        {role.label}
                      </span>
                      {isDisabled && (
                        <span className="text-xs text-gray-500 mt-1 hidden sm:inline">(Can't change your own admin role)</span>
                      )}
                    </button>
                  );
                })}
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="text-sm font-medium text-blue-800 mb-1">Role Descriptions:</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• <strong>User:</strong> Report issues, basic features</li>
                  <li>• <strong>Staff:</strong> Assign issues, update progress</li>
                  <li>• <strong>Admin:</strong> Full system access</li>
                </ul>
              </div>
            </div>
            
            {(selectedUser.role === 'admin' || newRole === 'admin') && !isEditingSelf && (
              <div className="mb-4 sm:mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <FaStar className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Admin Role Change</p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Changing admin roles affects system access privileges.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                  setNewRole('');
                }}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors order-2 sm:order-1"
                disabled={updating}
              >
                Cancel
              </button>
              <button
                onClick={() => updateUserRole(selectedUser.email)}
                disabled={!newRole || newRole === (selectedUser.role || 'user') || updating || (isEditingSelf && newRole !== 'admin')}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 order-1 sm:order-2"
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

  // Loading state
  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 rounded w-1/4 sm:w-1/6"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 sm:w-1/3"></div>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-20 sm:h-24 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 xs:p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <div className="flex flex-col xs:flex-row justify-between items-start xs:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="w-full xs:w-auto">
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                <FaUsers className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
              </div>
              <span className="truncate">Staff & User Management</span>
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm md:text-base">
              Manage user roles, permissions, and access levels
            </p>
          </div>
          
          <button
            onClick={fetchAllUsers}
            className="px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2 shadow-sm hover:shadow text-xs sm:text-sm w-full xs:w-auto justify-center"
          >
            <FaSyncAlt className="w-3 h-3 sm:w-4 sm:h-4" />
            Refresh Users
          </button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
          <div className="bg-white p-3 sm:p-4 rounded-xl shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold text-gray-800 mt-1">{stats.total}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaUsers className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-3 sm:p-4 rounded-xl shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500">Admins</p>
                <p className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold text-red-600 mt-1">{stats.admins}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaCrown className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-3 sm:p-4 rounded-xl shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500">Staff</p>
                <p className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold text-purple-600 mt-1">{stats.staff}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaUserShield className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-3 sm:p-4 rounded-xl shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500">Users</p>
                <p className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold text-green-600 mt-1">{stats.users}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaUser className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-3 sm:p-4 rounded-xl shadow border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500">Premium</p>
                <p className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold text-yellow-600 mt-1">{stats.premium}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaStar className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Search and Filter Bar */}
      <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl shadow border border-gray-200 mb-4 sm:mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search users by email, name, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 sm:py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              />
            </div>
          </div>
          
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaFilter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="pl-10 pr-4 py-2.5 sm:py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none text-sm sm:text-base"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="user">User</option>
                <option value="premium">Premium Users</option>
              </select>
            </div>
          </div>
          
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('all');
              }}
              className="px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 flex-1 justify-center text-sm sm:text-base"
            >
              <FaTimes className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Clear Filters</span>
              <span className="sm:hidden">Clear</span>
            </button>
          </div>
        </div>
        
        <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500 flex flex-col xs:flex-row justify-between items-start xs:items-center gap-2">
          <div>
            Showing <span className="font-semibold">{filteredUsers.length}</span> of <span className="font-semibold">{users.length}</span> users
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
              <span className="text-xs">Admin</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-purple-500 rounded-full"></div>
              <span className="text-xs">Staff</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
              <span className="text-xs">User</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Users Table - Mobile Cards View / Desktop Table View */}
      <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Details
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email & ID
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role & Status
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account Info
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => {
                const isCurrentUser = user.email === JSON.parse(localStorage.getItem('admin'))?.email;
                
                return (
                  <tr key={user._id || user.email} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 md:px-6 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {user.photoURL ? (
                          <img
                            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover border-2 border-white shadow-sm"
                            src={user.photoURL}
                            alt={user.displayName}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=random`;
                            }}
                          />
                        ) : (
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center border-2 border-white shadow-sm">
                            <span className="text-white font-bold text-sm">
                              {(user.displayName || user.email).charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900 text-sm sm:text-base">
                            {user.displayName || 'No Name'}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {user.provider ? `Via ${user.provider}` : 'Email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-3">
                      <div className="text-sm text-gray-900 truncate max-w-[180px]">{user.email}</div>
                      {user.uid && (
                        <div className="text-xs text-gray-500 font-mono mt-1 truncate max-w-[150px]">
                          ID: {user.uid.substring(0, 10)}...
                        </div>
                      )}
                    </td>
                    <td className="px-4 md:px-6 py-3 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full w-fit ${
                          user.role === 'admin' 
                            ? 'bg-red-100 text-red-800 border border-red-200' 
                            : user.role === 'staff'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-green-100 text-green-800 border border-green-200'
                        }`}>
                          {user.role ? user.role.toUpperCase() : 'USER'}
                        </span>
                        {user.isPremium && (
                          <span className="px-2 py-1 bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 text-xs font-medium rounded-full border border-yellow-200 w-fit">
                            <FaCrown className="inline w-3 h-3 mr-1" />
                            Premium
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-3">
                      <div className="text-sm text-gray-900">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Last: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-3 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setNewRole(user.role || 'user');
                          setShowRoleModal(true);
                        }}
                        disabled={isCurrentUser && user.role === 'admin'}
                        className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition-all text-xs sm:text-sm ${
                          isCurrentUser && user.role === 'admin'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800'
                        }`}
                      >
                        <FaEdit className="w-3 h-3 sm:w-4 sm:h-4" />
                        {isCurrentUser && user.role === 'admin' ? 'Your Role' : 'Change Role'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Mobile/Tablet Card View */}
        <div className="lg:hidden">
          {filteredUsers.map((user) => {
            const isCurrentUser = user.email === JSON.parse(localStorage.getItem('admin'))?.email;
            
            return (
              <div key={user._id || user.email} className="border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {user.photoURL ? (
                      <img
                        className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
                        src={user.photoURL}
                        alt={user.displayName}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=random`;
                        }}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center border-2 border-white shadow-sm flex-shrink-0">
                        <span className="text-white font-bold">
                          {(user.displayName || user.email).charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                          {user.displayName || 'No Name'}
                        </h3>
                        {isCurrentUser && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full flex-shrink-0">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-red-100 text-red-800 border border-red-200' 
                            : user.role === 'staff'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-green-100 text-green-800 border border-green-200'
                        }`}>
                          {user.role ? user.role.toUpperCase() : 'USER'}
                        </span>
                        {user.isPremium && (
                          <span className="px-2 py-1 bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 text-xs font-medium rounded-full border border-yellow-200">
                            <FaCrown className="inline w-3 h-3 mr-1" />
                            Premium
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-gray-600">
                  <div>
                    <span className="font-medium">Joined:</span>{' '}
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                  <div>
                    <span className="font-medium">Last:</span>{' '}
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </div>
                </div>
                
                <div className="mt-4">
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setNewRole(user.role || 'user');
                      setShowRoleModal(true);
                    }}
                    disabled={isCurrentUser && user.role === 'admin'}
                    className={`w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all text-sm ${
                      isCurrentUser && user.role === 'admin'
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800'
                    }`}
                  >
                    <FaEdit className="w-4 h-4" />
                    {isCurrentUser && user.role === 'admin' ? 'Your Role (Admin)' : 'Change Role'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <div className="text-gray-400 mb-3 sm:mb-4">
              <FaUsers className="w-12 h-12 sm:w-16 sm:h-16 mx-auto opacity-50" />
            </div>
            <p className="text-gray-500 text-base sm:text-lg font-medium">No users found</p>
            <p className="text-gray-400 text-xs sm:text-sm mt-1 sm:mt-2 max-w-md mx-auto px-4">
              {searchTerm || roleFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'No users are registered yet. Users will appear here once they sign up.'}
            </p>
            {(searchTerm || roleFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('all');
                }}
                className="mt-3 sm:mt-4 px-4 py-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
        
        {/* Summary Footer */}
        {filteredUsers.length > 0 && (
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
              <div className="text-xs sm:text-sm text-gray-600">
                <span className="font-medium">{filteredUsers.length}</span> users • Sorted by: Registration Date
              </div>
              <div className="flex items-center gap-3 sm:gap-6">
                <div className="text-xs sm:text-sm text-gray-500">
                  <span className="font-medium">Last: </span>
                  <span>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
                <button
                  onClick={fetchAllUsers}
                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  <FaSyncAlt className="w-3 h-3" />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Information Panel */}
      <div className="mt-4 sm:mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FaUserShield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-blue-900 text-sm sm:text-base mb-2">User Role Management Guide</h3>
            <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
              <li>• <strong>Admin:</strong> Full system access including user management</li>
              <li>• <strong>Staff:</strong> Can be assigned issues and update their progress</li>
              <li>• <strong>User:</strong> Basic access to report and track issues</li>
              <li>• You cannot change your own admin role for security reasons</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Role Update Modal */}
      {showRoleModal && <RoleUpdateModal />}
    </div>
  );
};

export default ManageStaff;