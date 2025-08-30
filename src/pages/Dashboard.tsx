import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Trophy, TrendingUp, Users, Target } from 'lucide-react';
import { CareerHealthGauge } from '@/components/CareerHealthGauge';
import { EnhancedAnalytics } from '@/components/EnhancedAnalytics';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useTranslation } from '@/hooks/useTranslation';
import { DashboardData, Badge as BadgeType } from '@/types';

// Mock data for demo
const mockDashboardData: DashboardData = {
  careerHealthScore: {
    id: '1',
    userId: 'user1',
    atsScore: 65,
    skillsMatchScore: 50,
    roadmapProgress: 40,
    overallScore: 52,
    createdAt: new Date().toISOString()
  },
  recentAnalyses: [],
  skillGapAnalysis: {
    targetRole: 'Software Engineer',
    currentSkills: ['JavaScript', 'React', 'HTML', 'CSS'],
    requiredSkills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git'],
    missingSkills: ['Node.js', 'Python', 'SQL', 'Git'],
    matchPercentage: 67,
    recommendations: []
  },
  roadmapProgress: {
    totalSteps: 10,
    completedSteps: 4,
    percentage: 40
  },
  badges: [
    {
      id: '1',
      userId: 'user1',
      badgeCode: 'beginner',
      title: 'Career Explorer',
      description: 'Started your career journey',
      awardedAt: new Date().toISOString()
    }
  ],
  chartData: {
    healthScoreHistory: [
      { date: '2024-01', score: 30 },
      { date: '2024-02', score: 35 },
      { date: '2024-03', score: 42 },
      { date: '2024-04', score: 52 }
    ],
    atsScoreHistory: [
      { date: '2024-01', score: 45 },
      { date: '2024-02', score: 55 },
      { date: '2024-03', score: 60 },
      { date: '2024-04', score: 65 }
    ],
    skillsProgress: [
      { skill: 'JavaScript', proficiency: 80, required: 90 },
      { skill: 'React', proficiency: 75, required: 85 },
      { skill: 'Node.js', proficiency: 30, required: 80 },
      { skill: 'Python', proficiency: 20, required: 75 },
      { skill: 'SQL', proficiency: 40, required: 70 }
    ]
  }
};

export const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [dashboardData, setDashboardData] = useState<DashboardData>(mockDashboardData);
  const [isLoading, setIsLoading] = useState(false);

  // Mock function to simulate PDF export
  const handleExportReport = async () => {
    // In a real app, this would generate and download a PDF report
    const reportData = {
      ...dashboardData,
      exportDate: new Date().toISOString(),
      userProfile: JSON.parse(localStorage.getItem('career_profile_data') || '{}')
    };
    
    console.log('Exporting career report:', reportData);
    
    // Simulate download
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'career-report.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getBadgeIcon = (badgeCode: string) => {
    switch (badgeCode) {
      case 'beginner':
        return <Target className="w-5 h-5" />;
      case 'builder':
        return <Users className="w-5 h-5" />;
      case 'jobready':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <Trophy className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen cyber-grid">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="glass"
              size="icon"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-orbitron font-bold gradient-text">
                {t('dashboard.title')}
              </h1>
              <p className="text-muted-foreground mt-1">
                {t('dashboard.subtitle')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Button 
              variant="cyber" 
              onClick={handleExportReport}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              {t('common.download')} Report
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Career Health Score */}
          <div className="lg:col-span-1 space-y-6">
            <CareerHealthGauge
              overallScore={dashboardData.careerHealthScore.overallScore}
              atsScore={dashboardData.careerHealthScore.atsScore}
              skillsMatchScore={dashboardData.careerHealthScore.skillsMatchScore}
              roadmapProgress={dashboardData.careerHealthScore.roadmapProgress}
            />

            {/* Badges */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-orbitron">
                    <Trophy className="w-5 h-5 text-[hsl(var(--cyber-orange))]" />
                    {t('dashboard.badges')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {dashboardData.badges.map((badge) => (
                    <div
                      key={badge.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(var(--glass-border)/0.1)] border border-[hsl(var(--glass-border))]"
                    >
                      <div className="text-[hsl(var(--cyber-orange))]">
                        {getBadgeIcon(badge.badgeCode)}
                      </div>
                      <div>
                        <h4 className="font-semibold">{badge.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {badge.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Analytics */}
          <div className="lg:col-span-2">
            <EnhancedAnalytics
              healthScoreHistory={dashboardData.chartData.healthScoreHistory}
              atsScoreHistory={dashboardData.chartData.atsScoreHistory}
              skillsProgress={dashboardData.chartData.skillsProgress}
            />
          </div>
        </div>

        {/* Bottom Row - Quick Stats */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
        >
          <Card className="glass-card">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-orbitron font-bold text-[hsl(var(--cyber-blue))] mb-2">
                {dashboardData.recentAnalyses.length}
              </div>
              <p className="text-muted-foreground">{t('dashboard.recentAnalyses')}</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-orbitron font-bold text-[hsl(var(--cyber-green))] mb-2">
                {dashboardData.roadmapProgress.percentage}%
              </div>
              <p className="text-muted-foreground">{t('dashboard.roadmapProgress')}</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-orbitron font-bold text-[hsl(var(--cyber-purple))] mb-2">
                {dashboardData.skillGapAnalysis.matchPercentage}%
              </div>
              <p className="text-muted-foreground">Skills Match</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};