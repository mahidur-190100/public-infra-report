import React from 'react'
import Navbar from '../../Shared/Navbar/Navbar'
import { Outlet } from 'react-router-dom'
import Footer from '../../Shared/Footer/Footer'

const HomeLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
        {/* Navbar - Full width */}
        <div className="w-full">
          <Navbar />
        </div>
        
        {/* Main content with side spacing */}
        <main className="max-w-7xl mx-auto flex-grow px-4 sm:px-6 lg:px-8 py-8"> 
            <Outlet />
        </main>
        
        {/* Footer - Full width */}
        <div className="w-full">
          <Footer />
        </div>
    </div>
  )
}

export default HomeLayout