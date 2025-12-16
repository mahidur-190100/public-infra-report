// StaffDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  FaClipboardList, 
  FaChartBar,
  FaCheckCircle,
  FaClock,
  FaUserCheck,
  FaCalendarDay,
  FaExclamationTriangle,
  FaUserTie,
  FaArrowRight,
  FaTasks,
  FaHistory,
  FaChartPie,
  FaBell
} from 'react-icons/fa';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [staffData, setStaffData] = useState(null);
  const [stats, setStats] = useState({
    assignedIssues: 0,
    pendingIssues: 0,
    resolvedIssues: 0,
    todaysTasks: 0,
    weeklyResolved: 0,
    averageResolutionTime: 0,
    inProgressIssues: 0
  });
  const [loading, setLoading] = useState(true);
  const [todaysIssues, setTodaysIssues] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchStaffData();
  }, []);

  const fetchStaffData = async () => {
    try {
      console.log('🔍 Fetching staff data...');
      
      // Get staff data from localStorage
      const user = localStorage.getItem('user');
      if (!user) {
        console.error('❌ No user found in localStorage');
        navigate('/login');
        return;
      }

      const parsedUser = JSON.parse(user);
      setStaffData(parsedUser);

      // Fetch staff's assigned issues
      const response = await axios.get(`https://public-infra-report-server.vercel.app/staff/dashboard-stats`, {
        params: {
          staffEmail: parsedUser.email,
          staffId: parsedUser.id || parsedUser.email
        }
      });

      console.log('📊 Staff dashboard stats:', response.data);

      if (response.data.success) {
        setStats(response.data.stats);
        
        // Fetch today's issues
        const issuesRes = await axios.get(`https://public-infra-report-server.vercel.app/staff/issues`, {
          params: {
            staffEmail: parsedUser.email,
            staffId: parsedUser.id || parsedUser.email
          }
        });

        if (issuesRes.data.success) {
          const allIssues = issuesRes.data.issues;
          const today = new Date().toISOString().split('T')[0];
          
          // Filter today's tasks
          const todayTasks = allIssues.filter(issue => {
            const createdDate = new Date(issue.createdAt || issue.reportedAt).toISOString().split('T')[0];
            const dueDate = issue.dueDate ? new Date(issue.dueDate).toISOString().split('T')[0] : null;
            return createdDate === today || dueDate === today;
          });
          
          setTodaysIssues(todayTasks.slice(0, 5)); // Show only 5 tasks
          
          // Set recent activity (last 5 issues)
          setRecentActivity(allIssues.slice(0, 5).map(issue => ({
            id: issue._id,
            title: issue.title,
            status: issue.status,
            priority: issue.priority,
            date: issue.createdAt || issue.reportedAt
          })));
        }
      } else {
        // If endpoint fails, use fallback data
        setFallbackData();
      }
      
    } catch (error) {
      console.error('❌ Error fetching staff data:', error);
      setFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const setFallbackData = () => {
    // Fallback data for testing/demo
    setStats({
      assignedIssues: 12,
      pendingIssues: 5,
      resolvedIssues: 7,
      todaysTasks: 3,
      weeklyResolved: 4,
      averageResolutionTime: 2.5,
      inProgressIssues: 2
    });

    setTodaysIssues([
      { id: '1', title: 'Fix pothole on Main Street', status: 'pending', priority: 'high' },
      { id: '2', title: 'Repair street light', status: 'in-progress', priority: 'medium' },
      { id: '3', title: 'Clear drainage blockage', status: 'pending', priority: 'high' }
    ]);

    setRecentActivity([
      { id: '1', title: 'Fix pothole on Main Street', status: 'pending', priority: 'high', date: '2024-01-15' },
      { id: '2', title: 'Repair street light', status: 'in-progress', priority: 'medium', date: '2024-01-14' },
      { id: '3', title: 'Clear drainage blockage', status: 'pending', priority: 'high', date: '2024-01-14' },
      { id: '4', title: 'Replace broken sign', status: 'resolved', priority: 'low', date: '2024-01-13' },
      { id: '5', title: 'Fix sidewalk crack', status: 'resolved', priority: 'medium', date: '2024-01-12' }
    ]);
  };

  const refreshData = () => {
    setLoading(true);
    fetchStaffData();
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': 
      case 'in progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-100 rounded-lg"></div>
            <div className="h-64 bg-gray-100 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaUserTie className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Staff Dashboard
              </h1>
              <p className="text-gray-600">
                Welcome back, {staffData?.name || staffData?.displayName || staffData?.email?.split('@')[0]}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              Staff Member
            </span>
            <span className="text-sm text-gray-500">
              • Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
        
        <button
          onClick={refreshData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <FaChartBar className="w-4 h-4" />
          Refresh Data
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Assigned Issues Card */}
        <div className="bg-white rounded-xl shadow border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Assigned Issues</h3>
            <FaClipboardList className="w-8 h-8 text-blue-500" />
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-blue-600 mb-1">{stats.assignedIssues}</p>
            <p className="text-sm text-gray-500">Total assigned to you</p>
          </div>
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Pending: {stats.pendingIssues}</span>
              <span>In Progress: {stats.inProgressIssues}</span>
            </div>
          </div>
        </div>
        
       
        
        {/* Resolved Issues Card */}
        <div className="bg-white rounded-xl shadow border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Resolved Issues</h3>
            <FaCheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <div className="text-center">
            <p className="text-3xl md:text-4xl font-bold text-green-600 mb-1">{stats.resolvedIssues}</p>
            <p className="text-sm text-gray-500">Successfully resolved</p>
          </div>
          {stats.assignedIssues > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500 mb-1">
                {Math.round((stats.resolvedIssues / stats.assignedIssues) * 100)}% of assigned
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500"
                  style={{ width: `${(stats.resolvedIssues / stats.assignedIssues) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
        
       
      </div>

      {/* Main Content Area - Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Today's Tasks Section */}
        <div className="bg-white rounded-xl shadow border border-gray-200">
          <div className="p-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaTasks className="w-5 h-5 text-purple-600" />
                <h2 className="text-xl font-bold text-gray-900">Today's Priority Tasks</h2>
              </div>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                {todaysIssues.length} tasks
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Issues that need your attention today</p>
          </div>
          
          <div className="p-5">
            {todaysIssues.length > 0 ? (
              <div className="space-y-4">
                {todaysIssues.map((issue, index) => (
                  <div 
                    key={issue.id || index} 
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => issue.id && navigate(`/issues/${issue.id}`)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900 truncate">
                        {issue.title || `Task ${index + 1}`}
                      </h3>
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(issue.priority)}`}>
                          {issue.priority || 'normal'}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(issue.status)}`}>
                          {issue.status || 'pending'}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {issue.description || 'No description available'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : 'Today'}
                      </span>
                      <span className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
                        View Details <FaArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={() => navigate('/dashboard/staff/today-tasks')}
                  className="w-full py-3 text-center text-blue-600 hover:text-blue-800 font-medium border border-dashed border-gray-300 rounded-lg hover:border-blue-300 transition-colors"
                >
                  View All Today's Tasks →
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <FaCheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <p className="text-gray-500">No tasks for today! All caught up.</p>
                <button
                  onClick={() => navigate('/dashboard/staff/my-issues')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Check Assigned Issues
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white rounded-xl shadow border border-gray-200">
          <div className="p-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FaHistory className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {recentActivity.length} activities
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">Your recent issue updates</p>
          </div>
          
          <div className="p-5">
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div 
                    key={activity.id || index} 
                    className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className={`p-2 rounded-full ${getStatusColor(activity.status)}`}>
                      {activity.status === 'resolved' ? (
                        <FaCheckCircle className="w-4 h-4" />
                      ) : activity.status === 'in-progress' ? (
                        <FaClock className="w-4 h-4" />
                      ) : (
                        <FaExclamationTriangle className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {activity.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(activity.status)}`}>
                          {activity.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(activity.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={() => navigate('/dashboard/staff/my-issues')}
                  className="w-full py-3 text-center text-blue-600 hover:text-blue-800 font-medium border border-dashed border-gray-300 rounded-lg hover:border-blue-300 transition-colors"
                >
                  View All Activity →
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <FaBell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No recent activity yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <button
            onClick={() => navigate('/dashboard/staff/my-issues')}
            className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors text-left group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaClipboardList className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900">View All Assigned Issues</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              See all issues assigned to you across different statuses
            </p>
            <span className="inline-flex items-center text-blue-600 font-medium text-sm group-hover:underline">
              Go to My Issues <FaArrowRight className="w-4 h-4 ml-2" />
            </span>
          </button>
          
          <button
            onClick={() => navigate('/dashboard/staff/pending-issues')}
            className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg border border-yellow-200 transition-colors text-left group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FaClock className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="font-bold text-gray-900">Pending Issues</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Review and update your pending issues
            </p>
            <span className="inline-flex items-center text-yellow-600 font-medium text-sm group-hover:underline">
              View Pending <FaArrowRight className="w-4 h-4 ml-2" />
            </span>
          </button>
          
          <button
            onClick={() => navigate('/dashboard/staff/resolved-issues')}
            className="p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors text-left group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaCheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900">Resolved Issues</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              View your successfully resolved issues history
            </p>
            <span className="inline-flex items-center text-green-600 font-medium text-sm group-hover:underline">
              View Resolved <FaArrowRight className="w-4 h-4 ml-2" />
            </span>
          </button>
          
        </div>
      </div>

      {/* Performance Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow border border-blue-100 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Your Performance Overview</h2>
            <p className="text-gray-600">Track your efficiency and productivity metrics</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.weeklyResolved}</div>
              <div className="text-xs text-gray-500">Weekly Resolved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.averageResolutionTime}d</div>
              <div className="text-xs text-gray-500">Avg Resolution Time</div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <FaChartPie className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-gray-900">Completion Rate</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats.assignedIssues > 0 ? Math.round((stats.resolvedIssues / stats.assignedIssues) * 100) : 0}%
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500"
                style={{ width: `${stats.assignedIssues > 0 ? (stats.resolvedIssues / stats.assignedIssues) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <FaUserCheck className="w-5 h-5 text-green-600" />
              <h3 className="font-medium text-gray-900">Productivity Score</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {Math.min(100, Math.round((stats.resolvedIssues / Math.max(stats.assignedIssues, 1)) * 100 + stats.weeklyResolved * 5))}
            </div>
            <div className="text-sm text-gray-500">Based on resolved issues and response time</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <FaCalendarDay className="w-5 h-5 text-purple-600" />
              <h3 className="font-medium text-gray-900">On-time Completion</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats.averageResolutionTime <= 3 ? 'Excellent' : stats.averageResolutionTime <= 7 ? 'Good' : 'Needs Improvement'}
            </div>
            <div className="text-sm text-gray-500">
              Average resolution time: {stats.averageResolutionTime} days
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;