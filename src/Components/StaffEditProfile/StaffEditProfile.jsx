import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUserEdit, 
  FaSave, 
  FaTimes, 
  FaUserCircle,
  FaPhone,
  FaBuilding,
  FaEnvelope,
  FaArrowLeft
} from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';

const StaffEditProfile = () => {
  const navigate = useNavigate();
  const [staffData, setStaffData] = useState(null);
  const [editForm, setEditForm] = useState({
    displayName: '',
    phone: '',
    department: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const user = localStorage.getItem('user');
        if (!user) {
          toast.error('Please login to continue');
          navigate('/login');
          return;
        }

        const parsedUser = JSON.parse(user);
        
        // Verify this is a staff user
        if (parsedUser.role !== 'staff') {
          toast.error('Access denied. Staff only.');
          navigate('/dashboard');
          return;
        }

        setStaffData(parsedUser);
        setEditForm({
          displayName: parsedUser.displayName || parsedUser.name || '',
          phone: parsedUser.phone || '',
          department: parsedUser.department || ''
        });
      } catch (error) {
        console.error('Error fetching staff data:', error);
        toast.error('Error loading profile data');
        navigate('/dashboard/staff');
      } finally {
        setLoading(false);
      }
    };

    fetchStaffData();
  }, [navigate]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveProfile = async () => {
    if (!staffData?.email) {
      toast.error('No user email found');
      return;
    }

    if (!editForm.displayName.trim()) {
      toast.error('Display name is required');
      return;
    }

    setIsSaving(true);
    
    // Show loading toast
    const loadingToast = toast.loading('Updating profile...');

    try {
      const response = await fetch(`https://public-infra-report-server.vercel.app/users/${staffData.email}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName: editForm.displayName.trim(),
          phone: editForm.phone.trim(),
          department: editForm.department.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        // Update local storage
        const updatedUser = {
          ...staffData,
          displayName: editForm.displayName.trim(),
          name: editForm.displayName.trim(),
          phone: editForm.phone.trim(),
          department: editForm.department.trim()
        };
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Dismiss loading toast and show success
        toast.dismiss(loadingToast);
        toast.success('Profile updated successfully!', {
          duration: 4000,
          icon: '✅'
        });
        
        // Navigate after a short delay
        setTimeout(() => {
          navigate('/dashboard/staff');
        }, 1500);
      } else {
        toast.dismiss(loadingToast);
        toast.error(data.message || 'Failed to update profile. Please try again.', {
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.dismiss(loadingToast);
      toast.error('Error updating profile. Please try again.', {
        duration: 5000
      });
    } finally {
      setIsSaving(false);
    }
  };

  const goBack = () => {
    navigate('/dashboard/staff');
  };

  if (loading) {
    return (
      <div className="p-6">
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 4000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="h-64 bg-gray-100 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 4000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
          loading: {
            duration: Infinity,
            style: {
              background: '#1E40AF',
              color: '#fff',
            },
          },
        }}
      />
      
      <div className="mb-6">
        <button
          onClick={goBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-4"
        >
          <FaArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-blue-100 rounded-lg">
            <FaUserEdit className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Edit Your Profile
            </h1>
            <p className="text-gray-600">
              Update your personal information and department details
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Current Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full mb-4">
                <FaUserCircle className="w-16 h-16 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                {staffData.displayName || staffData.name || 'Staff Member'}
              </h3>
              <p className="text-sm text-gray-600">{staffData.email}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FaUserCircle className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Current Name</p>
                  <p className="font-medium text-gray-900">
                    {staffData.displayName || staffData.name || 'Not set'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FaBuilding className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Current Department</p>
                  <p className="font-medium text-gray-900">
                    {staffData.department || 'Not set'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FaPhone className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Current Phone</p>
                  <p className="font-medium text-gray-900">
                    {staffData.phone || 'Not set'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FaEnvelope className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">
                    {staffData.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Edit Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Edit Profile Information</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name *
                </label>
                <input
                  type="text"
                  name="displayName"
                  value={editForm.displayName}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your display name"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  This name will be visible to administrators and citizens
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={editForm.department}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your department (e.g., Public Works, Sanitation)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your assigned department for issue resolution
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={editForm.phone}
                  onChange={handleEditChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your phone number"
                />
                <p className="text-xs text-gray-500 mt-1">
                  For administrative contact purposes only
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={goBack}
                    disabled={isSaving}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaTimes className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={saveProfile}
                    disabled={isSaving}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 flex-1"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Saving Changes...
                      </>
                    ) : (
                      <>
                        <FaSave className="w-4 h-4" />
                        Save Profile Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Note Section */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-800 mb-2">Important Notes</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Your email address cannot be changed</li>
              <li>• Profile updates will be reflected immediately</li>
              <li>• Changes are saved to our secure database</li>
              <li>• You can update your profile anytime</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffEditProfile;