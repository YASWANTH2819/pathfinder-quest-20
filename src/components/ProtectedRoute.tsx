import React, { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const { isLoading: languageLoading } = useLanguage();

  // Show loading while checking auth or language
  if (loading || languageLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center cyber-grid">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-sm text-muted-foreground">{loading ? 'ProtectedRoute: loading auth...' : 'ProtectedRoute: loading language...'}</p>
      </div>
    );
  }

  // If not authenticated, redirect to auth page
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If authenticated, render children
  return <>{children}</>;
};

export default ProtectedRoute;