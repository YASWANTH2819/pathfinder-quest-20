import React, { useState, useEffect } from 'react';
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
  Brain, 
  ArrowRight,
  Sparkles,
  Clock,
  Video,
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
  goals: string;
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
  rationale: string;
}

export const CareerAnalyzer: React.FC<CareerAnalyzerProps> = ({ profileData, onBack }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [careerOptions, setCareerOptions] = useState<CareerOption[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  // Auto-start analysis when component mounts
  useEffect(() => {
    if (user && !analysisComplete && !isAnalyzing) {
      handleStartAnalysis();
    }
  }, [user]);

  const handleStartAnalysis = async () => {
    if (!user) return;

    setIsAnalyzing(true);
    try {
      // Store profile data
      const { error: profileError } = await supabase
        .from('career_profiles')
        .upsert({
          user_id: user.id,
          name: profileData.name || 'Student',
          age: profileData.age || '20',
          country: profileData.country || 'India',
          education_level: profileData.educationLevel,
          field_of_study: profileData.fieldOfStudy,
          specialization: profileData.specialization,
          current_year: profileData.currentYear,
          certifications: profileData.certifications,
          skills: profileData.skills,
          interests: profileData.interests,
          work_environment: profileData.workEnvironment,
          short_term_goals: profileData.goals,
          long_term_goals: profileData.goals,
          career_transition: profileData.careerTransition,
          study_or_job: profileData.studyOrJob,
          location_preference: profileData.locationPreference,
          company_type: profileData.companyType,
          financial_support: profileData.financialSupport,
        });

      if (profileError) throw profileError;

      // Generate skill-based career recommendations using AI
      const careerOptions = await generateSkillBasedCareers(profileData);

      // Save career options to database
      const optionsToInsert = careerOptions.map(opt => ({
        user_id: user.id,
        career_name: opt.career_name,
        description: opt.description,
        match_percentage: opt.match_percentage,
        required_skills: opt.required_skills,
        rationale: opt.rationale
      }));

      await supabase
        .from('career_options')
        .delete()
        .eq('user_id', user.id);

      const { error: insertError } = await supabase
        .from('career_options')
        .insert(optionsToInsert);

      if (insertError) throw insertError;

      // Update career health score based on match quality
      const avgMatchScore = careerOptions.reduce((sum, c) => sum + c.match_percentage, 0) / careerOptions.length;
      await supabase
        .from('career_profiles')
        .update({ career_health_score: Math.round(avgMatchScore * 0.3) }) // 30% weight for career matching
        .eq('user_id', user.id);

      setCareerOptions(careerOptions);
      setAnalysisComplete(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      
      toast.success(t('careerGuide.analysisComplete').replace('{count}', String(careerOptions.length)));
    } catch (error) {
      console.error('Error in analysis:', error);
      toast.error(t('careerGuide.analysisFailed'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate skill-based career recommendations using AI
  const generateSkillBasedCareers = async (profile: ProfileData): Promise<CareerOption[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-career-recommendations', {
        body: {
          education: profile.fieldOfStudy || profile.educationLevel || '',
          interests: profile.interests || '',
          goals: profile.goals || '',
          skills: profile.skills || '',
          language: 'en'
        }
      });

      if (error) throw error;

      if (data?.careers && Array.isArray(data.careers)) {
        return data.careers.map((career: any, index: number) => ({
          id: crypto.randomUUID(),
          career_name: career.name || career.career_name || `Career Option ${index + 1}`,
          description: career.description || '',
          match_percentage: career.match_percentage || career.matchScore || 70,
          required_skills: career.required_skills || career.skills || [],
          youtube_links: career.youtube_links || [],
          estimated_timeline: career.timeline || '6-12 months',
          roadmap_steps: career.roadmap_steps || [],
          rationale: career.rationale || career.reason || ''
        }));
      }
      
      // Fallback to skill-based matching if AI fails
      return getSkillBasedFallback(profile);
    } catch (error) {
      console.error('AI career generation failed, using skill-based fallback:', error);
      return getSkillBasedFallback(profile);
    }
  };

  // Skill-based career matching fallback
  const getSkillBasedFallback = (profile: ProfileData): CareerOption[] => {
    const userSkills = (profile.skills || '').toLowerCase();
    const userInterests = (profile.interests || '').toLowerCase();
    const combined = `${userSkills} ${userInterests}`;

    // Comprehensive career database with skill matching
    const careerDatabase: Array<{
      name: string;
      description: string;
      keywords: string[];
      skills: string[];
      timeline: string;
      youtube: string[];
    }> = [
      {
        name: 'Python Developer',
        description: 'Build applications, scripts, and backend systems using Python.',
        keywords: ['python', 'django', 'flask', 'scripting', 'automation'],
        skills: ['Python', 'Django/Flask', 'REST APIs', 'SQL', 'Git'],
        timeline: '4-8 months',
        youtube: ['https://www.youtube.com/watch?v=_uQrJ0TkZlc']
      },
      {
        name: 'Backend Developer',
        description: 'Design and implement server-side logic and databases.',
        keywords: ['backend', 'java', 'python', 'node', 'api', 'server', 'database'],
        skills: ['Java/Python/Node.js', 'SQL', 'REST APIs', 'Microservices', 'Docker'],
        timeline: '6-10 months',
        youtube: ['https://www.youtube.com/watch?v=WlzRs16TzuQ']
      },
      {
        name: 'Data Analyst',
        description: 'Transform data into insights that drive business decisions.',
        keywords: ['data', 'analysis', 'excel', 'sql', 'python', 'statistics', 'analytics'],
        skills: ['SQL', 'Python', 'Excel', 'Tableau', 'Statistics'],
        timeline: '4-8 months',
        youtube: ['https://www.youtube.com/watch?v=1UXOdCBNdgE']
      },
      {
        name: 'Machine Learning Engineer',
        description: 'Build and deploy ML models for intelligent systems.',
        keywords: ['ml', 'machine learning', 'ai', 'deep learning', 'tensorflow', 'pytorch', 'neural'],
        skills: ['Python', 'TensorFlow/PyTorch', 'Math/Statistics', 'ML Algorithms', 'Data Processing'],
        timeline: '8-14 months',
        youtube: ['https://www.youtube.com/watch?v=7eh4d6sabA0']
      },
      {
        name: 'Software Engineer',
        description: 'Build innovative software solutions and applications.',
        keywords: ['programming', 'coding', 'dsa', 'algorithms', 'software', 'development', 'java', 'c++'],
        skills: ['Programming', 'Data Structures', 'Algorithms', 'Git', 'Problem Solving'],
        timeline: '8-14 months',
        youtube: ['https://www.youtube.com/watch?v=WlzRs16TzuQ']
      },
      {
        name: 'Frontend Developer',
        description: 'Create beautiful and interactive user interfaces for web applications.',
        keywords: ['frontend', 'react', 'javascript', 'html', 'css', 'web', 'ui'],
        skills: ['React/Vue/Angular', 'JavaScript', 'HTML/CSS', 'TypeScript', 'Responsive Design'],
        timeline: '5-9 months',
        youtube: ['https://www.youtube.com/watch?v=bMknfKXIFA8']
      },
      {
        name: 'Full Stack Developer',
        description: 'Work on both frontend and backend of web applications.',
        keywords: ['fullstack', 'full stack', 'mern', 'mean', 'web development'],
        skills: ['React/Vue', 'Node.js/Python', 'SQL', 'REST APIs', 'DevOps Basics'],
        timeline: '10-16 months',
        youtube: ['https://www.youtube.com/watch?v=nu_pCVPKzTk']
      },
      {
        name: 'Product Manager',
        description: 'Lead product strategy and development, bridging business and technology.',
        keywords: ['product', 'management', 'communication', 'strategy', 'business', 'leadership'],
        skills: ['Product Strategy', 'User Research', 'Agile', 'Data Analysis', 'Communication'],
        timeline: '6-12 months',
        youtube: ['https://www.youtube.com/watch?v=yUOC-Y0f5ZQ']
      },
      {
        name: 'Business Analyst',
        description: 'Bridge business needs with technical solutions.',
        keywords: ['business', 'analysis', 'requirements', 'communication', 'management'],
        skills: ['Business Analysis', 'Requirements Gathering', 'Process Modeling', 'SQL', 'Communication'],
        timeline: '4-8 months',
        youtube: ['https://www.youtube.com/watch?v=bEdjCbNEkFw']
      },
      {
        name: 'UI/UX Designer',
        description: 'Create beautiful and intuitive user experiences.',
        keywords: ['design', 'ui', 'ux', 'figma', 'user experience', 'creative', 'visual'],
        skills: ['Figma', 'User Research', 'Wireframing', 'Prototyping', 'Visual Design'],
        timeline: '5-10 months',
        youtube: ['https://www.youtube.com/watch?v=c9Wg6Cb_YlU']
      },
      {
        name: 'DevOps Engineer',
        description: 'Automate and streamline development and deployment processes.',
        keywords: ['devops', 'docker', 'kubernetes', 'ci/cd', 'aws', 'cloud', 'linux'],
        skills: ['Docker', 'Kubernetes', 'CI/CD', 'Cloud (AWS/GCP)', 'Linux'],
        timeline: '6-12 months',
        youtube: ['https://www.youtube.com/watch?v=7pz6BkVPgCI']
      },
      {
        name: 'Cloud Solutions Architect',
        description: 'Design and implement cloud infrastructure solutions.',
        keywords: ['cloud', 'aws', 'azure', 'gcp', 'infrastructure', 'architecture'],
        skills: ['AWS/Azure/GCP', 'Networking', 'Security', 'Terraform', 'Cost Optimization'],
        timeline: '8-14 months',
        youtube: ['https://www.youtube.com/watch?v=SOTamWNgDKc']
      },
      {
        name: 'Cybersecurity Analyst',
        description: 'Protect organizations from cyber threats and vulnerabilities.',
        keywords: ['security', 'cyber', 'hacking', 'penetration', 'network', 'encryption'],
        skills: ['Network Security', 'Penetration Testing', 'SIEM Tools', 'Cryptography', 'Incident Response'],
        timeline: '8-14 months',
        youtube: ['https://www.youtube.com/watch?v=inWWhr5tnEA']
      },
      {
        name: 'Digital Marketing Specialist',
        description: 'Drive online growth through marketing strategies.',
        keywords: ['marketing', 'digital', 'seo', 'social media', 'content', 'advertising'],
        skills: ['SEO/SEM', 'Social Media Marketing', 'Content Strategy', 'Analytics', 'Ad Platforms'],
        timeline: '3-6 months',
        youtube: ['https://www.youtube.com/watch?v=bixR-KIJKYM']
      },
      {
        name: 'HR Manager',
        description: 'Manage human resources and organizational development.',
        keywords: ['hr', 'human resources', 'recruitment', 'people', 'management', 'hiring'],
        skills: ['Recruitment', 'Employee Relations', 'HR Software', 'Labor Laws', 'Training'],
        timeline: '4-8 months',
        youtube: ['https://www.youtube.com/watch?v=aZETj6T8UoU']
      },
      {
        name: 'Content Writer',
        description: 'Create compelling content for various platforms.',
        keywords: ['writing', 'content', 'blog', 'copywriting', 'creative writing'],
        skills: ['Writing', 'SEO', 'Research', 'Content Strategy', 'Editing'],
        timeline: '2-4 months',
        youtube: ['https://www.youtube.com/watch?v=3DSMWUH7WBk']
      }
    ];

    // Score each career based on keyword matches
    const scoredCareers = careerDatabase.map(career => {
      let score = 0;
      let matchedKeywords: string[] = [];

      career.keywords.forEach(keyword => {
        if (combined.includes(keyword)) {
          score += 15;
          matchedKeywords.push(keyword);
        }
      });

      // Boost for exact skill matches
      career.skills.forEach(skill => {
        if (combined.includes(skill.toLowerCase())) {
          score += 10;
        }
      });

      return {
        ...career,
        score,
        matchedKeywords
      };
    });

    // Sort by score and take top 5-6
    const topCareers = scoredCareers
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((career, index) => {
        // Normalize match percentage (min 60%, max 95%)
        const baseMatch = Math.min(95, Math.max(60, 60 + career.score));
        
        return {
          id: crypto.randomUUID(),
          career_name: career.name,
          description: career.description,
          match_percentage: baseMatch - (index * 3), // Decrease slightly for lower matches
          required_skills: career.skills,
          youtube_links: career.youtube,
          estimated_timeline: career.timeline,
          roadmap_steps: [
            `Learn ${career.skills[0]} fundamentals`,
            `Build practice projects`,
            `Get certified in ${career.skills[1] || career.skills[0]}`,
            `Create portfolio showcasing your work`,
            `Apply for entry-level positions`
          ],
          rationale: career.matchedKeywords.length > 0 
            ? `Matched based on your skills: ${career.matchedKeywords.join(', ')}`
            : `Based on your education in ${profile.fieldOfStudy || 'your field'} and career interests.`
        };
      });

    return topCareers;
  };

  const handleStartJourney = (career: CareerOption) => {
    toast.success(t('careerGuide.startingJourney').replace('{career}', career.career_name));
    navigate(`/career-growth?career=${encodeURIComponent(career.career_name)}`);
  };

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
              {t('careerGuide.basedOnProfile').replace('{count}', String(careerOptions.length)).replace('{name}', profileData.name || 'Student')}
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
                        {career.match_percentage}% {t('careerGuide.match')}
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
                            className="text-xs text-primary hover:underline block truncate"
                          >
                            📺 Tutorial {i + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button 
                    variant="rainbow" 
                    size="lg" 
                    onClick={() => handleStartJourney(career)}
                    className="w-full mt-4 relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(168,85,247,0.7)] border-2 border-white/30 hover:border-white/50 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 group"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 mr-2" />
                      {t('careerGuide.startThisJourney')}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
