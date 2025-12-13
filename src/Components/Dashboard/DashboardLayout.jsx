// DashboardLayout.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  FaHome, 
  FaPlus, 
  FaEdit, 
  FaStar, 
  FaCrown, 
  FaHistory,
  FaBars,
  FaTimes,
  FaChartBar,
  FaUsers,
  FaClipboardList,
  FaUserShield,
  FaMoneyBill,
  FaUserCheck,
  FaUserTimes
} from 'react-icons/fa';
import Navbar from '../Shared/Navbar/Navbar';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("=== DASHBOARD LAYOUT DEBUG START ===");
    
    // Check localStorage for user/admin data
    const admin = localStorage.getItem('admin');
    const user = localStorage.getItem('user');
    
    console.log("🔍 LocalStorage 'admin' value:", admin);
    console.log("🔍 LocalStorage 'user' value:", user);
    
    if (admin) {
      try {
        const adminData = JSON.parse(admin);
        console.log("✅ Parsed admin data:", adminData);
        console.log("📌 Admin role:", adminData.role);
        console.log("📌 Is admin (role === 'admin'):", adminData.role === 'admin');
        
        // Set both state updates together
        setUserData(adminData);
        setIsAdmin(adminData.role === 'admin');
        
        console.log("✅ State updates queued for admin");
        
      } catch (error) {
        console.error('❌ Error parsing admin data:', error);
        localStorage.removeItem('admin');
        navigate('/login');
      }
    } else if (user) {
      try {
        const userData = JSON.parse(user);
        console.log("✅ Parsed user data:", userData);
        
        setUserData(userData);
        setIsAdmin(false);
        
        console.log("✅ State updates queued for user");
      } catch (error) {
        console.error('❌ Error parsing user data:', error);
        localStorage.removeItem('user');
        navigate('/login');
      }
    } else {
      console.log("❌ No user logged in - redirecting to login");
      navigate('/login');
    }
    
    console.log("=== DASHBOARD LAYOUT DEBUG END ===");
  }, [navigate]);

  // Add this useEffect to log when state actually updates
  useEffect(() => {
    console.log("🔄 State updated - isAdmin:", isAdmin, "userData:", userData);
  }, [isAdmin, userData]);

  // Regular User Menu Items
  const userMenuItems = [
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
      title: 'My Issues',
      path: '/dashboard/my-issues',
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

  // Admin Menu Items
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

  // Determine menu items based on isAdmin state
  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  const handleLogout = () => {
    localStorage.removeItem('admin');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Show loading until userData is set
  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar - Full width */}
      <Navbar />
      
      <div className="flex">
        {/* Mobile Menu Button */}
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
          
          {/* Sidebar Header */}
          <div className="p-3 sm:p-4 border-b">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                isAdmin ? 'bg-red-600' : 'bg-blue-600'
              }`}>
                <FaChartBar className="text-white w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-sm sm:text-lg text-gray-800 truncate">
                  {isAdmin ? 'Admin Dashboard' : 'User Dashboard'}
                </h2>
                <p className="text-xs text-gray-500 hidden sm:block">
                  {isAdmin ? 'System Administrator' : 'Public Infra Report'}
                </p>
              </div>
            </div>
            
            {/* User Info */}
            <div className="mt-3 p-2 bg-gray-50 rounded-lg">
              <p className="text-xs font-medium text-gray-700 truncate">
                {userData.email}
              </p>
              <div className="flex items-center justify-between mt-1">
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  isAdmin 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {isAdmin ? 'Admin' : 'User'}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs text-red-600 hover:text-red-800"
                >
                  Logout
                </button>
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
                      ? `${isAdmin ? 'bg-red-50 text-red-600 border-r-2 sm:border-r-4 border-red-600' : 'bg-blue-50 text-blue-600 border-r-2 sm:border-r-4 border-blue-600'}` 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                {({ isActive }) => (
                  <>
                    <span className={`${isActive ? (isAdmin ? 'text-red-600' : 'text-blue-600') : 'text-gray-500'} flex-shrink-0`}>
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

      {/* Overlay for mobile */}
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