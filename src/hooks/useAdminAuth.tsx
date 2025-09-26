import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminSession {
  token: string;
  expiresAt: number;
}

interface AdminAuthContextType {
  isAdmin: boolean;
  login: (key: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

const ADMIN_SESSION_KEY = 'admin_session';

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = () => {
      try {
        const sessionData = localStorage.getItem(ADMIN_SESSION_KEY);
        if (sessionData) {
          const session: AdminSession = JSON.parse(sessionData);
          if (Date.now() < session.expiresAt) {
            setIsAdmin(true);
          } else {
            localStorage.removeItem(ADMIN_SESSION_KEY);
          }
        }
      } catch (error) {
        console.error('Error checking admin session:', error);
        localStorage.removeItem(ADMIN_SESSION_KEY);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (key: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('validate-admin-key', {
        body: { key }
      });

      if (error) {
        console.error('Admin login error:', error);
        return false;
      }

      if (data.valid && data.sessionToken) {
        const session: AdminSession = {
          token: data.sessionToken,
          expiresAt: data.expiresAt
        };
        
        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
        setIsAdmin(true);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Admin login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setIsAdmin(false);
  };

  return (
    <AdminAuthContext.Provider value={{ isAdmin, login, logout, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
};