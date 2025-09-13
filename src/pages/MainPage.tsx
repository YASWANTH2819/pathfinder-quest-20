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
      <React.Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading Resume Analyzer...</p>
        </div>
      </div>}>
        <ResumeAnalyzer />
      </React.Suspense>
    );
  }

  if (currentView === 'career-health') {
    // Import CareerHealthScore component dynamically
    const CareerHealthScore = React.lazy(() => import('../components/CareerHealthScore'));
    return (
      <React.Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>}>
        <CareerHealthScore onBack={() => setCurrentView('main')} />
      </React.Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-background" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">PathFinder</h1>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Three Main Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Career Guide */}
          <div className="text-center group cursor-pointer" onClick={() => setCurrentView('career-guide')}>
            <div className="bg-white rounded-xl p-8 shadow-sm border border-border hover:shadow-md transition-all duration-200 group-hover:scale-105">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-900 rounded-full flex items-center justify-center">
                <Target className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Career Guide</h2>
              <p className="text-muted-foreground">
                Get personalized career recommendations and roadmaps
              </p>
            </div>
          </div>

          {/* Resume Analyzer */}
          <div className="text-center group cursor-pointer" onClick={() => setCurrentView('resume-analyzer')}>
            <div className="bg-white rounded-xl p-8 shadow-sm border border-border hover:shadow-md transition-all duration-200 group-hover:scale-105">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-900 rounded-full flex items-center justify-center">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Resume Analyzer</h2>
              <p className="text-muted-foreground">
                Upload and analyze your resume for ATS compatibility
              </p>
            </div>
          </div>

          {/* Career Health Score */}
          <div className="text-center group cursor-pointer" onClick={() => setCurrentView('career-health')}>
            <div className="bg-white rounded-xl p-8 shadow-sm border border-border hover:shadow-md transition-all duration-200 group-hover:scale-105">
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-900 rounded-full flex items-center justify-center">
                <TrendingUp className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Career Health Score</h2>
              <p className="text-muted-foreground">
                View your comprehensive career health analysis
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}