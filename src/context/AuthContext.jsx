import React, { useState, useEffect } from 'react';
import { getCurrentUser, onAuthChange } from '../api/auth';
import { AuthContext } from './useAuth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial user fetch
    const initAuth = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = onAuthChange(async (event, sessionUser) => {
      if (sessionUser) {
        const fullUser = await getCurrentUser();
        setUser(fullUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
