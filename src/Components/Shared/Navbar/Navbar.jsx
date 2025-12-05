import React from 'react'
import logo from '../../../assets/logo.png'
import { NavLink } from 'react-router-dom'
const Navbar = () => {
    const links = <>
        <li><NavLink to="/"> Home </NavLink></li>
        <li><NavLink to=""> All Issue </NavLink></li>
        <li><NavLink to=""> About </NavLink></li>
        <li><NavLink to=""> Contact Us </NavLink></li>
        

    </>
    return (
        <div>
            <div className="navbar bg-base-300 shadow-sm">
                <div className="navbar-start">
                    <div className="dropdown">
                        <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /> </svg>
                        </div>
                        <ul
                            tabIndex="-1"
                            className="menu menu-sm dropdown-content bg-base-300 rounded-box z-1 mt-3 w-52 p-2 shadow">
                            {links}
                        </ul>
                    </div>
                    {/* Logo + website name */}
                    <a className="btn btn-ghost text-xl gap-2">
                        <img
                            src={logo}
                            alt="Public Infra Report logo"
                            className="h-10 w-10 object-contain "
                        />
                        Public Infra Report
                    </a>
                </div>
                <div className="navbar-center hidden lg:flex">
                    <ul className="menu menu-horizontal px-1">
                        {links}
                    </ul>
                </div>
                <div className="navbar-end">
                    <a className="btn">Button</a>
                </div>
            </div>
        </div>
    )
}

export default Navbar