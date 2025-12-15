import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaBan,
  FaCheck,
  FaExclamationTriangle,
  FaClock,
  FaUser,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUndo,
  FaEye,
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle,
  FaSync
} from "react-icons/fa";
import { NavLink } from "react-router-dom";

const RejectIssue = () => {
  const [pendingIssues, setPendingIssues] = useState([]);
  const [rejectedIssues, setRejectedIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejecting, setRejecting] = useState({});
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [notification, setNotification] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Show notification function
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Get current user with improved admin detection
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        console.log("🔍 Starting admin check...");

        // Method 1: Check localStorage first
        let user = null;
        const userStr = localStorage.getItem('user');
        
        if (userStr) {
          try {
            user = JSON.parse(userStr);
            console.log("Found user in localStorage:", user);
            
            if (user.role === "admin" || user.email === "admin@example.com") {
              console.log("✅ Admin found in localStorage");
              setIsAdmin(true);
              setUserInfo(user);
              loadData();
              return;
            }
          } catch (e) {
            console.error("Error parsing localStorage user:", e);
          }
        }

        // Method 2: Check all localStorage keys
        console.log("🔄 Scanning localStorage for admin credentials...");
        const allKeys = Object.keys(localStorage);
        for (const key of allKeys) {
          try {
            const value = localStorage.getItem(key);
            if (value && typeof value === 'string') {
              if (value.includes("admin@example.com") || value.includes('"role":"admin"')) {
                console.log("✅ Found admin in localStorage key:", key);
                try {
                  const parsed = JSON.parse(value);
                  setIsAdmin(true);
                  setUserInfo(parsed);
                  localStorage.setItem('user', JSON.stringify(parsed));
                } catch {
                  const adminUser = {
                    email: "admin@example.com",
                    role: "admin",
                    displayName: "Admin Admin"
                  };
                  setIsAdmin(true);
                  setUserInfo(adminUser);
                  localStorage.setItem('user', JSON.stringify(adminUser));
                }
                loadData();
                return;
              }
            }
          } catch (e) {
            continue;
          }
        }

        // Method 3: Check MongoDB API directly
        console.log("📡 Checking MongoDB API for admin user...");
        try {
          const response = await fetch(`http://localhost:3000/users/admin@example.com`);
          if (response.ok) {
            const data = await response.json();
            
            if (data.success && data.user && data.user.role === "admin") {
              console.log("✅ Admin found in MongoDB:", data.user);
              setIsAdmin(true);
              setUserInfo(data.user);
              localStorage.setItem('user', JSON.stringify(data.user));
              loadData();
              return;
            }
          }
        } catch (error) {
          console.error("Error fetching from MongoDB:", error);
        }

        console.log("❌ No admin user found.");
        setIsAdmin(false);
        setLoading(false);

      } catch (error) {
        console.error("Error in checkAdminStatus:", error);
        setIsAdmin(false);
        setLoading(false);
      }
    };

    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchPendingIssues(), fetchRejectedIssues()]);
      } catch (error) {
        console.error("Error loading data:", error);
        showNotification("Failed to load data", "error");
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  // Fetch pending issues
  const fetchPendingIssues = async () => {
    try {
      const response = await fetch("http://localhost:3000/issues/pending");
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      console.log("Pending issues fetched:", data.issues?.length || 0);
      
      if (data.success) {
        setPendingIssues(data.issues || []);
      } else {
        throw new Error(data.message || "Failed to fetch pending issues");
      }
    } catch (error) {
      console.error("Error fetching pending issues:", error);
      showNotification("Failed to load pending issues", "error");
    }
  };

  // Fetch rejected issues
  const fetchRejectedIssues = async () => {
    try {
      const response = await fetch("http://localhost:3000/issues/rejected");
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      console.log("Rejected issues fetched:", data.issues?.length || 0);
      
      if (data.success) {
        setRejectedIssues(data.issues || []);
      } else {
        throw new Error(data.message || "Failed to fetch rejected issues");
      }
    } catch (error) {
      console.error("Error fetching rejected issues:", error);
      showNotification("Failed to load rejected issues", "error");
    }
  };

  // Refresh all data
  const refreshData = async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchPendingIssues(), fetchRejectedIssues()]);
      showNotification("Data refreshed successfully");
    } catch (error) {
      console.error("Error refreshing data:", error);
      showNotification("Failed to refresh data", "error");
    } finally {
      setRefreshing(false);
    }
  };

  // Get current user ID for API calls
  const getCurrentUserId = () => {
    if (userInfo && userInfo._id) return userInfo._id;
    if (userInfo && userInfo.id) return userInfo.id;
    if (userInfo && userInfo.email) return userInfo.email;
    
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user._id || user.id || user.email;
      } catch (e) {
        console.error("Error parsing user string:", e);
      }
    }
    
    return "admin@example.com";
  };

  // Open reject modal
  const openRejectModal = (issue) => {
    if (!isAdmin) {
      showNotification("Only administrators can reject issues", "error");
      return;
    }
    
    setSelectedIssue(issue);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  // Close reject modal
  const closeRejectModal = () => {
    setShowRejectModal(false);
    setSelectedIssue(null);
    setRejectionReason("");
  };

  // Reject issue - IMPROVED VERSION with event dispatching
  const handleReject = async () => {
    if (!selectedIssue || !rejectionReason.trim()) {
      showNotification("Please enter a rejection reason", "error");
      return;
    }

    const currentUserId = getCurrentUserId();
    console.log("Attempting to reject issue:", {
      issueId: selectedIssue._id,
      userId: currentUserId,
      reason: rejectionReason.trim()
    });

    setRejecting({ [selectedIssue._id]: true });

    try {
      const response = await fetch(`http://localhost:3000/issues/${selectedIssue._id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUserId,
          rejectionReason: rejectionReason.trim()
        }),
      });

      const data = await response.json();
      console.log("Rejection API response:", data);

      if (data.success) {
        showNotification("Issue rejected successfully! Refreshing data...");
        
        // First update local state immediately
        const updatedPending = pendingIssues.filter(issue => issue._id !== selectedIssue._id);
        const updatedRejected = [data.issue, ...rejectedIssues];
        
        setPendingIssues(updatedPending);
        setRejectedIssues(updatedRejected);
        
        // Dispatch custom event to notify AllIssues component
        const event = new CustomEvent('issue-rejected', { 
          detail: { 
            issueId: selectedIssue._id,
            issue: data.issue
          } 
        });
        window.dispatchEvent(event);
        console.log("✅ Dispatched issue-rejected event");
        
        // Then refresh from server to ensure sync
        setTimeout(() => {
          refreshData();
        }, 500);
        
        closeRejectModal();
      } else {
        showNotification(data.message || "Failed to reject issue", "error");
        console.error("Rejection failed:", data);
      }
    } catch (error) {
      console.error("Error rejecting issue:", error);
      showNotification("Error rejecting issue. Please check console.", "error");
    } finally {
      setRejecting({ [selectedIssue._id]: false });
    }
  };

  // Undo rejection - IMPROVED VERSION with event dispatching
  const handleUndoReject = async (issueId) => {
    if (!isAdmin) {
      showNotification("Only administrators can undo rejection", "error");
      return;
    }

    const currentUserId = getCurrentUserId();
    console.log("Attempting to undo rejection for issue:", issueId, "userId:", currentUserId);

    setRejecting({ [issueId]: true });

    try {
      const response = await fetch(`http://localhost:3000/issues/${issueId}/undo-reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: currentUserId }),
      });

      const data = await response.json();
      console.log("Undo rejection API response:", data);

      if (data.success) {
        showNotification("Rejection undone successfully! Refreshing data...");
        
        // First update local state
        const rejectedIssue = rejectedIssues.find(issue => issue._id === issueId);
        if (rejectedIssue) {
          const updatedRejected = rejectedIssues.filter(issue => issue._id !== issueId);
          const updatedPending = [data.issue, ...pendingIssues];
          
          setRejectedIssues(updatedRejected);
          setPendingIssues(updatedPending);
          
          // Dispatch custom event to notify AllIssues component
          const event = new CustomEvent('issue-updated', { 
            detail: { 
              issueId: issueId,
              issue: data.issue,
              action: 'undo-reject'
            } 
          });
          window.dispatchEvent(event);
          console.log("✅ Dispatched issue-updated event");
          
          // Then refresh from server
          setTimeout(() => {
            refreshData();
          }, 500);
        }
      } else {
        showNotification(data.message || "Failed to undo rejection", "error");
        console.error("Undo rejection failed:", data);
      }
    } catch (error) {
      console.error("Error undoing rejection:", error);
      showNotification("Error undoing rejection. Please check console.", "error");
    } finally {
      setRejecting({ [issueId]: false });
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "rejected": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Quick admin override
  const setTestAdmin = () => {
    const testUser = {
      _id: "693a84ce133ac9e6ad8b3c3e",
      email: "admin@example.com",
      role: "admin",
      displayName: "Admin Admin",
      uid: "9zethhSUqTY4ANJKSbiARdGoMUA3",
      createdAt: "2025-12-11T08:46:06.433Z"
    };
    
    localStorage.setItem('user', JSON.stringify(testUser));
    setIsAdmin(true);
    setUserInfo(testUser);
    
    // Load data
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchPendingIssues(), fetchRejectedIssues()]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
    
    showNotification("Admin mode activated", "success");
  };

  // Direct admin login
  const directAdminLogin = async () => {
    try {
      console.log("Attempting direct admin login...");
      const response = await fetch(`http://localhost:3000/users/admin@example.com`);
      const data = await response.json();
      
      if (data.success && data.user && data.user.role === "admin") {
        const adminUser = data.user;
        
        localStorage.setItem('user', JSON.stringify(adminUser));
        setIsAdmin(true);
        setUserInfo(adminUser);
        
        // Load data
        setLoading(true);
        try {
          await Promise.all([fetchPendingIssues(), fetchRejectedIssues()]);
        } finally {
          setLoading(false);
        }
        
        showNotification(`Logged in as ${adminUser.displayName} (Admin)`, "success");
      } else {
        showNotification("Admin user not found or not an admin", "error");
      }
    } catch (error) {
      console.error("Direct login error:", error);
      showNotification("Error connecting to database", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 ${
          notification.type === "success" 
            ? "bg-green-100 text-green-800 border border-green-300" 
            : "bg-red-100 text-red-800 border border-red-300"
        }`}>
          {notification.type === "success" ? (
            <FaCheckCircle className="text-green-600" />
          ) : (
            <FaExclamationCircle className="text-red-600" />
          )}
          <span>{notification.message}</span>
          <button 
            onClick={() => setNotification(null)}
            className="ml-2 text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4">
        {/* Debug Info & Admin Controls */}
        <div className="mb-6 bg-white p-4 rounded-xl shadow border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isAdmin ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}>
                  {isAdmin ? "✅ ADMIN" : "❌ NOT ADMIN"}
                </span>
                <span className="text-sm text-gray-600">
                  {userInfo?.email || "No user logged in"}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Pending: {pendingIssues.length} | Rejected: {rejectedIssues.length}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {refreshing ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaSync />
                )}
                Refresh Data
              </button>
              
              {!isAdmin && (
                <>
                  <button
                    onClick={directAdminLogin}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  >
                    🔑 Login as Admin
                  </button>
                  
                  <button
                    onClick={setTestAdmin}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm"
                  >
                    ⚠️ Test Admin
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <FaBan className="text-3xl text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Issue Rejection Management</h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Review pending issues and reject invalid or duplicate reports.
          </p>
          
          {!isAdmin && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg inline-block">
              <div className="flex items-center gap-2 text-yellow-800">
                <FaExclamationTriangle />
                <span>Admin access required to view and manage issues.</span>
              </div>
            </div>
          )}
        </div>

        {/* Only show content if user is admin */}
        {isAdmin ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-lg border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Pending Issues</p>
                    <p className="text-3xl font-bold text-yellow-600">{pendingIssues.length}</p>
                    <p className="text-sm text-gray-500 mt-1">Awaiting review</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-lg">
                    <FaClock className="text-2xl text-yellow-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Rejected Issues</p>
                    <p className="text-3xl font-bold text-red-600">{rejectedIssues.length}</p>
                    <p className="text-sm text-gray-500 mt-1">Removed from public view</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <FaBan className="text-2xl text-red-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Admin Actions</p>
                    <p className="text-2xl font-bold text-blue-600">Reject/Undo</p>
                    <p className="text-sm text-gray-500 mt-1">Manage issue status</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FaExclamationTriangle className="text-2xl text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-8">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab("pending")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "pending"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FaClock className="w-4 h-4" />
                      Pending Issues ({pendingIssues.length})
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab("rejected")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "rejected"
                        ? "border-red-500 text-red-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FaBan className="w-4 h-4" />
                      Rejected Issues ({rejectedIssues.length})
                    </div>
                  </button>
                </nav>
              </div>
            </div>

            {/* Pending Issues Tab */}
            {activeTab === "pending" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Pending Issues</h2>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Click "Reject Issue" to remove from public view</span>
                  </div>
                </div>

                {pendingIssues.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
                    <FaCheck className="text-5xl text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Pending Issues</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      All pending issues have been processed. Great work!
                    </p>
                    <button
                      onClick={refreshData}
                      className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                    >
                      Refresh Data
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {pendingIssues.map((issue) => (
                      <div
                        key={issue._id}
                        className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
                      >
                        <div className="p-6">
                          {/* Issue Header */}
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                                {issue.title || "Untitled Issue"}
                              </h3>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                                  {issue.status || "Pending"}
                                </span>
                                {issue.priority === "high" && (
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    High Priority
                                  </span>
                                )}
                              </div>
                            </div>
                            <NavLink to={`/issues/${issue._id}`} target="_blank">
                              <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                <FaEye className="w-5 h-5" />
                              </button>
                            </NavLink>
                          </div>

                          {/* Issue Details */}
                          <div className="space-y-3 mb-4">
                            <div className="flex items-center text-gray-600">
                              <FaMapMarkerAlt className="w-4 h-4 mr-2 flex-shrink-0" />
                              <span className="text-sm truncate">{issue.location || "No location"}</span>
                            </div>
                            
                            <div className="flex items-center text-gray-600">
                              <FaUser className="w-4 h-4 mr-2 flex-shrink-0" />
                              <span className="text-sm">Reported by: {issue.reportedBy || "Anonymous"}</span>
                            </div>
                            
                            <div className="flex items-center text-gray-600">
                              <FaCalendarAlt className="w-4 h-4 mr-2 flex-shrink-0" />
                              <span className="text-sm">{formatDate(issue.reportedAt)}</span>
                            </div>
                          </div>

                          {/* Description Preview */}
                          <div className="mb-4">
                            <p className="text-gray-700 text-sm line-clamp-2">
                              {issue.description || "No description provided"}
                            </p>
                          </div>

                          {/* Reject Button */}
                          <button
                            onClick={() => openRejectModal(issue)}
                            disabled={rejecting[issue._id]}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                          >
                            {rejecting[issue._id] ? (
                              <>
                                <FaSpinner className="animate-spin" /> Processing...
                              </>
                            ) : (
                              <>
                                <FaBan /> Reject Issue
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Rejected Issues Tab */}
            {activeTab === "rejected" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Rejected Issues</h2>
                  <div className="text-sm text-gray-600">
                    Click "Undo Rejection" to move back to pending
                  </div>
                </div>

                {rejectedIssues.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
                    <FaCheck className="text-5xl text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Rejected Issues</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                      No issues have been rejected yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {rejectedIssues.map((issue) => (
                      <div
                        key={issue._id}
                        className="bg-white rounded-xl shadow-lg border border-red-200 overflow-hidden hover:shadow-xl transition-shadow"
                      >
                        <div className="p-6">
                          {/* Issue Header */}
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                                {issue.title || "Untitled Issue"}
                              </h3>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  Rejected
                                </span>
                                {issue.rejectedAt && (
                                  <span className="text-xs text-gray-500">
                                    Rejected on: {formatDate(issue.rejectedAt)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <NavLink to={`/issues/${issue._id}`} target="_blank">
                              <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                <FaEye className="w-5 h-5" />
                              </button>
                            </NavLink>
                          </div>

                          {/* Rejection Details */}
                          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start gap-3">
                              <FaExclamationTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <h4 className="font-semibold text-red-800 mb-1">Rejection Reason</h4>
                                <p className="text-red-700">{issue.rejectionReason || "No reason provided"}</p>
                                {issue.rejectedBy && (
                                  <p className="text-sm text-red-600 mt-2">
                                    Rejected by: {issue.rejectedBy}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Issue Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <div className="flex items-center text-gray-600">
                                <FaMapMarkerAlt className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span className="text-sm">{issue.location || "No location"}</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <FaUser className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span className="text-sm">Reported by: {issue.reportedBy || "Anonymous"}</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center text-gray-600">
                                <FaCalendarAlt className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span className="text-sm">Reported: {formatDate(issue.reportedAt)}</span>
                              </div>
                              {issue.category && (
                                <div className="text-sm text-gray-600">
                                  Category: {issue.category}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleUndoReject(issue._id)}
                              disabled={rejecting[issue._id]}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                            >
                              {rejecting[issue._id] ? (
                                <>
                                  <FaSpinner className="animate-spin" /> Processing...
                                </>
                              ) : (
                                <>
                                  <FaUndo /> Undo Rejection
                                </>
                              )}
                            </button>
                            
                            <NavLink to={`/issues/${issue._id}`} target="_blank" className="flex-1">
                              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors shadow-md hover:shadow-lg">
                                <FaEye /> View Details
                              </button>
                            </NavLink>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          /* Show admin login prompt for non-admin users */
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <FaExclamationTriangle className="text-5xl text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Access Required</h2>
              <p className="text-gray-600 mb-6">
                This page requires administrator privileges.
              </p>
              
              <div className="space-y-4">
                <button
                  onClick={directAdminLogin}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  🔑 Login as admin@example.com
                </button>
                
                <button
                  onClick={setTestAdmin}
                  className="w-full px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm"
                >
                  ⚠️ Set Test Admin (Development Only)
                </button>
                
                <div className="pt-4">
                  <NavLink
                    to="/dashboard"
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors inline-block"
                  >
                    ← Back to Dashboard
                  </NavLink>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Reject Issue</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Provide a reason for rejecting this issue
                </p>
              </div>
              <button
                onClick={closeRejectModal}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* Issue Preview */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">{selectedIssue.title}</h4>
              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                {selectedIssue.description || "No description"}
              </p>
              <div className="flex items-center text-sm text-gray-500">
                <FaUser className="w-3 h-3 mr-1" />
                <span>Reported by: {selectedIssue.reportedBy || "Anonymous"}</span>
              </div>
            </div>

            {/* Rejection Reason Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this issue is being rejected (e.g., duplicate, invalid, resolved elsewhere)..."
                rows="4"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                autoFocus
              />
              <p className="text-sm text-gray-500 mt-2">
                This reason will be recorded in the issue history.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={closeRejectModal}
                disabled={rejecting[selectedIssue._id]}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={rejecting[selectedIssue._id] || !rejectionReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                {rejecting[selectedIssue._id] ? (
                  <>
                    <FaSpinner className="animate-spin" /> Rejecting...
                  </>
                ) : (
                  <>
                    <FaBan /> Confirm Reject
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RejectIssue;