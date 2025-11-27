import React from 'react';
import { Shield, Eye, Lock, Database, UserCheck, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../../components/UI/Card';
import { Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  const sections = [
    {
      id: 'information-collection',
      title: '1. Information We Collect',
      icon: <Database className="h-6 w-6" />,
      content: `We collect information you provide directly to us, such as when you create an account, make a booking, or contact us for support. This includes:

• Personal Information: Name, email address, phone number, and payment information
• Vehicle Information: License plate numbers and vehicle type for booking purposes
• Location Data: Your location when using our mobile app (with your permission)
• Usage Data: How you interact with our service, including booking history and preferences
• Device Information: Information about your device, browser, and operating system`
    },
    {
      id: 'information-use',
      title: '2. How We Use Your Information',
      icon: <UserCheck className="h-6 w-6" />,
      content: `We use the information we collect to:

• Provide, maintain, and improve our services
• Process bookings and payments
• Send you confirmations, updates, and customer support
• Personalize your experience and provide recommendations
• Prevent fraud and ensure platform security
• Comply with legal obligations and resolve disputes
• Send marketing communications (with your consent)`
    },
    {
      id: 'information-sharing',
      title: '3. Information Sharing',
      icon: <Globe className="h-6 w-6" />,
      content: `We may share your information in the following circumstances:

• With parking space owners to facilitate bookings
• With service providers who help us operate our platform
• With payment processors to handle transactions
• When required by law or to protect our rights
• In connection with a business transfer or acquisition
• With your consent or at your direction

We do not sell your personal information to third parties for marketing purposes.`
    },
    {
      id: 'data-security',
      title: '4. Data Security',
      icon: <Lock className="h-6 w-6" />,
      content: `We implement appropriate technical and organizational measures to protect your personal information:

• Encryption of data in transit and at rest
• Regular security assessments and updates
• Access controls and authentication measures
• Employee training on data protection
• Incident response procedures
• Compliance with industry security standards

However, no method of transmission over the internet is 100% secure.`
    },
    {
      id: 'data-retention',
      title: '5. Data Retention',
      icon: <Eye className="h-6 w-6" />,
      content: `We retain your personal information for as long as necessary to:

• Provide our services to you
• Comply with legal obligations
• Resolve disputes and enforce agreements
• Maintain business records

Account information is typically retained for 7 years after account closure. You can request deletion of your data subject to legal and business requirements.`
    },
    {
      id: 'your-rights',
      title: '6. Your Privacy Rights',
      icon: <Shield className="h-6 w-6" />,
      content: `Depending on your location, you may have the following rights:

• Access: Request a copy of your personal information
• Correction: Request correction of inaccurate information
• Deletion: Request deletion of your personal information
• Portability: Request transfer of your data to another service
• Objection: Object to certain processing of your information
• Restriction: Request restriction of processing

To exercise these rights, please contact us using the information below.`
    },
    {
      id: 'cookies',
      title: '7. Cookies and Tracking',
      content: `We use cookies and similar technologies to:

• Remember your preferences and settings
• Analyze how you use our service
• Provide personalized content and advertisements
• Improve our service performance

You can control cookies through your browser settings, but some features may not work properly if cookies are disabled.`
    },
    {
      id: 'children',
      title: '8. Children\'s Privacy',
      content: `Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it promptly.`
    },
    {
      id: 'international',
      title: '9. International Data Transfers',
      content: `Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with applicable data protection laws.`
    },
    {
      id: 'changes',
      title: '10. Changes to This Policy',
      content: `We may update this Privacy Policy from time to time. We will notify you of any material changes by email or through our service. Your continued use of our service after such changes constitutes acceptance of the updated policy.`
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-green-100 mb-4">
              Last updated: January 1, 2024
            </p>
            <p className="text-lg text-green-200">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Privacy Commitment */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <Card className="p-8 bg-blue-50 border-blue-200">
            <div className="text-center">
              <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-blue-900 mb-4">
                Our Privacy Commitment
              </h2>
              <p className="text-blue-800 leading-relaxed">
                At ParkEasy, we are committed to protecting your privacy and ensuring the security of your personal information. 
                We believe in transparency about how we collect, use, and share your data. This policy outlines our practices 
                and your rights regarding your personal information.
              </p>
            </div>
          </Card>
        </motion.div>

        {/* Quick Summary */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12"
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Privacy at a Glance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Lock className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Secure</h3>
                <p className="text-sm text-gray-600">Your data is encrypted and protected with industry-standard security measures.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Transparent</h3>
                <p className="text-sm text-gray-600">We clearly explain what data we collect and how we use it.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <UserCheck className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Your Control</h3>
                <p className="text-sm text-gray-600">You have rights over your data and can control how it's used.</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Privacy Sections */}
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
                <div className="flex items-start space-x-4 mb-4">
                  {section.icon && (
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {section.icon}
                    </div>
                  )}
                  <h2 className="text-2xl font-bold text-gray-900">
                    {section.title}
                  </h2>
                </div>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {section.content}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Contact for Privacy */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <Card className="p-8">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Privacy Questions or Concerns?
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                If you have any questions about this Privacy Policy, want to exercise your privacy rights, 
                or have concerns about how we handle your data, please contact our Privacy Team.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="text-center">
                  <h4 className="font-semibold text-gray-900 mb-2">Email Us</h4>
                  <p className="text-blue-600">privacy@parkeasy.com</p>
                </div>
                <div className="text-center">
                  <h4 className="font-semibold text-gray-900 mb-2">Mail Us</h4>
                  <p className="text-gray-600 text-sm">
                    ParkEasy Privacy Team<br />
                    123 Business Ave, Suite 100<br />
                    San Francisco, CA 94105
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Contact Privacy Team
                </Link>
                <Link
                  to="/terms"
                  className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  View Terms of Service
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Footer Note */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>
            This Privacy Policy is effective as of January 1, 2024. We may update this policy from time to time.
            <br />
            For the most current version, please visit this page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;