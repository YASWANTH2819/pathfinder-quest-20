import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Sparkles, Target, Users, Zap, Home, Play } from 'lucide-react';
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
            <span className="text-xl font-bold gradient-text-rainbow">{t('careerGuide.title')}</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="glass" size="icon" onClick={() => navigate('/')}>
              <Home className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                <span className="text-foreground">{t('careerGuide.discoverPath')}</span>
                <br />
                <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 bg-clip-text text-transparent">
                  {t('careerGuide.perfectCareer')}
                </span>
                <br />
                <span className="text-foreground">{t('careerGuide.path')}</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                {t('careerGuide.heroDescription')} ✨
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                onClick={onStartChat}
                className="relative overflow-hidden bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 hover:from-yellow-500 hover:via-orange-600 hover:to-red-600 text-white font-bold text-lg px-8 py-6 h-auto shadow-[0_8px_30px_rgba(251,146,60,0.4)] hover:shadow-[0_12px_40px_rgba(251,146,60,0.6)] border-0 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <span className="relative z-10 flex items-center justify-center">
                  {t('careerGuide.startJourney')}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </span>
              </Button>
              <Button 
                size="lg" 
                variant="secondary"
                className="relative overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg px-8 py-6 h-auto shadow-[0_8px_30px_rgba(168,85,247,0.4)] hover:shadow-[0_12px_40px_rgba(168,85,247,0.6)] border-0 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <span className="relative z-10 flex items-center justify-center">
                  <Play className="w-5 h-5 mr-2" />
                  {t('careerGuide.watchDemo')}
                </span>
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
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="text-foreground">{t('careerGuide.whyChoose')} </span>
              <span className="bg-gradient-to-r from-purple-500 to-blue-600 bg-clip-text text-transparent">{t('careerGuide.title')} </span>
              <span className="text-foreground">{t('careerGuide.careerGuideQ')}</span>
            </h2>
            <p className="text-lg text-muted-foreground">{t('careerGuide.revolutionaryFeatures')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="glass-card p-8 hover:scale-105 transition-all duration-300 cyber-border glow-effect">
              <div className="w-12 h-12 bg-gradient-to-r from-[hsl(var(--cyber-purple))] to-[hsl(var(--cyber-blue))] rounded-lg flex items-center justify-center mb-6 animate-glow">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 gradient-text">{t('careerGuide.personalizedGuidance')}</h3>
              <p className="text-foreground">
                {t('careerGuide.personalizedGuidanceDesc')}
              </p>
            </Card>

            <Card className="glass-card p-8 hover:scale-105 transition-all duration-300 cyber-border glow-effect">
              <div className="w-12 h-12 bg-gradient-to-r from-[hsl(var(--cyber-green))] to-[hsl(var(--cyber-teal))] rounded-lg flex items-center justify-center mb-6 animate-pulse-glow">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 gradient-text">{t('careerGuide.aiPoweredInsights')}</h3>
              <p className="text-foreground">
                {t('careerGuide.aiPoweredInsightsDesc')}
              </p>
            </Card>

            <Card className="glass-card p-8 hover:scale-105 transition-all duration-300 cyber-border glow-effect">
              <div className="w-12 h-12 bg-gradient-to-r from-[hsl(var(--cyber-pink))] to-[hsl(var(--cyber-purple))] rounded-lg flex items-center justify-center mb-6 animate-rainbow">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-4 gradient-text">{t('careerGuide.communitySupport')}</h3>
              <p className="text-foreground">
                {t('careerGuide.communitySupportDesc')}
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};