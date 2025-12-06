import React from 'react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import useAuth from '../../Hooks/useAuth';



const Login = () => {
    const{register,handleSubmit,formState:{errors}}= useForm();
     const{loginUser,signInWithGoogle} =useAuth();


    const handleLogin = (data) => {
        console.log(data);
        loginUser(data.email,data.password)
        .then(result=>{
            console.log(result.user);
        })
        .catch(error=>{
            console.log(error.message);
        })
    }
    const handleSignInWithGoogle=()=>{
        signInWithGoogle()
        .then(result=>{
            console.log(result.user);
        })
        .catch(error=>{
            console.log(error.message);
        })
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
                                {/* emails */}
                                <label className="label">Email</label>
                                <input type="email"{...register('email',{required:true})} className="input" placeholder="Email" />
                                {errors.email?.type==='required' && <span className="text-red-600">This field is required</span>}
                                {/* password */}
                                <label className="label">Password</label>
                                <input type="password"{...register('password',{required:true,minLength:8})} className="input" placeholder="Password" />
                                {errors.password?.type==='minLength' && <span className="text-red-600">Password must be 8 characters</span>}
                                <div><a className="link link-hover">Forgot password?</a></div>
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

export default Login