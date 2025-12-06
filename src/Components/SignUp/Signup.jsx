import React from 'react'
import { useForm } from 'react-hook-form';
import { NavLink } from 'react-router-dom'

const Signup = () => {
    const {register,handleSubmit, formState:{errors}}= useForm();
    const handleSignup =(data)=>{
        console.log(data);

    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="card bg-white shadow-2xl w-full max-w-md">
                <div className="card-body p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Join Public Infrastructure Report</h1>
                        <p className="text-gray-600">Create an account to report infrastructure issues</p>
                    </div>

                    <form onSubmit={handleSubmit(handleSignup)}
                     className="space-y-4">
                        <fieldset className="fieldset">
                            {/* Name Fields */}
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="label">First Name</label>
                                    <input type="text" {...register('First Name')} className="input" placeholder="First Name" />
                                </div>
                                <div>
                                    <label className="label">Last Name</label>
                                    <input type="text" {...register('Last Name')} className="input" placeholder="Last Name" />
                                </div>
                            </div>
                            {/* emails */}
                            <label className="label">Email</label>
                            <input type="email"{...register('email', {required: true})} className="input" placeholder="Email" />
                            {errors.email?.type === 'required' && <p className="text-red-500">This field is required</p>}
                            
                            <label className="label">Phone Number</label>
                            <input type="tel" className="input" placeholder="Phone Number" />

                            {/* passowrd */}
                            <label className="label">Password</label>
                            <input type="password"{...register('password', {required: true, minLength: 6})} className="input" placeholder="Password" />
                            {
                                errors.password?.type === 'required' && <p className="text-red-500">This field is required</p>
                            }
                            {
                                errors.password?.type === 'minLength' && <p className="text-red-500">Password must be at least 6 characters</p>
                            }
                        </fieldset>


                        <button type="submit" className="btn btn-primary w-full mt-4">
                            Create Account
                        </button>
                    </form>

                    <div className="divider">OR</div>

                    <div className="space-y-3">
                        <button className="btn btn-outline w-full gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                            </svg>
                            Sign up with Google
                        </button>
                    </div>

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
    )
}

export default Signup