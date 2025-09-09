import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { CareerHealthGauge } from '@/components/CareerHealthGauge';
import { EnhancedAnalytics } from '@/components/EnhancedAnalytics';
import { EnhancedDashboard } from '@/components/EnhancedDashboard';
import { PDFExporter } from '@/components/PDFExporter';
import UserMenu from '@/components/UserMenu';
import { LanguageToggle } from '@/components/LanguageToggle';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart3, FileText, Download, Home, Target, TrendingUp, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [careerData, setCareerData] = useState<any>(null);
  const [resumeData, setResumeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        // Fetch career profile
        const { data: careerProfile } = await supabase
          .from('career_profiles')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Fetch latest resume analysis
        const { data: resumeAnalysis } = await supabase
          .from('resumes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        setCareerData(careerProfile);
        setResumeData(resumeAnalysis);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen cyber-grid flex items-center justify-center">
        <Card className="glass-card p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-6">Please log in to view your dashboard.</p>
          <Button onClick={() => navigate('/')}>Go to Home</Button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen cyber-grid flex items-center justify-center">
        <Card className="glass-card p-8 max-w-md w-full text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen cyber-grid">
      {/* Header */}
      <div className="p-4 glass-card m-4 rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="glass" size="icon" onClick={() => navigate('/')}>
              <Home className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold gradient-text-rainbow">{t('navigation.dashboard')}</h1>
              <p className="text-sm text-muted-foreground">Track your career progress and insights</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageToggle />
            <UserMenu />
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="p-4 space-y-6">
        {/* Career Health & Resume Score */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Career Health Score */}
          <Card className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                Career Health Score
              </h3>
              <Badge variant="secondary" className="bg-primary/20 text-primary">
                {careerData?.career_health_score || 0}/100
              </Badge>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Health</span>
                  <span>{careerData?.career_health_score || 0}%</span>
                </div>
                <Progress value={careerData?.career_health_score || 0} className="h-3" />
              </div>
              
              {careerData ? (
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    <strong>Field:</strong> {careerData.field_of_study}
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Goal:</strong> {careerData.short_term_goals}
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Last Updated:</strong> {new Date(careerData.updated_at).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">No career analysis found</p>
                  <Button variant="rainbow" size="sm" onClick={() => navigate('/career-guide')}>
                    Start Career Analysis
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Resume Score Breakdown */}
          <Card className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <FileText className="w-5 h-5 mr-2 text-secondary" />
                Resume Score Breakdown
              </h3>
              <Badge variant="secondary" className="bg-secondary/20 text-secondary">
                {resumeData?.overall_rating || 0}/10
              </Badge>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>ATS Compatibility</span>
                  <span>{resumeData?.ats_score || 0}%</span>
                </div>
                <Progress value={resumeData?.ats_score || 0} className="h-3" />
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Rating</span>
                  <span>{resumeData?.overall_rating || 0}/10</span>
                </div>
                <Progress value={(resumeData?.overall_rating || 0) * 10} className="h-3" />
              </div>
              
              {resumeData ? (
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    <strong>File:</strong> {resumeData.filename}
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Health Status:</strong> {resumeData.career_health}
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Analyzed:</strong> {new Date(resumeData.created_at).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground mb-4">No resume analysis found</p>
                  <Button variant="rainbow" size="sm" onClick={() => navigate('/resume-analyzer')}>
                    Analyze Resume
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="glass" className="h-20 flex-col" onClick={() => navigate('/career-guide')}>
              <Target className="w-6 h-6 mb-2" />
              Career Guide
            </Button>
            <Button variant="glass" className="h-20 flex-col" onClick={() => navigate('/resume-analyzer')}>
              <FileText className="w-6 h-6 mb-2" />
              Resume Analyzer
            </Button>
            <Button variant="glass" className="h-20 flex-col">
              <Download className="w-6 h-6 mb-2" />
              Export Report
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}