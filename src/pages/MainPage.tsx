import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  FileText, 
  BarChart3, 
  User, 
  LogOut,
  Sparkles,
  Target,
  TrendingUp,
  Heart
} from 'lucide-react';
import { CareerGuidePage } from '@/components/CareerGuidePage';

export default function MainPage() {
  const { user, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<'main' | 'career-guide' | 'resume-analyzer' | 'career-health'>('main');

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (currentView === 'career-guide') {
    return <CareerGuidePage />;
  }

  if (currentView === 'resume-analyzer') {
    // Import ResumeAnalyzer page component dynamically
    const ResumeAnalyzer = React.lazy(() => import('./ResumeAnalyzer'));
    return (
      <React.Suspense fallback={<div>Loading...</div>}>
        <ResumeAnalyzer />
      </React.Suspense>
    );
  }

  if (currentView === 'career-health') {
    // Import CareerHealthScore component dynamically
    const CareerHealthScore = React.lazy(() => import('../components/CareerHealthScore'));
    return (
      <React.Suspense fallback={<div>Loading...</div>}>
        <CareerHealthScore />
      </React.Suspense>
    );
  }

  return (
    <div className="min-h-screen cyber-grid">
      {/* Header */}
      <div className="p-4 glass-card m-4 rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">PathFinder Quest</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {user?.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="glass" size="icon" onClick={handleSignOut}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 space-y-6">
        {/* Welcome Section */}
        <Card className="glass-card p-8 text-center">
          <div className="space-y-4">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-primary via-secondary to-accent rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Ready to Transform Your Career?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Choose from our AI-powered tools to analyze your career path, optimize your resume, 
                and get personalized guidance for your professional journey.
              </p>
            </div>
          </div>
        </Card>

        {/* Main Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Career Guide */}
          <Card className="glass-card p-6 hover:scale-105 transition-transform cursor-pointer group" 
                onClick={() => setCurrentView('career-guide')}>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">AI Career Guide</h3>
                <p className="text-muted-foreground mb-4">
                  Get personalized career recommendations based on your profile, skills, and goals. 
                  Our AI analyzes your background to suggest the best career paths.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Target className="w-4 h-4 text-primary" />
                    <span className="text-foreground">Career Recommendations</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-secondary" />
                    <span className="text-foreground">Learning Roadmaps</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span className="text-foreground">Skill Development Plans</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full group-hover:shadow-lg border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                Start Your Journey
              </Button>
            </div>
          </Card>

          {/* Resume Analyzer */}
          <Card className="glass-card p-6 hover:scale-105 transition-transform cursor-pointer group"
                onClick={() => setCurrentView('resume-analyzer')}>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">Resume Analyzer</h3>
                <p className="text-muted-foreground mb-4">
                  Upload your resume for AI-powered analysis. Get ATS compatibility scores, 
                  improvement suggestions, and professional recommendations.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    <span className="text-foreground">ATS Compatibility Score</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Target className="w-4 h-4 text-secondary" />
                    <span className="text-foreground">Rating out of 10</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span className="text-foreground">Improvement Suggestions</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full group-hover:shadow-lg border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                Analyze Resume
              </Button>
            </div>
          </Card>

          {/* Career Health Score */}
          <Card className="glass-card p-6 hover:scale-105 transition-transform cursor-pointer group"
                onClick={() => setCurrentView('career-health')}>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">Career Health Score</h3>
                <p className="text-muted-foreground mb-4">
                  Get your comprehensive career health score based on your career analysis and resume quality. 
                  Download detailed reports with personalized improvement suggestions.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    <span className="text-foreground">Overall Health Score</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Target className="w-4 h-4 text-secondary" />
                    <span className="text-foreground">Personalized Suggestions</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span className="text-foreground">Downloadable Report</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full group-hover:shadow-lg border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                View Health Score
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}