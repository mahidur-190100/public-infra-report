import React from 'react';
import { 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaClock,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaPaperPlane,
  FaUser,
  FaComment
} from 'react-icons/fa';

const ContactUs = () => {
  const contactInfo = [
    {
      icon: <FaEnvelope className="w-8 h-8" />,
      title: 'Email Us',
      description: 'For general inquiries and support',
      details: ['support@dhakacity.gov.bd', 'info@dhakacity.gov.bd']
    },
    {
      icon: <FaPhone className="w-8 h-8" />,
      title: 'Call Us',
      description: '24/7 Helpline for urgent issues',
      details: ['+880 9612345678', '+880 9612345679']
    },
    {
      icon: <FaMapMarkerAlt className="w-8 h-8" />,
      title: 'Visit Office',
      description: 'Dhaka City Corporation',
      details: [
        'Nagor Bhaban, North South Road',
        'Nagor Bhaban, Room 405',
        'Dhaka 1230, Bangladesh'
      ]
    },
    {
      icon: <FaClock className="w-8 h-8" />,
      title: 'Office Hours',
      description: 'For in-person assistance',
      details: [
        'Monday-Friday: 8:00 AM - 6:00 PM',
        'Saturday: 9:00 AM - 1:00 PM',
        'Sunday: Closed'
      ]
    }
  ];

  const socialLinks = [
    { icon: <FaFacebook className="w-6 h-6" />, name: 'Facebook', url: '#' },
    { icon: <FaTwitter className="w-6 h-6" />, name: 'Twitter', url: '#' },
    { icon: <FaInstagram className="w-6 h-6" />, name: 'Instagram', url: '#' }
  ];

  const faqs = [
    {
      question: 'How long does it take to get a response?',
      answer: 'Typically 24-48 hours for general inquiries. Urgent infrastructure issues are prioritized.'
    },
    {
      question: 'Can I report multiple issues at once?',
      answer: 'Yes, you can report multiple issues. Each issue gets a unique tracking ID.'
    },
    {
      question: 'Is there a mobile app available?',
      answer: 'Yes, our mobile app is available on both iOS and Android platforms.'
    },
    {
      question: 'How do I track my reported issue?',
      answer: 'You can track your issue using the tracking ID provided in your confirmation email.'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Contact Municipal Services
          </h1>
          <p className="text-lg text-gray-600">
            Have questions about reporting infrastructure issues? Need assistance with the platform?
            Our team is here to help you improve your city.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column - Contact Info */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 rounded-2xl p-8 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Contact Information</h2>
              
              {contactInfo.map((info, index) => (
                <div key={index} className="mb-8 last:mb-0">
                  <div className="flex items-start mb-3">
                    <div className="text-blue-600 mr-4">
                      {info.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {info.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">{info.description}</p>
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-gray-700 font-medium mb-1 last:mb-0">
                          {detail}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {/* Social Media */}
              <div className="mt-10 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Follow Us</h3>
                <div className="flex space-x-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      className="w-12 h-12 bg-gray-200 hover:bg-blue-600 hover:text-white rounded-full flex items-center justify-center text-gray-700 transition-colors duration-200"
                      aria-label={`Follow us on ${social.name}`}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - FAQ */}
          <div className="lg:col-span-2">
            
            {/* Static Contact Info Card */}
            <div className="bg-gray-50 rounded-2xl p-8 mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Get In Touch</h2>
              <div className="text-center p-8">
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaPaperPlane className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Ready to Report an Issue?</h3>
                <p className="text-gray-600 mb-6">
                  Use our main reporting platform to submit infrastructure issues directly.
                </p>
                <a
                  href="/report"
                  className="inline-flex items-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
                >
                  Report an Issue Now
                </a>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
              
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>

              {/* Emergency Notice */}
              <div className="mt-8 p-6 bg-red-50 border border-red-100 rounded-xl">
                <h3 className="text-lg font-bold text-red-800 mb-2">⚠️ Emergency Issues</h3>
                <p className="text-red-700 mb-3">
                  For immediate danger or emergency situations (gas leaks, major road collapses, etc.):
                </p>
                <div className="flex items-center">
                  <FaPhone className="w-5 h-5 text-red-600 mr-2" />
                  <span className="font-bold text-red-800">Call Emergency Services: 999</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-16 bg-gray-50 rounded-2xl p-8">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="lg:w-2/3">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Dhaka City Corporation Location</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <FaMapMarkerAlt className="w-6 h-6 text-blue-600 mt-1 mr-3" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Head Office Address</h3>
                    <p className="text-gray-600">Nagor Bhaban, North South Road</p>
                    <p className="text-gray-600">Dhaka 1230, Bangladesh</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FaClock className="w-6 h-6 text-blue-600 mt-1 mr-3" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Visiting Hours</h3>
                    <p className="text-gray-600">Monday-Friday: 8:00 AM - 6:00 PM</p>
                    <p className="text-gray-600">Saturday: 9:00 AM - 1:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:w-1/3">
              <div className="h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <FaMapMarkerAlt className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">Dhaka City Corporation</p>
                  <p className="text-gray-500 text-sm">Nagor Bhaban, Dhaka</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ContactUs;