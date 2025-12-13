// AdminLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  FaHome,
  FaClipboardList,
  FaUserShield,
  FaUserTimes,
  FaUsers,
  FaUserCheck,
  FaMoneyBill,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaBars,
  FaTimes,
  FaUser,
  FaBell,
  FaEnvelope
} from 'react-icons/fa';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminData, setAdminData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('');

  // Navigation items
  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <FaHome className="w-5 h-5" />,
      exact: true
    },
    {
      name: 'All Issues',
      path: '/issues',
      icon: <FaClipboardList className="w-5 h-5" />,
      exact: false
    },
    {
      name: 'Assign Staff',
      path: '/dashboard/admin/assign-staff',
      icon: <FaUserShield className="w-5 h-5" />,
      exact: false
    },
    {
      name: 'Reject Issues',
      path: '/dashboard/admin/reject-issues',
      icon: <FaUserTimes className="w-5 h-5" />,
      exact: false
    },
    {
      name: 'Manage Staff',
      path: '/dashboard/admin/manage-staff',
      icon: <FaUsers className="w-5 h-5" />,
      exact: false
    },
    {
      name: 'Manage Citizens',
      path: '/dashboard/admin/manage-citizens',
      icon: <FaUserCheck className="w-5 h-5" />,
      exact: false
    },
    {
      name: 'Payments',
      path: '/dashboard/admin/payments',
      icon: <FaMoneyBill className="w-5 h-5" />,
      exact: false
    },
    {
      name: 'Settings',
      path: '/dashboard/admin/settings',
      icon: <FaCog className="w-5 h-5" />,
      exact: false
    }
  ];

  useEffect(() => {
    // Check if user is admin
    const admin = localStorage.getItem('admin');
    if (!admin) {
      navigate('/login');
      return;
    }

    try {
      const adminData = JSON.parse(admin);
      if (adminData.role !== 'admin') {
        navigate('/login');
        return;
      }
      setAdminData(adminData);
    } catch (error) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    // Set active item based on current path
    const currentPath = location.pathname;
    const activeNav = navItems.find(item => 
      item.exact ? currentPath === item.path : currentPath.startsWith(item.path)
    );
    if (activeNav) {
      setActiveItem(activeNav.name);
    }
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('admin');
    navigate('/login');
  };

  const handleNavClick = (path) => {
    navigate(path);
    setMobileSidebarOpen(false);
  };

  if (!adminData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg shadow-lg"
      >
        {mobileSidebarOpen ? <FaTimes className="w-6 h-6" /> : <FaBars className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 
        transform ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        lg:translate-x-0 lg:static lg:inset-auto
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'w-64' : 'w-20'}
        bg-gradient-to-b from-gray-900 to-gray-800 text-white
      `}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {sidebarOpen ? (
            <>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <FaChartBar className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="font-bold text-lg">Admin Panel</h1>
                  <p className="text-xs text-gray-400">System Management</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1 hover:bg-gray-700 rounded"
              >
                <FaChevronLeft className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center w-full">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FaChartBar className="w-6 h-6" />
              </div>
              <button
                onClick={() => setSidebarOpen(true)}
                className="mt-4 p-1 hover:bg-gray-700 rounded"
              >
                <FaChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* User Profile */}
        {sidebarOpen && (
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              {adminData.photoURL ? (
                <img
                  src={adminData.photoURL}
                  alt={adminData.displayName}
                  className="w-10 h-10 rounded-full border-2 border-blue-500"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <FaUser className="w-6 h-6" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{adminData.displayName || adminData.email}</p>
                <p className="text-xs text-gray-400 truncate">{adminData.email}</p>
                <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full mt-1 inline-block">
                  Admin
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavClick(item.path)}
              className={`
                w-full flex items-center space-x-3 px-3 py-3 rounded-lg
                transition-colors duration-200
                ${activeItem === item.name
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }
              `}
            >
              <div className={activeItem === item.name ? 'text-white' : 'text-gray-400'}>
                {item.icon}
              </div>
              {sidebarOpen && (
                <span className="font-medium">{item.name}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center space-x-3 px-3 py-3 rounded-lg
              text-red-300 hover:bg-red-600 hover:text-white
              transition-colors duration-200
            `}
          >
            <FaSignOutAlt className="w-5 h-5" />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`
        transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}
      `}>
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {activeItem || 'Dashboard'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Admin System Management Interface
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg">
                  <FaBell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
                
                {/* Messages */}
                <button className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg">
                  <FaEnvelope className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                </button>
                
                {/* User Menu */}
                <div className="flex items-center space-x-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-gray-900">
                      {adminData.displayName || adminData.email}
                    </p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                  {adminData.photoURL ? (
                    <img
                      src={adminData.photoURL}
                      alt={adminData.displayName}
                      className="w-10 h-10 rounded-full border-2 border-blue-500"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <FaUser className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-white border-t px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
            <div>
              {new Date().getFullYear()} Admin Panel v1.0
            </div>
            <div className="mt-2 sm:mt-0">
              <span className="text-gray-400">Last login: </span>
              <span className="font-medium">
                {adminData.lastLogin ? new Date(adminData.lastLogin).toLocaleString() : 'N/A'}
              </span>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default AdminLayout;