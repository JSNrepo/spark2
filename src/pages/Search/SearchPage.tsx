import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, List, Grid } from 'lucide-react';
import { motion } from 'framer-motion';
import { db } from '../../lib/supabase';
import { ParkingLot } from '../../types';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ParkingLotCard from '../../components/ParkingLot/ParkingLotCard';
import MapView from '../../components/Map/MapView';
import LocationSearch from '../../components/Map/LocationSearch';
import { AdvancedFilters, FilterState } from '../../components/Search/AdvancedFilters';

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('location') || '');
  const [_selectedCoordinates, setSelectedCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 50] as [number, number],
    features: {
      covered: false,
      security: false,
      ev_charging: false,
      accessible: false,
    },
    distance: 5,
    availability: 'any',
    vehicleType: 'any',
  });

  const loadParkingLots = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const location = searchParams.get('location');
      const dbFilters = {
        address: location ?? undefined,
        minPrice: filters.priceRange[0],
        maxPrice: filters.priceRange[1],
        covered: filters.features.covered,
        security: filters.features.security,
        ev_charging: filters.features.ev_charging,
        accessible: filters.features.accessible,
        distance: filters.distance,
        availability: filters.availability,
        vehicleType: filters.vehicleType === 'any' ? undefined : filters.vehicleType as 'car' | 'bike' | 'both',
      };

      const { data, error: queryError } = await db.searchParkingLots(dbFilters);

      if (queryError) throw queryError;

      setParkingLots(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load parking lots');
    } finally {
      setLoading(false);
    }
  }, [searchParams, filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadParkingLots();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadParkingLots]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ location: searchQuery.trim() });
    }
  };

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setSearchQuery(address);
    setSearchParams({ location: address });
    setSelectedCoordinates({ lat, lng });
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 max-w-2xl">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="flex-1">
                  <LocationSearch
                    value={searchQuery}
                    onChange={setSearchQuery}
                    onLocationSelect={handleLocationSelect}
                    placeholder="Search for parking near..."
                  />
                </div>
                <Button type="submit" className="px-6">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </form>
            </div>

            <div className="flex items-center gap-2">
              <AdvancedFilters onFiltersChange={handleFiltersChange} />
              
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 ${
                    viewMode === 'list'
                      ? 'bg-white shadow text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="List View"
                  aria-label="List View"
                  aria-pressed={viewMode === 'list'}
                >
                  <List className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 ${
                    viewMode === 'grid'
                      ? 'bg-white shadow text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Grid View"
                  aria-label="Grid View"
                  aria-pressed={viewMode === 'grid'}
                >
                  <Grid className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 ${
                    viewMode === 'map'
                      ? 'bg-white shadow text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Map View"
                  aria-label="Map View"
                  aria-pressed={viewMode === 'map'}
                >
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <span>
              {parkingLots.length} parking {parkingLots.length === 1 ? 'space' : 'spaces'} found
              {searchParams.get('location') && ` near "${searchParams.get('location')}"`}
            </span>
            <select className="border rounded px-3 py-1">
              <option>Sort by: Relevance</option>
              <option>Sort by: Price (Low to High)</option>
              <option>Sort by: Price (High to Low)</option>
              <option>Sort by: Distance</option>
              <option>Sort by: Rating</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <Card className="mb-6 p-6 border-red-200 bg-red-50">
            <div className="text-red-600">{error}</div>
          </Card>
        )}

        {viewMode === 'list' ? (
          <div className="space-y-4">
            {parkingLots.map((lot) => (
              <motion.div
                key={lot.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <ParkingLotCard lot={lot} />
              </motion.div>
            ))}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {parkingLots.map((lot) => (
              <motion.div
                key={lot.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <ParkingLotCard lot={lot} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="h-[600px] rounded-lg overflow-hidden border">
            <MapView
              parkingLots={parkingLots}
              showUserLocation={true}
              center={undefined}
              zoom={12}
            />
          </div>
        )}

        {parkingLots.length === 0 && !loading && (
          <Card className="p-12 text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No parking spaces found
            </h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search location or filters to find more options.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchParams({});
                setSearchQuery('');
              }}
            >
              Clear Search
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
