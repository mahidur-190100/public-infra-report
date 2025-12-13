import React, { useState } from "react";
import {
  FaThumbsUp,
  FaMapMarkerAlt,
  FaUser,
  FaCalendarAlt,
  FaEye,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaRoad,
  FaLightbulb,
  FaWater,
  FaTrashAlt,
  FaWalking,
  FaTrafficLight,
  FaTint,
  FaChair,
  FaTasks,
  FaUserTie // Added for staff icon
} from "react-icons/fa";
import { NavLink } from "react-router-dom";

const IssueCard = ({ issue }) => {
  const {
    _id,
    title,
    category,
    status,
    priority,
    image,
    location,
    reportedBy,
    reportedAt,
    assignedTo,
    progress,
    upvotes: initialUpvotes,
    upvotedBy: initialUpvotedBy = [],
  } = issue;

  // Get or create user ID (for demo purposes)
  const getUserId = () => {
    let userId = localStorage.getItem("userId");
    if (!userId) {
      userId = "user_" + Date.now() + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("userId", userId);
    }
    return userId;
  };

  const [upvotes, setUpvotes] = useState(initialUpvotes || 0);
  const [hasUpvoted, setHasUpvoted] = useState(
    initialUpvotedBy.includes(getUserId())
  );
  const [isUpvoting, setIsUpvoting] = useState(false);

  const handleUpvote = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isUpvoting) return;

    setIsUpvoting(true);
    const userId = getUserId();

    try {
      const response = await fetch(
        `http://localhost:3000/issues/${_id}/upvote`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setUpvotes(data.upvotes);
        setHasUpvoted(data.hasUpvoted);
      } else {
        console.error("Upvote failed:", data.message);
      }
    } catch (error) {
      console.error("Error upvoting:", error);
    } finally {
      setIsUpvoting(false);
    }
  };

  // Function to safely get assigned staff name
  const getAssignedStaffName = () => {
    if (!assignedTo) return null;
    
    // If assignedTo is a string, return it
    if (typeof assignedTo === 'string') return assignedTo;
    
    // If assignedTo is an object, extract name
    if (typeof assignedTo === 'object' && assignedTo !== null) {
      return assignedTo.name || assignedTo.displayName || assignedTo.department || 'Assigned Staff';
    }
    
    return null;
  };

  const getStatusBadge = (status) => {
    const statusText = status || 'Pending';
    
    switch (statusText.toLowerCase()) {
      case "pending":
        return (
          <div className="flex items-center gap-1">
            <FaClock className="w-3 h-3" />
            <span className="badge badge-warning text-xs">Pending</span>
          </div>
        );
      case "in progress":
      case "in-progress":
        return (
          <div className="flex items-center gap-1">
            <FaTasks className="w-3 h-3" />
            <span className="badge badge-info text-xs">In Progress</span>
          </div>
        );
      case "resolved":
        return (
          <div className="flex items-center gap-1">
            <FaCheckCircle className="w-3 h-3" />
            <span className="badge badge-success text-xs">Resolved</span>
          </div>
        );
      default:
        return <span className="badge badge-neutral text-xs">{statusText}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    const priorityText = priority || 'Normal';
    
    if (priorityText.toLowerCase() === "high" || priorityText.toLowerCase() === "critical") {
      return (
        <div className="flex items-center gap-1">
          <FaExclamationTriangle className="w-3 h-3" />
          <span className="badge badge-error text-xs">High</span>
        </div>
      );
    }
    return <span className="badge badge-neutral text-xs">Normal</span>;
  };

  const getCategoryIcon = (category) => {
    const categoryText = category || 'General';
    
    switch (categoryText.toLowerCase()) {
      case "road damage":
      case "roads":
        return <FaRoad className="w-5 h-5" />;
      case "public lighting":
      case "lighting":
        return <FaLightbulb className="w-5 h-5" />;
      case "water supply":
      case "water":
        return <FaWater className="w-5 h-5" />;
      case "sanitation":
      case "garbage":
        return <FaTrashAlt className="w-5 h-5" />;
      case "footpath repair":
      case "footpath":
        return <FaWalking className="w-5 h-5" />;
      case "traffic signals":
      case "traffic":
        return <FaTrafficLight className="w-5 h-5" />;
      case "drainage":
        return <FaTint className="w-5 h-5" />;
      case "public furniture":
      case "furniture":
        return <FaChair className="w-5 h-5" />;
      default:
        return <FaRoad className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Recent";
    }
  };

  if (!issue) return null;

  const assignedStaffName = getAssignedStaffName();

  return (
    <div className="card bg-gray-100 w-full h-full shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-200 cursor-pointer flex flex-col">
      {/* Image Section - Fixed Height */}
      <figure className="relative flex-shrink-0">
        <img
          src={image || "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400"}
          alt={title}
          className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
        />
        {/* Category Icon */}
        <div className="absolute top-3 left-3 bg-white/90 p-2 rounded-lg shadow-sm">
          <div className="text-gray-700">{getCategoryIcon(category)}</div>
        </div>
      </figure>

      {/* Card Content - Flex Grow to Fill Space */}
      <div className="card-body p-5 flex flex-col flex-grow">
        {/* Title */}
        <h2 className="card-title text-lg font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors">
          {title || "Untitled Issue"}
        </h2>

        {/* Badges Row */}
        <div className="flex items-center gap-2 mb-4">
          {getStatusBadge(status)}
          {getPriorityBadge(priority)}
        </div>

        {/* Progress Number (for In-Progress status) */}
        {(status === "In-Progress" || status === "in progress" || status === "in-progress") && progress && (
          <div className="flex items-center gap-2 mb-3">
            <FaTasks className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">
              Progress:{" "}
              <span className="text-blue-600 font-bold">{progress}%</span>
            </span>
          </div>
        )}

        {/* Location */}
        <div className="flex items-center text-gray-700 mb-3">
          <FaMapMarkerAlt className="w-4 h-4 text-gray-500 mr-2" />
          <span className="text-sm line-clamp-1">{location || "Location not specified"}</span>
        </div>

        {/* Reporter and Date */}
        <div className="flex items-center justify-between text-gray-600 text-sm mb-4">
          <div className="flex items-center">
            <FaUser className="w-4 h-4 mr-2" />
            <span className="truncate">{reportedBy || "Anonymous"}</span>
          </div>
          <div className="flex items-center">
            <FaCalendarAlt className="w-4 h-4 mr-2" />
            <span>{formatDate(reportedAt)}</span>
          </div>
        </div>

        {/* Department Assigned - FIXED: Don't render object directly */}
        {assignedStaffName && (
          <div className="text-sm text-gray-700 mb-4 mt-auto">
            <div className="flex items-center gap-2">
              <FaUserTie className="w-4 h-4 text-gray-500" />
              <div>
                <span className="font-medium">Assigned: </span>
                <span className="text-gray-600 truncate">{assignedStaffName}</span>
              </div>
            </div>
            {assignedTo && typeof assignedTo === 'object' && assignedTo.department && (
              <div className="text-xs text-gray-500 ml-6 mt-1">
                Dept: {assignedTo.department}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons - Always at bottom */}
        <div className="card-actions flex items-center justify-between mt-auto pt-4">
          {/* Upvote Button */}
          <button
            onClick={handleUpvote}
            disabled={isUpvoting}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
              hasUpvoted
                ? "bg-blue-100 border border-blue-300"
                : "bg-gray-200 hover:bg-gray-300"
            } ${isUpvoting ? "opacity-70 cursor-not-allowed" : ""}`}
          >
            <FaThumbsUp
              className={`w-4 h-4 transition-colors ${
                hasUpvoted ? "text-blue-600" : "text-gray-600"
              }`}
            />
            <span
              className={`font-bold ${
                hasUpvoted ? "text-blue-700" : "text-gray-900"
              }`}
            >
              {upvotes}
            </span>
            <span className="text-sm text-gray-600">
              {hasUpvoted ? "Upvoted" : "Upvote"}
            </span>
          </button>

          {/* View Details Button */}
          <NavLink to={`/issues/${_id}`}>
            <button className="btn btn-primary btn-sm gap-2 hover:bg-blue-700 transition-colors">
              <FaEye className="w-4 h-4" />
              Details
            </button>
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default IssueCard;