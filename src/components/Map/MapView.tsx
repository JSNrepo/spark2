import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Car, Bike, Star, DollarSign, Clock, ExternalLink } from 'lucide-react';
import { ParkingLot } from '../../types';
import Button from '../UI/Button';
import { Link } from 'react-router-dom';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  parkingLots: ParkingLot[];
  center?: [number, number];
  zoom?: number;
  onLocationSelect?: (lat: number, lng: number) => void;
  showUserLocation?: boolean;
  selectedLot?: string | null;
  filters?: {
    vehicleType?: 'car' | 'bike' | 'both';
    minRating?: number;
    maxDistance?: number;
  };
}

// Custom icons for different parking types
const iconCache: Record<string, L.DivIcon> = {};

const createCustomIcon = (type: 'car' | 'bike' | 'both', availability: 'high' | 'medium' | 'low') => {
  const cacheKey = `${type}-${availability}`;
  if (iconCache[cacheKey]) return iconCache[cacheKey];

  const colors = {
    high: '#10B981', // green
    medium: '#F59E0B', // yellow
    low: '#EF4444', // red
  };

  const icons = {
    car: '🚗',
    bike: '🚲',
    both: '🅿️'
  };

  const icon = L.divIcon({
    html: `
      <div style="
        background-color: ${colors[availability]};
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
      ">
        ${icons[type]}
      </div>
    `,
    className: 'custom-parking-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });

  iconCache[cacheKey] = icon;
  return icon;
};

// User location marker
let userLocationIconCache: L.DivIcon | null = null;

const createUserLocationIcon = () => {
  if (userLocationIconCache) return userLocationIconCache;
  userLocationIconCache = L.divIcon({
    html: `
      <div style="
        background-color: #3B82F6;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        animation: pulse 2s infinite;
      "></div>
      <style>
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
          100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
      </style>
    `,
    className: 'user-location-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
  return userLocationIconCache;
};

// Component to handle map events
const MapEventHandler: React.FC<{
  onLocationSelect?: (lat: number, lng: number) => void;
}> = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      if (onLocationSelect) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

// Component to fit map bounds to show all markers
const FitBounds: React.FC<{
  parkingLots: ParkingLot[];
  userLocation?: [number, number] | null;
}> = ({ parkingLots, userLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (parkingLots.length === 0) return;

    const bounds = L.latLngBounds([]);
    
    // Add parking lot locations to bounds
    parkingLots.forEach(lot => {
      if (lot.latitude && lot.longitude) {
        bounds.extend([lot.latitude, lot.longitude]);
      }
    });

    // Add user location to bounds if available
    if (userLocation) {
      bounds.extend(userLocation);
    }

    // Fit map to bounds with padding
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, parkingLots, userLocation]);

  return null;
};

const MapView: React.FC<MapViewProps> = ({
  parkingLots,
  center = [37.7749, -122.4194], // Default to San Francisco
  zoom = 13,
  onLocationSelect,
  showUserLocation = false,
  filters
}) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get user's current location if requested
    if (showUserLocation && navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: [number, number] = [
            position.coords.latitude,
            position.coords.longitude
          ];
          setUserLocation(location);
          setIsLoading(false);
        },
        (error) => {
          console.warn('Error getting user location:', error);
          setMapError('Unable to get your location');
          setIsLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    } else {
      setIsLoading(false);
    }
  }, [showUserLocation]);

  // Calculate distance between two points
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  // Filter and process parking lots based on criteria
  const filteredParkingLots = useMemo(() => {
    return parkingLots
      .filter(lot => {
        // Vehicle type filter
        if (filters?.vehicleType && filters.vehicleType !== 'both') {
          if (filters.vehicleType === 'car' && lot.carSpaces === 0) return false;
          if (filters.vehicleType === 'bike' && lot.bikeSpaces === 0) return false;
        }

        // Rating filter
        if (filters?.minRating && lot.rating < filters.minRating) return false;

        return true;
      })
      .map(lot => {
        const distance = userLocation
          ? calculateDistance(userLocation[0], userLocation[1], lot.latitude, lot.longitude)
          : undefined;
        return { ...lot, distance };
      })
      .filter(lot => {
        // Distance filter
        if (filters?.maxDistance && lot.distance !== undefined) {
          if (lot.distance > filters.maxDistance) return false;
        }

        return true;
      });
  }, [parkingLots, userLocation, filters, calculateDistance]);

  // Get availability level for color coding
  const getAvailabilityLevel = (lot: ParkingLot): 'high' | 'medium' | 'low' => {
    const percentage = (lot.availableSpaces / lot.totalSpaces) * 100;
    if (percentage > 50) return 'high';
    if (percentage > 20) return 'medium';
    return 'low';
  };

  // Get parking type for icon
  const getParkingType = (lot: ParkingLot): 'car' | 'bike' | 'both' => {
    if (lot.carSpaces > 0 && lot.bikeSpaces > 0) return 'both';
    if (lot.bikeSpaces > 0) return 'bike';
    return 'car';
  };

  // Error boundary for map rendering
  if (mapError) {
    return (
      <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center p-8">
          <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Map Error</h3>
          <p className="text-gray-600 mb-4">{mapError}</p>
          <Button onClick={() => window.location.reload()}>
            Reload Map
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg px-3 py-2 z-[1000]">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Loading map...</span>
          </div>
        </div>
      )}

      <MapContainer
        center={userLocation || center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Map event handler */}
        <MapEventHandler onLocationSelect={onLocationSelect} />

        {/* Fit bounds to show all markers */}
        <FitBounds parkingLots={filteredParkingLots} userLocation={userLocation} />

        {/* User location marker */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={createUserLocationIcon()}
          >
            <Popup>
              <div className="text-center">
                <Navigation className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="font-medium">Your Location</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Parking lot markers */}
        {filteredParkingLots.map((lot) => {
          if (!lot.latitude || !lot.longitude) return null;

          const availabilityLevel = getAvailabilityLevel(lot);
          const parkingType = getParkingType(lot);
          const distance = lot.distance;

          return (
            <Marker
              key={lot.id}
              position={[lot.latitude, lot.longitude]}
              icon={createCustomIcon(parkingType, availabilityLevel)}
            >
              <Popup maxWidth={300} className="parking-popup">
                <div className="p-2">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                      {lot.name}
                    </h3>
                    <div className="flex items-center ml-2">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-600 ml-1">
                        {lot.rating}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center text-xs text-gray-600">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="truncate">{lot.address}</span>
                    </div>
                    
                    {distance && (
                      <div className="flex items-center text-xs text-gray-600">
                        <Navigation className="h-3 w-3 mr-1" />
                        <span>{distance.toFixed(1)} km away</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center">
                          <Car className="h-3 w-3 text-gray-400 mr-1" />
                          <span className="text-gray-600">{lot.carSpaces}</span>
                        </div>
                        <div className="flex items-center">
                          <Bike className="h-3 w-3 text-gray-400 mr-1" />
                          <span className="text-gray-600">{lot.bikeSpaces}</span>
                        </div>
                      </div>
                      <div className={`font-medium ${
                        availabilityLevel === 'high' ? 'text-green-600' :
                        availabilityLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {lot.availableSpaces} available
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center">
                        <DollarSign className="h-3 w-3 text-gray-400 mr-1" />
                        <span className="text-gray-600">${lot.hourlyRate}/hr</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 text-gray-400 mr-1" />
                        <span className="text-gray-600">
                          {lot.operatingHours.open}-{lot.operatingHours.close}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link to={`/parking/${lot.id}`} className="flex-1">
                      <Button size="sm" variant="outline" className="w-full text-xs">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Details
                      </Button>
                    </Link>
                    <Link to={`/book/${lot.id}`} className="flex-1">
                      <Button size="sm" className="w-full text-xs">
                        Book Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
        <h4 className="text-xs font-medium text-gray-900 mb-2">Availability</h4>
        <div className="space-y-1">
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-gray-600">High (50%+)</span>
          </div>
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-gray-600">Medium (20-50%)</span>
          </div>
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-gray-600">Low (&lt;20%)</span>
          </div>
        </div>
      </div>

      {/* Results counter */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg px-3 py-2 z-[1000]">
        <div className="text-xs text-gray-600">
          Showing <span className="font-medium text-gray-900">{filteredParkingLots.length}</span> parking lots
        </div>
      </div>
    </div>
  );
};

export default MapView;