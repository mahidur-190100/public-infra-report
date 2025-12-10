// import React, { useState } from 'react'
// import { useForm } from 'react-hook-form';
// import { NavLink, useNavigate } from 'react-router-dom'
// import useAuth from '../../Hooks/useAuth';
// import axios from 'axios';
// import toast, { Toaster } from 'react-hot-toast';

// const Signup = () => {
//     const { register, handleSubmit, formState: { errors } } = useForm();
//     const { registerUser, updateUserProfile, logout } = useAuth();
//     const [loading, setLoading] = useState(false);
//     const navigate = useNavigate();
//     // const axiosSecure = useAxiosSecure();
    
//     const handleSignup = (data) => {
//         setLoading(true);
//         const profileImg = data.file[0];
        
//         registerUser(data.email, data.password)
//             .then(result => {
//                 console.log(result.user);

//                 // store the image in form data
//                 const formdata = new FormData();
//                 formdata.append('image', profileImg);

//                 const imageURL = `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_image_host}`;

//                 axios.post(imageURL, formdata)
//                     .then(res => {
//                        const photoUrl= res.data.data.display_url;





//                         // update user profile to firebase
//                         const userProfile = {
//                             displayName: `${data['First Name']} ${data['Last Name']}`,
//                             photoURL: photoUrl
//                         };

//                         updateUserProfile(userProfile)
//                             .then(() => {
//                                 toast.success('Account created successfully!');

//                                 // S LOGOUT USER IMMEDIATELY AFTER SIGNUP  
//                                 logout().then(() => {
//                                     setTimeout(() => {
//                                         navigate('/login');
//                                     }, 1500);
//                                 });

//                             })
//                             .catch(error => {
//                                 console.error(error);
//                                 toast.error('Failed to update profile!');
//                                 setLoading(false);
//                             });
//                     })
//                     .catch(error => {
//                         console.error(error);
//                         toast.error('Failed to upload image!');
//                         setLoading(false);
//                     });
//             })
//             .catch(error => {
//                 console.error(error);
//                 toast.error(error.message || 'Failed to create account!');
//                 setLoading(false);
//             });
//     };

//     return (
//         <div className="min-h-screen flex items-center justify-center p-4">
//             <Toaster 
//                 position="top-center"
//                 toastOptions={{
//                     duration: 3000,
//                     style: { background: '#363636', color: '#fff' },
//                     success: {
//                         duration: 2000,
//                         iconTheme: { primary: '#4ade80', secondary: '#fff' },
//                     },
//                 }}
//             />
            
//             <div className="card bg-white shadow-2xl w-full max-w-md">
//                 <div className="card-body p-8">
//                     <div className="text-center mb-8">
//                         <h1 className="text-3xl font-bold text-gray-800 mb-2">
//                             Join Public Infrastructure Report
//                         </h1>
//                         <p className="text-gray-600">
//                             Create an account to report infrastructure issues
//                         </p>
//                     </div>

//                     <form onSubmit={handleSubmit(handleSignup)} className="space-y-4">
//                         <fieldset className="fieldset">
//                             {/* Name Fields */}
//                             <div className="grid grid-cols-2 gap-2">
//                                 <div>
//                                     <label className="label">First Name</label>
//                                     <input 
//                                         type="text" 
//                                         {...register('First Name', { required: true })} 
//                                         className="input" 
//                                         placeholder="First Name" 
//                                     />
//                                     {errors['First Name'] && (
//                                         <p className="text-red-500 text-xs mt-1">First name is required</p>
//                                     )}
//                                 </div>
//                                 <div>
//                                     <label className="label">Last Name</label>
//                                     <input 
//                                         type="text" 
//                                         {...register('Last Name', { required: true })} 
//                                         className="input" 
//                                         placeholder="Last Name" 
//                                     />
//                                     {errors['Last Name'] && (
//                                         <p className="text-red-500 text-xs mt-1">Last name is required</p>
//                                     )}
//                                 </div>
//                             </div>

//                             {/* Email */}
//                             <label className="label">Email</label>
//                             <input 
//                                 type="email" 
//                                 {...register('email', { required: true })} 
//                                 className="input" 
//                                 placeholder="Email" 
//                             />
//                             {errors.email && (
//                                 <p className="text-red-500 text-xs mt-1">Email is required</p>
//                             )}

//                             {/* Photo */}
//                             <label className="label">Profile Photo</label>
//                             <input 
//                                 type="file" 
//                                 {...register('file', { required: true })} 
//                                 className="file-input file-input-bordered w-full" 
//                                 accept="image/*"
//                             />
//                             {errors.file && (
//                                 <p className="text-red-500 text-xs mt-1">Profile photo is required</p>
//                             )}

