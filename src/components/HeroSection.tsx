import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Sparkles, Target, Users, Zap, Home } from 'lucide-react';
import heroImage from '@/assets/hero-career-guide.jpg';

interface HeroSectionProps {
  onStartChat: () => void;
}

export const HeroSection = ({ onStartChat }: HeroSectionProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen cyber-grid">
      {/* Navigation */}
      <nav className="p-6 glass-card m-4 rounded-2xl shimmer">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[hsl(var(--cyber-purple))] to-[hsl(var(--cyber-blue))] rounded-lg flex items-center justify-center animate-glow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text-rainbow">{t('nav.careerGuide')}</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="glass" size="icon" onClick={() => navigate('/')}>
              <Home className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight text-textmain">
                <span className="gradient-text-rainbow animate-shimmer">{t('hero.title')}</span>
              </h1>
              <p className="text-xl text-foreground leading-relaxed">
                {t('hero.subtitle')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="shine" 
                size="lg" 
                onClick={onStartChat}
                className="text-lg px-8 py-4 h-auto animate-float"
              >
                {t('hero.startChat')}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[hsl(var(--cyber-purple)/0.4)] to-[hsl(var(--cyber-blue)/0.4)] rounded-3xl blur-2xl animate-pulse-glow"></div>
            <img 
              src={heroImage} 
              alt="AI Career Guidance" 
              className="relative rounded-3xl shadow-2xl animate-float glow-effect"
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-textmain">
              <span className="gradient-text-rainbow">{t('nav.careerGuide')}</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="glass-card p-8 hover:scale-105 transition-all duration-300 cyber-border glow-effect">
              <div className="w-12 h-12 bg-gradient-to-r from-[hsl(var(--cyber-purple))] to-[hsl(var(--cyber-blue))] rounded-lg flex items-center justify-center mb-6 animate-glow">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 gradient-text">{t('hero.features.guidance')}</h3>
              <p className="text-foreground">
                {t('hero.subtitle')}
              </p>
            </Card>

            <Card className="glass-card p-8 hover:scale-105 transition-all duration-300 cyber-border glow-effect">
              <div className="w-12 h-12 bg-gradient-to-r from-[hsl(var(--cyber-green))] to-[hsl(var(--cyber-teal))] rounded-lg flex items-center justify-center mb-6 animate-pulse-glow">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 gradient-text">{t('hero.features.analysis')}</h3>
              <p className="text-foreground">
                {t('hero.features.analysis')}
              </p>
            </Card>

            <Card className="glass-card p-8 hover:scale-105 transition-all duration-300 cyber-border glow-effect">
              <div className="w-12 h-12 bg-gradient-to-r from-[hsl(var(--cyber-pink))] to-[hsl(var(--cyber-purple))] rounded-lg flex items-center justify-center mb-6 animate-rainbow">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 gradient-text">{t('hero.features.roadmap')}</h3>
              <p className="text-foreground">
                {t('hero.features.roadmap')}
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};