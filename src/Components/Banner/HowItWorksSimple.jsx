import React from 'react';

const HowItWorksSimple = () => {
  const steps = [
    {
      number: "01",
      title: "Report an Issue",
      description: "Citizens spot and report public infrastructure problems like potholes, broken streetlights, or garbage overflow using our platform.",
      numberColor: "bg-blue-100 text-blue-600"
    },
    {
      number: "02",
      title: "Admin Review & Assign",
      description: "Government administrators verify reports and assign them to appropriate department staff for investigation.",
      numberColor: "bg-green-100 text-green-600"
    },
    {
      number: "03",
      title: "Staff Verification",
      description: "Assigned staff members visit the location, verify the issue, and update the status with progress reports.",
      numberColor: "bg-purple-100 text-purple-600"
    },
    {
      number: "04",
      title: "Track & Resolve",
      description: "Citizens monitor real-time status updates from Pending → In-Progress → Resolved → Closed. Premium users get priority support.",
      numberColor: "bg-orange-100 text-orange-600"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
          Simple 4-Step Process
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {/* Card with gray background */}
              <div className="
                bg-gray-100 
                rounded-xl 
                p-6 
                shadow-lg 
                hover:shadow-xl 
                transition-all 
                duration-300 
                h-full
              ">
                {/* Number badge - keeps its colored background */}
                <div className={`
                  ${step.numberColor} 
                  w-12 h-12 
                  rounded-xl 
                  flex items-center justify-center 
                  font-bold text-xl 
                  mb-4 
                  transition-transform 
                  duration-300 
                  group-hover:scale-110
                `}>
                  {step.number}
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {step.title}
                </h3>

                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Connecting line for desktop */}
              {index < steps.length - 1 && (
                <div className="
                  hidden 
                  lg:block 
                  absolute 
                  top-10 
                  right-0 
                  w-8 
                  h-0.5 
                  bg-gray-300 
                  transform 
                  translate-x-4
                  z-10
                "></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSimple;