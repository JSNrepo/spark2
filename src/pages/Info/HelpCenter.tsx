import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight, MessageCircle, Phone, Mail, Book } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  {
    id: 'booking',
    title: 'Booking & Reservations',
    icon: <Book className="h-6 w-6" />,
    description: 'Everything about making and managing bookings',
    faqs: [
      {
        id: 'how-to-book',
        question: 'How do I book a parking space?',
        answer: 'To book a parking space: 1) Search for parking near your destination, 2) Select your preferred spot and time, 3) Enter your vehicle details, 4) Complete payment. You\'ll receive a confirmation email with your QR code.'
      },
      {
        id: 'modify-booking',
        question: 'Can I modify or cancel my booking?',
        answer: 'Yes! You can modify or cancel your booking up to 1 hour before your scheduled time through your dashboard. Cancellations made 24+ hours in advance receive a full refund.'
      },
      {
        id: 'extend-time',
        question: 'How do I extend my parking time?',
        answer: 'You can extend your parking time directly through the mobile app or website, subject to availability. Extensions are charged at the same hourly rate.'
      },
      {
        id: 'late-arrival',
        question: 'What if I arrive late?',
        answer: 'We provide a 30-minute grace period for late arrivals. If you\'re running later, please contact us immediately to avoid losing your reservation.'
      }
    ]
  },
  {
    id: 'payment',
    title: 'Payment & Billing',
    icon: <MessageCircle className="h-6 w-6" />,
    description: 'Payment methods, billing, and refunds',
    faqs: [
      {
        id: 'payment-methods',
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit cards (Visa, MasterCard, American Express), debit cards, PayPal, Apple Pay, and Google Pay. All payments are processed securely.'
      },
      {
        id: 'refund-policy',
        question: 'What is your refund policy?',
        answer: 'Full refunds are available for cancellations made 24+ hours in advance. Cancellations within 24 hours receive a 50% refund. No refunds for no-shows.'
      },
      {
        id: 'billing-issues',
        question: 'I have a billing issue, what should I do?',
        answer: 'Contact our support team immediately with your booking ID and payment details. We\'ll investigate and resolve billing issues within 24 hours.'
      },
      {
        id: 'receipts',
        question: 'How do I get a receipt?',
        answer: 'Receipts are automatically emailed after payment. You can also download receipts from your dashboard under "Booking History".'
      }
    ]
  },
  {
    id: 'account',
    title: 'Account & Profile',
    icon: <Phone className="h-6 w-6" />,
    description: 'Managing your account and personal information',
    faqs: [
      {
        id: 'create-account',
        question: 'Do I need an account to book parking?',
        answer: 'Yes, you need to create a free account to book parking. This allows us to manage your bookings, send confirmations, and provide customer support.'
      },
      {
        id: 'forgot-password',
        question: 'I forgot my password, how do I reset it?',
        answer: 'Click "Forgot Password" on the login page, enter your email address, and we\'ll send you a password reset link within minutes.'
      },
      {
        id: 'update-profile',
        question: 'How do I update my profile information?',
        answer: 'Go to your dashboard and click on "Profile Settings" to update your personal information, contact details, and preferences.'
      },
      {
        id: 'delete-account',
        question: 'How do I delete my account?',
        answer: 'Contact our support team to request account deletion. Please note that this action is permanent and cannot be undone.'
      }
    ]
  },
  {
    id: 'parking',
    title: 'Parking & Access',
    icon: <Mail className="h-6 w-6" />,
    description: 'Accessing parking lots and using facilities',
    faqs: [
      {
        id: 'qr-code',
        question: 'How do I use the QR code to enter?',
        answer: 'Show your QR code (from email or app) to the parking attendant or scan it at the automated gate. The code is valid for your entire booking period.'
      },
      {
        id: 'lost-qr',
        question: 'What if I lose my QR code?',
        answer: 'You can always access your QR code from your dashboard or the mobile app. If you\'re having trouble, contact the parking lot directly or our support team.'
      },
      {
        id: 'vehicle-size',
        question: 'Are there vehicle size restrictions?',
        answer: 'Each parking lot has specific size restrictions listed in the description. Standard car spaces accommodate vehicles up to 6.5 feet wide and 18 feet long.'
      },
      {
        id: 'security',
        question: 'How secure are the parking lots?',
        answer: 'All our partner lots have security measures including CCTV monitoring, adequate lighting, and many have on-site security personnel. We also provide insurance coverage.'
      }
    ]
  }
];

const HelpCenter: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  // ⚡ Bolt Optimization: Wrap derived state in useMemo and use a single-pass reduce
  // to avoid multiple O(N) array iterations and intermediate memory allocations.
  const filteredCategories = useMemo(() => {
    return CATEGORIES.reduce((acc, category) => {
      const filteredFaqs = category.faqs.filter(faq =>
        searchQuery === '' ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );

      if (filteredFaqs.length > 0) {
        acc.push({ ...category, faqs: filteredFaqs });
      }
      return acc;
    }, [] as typeof CATEGORIES);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              How Can We Help You?
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Find answers to common questions or get in touch with our support team
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-4 text-lg bg-white text-gray-900"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link to="/contact">
                  <Button variant="outline" className="w-full justify-start">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Us
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Support
                </Button>
              </div>

              <div className="mt-8">
                <h4 className="font-medium text-gray-900 mb-3">Support Hours</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span>9AM - 8PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span>10AM - 6PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span>12PM - 5PM</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {searchQuery && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Search Results for "{searchQuery}"
                </h2>
              </div>
            )}

            <div className="space-y-6">
              {filteredCategories.map((category, categoryIndex) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
                >
                  <Card className="overflow-hidden">
                    <button
                      onClick={() => setExpandedCategory(
                        expandedCategory === category.id ? null : category.id
                      )}
                      className="w-full p-6 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                            {category.icon}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {category.title}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              {category.description}
                            </p>
                          </div>
                        </div>
                        {expandedCategory === category.id ? (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </button>

                    <AnimatePresence>
                      {expandedCategory === category.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-gray-200"
                        >
                          <div className="p-6 space-y-4">
                            {category.faqs.map((faq) => (
                              <div key={faq.id} className="border border-gray-200 rounded-lg">
                                <button
                                  onClick={() => setExpandedFaq(
                                    expandedFaq === faq.id ? null : faq.id
                                  )}
                                  className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                                >
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-gray-900">
                                      {faq.question}
                                    </h4>
                                    {expandedFaq === faq.id ? (
                                      <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
                                    )}
                                  </div>
                                </button>

                                <AnimatePresence>
                                  {expandedFaq === faq.id && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="border-t border-gray-200"
                                    >
                                      <div className="p-4 text-gray-600 leading-relaxed">
                                        {faq.answer}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredCategories.length === 0 && searchQuery && (
              <Card className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600 mb-6">
                  We couldn't find any help articles matching your search. Try different keywords or contact our support team.
                </p>
                <Link to="/contact">
                  <Button>Contact Support</Button>
                </Link>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Contact CTA */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Still Need Help?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Our support team is here to help you 24/7
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                  Contact Support
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                <Phone className="h-5 w-5 mr-2" />
                Call Now
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HelpCenter;