import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Car, CreditCard, Star, Plus, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { Booking } from '../../types';
import { db } from '../../lib/supabase';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

// ⚡ Bolt Optimization: Extracted complex list item into a React.memo component
// to prevent O(N) re-render bottlenecks when parent state (like 'filter') changes.
const BookingCard = React.memo(({
  booking,
  index,
  getStatusColor,
  getPaymentStatusColor
}: {
  booking: Booking;
  index: number;
  getStatusColor: (status: string) => string;
  getPaymentStatusColor: (status: string) => string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
  >
    <div className="flex flex-col lg:flex-row lg:items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center space-x-3 mb-2">
          <h3 className="text-lg font-semibold text-gray-900">
            Booking #{booking.id.slice(-6)}
          </h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2" />
            <span>Downtown Plaza Parking</span>
          </div>
          <div className="flex items-center">
            <Car className="h-4 w-4 mr-2" />
            <span>{booking.vehicleType.toUpperCase()} - {booking.vehiclePlate}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{format(new Date(booking.startTime), 'MMM dd, yyyy')}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            <span>
              {format(new Date(booking.startTime), 'HH:mm')} - {format(new Date(booking.endTime), 'HH:mm')}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col items-end">
        <div className="text-2xl font-bold text-gray-900 mb-1">
          ${booking.totalAmount}
        </div>
        <div className={`text-sm font-medium ${getPaymentStatusColor(booking.paymentStatus)}`}>
          Payment {booking.paymentStatus}
        </div>
        <div className="flex space-x-2 mt-3">
          <Link to={`/booking/${booking.id}`}>
            <Button size="sm" variant="outline">
              View Details
            </Button>
          </Link>
          {booking.status === 'active' && (
            <Button size="sm">
              Extend Time
            </Button>
          )}
        </div>
      </div>
    </div>
  </motion.div>
));

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');

  const loadBookings = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await db.getUserBookings(user.id);
      if (error) {
        console.error('Error loading bookings:', error);
        toast.error('Failed to load bookings');
        setBookings([]);
      } else {
        setBookings(data || []);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast.error('Failed to load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user, loadBookings]);

  // ⚡ Bolt Optimization: Wrap derived state in useMemo to prevent O(N) array iteration and reallocation on every render.
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking =>
      filter === 'all' || booking.status === filter
    );
  }, [bookings, filter]);

  // ⚡ Bolt Optimization: Use useMemo and a single pass reduce to compute dashboard stats efficiently, preventing multiple O(N) array iterations.
  const stats = useMemo(() => {
    return bookings.reduce(
      (acc, booking) => {
        acc.totalBookings += 1;
        if (booking.status === 'active') acc.activeBookings += 1;
        if (booking.status === 'completed') acc.completedBookings += 1;
        acc.totalSpent += booking.totalAmount;
        return acc;
      },
      {
        totalBookings: 0,
        activeBookings: 0,
        completedBookings: 0,
        totalSpent: 0,
      }
    );
  }, [bookings]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
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
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName || user?.email}!
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your parking bookings and account settings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeBookings}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedBookings}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.totalSpent}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <Card className="p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link to="/search">
              <Button className="flex items-center">
                <Plus className="h-4 w-4 mr-2" />
                New Booking
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="outline">
                Edit Profile
              </Button>
            </Link>
            <Link to="/payment-methods">
              <Button variant="outline">
                Payment Methods
              </Button>
            </Link>
          </div>
        </Card>

        {/* Bookings Section */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-0">
              Your Bookings
            </h2>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'completed' | 'cancelled')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Bookings</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all' 
                  ? "You haven't made any bookings yet. Start by finding a parking spot!"
                  : `No ${filter} bookings found.`
                }
              </p>
              <Link to="/search">
                <Button>Find Parking</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking, index) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  index={index}
                  getStatusColor={getStatusColor}
                  getPaymentStatusColor={getPaymentStatusColor}
                />
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;