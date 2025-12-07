import React from 'react';
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
  FaTasks
} from 'react-icons/fa';
import { NavLink } from 'react-router-dom';

const IssueCard = ({ issue }) => {
  // Destructure _id from issue
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
    upvotes 
  } = issue;
  console.log('Rendering IssueCard for issue ID:',_id);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return (
          <div className="flex items-center gap-1">
            <FaClock className="w-3 h-3" />
            <span className="badge badge-warning text-xs">Pending</span>
          </div>
        );
      case 'In-Progress':
        return (
          <div className="flex items-center gap-1">
            <FaTasks className="w-3 h-3" />
            <span className="badge badge-info text-xs">In Progress</span>
          </div>
        );
      case 'Resolved':
        return (
          <div className="flex items-center gap-1">
            <FaCheckCircle className="w-3 h-3" />
            <span className="badge badge-success text-xs">Resolved</span>
          </div>
        );
      default:
        return <span className="badge badge-neutral text-xs">{status}</span>;
    }
  };

  const getPriorityBadge = (priority) => {
    if (priority === 'High') {
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
    switch (category) {
      case 'Road Damage': return <FaRoad className="w-5 h-5" />;
      case 'Public Lighting': return <FaLightbulb className="w-5 h-5" />;
      case 'Water Supply': return <FaWater className="w-5 h-5" />;
      case 'Sanitation': return <FaTrashAlt className="w-5 h-5" />;
      case 'Footpath Repair': return <FaWalking className="w-5 h-5" />;
      case 'Traffic Signals': return <FaTrafficLight className="w-5 h-5" />;
      case 'Drainage': return <FaTint className="w-5 h-5" />;
      case 'Public Furniture': return <FaChair className="w-5 h-5" />;
      default: return <FaRoad className="w-5 h-5" />;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (!issue) return null;

  return (
    <div className="card bg-gray-100 w-full h-full shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-200 cursor-pointer flex flex-col">
      {/* Image Section - Fixed Height */}
      <figure className="relative flex-shrink-0">
        <img
          src={image}
          alt={title}
          className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
        />
        {/* Category Icon */}
        <div className="absolute top-3 left-3 bg-white/90 p-2 rounded-lg shadow-sm">
          <div className="text-gray-700">
            {getCategoryIcon(category)}
          </div>
        </div>
      </figure>

      {/* Card Content - Flex Grow to Fill Space */}
      <div className="card-body p-5 flex flex-col flex-grow">
        {/* Title */}
        <h2 className="card-title text-lg font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors">
          {title}
        </h2>

        {/* Badges Row */}
        <div className="flex items-center gap-2 mb-4">
          {getStatusBadge(status)}
          {getPriorityBadge(priority)}
        </div>

        {/* Progress Number (for In-Progress status) */}
        {status === 'In-Progress' && progress && (
          <div className="flex items-center gap-2 mb-3">
            <FaTasks className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">
              Progress: <span className="text-blue-600 font-bold">{progress}%</span>
            </span>
          </div>
        )}

        {/* Location */}
        <div className="flex items-center text-gray-700 mb-3">
          <FaMapMarkerAlt className="w-4 h-4 text-gray-500 mr-2" />
          <span className="text-sm line-clamp-1">{location}</span>
        </div>

        {/* Reporter and Date */}
        <div className="flex items-center justify-between text-gray-600 text-sm mb-4">
          <div className="flex items-center">
            <FaUser className="w-4 h-4 mr-2" />
            <span className="truncate">{reportedBy}</span>
          </div>
          <div className="flex items-center">
            <FaCalendarAlt className="w-4 h-4 mr-2" />
            <span>{formatDate(reportedAt)}</span>
          </div>
        </div>

        {/* Department Assigned - Auto pushes content */}
        {assignedTo && (
          <div className="text-sm text-gray-700 mb-4 mt-auto">
            <span className="font-medium">Department: </span>
            <span className="text-gray-600 truncate">{assignedTo}</span>
          </div>
        )}

        {/* Action Buttons - Always at bottom */}
        <div className="card-actions flex items-center justify-between mt-auto pt-4">
          {/* Upvote Display */}
          <div className="flex items-center gap-2 bg-gray-200 px-3 py-2 rounded-lg">
            <FaThumbsUp className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-gray-900">{upvotes || 0}</span>
            <span className="text-sm text-gray-600">Upvotes</span>
          </div>

          {/* View Details Button - Now properly wrapped with NavLink */}
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