//                             {/* Phone Optional */}
//                             <label className="label">Phone Number (Optional)</label>
//                             <input 
//                                 type="tel" 
//                                 {...register('phone')} 
//                                 className="input" 
//                                 placeholder="Phone Number" 
//                             />

//                             {/* Password */}
//                             <label className="label">Password</label>
//                             <input 
//                                 type="password" 
//                                 {...register('password', { 
//                                     required: true, 
//                                     minLength: 8, 
//                                     pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/ 
//                                 })}
//                                 className="input" 
//                                 placeholder="Password" 
//                             />
//                             {errors.password?.type === 'required' && (
//                                 <p className="text-red-500 text-xs mt-1">Password is required</p>
//                             )}
//                             {errors.password?.type === 'minLength' && (
//                                 <p className="text-red-500 text-xs mt-1">Password must be at least 8 characters</p>
//                             )}
//                             {errors.password?.type === 'pattern' && (
//                                 <p className="text-red-500 text-xs mt-1">
//                                     Must include uppercase, lowercase, number, special character
//                                 </p>
//                             )}
//                         </fieldset>

//                         <button 
//                             type="submit" 
//                             className="btn btn-primary w-full mt-4"
//                             disabled={loading}
//                         >
//                             {loading ? (
//                                 <>
//                                     <span className="loading loading-spinner"></span>
//                                     Creating Account...
//                                 </>
//                             ) : 'Create Account'}
//                         </button>
//                     </form>

//                     <div className="divider">OR</div>

//                     <button className="btn btn-outline w-full gap-2">
//                         <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
//                             <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
//                         </svg>
//                         Sign up with Google
//                     </button>

//                     <div className="text-center mt-6">
//                         <p className="text-gray-600">
//                             Already have an account?{' '}
//                             <NavLink to="/login" className="link link-hover text-blue-600 font-semibold">
//                                 Login here
//                             </NavLink>
//                         </p>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Signup;







import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { NavLink, useNavigate } from 'react-router-dom'
import useAuth from '../../Hooks/useAuth';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

const Signup = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { registerUser, updateUserProfile, logout } = useAuth();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    
    const handleSignup = (data) => {
        setLoading(true);
        const profileImg = data.file[0];
        
        registerUser(data.email, data.password)
            .then(result => {
                console.log(result.user);

                // store the image in form data
                const formdata = new FormData();
                formdata.append('image', profileImg);

                const imageURL = `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_image_host}`;

                axios.post(imageURL, formdata)
                    .then(res => {
                        const photoUrl = res.data.data.display_url;

                        // update user profile to firebase
                        const userProfile = {
                            displayName: `${data['First Name']} ${data['Last Name']}`,
                            photoURL: photoUrl
                        };

                        updateUserProfile(userProfile)
                            .then(() => {
                                // ✅ CRITICAL: Save user to localStorage
                                const userData = {
                                    email: data.email,
                                    displayName: `${data['First Name']} ${data['Last Name']}`,
                                    photoURL: photoUrl,
                                    uid: result.user.uid,
                                    createdAt: new Date().toISOString()
                                };
                                
                                localStorage.setItem('user', JSON.stringify(userData));
                                console.log('✅ User saved to localStorage:', userData);
                                
                                toast.success('Account created successfully!');

                                // ✅ IMPORTANT: Send user data to your backend
                                axios.post('http://localhost:3000/users', userData)
                                    .then(backendRes => {
                                        console.log('User saved to backend:', backendRes.data);
                                    })
                                    .catch(backendError => {
                                        console.error('Error saving to backend:', backendError);
                                    });

                                // S LOGOUT USER IMMEDIATELY AFTER SIGNUP  
                                logout().then(() => {
                                    setTimeout(() => {
                                        navigate('/login');
                                    }, 1500);
                                });

                            })
                            .catch(error => {
                                console.error(error);
                                toast.error('Failed to update profile!');
                                setLoading(false);
                            });
                    })
                    .catch(error => {
                        console.error(error);
                        toast.error('Failed to upload image!');
                        setLoading(false);
                    });
            })
            .catch(error => {
                console.error(error);
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
                            {/* Name Fields */}
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

                            {/* Email */}
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

                            {/* Photo */}
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

                            {/* Phone Optional */}
                            <label className="label">Phone Number (Optional)</label>
                            <input 
                                type="tel" 
                                {...register('phone')} 
                                className="input" 
                                placeholder="Phone Number" 
                            />

                            {/* Password */}
                            <label className="label">Password</label>
                            <input 
                                type="password" 
                                {...register('password', { 
                                    required: true, 
                                    minLength: 8, 
                                    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/ 
                                })}
                                className="input" 
                                placeholder="Password" 
                            />
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

                    <button className="btn btn-outline w-full gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                        </svg>
                        Sign up with Google
                    </button>

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