import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaUser, 
  FaUserTimes, 
  FaUserCheck, 
  FaSearch, 
  FaFilter, 
  FaEnvelope, 
  FaCalendarAlt,
  FaCrown,
  FaShieldAlt,
  FaExclamationTriangle,
  FaEye,
  FaSyncAlt,
  FaTrash,
  FaCheck,
  FaTimes,
  FaUserPlus,
  FaUserMinus
} from 'react-icons/fa';
import { toast, Toaster } from 'react-hot-toast';

const ManageCitizens = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showUnblockModal, setShowUnblockModal] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    blocked: 0,
    admins: 0,
    staff: 0,
    premium: 0
  });

  useEffect(() => {
    fetchAllUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const fetchAllUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://public-infra-report-server.vercel.app/users');
      if (response.data.success) {
        const allUsers = response.data.users;
        setUsers(allUsers);
        
        const total = allUsers.length;
        const active = allUsers.filter(u => !u.blocked).length;
        const blocked = allUsers.filter(u => u.blocked).length;
        const admins = allUsers.filter(u => u.role === 'admin').length;
        const staff = allUsers.filter(u => u.role === 'staff').length;
        const premium = allUsers.filter(u => u.isPremium).length;
        
        setStats({
          total,
          active,
          blocked,
          admins,
          staff,
          premium
        });
        
        toast.success(`Loaded ${total} users from database`);
      }
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        (user.email && user.email.toLowerCase().includes(term)) ||
        (user.displayName && user.displayName.toLowerCase().includes(term)) ||
        (user.name && user.name.toLowerCase().includes(term))
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      if (statusFilter === 'active') {
        filtered = filtered.filter(user => !user.blocked);
      } else if (statusFilter === 'blocked') {
        filtered = filtered.filter(user => user.blocked);
      }
    }

    setFilteredUsers(filtered);
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const handleBlockUser = (user) => {
    setSelectedUser(user);
    setBlockReason('');
    setShowBlockModal(true);
  };

  const handleUnblockUser = (user) => {
    setSelectedUser(user);
    setShowUnblockModal(true);
  };

  const confirmBlockUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await axios.patch(`https://public-infra-report-server.vercel.app/users/${selectedUser.email}`, {
        blocked: true,
        blockReason: blockReason || 'Blocked by administrator',
        blockedAt: new Date().toISOString(),
        blockedBy: 'Admin',
        updatedAt: new Date().toISOString()
      });

      if (response.data.success) {
        toast.success(`${selectedUser.email} has been blocked`);
        
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.email === selectedUser.email 
              ? { 
                  ...user, 
                  blocked: true,
                  blockReason: blockReason || 'Blocked by administrator',
                  blockedAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                } 
              : user
          )
        );

        setShowBlockModal(false);
        setSelectedUser(null);
        setBlockReason('');
      } else {
        toast.error('Failed to block user');
      }
    } catch (error) {
      toast.error('Error blocking user');
    }
  };

  const confirmUnblockUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await axios.patch(`https://public-infra-report-server.vercel.app/users/${selectedUser.email}`, {
        blocked: false,
        unblockedAt: new Date().toISOString(),
        unblockedBy: 'Admin',
        updatedAt: new Date().toISOString()
      });

      if (response.data.success) {
        toast.success(`${selectedUser.email} has been unblocked`);
        
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.email === selectedUser.email 
              ? { 
                  ...user, 
                  blocked: false,
                  unblockedAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                } 
              : user
          )
        );

        setShowUnblockModal(false);
        setSelectedUser(null);
      } else {
        toast.error('Failed to unblock user');
      }
    } catch (error) {
      toast.error('Error unblocking user');
    }
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

  const getRoleBadge = (role) => {
    const roleStyles = {
      admin: 'bg-red-100 text-red-800',
      staff: 'bg-blue-100 text-blue-800',
      user: 'bg-green-100 text-green-800'
    };
    
    return (
      <span className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium ${roleStyles[role] || 'bg-gray-100 text-gray-800'}`}>
        {role?.toUpperCase() || 'USER'}
      </span>
    );
  };

  const getStatusBadge = (blocked) => {
    if (blocked) {
      return (
        <span className="px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center gap-1">
          <FaUserTimes className="w-3 h-3" />
          <span className="hidden xs:inline">BLOCKED</span>
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 flex items-center gap-1">
          <FaUserCheck className="w-3 h-3" />
          <span className="hidden xs:inline">ACTIVE</span>
        </span>
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 md:py-8">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <div className="max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                <FaUser className="text-blue-600 w-6 h-6 sm:w-8 sm:h-8" />
                <span>Manage Citizens & Staff</span>
              </h1>
              <p className="text-gray-600 text-xs sm:text-sm md:text-base mt-1 sm:mt-2">
                Admin panel for managing all users, blocking/unblocking accounts
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={fetchAllUsers}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1 sm:gap-2 transition-colors text-xs sm:text-sm"
              >
                <FaSyncAlt className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl shadow border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Total Users</p>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <FaUser className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl shadow border border-green-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Active Users</p>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl font-bold text-green-600">{stats.active}</p>
              </div>
              <FaUserCheck className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl shadow border border-red-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Blocked Users</p>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl font-bold text-red-600">{stats.blocked}</p>
              </div>
              <FaUserTimes className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
            </div>
          </div>
          
          <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl shadow border border-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500">Premium Users</p>
                <p className="text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl font-bold text-purple-600">{stats.premium}</p>
              </div>
              <FaCrown className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow mb-4 sm:mb-6 p-3 sm:p-4 md:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 sm:py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              />
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
                <option value="user">Citizen</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table - Desktop View */}
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <tr key={user.email} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center">
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                            {user.photoURL ? (
                              <img 
                                src={user.photoURL} 
                                alt={user.displayName}
                                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover"
                              />
                            ) : (
                              <FaUser className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {user.displayName || user.name || 'No Name'}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {user.email}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              {user.isPremium && (
                                <span className="text-xs px-2 py-0.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full truncate">
                                  <FaCrown className="w-2 h-2 inline mr-1" />
                                  Premium
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {getStatusBadge(user.blocked)}
                          {user.blocked && user.blockReason && (
                            <div className="text-xs text-gray-500 truncate max-w-[150px]">
                              Reason: {user.blockReason}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-col xs:flex-row items-start xs:items-center gap-1 xs:gap-2">
                          <button
                            onClick={() => handleViewDetails(user)}
                            className="text-blue-600 hover:text-blue-900 flex items-center gap-1 transition-colors px-2 py-1 bg-blue-50 rounded-lg hover:bg-blue-100 text-xs sm:text-sm"
                          >
                            <FaEye className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>View</span>
                          </button>
                          
                          {user.blocked ? (
                            <button
                              onClick={() => handleUnblockUser(user)}
                              className="text-green-600 hover:text-green-900 flex items-center gap-1 transition-colors px-2 py-1 bg-green-50 rounded-lg hover:bg-green-100 text-xs sm:text-sm"
                            >
                              <FaUserPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>Unblock</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBlockUser(user)}
                              className="text-red-600 hover:text-red-900 flex items-center gap-1 transition-colors px-2 py-1 bg-red-50 rounded-lg hover:bg-red-100 text-xs sm:text-sm"
                            >
                              <FaUserMinus className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span>Block</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 sm:px-6 py-8 sm:py-12 text-center">
                      <div className="text-gray-400 mb-3 sm:mb-4">
                        <FaUser className="w-8 h-8 sm:w-12 sm:h-12 mx-auto" />
                      </div>
                      <p className="text-gray-500 text-sm sm:text-lg">No users found</p>
                      <p className="text-gray-400 text-xs sm:text-sm mt-1 sm:mt-2">
                        {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' 
                          ? 'Try changing your search or filter criteria'
                          : 'No users registered in the system yet'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Mobile Card View */}
          <div className="lg:hidden">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div key={user.email} className="border-b border-gray-200 p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        {user.photoURL ? (
                          <img 
                            src={user.photoURL} 
                            alt={user.displayName}
                            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover"
                          />
                        ) : (
                          <FaUser className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1 mb-1">
                          <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                            {user.displayName || user.name || 'No Name'}
                          </h3>
                          {user.isPremium && (
                            <span className="text-xs px-1.5 py-0.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full flex-shrink-0">
                              <FaCrown className="w-2 h-2 inline mr-1" />
                              Premium
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate mb-2">{user.email}</p>
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                          {getRoleBadge(user.role)}
                          {getStatusBadge(user.blocked)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>
                      <span className="font-medium">Created:</span>
                      <div className="text-gray-500 truncate">{formatDate(user.createdAt)}</div>
                    </div>
                    {user.blocked && user.blockReason && (
                      <div className="col-span-2">
                        <span className="font-medium">Reason:</span>
                        <div className="text-gray-500 truncate">{user.blockReason}</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 flex flex-wrap gap-1 sm:gap-2">
                    <button
                      onClick={() => handleViewDetails(user)}
                      className="text-blue-600 hover:text-blue-900 flex items-center gap-1 transition-colors px-2 py-1.5 bg-blue-50 rounded-lg hover:bg-blue-100 text-xs sm:text-sm flex-1 justify-center"
                    >
                      <FaEye className="w-3 h-3 sm:w-4 sm:h-4" />
                      View Details
                    </button>
                    
                    {user.blocked ? (
                      <button
                        onClick={() => handleUnblockUser(user)}
                        className="text-green-600 hover:text-green-900 flex items-center gap-1 transition-colors px-2 py-1.5 bg-green-50 rounded-lg hover:bg-green-100 text-xs sm:text-sm flex-1 justify-center"
                      >
                        <FaUserPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                        Unblock User
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBlockUser(user)}
                        className="text-red-600 hover:text-red-900 flex items-center gap-1 transition-colors px-2 py-1.5 bg-red-50 rounded-lg hover:bg-red-100 text-xs sm:text-sm flex-1 justify-center"
                      >
                        <FaUserMinus className="w-3 h-3 sm:w-4 sm:h-4" />
                        Block User
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 sm:py-12 px-4">
                <div className="text-gray-400 mb-3 sm:mb-4">
                  <FaUser className="w-8 h-8 sm:w-12 sm:h-12 mx-auto" />
                </div>
                <p className="text-gray-500 text-sm sm:text-lg">No users found</p>
                <p className="text-gray-400 text-xs sm:text-sm mt-1 sm:mt-2">
                  {searchTerm || roleFilter !== 'all' || statusFilter !== 'all' 
                    ? 'Try changing your search or filter criteria'
                    : 'No users registered in the system yet'}
                </p>
              </div>
            )}
          </div>
          
          {/* Summary */}
          {filteredUsers.length > 0 && (
            <div className="px-4 py-3 sm:px-6 sm:py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
                <div className="text-xs sm:text-sm text-gray-500">
                  Showing <span className="font-medium">{filteredUsers.length}</span> of <span className="font-medium">{users.length}</span> users
                  <span className="ml-2 sm:ml-4">
                    <span className="text-green-600">Active: {stats.active}</span>
                    <span className="mx-1 sm:mx-2">•</span>
                    <span className="text-red-600">Blocked: {stats.blocked}</span>
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-medium text-gray-900">
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    <span className="text-red-600">Admin: {stats.admins}</span>
                    <span className="mx-1 sm:mx-2">•</span>
                    <span className="text-blue-600">Staff: {stats.staff}</span>
                    <span className="mx-1 sm:mx-2">•</span>
                    <span className="text-green-600">Citizens: {stats.total - stats.admins - stats.staff}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {showDetailsModal && selectedUser && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowDetailsModal(false)}
          />
          
          <div className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-md md:max-w-2xl max-h-[95vh] overflow-hidden mx-2 sm:mx-0">
              <div className="sticky top-0 bg-white z-10 p-4 sm:p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 sm:gap-3">
                    {selectedUser.photoURL ? (
                      <img 
                        src={selectedUser.photoURL} 
                        alt={selectedUser.displayName}
                        className="h-8 w-8 sm:h-10 sm:h-12 sm:w-10 sm:w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 sm:h-10 sm:h-12 sm:w-10 sm:w-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <FaUser className="w-4 h-4 sm:w-5 sm:w-6 sm:h-5 sm:h-6 text-blue-600" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                        {selectedUser.displayName || selectedUser.name || 'User Details'}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">{selectedUser.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-80px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
                  {/* Basic Info */}
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                      <FaUser className="w-3 h-3 sm:w-4 sm:h-4" /> Basic Information
                    </h4>
                    <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Display Name:</span>
                        <span className="font-medium truncate max-w-[120px] sm:max-w-none">{selectedUser.displayName || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Full Name:</span>
                        <span className="font-medium truncate max-w-[120px] sm:max-w-none">{selectedUser.name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium truncate max-w-[120px] sm:max-w-none">{selectedUser.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">User ID:</span>
                        <span className="font-medium truncate max-w-[120px] sm:max-w-none">{selectedUser.uid || selectedUser._id || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Account Info */}
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                      <FaShieldAlt className="w-3 h-3 sm:w-4 sm:h-4" /> Account Information
                    </h4>
                    <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Role:</span>
                        {getRoleBadge(selectedUser.role)}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Status:</span>
                        {getStatusBadge(selectedUser.blocked)}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Premium:</span>
                        <span className="font-medium">
                          {selectedUser.isPremium ? (
                            <span className="text-purple-600 flex items-center gap-1">
                              <FaCrown className="w-3 h-3 sm:w-4 sm:h-4" /> Yes
                            </span>
                          ) : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Created:</span>
                        <span className="font-medium truncate">{formatDate(selectedUser.createdAt)}</span>
                      </div>
                      {selectedUser.updatedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Last Updated:</span>
                          <span className="font-medium truncate">{formatDate(selectedUser.updatedAt)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Block/Unblock Info */}
                {selectedUser.blocked ? (
                  <div className="bg-red-50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 border border-red-200">
                    <h4 className="font-semibold text-red-800 mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                      <FaExclamationTriangle className="w-3 h-3 sm:w-4 sm:h-4" /> Account Blocked
                    </h4>
                    <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
                      {selectedUser.blockReason && (
                        <div className="flex justify-between">
                          <span className="text-red-600">Block Reason:</span>
                          <span className="font-medium truncate max-w-[150px] sm:max-w-none">{selectedUser.blockReason}</span>
                        </div>
                      )}
                      {selectedUser.blockedAt && (
                        <div className="flex justify-between">
                          <span className="text-red-600">Blocked At:</span>
                          <span className="font-medium truncate">{formatDate(selectedUser.blockedAt)}</span>
                        </div>
                      )}
                      {selectedUser.blockedBy && (
                        <div className="flex justify-between">
                          <span className="text-red-600">Blocked By:</span>
                          <span className="font-medium">{selectedUser.blockedBy}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                      <FaCheck className="w-3 h-3 sm:w-4 sm:h-4" /> Account Active
                    </h4>
                    <p className="text-green-700 text-xs sm:text-sm">
                      This account is currently active and can log in normally.
                    </p>
                  </div>
                )}
                
                {/* Premium Subscription Info */}
                {selectedUser.isPremium && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 border border-purple-200">
                    <h4 className="font-semibold text-purple-800 mb-2 sm:mb-3 flex items-center gap-1 sm:gap-2 text-sm sm:text-base">
                      <FaCrown className="w-3 h-3 sm:w-4 sm:h-4" /> Premium Subscription
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                      {selectedUser.subscriptionType && (
                        <div>
                          <p className="text-purple-600">Plan:</p>
                          <p className="font-medium capitalize truncate">{selectedUser.subscriptionType}</p>
                        </div>
                      )}
                      {selectedUser.subscriptionStart && (
                        <div>
                          <p className="text-purple-600">Started:</p>
                          <p className="font-medium truncate">{formatDate(selectedUser.subscriptionStart)}</p>
                        </div>
                      )}
                      {selectedUser.subscriptionEnd && (
                        <div>
                          <p className="text-purple-600">Ends:</p>
                          <p className="font-medium truncate">{formatDate(selectedUser.subscriptionEnd)}</p>
                        </div>
                      )}
                      {selectedUser.lastPayment && (
                        <div className="sm:col-span-2">
                          <p className="text-purple-600">Last Payment:</p>
                          <p className="font-medium truncate">{formatDate(selectedUser.lastPayment)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="sticky bottom-0 bg-white pt-3 pb-1 sm:pt-4 sm:pb-2 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                    {selectedUser.blocked ? (
                      <button
                        onClick={() => {
                          setShowDetailsModal(false);
                          handleUnblockUser(selectedUser);
                        }}
                        className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
                      >
                        <FaUserPlus className="w-3 h-3 sm:w-4 sm:h-4" />
                        Unblock User
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setShowDetailsModal(false);
                          handleBlockUser(selectedUser);
                        }}
                        className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm"
                      >
                        <FaUserMinus className="w-3 h-3 sm:w-4 sm:h-4" />
                        Block User
                      </button>
                    )}
                    <button
                      onClick={() => setShowDetailsModal(false)}
                      className="px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm"
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

      {/* Block User Modal */}
      {showBlockModal && selectedUser && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowBlockModal(false)}
          />
          
          <div className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-md mx-2 sm:mx-0">
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="p-1.5 sm:p-2 bg-red-100 rounded-lg">
                    <FaExclamationTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Block User</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Prevent user from logging in</p>
                  </div>
                </div>

                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 rounded-lg border border-red-200">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    {selectedUser.photoURL ? (
                      <img 
                        src={selectedUser.photoURL} 
                        alt={selectedUser.displayName}
                        className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <FaUser className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{selectedUser.displayName || selectedUser.email}</p>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{selectedUser.email}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {getRoleBadge(selectedUser.role)}
                    {selectedUser.isPremium && (
                      <span className="text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-full">
                        <FaCrown className="w-2 h-2 inline mr-1" />
                        Premium
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-4 sm:mb-6">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                    Reason for Blocking (Optional)
                  </label>
                  <textarea
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    placeholder="Enter reason for blocking this user..."
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-xs sm:text-sm"
                    rows="3"
                  />
                </div>

                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-xs sm:text-sm text-yellow-700">
                    <strong className="font-medium">Warning:</strong> Blocking this user will prevent them from logging in.
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:gap-3">
                  <button
                    onClick={confirmBlockUser}
                    className="w-full py-2.5 sm:py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
                  >
                    <FaUserMinus className="w-4 h-4 sm:w-5 sm:h-5" />
                    Confirm Block User
                  </button>
                  <button
                    onClick={() => {
                      setShowBlockModal(false);
                      setSelectedUser(null);
                      setBlockReason('');
                    }}
                    className="w-full py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Unblock User Modal */}
      {showUnblockModal && selectedUser && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowUnblockModal(false)}
          />
          
          <div className="fixed inset-0 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-2xl w-full max-w-xs sm:max-w-md mx-2 sm:mx-0">
              <div className="p-4 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <div className="p-1.5 sm:p-2 bg-green-100 rounded-lg">
                    <FaUserPlus className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">Unblock User</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Allow user to login again</p>
                  </div>
                </div>

                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                    {selectedUser.photoURL ? (
                      <img 
                        src={selectedUser.photoURL} 
                        alt={selectedUser.displayName}
                        className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <FaUser className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{selectedUser.displayName || selectedUser.email}</p>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{selectedUser.email}</p>
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    <p>Blocked since: {formatDate(selectedUser.blockedAt)}</p>
                    {selectedUser.blockReason && (
                      <p className="truncate">Reason: {selectedUser.blockReason}</p>
                    )}
                  </div>
                </div>

                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-xs sm:text-sm text-blue-700 font-medium mb-1">User will be able to:</p>
                  <ul className="text-xs sm:text-sm text-blue-700 space-y-0.5">
                    <li>• Login to their account</li>
                    <li>• Access all features</li>
                    <li>• Report and view issues</li>
                    {selectedUser.isPremium && <li>• Use premium features</li>}
                  </ul>
                </div>

                <div className="flex flex-col gap-2 sm:gap-3">
                  <button
                    onClick={confirmUnblockUser}
                    className="w-full py-2.5 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
                  >
                    <FaUserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                    Confirm Unblock User
                  </button>
                  <button
                    onClick={() => {
                      setShowUnblockModal(false);
                      setSelectedUser(null);
                    }}
                    className="w-full py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ManageCitizens;