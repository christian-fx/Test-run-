import { createContext, useContext } from 'react';

export const AuthContext = createContext({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  const role = context.user?.profile?.role;
  return {
    ...context,
    role,
    isAdmin: role === 'Admin' || role === 'Owner',
    isManager: role === 'Admin' || role === 'Owner' || role === 'Manager',
  };
};
