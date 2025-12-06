import React from 'react'
import Banner from '../Banner/Banner'
import HowItWorksSimple from '../Banner/HowItWorksSimple'
import ReportGuide from './ReportGuide'
import DepartmentLeaderboard from './SimpleDepartmentCards'
import SimpleDepartmentCards from './SimpleDepartmentCards'

const Home = () => {
  return (
    <div>
   
     <main className="mt-10 mb-12">
        <div className="text-center my-8">
          <h2>Welcome to the website</h2>
        </div>
        <Banner> </Banner>
      
         <HowItWorksSimple> </HowItWorksSimple>
         <ReportGuide> </ReportGuide>
         <SimpleDepartmentCards> </SimpleDepartmentCards>
           </main>
    </div>
  )
}

export default Home