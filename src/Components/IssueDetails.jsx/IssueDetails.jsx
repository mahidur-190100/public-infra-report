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
  FaSpinner,
  FaRocket,
  FaBolt,
  FaCrown,
  FaFire,
  FaCreditCard,
  FaLock,
  FaCcVisa,
  FaCcMastercard,
  FaCcAmex,
  FaCcDiscover,
  FaGem
} from "react-icons/fa";
import toast, { Toaster } from "react-hot-toast";

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
          id: user.id || user.email,
          isPremium: user.isPremium || false
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
        id: userId,
        isPremium: false
      };
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  };

  const currentUser = getCurrentUser();
  const currentUserId = currentUser?.id || '';
  const currentUserRole = currentUser?.role || 'user';
  const currentUserEmail = currentUser?.email || '';
  const isUserPremium = currentUser?.isPremium || false;
  
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
  
  // Boost states
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [boostProcessing, setBoostProcessing] = useState(false);
  const [boostPaymentMethod, setBoostPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState(currentUser?.displayName || '');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [saveCard, setSaveCard] = useState(false);
  const [boostAmount, setBoostAmount] = useState(100); // ₹100 for boost

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
          
          toast.success(data.hasUpvoted ? "Issue upvoted!" : "Upvote removed");
        } else {
          setCanUpvote(false);
          setUpvoteMessage(data.message || "Cannot upvote this issue");
          toast.error(data.message || "Cannot upvote this issue");
        }
      } else {
        toast.error(data.message || "Upvote failed");
      }
    } catch (error) {
      console.error("Error upvoting:", error);
      toast.error("Error upvoting. Please try again.");
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
      toast.error("Please fill in all required fields");
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

      const response = await fetch(`http://localhost:3000/issues/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      
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
        toast.success("Issue updated successfully!");
        
        // Re-check permissions
        checkPermissions();
      } else {
        toast.error(data.message || "Failed to update issue");
      }
    } catch (error) {
      console.error("Error updating issue:", error);
      toast.error("Error updating issue. Please try again.");
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
        toast.success("Issue deleted successfully!");
        navigate("/issues");
      } else {
        toast.error(data.message || "Failed to delete issue");
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      console.error("Error deleting issue:", error);
      toast.error("Error deleting issue. Please try again.");
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Boost functions
  const openBoostModal = () => {
    if (!currentUserEmail) {
      toast.error("Please login to boost issues");
      return;
    }
    setShowBoostModal(true);
  };

  const closeBoostModal = () => {
    setShowBoostModal(false);
    setCardNumber('');
    setExpiryDate('');
    setCvc('');
    setBoostProcessing(false);
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
  };

  const handleExpiryDateChange = (e) => {
    const formatted = formatExpiryDate(e.target.value);
    setExpiryDate(formatted);
  };

  const handleCvcChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 3);
    setCvc(value);
  };

  const processBoostPayment = async () => {
    if (!cardNumber || !cardName || !expiryDate || !cvc) {
      toast.error("Please fill in all card details");
      return;
    }

    if (cardNumber.replace(/\s/g, '').length !== 16) {
      toast.error("Please enter a valid 16-digit card number");
      return;
    }

    if (expiryDate.length !== 5) {
      toast.error("Please enter a valid expiry date (MM/YY)");
      return;
    }

    if (cvc.length !== 3) {
      toast.error("Please enter a valid 3-digit CVC");
      return;
    }

    setBoostProcessing(true);

    try {
      // Create boost payment record
      const boostPaymentData = {
        issueId: id,
        issueTitle: issue.title,
        userEmail: currentUserEmail,
        userName: currentUser?.displayName || currentUserEmail.split('@')[0],
        userId: currentUserId,
        amount: boostAmount,
        currency: "INR",
        paymentMethod: boostPaymentMethod === 'card' ? 'Card' : 'UPI',
        cardLastFour: cardNumber.slice(-4),
        status: "completed",
        boostType: "priority_boost",
        oldPriority: issue.priority || "normal",
        newPriority: "high",
        paymentDate: new Date().toISOString()
      };

      // Save boost payment to MongoDB
      const boostResponse = await fetch('http://localhost:3000/boost-payment', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(boostPaymentData),
      });

      const boostData = await boostResponse.json();

      if (boostData.success) {
        // Update issue priority to high
        const updateResponse = await fetch(`http://localhost:3000/issues/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            priority: "high",
            userId: currentUserId,
            updateType: "priority_boost"
          }),
        });

        const updateData = await updateResponse.json();

        if (updateData.success) {
          // Update local issue state
          setIssue(prev => ({
            ...prev,
            priority: "high",
            updatedAt: new Date().toISOString()
          }));

          // Show success toast
          toast.success(
            <div>
              <div className="font-bold">🎉 Boost Successful!</div>
              <div>Issue priority upgraded from <span className="font-semibold">Normal</span> to <span className="font-semibold text-red-600">High</span></div>
              <div className="text-sm text-gray-600 mt-1">Transaction ID: {boostData.transactionId}</div>
            </div>,
            {
              duration: 5000,
              icon: '🚀'
            }
          );

          // Close modal
          closeBoostModal();
        } else {
          toast.error("Failed to update issue priority");
        }
      } else {
        toast.error("Boost payment failed: " + (boostData.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Boost payment error:", error);
      toast.error("Boost payment failed. Please try again.");
    } finally {
      setBoostProcessing(false);
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
    
    if (priorityText.toLowerCase() === "high") {
      return (
        <div className="flex items-center gap-1">
          <FaFire className="text-red-500" />
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <FaExclamationTriangle className="mr-1" /> High Priority
          </span>
        </div>
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

  // Check if user can boost this issue
  const canBoost = currentUserEmail && 
                  permissions.isReporter && 
                  priority !== "high" && 
                  status?.toLowerCase() !== "resolved";

  return (
    <div className="min-h-screen py-8">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 5000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <div className="max-w-6xl mx-auto px-4">
        {/* Edit/Delete Actions Bar */}
        {!loadingPermissions && (permissions.canEdit || permissions.canDelete || canBoost) && (
          <div className="mb-6 p-4 bg-white rounded-xl shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-gray-900">Issue Actions</h3>
                <p className="text-sm text-gray-600">
                  {permissions.userRole === "admin" && "Administrator - Full access"}
                  {permissions.userRole === "staff" && "Staff - Can update status"}
                  {permissions.userRole === "user" && permissions.isReporter && "Issue Owner - Can edit, delete and boost"}
                  {permissions.userRole === "user" && !permissions.isReporter && "Regular User - Limited access"}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {/* Boost Button */}
                {canBoost && (
                  <button
                    onClick={openBoostModal}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 transition-colors"
                  >
                    <FaRocket />
                    Boost Issue (₹100)
                  </button>
                )}
                
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
            
            {/* Priority Badge on Image */}
            <div className="absolute top-4 right-4">
              {getPriorityBadge()}
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
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                      {title || "Untitled Issue"}
                    </h1>
                    
                    {/* Boost Info */}
                    {priority === "high" && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full">
                        <FaRocket className="w-4 h-4" />
                        <span className="text-sm font-medium">Boosted</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {getStatusBadge()}
                    {!isEditing && getPriorityBadge()}
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

      {/* Boost Payment Modal */}
      {showBoostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Boost Issue Priority</h3>
                <button
                  onClick={closeBoostModal}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={boostProcessing}
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              {/* Boost Details */}
              <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
                    <FaRocket className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Priority Boost</h4>
                    <p className="text-sm text-gray-600">Get faster attention for your issue</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Current Priority:</span>
                    <span className="font-medium">Normal</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">New Priority:</span>
                    <span className="font-bold text-red-600">High Priority</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-orange-200">
                    <span className="text-gray-700">Boost Cost:</span>
                    <span className="text-xl font-bold text-gray-900">₹{boostAmount}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">Select Payment Method</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setBoostPaymentMethod('card')}
                    className={`p-3 border rounded-lg flex flex-col items-center justify-center transition-all ${boostPaymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                  >
                    <FaCreditCard className="w-6 h-6 text-gray-600 mb-2" />
                    <span className="text-sm font-medium">Credit/Debit Card</span>
                  </button>
                  <button
                    onClick={() => setBoostPaymentMethod('upi')}
                    className={`p-3 border rounded-lg flex flex-col items-center justify-center transition-all ${boostPaymentMethod === 'upi' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                  >
                    <span className="text-2xl mb-2">📱</span>
                    <span className="text-sm font-medium">UPI</span>
                  </button>
                </div>
              </div>

              {/* Card Payment Form */}
              {boostPaymentMethod === 'card' && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Card Details</h4>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div className="absolute left-3 top-3">
                          <FaCreditCard className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name on Card
                      </label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          value={expiryDate}
                          onChange={handleExpiryDateChange}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVC
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={cvc}
                            onChange={handleCvcChange}
                            placeholder="123"
                            maxLength={3}
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <div className="absolute right-3 top-3">
                            <FaLock className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="saveCardBoost"
                        checked={saveCard}
                        onChange={(e) => setSaveCard(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="saveCardBoost" className="ml-2 text-sm text-gray-600">
                        Save this card for future payments
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* UPI Payment */}
              {boostPaymentMethod === 'upi' && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-gray-600 mb-4">Scan UPI QR code or enter UPI ID</p>
                  <div className="p-4 bg-white border border-gray-300 rounded-lg inline-block">
                    {/* Mock QR Code */}
                    <div className="w-48 h-48 bg-gray-200 flex items-center justify-center rounded">
                      <div className="text-center">
                        <div className="text-4xl mb-2">📱</div>
                        <p className="text-sm text-gray-600">UPI QR Code</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-4">Amount: ₹{boostAmount}</p>
                </div>
              )}

              {/* Security Note */}
              <div className="mb-6 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <FaLock className="w-4 h-4 text-blue-500 mt-1 mr-2" />
                  <p className="text-sm text-blue-700">
                    Your payment is secure and encrypted. We never store your full card details.
                  </p>
                </div>
              </div>

              {/* Benefits of Boost */}
              <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">🚀 Benefits of Boosting:</h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Issue gets marked as High Priority</li>
                  <li>• 3x faster response time</li>
                  <li>• Priority assignment to staff</li>
                  <li>• Increased visibility on platform</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={processBoostPayment}
                  disabled={boostProcessing}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold flex items-center justify-center gap-2"
                >
                  {boostProcessing ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Processing Boost...
                    </>
                  ) : (
                    <>
                      <FaRocket />
                      Boost Issue for ₹{boostAmount}
                    </>
                  )}
                </button>
                <button
                  onClick={closeBoostModal}
                  disabled={boostProcessing}
                  className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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