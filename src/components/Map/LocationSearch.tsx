import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Navigation, X, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../UI/Input';
import Button from '../UI/Button';

interface LocationResult {
  display_name: string;
  lat: string;
  lon: string;
  place_id: string;
  type: string;
  importance: number;
}

interface LocationSearchProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  placeholder?: string;
  className?: string;
  showCurrentLocation?: boolean;
  value?: string;
  onChange?: (value: string) => void;
}

const LocationSearch: React.FC<LocationSearchProps> = ({
  onLocationSelect,
  placeholder = "Search for malls, addresses, landmarks...",
  className = "",
  showCurrentLocation = true,
  value,
  onChange
}) => {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (value !== undefined) {
      setQuery(value);
    }
  }, [value]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchLocation = async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setResults([]);
      return;
    }

    setLoading(true);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const currentController = new AbortController();
    abortControllerRef.current = currentController;

    try {
      // Enhanced search query for better parking-related results
      const enhancedQuery = searchQuery.toLowerCase().includes('parking') 
        ? searchQuery 
        : `${searchQuery} parking mall shopping center`;

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` + new URLSearchParams({
          format: 'json',
          q: enhancedQuery,
          limit: '8',
          countrycodes: 'us',
          addressdetails: '1',
          extratags: '1',
          namedetails: '1'
        }),
        { signal: currentController.signal }
      );

      if (!response.ok) {
        throw new Error('Search request failed');
      }

      const data: LocationResult[] = await response.json();
      
      // Sort results by importance and relevance
      const sortedResults = data
        .filter(result => result.lat && result.lon)
        .sort((a, b) => (b.importance || 0) - (a.importance || 0))
        .slice(0, 6);

      setResults(sortedResults);
      setShowResults(true);
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        return; // Ignore abort errors
      }
      console.error('Error searching location:', error);
      toast.error('Failed to search location. Please try again.');
      setResults([]);
    } finally {
      if (!currentController.signal.aborted) {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (onChange) {
      onChange(value);
    }

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce search
    debounceRef.current = setTimeout(() => {
      searchLocation(value);
    }, 300);
  };

  const handleLocationSelect = (result: LocationResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const address = result.display_name;
    
    // Extract main location name (first part before comma)
    const mainLocation = address.split(',')[0];
    setQuery(mainLocation);
    setShowResults(false);
    onLocationSelect(lat, lng, address);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocoding to get address
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?` + new URLSearchParams({
              format: 'json',
              lat: latitude.toString(),
              lon: longitude.toString(),
              addressdetails: '1'
            })
          );

          if (response.ok) {
            const data = await response.json();
            const address = data.display_name || 'Current Location';
            setQuery('Current Location');
            onLocationSelect(latitude, longitude, address);
          } else {
            throw new Error('Reverse geocoding failed');
          }
        } catch (error: unknown) {
          console.error('Error getting address:', error);
          toast.error('Failed to retrieve current location address.');
          setQuery('Current Location');
          onLocationSelect(latitude, longitude, 'Current Location');
        } finally {
          setGettingLocation(false);
        }
      },
      (error: GeolocationPositionError) => {
        console.error('Error getting location:', error);
        let errorMessage = 'Unable to get your current location.';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location services.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        
        toast.error(errorMessage);
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000 // 5 minutes
      }
    );
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    if (onChange) {
      onChange('');
    }
  };

  const formatDisplayName = (displayName: string) => {
    const parts = displayName.split(',').map(part => part.trim());
    const mainPart = parts[0];
    const locationPart = parts.slice(1, 3).join(', ');
    
    return {
      main: mainPart,
      location: locationPart
    };
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {loading ? (
            <Loader className="h-5 w-5 animate-spin" aria-hidden="true" />
          ) : (
            <Search className="h-5 w-5" aria-hidden="true" />
          )}
        </div>
        <Input
          type="text"
          value={query}
          onChange={handleInputChange}
          maxLength={200}
          placeholder={placeholder}
          aria-label={placeholder}
          className="pl-10 pr-20"
          onFocus={() => results.length > 0 && setShowResults(true)}
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {query && (
            <button
              onClick={clearSearch}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              title="Clear search"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
          {showCurrentLocation && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={getCurrentLocation}
              disabled={gettingLocation}
              className="p-1"
              title="Use current location"
              aria-label="Use current location"
            >
              {gettingLocation ? (
                <Loader className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Navigation className="h-4 w-4" aria-hidden="true" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {results.map((result) => {
            const formatted = formatDisplayName(result.display_name);
            return (
              <button
                key={result.place_id}
                onClick={() => handleLocationSelect(result)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-gray-50 transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-1 flex-shrink-0" aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {formatted.main}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {formatted.location}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Loading indicator */}
      {loading && query.length >= 3 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 text-center">
          <div className="flex items-center justify-center space-x-2">
            <Loader className="h-4 w-4 animate-spin text-blue-600" aria-hidden="true" />
            <span className="text-sm text-gray-600">Searching locations...</span>
          </div>
        </div>
      )}

      {/* No results */}
      {showResults && !loading && results.length === 0 && query.length >= 3 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 text-center">
          <div className="text-center">
            <MapPin className="h-8 w-8 text-gray-300 mx-auto mb-2" aria-hidden="true" />
            <p className="text-sm text-gray-600 mb-2">No locations found</p>
            <p className="text-xs text-gray-500">Try searching for a city, mall, or landmark</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationSearch;