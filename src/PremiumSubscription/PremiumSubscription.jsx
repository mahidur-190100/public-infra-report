import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  FaCrown,
  FaCheck,
  FaStar,
  FaShieldAlt,
  FaHeadset,
  FaGem,
  FaRocket,
  FaCheckCircle,
  FaCreditCard,
  FaLock,
  FaCalendarAlt,
  FaUsers,
  FaTimes,
  FaCcVisa,
  FaCcMastercard,
  FaCcAmex,
  FaCcDiscover
} from 'react-icons/fa';

const PremiumSubscription = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);

  // Card payment form states
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');
  const [saveCard, setSaveCard] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');

  useEffect(() => {
    // Get user from localStorage
    const user = localStorage.getItem('user');
    const admin = localStorage.getItem('admin');

    let currentUser = null;

    if (user) {
      try {
        currentUser = JSON.parse(user);
      } catch (error) {
        console.error('Error parsing user:', error);
      }
    } else if (admin) {
      try {
        currentUser = JSON.parse(admin);
      } catch (error) {
        console.error('Error parsing admin:', error);
      }
    }

    if (currentUser) {
      setUserData(currentUser);
      setCardName(currentUser.displayName || currentUser.email?.split('@')[0] || '');

      // Check if user already has premium subscription
      if (currentUser.isPremium && currentUser.subscriptionEnd) {
        const endDate = new Date(currentUser.subscriptionEnd);
        const today = new Date();

        if (endDate > today) {
          setSubscriptionStatus({
            isPremium: true,
            subscriptionType: currentUser.subscriptionType || 'monthly',
            subscriptionStart: currentUser.subscriptionStart,
            subscriptionEnd: currentUser.subscriptionEnd,
            lastPayment: currentUser.lastPayment
          });
        } else {
          // Subscription expired
          const updatedUser = { ...currentUser, isPremium: false };
          localStorage.setItem(user ? 'user' : 'admin', JSON.stringify(updatedUser));
        }
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const subscriptionPlans = [
    {
      id: 'monthly',
      name: 'Monthly Premium',
      price: '₹499',
      originalPrice: '₹999',
      period: 'per month',
      type: 'monthly',
      savings: 'Save 50%',
      features: [
        'Priority issue resolution',
        '5 premium boosts per month',
        'Dedicated support channel',
        'Advanced analytics dashboard',
        'Early access to new features',
        'Mobile app access'
      ],
      popular: false,
      icon: <FaStar className="w-6 h-6 text-yellow-500" />
    },
    {
      id: 'yearly',
      name: 'Yearly Premium',
      price: '₹4,999',
      originalPrice: '₹11,988',
      period: 'per year',
      type: 'yearly',
      savings: 'Save 58%',
      features: [
        'Everything in Monthly plan',
        'Unlimited premium boosts',
        '24/7 priority support',
        'Custom issue categories',
        'Monthly reports & insights',
        'Team management features',
        'API access',
        'Dedicated account manager'
      ],
      popular: true,
      icon: <FaCrown className="w-6 h-6 text-purple-500" />
    }
  ];

  const benefits = [
    {
      icon: <FaRocket className="w-5 h-5 text-blue-500" />,
      title: 'Priority Processing',
      description: 'Your issues get reviewed and addressed 3x faster'
    },
    {
      icon: <FaShieldAlt className="w-5 h-5 text-green-500" />,
      title: 'Guaranteed Response',
      description: 'Get response within 24 hours for all your reports'
    },
    {
      icon: <FaGem className="w-5 h-5 text-purple-500" />,
      title: 'Premium Features',
      description: 'Access exclusive tools and analytics'
    },
    {
      icon: <FaHeadset className="w-5 h-5 text-red-500" />,
      title: 'Dedicated Support',
      description: 'Get help from our premium support team'
    }
  ];

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: <FaCreditCard className="w-5 h-5" /> },
    { id: 'upi', name: 'UPI', icon: '📱' },
    { id: 'netbanking', name: 'Net Banking', icon: '🏦' },
    { id: 'wallet', name: 'Wallet', icon: '👛' }
  ];

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
  };

  const handleExpiryDateChange = (e) => {
    const formatted = formatExpiryDate(e.target.value);
    setExpiryDate(formatted);
  };

  const handleCvcChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 3);
    setCvc(value);
  };

  const getCardType = (number) => {
    const cleaned = number.replace(/\D/g, '');
    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    if (/^6(?:011|5)/.test(cleaned)) return 'discover';
    return 'unknown';
  };

  const renderCardIcon = (type) => {
    switch (type) {
      case 'visa': return <FaCcVisa className="w-6 h-6 text-blue-600" />;
      case 'mastercard': return <FaCcMastercard className="w-6 h-6 text-red-600" />;
      case 'amex': return <FaCcAmex className="w-6 h-6 text-blue-500" />;
      case 'discover': return <FaCcDiscover className="w-6 h-6 text-orange-600" />;
      default: return <FaCreditCard className="w-6 h-6 text-gray-400" />;
    }
  };

  const handlePayment = async () => {
    if (!selectedPlan || !userData) return;

    setPaymentProcessing(true);

    try {
      // Calculate subscription dates
      const today = new Date();
      const endDate = new Date();

      if (selectedPlan.type === 'yearly') {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
        endDate.setMonth(endDate.getMonth() + 1);
      }

      // Prepare payment data for MongoDB
      const paymentData = {
        userEmail: userData.email,
        userName: userData.displayName || userData.email.split('@')[0],
        userId: userData.uid || userData.email,
        userRole: userData.role || 'user',
        planType: selectedPlan.type,
        amount: selectedPlan.type === 'yearly' ? 4999 : 499,
        paymentMethod: 'Card',
        cardLastFour: '4242', // Mock for demo
        startDate: today.toISOString(),
        endDate: endDate.toISOString()
      };

      // Save payment to MongoDB
      const paymentResponse = await axios.post('http://localhost:3000/create-payment', paymentData);

      if (paymentResponse.data.success) {
        // Update user subscription in localStorage
        const updatedUser = {
          ...userData,
          isPremium: true,
          subscriptionType: selectedPlan.type,
          subscriptionStart: today.toISOString(),
          subscriptionEnd: endDate.toISOString(),
          lastPayment: today.toISOString(),
          paymentMethod: 'Card'
        };

        // Save to appropriate localStorage key
        if (userData.email) {
          const key = userData.role === 'admin' ? 'admin' : 'user';
          localStorage.setItem(key, JSON.stringify(updatedUser));
        }

        setSubscriptionStatus({
          isPremium: true,
          subscriptionType: selectedPlan.type,
          subscriptionStart: today.toISOString(),
          subscriptionEnd: endDate.toISOString(),
          lastPayment: today.toISOString()
        });

        setPaymentProcessing(false);
        setShowPaymentModal(false);
        setSelectedPlan(null);

        // Show success message with invoice number
        alert(`Payment Successful! Invoice: ${paymentResponse.data.invoiceNumber}`);

        // Redirect to success page
        navigate('/dashboard/payment-success');
      } else {
        throw new Error(paymentResponse.data.message);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment processing failed: ' + error.message);
      setPaymentProcessing(false);
    }
  };

  if (subscriptionStatus?.isPremium) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full mb-6">
              <FaCheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              You're Already Premium! 🎉
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Thank you for being a valued premium member. Your subscription is active and you have access to all premium features.
            </p>
          </div>

          {/* Subscription Details */}
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Active Subscription</h2>
                  <p className="text-green-100">You're currently enjoying premium benefits</p>
                </div>
                <div className="px-4 py-2 bg-white/20 rounded-full">
                  <span className="font-bold">ACTIVE</span>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Plan Type</p>
                    <p className="text-xl font-bold text-gray-900 capitalize">
                      {subscriptionStatus.subscriptionType || 'Premium'} Plan
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Subscription Start</p>
                    <p className="text-lg font-medium text-gray-900">
                      {subscriptionStatus.subscriptionStart
                        ? new Date(subscriptionStatus.subscriptionStart).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })
                        : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Renewal Date</p>
                    <p className="text-xl font-bold text-gray-900">
                      {subscriptionStatus.subscriptionEnd
                        ? new Date(subscriptionStatus.subscriptionEnd).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })
                        : 'N/A'}
                    </p>
                    {subscriptionStatus.subscriptionEnd && (
                      <p className="text-sm text-gray-500 mt-1">
                        Expires in {Math.ceil((new Date(subscriptionStatus.subscriptionEnd) - new Date()) / (1000 * 60 * 60 * 24))} days
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Last Payment</p>
                    <p className="text-lg font-medium text-gray-900">
                      {subscriptionStatus.lastPayment
                        ? new Date(subscriptionStatus.lastPayment).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Current Benefits */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Premium Benefits</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        {benefit.icon}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{benefit.title}</p>
                        <p className="text-sm text-gray-600">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={() => navigate('/dashboard/boost-priority')}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                  Use Premium Features
                </button>
                <button
                  onClick={() => window.open('mailto:support@example.com', '_blank')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      {/* Payment Modal */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Complete Payment</h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                  disabled={paymentProcessing}
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>

              {/* Order Summary */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">Order Summary</h4>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">{selectedPlan.name}</span>
                  <span className="font-bold">{selectedPlan.price}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Billing cycle</span>
                  <span className="text-gray-600">{selectedPlan.period}</span>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Amount</span>
                    <span className="text-xl font-bold text-green-600">{selectedPlan.price}</span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">Select Payment Method</h4>
                <div className="grid grid-cols-2 gap-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPaymentMethod(method.id)}
                      className={`p-3 border rounded-lg flex flex-col items-center justify-center transition-all ${selectedPaymentMethod === method.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}
                    >
                      <div className="text-2xl mb-2">
                        {method.icon}
                      </div>
                      <span className="text-sm font-medium">{method.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Card Payment Form */}
              {selectedPaymentMethod === 'card' && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Card Details</h4>

                  {/* Card Preview */}


                  {/* Card Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div className="absolute left-3 top-3">
                          <FaCreditCard className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name on Card
                      </label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          value={expiryDate}
                          onChange={handleExpiryDateChange}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVC
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={cvc}
                            onChange={handleCvcChange}
                            placeholder="123"
                            maxLength={3}
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <div className="absolute right-3 top-3">
                            <FaLock className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="saveCard"
                        checked={saveCard}
                        onChange={(e) => setSaveCard(e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="saveCard" className="ml-2 text-sm text-gray-600">
                        Save this card for future payments
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Other Payment Methods */}
              {selectedPaymentMethod !== 'card' && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 text-center">
                    {selectedPaymentMethod === 'upi' && 'Scan UPI QR code or enter UPI ID'}
                    {selectedPaymentMethod === 'netbanking' && 'Select your bank to proceed'}
                    {selectedPaymentMethod === 'wallet' && 'Select your wallet app'}
                  </p>
                </div>
              )}

              {/* Security Note */}
              <div className="mb-6 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <FaLock className="w-4 h-4 text-blue-500 mt-1 mr-2" />
                  <p className="text-sm text-blue-700">
                    Your payment is secure and encrypted. We never store your full card details.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={handlePayment}
                  disabled={paymentProcessing}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold flex items-center justify-center gap-2"
                >
                  {paymentProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <FaCreditCard className="w-5 h-5" />
                      Pay {selectedPlan.price} Now
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  disabled={paymentProcessing}
                  className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mb-6">
            <FaCrown className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Upgrade to Premium
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get priority support, faster issue resolution, and exclusive features to enhance your experience.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl shadow border border-blue-100 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">3x</div>
            <p className="text-gray-600">Faster Issue Resolution</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border border-green-100 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">24h</div>
            <p className="text-gray-600">Guaranteed Response Time</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow border border-purple-100 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">98%</div>
            <p className="text-gray-600">Satisfaction Rate</p>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{benefit.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{benefit.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {subscriptionPlans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-2xl shadow-xl overflow-hidden border-2 ${plan.popular ? 'border-purple-500 relative' : 'border-gray-200'}`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-full text-sm font-bold">
                    MOST POPULAR
                  </div>
                </div>
              )}

              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    {plan.icon}
                    <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                  </div>
                  {plan.savings && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      {plan.savings}
                    </span>
                  )}
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                    <span className="ml-2 text-gray-600">{plan.period}</span>
                  </div>
                  {plan.originalPrice && (
                    <p className="text-gray-500 line-through mt-1">{plan.originalPrice} billed monthly</p>
                  )}
                  {plan.type === 'yearly' && (
                    <p className="text-green-600 font-medium mt-2">
                      Equivalent to ₹416/month
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <FaCheck className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0 mr-3" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={loading}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${plan.popular
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'}`}
                >
                  {plan.popular ? 'Get Premium' : 'Choose Plan'}
                </button>

                <p className="text-center text-sm text-gray-500 mt-4">
                  <FaCalendarAlt className="inline w-4 h-4 mr-1" />
                  Cancel anytime • No hidden fees
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            What Our Premium Users Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FaUsers className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-gray-900">Rajesh Kumar</h4>
                  <p className="text-sm text-gray-500">Municipal Officer</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "The priority support has reduced our issue resolution time by 70%. Worth every rupee!"
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <FaShieldAlt className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h4 className="font-bold text-gray-900">Priya Sharma</h4>
                  <p className="text-sm text-gray-500">Community Leader</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "24-hour response guarantee made all the difference for urgent civic issues in our area."
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow border border-gray-200 p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">How does priority support work?</h3>
              <p className="text-gray-600">Premium members get their issues reviewed within 24 hours and receive priority handling throughout the resolution process.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Can I cancel my subscription?</h3>
              <p className="text-gray-600">Yes, you can cancel at any time. Your premium features will remain active until the end of your billing period.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">We accept all major credit/debit cards, UPI, net banking, and digital wallets.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Do you offer refunds?</h3>
              <p className="text-gray-600">We offer a 30-day money-back guarantee if you're not satisfied with our premium service.</p>
            </div>
          </div>
        </div>

        {/* Security Assurance */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center space-x-4 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <FaLock className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">100% Secure Payments</h3>
              <p className="text-sm text-gray-600">Your payment information is protected with bank-level security</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumSubscription;