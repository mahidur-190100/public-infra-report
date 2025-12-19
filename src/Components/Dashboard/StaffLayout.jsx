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
  FaCalendarDay,
  FaUserEdit
} from 'react-icons/fa';

const StaffLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [staffData, setStaffData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkStaffAccess = async () => {
      try {
        const user = localStorage.getItem('user');
        const admin = localStorage.getItem('admin');

        if (user) {
          try {
            const parsedUser = JSON.parse(user);
            
            if (parsedUser.role === 'staff') {
              setStaffData(parsedUser);
              return;
            } else if (parsedUser.role === 'admin') {
              navigate('/dashboard/admin');
              return;
            } else {
              navigate('/dashboard');
              return;
            }
          } catch (parseError) {
            localStorage.removeItem('user');
            navigate('/login');
            return;
          }
        } else if (admin) {
          navigate('/dashboard/admin');
          return;
        } else {
          navigate('/login');
          return;
        }
      } catch (error) {
        localStorage.removeItem('user');
        localStorage.removeItem('admin');
        navigate('/login');
      }
    };

    checkStaffAccess();
  }, [navigate]);

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
      title: 'Resolved Issues',
      path: '/dashboard/staff/resolved-issues',
      icon: <FaCheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
    },
    {
      title: 'Edit Profile',
      path: '/dashboard/staff/edit-profile',
      icon: <FaUserEdit className="w-4 h-4 sm:w-5 sm:h-5" />
    },
  ];

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
      <div className="flex">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed left-4 top-20 z-50 p-2 bg-blue-600 text-white rounded-md shadow-lg hover:bg-blue-700 transition-colors"
        >
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </button>

        <aside
          className={`bg-white shadow-lg transition-all duration-300 ${
            sidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 lg:w-64 fixed lg:static top-0 left-0 h-screen z-40 overflow-y-auto`}
        >
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
                {staffData.department && (
                  <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800 font-medium">
                    {staffData.department}
                  </span>
                )}
              </div>
            </div>
          </div>

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

        <main className="flex-1 p-4 lg:p-6 lg:ml-64">
          <Outlet />
        </main>
      </div>

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