import React from 'react'
import Navbar from '../../Shared/Navbar/Navbar'
import { Outlet } from 'react-router-dom'
import Footer from '../../Shared/Footer/Footer'

const HomeLayout = () => {
  return (
    <div >
        <Navbar>    </Navbar>
        <main> 
            <Outlet>    </Outlet>
        </main>
        <Footer> </Footer>
    </div>
  )
}

export default HomeLayout