import React from 'react';
import { FaPlus, FaEdit, FaStar, FaCrown, FaHistory, FaHome } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';

const DashboardHome = () => {
  return (
    <div className="p-3 sm:p-4 md:p-6">
      {/* Welcome Section - Responsive */}
      <div className="mb-6 sm:mb-8 md:mb-10 text-center lg:text-left">
        <div className="flex flex-col sm:flex-row items-center sm:items-start lg:items-center justify-center lg:justify-start gap-3 sm:gap-4 mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl flex items-center justify-center flex-shrink-0">
            <FaHome className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 text-sm sm:text-base mt-1">Manage your infrastructure reports</p>
          </div>
        </div>
      </div>

      {/* Options Grid - Responsive */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
          
          {/* Submit New Issue Card */}
          <NavLink to="/dashboard/submit-issue" className="group block">
            <div className="bg-white rounded-lg sm:rounded-xl shadow hover:shadow-lg sm:shadow-md sm:hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-300 overflow-hidden h-full">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-1 sm:h-2"></div>
              <div className="p-3 sm:p-4 md:p-6">
                <div className="flex items-start gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
                  <div className="bg-green-100 text-green-600 p-2 sm:p-3 rounded-lg flex-shrink-0">
                    <FaPlus className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    Submit New Issue
                  </h3>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm md:text-base mb-4 sm:mb-6">
                  Report new infrastructure problems in your area
                </p>
                <div className="flex items-center text-blue-600 font-medium text-xs sm:text-sm">
                  <span>Access Now</span>
                  <svg 
                    className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2 transform group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </div>
          </NavLink>

          {/* MY issue */}
          <NavLink to="/dashboard/my-issue" className="group block">
            <div className="bg-white rounded-lg sm:rounded-xl shadow hover:shadow-lg sm:shadow-md sm:hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-300 overflow-hidden h-full">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-1 sm:h-2"></div>
              <div className="p-3 sm:p-4 md:p-6">
                <div className="flex items-start gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
                  <div className="bg-blue-100 text-blue-600 p-2 sm:p-3 rounded-lg flex-shrink-0">
                    <FaEdit className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    My Issues
                  </h3>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm md:text-base mb-4 sm:mb-6">
                  Manage your reported issues (only if pending)
                </p>
                <div className="flex items-center text-blue-600 font-medium text-xs sm:text-sm">
                  <span>Access Now</span>
                  <svg 
                    className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2 transform group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </div>
          </NavLink>

          {/* Boost Priority Card */}
          <NavLink to="/dashboard/boost-priority" className="group block">
            <div className="bg-white rounded-lg sm:rounded-xl shadow hover:shadow-lg sm:shadow-md sm:hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-300 overflow-hidden h-full">
              <div className="bg-gradient-to-r from-yellow-500 to-amber-600 h-1 sm:h-2"></div>
              <div className="p-3 sm:p-4 md:p-6">
                <div className="flex items-start gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
                  <div className="bg-yellow-100 text-yellow-600 p-2 sm:p-3 rounded-lg flex-shrink-0">
                    <FaStar className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    Boost Priority
                  </h3>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm md:text-base mb-4 sm:mb-6">
                  Increase priority level of your important issues
                </p>
                <div className="flex items-center text-blue-600 font-medium text-xs sm:text-sm">
                  <span>Access Now</span>
                  <svg 
                    className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2 transform group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </div>
          </NavLink>

          {/* Premium Subscription Card */}
          <NavLink to="/dashboard/premium" className="group block">
            <div className="bg-white rounded-lg sm:rounded-xl shadow hover:shadow-lg sm:shadow-md sm:hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-300 overflow-hidden h-full">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-1 sm:h-2"></div>
              <div className="p-3 sm:p-4 md:p-6">
                <div className="flex items-start gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
                  <div className="bg-purple-100 text-purple-600 p-2 sm:p-3 rounded-lg flex-shrink-0">
                    <FaCrown className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    Premium Subscription
                  </h3>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm md:text-base mb-4 sm:mb-6">
                  Access premium features and priority support
                </p>
                <div className="flex items-center text-blue-600 font-medium text-xs sm:text-sm">
                  <span>Access Now</span>
                  <svg 
                    className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2 transform group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </div>
          </NavLink>

          {/* Track Activities Card */}
          <NavLink to="/dashboard/activities" className="group block">
            <div className="bg-white rounded-lg sm:rounded-xl shadow hover:shadow-lg sm:shadow-md sm:hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-300 overflow-hidden h-full">
              <div className="bg-gradient-to-r from-gray-500 to-gray-600 h-1 sm:h-2"></div>
              <div className="p-3 sm:p-4 md:p-6">
                <div className="flex items-start gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
                  <div className="bg-gray-100 text-gray-600 p-2 sm:p-3 rounded-lg flex-shrink-0">
                    <FaHistory className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8" />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    Track Activities
                  </h3>
                </div>
                <p className="text-gray-600 text-xs sm:text-sm md:text-base mb-4 sm:mb-6">
                  View your issue history and activity log
                </p>
                <div className="flex items-center text-blue-600 font-medium text-xs sm:text-sm">
                  <span>Access Now</span>
                  <svg 
                    className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2 transform group-hover:translate-x-1 transition-transform" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </div>
            </div>
          </NavLink>

        </div>
      </div>
    </div>
  );
};

export default DashboardHome;