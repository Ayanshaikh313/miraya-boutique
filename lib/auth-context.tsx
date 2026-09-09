'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase-client';

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: 'customer' | 'admin';
  default_shipping_address: Record<string, any> | null;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  signUp: (
    fullName: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Fetch profile from public.users table
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
      } else if (data) {
        setProfile(data as UserProfile);
      }
    } catch (err) {
      console.error('Profile query failed:', err);
    }
  }, []);

  // Initialize session & set up auth listener
  useEffect(() => {
    async function initAuth() {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (initialSession?.user) {
          setSession(initialSession);
          setUser(initialSession.user);
          await fetchProfile(initialSession.user.id);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    }

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      const currentUser = currentSession?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        await fetchProfile(currentUser.id);

        // Attempt cart merge if session ID exists in localStorage
        if (typeof window !== 'undefined') {
          const sId = localStorage.getItem('miraya_session_id');
          if (sId) {
            try {
              await supabase.rpc('merge_anonymous_cart', {
                p_session_id: sId,
                p_user_id: currentUser.id,
              });
            } catch (err) {
              console.error('Cart merge RPC failed:', err);
            }
          }
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Sign Up
  const signUp = useCallback(
    async (fullName: string, email: string, password: string) => {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          // Explicitly insert into public.users if trigger hasn't fired yet
          await supabase.from('users').upsert({
            id: data.user.id,
            full_name: fullName,
            email,
            role: 'customer',
          });

          toast.success('Account created successfully! Welcome to MIRĀYA.');
          setIsAuthModalOpen(false);
          return { success: true };
        }

        return { success: false, error: 'Registration failed.' };
      } catch (err: any) {
        return { success: false, error: err.message || 'An error occurred during registration.' };
      }
    },
    []
  );

  // Sign In
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        toast.success(`Welcome back!`);
        setIsAuthModalOpen(false);
        return { success: true };
      }

      return { success: false, error: 'Login failed.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'An error occurred during login.' };
    }
  }, []);

  // Sign Out
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      toast.info('Signed out successfully.');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isAuthModalOpen,
        setIsAuthModalOpen,
        signUp,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
