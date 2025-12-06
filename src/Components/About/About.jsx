import React from 'react';
import { 
  FaBullhorn, 
  FaChartLine, 
  FaShieldAlt, 
  FaLightbulb,
  FaUsers,
  FaClock,
  FaDatabase,
  FaCity,
  FaCheckCircle,
  FaMobileAlt,
  FaMapMarkerAlt,
  FaTachometerAlt
} from 'react-icons/fa';

const About = () => {
  const mission = {
    title: "Our Mission",
    description: "To bridge the gap between citizens and municipal services by providing a transparent, efficient, and user-friendly platform for reporting and resolving public infrastructure issues.",
    icon: <FaBullhorn className="w-12 h-12" />
  };

  const problem = {
    title: "The Problem We Solve",
    description: "Municipal services often suffer from delayed response times, lack of tracking mechanisms, and no centralized platform for citizens to report problems like broken streetlights, potholes, water leakage, and garbage overflow.",
    icon: <FaCity className="w-12 h-12" />
  };

  const features = [
    {
      icon: <FaTachometerAlt className="w-10 h-10" />,
      title: 'Reduced Response Time',
      description: 'Streamlined reporting process cuts down resolution time significantly.'
    },
    {
      icon: <FaShieldAlt className="w-10 h-10" />,
      title: 'Improved Transparency',
      description: 'Real-time tracking from report submission to issue resolution.'
    },
    {
      icon: <FaDatabase className="w-10 h-10" />,
      title: 'Data Collection & Analysis',
      description: 'Collect and analyze infrastructure data for better city planning.'
    },
    {
      icon: <FaLightbulb className="w-10 h-10" />,
      title: 'Efficient Service Delivery',
      description: 'Optimized workflow for government staff and administrators.'
    }
  ];

  const workflow = [
    {
      step: 1,
      title: 'Citizen Reports',
      description: 'Users submit detailed reports with photos and location data.'
    },
    {
      step: 2,
      title: 'Admin Review',
      description: 'Administrators verify and assign issues to appropriate staff.'
    },
    {
      step: 3,
      title: 'Staff Action',
      description: 'Government staff verify issues and update progress regularly.'
    },
    {
      step: 4,
      title: 'Resolution',
      description: 'Issues are resolved and citizens receive notifications.'
    }
  ];

  const stats = [
    {
      number: '24-48h',
      label: 'Average Response Time',
      description: 'Faster than traditional reporting methods'
    },
    {
      number: '95%',
      label: 'Issue Resolution Rate',
      description: 'Higher success rate in problem solving'
    },
    {
      number: '10K+',
      label: 'Issues Reported',
      description: 'Active community participation'
    },
    {
      number: '4.8/5',
      label: 'User Satisfaction',
      description: 'Based on citizen feedback'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Public Infrastructure Issue Reporting System
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            A digital platform enabling citizens to report real-world public issues and 
            helping government staff manage, verify, assign, and resolve reported issues efficiently.
          </p>
        </div>

        {/* Mission & Problem */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          {/* Mission Card */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8">
            <div className="flex items-center mb-6">
              <div className="bg-blue-600 text-white p-3 rounded-xl mr-4">
                {mission.icon}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{mission.title}</h2>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">
              {mission.description}
            </p>
          </div>

          {/* Problem Card */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8">
            <div className="flex items-center mb-6">
              <div className="bg-gray-700 text-white p-3 rounded-xl mr-4">
                {problem.icon}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{problem.title}</h2>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">
              {problem.description}
            </p>
          </div>
        </div>

        {/* Key Features */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How Our System Transforms Public Service
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
                <div className="text-blue-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Workflow Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            System Workflow
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflow.map((item) => (
              <div key={item.step} className="relative">
                <div className="bg-white border border-gray-200 rounded-xl p-6 text-center h-full">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl mb-4 mx-auto">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">
                    {item.description}
                  </p>
                </div>
                {item.step < 4 && (
                  <div className="hidden lg:block absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-3">
                    <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 md:p-12 mb-20">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Our Impact in Numbers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.number}
                </div>
                <div className="text-blue-100 font-semibold text-lg mb-2">
                  {stat.label}
                </div>
                <div className="text-blue-200 text-sm">
                  {stat.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Premium Feature */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-2/3 mb-8 lg:mb-0 lg:pr-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Premium Citizen Support
              </h2>
              <p className="text-gray-700 mb-6">
                Our platform offers priority support for premium citizens, ensuring faster response times 
                and dedicated assistance for critical infrastructure issues.
              </p>
              <div className="flex items-center">
                <FaCheckCircle className="w-5 h-5 text-purple-600 mr-2" />
                <span className="text-gray-700">Priority issue queue</span>
              </div>
              <div className="flex items-center mt-2">
                <FaCheckCircle className="w-5 h-5 text-purple-600 mr-2" />
                <span className="text-gray-700">Faster response times</span>
              </div>
              <div className="flex items-center mt-2">
                <FaCheckCircle className="w-5 h-5 text-purple-600 mr-2" />
                <span className="text-gray-700">Dedicated support</span>
              </div>
            </div>
            <div className="lg:w-1/3">
              <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                <div className="text-4xl font-bold text-purple-600 mb-2">VIP</div>
                <div className="text-gray-900 font-semibold mb-2">Premium Support</div>
                <p className="text-gray-600 text-sm">
                  For citizens who need immediate attention for critical infrastructure issues
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default About;