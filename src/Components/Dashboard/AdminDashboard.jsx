
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FaClipboardList, 
  FaChartBar,
  FaCheckCircle,
  FaClock,
  FaUserShield,
  FaUserCheck,
  FaUsers
} from 'react-icons/fa';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalIssues: 0,
    pendingIssues: 0,
    resolvedIssues: 0,
    totalUsers: 0,
    adminUsers: 0,
    regularUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // console.log(' dashboard data...');
      
      // Fetch issue statistics
      const issuesRes = await axios.get('https://public-infra-report-server.vercel.app/issues-stats');
      // console.log('Issues stats response:', issuesRes.data);
      
      // Fetch all issues for more detailed stats
      const allIssuesRes = await axios.get('https://public-infra-report-server.vercel.app/issues');
      // console.log('All issues response:', allIssuesRes.data);
      
      // Fetch user statistics
      const usersRes = await axios.get('https://public-infra-report-server.vercel.app/users');
      // console.log( Users response:', usersRes.data);
      
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
       
        issuesData = allIssuesRes.data.issues;
      } else if (Array.isArray(allIssuesRes.data)) {
        
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
        
        // console.log(` Calculated: Total=${totalIssues}, Pending=${pendingIssues}, Resolved=${resolvedIssues}`);
        
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
        
        // console.log(`Calculated: Total=${totalUsers}, Admins=${adminUsers}, Users=${regularUsers}`);
        
        setStats(prev => ({
          ...prev,
          totalUsers: totalUsers,
          adminUsers: adminUsers,
          regularUsers: regularUsers
        }));
      }
      
      // console.log(' Final stats:', stats);
      
    } catch (error) {
      console.error(' Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
              <FaUserShield className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Reject Issues</h3>
              <p className="text-sm text-gray-500">Review and reject invalid issues</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;