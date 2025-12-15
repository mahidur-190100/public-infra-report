import React, { useState, useEffect } from 'react';
import { useLoaderData } from 'react-router-dom';
import IssueCard from '../IssueCard/IssueCard';
import { FaSearch, FaSortAmountDown, FaSortAmountUp, FaFilter, FaTimes } from 'react-icons/fa';

const AllIssues = () => {
    const loaderData = useLoaderData();
    const [searchTerm, setSearchTerm] = useState('');
    const [allIssues, setAllIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // New state for sorting and filtering
    const [sortBy, setSortBy] = useState('recent'); // recent, upvotes, title, status, priority
    const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        category: 'all',
        status: 'all',
        priority: 'all'
    });
    
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

    // Get unique categories, statuses, priorities for filters
    const availableCategories = [...new Set(allIssues.map(issue => issue.category).filter(Boolean))].sort();
    const availableStatuses = [...new Set(allIssues.map(issue => issue.status).filter(Boolean))].sort();
    const availablePriorities = [...new Set(allIssues.map(issue => issue.priority).filter(Boolean))].sort();

    // Filter and sort issues
    const getFilteredAndSortedIssues = () => {
        // First apply search filter
        let filtered = searchTerm
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

        // Apply additional filters
        if (filters.category !== 'all') {
            filtered = filtered.filter(issue => 
                issue.category && issue.category.toLowerCase() === filters.category.toLowerCase()
            );
        }
        
        if (filters.status !== 'all') {
            filtered = filtered.filter(issue => 
                issue.status && issue.status.toLowerCase() === filters.status.toLowerCase()
            );
        }
        
        if (filters.priority !== 'all') {
            filtered = filtered.filter(issue => 
                issue.priority && issue.priority.toLowerCase() === filters.priority.toLowerCase()
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let aValue, bValue;
            
            switch (sortBy) {
                case 'recent':
                    aValue = new Date(a.reportedAt || a.createdAt || 0);
                    bValue = new Date(b.reportedAt || b.createdAt || 0);
                    return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
                
                case 'upvotes':
                    aValue = a.upvotes || 0;
                    bValue = b.upvotes || 0;
                    return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
                
                case 'title':
                    aValue = (a.title || '').toLowerCase();
                    bValue = (b.title || '').toLowerCase();
                    return sortOrder === 'desc' 
                        ? bValue.localeCompare(aValue)
                        : aValue.localeCompare(bValue);
                
                case 'status':
                    aValue = (a.status || '').toLowerCase();
                    bValue = (b.status || '').toLowerCase();
                    return sortOrder === 'desc'
                        ? bValue.localeCompare(aValue)
                        : aValue.localeCompare(bValue);
                
                case 'priority':
                    // Custom priority order: high > normal
                    const priorityOrder = { 'high': 2, 'normal': 1, 'low': 0 };
                    aValue = priorityOrder[(a.priority || 'normal').toLowerCase()] || 0;
                    bValue = priorityOrder[(b.priority || 'normal').toLowerCase()] || 0;
                    return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
                
                default:
                    return 0;
            }
        });

        return filtered;
    };

    const filteredIssues = getFilteredAndSortedIssues();

    // Sort options
    const sortOptions = [
        { value: 'recent', label: 'Most Recent' },
        { value: 'upvotes', label: 'Most Upvotes' },
        { value: 'title', label: 'Title (A-Z)' },
        { value: 'status', label: 'Status' },
        { value: 'priority', label: 'Priority' }
    ];

    const handleSortChange = (newSortBy) => {
        if (newSortBy === sortBy) {
            // Toggle sort order if clicking same sort option
            setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
        } else {
            // Set new sort by and default to desc
            setSortBy(newSortBy);
            setSortOrder('desc');
        }
    };

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const clearAllFilters = () => {
        setSearchTerm('');
        setFilters({
            category: 'all',
            status: 'all',
            priority: 'all'
        });
    };

    const hasActiveFilters = () => {
        return searchTerm.trim() !== '' || 
               filters.category !== 'all' ||
               filters.status !== 'all' ||
               filters.priority !== 'all';
    };

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
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
                    <div className="max-w-2xl mx-auto mb-6">
                        <div className="relative">
                            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                            <input
                                type="text"
                                placeholder="Search by title, description, location, category, or reporter..."
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <button 
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <FaTimes />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Sort and Filter Bar */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        {/* Sort Options */}
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-gray-700 font-medium">Sort by:</span>
                            <div className="flex flex-wrap gap-2">
                                {sortOptions.map(option => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleSortChange(option.value)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                                            sortBy === option.value
                                                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                        }`}
                                    >
                                        <span>{option.label}</span>
                                        {sortBy === option.value && (
                                            sortOrder === 'desc' 
                                                ? <FaSortAmountDown className="text-blue-600" />
                                                : <FaSortAmountUp className="text-blue-600" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Filter Toggle */}
                        <div className="flex items-center gap-4">
                            {hasActiveFilters() && (
                                <button
                                    onClick={clearAllFilters}
                                    className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <FaTimes />
                                    Clear All
                                </button>
                            )}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                <FaFilter />
                                <span>Filters</span>
                                {hasActiveFilters() && (
                                    <span className="ml-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Expanded Filters Panel */}
                    {showFilters && (
                        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Category Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={filters.category}
                                        onChange={(e) => handleFilterChange('category', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="all">All Categories</option>
                                        {availableCategories.map(category => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Status Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        value={filters.status}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="all">All Status</option>
                                        {availableStatuses.map(status => (
                                            <option key={status} value={status}>
                                                {status}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Priority Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Priority
                                    </label>
                                    <select
                                        value={filters.priority}
                                        onChange={(e) => handleFilterChange('priority', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="all">All Priorities</option>
                                        {availablePriorities.map(priority => (
                                            <option key={priority} value={priority}>
                                                {priority}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Active Filters Display */}
                            {hasActiveFilters() && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                                        Active Filters:
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {searchTerm && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                                Search: "{searchTerm}"
                                                <button
                                                    onClick={() => setSearchTerm('')}
                                                    className="ml-1 text-blue-600 hover:text-blue-800"
                                                >
                                                    <FaTimes size={12} />
                                                </button>
                                            </span>
                                        )}
                                        {filters.category !== 'all' && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                                Category: {filters.category}
                                                <button
                                                    onClick={() => handleFilterChange('category', 'all')}
                                                    className="ml-1 text-green-600 hover:text-green-800"
                                                >
                                                    <FaTimes size={12} />
                                                </button>
                                            </span>
                                        )}
                                        {filters.status !== 'all' && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                                                Status: {filters.status}
                                                <button
                                                    onClick={() => handleFilterChange('status', 'all')}
                                                    className="ml-1 text-yellow-600 hover:text-yellow-800"
                                                >
                                                    <FaTimes size={12} />
                                                </button>
                                            </span>
                                        )}
                                        {filters.priority !== 'all' && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                                                Priority: {filters.priority}
                                                <button
                                                    onClick={() => handleFilterChange('priority', 'all')}
                                                    className="ml-1 text-red-600 hover:text-red-800"
                                                >
                                                    <FaTimes size={12} />
                                                </button>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
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
                        {hasActiveFilters() && !searchTerm && (
                            <p className="text-gray-500 text-sm mt-1">
                                Filtered issues • Sort: {sortOptions.find(o => o.value === sortBy)?.label} ({sortOrder})
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
                                : `No issues match your filters. Try adjusting your search or filters.`
                            }
                        </p>
                        {hasActiveFilters() && (
                            <button
                                onClick={clearAllFilters}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Clear All Filters
                            </button>
                        )}
                        {allIssues.length === 0 && (
                            <button
                                onClick={() => window.location.href = '/dashboard/submit-issue'}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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