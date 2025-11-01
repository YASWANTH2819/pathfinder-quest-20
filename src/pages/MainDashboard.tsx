import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Heart, Rocket, Brain, Home, LogOut, Sparkles } from 'lucide-react';
import UserMenu from '@/components/UserMenu';
import { LanguageToggle } from '@/components/LanguageToggle';

export default function MainDashboard() {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const dashboardCards = [
    {
      id: 1,
      title: t('main.careerGuide') || 'Career Guidance',
      description: t('main.careerGuideDesc') || 'Get adaptive career recommendations based on your performance.',
      icon: Brain,
      gradient: 'from-emerald-500 to-teal-500',
      path: '/career-guide',
      bgGlow: 'bg-emerald-500/20'
    },
    {
      id: 2,
      title: t('main.resumeAnalyzer') || 'Resume Analyzer',
      description: t('main.resumeAnalyzerDesc') || 'Analyze and improve your resume with AI-powered ATS feedback.',
      icon: FileText,
      gradient: 'from-blue-500 to-cyan-500',
      path: '/resume-analyzer',
      bgGlow: 'bg-blue-500/20'
    },
    {
      id: 3,
      title: t('main.careerGrowthPath') || 'Career Growth Path',
      description: t('main.careerGrowthDesc') || 'Track your daily learning, complete modules, and earn streak badges.',
      icon: Rocket,
      gradient: 'from-purple-500 to-indigo-500',
      path: '/career-growth',
      bgGlow: 'bg-purple-500/20'
    },
    {
      id: 4,
      title: t('main.careerHealth') || 'Career Health Score',
      description: t('main.careerHealthDesc') || 'Visualize your career performance and growth analytics.',
      icon: Heart,
      gradient: 'from-pink-500 to-rose-500',
      path: '/career-health',
      bgGlow: 'bg-pink-500/20'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* Animated background effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/')}
                className="text-white hover:bg-white/10"
              >
                <Home className="w-5 h-5" />
              </Button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/50">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">PathFinder</h1>
                  <p className="text-sm text-blue-200">Your AI Career Companion</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <LanguageToggle />
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent animate-pulse">
            {t('main.welcome') || 'Welcome back'}, {user?.name || 'User'}!
          </h2>
          <p className="text-xl text-blue-200 max-w-2xl mx-auto">
            {t('main.subtitle') || 'Choose your path to career excellence'}
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {dashboardCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.id}
                onClick={() => navigate(card.path)}
                className="group relative overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/30 transition-all duration-500 cursor-pointer transform hover:scale-105 hover:shadow-2xl"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                {/* Glow effect on hover */}
                <div className={`absolute inset-0 ${card.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl`}></div>
                
                {/* Card content */}
                <div className="relative p-8 space-y-6">
                  {/* Icon with gradient */}
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${card.gradient} shadow-lg group-hover:shadow-2xl transition-all duration-300 group-hover:scale-110`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-blue-300 group-hover:to-cyan-300 transition-all">
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p className="text-blue-200 text-sm leading-relaxed">
                    {card.description}
                  </p>

                  {/* Button */}
                  <Button 
                    variant="ghost" 
                    className="w-full bg-gradient-to-r from-white/20 to-white/10 hover:from-white/30 hover:to-white/20 text-white font-semibold border border-white/30 group-hover:border-white/50 transition-all duration-300 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-white/10 hover:scale-105 active:scale-95"
                  >
                    <span className="relative z-10">{t('main.explore') || 'Explore'} →</span>
                  </Button>
                </div>

                {/* Decorative corner */}
                <div className="absolute top-0 right-0 w-24 h-24 opacity-20">
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} transform rotate-45 translate-x-12 -translate-y-12`}></div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">95%</div>
            <div className="text-sm text-blue-200">{t('main.successRate') || 'Success Rate'}</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-cyan-400 mb-2">10K+</div>
            <div className="text-sm text-blue-200">{t('main.studentsGuided') || 'Students Guided'}</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">500+</div>
            <div className="text-sm text-blue-200">{t('main.careerPaths') || 'Career Paths'}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
