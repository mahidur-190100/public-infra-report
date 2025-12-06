import React from 'react';
import { 
  FaEye, 
  FaMobileAlt, 
  FaMapMarkerAlt, 
  FaCamera,
  FaChartLine, 
  FaCheckCircle 
} from 'react-icons/fa';

const ReportGuide = () => {
  const steps = [
    {
      id: 1,
      icon: <FaEye className="w-12 h-12" />,
      title: 'Spot an Issue',
      description: 'Notice broken infrastructure like potholes, streetlights, or garbage overflow',
      color: 'bg-blue-500'
    },
    {
      id: 2,
      icon: <FaMobileAlt className="w-12 h-12" />,
      title: 'Open App & Report',
      description: 'Log in to your account and start a new report',
      color: 'bg-green-500'
    },
    {
      id: 3,
      icon: (
        <div className="relative">
          <FaMapMarkerAlt className="w-10 h-10 absolute -top-1 -left-2" />
          <FaCamera className="w-10 h-10 absolute -bottom-1 -right-2" />
        </div>
      ),
      title: 'Upload Details',
      description: 'Add photos, location, and description of the issue',
      color: 'bg-red-500'
    },
    {
      id: 4,
      icon: <FaChartLine className="w-12 h-12" />,
      title: 'Track Progress',
      description: 'Monitor status updates from Pending → In-Progress → Resolved',
      color: 'bg-yellow-500'
    },
    {
      id: 5,
      icon: <FaCheckCircle className="w-12 h-12" />,
      title: 'Confirm Resolution',
      description: 'Verify the fix and rate the service quality',
      color: 'bg-purple-500'
    }
  ];

  return (
    <section className="py-16 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            Report an Issue in 5 Easy Steps
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your contribution to a better city starts here
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="bg-gray-50 rounded-xl shadow-lg p-6 text-center relative transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
            >
              {/* Step Number */}
              <div className={`absolute -top-3 -left-3 ${step.color} text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg`}>
                {String(index + 1).padStart(2, '0')}
              </div>
              
              {/* Step Icon */}
              <div className="flex justify-center items-center h-20 mb-4 text-gray-700">
                {step.icon}
              </div>
              
              {/* Step Title */}
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                {step.title}
              </h3>
              
              {/* Step Description */}
              <p className="text-gray-600 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReportGuide;