import React, { useState, useEffect } from "react";
import { useLoaderData, useParams, useNavigate } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaUser,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaThumbsUp,
  FaRoad,
  FaLightbulb,
  FaWater,
  FaTrashAlt,
  FaWalking,
  FaTrafficLight,
  FaTint,
  FaChair,
  FaTasks,
  FaBuilding,
  FaUserTie,
  FaEnvelope,
  FaEdit,
  FaTrash,
  FaBan,
  FaInfoCircle,
  FaSave,
  FaTimes,
  FaSpinner
} from "react-icons/fa";

const IssueDetails = () => {
  const initialData = useLoaderData();
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Get current user info
  const getCurrentUser = () => {
    try {
      // Try to get user from localStorage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return {
          email: user.email,
          role: user.role || "user",
          displayName: user.displayName,
          id: user.id || user.email
        };
      }
      
      // Fallback to the old userId system
      let userId = localStorage.getItem("userId");
      if (!userId) {
        userId = "user_" + Date.now() + Math.random().toString(36).substr(2, 9);
        localStorage.setItem("userId", userId);
      }
      
      return {
        email: userId.includes('@') ? userId : `${userId}@demo.com`,
        role: "user",
        displayName: "Demo User",
        id: userId
      };
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  };

  const currentUser = getCurrentUser();
  const currentUserId = currentUser?.id || '';
  const currentUserRole = currentUser?.role || 'user';
  
  const [issue, setIssue] = useState(initialData?.data || initialData);
  const [upvotes, setUpvotes] = useState(issue?.upvotes || 0);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [canUpvote, setCanUpvote] = useState(true);
  const [upvoteMessage, setUpvoteMessage] = useState("");
  
  // Edit/Delete states
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [permissions, setPermissions] = useState({
    canEdit: false,
    canDelete: false,
    canUpdateStatus: false,
    canAssign: false,
    isReporter: false,
    userRole: "user"
  });
  const [loadingPermissions, setLoadingPermissions] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Initialize
  useEffect(() => {
    if (issue?.upvotedBy && currentUserId) {
      setHasUpvoted(issue.upvotedBy.includes(currentUserId));
    }
    setUpvotes(issue?.upvotes || 0);
    
    // Check permissions
    checkPermissions();
  }, [issue, currentUserId]);

  // Check user permissions
  const checkPermissions = async () => {
    if (!currentUserId) {
      setLoadingPermissions(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/issues/${id}/check-permissions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: currentUserId }),
      });

      const data = await response.json();
      
      if (data.success) {
        setPermissions(data.permissions);
        
        // Also check upvote permissions
        checkUpvotePermissions();
      }
    } catch (error) {
      console.error("Error checking permissions:", error);
    } finally {
      setLoadingPermissions(false);
    }
  };

  const checkUpvotePermissions = async () => {
    try {
      const response = await fetch(`http://localhost:3000/issues/${id}/can-upvote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: currentUserId }),
      });

      const data = await response.json();
      
      if (data.success) {
        setCanUpvote(data.canUpvote);
        setUpvoteMessage(data.message || "");
        setHasUpvoted(data.hasUpvoted || false);
      }
    } catch (error) {
      console.error("Error checking upvote permissions:", error);
    }
  };

  const handleUpvote = async () => {
    if (isUpvoting || !canUpvote) return;

    setIsUpvoting(true);

    try {
      const response = await fetch(`http://localhost:3000/issues/${id}/upvote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: currentUserId }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.canUpvote) {
          setUpvotes(data.upvotes);
          setHasUpvoted(data.hasUpvoted);
          
          // Update the issue data
          setIssue(prev => ({
            ...prev,
            upvotes: data.upvotes,
            upvotedBy: data.hasUpvoted 
              ? [...(prev.upvotedBy || []), currentUserId]
              : (prev.upvotedBy || []).filter(id => id !== currentUserId)
          }));
        } else {
          setCanUpvote(false);
          setUpvoteMessage(data.message || "Cannot upvote this issue");
        }
      } else {
        console.error("Upvote failed:", data.message);
      }
    } catch (error) {
      console.error("Error upvoting:", error);
    } finally {
      setIsUpvoting(false);
    }
  };

  // Edit functions
  const startEditing = () => {
    setEditForm({
      title: issue.title || "",
      description: issue.description || "",
      category: issue.category || "",
      location: issue.location || "",
      priority: issue.priority || "normal"
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditForm({});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveEdit = async () => {
    if (!editForm.title || !editForm.description || !editForm.category || !editForm.location) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    try {
      // Prepare updates with user ID for permission check
      const updates = {
        ...editForm,
        userId: currentUserId,
        updateType: "user_edit"
      };

      console.log("Sending updates:", updates);

      const response = await fetch(`http://localhost:3000/issues/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      console.log("Update response:", data);
      
      if (data.success) {
        if (data.data) {
          setIssue(data.data);
        } else {
          // Fetch fresh data if not returned
          const updatedResponse = await fetch(`http://localhost:3000/issues/${id}`);
          const updatedData = await updatedResponse.json();
          if (updatedData.success) {
            setIssue(updatedData.data || updatedData);
          }
        }
        
        setIsEditing(false);
        setEditForm({});
        alert("Issue updated successfully!");
        
        // Re-check permissions
        checkPermissions();
      } else {
        alert(data.message || "Failed to update issue");
      }
    } catch (error) {
      console.error("Error updating issue:", error);
      alert("Error updating issue. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete functions
  const confirmDelete = () => {
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const deleteIssue = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`http://localhost:3000/issues/${id}/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: currentUserId }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert("Issue deleted successfully!");
        navigate("/issues");
      } else {
        alert(data.message || "Failed to delete issue");
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      console.error("Error deleting issue:", error);
      alert("Error deleting issue. Please try again.");
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Function to safely get assigned staff details
  const getAssignedStaffInfo = () => {
    if (!issue?.assignedTo) return null;
    
    if (typeof issue.assignedTo === 'string') {
      return {
        name: issue.assignedTo,
        department: 'Not specified',
        email: null
      };
    }
    
    if (typeof issue.assignedTo === 'object' && issue.assignedTo !== null) {
      return {
        name: issue.assignedTo.name || issue.assignedTo.displayName || 'Staff Member',
        department: issue.assignedTo.department || 'Not specified',
        email: issue.assignedTo.email || null,
        role: issue.assignedTo.role || 'staff'
      };
    }
    
    return null;
  };

  if (!issue) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            No Data Found
          </h1>
          <p className="text-gray-600">The issue details could not be loaded.</p>
        </div>
      </div>
    );
  }

  const {
    title,
    description,
    category,
    status,
    priority,
    location,
    image,
    reportedBy,
    reportedAt,
    progress,
    resolvedAt,
    latitude,
    longitude,
  } = issue;

  // Get staff info
  const staffInfo = getAssignedStaffInfo();

  // Get status badge
  const getStatusBadge = () => {
    const baseClasses =
      "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium";

    const statusText = status || 'Pending';
    
    switch (statusText.toLowerCase()) {
      case "pending":
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
            <FaClock className="mr-1" /> Pending
          </span>
        );
      case "in progress":
      case "in-progress":
        return (
          <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
            <FaTasks className="mr-1" /> In Progress
          </span>
        );
      case "resolved":
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            <FaCheckCircle className="mr-1" /> Resolved
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
            {statusText}
          </span>
        );
    }
  };

  // Get priority badge
  const getPriorityBadge = () => {
    const priorityText = priority || 'Normal';
    
    if (priorityText.toLowerCase() === "high" || priorityText.toLowerCase() === "critical") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
          <FaExclamationTriangle className="mr-1" /> High Priority
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
        Normal Priority
      </span>
    );
  };

  // Get category icon
  const getCategoryIcon = () => {
    const categoryText = category || 'General';
    
    switch (categoryText.toLowerCase()) {
      case "road damage":
      case "roads":
        return <FaRoad className="w-6 h-6" />;
      case "public lighting":
      case "lighting":
        return <FaLightbulb className="w-6 h-6" />;
      case "water supply":
      case "water":
        return <FaWater className="w-6 h-6" />;
      case "sanitation":
      case "garbage":
        return <FaTrashAlt className="w-6 h-6" />;
      case "footpath repair":
      case "footpath":
        return <FaWalking className="w-6 h-6" />;
      case "traffic signals":
      case "traffic":
        return <FaTrafficLight className="w-6 h-6" />;
      case "drainage":
        return <FaTint className="w-6 h-6" />;
      case "public furniture":
      case "furniture":
        return <FaChair className="w-6 h-6" />;
      default:
        return <FaRoad className="w-6 h-6" />;
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Category options
  const categoryOptions = [
    "Road Damage",
    "Public Lighting",
    "Water Supply",
    "Sanitation",
    "Footpath Repair",
    "Traffic Signals",
    "Drainage",
    "Public Furniture"
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Edit/Delete Actions Bar */}
        {!loadingPermissions && (permissions.canEdit || permissions.canDelete) && (
          <div className="mb-6 p-4 bg-white rounded-xl shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-gray-900">Issue Actions</h3>
                <p className="text-sm text-gray-600">
                  {permissions.userRole === "admin" && "Administrator - Full access"}
                  {permissions.userRole === "staff" && "Staff - Can update status"}
                  {permissions.userRole === "user" && permissions.isReporter && "Issue Owner - Can edit and delete"}
                  {permissions.userRole === "user" && !permissions.isReporter && "Regular User - Limited access"}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {permissions.canEdit && !isEditing && (
                  <button
                    onClick={startEditing}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FaEdit /> Edit Issue
                  </button>
                )}
                
                {permissions.canDelete && (
                  <button
                    onClick={confirmDelete}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <FaTrash /> Delete Issue
                  </button>
                )}
                
                {isEditing && (
                  <button
                    onClick={cancelEditing}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <FaTimes /> Cancel Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Image Section */}
          <div className="relative h-64 md:h-80">
            <img 
              src={image || "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800"} 
              alt={title} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute top-4 left-4 bg-white/90 p-3 rounded-lg">
              {getCategoryIcon()}
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 md:p-8">
            {/* Title and Badges */}
            <div className="mb-6">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    name="title"
                    value={editForm.title}
                    onChange={handleEditChange}
                    className="w-full text-2xl md:text-3xl font-bold text-gray-900 p-2 border border-gray-300 rounded-lg"
                    placeholder="Issue Title"
                  />
                  <div className="flex flex-wrap gap-2">
                    <select
                      name="priority"
                      value={editForm.priority}
                      onChange={handleEditChange}
                      className="px-3 py-1 rounded-full text-sm font-medium border border-gray-300"
                    >
                      <option value="normal">Normal Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                    {title || "Untitled Issue"}
                  </h1>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {getStatusBadge()}
                    {getPriorityBadge()}
                  </div>
                </>
              )}
            </div>

            {/* Progress Bar */}
            {(status === "In-Progress" || status === "in progress" || status === "in-progress") && progress !== undefined && (
              <div className="mb-6 p-4 border rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-gray-900">Progress</span>
                  <span className="text-blue-600 font-bold">{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Upvote Button */}
            <div className="mb-8">
              <button
                onClick={handleUpvote}
                disabled={isUpvoting || !canUpvote}
                className={`flex items-center gap-4 px-6 py-4 rounded-xl transition-all duration-300 ${
                  hasUpvoted && canUpvote
                    ? "bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 shadow-lg"
                    : !canUpvote
                    ? "bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 cursor-not-allowed"
                    : "bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 hover:border-blue-300 hover:shadow-lg"
                } ${isUpvoting ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {!canUpvote ? (
                  <>
                    <FaBan className="w-8 h-8 text-gray-400" />
                    <div className="text-left">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900">
                          {upvotes}
                        </span>
                        <span className="text-gray-600">Upvotes</span>
                      </div>
                      <span className="text-sm font-medium text-gray-500">
                        {upvoteMessage || "Cannot upvote this issue"}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <FaThumbsUp
                      className={`w-8 h-8 transition-all ${
                        hasUpvoted
                          ? "text-blue-600 transform scale-110"
                          : "text-gray-500"
                      }`}
                    />
                    <div className="text-left">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900">
                          {upvotes}
                        </span>
                        <span className="text-gray-600">Upvotes</span>
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          hasUpvoted ? "text-blue-600" : "text-gray-500"
                        }`}
                      >
                        {hasUpvoted
                          ? "✓ You've upvoted this issue"
                          : "Click to upvote this issue"}
                      </span>
                    </div>
                  </>
                )}
              </button>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="flex items-start">
                  <FaMapMarkerAlt className="w-5 h-5 text-gray-500 mt-1 mr-3 flex-shrink-0" />
                  <div className="flex-grow">
                    <h3 className="font-semibold text-gray-900 mb-1">Location</h3>
                    {isEditing ? (
                      <input
                        type="text"
                        name="location"
                        value={editForm.location}
                        onChange={handleEditChange}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        placeholder="Enter location"
                      />
                    ) : (
                      <>
                        <p className="text-gray-700">{location || "Location not specified"}</p>
                        {latitude && longitude && (
                          <p className="text-sm text-gray-500 mt-1">
                            Coordinates: {latitude.toFixed(4)}, {longitude.toFixed(4)}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-start">
                  <FaUser className="w-5 h-5 text-gray-500 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Reported By</h3>
                    <p className="text-gray-700">{reportedBy || "Anonymous"}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <FaCalendarAlt className="w-5 h-5 text-gray-500 mt-1 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Reported On</h3>
                    <p className="text-gray-700">{formatDate(reportedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Assigned Staff */}
                {staffInfo ? (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-start mb-3">
                      <FaUserTie className="w-5 h-5 text-blue-500 mt-1 mr-3 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Assigned Staff</h3>
                        <p className="text-gray-700 font-medium">{staffInfo.name}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ml-8">
                      <div className="flex items-center">
                        <FaBuilding className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-600">
                          {staffInfo.department}
                        </span>
                      </div>
                      
                      {staffInfo.email && (
                        <div className="flex items-center">
                          <FaEnvelope className="w-4 h-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-600 truncate">
                            {staffInfo.email}
                          </span>
                        </div>
                      )}
                      
                      {staffInfo.role && (
                        <div className="sm:col-span-2">
                          <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                            {staffInfo.role}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start">
                    <FaBuilding className="w-5 h-5 text-gray-400 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Assigned Department</h3>
                      <p className="text-gray-700 text-italic">Not assigned yet</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start">
                  <div className="w-5 h-5 text-gray-500 mt-1 mr-3 flex-shrink-0 flex items-center justify-center">
                    {getCategoryIcon()}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold text-gray-900">Category</h3>
                    {isEditing ? (
                      <select
                        name="category"
                        value={editForm.category}
                        onChange={handleEditChange}
                        className="w-full p-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Select Category</option>
                        {categoryOptions.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-700">{category || "Uncategorized"}</p>
                    )}
                  </div>
                </div>

                {/* Resolved date */}
                {resolvedAt && (
                  <div className="flex items-start">
                    <FaCheckCircle className="w-5 h-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Resolved On</h3>
                      <p className="text-gray-700">{formatDate(resolvedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
              {isEditing ? (
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  rows="6"
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe the issue in detail..."
                />
              ) : (
                <div className="p-5 border rounded-lg">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {description || "No description provided"}
                  </p>
                </div>
              )}
            </div>

            {/* Edit Action Buttons */}
            {isEditing && (
              <div className="flex justify-end gap-4 mb-8">
                <button
                  onClick={cancelEditing}
                  disabled={isSaving}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <FaTimes /> Cancel
                </button>
                <button
                  onClick={saveEdit}
                  disabled={isSaving}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <FaSpinner className="animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <FaSave /> Save Changes
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Info Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <FaThumbsUp className="text-blue-600" />
                <span className="font-bold text-gray-900">
                  Current Upvotes: {upvotes}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Issue ID: <span className="font-mono">{id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this issue? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={cancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteIssue}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <FaSpinner className="animate-spin" /> Deleting...
                  </>
                ) : (
                  <>
                    <FaTrash /> Delete Issue
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

export default IssueDetails;