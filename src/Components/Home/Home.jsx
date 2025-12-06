import React from 'react'
import Banner from '../Banner/Banner'
import HowItWorksSimple from '../Banner/HowItWorksSimple'

const Home = () => {
  return (
    <div>
   
     <main className="mt-10 mb-12">
        <div className="text-center my-8">
          <h2>Welcome to the website</h2>
        </div>
        <Banner> </Banner>
        </main>
         <HowItWorksSimple> </HowItWorksSimple>
    </div>
  )
}

export default Home