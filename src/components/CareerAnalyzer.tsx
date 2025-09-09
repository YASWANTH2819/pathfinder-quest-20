import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChatInterface } from './ChatInterface';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  Brain, 
  TrendingUp, 
  BookOpen, 
  Briefcase, 
  Globe,
  Star,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface ProfileData {
  name: string;
  age: string;
  country: string;
  educationLevel: string;
  fieldOfStudy: string;
  specialization: string;
  currentYear: string;
  certifications: string;
  skills: string;
  interests: string;
  workEnvironment: string;
  shortTermGoals: string;
  longTermGoals: string;
  careerTransition: string;
  studyOrJob: string;
  locationPreference: string;
  companyType: string;
  financialSupport: string;
}

interface CareerAnalyzerProps {
  profileData: ProfileData;
  onBack: () => void;
}

export const CareerAnalyzer: React.FC<CareerAnalyzerProps> = ({ profileData, onBack }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [careerScore, setCareerScore] = useState(0);

  const handleStartAnalysis = async () => {
    if (!user) return;

    setIsAnalyzing(true);
    try {
      // Store profile data in database
      const { error } = await supabase
        .from('career_profiles')
        .upsert({
          user_id: user.id,
          name: profileData.name,
          age: profileData.age,
          country: profileData.country,
          education_level: profileData.educationLevel,
          field_of_study: profileData.fieldOfStudy,
          specialization: profileData.specialization,
          current_year: profileData.currentYear,
          certifications: profileData.certifications,
          skills: profileData.skills,
          interests: profileData.interests,
          work_environment: profileData.workEnvironment,
          short_term_goals: profileData.shortTermGoals,
          long_term_goals: profileData.longTermGoals,
          career_transition: profileData.careerTransition,
          study_or_job: profileData.studyOrJob,
          location_preference: profileData.locationPreference,
          company_type: profileData.companyType,
          financial_support: profileData.financialSupport,
          career_health_score: Math.floor(Math.random() * 30) + 70, // Generate score 70-100
        });

      if (error) throw error;

      // Simulate analysis time
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const score = Math.floor(Math.random() * 30) + 70;
      setCareerScore(score);
      setAnalysisComplete(true);
      
      toast.success("Career analysis completed!");
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error("Failed to complete analysis");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!analysisComplete && !isAnalyzing) {
    return (
      <div className="min-h-screen cyber-grid flex items-center justify-center p-4">
        <Card className="glass-card p-8 max-w-2xl w-full">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
            
            <div>
              <h2 className="text-3xl font-bold gradient-text-rainbow mb-2">
                Ready for Analysis!
              </h2>
              <p className="text-muted-foreground">
                Hello {profileData.name}! I've reviewed your profile and I'm excited to help guide your career journey.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Based on your profile, I can provide personalized advice on:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                  <Target className="w-5 h-5 text-primary" />
                  <span className="text-sm">Career Recommendations</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                  <BookOpen className="w-5 h-5 text-secondary" />
                  <span className="text-sm">Skill Development</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  <span className="text-sm">Learning Roadmaps</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                  <Briefcase className="w-5 h-5 text-primary" />
                  <span className="text-sm">Job Platforms</span>
                </div>
              </div>
            </div>

            <Button 
              variant="rainbow" 
              size="lg" 
              onClick={handleStartAnalysis}
              className="w-full"
            >
              Start Career Analysis
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="min-h-screen cyber-grid flex items-center justify-center p-4">
        <Card className="glass-card p-8 max-w-md w-full text-center">
          <div className="space-y-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center animate-pulse">
              <Brain className="w-8 h-8 text-white" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold gradient-text-rainbow mb-2">
                Analyzing Your Profile
              </h2>
              <p className="text-muted-foreground">
                AI is processing your career data...
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Analyzing skills match</span>
                <span>85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>

            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen cyber-grid flex flex-col">
      {/* Header */}
      <div className="p-4 glass-card m-4 rounded-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text-rainbow">AI Career Guide</h1>
              <p className="text-sm text-muted-foreground">Analysis Complete - Chat with {profileData.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-green-500/20 text-green-400">
              Career Score: {careerScore}
            </Badge>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-muted-foreground">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 mx-4 mb-4">
        <Card className="glass-card h-full">
          <ChatInterface profileData={profileData} />
        </Card>
      </div>
    </div>
  );
};