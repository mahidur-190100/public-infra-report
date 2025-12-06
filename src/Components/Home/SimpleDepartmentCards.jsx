import React from 'react';
import { 
  FaRoad,
  FaLightbulb,
  FaWater,
  FaTrashAlt,
  FaClock,
  FaCheckCircle
} from 'react-icons/fa';

const SimpleDepartmentCards = () => {

  const mockDepartments = [
    {
      id: 1,
      name: 'Street Maintenance',
      icon: <FaRoad className="w-10 h-10" />,
      responseTime: '24h',
      resolutionRate: '95%',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      id: 2,
      name: 'Public Lighting',
      icon: <FaLightbulb className="w-10 h-10" />,
      responseTime: '36h',
      resolutionRate: '88%',
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    },
    {
      id: 3,
      name: 'Water Department',
      icon: <FaWater className="w-10 h-10" />,
      responseTime: '48h',
      resolutionRate: '85%',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-500'
    },
    {
      id: 4,
      name: 'Sanitation',
      icon: <FaTrashAlt className="w-10 h-10" />,
      responseTime: '72h',
      resolutionRate: '78%',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600'
    }
  ];

  return (
    <section className="py-10 bg-white">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Department Performance
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockDepartments.map((dept) => (
            <div 
              key={dept.id}
              className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:border-blue-300 transition-colors"
            >
              {/* Icon */}
              <div className={`${dept.bgColor} ${dept.iconColor} w-16 h-16 rounded-xl flex items-center justify-center mb-4 mx-auto`}>
                {dept.icon}
              </div>
              
              {/* Department Name */}
              <h3 className="text-center font-bold text-gray-900 text-lg mb-4">
                {dept.name}
              </h3>
              
              {/* Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FaClock className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-gray-700 text-sm">Response</span>
                  </div>
                  <span className="font-bold text-gray-900">{dept.responseTime}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FaCheckCircle className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-gray-700 text-sm">Resolution</span>
                  </div>
                  <span className="font-bold text-gray-900">{dept.resolutionRate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default SimpleDepartmentCards;