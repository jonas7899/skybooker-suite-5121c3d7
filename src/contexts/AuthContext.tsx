import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type AppRole = Database['public']['Enums']['app_role'];
type ProfileStatus = 'bootstrap' | 'pending' | 'active' | 'rejected' | 'inactive' | 'suspended';

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  status: ProfileStatus;
  is_bootstrap: boolean;
  rejected_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  operator_id: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  userRole: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isBootstrapUser: boolean;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null; status?: ProfileStatus }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else if (profileData) {
        setProfile(profileData as Profile);
      }

      // Fetch user role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (roleError) {
        console.error('Error fetching user role:', roleError);
      } else if (roleData) {
        setUserRole(roleData as UserRole);
      }
    } catch (error) {
      console.error('Error in fetchUserData:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        // Defer Supabase calls with setTimeout
        if (newSession?.user) {
          setTimeout(() => {
            fetchUserData(newSession.user.id);
          }, 0);
        } else {
          setProfile(null);
          setUserRole(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      
      if (existingSession?.user) {
        fetchUserData(existingSession.user.id).finally(() => {
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, phone: string): Promise<{ error: Error | null }> => {
    try {
      // Check if user already exists with this email
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('status, rejected_until')
        .eq('id', email) // This won't work - need to check auth.users
        .maybeSingle();

      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            phone: phone,
          }
        }
      });

      if (error) {
        return { error };
      }

      if (data.user) {
        // Create profile with pending status
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            full_name: fullName,
            phone: phone,
            status: 'pending',
            is_bootstrap: false,
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          return { error: profileError };
        }

        // Create user role with 'user' role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: data.user.id,
            role: 'user',
          });

        if (roleError) {
          console.error('Error creating user role:', roleError);
        }
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string): Promise<{ error: Error | null; status?: ProfileStatus }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      if (data.user) {
        // Fetch profile to check status
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profileError) {
          return { error: profileError };
        }

        if (profileData) {
          const profile = profileData as Profile;
          
          // Check if rejected and cooldown is active
          if (profile.status === 'rejected' && profile.rejected_until) {
            const cooldownEnd = new Date(profile.rejected_until);
            if (cooldownEnd > new Date()) {
              await supabase.auth.signOut();
              return { error: new Error('cooldown_active'), status: 'rejected' };
            }
          }

          // Check status
          if (profile.status === 'pending') {
            await supabase.auth.signOut();
            return { error: new Error('account_pending'), status: 'pending' };
          }

          if (profile.status === 'suspended') {
            await supabase.auth.signOut();
            return { error: new Error('account_suspended'), status: 'suspended' };
          }

          if (profile.status === 'inactive') {
            await supabase.auth.signOut();
            return { error: new Error('account_inactive'), status: 'inactive' };
          }

          setProfile(profile);
        }

        // Fetch role
        await fetchUserData(data.user.id);
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setUserRole(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserData(user.id);
    }
  };

  const isBootstrapUser = profile?.is_bootstrap === true && profile?.status === 'bootstrap';

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        userRole,
        isAuthenticated: !!user && profile?.status === 'active',
        isLoading,
        isBootstrapUser,
        signUp,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
