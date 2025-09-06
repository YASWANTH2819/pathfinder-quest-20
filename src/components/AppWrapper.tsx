import React, { useState, useEffect, ReactNode } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import LanguageSelector from '@/components/LanguageSelector';
import AuthModal from '@/components/Auth/AuthModal';

interface AppWrapperProps {
  children: ReactNode;
}

const AppWrapper: React.FC<AppWrapperProps> = ({ children }) => {
  const { isLoading: languageLoading } = useLanguage();
  const { loading: authLoading } = useAuth();
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [languageSelected, setLanguageSelected] = useState(false);

  useEffect(() => {
    // Check if user has already selected a language
    const hasSelectedLanguage = localStorage.getItem('pf_lang_selected') === 'true';
    setLanguageSelected(hasSelectedLanguage);
    
    if (!languageLoading && !hasSelectedLanguage) {
      setShowLanguageSelector(true);
    }
  }, [languageLoading]);

  const handleLanguageComplete = () => {
    setShowLanguageSelector(false);
    setLanguageSelected(true);
    localStorage.setItem('pf_lang_selected', 'true');
  };

  // Show loading screen while contexts are initializing
  if (languageLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center cyber-grid">
        <div className="glass-card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing PathFinder...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Language Selection Modal - shown before everything else */}
      {showLanguageSelector && (
        <LanguageSelector
          isOpen={true}
          onComplete={handleLanguageComplete}
          showAsModal={true}
        />
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {/* Main app content - only show after language is selected */}
      {languageSelected && children}
    </>
  );
};

export default AppWrapper;