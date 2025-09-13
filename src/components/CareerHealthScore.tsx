import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Heart, 
  Download, 
  Home, 
  TrendingUp, 
  FileText,
  Target,
  AlertTriangle,
  CheckCircle,
  Star,
  ArrowLeft
} from 'lucide-react';
import jsPDF from 'jspdf';
import { toast } from '@/hooks/use-toast';

interface CareerHealthData {
  careerData: any;
  resumeData: any;
  healthScore: number;
  suggestions: string[];
  status: 'Excellent' | 'Good' | 'Fair' | 'Needs Improvement';
}

interface CareerHealthScoreProps {
  onBack?: () => void;
}

export default function CareerHealthScore({ onBack }: CareerHealthScoreProps) {
  const { user } = useAuth();
  const [healthData, setHealthData] = useState<CareerHealthData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHealthData();
  }, [user]);

  const fetchHealthData = async () => {
    if (!user) return;
    
    try {
      // Fetch latest career profile
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

      // Calculate health score
      const healthScore = calculateHealthScore(careerProfile, resumeAnalysis);
      const suggestions = generateSuggestions(careerProfile, resumeAnalysis, healthScore);
      const status = getHealthStatus(healthScore);

      setHealthData({
        careerData: careerProfile,
        resumeData: resumeAnalysis,
        healthScore,
        suggestions,
        status
      });

      // Update career health score in database
      if (careerProfile) {
        await supabase
          .from('career_profiles')
          .update({ career_health_score: healthScore })
          .eq('id', careerProfile.id);
      }

    } catch (error) {
      console.error('Error fetching health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateHealthScore = (careerData: any, resumeData: any): number => {
    let score = 0;
    let factors = 0;

    // Career analysis factor (40%)
    if (careerData) {
      score += 40;
      factors += 40;
      
      // Bonus for complete profile
      const completeness = [
        careerData.skills,
        careerData.interests,
        careerData.short_term_goals,
        careerData.long_term_goals,
        careerData.field_of_study
      ].filter(Boolean).length;
      
      score += (completeness / 5) * 20; // Up to 20 bonus points
    }

    // Resume analysis factor (60%)
    if (resumeData) {
      const atsScore = resumeData.ats_score || 0;
      const overallRating = (resumeData.overall_rating || 0) * 10;
      
      score += (atsScore * 0.3) + (overallRating * 0.3); // 30% each
      factors += 60;
    }

    return Math.min(100, Math.round(factors > 0 ? (score / factors) * 100 : 0));
  };

  const getHealthStatus = (score: number): 'Excellent' | 'Good' | 'Fair' | 'Needs Improvement' => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Improvement';
  };

  const generateSuggestions = (careerData: any, resumeData: any, score: number): string[] => {
    const suggestions: string[] = [];

    if (!careerData) {
      suggestions.push("Complete your career analysis to get personalized career recommendations");
    } else {
      if (!careerData.skills || careerData.skills.length < 20) {
        suggestions.push("Add more detailed skills to your profile for better career matching");
      }
      if (!careerData.short_term_goals || !careerData.long_term_goals) {
        suggestions.push("Define clear short-term and long-term career goals");
      }
    }

    if (!resumeData) {
      suggestions.push("Upload and analyze your resume to improve your career health score");
    } else {
      if ((resumeData.ats_score || 0) < 70) {
        suggestions.push("Optimize your resume for better ATS compatibility (currently " + (resumeData.ats_score || 0) + "%)");
      }
      if ((resumeData.overall_rating || 0) < 7) {
        suggestions.push("Improve your resume quality - current rating is " + (resumeData.overall_rating || 0) + "/10");
      }
    }

    if (score < 50) {
      suggestions.push("Consider taking additional courses or certifications to strengthen your profile");
      suggestions.push("Update your resume with recent achievements and quantifiable results");
    } else if (score < 70) {
      suggestions.push("Focus on skill development in your chosen field");
      suggestions.push("Network with professionals in your target industry");
    } else if (score < 85) {
      suggestions.push("Consider leadership opportunities to advance your career");
      suggestions.push("Stay updated with industry trends and emerging technologies");
    }

    return suggestions;
  };

  const downloadReport = () => {
    if (!healthData) return;

    const pdf = new jsPDF();
    const { careerData, resumeData, healthScore, suggestions, status } = healthData;
    
    // Header
    pdf.setFontSize(20);
    pdf.text('Career Health Report', 20, 30);
    
    pdf.setFontSize(12);
    pdf.text(`Generated for: ${user?.email}`, 20, 45);
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 55);
    
    // Health Score
    pdf.setFontSize(16);
    pdf.text('Career Health Score', 20, 75);
    pdf.setFontSize(14);
    pdf.text(`Score: ${healthScore}/100 (${status})`, 20, 90);
    
    // Career Analysis
    if (careerData) {
      pdf.setFontSize(16);
      pdf.text('Career Profile Summary', 20, 110);
      pdf.setFontSize(10);
      pdf.text(`Field: ${careerData.field_of_study || 'Not specified'}`, 20, 125);
      pdf.text(`Goals: ${careerData.short_term_goals || 'Not specified'}`, 20, 135);
      pdf.text(`Skills: ${careerData.skills || 'Not specified'}`, 20, 145);
    }
    
    // Resume Analysis
    if (resumeData) {
      pdf.setFontSize(16);
      pdf.text('Resume Analysis', 20, 165);
      pdf.setFontSize(10);
      pdf.text(`ATS Score: ${resumeData.ats_score || 0}%`, 20, 180);
      pdf.text(`Overall Rating: ${resumeData.overall_rating || 0}/10`, 20, 190);
    }
    
    // Suggestions
    pdf.setFontSize(16);
    pdf.text('Improvement Suggestions', 20, 210);
    pdf.setFontSize(10);
    suggestions.forEach((suggestion, index) => {
      const yPos = 225 + (index * 10);
      if (yPos < 280) { // Avoid page overflow
        pdf.text(`${index + 1}. ${suggestion}`, 20, yPos);
      }
    });
    
    pdf.save(`career-health-report-${new Date().toISOString().split('T')[0]}.pdf`);
    
    toast({
      title: "Report Downloaded",
      description: "Your career health report has been downloaded successfully.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen cyber-grid flex items-center justify-center">
        <Card className="glass-card p-8 max-w-md w-full text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Calculating your career health score...</p>
        </Card>
      </div>
    );
  }

  if (!healthData) {
    return (
      <div className="min-h-screen cyber-grid flex items-center justify-center">
        <Card className="glass-card p-8 max-w-md w-full text-center">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-4 text-foreground">No Data Available</h2>
          <p className="text-muted-foreground mb-6">
            Complete your career analysis and upload your resume to get your health score.
          </p>
          <Button onClick={onBack} className="w-full">
            Go Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (status: string) => {
    switch (status) {
      case 'Excellent': return <Star className="w-5 h-5 text-green-600" />;
      case 'Good': return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'Fair': return <Target className="w-5 h-5 text-yellow-600" />;
      default: return <AlertTriangle className="w-5 h-5 text-red-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="icon" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center">
                  <Heart className="w-6 h-6 mr-2 text-primary" />
                  Career Health Score
                </h1>
                <p className="text-sm text-muted-foreground">Your comprehensive career assessment</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={downloadReport} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Health Score Overview */}
        <Card className="bg-white p-8 text-center shadow-sm">
          <div className="space-y-4">
            <div className="w-24 h-24 mx-auto bg-gradient-to-r from-primary via-secondary to-accent rounded-full flex items-center justify-center">
              <Heart className="w-12 h-12 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-2">
                {healthData.healthScore}
                <span className="text-2xl text-muted-foreground">/100</span>
              </h2>
              <div className="flex items-center justify-center space-x-2 mb-4">
                {getScoreIcon(healthData.status)}
                <Badge variant="secondary" className={`${getScoreColor(healthData.healthScore)} bg-transparent border`}>
                  {healthData.status}
                </Badge>
              </div>
              <Progress value={healthData.healthScore} className="h-4 max-w-md mx-auto" />
            </div>
          </div>
        </Card>

        {/* Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Career Analysis */}
          <Card className="bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-primary" />
                Career Analysis
              </h3>
              <Badge variant={healthData.careerData ? "default" : "destructive"}>
                {healthData.careerData ? "Complete" : "Pending"}
              </Badge>
            </div>
            
            {healthData.careerData ? (
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-foreground">Field:</span>
                  <span className="ml-2 text-muted-foreground">{healthData.careerData.field_of_study}</span>
                </div>
                <div>
                  <span className="font-medium text-foreground">Goals:</span>
                  <span className="ml-2 text-muted-foreground">{healthData.careerData.short_term_goals}</span>
                </div>
                <div>
                  <span className="font-medium text-foreground">Last Updated:</span>
                  <span className="ml-2 text-muted-foreground">
                    {new Date(healthData.careerData.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">Complete your career analysis to improve your score</p>
                <Button variant="outline" size="sm" onClick={onBack}>
                  Start Career Analysis
                </Button>
              </div>
            )}
          </Card>

          {/* Resume Analysis */}
          <Card className="bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center">
                <FileText className="w-5 h-5 mr-2 text-secondary" />
                Resume Analysis
              </h3>
              <Badge variant={healthData.resumeData ? "default" : "destructive"}>
                {healthData.resumeData ? "Analyzed" : "Pending"}
              </Badge>
            </div>
            
            {healthData.resumeData ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-foreground">ATS Score:</span>
                  <span className="text-muted-foreground">{healthData.resumeData.ats_score}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-foreground">Overall Rating:</span>
                  <span className="text-muted-foreground">{healthData.resumeData.overall_rating}/10</span>
                </div>
                <div>
                  <span className="font-medium text-foreground">Last Analyzed:</span>
                  <span className="ml-2 text-muted-foreground">
                    {new Date(healthData.resumeData.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">Upload your resume to get detailed analysis</p>
                <Button variant="outline" size="sm" onClick={onBack}>
                  Analyze Resume
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Suggestions */}
        <Card className="bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-accent" />
            Improvement Suggestions
          </h3>
          
          <div className="space-y-3">
            {healthData.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                  {index + 1}
                </div>
                <p className="text-sm text-foreground flex-1">{suggestion}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}