import React from 'react';
import { FileText, Shield, AlertTriangle, Scale } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../../components/UI/Card';
import { Link } from 'react-router-dom';

const TermsOfService: React.FC = () => {
  const sections = [
    {
      id: 'acceptance',
      title: '1. Acceptance of Terms',
      content: `By accessing and using ParkEasy ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.`
    },
    {
      id: 'description',
      title: '2. Service Description',
      content: `ParkEasy is a platform that connects drivers seeking parking spaces with property owners who have available parking spaces to rent. We facilitate bookings, payments, and provide customer support, but we do not own or operate the parking facilities.`
    },
    {
      id: 'registration',
      title: '3. User Registration',
      content: `To use our Service, you must register for an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete. You are responsible for safeguarding your password and all activities under your account.`
    },
    {
      id: 'booking',
      title: '4. Booking and Payment',
      content: `When you make a booking through our platform, you enter into a contract with the parking space owner. Payment is processed through our secure payment system. All bookings are subject to availability and confirmation. Cancellation policies vary by location and are clearly stated during booking.`
    },
    {
      id: 'user-conduct',
      title: '5. User Conduct',
      content: `You agree not to use the Service for any unlawful purpose or in any way that could damage, disable, overburden, or impair our servers or networks. You will not attempt to gain unauthorized access to any part of the Service, other accounts, or computer systems.`
    },
    {
      id: 'liability',
      title: '6. Limitation of Liability',
      content: `ParkEasy acts as an intermediary between users and parking space owners. We are not liable for any damages, theft, or incidents that occur in parking facilities. Our liability is limited to the amount paid for the specific booking in question.`
    },
    {
      id: 'privacy',
      title: '7. Privacy Policy',
      content: `Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use our Service. By using our Service, you agree to the collection and use of information in accordance with our Privacy Policy.`
    },
    {
      id: 'termination',
      title: '8. Termination',
      content: `We may terminate or suspend your account and access to the Service immediately, without prior notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties.`
    },
    {
      id: 'changes',
      title: '9. Changes to Terms',
      content: `We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the Service. Your continued use of the Service after such modifications constitutes acceptance of the updated terms.`
    },
    {
      id: 'governing-law',
      title: '10. Governing Law',
      content: `These Terms of Service are governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions. Any disputes arising from these terms will be resolved in the courts of San Francisco County, California.`
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-gray-300 mb-4">
              Last updated: January 1, 2024
            </p>
            <p className="text-lg text-gray-400">
              Please read these terms carefully before using ParkEasy
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <Card className="p-6 bg-yellow-50 border-yellow-200">
            <div className="flex items-start space-x-4">
              <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">
                  Important Notice
                </h3>
                <p className="text-yellow-800 leading-relaxed">
                  These Terms of Service constitute a legally binding agreement between you and ParkEasy. 
                  By using our service, you acknowledge that you have read, understood, and agree to be 
                  bound by these terms. If you do not agree with any part of these terms, you must not 
                  use our service.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Table of Contents */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12"
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Table of Contents
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm py-1 hover:underline"
                >
                  {section.title}
                </a>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Terms Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              id={section.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <Card className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {section.title}
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {section.content}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Additional Information */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <Shield className="h-6 w-6 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Your Rights
              </h3>
            </div>
            <ul className="text-gray-600 space-y-2 text-sm">
              <li>• Right to cancel bookings according to our policy</li>
              <li>• Right to receive customer support</li>
              <li>• Right to data privacy and protection</li>
              <li>• Right to dispute charges</li>
              <li>• Right to account termination</li>
            </ul>
          </Card>

          <Card className="p-6">
            <div className="flex items-center mb-4">
              <Scale className="h-6 w-6 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Your Responsibilities
              </h3>
            </div>
            <ul className="text-gray-600 space-y-2 text-sm">
              <li>• Provide accurate account information</li>
              <li>• Follow parking facility rules</li>
              <li>• Make payments on time</li>
              <li>• Respect other users and property</li>
              <li>• Report issues promptly</li>
            </ul>
          </Card>
        </motion.div>

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <Card className="p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Questions About These Terms?
            </h3>
            <p className="text-gray-600 mb-6">
              If you have any questions about these Terms of Service, please don't hesitate to contact us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="inline-flex items-center justify-center px-6 py-3 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
              >
                Contact Support
              </Link>
              <Link
                to="/privacy"
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Privacy Policy
              </Link>
            </div>
          </Card>
        </motion.div>

        {/* Footer Note */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            These terms are effective as of January 1, 2024. We may update these terms from time to time.
            <br />
            For the most current version, please visit this page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;