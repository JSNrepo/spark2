import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Clock, Car, Bike, CreditCard, MapPin, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { addHours, format, differenceInHours } from 'date-fns';
import { ParkingLot } from '../../types';
import { db } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';

const bookingSchema = z.object({
  vehicleType: z.enum(['car', 'bike']),
  vehiclePlate: z.string().min(3, 'Vehicle plate is required'),
  startDate: z.string().min(1, 'Start date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endDate: z.string().min(1, 'End date is required'),
  endTime: z.string().min(1, 'End time is required'),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const BookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [parkingLot, setParkingLot] = useState<ParkingLot | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      vehicleType: 'car',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      startTime: format(new Date(), 'HH:mm'),
      endDate: format(addHours(new Date(), 2), 'yyyy-MM-dd'),
      endTime: format(addHours(new Date(), 2), 'HH:mm'),
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    if (id) {
      loadParkingLot();
    }
  }, [id]);

  useEffect(() => {
    calculateTotal();
  }, [watchedValues.startDate, watchedValues.startTime, watchedValues.endDate, watchedValues.endTime, parkingLot]);

  const loadParkingLot = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await db.getParkingLot(id);
      if (dbError) {
        console.error('Error loading parking lot:', dbError);
        setError('Failed to load parking lot details. Please try again.');
        toast.error('Failed to load parking lot details');
      } else if (data) {
        setParkingLot(data);
      } else {
        setError('Parking lot not found');
        toast.error('Parking lot not found');
      }
    } catch (err) {
      console.error('Database error:', err);
      setError('Unable to connect to database. Please check your connection.');
      toast.error('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (!watchedValues.startDate || !watchedValues.startTime || !watchedValues.endDate || !watchedValues.endTime || !parkingLot) {
      return;
    }

    const startDateTime = new Date(`${watchedValues.startDate}T${watchedValues.startTime}`);
    const endDateTime = new Date(`${watchedValues.endDate}T${watchedValues.endTime}`);
    
    if (endDateTime <= startDateTime) {
      setTotalHours(0);
      setTotalAmount(0);
      return;
    }

    const hours = differenceInHours(endDateTime, startDateTime);
    setTotalHours(hours);
    
    if (parkingLot) {
      const amount = hours * parkingLot.hourlyRate;
      setTotalAmount(amount);
    }
  };

  const onSubmit = async (data: BookingFormData) => {
    if (!user || !parkingLot) {
      toast.error('Please log in to make a booking');
      return;
    }

    if (totalHours <= 0) {
      toast.error('End time must be after start time');
      return;
    }

    setSubmitting(true);
    try {
      const startDateTime = new Date(`${data.startDate}T${data.startTime}`);
      const endDateTime = new Date(`${data.endDate}T${data.endTime}`);

      const bookingData = {
        userId: user.id,
        parkingLotId: parkingLot.id,
        vehicleType: data.vehicleType,
        vehiclePlate: data.vehiclePlate.toUpperCase(),
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        totalHours,
        totalAmount,
        status: 'pending' as 'pending',
        paymentStatus: 'pending' as 'pending',
      };

      const { data: booking, error } = await db.createBooking(bookingData);
      
      if (error) {
        toast.error('Failed to create booking');
        console.error('Booking error:', error);
      } else {
        toast.success('Booking created successfully!');
        navigate(`/booking/${booking.id}`);
      }
    } catch (error) {
      toast.error('An error occurred while creating the booking');
      console.error('Booking error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
          <p className="text-gray-600 mb-6">Please log in to make a booking.</p>
          <Button onClick={() => navigate('/login')}>
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md border-red-200 bg-red-50">
          <h2 className="text-2xl font-bold text-red-900 mb-4">Error Loading Parking Lot</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Button onClick={loadParkingLot} className="w-full">
              Try Again
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)} className="w-full">
              Go Back
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!parkingLot) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Parking Lot Not Found</h2>
          <p className="text-gray-600 mb-6">The parking lot you're looking for doesn't exist or may have been removed.</p>
          <Button onClick={() => navigate('/search')}>
            Search Parking
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Book Your Parking Spot</h1>
              
              {/* Parking Lot Info */}
              <motion.div 
                className="bg-gray-50 rounded-lg p-4 mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <div className="flex items-start space-x-4">
                  <img
                    src={parkingLot.images[0]}
                    alt={parkingLot.name}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{parkingLot.name}</h3>
                    <div className="flex items-center text-gray-600 mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{parkingLot.address}, {parkingLot.city}</span>
                    </div>
                    <div className="flex items-center mt-2 space-x-4">
                      <div className="flex items-center text-green-600">
                        <Shield className="h-4 w-4 mr-1" />
                        <span className="text-sm">Secure</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        ${parkingLot.hourlyRate}/hour
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Vehicle Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Vehicle Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`
                      relative flex cursor-pointer rounded-lg border p-4 focus:outline-none
                      ${watchedValues.vehicleType === 'car' 
                        ? 'border-blue-600 bg-blue-50 text-blue-900' 
                        : 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
                      }
                    `}>
                      <input
                        type="radio"
                        value="car"
                        {...register('vehicleType')}
                        className="sr-only"
                      />
                      <div className="flex items-center">
                        <Car className="h-5 w-5 mr-3" />
                        <div>
                          <span className="block text-sm font-medium">Car</span>
                          <span className="block text-xs text-gray-500">
                            {parkingLot.carSpaces} spaces available
                          </span>
                        </div>
                      </div>
                    </label>
                    <label className={`
                      relative flex cursor-pointer rounded-lg border p-4 focus:outline-none
                      ${watchedValues.vehicleType === 'bike' 
                        ? 'border-blue-600 bg-blue-50 text-blue-900' 
                        : 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
                      }
                    `}>
                      <input
                        type="radio"
                        value="bike"
                        {...register('vehicleType')}
                        className="sr-only"
                      />
                      <div className="flex items-center">
                        <Bike className="h-5 w-5 mr-3" />
                        <div>
                          <span className="block text-sm font-medium">Bike</span>
                          <span className="block text-xs text-gray-500">
                            {parkingLot.bikeSpaces} spaces available
                          </span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Vehicle Plate */}
                <Input
                  label="Vehicle Plate Number"
                  placeholder="ABC-123"
                  {...register('vehiclePlate')}
                  error={errors.vehiclePlate?.message}
                />

                {/* Date and Time Selection */}
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                      Start Time
                    </h3>
                    <div className="space-y-4">
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" style={{ top: '38px' }} />
                        <Input
                          label="Date"
                          type="date"
                          className="pl-10"
                          {...register('startDate')}
                          error={errors.startDate?.message}
                        />
                      </div>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" style={{ top: '38px' }} />
                        <Input
                          label="Time"
                          type="time"
                          className="pl-10"
                          {...register('startTime')}
                          error={errors.startTime?.message}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                      End Time
                    </h3>
                    <div className="space-y-4">
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" style={{ top: '38px' }} />
                        <Input
                          label="Date"
                          type="date"
                          className="pl-10"
                          {...register('endDate')}
                          error={errors.endDate?.message}
                        />
                      </div>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" style={{ top: '38px' }} />
                        <Input
                          label="Time"
                          type="time"
                          className="pl-10"
                          {...register('endTime')}
                          error={errors.endTime?.message}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  loading={submitting}
                  disabled={totalHours <= 0}
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Proceed to Payment
                </Button>
              </form>
            </Card>
          </motion.div>

          {/* Booking Summary */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">
                    {totalHours > 0 ? `${totalHours} hours` : '-'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Hourly Rate</span>
                  <span className="font-medium">${parkingLot.hourlyRate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Vehicle Type</span>
                  <span className="font-medium capitalize">{watchedValues.vehicleType}</span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between">
                  <span className="font-medium text-gray-900">Total Amount</span>
                  <span className="text-xl font-bold text-gray-900">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="font-medium text-blue-900 mb-2">What's Included</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• 24/7 Security monitoring</li>
                  <li>• Covered parking space</li>
                  <li>• Mobile app access</li>
                  <li>• Customer support</li>
                </ul>
              </div>

              <div className="text-xs text-gray-500">
                <p className="mb-2">
                  By proceeding, you agree to our Terms of Service and Privacy Policy.
                </p>
                <p>
                  Cancellation is free up to 1 hour before your booking starts.
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;