import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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

      // Fetch career progress (quiz scores, streak, XP)
      const { data: careerProgress } = await supabase
        .from('career_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      // Fetch user's quiz performance
      const { data: quizResponses } = await supabase
        .from('user_mcq_responses')
        .select('is_correct, xp_earned')
        .eq('user_id', user.id);

      // Calculate quiz stats
      const quizStats = {
        totalAttempts: quizResponses?.length || 0,
        correctAnswers: quizResponses?.filter(r => r.is_correct).length || 0,
        totalXP: quizResponses?.reduce((sum, r) => sum + (r.xp_earned || 0), 0) || 0
      };

      // Calculate health score using the 3-component formula
      const healthScore = calculateHealthScore(careerProfile, resumeAnalysis, careerProgress, quizStats);
      const suggestions = generateSuggestions(careerProfile, resumeAnalysis, careerProgress, quizStats, healthScore);
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

  // Calculate health score using 3 components: Career Match (30%), Career Growth Path (35%), Resume (35%)
  const calculateHealthScore = (
    careerData: any, 
    resumeData: any, 
    progressData: any,
    quizStats: { totalAttempts: number; correctAnswers: number; totalXP: number }
  ): number => {
    let score = 0;

    // Component 1: Career Guidance Alignment (30% weight)
    // Based on profile completeness and career match quality
    let careerMatchScore = 0;
    if (careerData) {
      // Profile completeness (up to 15 points)
      const completeness = [
        careerData.skills,
        careerData.interests,
        careerData.short_term_goals,
        careerData.long_term_goals,
        careerData.field_of_study,
        careerData.education_level
      ].filter(Boolean).length;
      careerMatchScore += (completeness / 6) * 15;
      
      // Career health score from guidance (up to 15 points)
      const existingScore = careerData.career_health_score || 0;
      careerMatchScore += Math.min(15, existingScore * 0.15);
    }
    score += careerMatchScore; // Max 30 points

    // Component 2: Career Growth Path Engagement (35% weight)
    // Quiz performance + Streak + XP
    let growthPathScore = 0;
    if (quizStats.totalAttempts > 0) {
      // Quiz accuracy (up to 15 points)
      const accuracy = quizStats.correctAnswers / quizStats.totalAttempts;
      growthPathScore += accuracy * 15;
    }
    if (progressData) {
      // Streak contribution (up to 10 points) - max at 30 day streak
      const streakContribution = Math.min(10, (progressData.streak_count || 0) / 3);
      growthPathScore += streakContribution;
      
      // XP contribution (up to 10 points) - max at 1000 XP
      const xpContribution = Math.min(10, (progressData.xp || 0) / 100);
      growthPathScore += xpContribution;
    }
    score += growthPathScore; // Max 35 points

    // Component 3: Resume Readiness (35% weight)
    // ATS score + overall rating
    let resumeScore = 0;
    if (resumeData) {
      // ATS score contribution (up to 20 points)
      const atsScore = resumeData.ats_score || 0;
      resumeScore += (atsScore / 100) * 20;
      
      // Overall rating contribution (up to 15 points)
      const overallRating = resumeData.overall_rating || 0;
      resumeScore += (overallRating / 10) * 15;
    }
    score += resumeScore; // Max 35 points

    return Math.min(100, Math.round(score));
  };

  const getHealthStatus = (score: number): 'Excellent' | 'Good' | 'Fair' | 'Needs Improvement' => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Improvement';
  };

  const generateSuggestions = (
    careerData: any, 
    resumeData: any, 
    progressData: any,
    quizStats: { totalAttempts: number; correctAnswers: number; totalXP: number },
    score: number
  ): string[] => {
    const suggestions: string[] = [];

    // Career Guidance suggestions
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

    // Career Growth Path suggestions
    if (quizStats.totalAttempts === 0) {
      suggestions.push("Take daily quizzes in Career Growth Path to boost your learning score");
    } else if (quizStats.totalAttempts > 0) {
      const accuracy = (quizStats.correctAnswers / quizStats.totalAttempts) * 100;
      if (accuracy < 60) {
        suggestions.push(`Improve your quiz accuracy (currently ${Math.round(accuracy)}%) by reviewing study materials`);
      }
    }
    
    if (!progressData || (progressData.streak_count || 0) < 3) {
      suggestions.push("Build a learning streak by completing quizzes daily for higher engagement scores");
    }

    // Resume suggestions
    if (!resumeData) {
      suggestions.push("Upload and analyze your resume to improve your career health score");
    } else {
      if ((resumeData.ats_score || 0) < 70) {
        suggestions.push(`Optimize your resume for better ATS compatibility (currently ${resumeData.ats_score || 0}%)`);
      }
      if ((resumeData.overall_rating || 0) < 7) {
        suggestions.push(`Improve your resume quality - current rating is ${resumeData.overall_rating || 0}/10`);
      }
    }

    // General suggestions based on overall score
    if (score < 50) {
      suggestions.push("Consider taking additional courses or certifications to strengthen your profile");
    } else if (score < 70) {
      suggestions.push("Focus on skill development in your chosen field");
    } else if (score < 85) {
      suggestions.push("Consider leadership opportunities to advance your career");
    }

    return suggestions.slice(0, 5); // Limit to 5 suggestions
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
          <Button onClick={() => onBack ? onBack() : navigate('/main')} className="w-full">
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
              <Button variant="outline" size="icon" onClick={() => onBack ? onBack() : navigate('/main')}>
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
                <Button variant="outline" size="sm" onClick={() => navigate('/career-guide')}>
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
                <Button variant="outline" size="sm" onClick={() => navigate('/resume-analyzer')}>
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