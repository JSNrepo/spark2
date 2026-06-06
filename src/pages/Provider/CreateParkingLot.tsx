import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, DollarSign, Clock, Car, Image as ImageIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../lib/supabase';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Input from '../../components/UI/Input';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import LocationSearch from '../../components/Map/LocationSearch';
import ImageUpload from '../../components/UI/ImageUpload';
import toast from 'react-hot-toast';

const parkingLotSchema = z.object({
  name: z.string().min(1, 'Parking lot name is required').max(100, 'Name is too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description is too long'),
  address: z.string().min(1, 'Address is required').max(255, 'Address is too long'),
  city: z.string().min(1, 'City is required').max(100, 'City is too long'),
  state: z.string().min(1, 'State is required').max(50, 'State is too long'),
  zipCode: z.string().min(1, 'ZIP code is required').max(20, 'ZIP code is too long'),
  totalSpaces: z.number().min(1, 'Must have at least 1 space'),
  carSpaces: z.number().min(0, 'Car spaces cannot be negative'),
  bikeSpaces: z.number().min(0, 'Bike spaces cannot be negative'),
  hourlyRate: z.number().min(0, 'Hourly rate cannot be negative'),
  dailyRate: z.number().min(0, 'Daily rate cannot be negative'),
  monthlyRate: z.number().min(0, 'Monthly rate cannot be negative'),
  openTime: z.string().min(1, 'Opening time is required').max(20, 'Opening time is too long'),
  closeTime: z.string().min(1, 'Closing time is required').max(20, 'Closing time is too long'),
});

type ParkingLotFormData = z.infer<typeof parkingLotSchema>;

