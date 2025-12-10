import React, { useState } from 'react';
import { FaCamera, FaMapMarkerAlt, FaPaperPlane, FaTimes, FaExclamationCircle, FaImage, FaTrash, FaEye, FaUser, FaEnvelope } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import Swal from 'sweetalert2';
import axios from 'axios';

const SubmitIssue = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [errors, setErrors] = useState({});
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);

  // Get user from localStorage
  const getUserFromLocalStorage = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return {
          displayName: user.displayName || user.name || 'User',
          email: user.email || 'user@example.com',
          photoURL: user.photoURL || null
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  };

  const user = getUserFromLocalStorage();

  // Form state
  const [formData, setFormData] = useState({
    reporterName: user?.displayName || '',
    title: '',
    description: '',
    category: '',
    location: '',
    priority: 'normal'
  });

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + imagePreviews.length > 5) {
      Swal.fire({
        icon: 'warning',
        title: 'Too many images',
        text: 'You can upload maximum 5 images',
        timer: 3000,
      });
      return;
    }

    const oversizedFiles = files.filter(file => file.size > 2 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'File too large',
        text: 'Each image must be less than 2MB',
        timer: 3000,
      });
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    setImageFiles(prev => [...prev, ...files]);
  };

  // Remove image
  const removeImage = (index) => {
    Swal.fire({
      title: 'Remove this image?',
      text: 'This image will be removed from your upload list',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, remove it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        const newPreviews = [...imagePreviews];
        const newFiles = [...imageFiles];
        
        newPreviews.splice(index, 1);
        newFiles.splice(index, 1);
        
        setImagePreviews(newPreviews);
        setImageFiles(newFiles);
      }
    });
  };

  // Preview image in modal
  const previewImage = (index) => {
    Swal.fire({
      imageUrl: imagePreviews[index],
      imageAlt: `Image ${index + 1}`,
      showCloseButton: true,
      showConfirmButton: false,
      background: '#000',
    });
  };

  // Clear all images
  const clearAllImages = () => {
    if (imagePreviews.length === 0) return;
    
    Swal.fire({
      title: 'Clear all images?',
      text: 'This will remove all uploaded images',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, clear all',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        setImagePreviews([]);
        setImageFiles([]);
      }
    });
  };

  // Upload images to ImgBB
  const uploadImagesToImgBB = async () => {
    if (imageFiles.length === 0) return [];

    setUploadingImages(true);
    const uploadedUrls = [];

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const formdata = new FormData();
      formdata.append('image', file);

      try {
        const response = await axios.post(
          `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_image_host}`,
          formdata,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        if (response.data.success) {
          uploadedUrls.push(response.data.data.display_url);
          toast.success(`Image ${i + 1} uploaded`, { duration: 1000 });
        }
      } catch (error) {
        console.error(`Failed to upload image ${i + 1}:`, error);
        toast.error(`Failed to upload image ${i + 1}`);
      }
    }

    setUploadingImages(false);
    return uploadedUrls;
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!formData.reporterName.trim()) {
      newErrors.reporterName = 'Your name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fill all required fields correctly',
        timer: 3000,
      });
      return;
    }

    setLoading(true);

    try {
      // Step 1: Upload images to ImgBB
      let imageUrls = [];
      if (imageFiles.length > 0) {
        Swal.fire({
          title: 'Uploading Images...',
          text: 'Please wait while we upload your images',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        imageUrls = await uploadImagesToImgBB();
        Swal.close();
      }

      // Step 2: Prepare data for MongoDB
      const issueData = {
        _id: `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        location: formData.location,
        reportedBy: formData.reporterName,
        priority: formData.priority,
        status: 'pending',
        upvotes: 0,
        upvotedBy: [],
        images: imageUrls,
        image: imageUrls[0] || null,
        reportedAt: new Date().toISOString(),
        progress: 0,
        assignedTo: null,
        latitude: null,
        longitude: null,
        comments: [],
        timeline: [{
          status: 'pending',
          message: 'Issue reported by citizen',
          updatedBy: formData.reporterName,
          updatedAt: new Date().toISOString()
        }]
      };

      console.log('Submitting to MongoDB:', issueData);

      // Step 3: Send to backend
      const response = await axios.post('http://localhost:3000/issues', issueData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.data.success) {
        Swal.fire({
          icon: 'success',
          title: 'Issue Submitted!',
          html: `
            <div class="text-left">
              <p><strong>Issue saved to MongoDB successfully!</strong></p>
              <div class="mt-3 space-y-1 text-sm">
                <p><strong>ID:</strong> ${response.data.insertedId || issueData._id}</p>
                <p><strong>Title:</strong> ${issueData.title}</p>
                <p><strong>Category:</strong> ${issueData.category}</p>
                <p><strong>Status:</strong> ${issueData.status}</p>
                <p><strong>Reported By:</strong> ${issueData.reportedBy}</p>
              </div>
            </div>
          `,
          showConfirmButton: false,
          timer: 3000
        }).then(() => {
          navigate('/dashboard/my-issues');
        });
        
        // Clear form
        setFormData({
          reporterName: user?.displayName || '',
          title: '',
          description: '',
          category: '',
          location: '',
          priority: 'normal'
        });
        setImagePreviews([]);
        setImageFiles([]);
      } else {
        throw new Error(response.data.message || 'Submission failed');
      }

    } catch (error) {
      console.error('Error submitting issue:', error);
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        html: `
          <div class="text-left">
            <p>Failed to submit issue to MongoDB.</p>
            <p class="mt-2 text-sm text-gray-600">Error: ${error.message}</p>
          </div>
        `,
      });
    } finally {
      setLoading(false);
    }
  };

  // Clear form
  const clearForm = () => {
    Swal.fire({
      title: 'Clear form?',
      text: 'This will reset all form fields and images',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, clear all',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        setFormData({
          reporterName: user?.displayName || '',
          title: '',
          description: '',
          category: '',
          location: '',
          priority: 'normal'
        });
        setImagePreviews([]);
        setImageFiles([]);
        setErrors({});
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: { background: '#363636', color: '#fff' },
        }}
      />

      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Report Infrastructure Issue
          </h1>
          <p className="text-gray-600 text-lg">
            Help us improve public infrastructure by reporting problems in your area
          </p>
        </div>

        {/* User Info */}
        {user ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <FaUser className="text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-green-800">Logged In User</h3>
                <p className="text-sm text-green-700 mt-1">
                  <strong>Name:</strong> {user.displayName}
                </p>
                <p className="text-sm text-green-700">
                  <strong>Email:</strong> {user.email}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <FaExclamationCircle className="text-yellow-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-yellow-800">Not Logged In</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  You can still submit issues, but please provide your name.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* User Limit Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <FaExclamationCircle className="text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-800">Data Storage</h3>
              <p className="text-sm text-blue-700 mt-1">
                Your issue will be saved in MongoDB database with all required fields.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                <FaPaperPlane className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Report New Issue</h2>
                <p className="text-blue-100">Data will be saved to MongoDB</p>
              </div>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-6 md:p-8 space-y-6">
            {/* User Information */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaUser /> Your Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="reporterName"
                    value={formData.reporterName}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.reporterName ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.reporterName && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.reporterName}
                    </p>
                  )}
                </div>
                
                {user && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email (Auto-filled)
                    </label>
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-100 rounded-lg">
                      <FaEnvelope className="text-gray-500" />
                      <span className="text-gray-700">{user.email}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Issue Details */}
            <div className="space-y-6">
              <h3 className="font-semibold text-gray-800 text-lg">Issue Details</h3>
              
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Issue Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.title ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Large pothole on Main Street"
                />
                {errors.title && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Detailed Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.description ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Describe the issue in detail. Include size, location specifics, dangers, and when you noticed it..."
                />
                <div className="flex justify-between mt-2">
                  {errors.description && (
                    <p className="text-sm text-red-600">
                      {errors.description}
                    </p>
                  )}
                  <span className={`text-xs ml-auto ${
                    formData.description.length < 20 ? 'text-red-500' : 'text-gray-500'
                  }`}>
                    {formData.description.length}/500 characters
                  </span>
                </div>
              </div>

              {/* Category and Location Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.category ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a category</option>
                    <option value="Road Damage">Road Damage</option>
                    <option value="Street Lights">Street Lights</option>
                    <option value="Garbage">Garbage Overflow</option>
                    <option value="Water Leakage">Water Leakage</option>
                    <option value="Footpaths">Damaged Footpaths</option>
                    <option value="Drainage">Drainage Issues</option>
                    <option value="Traffic Signs">Traffic Signs</option>
                    <option value="Parks">Parks & Gardens</option>
                    <option value="Other">Other Issues</option>
                  </select>
                  {errors.category && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.category}
                    </p>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location *
                  </label>
                  <div className="relative">
                    <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.location ? 'border-red-500 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="e.g., Main Street, Dhaka"
                    />
                  </div>
                  {errors.location && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.location}
                    </p>
                  )}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Priority
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="priority"
                      value="normal"
                      checked={formData.priority === 'normal'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span className="text-gray-700">Normal</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="priority"
                      value="high"
                      checked={formData.priority === 'high'}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    <span className="text-gray-700">High (Urgent)</span>
                  </label>
                </div>
        
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 hover:border-blue-400 transition-colors">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-3">
                  <FaCamera className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  Upload Photos (Optional)
                </h3>
                <p className="text-sm text-gray-600">
                  Maximum 5 images, 2MB each. PNG, JPG, JPEG formats.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Images will be uploaded to ImgBB and URLs saved in MongoDB
                </p>
              </div>

              {/* Image Upload Area */}
              <label className="block cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={imagePreviews.length >= 5 || uploadingImages}
                />
                <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  imagePreviews.length >= 5 
                    ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
                    : uploadingImages
                    ? 'border-yellow-300 bg-yellow-50 cursor-not-allowed'
                    : 'border-blue-300 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 cursor-pointer'
                }`}>
                  <div className="flex flex-col items-center">
                    <FaImage className="w-12 h-12 text-blue-500 mb-3" />
                    <p className="text-gray-700 font-medium mb-1">
                      {imagePreviews.length >= 5 
                        ? 'Maximum images reached'
                        : uploadingImages
                        ? 'Uploading to ImgBB...'
                        : 'Click to upload or drag & drop'
                      }
                    </p>
                    <p className="text-sm text-gray-500">
                      {5 - imagePreviews.length} images remaining
                    </p>
                  </div>
                </div>
              </label>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-gray-800">
                      Uploaded Images ({imagePreviews.length}/5)
                    </h4>
                    <button
                      type="button"
                      onClick={clearAllImages}
                      className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={uploadingImages}
                    >
                      <FaTrash className="w-3 h-3" /> Clear All
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 group-hover:border-blue-400 transition-colors">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        {/* Image Overlay Actions */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => previewImage(index)}
                              className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors"
                              title="Preview"
                              disabled={uploadingImages}
                            >
                              <FaEye className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="bg-white text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                              title="Remove"
                              disabled={uploadingImages}
                            >
                              <FaTimes className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Image Number */}
                        <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded-full">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Form Footer */}
          <div className="bg-gray-50 px-6 md:px-8 py-4 border-t">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={clearForm}
                className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                disabled={loading || uploadingImages}
              >
                Clear Form
              </button>
              
              <div className="flex-1" />
              
              <button
                type="submit"
                disabled={loading || uploadingImages}
                className={`px-8 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                  loading || uploadingImages
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white shadow-lg hover:shadow-xl'
                }`}
              >
                {loading || uploadingImages ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    {uploadingImages ? 'Uploading Images...' : 'Saving to MongoDB...'}
                  </>
                ) : (
                  <>
                    <FaPaperPlane /> Submit Issue
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitIssue;