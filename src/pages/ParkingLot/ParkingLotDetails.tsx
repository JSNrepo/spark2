import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, Car, Bike, Clock, Shield, Wifi, Camera, Phone, Calendar, Users } from 'lucide-react';
import { ParkingLot, Review } from '../../types';
import { db } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ParkingLotDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [parkingLot, setParkingLot] = useState<ParkingLot | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    try {
      // ⚡ Bolt Optimization: Batch independent API requests using Promise.all to reduce waterfall delays
      const [
        { data: parkingLotData, error: lotError },
        { data: reviewsData, error: reviewsError }
      ] = await Promise.all([
        db.getParkingLot(id),
        db.getParkingLotReviews(id)
      ]);

      if (lotError) {
        console.error('Error loading parking lot:', lotError);
        setError('Failed to load parking lot details. Please try again.');
        toast.error('Failed to load parking lot details');
      } else if (parkingLotData) {
        setParkingLot(parkingLotData);
      } else {
        setError('Parking lot not found');
        toast.error('Parking lot not found');
      }

      if (reviewsError) {
        console.error('Error loading reviews:', reviewsError);
      } else {
        setReviews(reviewsData || []);
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
      loadData();
    }
  }, [id, loadData]);

  const handleBookNow = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/book/${id}` } } });
    } else {
      navigate(`/book/${id}`);
    }
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case 'security': return <Shield className="h-4 w-4" />;
      case 'wifi': return <Wifi className="h-4 w-4" />;
      case 'cctv': return <Camera className="h-4 w-4" />;
      case 'valet': return <Users className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
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
          <h2 className="text-2xl font-bold text-red-900 mb-4">Error Loading Parking Lot</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Button onClick={loadData} className="w-full">
              Try Again
            </Button>
            <Button variant="outline" onClick={() => navigate('/search')} className="w-full">
              Back to Search
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
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <Link to="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link to="/search" className="hover:text-blue-600">Search</Link>
          <span>/</span>
          <span className="text-gray-900">{parkingLot.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <div className="relative h-96">
                <img
                  src={parkingLot.images[selectedImage]}
                  alt={parkingLot.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-4 left-4 flex space-x-2">
                  {parkingLot.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      aria-label={`View image ${index + 1}`}
                      aria-current={selectedImage === index ? 'true' : undefined}
                      className={`w-3 h-3 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 ${
                        selectedImage === index ? 'bg-white' : 'bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-3 gap-2">
                  {parkingLot.images.slice(0, 3).map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      aria-label={`Select image ${index + 1}`}
                      aria-current={selectedImage === index ? 'true' : undefined}
                      className={`relative h-20 rounded-lg overflow-hidden border-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                        selectedImage === index ? 'border-blue-500' : 'border-transparent hover:border-blue-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt=""
                        aria-hidden="true"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            {/* Details */}
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{parkingLot.name}</h1>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>{parkingLot.address}, {parkingLot.city}, {parkingLot.state} {parkingLot.zipCode}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center mr-4">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="ml-1 font-medium">{parkingLot.rating}</span>
                      <span className="ml-1 text-gray-600">({parkingLot.reviewCount} reviews)</span>
                    </div>
                    <div className="flex items-center text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm font-medium">{parkingLot.availableSpaces} spaces available</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed mb-6">{parkingLot.description}</p>

              {/* Amenities */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {parkingLot.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center space-x-2 text-gray-700">
                      {getAmenityIcon(amenity)}
                      <span className="text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Operating Hours */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Operating Hours</h3>
                <div className="flex items-center text-gray-700">
                  <Clock className="h-5 w-5 mr-2" />
                  <span>{parkingLot.operatingHours.open} - {parkingLot.operatingHours.close} (Daily)</span>
                </div>
              </div>

              {/* Capacity */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Parking Capacity</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Car className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-gray-700">Car Spaces</span>
                    </div>
                    <span className="font-semibold text-gray-900">{parkingLot.carSpaces}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center">
                      <Bike className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-gray-700">Bike Spaces</span>
                    </div>
                    <span className="font-semibold text-gray-900">{parkingLot.bikeSpaces}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Reviews */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Reviews ({reviews.length})
              </h3>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-start space-x-3">
                      <img
                        src={review.user.avatar}
                        alt={`${review.user.firstName} ${review.user.lastName}`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-gray-900">
                            {review.user.firstName} {review.user.lastName}
                          </h4>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm mb-2">{review.comment}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  ${parkingLot.hourlyRate}<span className="text-lg text-gray-600">/hour</span>
                </div>
                <div className="text-sm text-gray-600">
                  Daily: ${parkingLot.dailyRate} • Monthly: ${parkingLot.monthlyRate}
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Available Spaces</span>
                  <span className="font-medium text-green-600">{parkingLot.availableSpaces}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Capacity</span>
                  <span className="font-medium">{parkingLot.totalSpaces}</span>
                </div>
              </div>

              <Button onClick={handleBookNow} className="w-full mb-4" size="lg">
                <Calendar className="h-5 w-5 mr-2" />
                Book Now
              </Button>

              <div className="text-center">
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded px-2 py-1">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Contact Owner
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Quick Info</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Security</span>
                    <span className="text-green-600">24/7</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Covered</span>
                    <span className="text-green-600">Yes</span>
                  </div>
                  <div className="flex justify-between">
                    <span>EV Charging</span>
                    <span className="text-green-600">Available</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkingLotDetails;