import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  FaHome, 
  FaPlus, 
  FaEdit, 
  FaStar, 
  FaCrown, 
  FaHistory,
  FaBars,
  FaTimes,
  FaChartBar
} from 'react-icons/fa';
import Navbar from '../Shared/Navbar/Navbar';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    {
      title: 'Dashboard Home',
      path: '/dashboard',
      icon: <FaHome className="w-4 h-4 sm:w-5 sm:h-5" />,
      exact: true
    },
    {
      title: 'Submit New Issue',
      path: '/dashboard/submit-issue',
      icon: <FaPlus className="w-4 h-4 sm:w-5 sm:h-5" />
    },
    {
      title: 'Edit/Delete Own Issues',
      path: '/dashboard/edit-issues',
      icon: <FaEdit className="w-4 h-4 sm:w-5 sm:h-5" />
    },
    {
      title: 'Boost Priority',
      path: '/dashboard/boost-priority',
      icon: <FaStar className="w-4 h-4 sm:w-5 sm:h-5" />
    },
    {
      title: 'Premium Subscription',
      path: '/dashboard/premium',
      icon: <FaCrown className="w-4 h-4 sm:w-5 sm:h-5" />
    },
    {
      title: 'Track Activities',
      path: '/dashboard/activities',
      icon: <FaHistory className="w-4 h-4 sm:w-5 sm:h-5" />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar - Full width */}
      <Navbar />
      
      <div className="flex "> {/* Added pt-16 to account for fixed navbar height */}
        {/* Mobile Menu Button - Always visible on small screens */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed left-4 top-20 z-50 p-2 bg-blue-600 text-white rounded-md shadow-lg"
        >
          {sidebarOpen ? <FaTimes className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
        </button>

        {/* Sidebar - Responsive */}
        <aside className={`bg-white shadow-lg transition-all duration-300 ease-in-out ${
          sidebarOpen 
            ? 'w-64 translate-x-0' 
            : '-translate-x-full'
        } lg:translate-x-0 lg:w-64 fixed lg:static top-0 left-0 h-screen z-40 overflow-y-auto`}>
          
          {/* Logo - Responsive */}
          <div className="p-3 sm:p-4 border-b">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaChartBar className="text-white w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-sm sm:text-lg text-gray-800 truncate">Dashboard Menu</h2>
                <p className="text-xs text-gray-500 hidden sm:block">Public Infra Report</p>
              </div>
            </div>
          </div>

          {/* Menu Items - Responsive */}
          <nav className="p-2 sm:p-4 space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive }) => 
                  `flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-50 text-blue-600 border-r-2 sm:border-r-4 border-blue-600' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                {({ isActive }) => (
                  <>
                    <span className={`${isActive ? 'text-blue-600' : 'text-gray-500'} flex-shrink-0`}>
                      {item.icon}
                    </span>
                    <span className="font-medium text-sm sm:text-base truncate">{item.title}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main Content - Responsive */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 transition-all duration-300 lg:ml-64 w-full">
          <Outlet />
        </main>
      </div>

      {/* Overlay for mobile - Only shows when sidebar is open on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;