import React from 'react'
import Navbar from '../../Shared/Navbar/Navbar'
import { Outlet } from 'react-router-dom'
import Footer from '../../Shared/Footer/Footer'

const AuthLayout = () => {
  return (
    <div>
        <Navbar>      </Navbar>
        <main className="min-h-screen flex items-center justify-center bg-gray-500">
            <Outlet></Outlet>
        </main>
        <Footer> </Footer>
    </div>
  )
}

export default AuthLayout