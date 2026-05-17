import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { User } from '../types';
import { auth, db } from '../lib/supabase';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, userData: Record<string, unknown>) => Promise<boolean>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Safety timeout to prevent infinite loading
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('AuthContext: Loading timeout reached (10s), forcing loading to false');
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeoutId);
  }, [loading]);

  // Helper to create basic profile from auth data (no database)
  const createBasicProfile = useCallback((supabaseUser: SupabaseUser): User => {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      firstName: supabaseUser.user_metadata?.firstName || '',
      lastName: supabaseUser.user_metadata?.lastName || '',
      phone: supabaseUser.user_metadata?.phone || '',
      role: supabaseUser.user_metadata?.userType === 'space_provider' ? 'space_provider' : 'customer',
      isVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as User;
  }, []);

  // Helper to create a new user profile (with error handling)
  const createNewUserProfile = useCallback(async (supabaseUser: SupabaseUser): Promise<User | null> => {
    try {
      const newProfile: Partial<User> = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        firstName: supabaseUser.user_metadata?.firstName || '',
        lastName: supabaseUser.user_metadata?.lastName || '',
        phone: supabaseUser.user_metadata?.phone || '',
        role: supabaseUser.user_metadata?.userType === 'space_provider' ? 'space_provider' : 'customer',
        organizationName: supabaseUser.user_metadata?.organizationName || '',
        organizationType: supabaseUser.user_metadata?.organizationType || 'individual',
        isVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      console.log('Creating new profile for:', newProfile.email);
      const { data: createdProfile, error: createError } = await db.createUserProfile(newProfile);
      
      if (createError) {
        console.error('Error creating user profile:', createError);
        // Return basic profile as fallback
        console.log('createNewUserProfile: Database creation failed, returning basic profile');
        return createBasicProfile(supabaseUser);
      }
      
      console.log('Successfully created new profile:', createdProfile?.email);
      return createdProfile || createBasicProfile(supabaseUser);
    } catch (error) {
      console.error('Error creating user profile:', error);
      
      // Return basic profile as fallback
      console.log('createNewUserProfile: Exception occurred, returning basic profile');
      return createBasicProfile(supabaseUser);
    }
  }, [createBasicProfile]);

  // Helper to fetch complete user profile from database
  const fetchUserProfile = useCallback(async (supabaseUser: SupabaseUser): Promise<User | null> => {
    const startTime = Date.now();
    console.log(`fetchUserProfile called with: ${supabaseUser?.email} at ${new Date().toLocaleTimeString()}`);
    if (!supabaseUser) {
      console.log('fetchUserProfile: No supabase user, returning null');
      return null;
    }

    try {
      console.log('fetchUserProfile: Getting user profile from database...');
      const { data: profile, error } = await db.getUserProfile(supabaseUser.id);
      const duration = Date.now() - startTime;

      console.log(`fetchUserProfile: Database query completed in ${duration}ms`, { profile, error });

      if (error) {
        console.error(`Error fetching user profile (${duration}ms):`, error);
        // Only create profile for specific "not found" errors
        if (typeof error === 'object' && error !== null && ('code' in error || 'message' in error)) {
          const err = error as { code?: string; message?: string };
          if (err.code === 'PGRST116' || err.message?.includes('No rows returned')) {
            console.log('fetchUserProfile: User not found, creating new profile...');
            return await createNewUserProfile(supabaseUser);
          }
        }
        // For other errors, return a basic fallback profile without database creation
        console.log('fetchUserProfile: Database error, returning basic fallback profile...');
        return createBasicProfile(supabaseUser);
      }

      if (profile) {
        console.log(`fetchUserProfile: Found existing profile (${duration}ms):`, profile.email);
        return profile;
      } else {
        console.log(`fetchUserProfile: No profile found (${duration}ms), creating new one...`);
        return await createNewUserProfile(supabaseUser);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`Error fetching user profile (${duration}ms):`, error);

      // Return basic profile without trying database operations
      console.log('fetchUserProfile: Exception occurred, returning basic fallback profile...');
      return createBasicProfile(supabaseUser);
    }
  }, [createBasicProfile, createNewUserProfile]);

  useEffect(() => {
    let isMounted = true;
    console.log('AuthContext: Initializing...');

    // Get initial session
    const initializeAuth = async () => {
      try {
        console.log('AuthContext: Getting current user...');
        const { user: supabaseUser, error } = await auth.getCurrentUser();
        
        if (!isMounted) return;
        
        if (error) {
          console.error('Error getting current user:', error);
          setUser(null);
          setLoading(false);
          console.log('AuthContext: Loading set to false (error case)');
          return;
        }

        if (supabaseUser) {
          console.log('AuthContext: Fetching user profile...', supabaseUser.email);
          const userProfile = await fetchUserProfile(supabaseUser);
          if (isMounted) {
            console.log('AuthContext: User profile fetched:', userProfile?.email);
            setUser(userProfile);
            setLoading(false);
            console.log('AuthContext: Loading set to false (success case)');
          }
        } else {
          console.log('AuthContext: No authenticated user');
          setUser(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (isMounted) {
          setUser(null);
          setLoading(false);
          console.log('AuthContext: Loading set to false (catch case)');
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      try {
        if (!isMounted) return;
        
        const authSession = session as Session | null;
        console.log('Auth state change:', event, authSession?.user?.email);
        
        // Only handle specific events to avoid unnecessary calls
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          if (event === 'SIGNED_OUT' || !authSession?.user) {
            console.log('AuthContext: User signed out');
            setUser(null);
            setLoading(false);
          } else if (authSession?.user) {
            console.log('AuthContext: User signed in, fetching profile...');
            const userProfile = await fetchUserProfile(authSession.user);
            if (isMounted) {
              console.log('AuthContext: User profile from state change:', userProfile?.email);
              setUser(userProfile);
              setLoading(false);
              console.log('AuthContext: Loading set to false (state change)');
            }
          }
        }
      } catch (error) {
        console.error('Error handling auth state change:', error);
        if (isMounted) {
          setUser(null);
          setLoading(false);
          console.log('AuthContext: Loading set to false (state change error)');
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await auth.signIn(email, password);
      if (error) {
        toast.error('Invalid email or password');
        console.error('Sign in error:', error); // Log original error for debugging
        return false;
      }
      toast.success('Welcome back!');
      return true;
    } catch (error) {
      toast.error('An error occurred during sign in');
      console.error('Sign in error:', error);
      return false;
    }
  };

  const signUp = async (email: string, password: string, userData: Record<string, unknown>): Promise<boolean> => {
    try {
      const { error } = await auth.signUp(email, password, userData);
      if (error) {
        toast.error('Registration failed. Please check your details and try again.');
        console.error('Sign up error:', error); // Log original error for debugging
        return false;
      }
      toast.success('Account created successfully!');
      return true;
    } catch (error) {
      toast.error('An error occurred during sign up');
      console.error('Sign up error:', error);
      return false;
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      await auth.signOut();
      setUser(null);
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Error signing out');
      console.error('Sign out error:', error);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};