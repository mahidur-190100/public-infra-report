import React, { useState, useEffect } from 'react';
import { useLoaderData } from 'react-router-dom';
import IssueCard from '../IssueCard/IssueCard';
import { FaSearch } from 'react-icons/fa';

const AllIssues = () => {
    const loaderData = useLoaderData();
    const [searchTerm, setSearchTerm] = useState('');
    const [allIssues, setAllIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        try {
            console.log("Loader data received:", loaderData);
            
            // Handle different response formats
            if (loaderData.success && Array.isArray(loaderData.issues)) {
                // New format: { success: true, issues: [...] }
                setAllIssues(loaderData.issues);
                console.log("Using new format, issues count:", loaderData.issues.length);
            } else if (Array.isArray(loaderData)) {
                // Old format: raw array
                setAllIssues(loaderData);
                console.log("Using old format, issues count:", loaderData.length);
            } else if (loaderData && loaderData.issues && Array.isArray(loaderData.issues)) {
                // Another possible format
                setAllIssues(loaderData.issues);
                console.log("Using alternative format, issues count:", loaderData.issues.length);
            } else {
                // Default to empty array
                console.warn("Unexpected data format, defaulting to empty array:", loaderData);
                setAllIssues([]);
            }
            
            setLoading(false);
        } catch (err) {
            console.error("Error processing data:", err);
            setError(err.message);
            setLoading(false);
        }
    }, [loaderData]);

    // Filter issues based on search term - handle potential undefined fields
    const filteredIssues = searchTerm
        ? allIssues.filter(issue => {
            if (!issue) return false;
            
            const searchLower = searchTerm.toLowerCase();
            
            // Safely check each field
            const titleMatch = issue.title && issue.title.toLowerCase().includes(searchLower);
            const descriptionMatch = issue.description && issue.description.toLowerCase().includes(searchLower);
            const locationMatch = issue.location && issue.location.toLowerCase().includes(searchLower);
            const categoryMatch = issue.category && issue.category.toLowerCase().includes(searchLower);
            const reportedByMatch = issue.reportedBy && issue.reportedBy.toLowerCase().includes(searchLower);
            
            return titleMatch || descriptionMatch || locationMatch || categoryMatch || reportedByMatch;
        })
        : allIssues;

    if (loading) {
        return (
            <div className="min-h-screen bg-white py-12">
                <div className="container mx-auto px-4 text-center">
                    <div className="animate-pulse space-y-4">
                        <div className="h-8 bg-gray-300 rounded w-1/4 mx-auto"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                        <div className="h-64 bg-gray-100 rounded w-full max-w-xl mx-auto mt-8"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white py-12">
                <div className="container mx-auto px-4 text-center">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                        <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Issues</h2>
                        <p className="text-red-600 mb-4">{error}</p>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="btn btn-error"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white py-12">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        All Reported Issues
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Browse and search through all infrastructure issues reported by citizens
                    </p>
                    
                    {/* Search Bar */}
                    <div className="max-w-2xl mx-auto mb-8">
                        <div className="relative">
                            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                            <input
                                type="text"
                                placeholder="Search by title, description, location, category, or reporter..."
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-between items-center mt-2">
                            <p className="text-gray-500 text-sm">
                                Type to filter issues...
                            </p>
                            {searchTerm && (
                                <button 
                                    onClick={() => setSearchTerm('')}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    Clear search
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Results Count and Stats */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                    <div className="text-gray-700 mb-4 md:mb-0">
                        <p className="font-medium">
                            Showing <span className="text-blue-600 font-bold">{filteredIssues.length}</span> of{" "}
                            <span className="font-bold">{allIssues.length}</span> total issues
                        </p>
                        {searchTerm && (
                            <p className="text-gray-500 text-sm mt-1">
                                Search results for: <span className="font-medium">"{searchTerm}"</span>
                            </p>
                        )}
                    </div>
                    
                    {/* Status Filter Badges */}
                    <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                            All: {allIssues.length}
                        </span>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                            Pending: {allIssues.filter(i => i.status === 'pending' || i.status === 'Pending').length}
                        </span>
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            In Progress: {allIssues.filter(i => i.status === 'in progress' || i.status === 'In-Progress').length}
                        </span>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                            Resolved: {allIssues.filter(i => i.status === 'resolved' || i.status === 'Resolved').length}
                        </span>
                    </div>
                </div>

                {/* Issues Grid */}
                {filteredIssues.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredIssues.map((issue) => (
                            <div key={issue._id} className="transition-transform duration-300 hover:scale-[1.02]">
                                <IssueCard issue={issue} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                        <div className="text-gray-400 text-5xl mb-4">
                            <FaSearch />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            {allIssues.length === 0 ? "No Issues Reported Yet" : "No Matching Issues Found"}
                        </h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-6">
                            {allIssues.length === 0 
                                ? "Be the first to report an infrastructure issue in your community!"
                                : `No issues match your search "${searchTerm}". Try different keywords.`
                            }
                        </p>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="btn btn-primary"
                            >
                                View All Issues
                            </button>
                        )}
                        {allIssues.length === 0 && (
                            <button
                                onClick={() => window.location.href = '/dashboard/submit-issue'}
                                className="btn btn-primary"
                            >
                                Report First Issue
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllIssues;