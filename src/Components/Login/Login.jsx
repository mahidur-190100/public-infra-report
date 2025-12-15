// Login.jsx - Updated version with proper block handling
import React from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../../Hooks/useAuth';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast'; // Add toast

const Login = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { loginUser, signInWithGoogle, signOutUser } = useAuth();
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
                            
                            // ✅ CHECK IF USER IS BLOCKED - IMPROVED
                            if (userData.blocked === true) {
                                console.log('🚫 USER IS BLOCKED:', userData.email);
                                
                                // Show toast notification
                                toast.error(
                                    <div>
                                        <div className="font-bold">🚫 Account Blocked</div>
                                        <div className="text-sm">Your account has been blocked by administrator.</div>
                                        {userData.blockReason && (
                                            <div className="text-xs mt-1">Reason: {userData.blockReason}</div>
                                        )}
                                    </div>,
                                    {
                                        duration: 5000,
                                        style: {
                                            background: '#FEE2E2',
                                            color: '#DC2626',
                                            border: '1px solid #FCA5A5'
                                        }
                                    }
                                );
                                
                                // Sign out from Firebase immediately
                                signOutUser()
                                    .then(() => {
                                        console.log('✅ Signed out blocked user from Firebase');
                                        
                                        // Clear any existing storage
                                        localStorage.removeItem('user');
                                        localStorage.removeItem('admin');
                                        localStorage.removeItem('staff');
                                        
                                        // Don't navigate anywhere, stay on login page
                                    })
                                    .catch(signOutError => {
                                        console.error('❌ Error signing out:', signOutError);
                                        toast.error('Failed to sign out. Please refresh the page.');
                                    });
                                
                                return; // Stop further execution
                            }
                            
                            console.log("✅ User role:", userData.role);
                            
                            // ✅ DETERMINE USER TYPE AND REDIRECT
                            const userRole = userData.role || 'user';
                            
                            // Prepare user data object
                            const userSessionData = {
                                email: userData.email,
                                displayName: userData.displayName || userData.email.split('@')[0],
                                photoURL: result.user.photoURL || userData.photoURL,
                                uid: result.user.uid,
                                role: userRole,
                                name: userData.name || userData.displayName,
                                id: userData._id || userData.email,
                                createdAt: userData.createdAt,
                                isPremium: userData.isPremium || false,
                                blocked: userData.blocked || false,
                                lastLogin: new Date().toISOString()
                            };
                            
                            // Clear all localStorage first
                            localStorage.removeItem('user');
                            localStorage.removeItem('admin');
                            localStorage.removeItem('staff');
                            
                            // Save to appropriate localStorage and navigate based on role
                            switch(userRole) {
                                case 'admin':
                                    console.log('🎯 ADMIN DETECTED FROM BACKEND:', userData.email);
                                    userSessionData.isAdmin = true;
                                    localStorage.setItem('admin', JSON.stringify(userSessionData));
                                    console.log('✅ Admin saved to localStorage');
                                    toast.success(`Welcome Admin ${userSessionData.displayName}!`, {
                                        icon: '👑'
                                    });
                                    navigate('/dashboard/admin');
                                    break;
                                    
                                case 'staff':
                                    console.log('👔 STAFF DETECTED FROM BACKEND:', userData.email);
                                    userSessionData.isStaff = true;
                                    localStorage.setItem('user', JSON.stringify(userSessionData));
                                    console.log('✅ Staff saved to localStorage');
                                    toast.success(`Welcome Staff ${userSessionData.displayName}!`, {
                                        icon: '👨‍💼'
                                    });
                                    navigate('/dashboard/staff');
                                    break;
                                    
                                case 'user':
                                default:
                                    console.log('👤 REGULAR USER DETECTED:', userData.email);
                                    localStorage.setItem('user', JSON.stringify(userSessionData));
                                    console.log('✅ User saved to localStorage');
                                    toast.success(`Welcome ${userSessionData.displayName}!`, {
                                        icon: '👋'
                                    });
                                    navigate('/dashboard');
                                    break;
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
                            isPremium: false,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        };
                        
                        console.log("Creating new user in backend:", newUser);
                        
                        // Save to backend
                        axios.post('http://localhost:3000/users', newUser)
                            .then(() => {
                                // Clear all localStorage
                                localStorage.removeItem('user');
                                localStorage.removeItem('admin');
                                localStorage.removeItem('staff');
                                
                                // Save as regular user
                                const userSessionData = {
                                    ...newUser,
                                    lastLogin: new Date().toISOString()
                                };
                                localStorage.setItem('user', JSON.stringify(userSessionData));
                                console.log('✅ New regular user created and saved to localStorage');
                                
                                toast.success(`Welcome ${userSessionData.displayName}!`, {
                                    icon: '🎉'
                                });
                                
                                // Navigate to regular user dashboard
                                navigate('/dashboard');
                            })
                            .catch(backendError => {
                                console.error('❌ Error creating user in backend:', backendError);
                                // Still save to localStorage and navigate
                                localStorage.removeItem('user');
                                localStorage.removeItem('admin');
                                localStorage.removeItem('staff');
                                
                                const userSessionData = {
                                    ...newUser,
                                    lastLogin: new Date().toISOString()
                                };
                                localStorage.setItem('user', JSON.stringify(userSessionData));
                                
                                toast.success(`Welcome ${userSessionData.displayName}!`, {
                                    icon: '👋'
                                });
                                
                                navigate('/dashboard');
                            });
                    });
            })
            .catch(error => {
                console.log("❌ Firebase login error:", error.message);
                
                // Show appropriate error messages
                if (error.code === 'auth/wrong-password') {
                    toast.error('Invalid password. Please try again.', {
                        icon: '🔒'
                    });
                } else if (error.code === 'auth/user-not-found') {
                    toast.error('No account found with this email.', {
                        icon: '📧'
                    });
                } else if (error.code === 'auth/too-many-requests') {
                    toast.error('Too many failed attempts. Try again later.', {
                        icon: '⏱️'
                    });
                } else {
                    toast.error('Login failed: ' + error.message, {
                        icon: '❌'
                    });
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
                                
                                // Show toast notification
                                toast.error(
                                    <div>
                                        <div className="font-bold">🚫 Account Blocked</div>
                                        <div className="text-sm">Your account has been blocked by administrator.</div>
                                        {userData.blockReason && (
                                            <div className="text-xs mt-1">Reason: {userData.blockReason}</div>
                                        )}
                                    </div>,
                                    {
                                        duration: 5000,
                                        style: {
                                            background: '#FEE2E2',
                                            color: '#DC2626',
                                            border: '1px solid #FCA5A5'
                                        }
                                    }
                                );
                                
                                // Sign out from Firebase
                                signOutUser()
                                    .then(() => {
                                        console.log('✅ Signed out blocked user from Firebase');
                                        
                                        // Clear any existing storage
                                        localStorage.removeItem('user');
                                        localStorage.removeItem('admin');
                                        localStorage.removeItem('staff');
                                    })
                                    .catch(signOutError => {
                                        console.error('❌ Error signing out:', signOutError);
                                        toast.error('Failed to sign out. Please refresh the page.');
                                    });
                                
                                return; // Stop further execution
                            }
                            
                            // ✅ DETERMINE USER TYPE AND REDIRECT
                            const userRole = userData.role || 'user';
                            
                            // Prepare user data object
                            const userSessionData = {
                                email: userData.email,
                                displayName: userData.displayName || result.user.displayName || userData.email.split('@')[0],
                                photoURL: result.user.photoURL || userData.photoURL,
                                uid: result.user.uid,
                                role: userRole,
                                provider: 'google',
                                name: userData.name || userData.displayName,
                                id: userData._id || userData.email,
                                createdAt: userData.createdAt,
                                isPremium: userData.isPremium || false,
                                blocked: userData.blocked || false,
                                lastLogin: new Date().toISOString()
                            };
                            
                            // Clear all localStorage first
                            localStorage.removeItem('user');
                            localStorage.removeItem('admin');
                            localStorage.removeItem('staff');
                            
                            // Save and navigate based on role
                            switch(userRole) {
                                case 'admin':
                                    console.log('🎯 ADMIN DETECTED (Google):', userData.email);
                                    userSessionData.isAdmin = true;
                                    localStorage.setItem('admin', JSON.stringify(userSessionData));
                                    toast.success(`Welcome Admin ${userSessionData.displayName}!`, {
                                        icon: '👑'
                                    });
                                    navigate('/dashboard/admin');
                                    break;
                                    
                                case 'staff':
                                    console.log('👔 STAFF DETECTED (Google):', userData.email);
                                    userSessionData.isStaff = true;
                                    localStorage.setItem('user', JSON.stringify(userSessionData));
                                    toast.success(`Welcome Staff ${userSessionData.displayName}!`, {
                                        icon: '👨‍💼'
                                    });
                                    navigate('/dashboard/staff');
                                    break;
                                    
                                case 'user':
                                default:
                                    console.log('👤 REGULAR USER (Google):', userData.email);
                                    localStorage.setItem('user', JSON.stringify(userSessionData));
                                    toast.success(`Welcome ${userSessionData.displayName}!`, {
                                        icon: '👋'
                                    });
                                    navigate('/dashboard');
                                    break;
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
                            isPremium: false,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        };
                        
                        axios.post('http://localhost:3000/users', newUser)
                            .then(() => {
                                localStorage.removeItem('user');
                                localStorage.removeItem('admin');
                                localStorage.removeItem('staff');
                                
                                const userSessionData = {
                                    ...newUser,
                                    lastLogin: new Date().toISOString()
                                };
                                localStorage.setItem('user', JSON.stringify(userSessionData));
                                
                                toast.success(`Welcome ${userSessionData.displayName}!`, {
                                    icon: '🎉'
                                });
                                
                                navigate('/dashboard');
                            })
                            .catch(backendError => {
                                localStorage.removeItem('user');
                                localStorage.removeItem('admin');
                                localStorage.removeItem('staff');
                                
                                const userSessionData = {
                                    ...newUser,
                                    lastLogin: new Date().toISOString()
                                };
                                localStorage.setItem('user', JSON.stringify(userSessionData));
                                
                                toast.success(`Welcome ${userSessionData.displayName}!`, {
                                    icon: '👋'
                                });
                                
                                navigate('/dashboard');
                            });
                    });
            })
            .catch(error => {
                console.log("Google login error:", error.message);
                toast.error('Google login failed: ' + error.message, {
                    icon: '❌'
                });
            });
    }

    return (
        <div>
            <Toaster 
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        duration: 3000,
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
            
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="card bg-white shadow-2xl w-full max-w-md">
                    <div className="card-body p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">Public Infrastructure Report</h1>
                            <p className="text-gray-600">Login to report and track infrastructure issues</p>
                            <div className="mt-4 flex justify-center gap-3">
                                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">User</span>
                                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Staff</span>
                                <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Admin</span>
                            </div>
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