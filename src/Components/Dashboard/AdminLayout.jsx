// AdminLayout.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  FaChartBar,
  FaClipboardList,
  FaUserShield,
  FaUsers,
  FaMoneyBill,
  FaUserCheck,
  FaUserTimes,
  FaBars,
  FaTimes,
  FaHome // Added FaHome import
} from 'react-icons/fa';


const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const navigate = useNavigate();

  /* ================== AUTH GUARD ================== */
  useEffect(() => {
    const admin = localStorage.getItem('admin');
    const user = localStorage.getItem('user');

    if (admin) {
      try {
        const parsedAdmin = JSON.parse(admin);
        if (parsedAdmin.role === 'admin') {
          setAdminData(parsedAdmin);
        } else {
          navigate('/dashboard');
        }
      } catch {
        localStorage.removeItem('admin');
        navigate('/login');
      }
    } else if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [navigate]);

  /* ================== ADMIN MENU ================== */
  const adminMenuItems = [
    {
      title: 'Admin Dashboard',
      path: '/dashboard',
      icon: <FaChartBar className="w-4 h-4 sm:w-5 sm:h-5" />,
      exact: true
    },
    {
      title: 'View All Issues',
      path: '/issues',
      icon: <FaClipboardList className="w-4 h-4 sm:w-5 sm:h-5" />
    },
    {
      title: 'Assign Staff',
      path: '/dashboard/admin/assign-staff',
      icon: <FaUserShield className="w-4 h-4 sm:w-5 sm:h-5" />
    },
    {
      title: 'Reject Issues',
      path: '/dashboard/admin/reject-issues',
      icon: <FaUserTimes className="w-4 h-4 sm:w-5 sm:h-5" />
    },
    {
      title: 'Manage Staff',
      path: '/dashboard/admin/manage-staff',
      icon: <FaUsers className="w-4 h-4 sm:w-5 sm:h-5" />
    },
    {
      title: 'Manage Citizens',
      path: '/dashboard/admin/manage-citizens',
      icon: <FaUserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
    },
    {
      title: 'View Payments',
      path: '/dashboard/admin/payments',
      icon: <FaMoneyBill className="w-4 h-4 sm:w-5 sm:h-5" />
    }
  ];

 

  /* ================== LOADING ================== */
  if (!adminData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
     

      <div className="flex">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed left-4 top-20 z-50 p-2 bg-red-600 text-white rounded-md shadow-lg"
        >
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Sidebar */}
        <aside
          className={`bg-white shadow-lg transition-all duration-300 ${
            sidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 lg:w-64 fixed lg:static top-0 left-0 h-screen z-40`}
        >
          {/* Header */}
          <div className="p-4 border-b">
            <h2 className="font-bold text-lg text-gray-800">
              Admin Dashboard
            </h2>

            <div className="mt-3 p-2 bg-gray-50 rounded-lg">
              <p className="text-xs font-medium text-gray-700 truncate">
                {adminData.email}
              </p>
              <div className="flex justify-between mt-1">
                <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800">
                  Admin
                </span>
              </div>
            </div>
          </div>

          {/* Menu */}
          <nav className="p-4 space-y-1">
            {adminMenuItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-lg ${
                    isActive
                      ? 'bg-red-50 text-red-600 border-r-4 border-red-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                {item.icon}
                <span className="font-medium">{item.title}</span>
              </NavLink>
            ))}
          </nav>

          {/* Back to Home Button - ADDED HERE */}
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

        {/* Content */}
        <main className="flex-1 p-6 lg:ml-64">
          <Outlet />
        </main>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;