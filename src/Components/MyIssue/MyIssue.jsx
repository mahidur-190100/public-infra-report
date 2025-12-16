import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaEye, FaCheckCircle, FaClock, FaExclamationTriangle, FaPlus, FaMapMarkerAlt, FaCalendarAlt, FaArrowUp } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';

const MyIssues = () => {
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('all');

  // Get current user
  useEffect(() => {
    const getUserFromLocalStorage = () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setUser(user);
          return user;
        }
        return null;
      } catch (error) {
        console.error('Error getting user:', error);
        return null;
      }
    };
    getUserFromLocalStorage();
  }, []);

  // Fetch user's issues
  useEffect(() => {
    const fetchMyIssues = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch from your backend
        const response = await axios.get('https://public-infra-report-server.vercel.app/my-issues', {
          params: {
            email: user.email
          }
        });
        
        if (response.data.success) {
          setIssues(response.data.issues);
        } else {
          // Fallback: Get all issues and filter locally
          const allResponse = await axios.get('https://public-infra-report-server.vercel.app/issues');
          if (allResponse.data) {
            const userIssues = allResponse.data.filter(issue => 
              issue.userEmail === user.email || 
              issue.reportedBy === user.displayName
            );
            setIssues(userIssues);
          }
        }
      } catch (error) {
        console.error('Error fetching issues:', error);
        // Fallback to localStorage
        try {
          const localIssues = JSON.parse(localStorage.getItem('myIssues') || '[]');
          const userIssues = localIssues.filter(issue => 
            issue.userEmail === user.email
          );
          setIssues(userIssues);
        } catch (localError) {
          console.error('Error with localStorage:', localError);
        }
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMyIssues();
    }
  }, [user]);

  // Filter issues
  const filteredIssues = issues.filter(issue => {
    if (filter === 'all') return true;
    if (filter === 'pending') return issue.status === 'pending';
    if (filter === 'in progress') return issue.status === 'in progress';
    if (filter === 'resolved') return issue.status === 'resolved';
    return true;
  });

  // Status badge
  const StatusBadge = ({ status }) => {
    const getStatusConfig = (status) => {
      switch (status) {
        case 'pending':
          return { color: 'bg-yellow-100 text-yellow-800', icon: <FaClock /> };
        case 'in progress':
          return { color: 'bg-blue-100 text-blue-800', icon: <FaEdit /> };
        case 'resolved':
          return { color: 'bg-green-100 text-green-800', icon: <FaCheckCircle /> };
        default:
          return { color: 'bg-gray-100 text-gray-800', icon: null };
      }
    };

    const config = getStatusConfig(status);

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        {status}
      </span>
    );
  };

  // Handle delete issue
  const handleDeleteIssue = async (issueId) => {
    Swal.fire({
      title: 'Delete Issue?',
      text: 'This action cannot be undone',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Delete from backend
          await axios.delete(`https://public-infra-report-server.vercel.app/issues/${issueId}`);
          
          // Delete from localStorage
          const localIssues = JSON.parse(localStorage.getItem('myIssues') || '[]');
          const updatedLocalIssues = localIssues.filter(issue => issue._id !== issueId);
          localStorage.setItem('myIssues', JSON.stringify(updatedLocalIssues));
          
          // Update state
          setIssues(prev => prev.filter(issue => issue._id !== issueId));
          
          Swal.fire('Deleted!', 'Issue has been deleted.', 'success');
        } catch (error) {
          console.error('Error deleting issue:', error);
          Swal.fire('Error!', 'Failed to delete issue.', 'error');
        }
      }
    });
  };

  // Handle upvote
  const handleUpvote = async (issueId) => {
    try {
      const response = await axios.post(`https://public-infra-report-server.vercel.app/issues/${issueId}/upvote`, {
        userId: user?.email || 'anonymous'
      });
      
      if (response.data.success) {
        // Update local state
        setIssues(prev => prev.map(issue => 
          issue._id === issueId 
            ? { ...issue, upvotes: response.data.upvotes }
            : issue
        ));
        
        Swal.fire({
          icon: 'success',
          title: 'Upvoted!',
          timer: 1000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Error upvoting:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            My Reported Issues
          </h1>
          <p className="text-gray-600">
            View and manage all issues you have reported
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow">
            <p className="text-sm text-gray-500">Total Issues</p>
            <p className="text-2xl font-bold text-gray-800">{issues.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {issues.filter(i => i.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow">
            <p className="text-sm text-gray-500">In Progress</p>
            <p className="text-2xl font-bold text-blue-600">
              {issues.filter(i => i.status === 'in progress').length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow">
            <p className="text-sm text-gray-500">Resolved</p>
            <p className="text-2xl font-bold text-green-600">
              {issues.filter(i => i.status === 'resolved').length}
            </p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg ${filter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200'}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('in progress')}
            className={`px-4 py-2 rounded-lg ${filter === 'in progress' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          >
            In Progress
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`px-4 py-2 rounded-lg ${filter === 'resolved' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          >
            Resolved
          </button>
        </div>

        {/* Issues List */}
        {filteredIssues.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <div className="text-gray-400 mb-4">
              <FaExclamationTriangle className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Issues Found
            </h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all' 
                ? "You haven't reported any issues yet." 
                : `You don't have any ${filter} issues.`
              }
            </p>
            <button
              onClick={() => navigate('/dashboard/submit-issue')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Report New Issue
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIssues.map((issue) => (
              <div key={issue._id} className="bg-white rounded-xl shadow overflow-hidden">
                {issue.image && (
                  <img src={issue.image} alt={issue.title} className="w-full h-48 object-cover" />
                )}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">{issue.title}</h3>
                    <StatusBadge status={issue.status} />
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{issue.description.substring(0, 100)}...</p>
                  <div className="flex items-center text-gray-500 text-sm mb-3">
                    <FaMapMarkerAlt className="mr-1" />
                    {issue.location}
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-1" />
                      {new Date(issue.reportedAt).toLocaleDateString()}
                    </div>
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {issue.upvotes || 0} upvotes
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <button
                      onClick={() => handleUpvote(issue._id)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                    >
                      <FaArrowUp />
                      Upvote
                    </button>
                    <button
                      onClick={() => handleDeleteIssue(issue._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyIssues;