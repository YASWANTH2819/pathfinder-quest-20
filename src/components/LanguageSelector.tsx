import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/types';
import { Globe, Check } from 'lucide-react';

interface LanguageSelectorProps {
  isOpen: boolean;
  onComplete: () => void;
  showAsModal?: boolean;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  isOpen,
  onComplete,
  showAsModal = true
}) => {
  const { language, setLanguage } = useLanguage();
  const [selectedLang, setSelectedLang] = useState<Language>(language);

  const languages = [
    {
      code: 'en' as Language,
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸'
    },
    {
      code: 'hi' as Language,
      name: 'Hindi',
      nativeName: 'हिंदी',
      flag: '🇮🇳'
    },
    {
      code: 'te' as Language,
      name: 'Telugu',
      nativeName: 'తెలుగు',
      flag: '🇮🇳'
    }
  ];

  const handleLanguageSelect = async (lang: Language) => {
    setSelectedLang(lang);
    await setLanguage(lang);
    localStorage.setItem('pf_lang_selected', 'true');
    onComplete();
  };

  const content = (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <Globe className="w-12 h-12 mx-auto text-primary animate-pulse-glow" />
        <h2 className="text-2xl font-bold gradient-text">
          Choose your language / भाषा चुनें / మీ భాష ఎంచుకోండి
        </h2>
        <p className="text-muted-foreground text-sm">
          Choose your language — all AI replies will be in this language
        </p>
      </div>

      <div className="grid gap-4">
        {languages.map((lang) => (
          <Card
            key={lang.code}
            className={`glass-card p-4 cursor-pointer transition-all hover:scale-105 ${
              selectedLang === lang.code
                ? 'ring-2 ring-primary border-primary/50'
                : 'hover:border-primary/30'
            }`}
            onClick={() => handleLanguageSelect(lang.code)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-2xl">{lang.flag}</span>
                <div>
                  <h3 className="font-semibold text-lg">{lang.name}</h3>
                  <p className="text-muted-foreground">{lang.nativeName}</p>
                </div>
              </div>
              {selectedLang === lang.code && (
                <Check className="w-6 h-6 text-primary animate-scale-in" />
              )}
            </div>
          </Card>
        ))}
      </div>

      <div className="text-center text-xs text-muted-foreground">
        This setting can be changed later from your profile
      </div>
    </div>
  );

  if (!showAsModal) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 cyber-grid">
        <Card className="glass-card p-8 max-w-md w-full">
          {content}
        </Card>
      </div>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="glass-card border-0 max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">Language Selection</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};

export default LanguageSelector;