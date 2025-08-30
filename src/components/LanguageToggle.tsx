import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Languages } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export const LanguageToggle: React.FC = () => {
  const { currentLanguage, changeLanguage, availableLanguages } = useTranslation();

  const currentLang = availableLanguages.find(lang => lang.code === currentLanguage);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="glass" size="sm" className="gap-2">
          <span className="text-lg">{currentLang?.flag}</span>
          <Languages className="w-4 h-4" />
          <span className="hidden sm:inline">{currentLang?.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-card">
        {availableLanguages.map(language => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => changeLanguage(language.code as any)}
            className={`flex items-center gap-3 cursor-pointer ${
              currentLanguage === language.code 
                ? 'bg-[hsl(var(--cyber-purple)/0.2)] text-[hsl(var(--cyber-purple))]' 
                : 'hover:bg-[hsl(var(--glass-border-bright))]'
            }`}
          >
            <span className="text-lg">{language.flag}</span>
            <span className="font-medium">{language.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};