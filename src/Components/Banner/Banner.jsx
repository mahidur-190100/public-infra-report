import React from 'react'
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import banner1 from '../../assets/Banner1.png'
import banner2 from '../../assets/banner2.png'
import banner3 from '../../assets/Banner3.png'

const Banner = () => {
    return (
        <Carousel 
            autoPlay={true} 
            infiniteLoop={true} 
            showThumbs={false} 
            showStatus={false}
            className="max-h-screen"
        >
            <div className="relative h-[400px] md:h-[500px] lg:h-[600px] xl:h-[700px]">
                <img 
                    src={banner1} 
                    alt="Banner 1" 
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <button className="absolute bottom-10 left-10 md:bottom-20 md:left-20 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300">
                    Track Your Progress
                </button>
            </div>
            
            <div className="relative h-[400px] md:h-[500px] lg:h-[600px] xl:h-[700px]">
                <img 
                    src={banner2} 
                    alt="Banner 2" 
                    className="absolute inset-0 w-full h-full object-cover"
                />
            </div>
            
            <div className="relative h-[400px] md:h-[500px] lg:h-[600px] xl:h-[700px]">
                <img 
                    src={banner3} 
                    alt="Banner 3" 
                    className="absolute inset-0 w-full h-full object-cover"
                />
            </div>
        </Carousel>
    )
}

export default Banner