import React, { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../UI/Button';

export interface FilterState {
  priceRange: [number, number];
  features: {
    covered: boolean;
    security: boolean;
    ev_charging: boolean;
    accessible: boolean;
  };
  distance: number;
  availability: string;
  vehicleType: string;
}

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
}

// ⚡ Bolt Optimization: Moved static array outside component body to prevent unnecessary memory re-allocation on every render.
const FEATURES_LIST = Object.entries({
  covered: 'Covered Parking',
  security: '24/7 Security',
  ev_charging: 'EV Charging',
  accessible: 'Wheelchair Accessible',
});

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ onFiltersChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 50],
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

  const handleFilterChange = (key: keyof FilterState, value: FilterState[keyof FilterState]) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleFeatureChange = (feature: string) => {
    const newFeatures = {
      ...filters.features,
      [feature]: !filters.features[feature as keyof typeof filters.features],
    };
    handleFilterChange('features', newFeatures);
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filters
        {Object.values(filters.features).some(Boolean) && (
          <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
            {Object.values(filters.features).filter(Boolean).length}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border p-4 z-50"
          >
            {/* Price Range */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range (per hour)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  value={filters.priceRange[0]}
                  onChange={(e) =>
                    handleFilterChange('priceRange', [
                      parseInt(e.target.value),
                      filters.priceRange[1],
                    ])
                  }
                  className="w-20 px-2 py-1 border rounded"
                />
                <span>to</span>
                <input
                  type="number"
                  min="0"
                  value={filters.priceRange[1]}
                  onChange={(e) =>
                    handleFilterChange('priceRange', [
                      filters.priceRange[0],
                      parseInt(e.target.value),
                    ])
                  }
                  className="w-20 px-2 py-1 border rounded"
                />
              </div>
            </div>

            {/* Vehicle Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Type
              </label>
              <select
                value={filters.vehicleType}
                onChange={(e) => handleFilterChange('vehicleType', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="any">Any Vehicle</option>
                <option value="car">Car</option>
                <option value="bike">Bike/Motorcycle</option>
              </select>
            </div>

            {/* Features */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Features
              </label>
              <div className="space-y-2">
                {FEATURES_LIST.map(([key, label]) => (
                  <label key={key} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.features[key as keyof typeof filters.features]}
                      onChange={() => handleFeatureChange(key)}
                      className="mr-2"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {/* Distance */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Distance (km)
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={filters.distance}
                onChange={(e) => handleFilterChange('distance', parseInt(e.target.value))}
                className="w-full"
              />
              <div className="text-sm text-gray-500">{filters.distance} km</div>
            </div>

            {/* Availability */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Availability
              </label>
              <select
                value={filters.availability}
                onChange={(e) => handleFilterChange('availability', e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="any">Any time</option>
                <option value="now">Available now</option>
                <option value="today">Available today</option>
                <option value="week">Available this week</option>
              </select>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const resetFilters: FilterState = {
                    priceRange: [0, 50],
                    features: {
                      covered: false,
                      security: false,
                      ev_charging: false,
                      accessible: false,
                    },
                    distance: 5,
                    availability: 'any',
                    vehicleType: 'any',
                  };
                  setFilters(resetFilters);
                  onFiltersChange(resetFilters);
                }}
                className="flex-1"
              >
                Reset
              </Button>
              <Button onClick={() => setIsOpen(false)} className="flex-1">
                Apply
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};