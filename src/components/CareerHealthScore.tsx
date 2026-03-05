import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, Download, TrendingUp, FileText, Target, AlertTriangle, CheckCircle, Star, ArrowLeft,
  BookOpen, Zap, Trophy, Briefcase
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import jsPDF from 'jspdf';
import { toast } from '@/hooks/use-toast';

interface CareerHealthData {
  careerData: any;
  resumeData: any;
  progressData: any;
  quizStats: { totalAttempts: number; correctAnswers: number; totalXP: number };
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

  useEffect(() => { fetchHealthData(); }, [user]);

  const fetchHealthData = async () => {
    if (!user) return;
    try {
      const { data: careerProfile } = await supabase.from('career_profiles').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single();
      const { data: resumeAnalysis } = await supabase.from('resumes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single();
      const { data: careerProgress } = await supabase.from('career_progress').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(1).single();
      const { data: quizResponses } = await supabase.from('user_mcq_responses').select('is_correct, xp_earned').eq('user_id', user.id);

      const quizStats = {
        totalAttempts: quizResponses?.length || 0,
        correctAnswers: quizResponses?.filter(r => r.is_correct).length || 0,
        totalXP: quizResponses?.reduce((sum, r) => sum + (r.xp_earned || 0), 0) || 0
      };

      const healthScore = calculateHealthScore(careerProfile, resumeAnalysis, careerProgress, quizStats);
      const suggestions = generateSuggestions(careerProfile, resumeAnalysis, careerProgress, quizStats, healthScore);
      const status = getHealthStatus(healthScore);

      setHealthData({ careerData: careerProfile, resumeData: resumeAnalysis, progressData: careerProgress, quizStats, healthScore, suggestions, status });

      if (careerProfile) {
        await supabase.from('career_profiles').update({ career_health_score: healthScore }).eq('id', careerProfile.id);
      }
    } catch (error) {
      console.error('Error fetching health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateHealthScore = (careerData: any, resumeData: any, progressData: any, quizStats: { totalAttempts: number; correctAnswers: number; totalXP: number }): number => {
    let score = 0;
    let careerMatchScore = 0;
    if (careerData) {
      const completeness = [careerData.skills, careerData.interests, careerData.short_term_goals, careerData.long_term_goals, careerData.field_of_study, careerData.education_level].filter(Boolean).length;
      careerMatchScore += (completeness / 6) * 15;
      careerMatchScore += Math.min(15, (careerData.career_health_score || 0) * 0.15);
    }
    score += careerMatchScore;

    let growthPathScore = 0;
    if (quizStats.totalAttempts > 0) { growthPathScore += (quizStats.correctAnswers / quizStats.totalAttempts) * 15; }
    if (progressData) {
      growthPathScore += Math.min(10, (progressData.streak_count || 0) / 3);
      growthPathScore += Math.min(10, (progressData.xp || 0) / 100);
    }
    score += growthPathScore;

    let resumeScore = 0;
    if (resumeData) {
      resumeScore += ((resumeData.ats_score || 0) / 100) * 20;
      resumeScore += ((resumeData.overall_rating || 0) / 10) * 15;
    }
    score += resumeScore;
    return Math.min(100, Math.round(score));
  };

  const getHealthStatus = (score: number): 'Excellent' | 'Good' | 'Fair' | 'Needs Improvement' => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Improvement';
  };

  const generateSuggestions = (careerData: any, resumeData: any, progressData: any, quizStats: { totalAttempts: number; correctAnswers: number; totalXP: number }, score: number): string[] => {
    const suggestions: string[] = [];
    if (!careerData) { suggestions.push("Complete your career analysis to get personalized career recommendations"); }
    else {
      if (!careerData.skills || careerData.skills.length < 20) suggestions.push("Add more detailed skills to your profile for better career matching");
      if (!careerData.short_term_goals || !careerData.long_term_goals) suggestions.push("Define clear short-term and long-term career goals");
    }
    if (quizStats.totalAttempts === 0) { suggestions.push("Take daily quizzes in Career Growth Path to boost your learning score"); }
    else {
      const accuracy = (quizStats.correctAnswers / quizStats.totalAttempts) * 100;
      if (accuracy < 60) suggestions.push(`Improve your quiz accuracy (currently ${Math.round(accuracy)}%) by reviewing study materials`);
    }
    if (!progressData || (progressData.streak_count || 0) < 3) suggestions.push("Build a learning streak by completing quizzes daily");
    if (!resumeData) { suggestions.push("Upload and analyze your resume to improve your career health score"); }
    else {
      if ((resumeData.ats_score || 0) < 70) suggestions.push(`Optimize your resume for better ATS compatibility (currently ${resumeData.ats_score || 0}%)`);
      if ((resumeData.overall_rating || 0) < 7) suggestions.push(`Improve your resume quality - current rating is ${resumeData.overall_rating || 0}/10`);
    }
    if (score < 50) suggestions.push("Consider taking additional courses or certifications to strengthen your profile");
    else if (score < 70) suggestions.push("Add a portfolio project to demonstrate practical skills");
    else if (score < 85) suggestions.push("Apply for internships to gain industry experience");
    return suggestions.slice(0, 5);
  };

  // Derive skill progress from roadmap data
  const skillProgressData = useMemo(() => {
    if (!healthData?.progressData?.roadmap_data) return [];
    const rd = healthData.progressData.roadmap_data;
    const steps = rd.steps || [];
    const milestones = rd.milestones || [];
    
    // Try to extract skills from milestones/steps
    const allSteps = milestones.length > 0
      ? milestones.flatMap((m: any) => (m.tasks || []).map((t: any) => typeof t === 'string' ? { title: t, completed: false } : t))
      : steps;

    // Map to top career skills
    const careerSkills = healthData.progressData.selected_career_name
      ? getDefaultSkillsForCareer(healthData.progressData.selected_career_name)
      : ['Technical Skills', 'Problem Solving', 'Communication', 'Projects', 'Tools'];

    const totalTasks = Math.max(allSteps.length, 1);
    const completedTasks = allSteps.filter((s: any) => s.completed).length;
    const baseProgress = (completedTasks / totalTasks) * 100;

    return careerSkills.map((skill, i) => ({
      skill,
      progress: Math.min(100, Math.round(baseProgress * (1 - i * 0.12) + Math.random() * 5))
    }));
  }, [healthData]);

  const getDefaultSkillsForCareer = (career: string): string[] => {
    const c = career.toLowerCase();
    if (c.includes('python') || c.includes('data')) return ['Python', 'SQL', 'Data Analysis', 'Statistics', 'Visualization'];
    if (c.includes('frontend') || c.includes('web')) return ['JavaScript', 'React', 'CSS', 'TypeScript', 'Responsive Design'];
    if (c.includes('backend')) return ['Node.js', 'APIs', 'Database', 'Docker', 'Security'];
    if (c.includes('full stack')) return ['Frontend', 'Backend', 'Database', 'DevOps', 'Testing'];
    if (c.includes('ml') || c.includes('machine')) return ['Python', 'TensorFlow', 'Math', 'ML Algorithms', 'Data'];
    return ['Core Skills', 'Problem Solving', 'Communication', 'Projects', 'Tools'];
  };

  // Activity metrics
  const activityMetrics = useMemo(() => {
    if (!healthData) return { quizzesCompleted: 0, projectsBuilt: 0, modulesCompleted: 0, streakDays: 0 };
    const rd = healthData.progressData?.roadmap_data;
    const steps = rd?.steps || [];
    const milestones = rd?.milestones || [];
    let modulesCompleted = 0;
    if (milestones.length > 0) {
      modulesCompleted = milestones.filter((m: any) => (m.tasks || []).length > 0 && (m.tasks || []).every((t: any) => t.completed)).length;
    } else {
      let inModule = false;
      steps.forEach((s: any) => { if (s.completed && !inModule) { modulesCompleted++; inModule = true; } if (!s.completed) inModule = false; });
    }
    // Projects = completed steps that mention "project" or "build"
    const projectSteps = steps.filter((s: any) => s.completed && /project|build|create|develop/i.test(`${s.title} ${s.description}`)).length;

    return {
      quizzesCompleted: healthData.quizStats.totalAttempts,
      projectsBuilt: Math.max(projectSteps, Math.floor(steps.filter((s: any) => s.completed).length / 3)),
      modulesCompleted,
      streakDays: healthData.progressData?.streak_count || 0
    };
  }, [healthData]);

  const downloadReport = () => {
    if (!healthData) return;
    const pdf = new jsPDF();
    pdf.setFontSize(20); pdf.text('Career Health Report', 20, 30);
    pdf.setFontSize(12); pdf.text(`Generated for: ${user?.email}`, 20, 45); pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 55);
    pdf.setFontSize(16); pdf.text('Career Health Score', 20, 75);
    pdf.setFontSize(14); pdf.text(`Score: ${healthData.healthScore}/100 (${healthData.status})`, 20, 90);
    if (healthData.careerData) {
      pdf.setFontSize(16); pdf.text('Career Profile Summary', 20, 110);
      pdf.setFontSize(10);
      pdf.text(`Field: ${healthData.careerData.field_of_study || 'Not specified'}`, 20, 125);
      pdf.text(`Goals: ${healthData.careerData.short_term_goals || 'Not specified'}`, 20, 135);
    }
    if (healthData.resumeData) {
      pdf.setFontSize(16); pdf.text('Resume Analysis', 20, 155);
      pdf.setFontSize(10);
      pdf.text(`ATS Score: ${healthData.resumeData.ats_score || 0}%`, 20, 170);
      pdf.text(`Overall Rating: ${healthData.resumeData.overall_rating || 0}/10`, 20, 180);
    }
    pdf.setFontSize(16); pdf.text('Improvement Suggestions', 20, 200);
    pdf.setFontSize(10);
    healthData.suggestions.forEach((s, i) => { if (215 + i * 10 < 280) pdf.text(`${i + 1}. ${s}`, 20, 215 + i * 10); });
    pdf.save(`career-health-report-${new Date().toISOString().split('T')[0]}.pdf`);
    toast({ title: "Report Downloaded", description: "Your career health report has been downloaded successfully." });
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
          <p className="text-muted-foreground mb-6">Complete your career analysis and upload your resume to get your health score.</p>
          <Button onClick={() => onBack ? onBack() : navigate('/main')} className="w-full">Go Back to Dashboard</Button>
        </Card>
      </div>
    );
  }

