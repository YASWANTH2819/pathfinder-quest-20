import React, { ReactNode, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';

interface AppWrapperProps {
  children: ReactNode;
}

const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const { isLoading: languageLoading } = useLanguage();
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  useEffect(() => {
    const languageSelected = localStorage.getItem('pf_lang_selected');
    if (!languageSelected) {
      setShowLanguageSelector(true);
    }
  }, []);

  const handleLanguageComplete = () => {
    setShowLanguageSelector(false);
  };

  // Show language selector if not selected yet
  if (showLanguageSelector) {
    return (
      <LanguageSelector
        isOpen={true}
        onComplete={handleLanguageComplete}
        showAsModal={false}
      />
    );
  }

  // Show loading if auth or language is still loading
  if (authLoading || languageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center cyber-grid">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Render main app
  return <>{children}</>;
};

export default AppWrapper;