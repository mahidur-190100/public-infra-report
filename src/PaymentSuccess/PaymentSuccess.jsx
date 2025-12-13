import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaCheckCircle, 
  FaRocket, 
  FaShieldAlt, 
  FaGem, 
  FaArrowRight,
  FaDownload,
  FaEnvelope
} from 'react-icons/fa';

const PaymentSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Set a timeout to show confetti or other effects
    const timer = setTimeout(() => {
      // You can add confetti effect here if you want
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const premiumFeatures = [
    {
      icon: <FaRocket className="w-6 h-6 text-blue-500" />,
      title: 'Priority Processing',
      description: 'Your issues now get reviewed 3x faster'
    },
    {
      icon: <FaShieldAlt className="w-6 h-6 text-green-500" />,
      title: 'Dedicated Support',
      description: 'Access to premium support channel'
    },
    {
      icon: <FaGem className="w-6 h-6 text-purple-500" />,
      title: 'Premium Analytics',
      description: 'Advanced insights and reports'
    }
  ];

  const nextSteps = [
    {
      title: 'Report Priority Issue',
      description: 'Submit new issues with premium status',
      action: () => navigate('/dashboard/submit-issue'),
      icon: <FaRocket className="w-5 h-5" />
    },
    {
      title: 'Use Premium Boosts',
      description: 'Boost existing issues for faster resolution',
      action: () => navigate('/dashboard/boost-priority'),
      icon: <FaGem className="w-5 h-5" />
    },
    {
      title: 'Download Invoice',
      description: 'Get your payment receipt',
      action: () => {
        // Create and download a simple invoice
        const invoiceContent = `
          INVOICE
          ============
          Date: ${new Date().toLocaleDateString()}
          Plan: Premium Subscription
          Amount: Paid
          Status: Active
          
          Thank you for your payment!
        `;
        
        const blob = new Blob([invoiceContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'premium-invoice.txt';
        a.click();
        URL.revokeObjectURL(url);
      },
      icon: <FaDownload className="w-5 h-5" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mb-6 animate-pulse">
            <FaCheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Payment Successful! 🎉
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Welcome to Premium Membership
          </p>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Your premium subscription is now active. You can start using all premium features immediately.
          </p>
        </div>

        {/* Confetti Message */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-4">
            <span className="text-2xl">✨</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Premium Features Unlocked!
          </h3>
          <p className="text-gray-600">
            You now have access to exclusive tools and priority services
          </p>
        </div>

        {/* What You Get */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Premium Benefits</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {premiumFeatures.map((feature, index) => (
              <div key={index} className="p-6 bg-gray-50 rounded-xl hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-white rounded-lg shadow">
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-gray-900">{feature.title}</h3>
                </div>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-8 mb-8 border border-blue-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Get Started</h2>
          <p className="text-gray-600 mb-8">
            Make the most of your premium subscription with these next steps:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {nextSteps.map((step, index) => (
              <button
                key={index}
                onClick={step.action}
                className="bg-white p-6 rounded-xl shadow border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all text-left group"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-200 transition-colors">
                    {step.icon}
                  </div>
                  <h3 className="font-bold text-gray-900">{step.title}</h3>
                </div>
                <p className="text-gray-600 mb-4">{step.description}</p>
                <div className="flex items-center text-blue-600 font-medium">
                  <span>Get Started</span>
                  <FaArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Welcome Email */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-200">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
              <FaEnvelope className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Welcome Email Sent</h3>
              <p className="text-gray-600">Check your inbox for premium onboarding guide</p>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600">
              We've sent a welcome email with:
            </p>
            <ul className="list-disc list-inside mt-2 text-gray-600 space-y-1">
              <li>Premium feature guide</li>
              <li>Support contact information</li>
              <li>Account management tips</li>
              <li>Community access details</li>
            </ul>
          </div>
        </div>

        {/* Support Section */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-100 to-pink-100 rounded-full mb-4">
            <FaShieldAlt className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Need Help?</h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our premium support team is available 24/7 to assist you with any questions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => window.open('mailto:premium-support@example.com', '_blank')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Contact Support
            </button>
            <button
              onClick={() => navigate('/dashboard/my-issues')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              View My Issues
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;