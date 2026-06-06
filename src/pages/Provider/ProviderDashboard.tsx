import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MapPin, Car, DollarSign, Users, Eye, Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { ParkingLot, Booking } from '../../types';
import { db } from '../../lib/supabase';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

// ⚡ Bolt Optimization: Extracted complex list item into a React.memo component
// to prevent O(N) re-render bottlenecks when parent component updates.
const ParkingLotItem = React.memo(({
  lot,
  index,
  handleDeleteLot
}: {
  lot: ParkingLot;
  index: number;
  handleDeleteLot: (id: string) => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
  >
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {lot.images && lot.images.length > 0 ? (
        <img
          src={lot.images[0]}
          alt={lot.name}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
          <MapPin className="h-12 w-12 text-gray-400" />
        </div>
      )}

      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {lot.name}
          </h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            lot.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {lot.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {lot.address}, {lot.city}, {lot.state}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <span className="text-gray-500">Spaces:</span>
            <span className="font-medium ml-1">{lot.totalSpaces}</span>
          </div>
          <div>
            <span className="text-gray-500">Rate:</span>
            <span className="font-medium ml-1">${lot.hourlyRate}/hr</span>
          </div>
          <div>
            <span className="text-gray-500">Available:</span>
            <span className="font-medium ml-1">{lot.availableSpaces}</span>
          </div>
          <div>
            <span className="text-gray-500">Rating:</span>
            <span className="font-medium ml-1">{lot.rating.toFixed(1)} ⭐</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link to={`/parking-lot/${lot.id}`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
          </Link>
          <Link to={`/provider/parking-lot/${lot.id}/edit`} className="flex-1">
            <Button variant="outline" size="sm" className="w-full">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteLot(lot.id)}
            className="px-3"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>
    </Card>
  </motion.div>
));

const ProviderDashboard: React.FC = () => {
  const { user } = useAuth();
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProviderData = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // ⚡ Bolt Optimization: Batch independent API requests using Promise.all to reduce waterfall delays
      const [
        { data: lots, error: lotsError },
        { data: providerBookings, error: bookingsError }
      ] = await Promise.all([
        db.getProviderParkingLots(user.id),
        db.getProviderBookings(user.id)
      ]);

      if (lotsError) {
        console.error('Error loading parking lots:', lotsError);
        toast.error('Failed to load parking lots');
      } else {
        setParkingLots(lots || []);
      }

      if (bookingsError) {
        console.error('Error loading bookings:', bookingsError);
        toast.error('Failed to load bookings');
      } else {
        setBookings(providerBookings || []);
      }
      
    } catch (error: unknown) {
      console.error('Error loading provider data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === 'space_provider') {
      loadProviderData();
    }
  }, [user, loadProviderData]);

  const handleDeleteLot = useCallback(async (lotId: string) => {
    if (!window.confirm('Are you sure you want to delete this parking lot?')) {
      return;
    }

    try {
      // Update the lot to set isActive to false instead of deleting
      const { error } = await db.updateParkingLot(lotId, { isActive: false });
      if (error) {
        toast.error('Failed to delete parking lot');
      } else {
        toast.success('Parking lot deleted successfully');
        loadProviderData(); // Reload data
      }
    } catch (error: unknown) {
      console.error('Error deleting parking lot:', error);
      toast.error('Failed to delete parking lot');
    }
  }, [loadProviderData]);

  // ⚡ Bolt Optimization: Use useMemo and a single pass reduce to compute dashboard stats efficiently, preventing multiple O(N) array iterations.
  const stats = useMemo(() => {
    const lotStats = parkingLots.reduce(
      (acc, lot) => {
        acc.totalLots += 1;
        if (lot.isActive) acc.activeLots += 1;
        acc.totalSpaces += lot.totalSpaces;
        return acc;
      },
      { totalLots: 0, activeLots: 0, totalSpaces: 0 }
    );

    const bookingStats = bookings.reduce(
      (acc, booking) => {
        acc.totalBookings += 1;
        if (booking.paymentStatus === 'paid') acc.monthlyRevenue += booking.totalAmount;
        return acc;
      },
      { totalBookings: 0, monthlyRevenue: 0 }
    );

    return { ...lotStats, ...bookingStats };
  }, [parkingLots, bookings]);

  if (user?.role !== 'space_provider') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">
            This dashboard is only available to space providers.
          </p>
          <Link to="/dashboard">
            <Button>Go to User Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Provider Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {user?.organizationName || `${user?.firstName} ${user?.lastName}`}
            </p>
          </div>
          <Link to="/provider/parking-lot/new">
            <Button className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Add Parking Lot</span>
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Lots</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalLots}</p>
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
                  <MapPin className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Lots</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.activeLots}</p>
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
                  <Car className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Spaces</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSpaces}</p>
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
                  <Users className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${stats.monthlyRevenue.toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Parking Lots Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Parking Lots</h2>
          </div>

          {parkingLots.length === 0 ? (
            <Card className="p-12 text-center">
              <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No parking lots yet
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Start earning by listing your first parking space. It's easy and takes just a few minutes.
              </p>
              <Link to="/provider/parking-lot/new">
                <Button className="inline-flex items-center space-x-2">
                  <Plus className="h-5 w-5" />
                  <span>List Your First Space</span>
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {parkingLots.map((lot, index) => (
                <ParkingLotItem
                  key={lot.id}
                  lot={lot}
                  index={index}
                  handleDeleteLot={handleDeleteLot}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
