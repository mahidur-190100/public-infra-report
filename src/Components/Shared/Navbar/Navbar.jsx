import React from 'react'
import logo from '../../../assets/logo.png'
import { Link, NavLink } from 'react-router-dom'
import useAuth from '../../../Hooks/useAuth'

const Navbar = () => {
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout()
            .then()
            .catch(error => {
                console.log(error.message);
            });
    }; 

    const links = <>
        <li><NavLink to="/" className={({ isActive }) => isActive ? 'bg-blue-700 text-white' : 'hover:bg-blue-700'}>Home</NavLink></li>
        <li><NavLink to="/issues" className={({ isActive }) => isActive ? 'bg-blue-700 text-white' : 'hover:bg-blue-700'}>All Issues</NavLink></li>
        <li><NavLink to="/about" className={({ isActive }) => isActive ? 'bg-blue-700 text-white' : 'hover:bg-blue-700'}>About</NavLink></li>
        <li><NavLink to="/contact" className={({ isActive }) => isActive ? 'bg-blue-700 text-white' : 'hover:bg-blue-700'}>Contact Us</NavLink></li>
    </>

    return (
        <nav className="w-full bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
            <div className="container mx-auto px-2 sm:px-4">
                <div className="navbar min-h-0">
                    <div className="navbar-start">
                        <div className="dropdown">
                            <div tabIndex={0} role="button" className="btn btn-ghost text-white lg:hidden p-1 sm:p-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                                </svg>
                            </div>
                            <ul
                                tabIndex="-1"
                                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-50 mt-3 w-52 p-2 shadow">
                                {links}
                            </ul>
                        </div>
                        {/* Logo + website name */}
                        <NavLink to="/" className="btn btn-ghost text-white hover:bg-blue-700 p-0 sm:p-2 min-h-0 h-auto">
                            <img
                                src={logo}
                                alt="Public Infra Report logo"
                                className="h-8 w-8 sm:h-10 sm:w-10 object-contain"
                            />
                            <span className="font-bold text-base sm:text-xl ml-2">Public Infra Report</span>
                        </NavLink>
                    </div>
                    <div className="navbar-center hidden lg:flex">
                        <ul className="menu menu-horizontal px-1 text-white">
                            {links}
                        </ul>
                    </div>
                    <div className="navbar-end gap-1 sm:gap-2">
                        {user ? (
                            <>
                                <div className="dropdown dropdown-end">
                                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar p-1">
                                        {user.photoURL ? (
                                            <img
                                                src={user.photoURL}
                                                alt={user.displayName || 'User'}
                                                className="w-8 sm:w-10 rounded-full border-2 border-white"
                                                referrerPolicy="no-referrer"
                                            />
                                        ) : (
                                            <div className="w-8 sm:w-10 rounded-full bg-white flex items-center justify-center">
                                                <span className="text-blue-600 font-bold text-sm sm:text-base">
                                                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <ul
                                        tabIndex={0}
                                        className="menu menu-sm dropdown-content bg-base-100 rounded-box z-50 mt-3 w-52 p-2 shadow">
                                        <li className="px-4 py-2 border-b">
                                            <div className="font-semibold">{user.displayName}</div>
                                            <div className="text-xs text-gray-500 truncate">{user.email}</div>
                                        </li>
                                        <li><NavLink to="/my-reports">My Reports</NavLink></li>
                                        <li><NavLink to="/settings">Settings</NavLink></li>
                                        <li><hr /></li>
                                        <li><a onClick={handleLogout} className="text-red-600 cursor-pointer">Logout</a></li>
                                    </ul>
                                </div>
                            </>
                        ) : (
                            // User is not logged in - show login/signup
                            <>
                                <NavLink to="/login" className="btn btn-outline btn-primary text-white border-white hover:bg-white hover:text-blue-600 btn-xs sm:btn-sm px-2 sm:px-4">
                                    Login
                                </NavLink>
                                <NavLink to="/signup" className="btn btn-primary text-white bg-blue-500 hover:bg-blue-700 btn-xs sm:btn-sm px-2 sm:px-4">
                                    Sign Up
                                </NavLink>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;