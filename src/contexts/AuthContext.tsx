import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signUp: (email: string, password: string, username: string) => Promise<{ error: any; data?: { user: User | null } }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const ensureUserProfile = async (authUser: User) => {
    const { data: existingProfile } = await supabase
      .from('Users(US)')
      .select('id')
      .eq('id', authUser.id)
      .maybeSingle();

    if (!existingProfile) {
      const { error } = await supabase.from('Users(US)').insert({
        id: authUser.id,
        email: authUser.email || '',
        username: authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'user',
      });
      if (error) {
        console.error('Failed to create user profile:', error);
      }
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Ensure profile exists on any auth event with a user
        if (session?.user) {
          setTimeout(() => {
            ensureUserProfile(session.user);
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (session?.user) {
        ensureUserProfile(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username,
          },
        },
      });

      if (error) return { error };

      // Create user profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('Users(US)')
          .insert({
            id: data.user.id,
            email: email,
            username: username,
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }
      }

      return { error: null, data: { user: data.user } };
    } catch (error: any) {
      return { error, data: undefined };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error };

      // Ensure user profile exists (for users who signed up before profile creation was added)
      if (data.user) {
        const { data: existingProfile } = await supabase
          .from('Users(US)')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle();

        if (!existingProfile) {
          await supabase.from('Users(US)').insert({
            id: data.user.id,
            email: data.user.email || email,
            username: data.user.user_metadata?.username || email.split('@')[0],
          });
        }
      }

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
      });
    } catch (error) {
      toast({
        title: "Error signing out",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, signUp, signIn, signOut, loading }}>
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
