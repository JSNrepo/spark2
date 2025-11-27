export interface ParkingLot {
  id: string;
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number;
  longitude: number;
  totalSpaces: number;
  availableSpaces: number;
  carSpaces: number;
  bikeSpaces: number;
  hourlyRate: number;
  dailyRate: number;
  monthlyRate: number;
  images: string[];
  amenities: string[];
  operatingHours: {
    open: string;
    close: string;
  };
  providerId: string; // Updated from ownerId to match database schema
  rating: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  parkingLotId: string;
  vehicleType: 'car' | 'bike';
  vehiclePlate: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentId?: string;
  qrCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'customer' | 'space_provider' | 'admin'; // Reverted to match newer migration
  avatar?: string;
  isVerified: boolean;
  // Space provider specific fields
  organizationName?: string;
  organizationType?: 'individual' | 'business' | 'government' | 'nonprofit';
  businessLicense?: string;
  taxId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  userId: string;
  parkingLotId: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export interface SearchFilters {
  location?: string;
  vehicleType?: 'car' | 'bike' | 'both';
  startDate?: string;
  endDate?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  maxDistance?: number;
  amenities?: string[];
  availableOnly?: boolean;
  instantBooking?: boolean;
  sortBy?: 'price' | 'rating' | 'distance';
  sortOrder?: 'asc' | 'desc';
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret: string;
}