import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Target, 
  Brain, 
  TrendingUp, 
  BookOpen, 
  Briefcase, 
  ArrowRight,
  Sparkles,
  Clock,
  Video,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { ConfettiEffect } from './ConfettiEffect';
import { ChatInterface } from './ChatInterface';

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

interface CareerOption {
  id: string;
  career_name: string;
  description: string;
  match_percentage: number;
  required_skills: string[];
  youtube_links: string[];
  estimated_timeline: string;
  roadmap_steps: string[];
}

export const CareerAnalyzer: React.FC<CareerAnalyzerProps> = ({ profileData, onBack }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [careerOptions, setCareerOptions] = useState<CareerOption[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleStartAnalysis = async () => {
    if (!user) return;

    setIsAnalyzing(true);
    try {
      // Store profile data
      const { error: profileError } = await supabase
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
          career_health_score: Math.floor(Math.random() * 30) + 70,
        });

      if (profileError) throw profileError;

      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate 5-6 career options based on profile
      const mockCareerOptions: CareerOption[] = [
        {
          id: crypto.randomUUID(),
          career_name: 'Product Manager',
          description: 'Lead product strategy and development, bridging business and technology.',
          match_percentage: 92,
          required_skills: ['Product Strategy', 'User Research', 'Agile', 'Data Analysis', 'Communication'],
          youtube_links: ['https://www.youtube.com/watch?v=yUOC-Y0f5ZQ', 'https://www.youtube.com/watch?v=ZWCvxSr3Z3g'],
          estimated_timeline: '6-12 months',
          roadmap_steps: ['Learn Product Basics', 'Build Portfolio Projects', 'Get PM Certifications', 'Network with PMs', 'Apply for Junior PM Roles']
        },
        {
          id: crypto.randomUUID(),
          career_name: 'Data Analyst',
          description: 'Transform data into insights that drive business decisions.',
          match_percentage: 88,
          required_skills: ['SQL', 'Python', 'Excel', 'Tableau', 'Statistics', 'Business Intelligence'],
          youtube_links: ['https://www.youtube.com/watch?v=1UXOdCBNdgE', 'https://www.youtube.com/watch?v=7mz73uXD9DA'],
          estimated_timeline: '4-8 months',
          roadmap_steps: ['Master SQL & Python', 'Learn Data Visualization', 'Complete Analytics Projects', 'Get Certified', 'Build Portfolio']
        },
        {
          id: crypto.randomUUID(),
          career_name: 'Software Engineer',
          description: 'Build innovative software solutions and applications.',
          match_percentage: 85,
          required_skills: ['Programming', 'Data Structures', 'Algorithms', 'Git', 'Problem Solving'],
          youtube_links: ['https://www.youtube.com/watch?v=WlzRs16TzuQ', 'https://www.youtube.com/watch?v=8mAITcNt710'],
          estimated_timeline: '8-14 months',
          roadmap_steps: ['Learn Programming Fundamentals', 'Master DSA', 'Build Projects', 'Contribute to Open Source', 'Prepare for Interviews']
        },
        {
          id: crypto.randomUUID(),
          career_name: 'UI/UX Designer',
          description: 'Create beautiful and intuitive user experiences.',
          match_percentage: 82,
          required_skills: ['Figma', 'User Research', 'Wireframing', 'Prototyping', 'Visual Design'],
          youtube_links: ['https://www.youtube.com/watch?v=c9Wg6Cb_YlU', 'https://www.youtube.com/watch?v=68w2VwalD5w'],
          estimated_timeline: '5-10 months',
          roadmap_steps: ['Learn Design Principles', 'Master Figma', 'Build Design Portfolio', 'Practice User Research', 'Network with Designers']
        },
        {
          id: crypto.randomUUID(),
          career_name: 'Business Analyst',
          description: 'Bridge business needs with technical solutions.',
          match_percentage: 79,
          required_skills: ['Business Analysis', 'Requirements Gathering', 'Process Modeling', 'Communication', 'Problem Solving'],
          youtube_links: ['https://www.youtube.com/watch?v=bEdjCbNEkFw', 'https://www.youtube.com/watch?v=ySsqJeF1mwA'],
          estimated_timeline: '4-8 months',
          roadmap_steps: ['Learn BA Fundamentals', 'Get BA Certifications', 'Practice Requirements Gathering', 'Build Case Studies', 'Network in Industry']
        }
      ];

      // Save career options to database
      const optionsToInsert = mockCareerOptions.map(opt => ({
        user_id: user.id,
        career_name: opt.career_name,
        description: opt.description,
        match_percentage: opt.match_percentage,
        required_skills: opt.required_skills,
        rationale: `Based on your ${profileData.skills} and interest in ${profileData.interests}, this career is a great match.`
      }));

      const { error: optionsError } = await supabase
        .from('career_options')
        .delete()
        .eq('user_id', user.id);

      const { error: insertError } = await supabase
        .from('career_options')
        .insert(optionsToInsert);

      if (insertError) throw insertError;

      setCareerOptions(mockCareerOptions);
      setAnalysisComplete(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      
      toast.success(t('careerGuide.analysisComplete').replace('{count}', String(mockCareerOptions.length)));
    } catch (error) {
      console.error('Error in analysis:', error);
      toast.error(t('careerGuide.analysisFailed'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStartJourney = (career: CareerOption) => {
    toast.success(t('careerGuide.startingJourney').replace('{career}', career.career_name));
    navigate(`/career-growth?career=${encodeURIComponent(career.career_name)}`);
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
                {t('careerGuide.readyToDiscover')}
              </h2>
              <p className="text-muted-foreground">
                {profileData.name}, {t('careerGuide.letsAnalyze')}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t('careerGuide.whatYouGet')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                  <Target className="w-5 h-5 text-primary" />
                  <span className="text-sm">{t('careerGuide.personalizedMatches')}</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                  <BookOpen className="w-5 h-5 text-secondary" />
                  <span className="text-sm">{t('careerGuide.learningResources')}</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  <span className="text-sm">{t('careerGuide.stepByStepRoadmaps')}</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                  <Briefcase className="w-5 h-5 text-primary" />
                  <span className="text-sm">{t('careerGuide.timelineToJobReady')}</span>
                </div>
              </div>
            </div>

            <Button 
              variant="rainbow" 
              size="lg" 
              onClick={handleStartAnalysis}
              className="relative overflow-hidden w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(168,85,247,0.7)] border-2 border-white/30 hover:border-white/50 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 group"
            >
              <span className="relative z-10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 mr-2" />
                {t('careerGuide.generateCareerOptions')}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
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
                {t('careerGuide.analyzingProfile')}
              </h2>
              <p className="text-muted-foreground">
                {t('careerGuide.findingMatches')}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t('careerGuide.analyzingSkills')}</span>
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
    <>
      <ConfettiEffect trigger={showConfetti} type="celebration" />
      
      <div className="min-h-screen cyber-grid p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* AI Career Guide Chatbot */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-[hsl(var(--cyber-green))] via-[hsl(var(--cyber-blue))] to-[hsl(var(--cyber-purple))] p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{t('careerGuide.aiCareerGuide')}</h2>
                    <p className="text-white/80 text-sm">{t('careerGuide.analysisCompleteChat')}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="bg-[hsl(var(--cyber-green))]/30 text-white border-white/30">
                  {t('careerGuide.careerScore')}: {Math.floor(Math.random() * 30) + 70}
                </Badge>
              </div>
            </div>
            <div className="h-[500px]">
              <ChatInterface profileData={profileData} />
            </div>
          </motion.div>

          {/* Career Matches Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center space-y-4"
          >
            <h1 className="text-4xl md:text-5xl font-bold gradient-text-rainbow">
              {t('careerGuide.perfectMatches')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('careerGuide.basedOnProfile').replace('{count}', String(careerOptions.length)).replace('{name}', profileData.name)}
            </p>
          </motion.div>

          {/* Career Options Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {careerOptions.map((career, index) => (
              <motion.div
                key={career.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="glass-card p-6 h-full flex flex-col hover:shadow-2xl transition-all">
                  <div className="space-y-4 flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold gradient-text-rainbow mb-2">
                          {career.career_name}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {career.description}
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400 ml-4">
                        {career.match_percentage}% Match
                      </Badge>
                    </div>

                    {/* Timeline */}
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">{t('careerGuide.timeline')}: {career.estimated_timeline}</span>
                    </div>

                    {/* Required Skills */}
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">{t('careerGuide.keySkillsNeeded')}:</p>
                      <div className="flex flex-wrap gap-2">
                        {career.required_skills.slice(0, 5).map((skill, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {career.required_skills.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{career.required_skills.length - 5} {t('careerGuide.more')}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* YouTube Resources */}
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">
                        <Video className="w-3 h-3 inline mr-1" />
                        {t('careerGuide.learningResourcesLabel')}:
                      </p>
                      <div className="space-y-1">
                        {career.youtube_links.map((link, i) => (
                          <a
                            key={i}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center space-x-1"
                          >
                            <Video className="w-3 h-3" />
                            <span>Video Tutorial {i + 1}</span>
                          </a>
                        ))}
                      </div>
                    </div>

                    {/* Roadmap Preview */}
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {t('careerGuide.roadmapPreview')}:
                      </p>
                      <ul className="space-y-1">
                        {career.roadmap_steps.slice(0, 3).map((step, i) => (
                          <li key={i} className="text-xs text-muted-foreground flex items-start">
                            <span className="text-primary mr-2">{i + 1}.</span>
                            {step}
                          </li>
                        ))}
                        {career.roadmap_steps.length > 3 && (
                          <li className="text-xs text-muted-foreground italic">
                            +{career.roadmap_steps.length - 3} {t('careerGuide.more')}...
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    variant="rainbow"
                    className="relative overflow-hidden w-full mt-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(168,85,247,0.7)] border-2 border-white/30 hover:border-white/50 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 group"
                    onClick={() => handleStartJourney(career)}
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      <Sparkles className="mr-2 w-5 h-5" />
                      {t('careerGuide.startThisJourney')}
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Continue Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/career-growth')}
              className="group"
            >
              👉 {t('roadmap.title')}
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </div>
    </>
  );
};