  const getScoreColor = (score: number) => { if (score >= 85) return 'text-green-600'; if (score >= 70) return 'text-blue-600'; if (score >= 50) return 'text-yellow-600'; return 'text-red-600'; };
  const getScoreIcon = (status: string) => { switch (status) { case 'Excellent': return <Star className="w-5 h-5 text-green-600" />; case 'Good': return <CheckCircle className="w-5 h-5 text-blue-600" />; case 'Fair': return <Target className="w-5 h-5 text-yellow-600" />; default: return <AlertTriangle className="w-5 h-5 text-red-600" />; } };
  const barColors = ['hsl(var(--primary))', '#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444'];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="icon" onClick={() => onBack ? onBack() : navigate('/main')}><ArrowLeft className="w-5 h-5" /></Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center"><Heart className="w-6 h-6 mr-2 text-primary" />Career Health Score</h1>
                <p className="text-sm text-muted-foreground">Your comprehensive career assessment</p>
              </div>
            </div>
            <Button onClick={downloadReport} variant="outline"><Download className="w-4 h-4 mr-2" />Download Report</Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Health Score Overview */}
        <Card className="bg-white p-8 text-center shadow-sm">
          <div className="space-y-4">
            <div className="w-24 h-24 mx-auto bg-gradient-to-r from-primary via-secondary to-accent rounded-full flex items-center justify-center">
              <Heart className="w-12 h-12 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-2">{healthData.healthScore}<span className="text-2xl text-muted-foreground">/100</span></h2>
              <div className="flex items-center justify-center space-x-2 mb-4">
                {getScoreIcon(healthData.status)}
                <Badge variant="secondary" className={`${getScoreColor(healthData.healthScore)} bg-transparent border`}>{healthData.status}</Badge>
              </div>
              <Progress value={healthData.healthScore} className="h-4 max-w-md mx-auto" />
            </div>
          </div>
        </Card>

        {/* Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center"><TrendingUp className="w-5 h-5 mr-2 text-primary" />Career Analysis</h3>
              <Badge variant={healthData.careerData ? "default" : "destructive"}>{healthData.careerData ? "Complete" : "Pending"}</Badge>
            </div>
            {healthData.careerData ? (
              <div className="space-y-3 text-sm">
                <div><span className="font-medium text-foreground">Field:</span><span className="ml-2 text-muted-foreground">{healthData.careerData.field_of_study}</span></div>
                <div><span className="font-medium text-foreground">Goals:</span><span className="ml-2 text-muted-foreground">{healthData.careerData.short_term_goals}</span></div>
                <div><span className="font-medium text-foreground">Last Updated:</span><span className="ml-2 text-muted-foreground">{new Date(healthData.careerData.updated_at).toLocaleDateString()}</span></div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">Complete your career analysis to improve your score</p>
                <Button variant="outline" size="sm" onClick={() => navigate('/career-guide')}>Start Career Analysis</Button>
              </div>
            )}
          </Card>

          <Card className="bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center"><FileText className="w-5 h-5 mr-2 text-secondary" />Resume Analysis</h3>
              <Badge variant={healthData.resumeData ? "default" : "destructive"}>{healthData.resumeData ? "Analyzed" : "Pending"}</Badge>
            </div>
            {healthData.resumeData ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="font-medium text-foreground">ATS Score:</span><span className="text-muted-foreground">{healthData.resumeData.ats_score}%</span></div>
                <div className="flex justify-between"><span className="font-medium text-foreground">Overall Rating:</span><span className="text-muted-foreground">{healthData.resumeData.overall_rating}/10</span></div>
                <div><span className="font-medium text-foreground">Last Analyzed:</span><span className="ml-2 text-muted-foreground">{new Date(healthData.resumeData.created_at).toLocaleDateString()}</span></div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">Upload your resume to get detailed analysis</p>
                <Button variant="outline" size="sm" onClick={() => navigate('/resume-analyzer')}>Analyze Resume</Button>
              </div>
            )}
          </Card>
        </div>

        {/* Activity Tracking */}
        <Card className="bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center"><Zap className="w-5 h-5 mr-2 text-amber-500" />Activity Tracking</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Quizzes Completed', value: activityMetrics.quizzesCompleted, icon: <BookOpen className="w-5 h-5 text-blue-500" /> },
              { label: 'Projects Built', value: activityMetrics.projectsBuilt, icon: <Briefcase className="w-5 h-5 text-green-500" /> },
              { label: 'Modules Completed', value: activityMetrics.modulesCompleted, icon: <Trophy className="w-5 h-5 text-purple-500" /> },
              { label: 'Streak Days', value: activityMetrics.streakDays, icon: <Zap className="w-5 h-5 text-amber-500" /> },
            ].map((m, i) => (
              <Card key={i} className="p-4 text-center border">
                <div className="flex justify-center mb-2">{m.icon}</div>
                <div className="text-2xl font-bold text-foreground">{m.value}</div>
                <p className="text-xs text-muted-foreground">{m.label}</p>
              </Card>
            ))}
          </div>
        </Card>

        {/* Skill Progress Overview */}
        {skillProgressData.length > 0 && (
          <Card className="bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center"><TrendingUp className="w-5 h-5 mr-2 text-primary" />Skill Progress Overview</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillProgressData} layout="vertical" margin={{ left: 20 }}>
                  <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="skill" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value: number) => [`${value}%`, 'Progress']} />
                  <Bar dataKey="progress" radius={[0, 4, 4, 0]}>
                    {skillProgressData.map((_, i) => <Cell key={i} fill={barColors[i % barColors.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}

        {/* AI Recommendations */}
        <Card className="bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center"><Target className="w-5 h-5 mr-2 text-accent" />AI Recommendations</h3>
          <div className="space-y-3">
            {healthData.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold mt-0.5">{index + 1}</div>
                <p className="text-sm text-foreground flex-1">{suggestion}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
