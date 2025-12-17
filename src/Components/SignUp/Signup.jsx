import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { NavLink, useNavigate } from 'react-router-dom'
import useAuth from '../../Hooks/useAuth';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Signup = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { registerUser, updateUserProfile, logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordValue, setPasswordValue] = useState('');
    const navigate = useNavigate();
    
    // Toggle password visibility
    const handleTogglePassword = () => {
        setShowPassword(!showPassword);
    };

    // Handle password input change
    const handlePasswordChange = (e) => {
        setPasswordValue(e.target.value);
    };

    const handleSignup = (data) => {
        setLoading(true);
        const profileImg = data.file[0];
        
        registerUser(data.email, data.password)
            .then(result => {
                const formdata = new FormData();
                formdata.append('image', profileImg);

                const imageURL = `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_image_host}`;

                axios.post(imageURL, formdata)
                    .then(res => {
                        const photoUrl = res.data.data.display_url;

                        const userProfile = {
                            displayName: `${data['First Name']} ${data['Last Name']}`,
                            photoURL: photoUrl
                        };

                        updateUserProfile(userProfile)
                            .then(() => {
                                const userData = {
                                    email: data.email,
                                    displayName: `${data['First Name']} ${data['Last Name']}`,
                                    photoURL: photoUrl,
                                    uid: result.user.uid,
                                    createdAt: new Date().toISOString()
                                };
                                
                                localStorage.setItem('user', JSON.stringify(userData));
                                
                                toast.success('Account created successfully!');

                                axios.post('https://public-infra-report-server.vercel.app/users', userData)
                                    .catch(backendError => {
                                        // Handle backend error silently
                                    });

                                logout().then(() => {
                                    setTimeout(() => {
                                        navigate('/login');
                                    }, 1500);
                                });
                            })
                            .catch(error => {
                                toast.error('Failed to update profile!');
                                setLoading(false);
                            });
                    })
                    .catch(error => {
                        toast.error('Failed to upload image!');
                        setLoading(false);
                    });
            })
            .catch(error => {
                toast.error(error.message || 'Failed to create account!');
                setLoading(false);
            });
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Toaster 
                position="top-center"
                toastOptions={{
                    duration: 3000,
                    style: { background: '#363636', color: '#fff' },
                    success: {
                        duration: 2000,
                        iconTheme: { primary: '#4ade80', secondary: '#fff' },
                    },
                }}
            />
            
            <div className="card bg-white shadow-2xl w-full max-w-md">
                <div className="card-body p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            Join Public Infrastructure Report
                        </h1>
                        <p className="text-gray-600">
                            Create an account to report infrastructure issues
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(handleSignup)} className="space-y-4">
                        <fieldset className="fieldset">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="label">First Name</label>
                                    <input 
                                        type="text" 
                                        {...register('First Name', { required: true })} 
                                        className="input" 
                                        placeholder="First Name" 
                                    />
                                    {errors['First Name'] && (
                                        <p className="text-red-500 text-xs mt-1">First name is required</p>
                                    )}
                                </div>
                                <div>
                                    <label className="label">Last Name</label>
                                    <input 
                                        type="text" 
                                        {...register('Last Name', { required: true })} 
                                        className="input" 
                                        placeholder="Last Name" 
                                    />
                                    {errors['Last Name'] && (
                                        <p className="text-red-500 text-xs mt-1">Last name is required</p>
                                    )}
                                </div>
                            </div>

                            <label className="label">Email</label>
                            <input 
                                type="email" 
                                {...register('email', { required: true })} 
                                className="input" 
                                placeholder="Email" 
                            />
                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1">Email is required</p>
                            )}

                            <label className="label">Profile Photo</label>
                            <input 
                                type="file" 
                                {...register('file', { required: true })} 
                                className="file-input file-input-bordered w-full" 
                                accept="image/*"
                            />
                            {errors.file && (
                                <p className="text-red-500 text-xs mt-1">Profile photo is required</p>
                            )}

                            <label className="label">Phone Number (Optional)</label>
                            <input 
                                type="tel" 
                                {...register('phone')} 
                                className="input" 
                                placeholder="Phone Number" 
                            />

                            <label className="label">Password</label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    {...register('password', { 
                                        required: true, 
                                        minLength: 8, 
                                        pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/ 
                                    })}
                                    className="input w-full pr-10" 
                                    placeholder="Password" 
                                    value={passwordValue}
                                    onChange={handlePasswordChange}
                                />
                                {passwordValue.length > 0 && (
                                    <motion.button
                                        type="button"
                                        onClick={handleTogglePassword}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        whileTap={{ scale: 0.9 }}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {showPassword ? (
                                            <motion.div
                                                key="eye-slash"
                                                initial={{ opacity: 0, rotate: -90 }}
                                                animate={{ opacity: 1, rotate: 0 }}
                                                exit={{ opacity: 0, rotate: 90 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <FaEyeSlash className="w-5 h-5 text-gray-500 hover:text-gray-700 transition-colors" />
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="eye"
                                                initial={{ opacity: 0, rotate: -90 }}
                                                animate={{ opacity: 1, rotate: 0 }}
                                                exit={{ opacity: 0, rotate: 90 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <FaEye className="w-5 h-5 text-gray-500 hover:text-gray-700 transition-colors" />
                                            </motion.div>
                                        )}
                                    </motion.button>
                                )}
                            </div>
                            {errors.password?.type === 'required' && (
                                <p className="text-red-500 text-xs mt-1">Password is required</p>
                            )}
                            {errors.password?.type === 'minLength' && (
                                <p className="text-red-500 text-xs mt-1">Password must be at least 8 characters</p>
                            )}
                            {errors.password?.type === 'pattern' && (
                                <p className="text-red-500 text-xs mt-1">
                                    Must include uppercase, lowercase, number, special character
                                </p>
                            )}
                        </fieldset>

                        <button 
                            type="submit" 
                            className="btn btn-primary w-full mt-4"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="loading loading-spinner"></span>
                                    Creating Account...
                                </>
                            ) : 'Create Account'}
                        </button>
                    </form>

                    <div className="divider">OR</div>

                    <div className="text-center mt-6">
                        <p className="text-gray-600">
                            Already have an account?{' '}
                            <NavLink to="/login" className="link link-hover text-blue-600 font-semibold">
                                Login here
                            </NavLink>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;