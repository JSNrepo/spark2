import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Booking, ParkingLot, User } from '../types';

interface DbFilters {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  vehicleType?: 'car' | 'bike' | 'both';
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

let supabase: SupabaseClient;

try {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  console.log('Supabase initialized successfully');
} catch (error) {
  console.error('Failed to initialize Supabase:', error);
  throw new Error('Failed to initialize Supabase client');
}

// Auth helpers
export const auth = {
  signUp: async (email: string, password: string, userData: Record<string, unknown>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });
    return { data, error };
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  onAuthStateChange: (callback: (event: string, session: unknown) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Database helpers
export const db = {
  // Parking lots - only show active lots from verified space providers
  // Enhanced function that can handle both old and new schema
  searchParkingLots: async (filters: DbFilters = {}) => {
    try {
      console.log('searchParkingLots: Starting query with filters:', filters);
      
      let query = supabase
        .from('parking_lots')
        .select('*') // Start with basic query
        .eq('isActive', true);

      if (filters.city) {
        query = query.ilike('city', `%${filters.city}%`);
      }

      if (filters.minPrice !== undefined) {
        query = query.gte('hourlyRate', filters.minPrice);
      }

      if (filters.maxPrice !== undefined) {
        query = query.lte('hourlyRate', filters.maxPrice);
      }

      if (filters.vehicleType && filters.vehicleType !== 'both') {
        if (filters.vehicleType === 'car') {
          query = query.gt('carSpaces', 0);
        } else if (filters.vehicleType === 'bike') {
          query = query.gt('bikeSpaces', 0);
        }
      }

      query = query.order('createdAt', { ascending: false });

      const { data, error } = await query;
      
      if (error) {
        console.error('searchParkingLots error:', error);
        return { data: null, error };
      }
      
      console.log('searchParkingLots success:', data?.length, 'results');
      return { data, error: null };
    } catch (err) {
      console.error('Database error in searchParkingLots:', err);
      return { data: null, error: err };
    }
  },

  getParkingLot: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('parking_lots')
        .select('*') // Simplified query to test basic functionality
        .eq('id', id)
        .eq('isActive', true)
        .single();

      console.log('getParkingLot result:', { data, error });
      return { data, error };
    } catch (err) {
      console.error('Database error in getParkingLot:', err);
      return { data: null, error: err };
    }
  },  // Space provider functions
  createParkingLot: async (parkingLotData: Partial<ParkingLot>) => {
    try {
      const { data, error } = await supabase
        .from('parking_lots')
        .insert(parkingLotData)
        .select()
        .single();
        
      return { data, error };
    } catch (err) {
      console.error('Database error:', err);
      return { data: null, error: err };
    }
  },

  updateParkingLot: async (id: string, updates: Partial<ParkingLot>) => {
    try {
      const { data, error } = await supabase
        .from('parking_lots')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      return { data, error };
    } catch (err) {
      console.error('Database error:', err);
      return { data: null, error: err };
    }
  },

  getProviderParkingLots: async (providerId: string) => {
    try {
      console.log(`getProviderParkingLots: Querying for provider ${providerId}`);
      const { data, error } = await supabase
        .from('parking_lots')
        .select('*')
        .eq('providerId', providerId)
        .order('createdAt', { ascending: false });
        
      console.log('getProviderParkingLots result:', { data, error });
      return { data, error };
    } catch (err) {
      console.error('Database error in getProviderParkingLots:', err);
      return { data: null, error: err };
    }
  },

  // Bookings
  createBooking: async (booking: Partial<Booking>) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert(booking)
        .select()
        .single();
        
      return { data, error };
    } catch (err) {
      console.error('Database error:', err);
      return { data: null, error: err };
    }
  },

  getBooking: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          parking_lots (
            name,
            address,
            city,
            images,
            hourlyRate
          )
        `)
        .eq('id', id)
        .single();
        
      return { data, error };
    } catch (err) {
      console.error('Database error:', err);
      return { data: null, error: err };
    }
  },

  getUserBookings: async (userId: string) => {
    try {
      console.log(`getUserBookings: Querying bookings for user ${userId}`);
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          parking_lots!parkingLotId (
            name,
            address,
            city,
            images
          )
        `)
        .eq('userId', userId)
        .order('createdAt', { ascending: false });
        
      console.log('getUserBookings result:', { data, error });
      return { data, error };
    } catch (err) {
      console.error('Database error in getUserBookings:', err);
      return { data: null, error: err };
    }
  },

  updateBooking: async (id: string, updates: Partial<Booking>) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      return { data, error };
    } catch (err) {
      console.error('Database error:', err);
      return { data: null, error: err };
    }
  },

  // User profile management
  createUserProfile: async (userData: Partial<User>) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();
        
      return { data, error };
    } catch (err) {
      console.error('Database error:', err);
      return { data: null, error: err };
    }
  },

  updateUserProfile: async (id: string, updates: Partial<User>) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      return { data, error };
    } catch (err) {
      console.error('Database error:', err);
      return { data: null, error: err };
    }
  },

  getUserProfile: async (id: string) => {
    try {
      console.log(`getUserProfile: Querying for user ID: ${id}`);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
        
      console.log(`getUserProfile: Query result - data:`, data, 'error:', error);
      return { data, error };
    } catch (err) {
      console.error('Database error in getUserProfile:', err);
      return { data: null, error: err };
    }
  },

  // Reviews
  getParkingLotReviews: async (parkingLotId: string) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          users (
            firstName,
            lastName,
            avatar
          )
        `)
        .eq('parkingLotId', parkingLotId)
        .order('createdAt', { ascending: false });
        
      return { data, error };
    } catch (err) {
      console.error('Database error:', err);
      return { data: null, error: err };
    }
  },

  createReview: async (review: { rating: number; comment: string; userId: string; parkingLotId: string }) => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert(review)
        .select()
        .single();
        
      return { data, error };
    } catch (err) {
      console.error('Database error:', err);
      return { data: null, error: err };
    }
  },

  // Provider-specific functions
  getProviderBookings: async (providerId: string) => {
    try {
      console.log(`getProviderBookings: Querying bookings for provider ${providerId}`);
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          parking_lots!inner (
            name,
            address,
            city,
            providerId
          ),
          users (
            firstName,
            lastName,
            email
          )
        `)
        .eq('parking_lots.providerId', providerId)
        .order('createdAt', { ascending: false });
        
      console.log('getProviderBookings result:', { data, error });
      return { data, error };
    } catch (err) {
      console.error('Database error in getProviderBookings:', err);
      return { data: null, error: err };
    }
  },

  deleteBooking: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id)
        .select()
        .single();
        
      return { data, error };
    } catch (err) {
      console.error('Database error:', err);
      return { data: null, error: err };
    }
  },

  deleteParkingLot: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('parking_lots')
        .delete()
        .eq('id', id)
        .select()
        .single();
        
      return { data, error };
    } catch (err) {
      console.error('Database error:', err);
      return { data: null, error: err };
    }
  },

  // Storage
  uploadParkingLotImage: async (file: File, path: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${path}-${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('parking-lot-images')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('parking-lot-images')
        .getPublicUrl(fileName);

      return { publicUrl: data.publicUrl, error: null };
    } catch (err) {
      console.error('Storage error:', err);
      return { publicUrl: null, error: err };
    }
  },
};
