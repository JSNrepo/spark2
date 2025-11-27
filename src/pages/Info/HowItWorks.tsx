import React from 'react';
import { Search, Calendar, Car, QrCode, Shield, Clock, CreditCard, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { Link } from 'react-router-dom';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: <Search className="h-8 w-8 text-blue-600" />,
      title: 'Search for Parking',
      description: 'Enter your destination and browse available parking spots near you. Filter by price, vehicle type, and amenities.',
      details: [
        'Real-time availability updates',
        'Filter by location, price, and amenities',
        'View photos and detailed descriptions',
        'Check ratings and reviews from other users'
      ]
    },
    {
      icon: <Calendar className="h-8 w-8 text-blue-600" />,
      title: 'Select Date & Time',
      description: 'Choose your preferred parking duration. Book for hours, days, or even months with flexible pricing options.',
      details: [
        'Flexible booking duration',
        'Hourly, daily, and monthly rates',
        'Instant booking confirmation',
        'Modify or cancel bookings easily'
      ]
    },
    {
      icon: <CreditCard className="h-8 w-8 text-blue-600" />,
      title: 'Secure Payment',
      description: 'Pay safely with our encrypted payment system. Multiple payment methods accepted with instant confirmation.',
      details: [
        'Secure payment processing',
        'Multiple payment methods',
        'Instant booking confirmation',
        'Digital receipts and invoices'
      ]
    },
    {
      icon: <QrCode className="h-8 w-8 text-blue-600" />,
      title: 'Park & Go',
      description: 'Show your QR code at the entrance, park your vehicle, and enjoy your day worry-free with 24/7 support.',
      details: [
        'QR code entry system',
        'Mobile app access',
        '24/7 customer support',
        'Extend time remotely if needed'
      ]
    }
  ];

  const features = [
    {
      icon: <Shield className="h-6 w-6 text-green-600" />,
      title: 'Secure & Safe',
      description: 'All parking locations are monitored with 24/7 security and CCTV surveillance.'
    },
    {
      icon: <Clock className="h-6 w-6 text-blue-600" />,
      title: 'Real-time Updates',
      description: 'Get instant notifications about your booking status and availability changes.'
    },
    {
      icon: <MapPin className="h-6 w-6 text-purple-600" />,
      title: 'Prime Locations',
      description: 'Access parking spots in the most convenient locations across the city.'
    },
    {
      icon: <Car className="h-6 w-6 text-orange-600" />,
      title: 'All Vehicle Types',
      description: 'Whether you drive a car, bike, or motorcycle, we have spaces for everyone.'
    }
  ];

  const faqs = [
    {
      question: 'How do I cancel or modify my booking?',
      answer: 'You can cancel or modify your booking through your dashboard up to 1 hour before your scheduled time. Cancellations made more than 24 hours in advance receive a full refund.'
    },
    {
      question: 'What if I arrive late or need to extend my time?',
      answer: 'You can extend your parking time directly through the mobile app, subject to availability. Late arrivals are accommodated within a 30-minute grace period.'
    },
    {
      question: 'Is my vehicle safe in the parking lot?',
      answer: 'Yes, all our partner parking lots have 24/7 security monitoring, CCTV surveillance, and are well-lit. We also provide insurance coverage for added peace of mind.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, debit cards, PayPal, and digital wallets. All payments are processed securely with bank-level encryption.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              How ParkEasy Works
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Discover how easy it is to find, book, and pay for parking with our simple 4-step process
            </p>
          </motion.div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Simple Steps to Park
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get parked in just four easy steps
            </p>
          </div>

          <div className="space-y-16">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`flex flex-col lg:flex-row items-center gap-12 ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className="flex-1">
                  <Card className="p-8 h-full">
                    <div className="flex items-center mb-6">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        {step.icon}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-blue-600 mb-1">
                          Step {index + 1}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          {step.title}
                        </h3>
                      </div>
                    </div>
                    <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                      {step.description}
                    </p>
                    <ul className="space-y-2">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-center text-gray-600">
                          <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
                <div className="flex-1">
                  <img
                    src={`https://images.pexels.com/photos/${
                      index === 0 ? '1181354' : 
                      index === 1 ? '4386321' : 
                      index === 2 ? '4386433' : '1545743'
                    }/pexels-photo-${
                      index === 0 ? '1181354' : 
                      index === 1 ? '4386321' : 
                      index === 2 ? '4386433' : '1545743'
                    }.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop`}
                    alt={step.title}
                    className="w-full h-80 object-cover rounded-2xl shadow-lg"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose ParkEasy?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide the most reliable and convenient parking experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 text-center h-full" hover>
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Got questions? We've got answers.
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of drivers who have made parking stress-free with ParkEasy
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/search">
                <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                  Find Parking Now
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  Create Account
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;