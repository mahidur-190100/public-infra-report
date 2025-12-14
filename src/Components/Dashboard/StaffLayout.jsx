// StaffLayout.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  FaChartBar,
  FaClipboardList,
  FaUserCheck,
  FaUserTimes,
  FaCheckCircle,
  FaClock,
  FaBars,
  FaTimes,
  FaHome,
  FaUserTie,
  FaExclamationTriangle,
  FaCalendarDay
} from 'react-icons/fa';
import Navbar from '../Shared/Navbar/Navbar';

const StaffLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [staffData, setStaffData] = useState(null);
  const navigate = useNavigate();

  /* ================== AUTH GUARD ================== */
  useEffect(() => {
    const checkStaffAccess = async () => {
      try {
        const user = localStorage.getItem('user');
        const admin = localStorage.getItem('admin');

        console.log("🔍 StaffLayout - Checking authentication...");
        console.log("📱 localStorage user:", user);
        console.log("📱 localStorage admin:", admin);

        if (user) {
          try {
            const parsedUser = JSON.parse(user);
            console.log("📱 Parsed user data:", parsedUser);
            
            // Check if user has staff role
            if (parsedUser.role === 'staff') {
              console.log("✅ Staff user authenticated");
              setStaffData(parsedUser);
              return;
            } else if (parsedUser.role === 'admin') {
              console.log("⚠️ Admin trying to access staff dashboard, redirecting...");
              navigate('/dashboard/admin');
              return;
            } else {
              console.log("⚠️ Regular user trying to access staff dashboard, redirecting...");
              navigate('/dashboard');
              return;
            }
          } catch (parseError) {
            console.error("❌ Error parsing user data:", parseError);
            localStorage.removeItem('user');
            navigate('/login');
            return;
          }
        } else if (admin) {
          console.log("⚠️ Admin detected, redirecting to admin dashboard");
          navigate('/dashboard/admin');
          return;
        } else {
          console.log("❌ No authentication found, redirecting to login");
          navigate('/login');
          return;
        }
      } catch (error) {
        console.error("❌ Authentication error:", error);
        localStorage.removeItem('user');
        localStorage.removeItem('admin');
        navigate('/login');
      }
    };

    checkStaffAccess();
  }, [navigate]);

  /* ================== STAFF MENU ================== */
  const staffMenuItems = [
    {
      title: 'Staff Dashboard',
      path: '/dashboard/staff',
      icon: <FaChartBar className="w-4 h-4 sm:w-5 sm:h-5" />,
      exact: true
    },
    {
      title: 'My Assigned Issues',
      path: '/dashboard/staff/my-issues',
      icon: <FaClipboardList className="w-4 h-4 sm:w-5 sm:h-5" />
    },
    {
      title: 'Pending Issues',
      path: '/dashboard/staff/pending-issues',
      icon: <FaClock className="w-4 h-4 sm:w-5 sm:h-5" />
    },
    {
      title: 'Resolved Issues',
      path: '/dashboard/staff/resolved-issues',
      icon: <FaCheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
    },
    {
      title: 'Today\'s Tasks',
      path: '/dashboard/staff/today-tasks',
      icon: <FaCalendarDay className="w-4 h-4 sm:w-5 sm:h-5" />
    },
    {
      title: 'Rejected Issues',
      path: '/dashboard/staff/rejected-issues',
      icon: <FaExclamationTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('admin');
    navigate('/login');
  };

  /* ================== LOADING ================== */
  if (!staffData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Staff Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="flex">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed left-4 top-20 z-50 p-2 bg-blue-600 text-white rounded-md shadow-lg hover:bg-blue-700 transition-colors"
        >
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Sidebar */}
        <aside
          className={`bg-white shadow-lg transition-all duration-300 ${
            sidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 lg:w-64 fixed lg:static top-0 left-0 h-screen z-40 overflow-y-auto`}
        >
          {/* Header */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-2 mb-3">
              <FaUserTie className="w-5 h-5 text-blue-600" />
              <h2 className="font-bold text-lg text-gray-800">
                Staff Dashboard
              </h2>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm font-medium text-gray-800 truncate">
                {staffData.name || staffData.displayName || 'Staff Member'}
              </p>
              <p className="text-xs text-gray-600 truncate mt-1">
                {staffData.email}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 font-medium">
                  Staff Member
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Menu */}
          <nav className="p-3 space-y-1">
            {staffMenuItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                  }`
                }
              >
                <div className={`${item.path === '/dashboard/staff' ? 'text-blue-600' : 'text-gray-500'}`}>
                  {item.icon}
                </div>
                <span>{item.title}</span>
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 mt-auto">
            <div className="text-center">
              <button
                onClick={() => navigate('/')}
                className="flex items-center justify-center gap-2 w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FaHome className="w-4 h-4" />
                Back to Home
              </button>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-4 lg:p-6 lg:ml-64">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default StaffLayout;