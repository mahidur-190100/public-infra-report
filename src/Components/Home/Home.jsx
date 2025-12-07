import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Banner from '../Banner/Banner';
import HowItWorksSimple from '../Banner/HowItWorksSimple';
import ReportGuide from './ReportGuide';
import SimpleDepartmentCards from './SimpleDepartmentCards';

const Home = () => {
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
      easing: 'ease-in-out',
      disable: window.innerWidth < 768 ? true : false
    });
  }, []);

  return (
    <div className="min-h-screen">
      {/* Welcome Heading Section */}
      <section
        className="w-full bg-white py-8 md:py-12"
        data-aos="fade-up"
        data-aos-delay="100"
      >
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Welcome to Public Infrastructure Report
          </h1>
          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto">
            Your trusted platform for reporting and resolving public infrastructure issues.
            Together, we can build better, safer cities for everyone.
          </p>
        </div>
      </section>
      {/* Hero Banner Section - Full Width */}
      <section
        className="w-full"
        data-aos="fade-in"
        data-aos-duration="1200"
      >
        <Banner />
      </section>



      {/* How It Works Section */}
      <section
        className="w-full bg-white py-12 md:py-16"
        data-aos="fade-up"
        data-aos-delay="200"
      >
        <div className="container mx-auto px-4">
          <HowItWorksSimple />
        </div>
      </section>

      {/* Report Guide Section */}
      <section
        className="w-full bg-gray-50 py-12 md:py-16"
        data-aos="fade-up"
        data-aos-delay="300"
      >
        <div className="container mx-auto px-4">
          <ReportGuide />
        </div>
      </section>

      {/* Department Performance Section */}
      <section
        className="w-full bg-white py-12 md:py-16"
        data-aos="fade-up"
        data-aos-delay="400"
      >
        <div className="container mx-auto px-4">
          <SimpleDepartmentCards />
        </div>
      </section>

      {/* Final Call to Action */}
      <section
        className="w-full bg-blue-600 py-12 md:py-16"
        data-aos="fade-up"
        data-aos-delay="500"
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 md:mb-6">
            Start Improving Your City Today
          </h2>
          <p className="text-blue-100 text-lg md:text-xl mb-8 md:mb-10 max-w-2xl mx-auto">
            Join thousands of citizens who are already making their communities better
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-6 md:px-8 py-3 bg-white hover:bg-gray-100 text-blue-600 font-semibold rounded-lg transition-colors duration-300">
              Report Your First Issue
            </button>
            <button className="px-6 md:px-8 py-3 border-2 border-white text-white hover:bg-white/10 font-semibold rounded-lg transition-colors duration-300">
              Learn How It Works
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;