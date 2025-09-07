import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { Language } from '@/types';

export interface User {
  id: string;
  email: string;
  name: string;
  language: Language;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, language: Language) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateLanguage: (language: Language) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session?.user) {
          // Defer profile fetching to avoid blocking
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return;
      }

      if (data) {
        // Get user email from session
        const { data: { user: authUser } } = await supabase.auth.getUser();
        setUser({
          id: data.user_id,
          email: authUser?.email || '',
          name: data.name,
          language: (data.language as Language) || 'en'
        });
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  const signUp = async (email: string, password: string, name: string, language: Language) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name,
            language
          }
        }
      });

      return { error };
    } catch (error: any) {
      console.error('Error in signUp:', error);
      return { error: new Error(error.message || 'Failed to create account') };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      return { error };
    } catch (error: any) {
      console.error('Error in signIn:', error);
      return { error: new Error(error.message || 'Failed to sign in') };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
      // Clear language selection flag to show language selector again
      localStorage.removeItem('pf_lang_selected');
    } catch (error: any) {
      console.error('Error in signOut:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  };

  const updateLanguage = async (language: Language) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ language })
        .eq('user_id', user.id);

      if (error) throw error;

      setUser(prev => prev ? { ...prev, language } : null);
    } catch (error: any) {
      console.error('Error updating language:', error);
      throw new Error(error.message || 'Failed to update language');
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateLanguage
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};