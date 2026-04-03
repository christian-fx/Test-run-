import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { Loader2, ShieldX } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="text-muted text-sm font-medium">Authenticating Admin...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // RBAC: User must have a profile in the team table to access the admin panel
  if (!user.profile) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="flex flex-col items-center gap-4" style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ 
            width: 64, height: 64, borderRadius: '50%', 
            background: 'color-mix(in srgb, var(--destructive) 10%, transparent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <ShieldX size={32} color="var(--destructive)" />
          </div>
          <h2 className="font-bold" style={{ fontSize: 20 }}>Access Denied</h2>
          <p className="text-muted text-sm">
            Your account does not have admin privileges. Contact your administrator to request access.
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