const CreateParkingLot: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ParkingLotFormData>({
    resolver: zodResolver(parkingLotSchema),
    defaultValues: {
      carSpaces: 0,
      bikeSpaces: 0,
      hourlyRate: 0,
      dailyRate: 0,
      monthlyRate: 0,
    },
  });

  const watchedFields = watch();

  // Redirect if not space provider
  if (user?.role !== 'space_provider') {
    navigate('/dashboard');
    return null;
  }

  const amenityOptions = [
    'Covered Parking',
    'Security Cameras',
    'EV Charging',
    'Wheelchair Accessible',
    '24/7 Access',
    'Valet Service',
    'Car Wash',
    'Security Guard',
  ];

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setSelectedLocation({ lat, lng, address });
    setValue('address', address);
    
    // Extract city and state from address
    const parts = address.split(', ');
    if (parts.length >= 3) {
      setValue('city', parts[parts.length - 3]);
      setValue('state', parts[parts.length - 2].split(' ')[0]);
      setValue('zipCode', parts[parts.length - 2].split(' ')[1] || '');
    }
  };

  const handleAmenityToggle = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const onSubmit = async (data: ParkingLotFormData) => {
    if (!selectedLocation) {
      toast.error('Please select a location on the map');
      return;
    }

    setLoading(true);
    try {
      // ⚡ Bolt Optimization: Batch independent API requests using Promise.all to reduce waterfall delays
      // Upload images concurrently instead of sequentially
      const uploadPromises = selectedImages.map(file =>
        db.uploadParkingLotImage(file, 'parking-lot').then(({ publicUrl, error }) => {
          if (error) {
            console.error('Failed to upload image:', error);
            toast.error(`Failed to upload ${file.name}`);
            return null;
          }
          return publicUrl;
        })
      );

      const uploadResults = await Promise.all(uploadPromises);
      const imageUrls = uploadResults.filter((url): url is string => url !== null);

      const parkingLotData = {
        ...data,
        providerId: user?.id,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        availableSpaces: data.totalSpaces,
        images: imageUrls,
        amenities: selectedAmenities,
        operatingHours: {
          open: data.openTime,
          close: data.closeTime,
        },
        rating: 0,
        reviewCount: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { error } = await db.createParkingLot(parkingLotData);

      if (error) {
        console.error('Error creating parking lot:', error);
        toast.error('Failed to create parking lot');
        return;
      }

      toast.success('Parking lot created successfully!');
      navigate('/provider/dashboard');
    } catch (error: unknown) {
      console.error('Error creating parking lot:', error);
      toast.error('An error occurred while creating the parking lot');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create New Parking Lot
          </h1>
          <p className="text-gray-600">
            Add a new parking space to start earning from your property
          </p>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center mb-6">
                <MapPin className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Input
                    label="Parking Lot Name"
                    {...register('name')}
                    error={errors.name?.message}
                    placeholder="e.g., Downtown Plaza Parking"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your parking lot, nearby landmarks, access instructions..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Location */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center mb-6">
                <MapPin className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Location</h2>
              </div>

              <div className="mb-6">
                <LocationSearch
                  onLocationSelect={handleLocationSelect}
                  placeholder="Search for your parking lot address..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="md:col-span-2">
                  <Input
                    label="Street Address"
                    {...register('address')}
                    error={errors.address?.message}
                    placeholder="123 Main Street"
                    disabled
                  />
                </div>

                <div>
                  <Input
                    label="City"
                    {...register('city')}
                    error={errors.city?.message}
                    placeholder="City"
                    disabled
                  />
                </div>

                <div>
                  <Input
                    label="State"
                    {...register('state')}
                    error={errors.state?.message}
                    placeholder="State"
                    disabled
                  />
                </div>

                <div>
                  <Input
                    label="ZIP Code"
                    {...register('zipCode')}
                    error={errors.zipCode?.message}
                    placeholder="12345"
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Capacity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6">
              <div className="flex items-center mb-6">
                <Car className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Capacity</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Input
                    label="Total Spaces"
                    type="number"
                    {...register('totalSpaces', { valueAsNumber: true })}
                    error={errors.totalSpaces?.message}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Input
                    label="Car Spaces"
                    type="number"
                    {...register('carSpaces', { valueAsNumber: true })}
                    error={errors.carSpaces?.message}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Input
                    label="Bike Spaces"
                    type="number"
                    {...register('bikeSpaces', { valueAsNumber: true })}
                    error={errors.bikeSpaces?.message}
                    placeholder="0"
                  />
                </div>
              </div>

              {(watchedFields.carSpaces + watchedFields.bikeSpaces) !== watchedFields.totalSpaces && (
                <p className="mt-2 text-sm text-amber-600">
                  Car spaces + Bike spaces should equal total spaces
                </p>
              )}
            </Card>
          </motion.div>

          {/* Pricing */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6">
              <div className="flex items-center mb-6">
                <DollarSign className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Pricing</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Input
                    label="Hourly Rate ($)"
                    type="number"
                    step="0.01"
                    {...register('hourlyRate', { valueAsNumber: true })}
                    error={errors.hourlyRate?.message}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Input
                    label="Daily Rate ($)"
                    type="number"
                    step="0.01"
                    {...register('dailyRate', { valueAsNumber: true })}
                    error={errors.dailyRate?.message}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Input
                    label="Monthly Rate ($)"
                    type="number"
                    step="0.01"
                    {...register('monthlyRate', { valueAsNumber: true })}
                    error={errors.monthlyRate?.message}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Operating Hours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-6">
              <div className="flex items-center mb-6">
                <Clock className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Operating Hours</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Input
                    label="Opening Time"
                    type="time"
                    {...register('openTime')}
                    error={errors.openTime?.message}
                  />
                </div>

                <div>
                  <Input
                    label="Closing Time"
                    type="time"
                    {...register('closeTime')}
                    error={errors.closeTime?.message}
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Images */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <Card className="p-6">
              <div className="flex items-center mb-6">
                <ImageIcon className="h-6 w-6 text-blue-600 mr-2" />
                <h2 className="text-xl font-semibold text-gray-900">Images</h2>
              </div>

              <ImageUpload onImagesChange={setSelectedImages} maxImages={5} />
            </Card>
          </motion.div>

          {/* Amenities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Amenities</h2>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {amenityOptions.map((amenity) => (
                  <label
                    key={amenity}
                    className="flex items-center space-x-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAmenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{amenity}</span>
                  </label>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex justify-end space-x-4"
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/provider/dashboard')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="min-w-[120px]"
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Create Parking Lot'}
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default CreateParkingLot;
