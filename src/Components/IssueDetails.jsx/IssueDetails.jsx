import React from 'react'
import { useLoaderData } from 'react-router-dom'
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
  FaBuilding
} from 'react-icons/fa'

const IssueDetails = () => {
    const data = useLoaderData();
    const details = data?.data || data;
    
    if (!details) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">No Data Found</h1>
                    <p className="text-gray-600">The issue details could not be loaded.</p>
                </div>
            </div>
        );
    }

    const {
        _id,
        title,
        description,
        category,
        status,
        priority,
        location,
        image,
        reportedBy,
        reportedAt,
        assignedTo,
        progress,
        upvotes,
        resolvedAt,
        latitude,
        longitude
    } = details;

    // Get status badge
    const getStatusBadge = () => {
        const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium";
        
        switch (status) {
            case 'Pending':
                return (
                    <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
                        <FaClock className="mr-1" /> Pending
                    </span>
                );
            case 'In-Progress':
                return (
                    <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
                        <FaTasks className="mr-1" /> In Progress
                    </span>
                );
            case 'Resolved':
                return (
                    <span className={`${baseClasses} bg-green-100 text-green-800`}>
                        <FaCheckCircle className="mr-1" /> Resolved
                    </span>
                );
            default:
                return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>;
        }
    };

    // Get priority badge
    const getPriorityBadge = () => {
        if (priority === 'High') {
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
        switch (category) {
            case 'Road Damage': return <FaRoad className="w-6 h-6" />;
            case 'Public Lighting': return <FaLightbulb className="w-6 h-6" />;
            case 'Water Supply': return <FaWater className="w-6 h-6" />;
            case 'Sanitation': return <FaTrashAlt className="w-6 h-6" />;
            case 'Footpath Repair': return <FaWalking className="w-6 h-6" />;
            case 'Traffic Signals': return <FaTrafficLight className="w-6 h-6" />;
            case 'Drainage': return <FaTint className="w-6 h-6" />;
            case 'Public Furniture': return <FaChair className="w-6 h-6" />;
            default: return <FaRoad className="w-6 h-6" />;
        }
    };

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/* Main Card */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Image Section */}
                    <div className="relative h-64 md:h-80">
                        <img
                            src={image}
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
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                                {title}
                            </h1>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {getStatusBadge()}
                                {getPriorityBadge()}
                            </div>
                        </div>

                        {/* Progress Bar for In-Progress issues */}
                        {status === 'In-Progress' && progress !== undefined && (
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

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {/* Left Column */}
                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <FaMapMarkerAlt className="w-5 h-5 text-gray-500 mt-1 mr-3 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Location</h3>
                                        <p className="text-gray-700">{location}</p>
                                        {latitude && longitude && (
                                            <p className="text-sm text-gray-500 mt-1">
                                                Coordinates: {latitude.toFixed(4)}, {longitude.toFixed(4)}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <FaUser className="w-5 h-5 text-gray-500 mt-1 mr-3 flex-shrink-0" />
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Reported By</h3>
                                        <p className="text-gray-700">{reportedBy}</p>
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
                                {assignedTo && (
                                    <div className="flex items-start">
                                        <FaBuilding className="w-5 h-5 text-gray-500 mt-1 mr-3 flex-shrink-0" />
                                        <div>
                                            <h3 className="font-semibold text-gray-900">Assigned Department</h3>
                                            <p className="text-gray-700">{assignedTo}</p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start">
                                    <div className="w-5 h-5 text-gray-500 mt-1 mr-3 flex-shrink-0 flex items-center justify-center">
                                        {getCategoryIcon()}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">Category</h3>
                                        <p className="text-gray-700">{category}</p>
                                    </div>
                                </div>

                                {/* Show resolved date if available */}
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
                            <div className="p-5 border rounded-lg">
                                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{description}</p>
                            </div>
                        </div>

                        {/* Simple Info Bar */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center p-4 border rounded-lg">
                            <div className="flex items-center gap-2">
                                <FaThumbsUp className="text-blue-600" />
                                <span className="font-bold text-gray-900">{upvotes || 0} Upvotes</span>
                            </div>
                            <div className="text-sm text-gray-500">
                                Issue ID: <span className="font-mono">{_id}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default IssueDetails