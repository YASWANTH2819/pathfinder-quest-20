import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  LogOut,
  Sparkles,
  Target,
  FileText,
  TrendingUp
} from 'lucide-react';

export default function MainPage() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Career Guide */}
          <Card 
            className="p-8 text-center group cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 bg-card border border-border"
            onClick={() => navigate('/career-guide')}
          >
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary rounded-full flex items-center justify-center mb-4">
                <Target className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Career Guide</h2>
              <p className="text-sm text-muted-foreground">
                Get personalized career recommendations and roadmaps
              </p>
            </div>
          </Card>

          {/* Resume Analyzer */}
          <Card 
            className="p-8 text-center group cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 bg-card border border-border"
            onClick={() => navigate('/resume-analyzer')}
          >
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Resume Analyzer</h2>
              <p className="text-sm text-muted-foreground">
                Upload and analyze your resume for ATS compatibility
              </p>
            </div>
          </Card>

          {/* Career Health Score */}
          <Card 
            className="p-8 text-center group cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 bg-card border border-border"
            onClick={() => navigate('/career-health')}
          >
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-primary rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-xl font-bold text-foreground">Career Health Score</h2>
              <p className="text-sm text-muted-foreground">
                View your comprehensive career health analysis
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}