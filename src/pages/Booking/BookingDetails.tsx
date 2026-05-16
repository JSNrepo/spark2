import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Car, Bike, CreditCard, QrCode, Phone, Download, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Booking } from '../../types';
import { db } from '../../lib/supabase';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const BookingDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBookingDetails = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await db.getBooking(id);
      
      if (dbError) {
        console.error('Error loading booking:', dbError);
        setError('Failed to load booking details. Please try again.');
        toast.error('Failed to load booking details');
      } else if (data) {
        setBooking(data);
      } else {
        setError('Booking not found');
        toast.error('Booking not found');
      }
    } catch (err) {
      console.error('Database error:', err);
      setError('Unable to connect to database. Please check your connection.');
      toast.error('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadBookingDetails();
    }
  }, [id, loadBookingDetails]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      case 'refunded': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const handleCancelBooking = async () => {
    if (!booking) return;
    
    const confirmed = window.confirm('Are you sure you want to cancel this booking?');
    if (!confirmed) return;

    try {
      // In a real app, you'd call the API to cancel
      // await db.updateBooking(booking.id, { status: 'cancelled' });
      toast.success('Booking cancelled successfully');
      setBooking({ ...booking, status: 'cancelled' });
    } catch {
      toast.error('Failed to cancel booking');
    }
  };

  const handleExtendTime = () => {
    toast('Extend time feature coming soon!', {
      icon: 'ℹ️',
      style: {
        background: '#3b82f6',
        color: '#ffffff',
      },
    });
  };

  const handleDownloadReceipt = () => {
    if (!booking) return;
    // Create a simple receipt download
    const receiptData = {
      bookingId: booking.id,
      amount: booking.totalAmount,
      date: booking.createdAt,
      vehicle: booking.vehiclePlate
    };
    
    const dataStr = JSON.stringify(receiptData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `receipt-${booking.id}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Receipt downloaded successfully!');
  };

  const handlePaymentAction = () => {
    if (!booking) return;
    
    if (booking.paymentStatus === 'pending') {
      // Simulate payment processing
      toast.loading('Processing payment...', { duration: 2000 });
      setTimeout(() => {
        setBooking({ ...booking, paymentStatus: 'paid' });
        toast.success('Payment completed successfully!');
      }, 2000);
    } else if (booking.paymentStatus === 'failed') {
      // Retry payment
      toast.loading('Retrying payment...', { duration: 2000 });
      setTimeout(() => {
        setBooking({ ...booking, paymentStatus: 'paid' });
        toast.success('Payment completed successfully!');
      }, 2000);
    }
  };

  const handleAddReview = () => {
    toast('Review feature coming soon!', {
      icon: 'ℹ️',
      style: {
        background: '#3b82f6',
        color: '#ffffff',
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md border-red-200 bg-red-50">
          <h2 className="text-2xl font-bold text-red-900 mb-4">Error Loading Booking</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Button onClick={loadBookingDetails} className="w-full">
              Try Again
            </Button>
            <Link to="/dashboard">
              <Button variant="outline" className="w-full">Go to Dashboard</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h2>
          <p className="text-gray-600 mb-6">The booking you're looking for doesn't exist or may have been removed.</p>
          <Link to="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
            <Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link>
            <span>/</span>
            <span className="text-gray-900">Booking #{booking.id.slice(-6)}</span>
          </nav>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Booking #{booking.id.slice(-6)}
              </h1>
              <p className="text-gray-600 mt-1">
                Created on {format(new Date(booking.createdAt), 'MMM dd, yyyy')}
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </span>
              <span className={`text-sm font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
                Payment {booking.paymentStatus}
              </span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Information */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Parking Location</h3>
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm">Downtown Plaza Parking</span>
                    </div>
                    <p className="text-sm text-gray-600 ml-6">
                      123 Main Street, San Francisco, CA 94105
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Vehicle Information</h3>
                  <div className="flex items-center text-gray-600">
                    {booking.vehicleType === 'car' ? (
                      <Car className="h-4 w-4 mr-2" />
                    ) : (
                      <Bike className="h-4 w-4 mr-2" />
                    )}
                    <span className="text-sm">
                      {booking.vehicleType.toUpperCase()} - {booking.vehiclePlate}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Start Time</h3>
                  <div className="space-y-1">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="text-sm">
                        {format(new Date(booking.startTime), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span className="text-sm">
                        {format(new Date(booking.startTime), 'HH:mm')}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">End Time</h3>
                  <div className="space-y-1">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="text-sm">
                        {format(new Date(booking.endTime), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span className="text-sm">
                        {format(new Date(booking.endTime), 'HH:mm')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Payment Information */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payment Status</span>
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-2 text-gray-500" />
                    <span className={`font-medium ${
                      booking.paymentStatus === 'paid' ? 'text-green-600' :
                      booking.paymentStatus === 'pending' ? 'text-yellow-600' :
                      booking.paymentStatus === 'failed' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {booking.paymentStatus?.charAt(0).toUpperCase() + booking.paymentStatus?.slice(1) || 'Unknown'}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{booking.totalHours} hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Hourly Rate</span>
                  <span className="font-medium">${(booking.totalAmount / booking.totalHours).toFixed(2)}</span>
                </div>
                {booking.paymentId && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payment ID</span>
                    <span className="font-medium text-sm">{booking.paymentId}</span>
                  </div>
                )}
                <hr className="border-gray-200" />
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">Total Amount</span>
                  <span className="text-xl font-bold text-gray-900">${booking.totalAmount}</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {booking.paymentStatus !== 'paid' && (
                  <Button 
                    onClick={handlePaymentAction}
                    className="w-full"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {booking.paymentStatus === 'pending' ? 'Complete Payment' : 'Retry Payment'}
                  </Button>
                )}
                
                <div className="flex space-x-3">
                  <Button variant="outline" onClick={handleDownloadReceipt} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download Receipt
                  </Button>
                  {booking.status === 'completed' && (
                    <Button variant="outline" onClick={handleAddReview} className="flex-1">
                      <Star className="h-4 w-4 mr-2" />
                      Add Review
                    </Button>
                  )}
                </div>
              </div>
        
            </Card>

            {/* Actions */}
            {(booking.status === 'confirmed' || booking.status === 'active') && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  {booking.status === 'active' && (
                    <Button onClick={handleExtendTime} className="flex-1">
                      <Clock className="h-4 w-4 mr-2" />
                      Extend Time
                    </Button>
                  )}
                  
                  {booking.status === 'confirmed' && (
                    <Button variant="danger" onClick={handleCancelBooking} className="flex-1">
                      Cancel Booking
                    </Button>
                  )}
                  
                  <Button variant="outline" className="flex-1">
                    <Phone className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                </div>
              </Card>
            )}
          </div>

          {/* QR Code & Quick Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* QR Code */}
            {booking.qrCode && (
              <Card className="p-6 text-center">
                <h3 className="font-semibold text-gray-900 mb-4">Entry QR Code</h3>
                <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <QrCode className="h-24 w-24 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Show this QR code at the parking entrance
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Save QR Code
                </Button>
              </Card>
            )}

            {/* Quick Info */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Info</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-medium ${getStatusColor(booking.status).replace('bg-', 'text-').replace('-100', '-600')}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">{booking.totalHours}h</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Vehicle</span>
                  <span className="font-medium">{booking.vehiclePlate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Paid</span>
                  <span className="font-medium">${booking.totalAmount}</span>
                </div>
              </div>
            </Card>

            {/* Help */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Need Help?</h3>
              
              <div className="space-y-3">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Support
                </Button>
                <Link to="/help" className="block">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    Help Center
                  </Button>
                </Link>
                <Link to="/contact" className="block">
                  <Button variant="ghost" size="sm" className="w-full justify-start">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;