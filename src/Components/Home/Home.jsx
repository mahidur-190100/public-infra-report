import React from 'react'
import Navbar from '../Shared/Navbar/Navbar'
import Footer from '../Shared/Footer/Footer'
import Banner from '../Banner/Banner'
import HowItWorksSimple from '../Banner/HowItWorksSimple'

const Home = () => {
  return (
    <div>
        <Navbar></Navbar>
        <Banner> </Banner>
        <HowItWorksSimple> </HowItWorksSimple>
        <Footer> </Footer>
        </div>
  )
}

export default Home