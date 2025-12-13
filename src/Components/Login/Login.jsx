// Login.jsx - Complete updated version with block check
import React from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../../Hooks/useAuth';
import axios from 'axios';

const Login = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { loginUser, signInWithGoogle, signOutUser } = useAuth(); // Added signOutUser
    const navigate = useNavigate();

    const handleLogin = (data) => {
        console.log("=== LOGIN DEBUG START ===");
        console.log("Login attempt with:", data.email);
        
        loginUser(data.email, data.password)
            .then(result => {
                console.log("✅ Firebase login successful:", result.user.email);
                
                // ✅ First, check if this user exists in MongoDB
                console.log(`🔍 Checking backend for user: ${result.user.email}`);
                axios.get(`http://localhost:3000/users/${result.user.email}`)
                    .then(response => {
                        console.log("✅ Backend response:", response.data);
                        
                        if (response.data.success) {
                            const userData = response.data.user;
                            console.log("✅ User data from MongoDB:", userData);
                            
                            // ✅ CHECK IF USER IS BLOCKED
                            if (userData.blocked === true) {
                                console.log('🚫 USER IS BLOCKED:', userData.email);
                                
                                // Sign out from Firebase
                                signOutUser()
                                    .then(() => {
                                        console.log('✅ Signed out blocked user from Firebase');
                                        
                                        // Clear any existing storage
                                        localStorage.removeItem('user');
                                        localStorage.removeItem('admin');
                                        
                                        alert('🚫 Your account has been blocked. Please contact the administrator.');
                                    })
                                    .catch(signOutError => {
                                        console.error('❌ Error signing out:', signOutError);
                                    });
                                
                                return; // Stop further execution
                            }
                            
                            console.log("✅ User role:", userData.role);
                            console.log("✅ Is admin (role === 'admin'):", userData.role === 'admin');
                            
                            // ✅ CHECK IF USER IS ADMIN
                            if (userData.role === 'admin') {
                                console.log('🎯 ADMIN DETECTED FROM BACKEND:', userData.email);
                                
                                // Save as ADMIN to localStorage
                                const adminData = {
                                    email: userData.email,
                                    displayName: userData.displayName || userData.email.split('@')[0],
                                    photoURL: result.user.photoURL || userData.photoURL,
                                    uid: result.user.uid,
                                    role: 'admin',
                                    isAdmin: true,
                                    lastLogin: new Date().toISOString()
                                };
                                
                                localStorage.setItem('admin', JSON.stringify(adminData));
                                console.log('✅ Admin saved to localStorage:', adminData);
                                
                                // Clear regular user data if exists
                                localStorage.removeItem('user');
                                console.log('✅ Removed user data from localStorage');
                                
                                // Navigate to DASHBOARD
                                console.log('✅ Navigating to /dashboard');
                                navigate('/dashboard');
                                
                            } else {
                                // Regular user
                                console.log('✅ Regular user detected');
                                
                                // Save as REGULAR USER to localStorage
                                const userDataObj = {
                                    email: result.user.email,
                                    displayName: result.user.displayName || result.user.email.split('@')[0],
                                    photoURL: result.user.photoURL || userData.photoURL,
                                    uid: result.user.uid,
                                    role: 'user',
                                    lastLogin: new Date().toISOString()
                                };
                                
                                localStorage.setItem('user', JSON.stringify(userDataObj));
                                console.log('✅ User saved to localStorage:', userDataObj);
                                
                                // Clear admin data if exists
                                localStorage.removeItem('admin');
                                console.log('✅ Removed admin data from localStorage');
                                
                                // Navigate to DASHBOARD
                                console.log('✅ Navigating to /dashboard');
                                navigate('/dashboard');
                            }
                        }
                    })
                    .catch(error => {
                        console.log("❌ User not found in backend:", error.message);
                        console.log("Creating as regular user...");
                        
                        // User doesn't exist in backend - create as regular user
                        const newUser = {
                            email: result.user.email,
                            displayName: result.user.displayName || result.user.email.split('@')[0],
                            photoURL: result.user.photoURL,
                            uid: result.user.uid,
                            role: 'user', // Default role
                            blocked: false, // Default not blocked
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        };
                        
                        console.log("Creating new user in backend:", newUser);
                        
                        // Save to backend
                        axios.post('http://localhost:3000/users', newUser)
                            .then(() => {
                                // Save as regular user to localStorage
                                localStorage.setItem('user', JSON.stringify(newUser));
                                localStorage.removeItem('admin');
                                console.log('✅ New regular user created and saved to localStorage');
                                
                                // Navigate to dashboard
                                navigate('/dashboard');
                            })
                            .catch(backendError => {
                                console.error('❌ Error creating user in backend:', backendError);
                                // Still save to localStorage and navigate
                                localStorage.setItem('user', JSON.stringify(newUser));
                                localStorage.removeItem('admin');
                                navigate('/dashboard');
                            });
                    });
            })
            .catch(error => {
                console.log("❌ Firebase login error:", error.message);
                if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
                    alert('Invalid email or password');
                } else {
                    alert('Login failed: ' + error.message);
                }
            });
        
        console.log("=== LOGIN DEBUG END ===");
    }

    const handleSignInWithGoogle = () => {
        signInWithGoogle()
            .then(result => {
                console.log("Google login successful:", result.user);
                
                // ✅ Check if this Google user exists
                axios.get(`http://localhost:3000/users/${result.user.email}`)
                    .then(response => {
                        if (response.data.success) {
                            const userData = response.data.user;
                            
                            // ✅ CHECK IF USER IS BLOCKED
                            if (userData.blocked === true) {
                                console.log('🚫 USER IS BLOCKED:', userData.email);
                                
                                // Sign out from Firebase
                                signOutUser()
                                    .then(() => {
                                        console.log('✅ Signed out blocked user from Firebase');
                                        
                                        // Clear any existing storage
                                        localStorage.removeItem('user');
                                        localStorage.removeItem('admin');
                                        
                                        alert('🚫 Your account has been blocked. Please contact the administrator.');
                                    })
                                    .catch(signOutError => {
                                        console.error('❌ Error signing out:', signOutError);
                                    });
                                
                                return; // Stop further execution
                            }
                            
                            if (userData.role === 'admin') {
                                // Save as ADMIN
                                localStorage.setItem('admin', JSON.stringify({
                                    email: userData.email,
                                    displayName: userData.displayName || userData.email.split('@')[0],
                                    photoURL: result.user.photoURL || userData.photoURL,
                                    uid: result.user.uid,
                                    role: 'admin',
                                    isAdmin: true,
                                    provider: 'google',
                                    lastLogin: new Date().toISOString()
                                }));
                                localStorage.removeItem('user');
                                navigate('/dashboard');
                            } else {
                                // Save as regular user
                                localStorage.setItem('user', JSON.stringify({
                                    email: result.user.email,
                                    displayName: result.user.displayName || result.user.email.split('@')[0],
                                    photoURL: result.user.photoURL || userData.photoURL,
                                    uid: result.user.uid,
                                    role: 'user',
                                    provider: 'google',
                                    lastLogin: new Date().toISOString()
                                }));
                                localStorage.removeItem('admin');
                                navigate('/dashboard');
                            }
                        }
                    })
                    .catch(error => {
                        // Google user doesn't exist in backend - create as regular user
                        const newUser = {
                            email: result.user.email,
                            displayName: result.user.displayName || result.user.email.split('@')[0],
                            photoURL: result.user.photoURL,
                            uid: result.user.uid,
                            role: 'user',
                            provider: 'google',
                            blocked: false,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        };
                        
                        axios.post('http://localhost:3000/users', newUser)
                            .then(() => {
                                localStorage.setItem('user', JSON.stringify(newUser));
                                localStorage.removeItem('admin');
                                navigate('/dashboard');
                            })
                            .catch(backendError => {
                                localStorage.setItem('user', JSON.stringify(newUser));
                                localStorage.removeItem('admin');
                                navigate('/dashboard');
                            });
                    });
            })
            .catch(error => {
                console.log("Google login error:", error.message);
                alert('Google login failed: ' + error.message);
            });
    }

    return (
        <div>
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="card bg-white shadow-2xl w-full max-w-md">
                    <div className="card-body p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Public Infrastructure Report</h1>
                            <p className="text-gray-600">Login to report and track infrastructure issues</p>
                        </div>

                        <form className="space-y-4" onSubmit={handleSubmit(handleLogin)}>
                            <fieldset className="fieldset">
                                {/* Email */}
                                <label className="label">Email</label>
                                <input 
                                    type="email" 
                                    {...register('email', { required: true })} 
                                    className="input" 
                                    placeholder="Email" 
                                />
                                {errors.email?.type === 'required' && <span className="text-red-600">Email is required</span>}
                                
                                {/* Password */}
                                <label className="label">Password</label>
                                <input 
                                    type="password" 
                                    {...register('password', { required: true, minLength: 8 })} 
                                    className="input" 
                                    placeholder="Password" 
                                />
                                {errors.password?.type === 'minLength' && <span className="text-red-600">Password must be 8 characters</span>}
                                
                                <div className="text-right">
                                    <a className="link link-hover text-sm text-blue-600">Forgot password?</a>
                                </div>
                            </fieldset>

                            <button type="submit" className="btn btn-primary w-full">
                                Login
                            </button>
                        </form>

                        <div className="divider">OR</div>

                        <div className="space-y-3">
                            <button onClick={handleSignInWithGoogle}
                                className="btn btn-outline w-full gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                                </svg>
                                Continue with Google
                            </button>
                        </div>

                        <div className="text-center mt-6">
                            <p className="text-gray-600">
                                New to Public Infrastructure Report?{' '}
                                <Link to="/signup" className="link link-hover text-blue-600 font-semibold">
                                    Create Account
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login;