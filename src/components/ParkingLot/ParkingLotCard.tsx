import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Car, Bike, Clock, DollarSign, Shield } from 'lucide-react';
import { ParkingLot } from '../../types';
import Card from '../UI/Card';
import Button from '../UI/Button';

interface ParkingLotCardProps {
  lot: ParkingLot;
}

const ParkingLotCard: React.FC<ParkingLotCardProps> = ({ lot }) => {
  const availabilityPercentage = (lot.availableSpaces / lot.totalSpaces) * 100;
  const availabilityColor = availabilityPercentage > 50 ? 'text-green-600' : 
                           availabilityPercentage > 20 ? 'text-yellow-600' : 'text-red-600';

  return (
    <Card className="overflow-hidden h-full flex flex-col" hover>
      {/* Image */}
      <div className="relative h-48">
        <img
          src={lot.images[0]}
          alt={lot.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3 bg-white rounded-full px-2 py-1 text-sm font-medium">
          ${lot.hourlyRate}/hr
        </div>
        {lot.availableSpaces < 10 && (
          <div className="absolute top-3 left-3 bg-red-500 text-white rounded-full px-2 py-1 text-xs font-medium">
            Only {lot.availableSpaces} left
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
              {lot.name}
            </h3>
            <div className="flex items-center ml-2">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm text-gray-600 ml-1">
                {lot.rating} ({lot.reviewCount})
              </span>
            </div>
          </div>

          <div className="flex items-center text-gray-600 mb-3">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-sm">{lot.address}, {lot.city}</span>
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {lot.description}
          </p>

          {/* Availability */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Car className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-sm text-gray-600">{lot.carSpaces}</span>
              </div>
              <div className="flex items-center">
                <Bike className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-sm text-gray-600">{lot.bikeSpaces}</span>
              </div>
            </div>
            <div className={`text-sm font-medium ${availabilityColor}`}>
              {lot.availableSpaces} available
            </div>
          </div>

          {/* Amenities */}
          <div className="flex flex-wrap gap-1 mb-4">
            {lot.amenities.slice(0, 3).map((amenity, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {amenity === 'Security' && <Shield className="h-3 w-3 mr-1" />}
                {amenity === '24/7' && <Clock className="h-3 w-3 mr-1" />}
                {amenity}
              </span>
            ))}
            {lot.amenities.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                +{lot.amenities.length - 3} more
              </span>
            )}
          </div>

          {/* Pricing */}
          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-1" />
              <span>Daily: ${lot.dailyRate}</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{lot.operatingHours.open} - {lot.operatingHours.close}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-gray-100">
          <Link to={`/parking/${lot.id}`} className="flex-1">
            <Button className="w-full">
              View Details
            </Button>
          </Link>
          <Link to={`/book/${lot.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              Book Now
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default ParkingLotCard;