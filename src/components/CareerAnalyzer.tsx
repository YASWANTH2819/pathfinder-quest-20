import React, { useState, useEffect, useRef } from 'react';
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
  ArrowLeft,
  Sparkles,
  Clock,
  Video,
  CheckCircle2,
  Target,
  BookOpen,
  Briefcase,
  GraduationCap,
  Trophy,
  Code,
  Lightbulb
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
  projects?: string[];
  internships?: string[];
  certifications?: string[];
  competitions?: string[];
}

type FlowStep = 'recommendations' | 'skillGap' | 'roadmap' | 'suggestions';

interface RoadmapYear {
  year: string;
  focus: string;
  activities: string[];
  milestones: string[];
}

export const CareerAnalyzer: React.FC<CareerAnalyzerProps> = ({ profileData, onBack }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [careerOptions, setCareerOptions] = useState<CareerOption[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Multi-step flow state
  const [selectedCareer, setSelectedCareer] = useState<CareerOption | null>(null);
  const [currentStep, setCurrentStep] = useState<FlowStep>('recommendations');
  const [roadmapData, setRoadmapData] = useState<RoadmapYear[]>([]);
  const [isLoadingRoadmap, setIsLoadingRoadmap] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const roadmapCache = useRef<Map<string, RoadmapYear[]>>(new Map());

  useEffect(() => {
    if (user && !analysisComplete && !isAnalyzing) {
      handleStartAnalysis();
    }
  }, [user]);

  // Progressive loading messages
  useEffect(() => {
    if (!isLoadingRoadmap) {
      setLoadingMessage('');
      return;
    }
    const messages = [
      'Analyzing your skills...',
      'Identifying career gaps...',
      'Building your personalized roadmap...',
      'Preparing growth recommendations...'
    ];
    let index = 0;
    setLoadingMessage(messages[0]);
    const interval = setInterval(() => {
      index = Math.min(index + 1, messages.length - 1);
      setLoadingMessage(messages[index]);
    }, 2000);
    return () => clearInterval(interval);
  }, [isLoadingRoadmap]);

  const handleStartAnalysis = async () => {
    if (!user) return;
    setIsAnalyzing(true);
    try {
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

      const careers = await generateSkillBasedCareers(profileData);
      const optionsToInsert = careers.map(opt => ({
        user_id: user.id,
        career_name: opt.career_name,
        description: opt.description,
        match_percentage: opt.match_percentage,
        required_skills: opt.required_skills,
        rationale: opt.rationale
      }));

      await supabase.from('career_options').delete().eq('user_id', user.id);
      const { error: insertError } = await supabase.from('career_options').insert(optionsToInsert);
      if (insertError) throw insertError;

      const avgMatchScore = careers.reduce((sum, c) => sum + c.match_percentage, 0) / careers.length;
      await supabase.from('career_profiles')
        .update({ career_health_score: Math.round(avgMatchScore * 0.3) })
        .eq('user_id', user.id);

      setCareerOptions(careers);
      setAnalysisComplete(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      toast.success(t('careerGuide.analysisComplete').replace('{count}', String(careers.length)));
    } catch (error) {
      console.error('Error in analysis:', error);
      toast.error(t('careerGuide.analysisFailed'));
    } finally {
      setIsAnalyzing(false);
    }
  };

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
          rationale: career.rationale || career.reason || '',
          projects: career.projects || [],
          internships: career.internships || [],
          certifications: career.certifications || [],
          competitions: career.competitions || []
        }));
      }
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

    const careerDatabase: Array<{
      name: string;
      description: string;
      keywords: string[];
      skills: string[];
      timeline: string;
      youtube: string[];
    }> = [
      { name: 'Python Developer', description: 'Build applications, scripts, and backend systems using Python.', keywords: ['python', 'django', 'flask', 'scripting', 'automation'], skills: ['Python', 'Django/Flask', 'REST APIs', 'SQL', 'Git'], timeline: '4-8 months', youtube: ['https://www.youtube.com/watch?v=_uQrJ0TkZlc'] },
      { name: 'Backend Developer', description: 'Design and implement server-side logic and databases.', keywords: ['backend', 'java', 'python', 'node', 'api', 'server', 'database'], skills: ['Java/Python/Node.js', 'SQL', 'REST APIs', 'Microservices', 'Docker'], timeline: '6-10 months', youtube: ['https://www.youtube.com/watch?v=WlzRs16TzuQ'] },
      { name: 'Data Analyst', description: 'Transform data into insights that drive business decisions.', keywords: ['data', 'analysis', 'excel', 'sql', 'python', 'statistics', 'analytics'], skills: ['SQL', 'Python', 'Excel', 'Tableau', 'Statistics'], timeline: '4-8 months', youtube: ['https://www.youtube.com/watch?v=1UXOdCBNdgE'] },
      { name: 'Machine Learning Engineer', description: 'Build and deploy ML models for intelligent systems.', keywords: ['ml', 'machine learning', 'ai', 'deep learning', 'tensorflow', 'pytorch', 'neural'], skills: ['Python', 'TensorFlow/PyTorch', 'Math/Statistics', 'ML Algorithms', 'Data Processing'], timeline: '8-14 months', youtube: ['https://www.youtube.com/watch?v=7eh4d6sabA0'] },
      { name: 'Software Engineer', description: 'Build innovative software solutions and applications.', keywords: ['programming', 'coding', 'dsa', 'algorithms', 'software', 'development', 'java', 'c++'], skills: ['Programming', 'Data Structures', 'Algorithms', 'Git', 'Problem Solving'], timeline: '8-14 months', youtube: ['https://www.youtube.com/watch?v=WlzRs16TzuQ'] },
      { name: 'Frontend Developer', description: 'Create beautiful and interactive user interfaces for web applications.', keywords: ['frontend', 'react', 'javascript', 'html', 'css', 'web', 'ui'], skills: ['React/Vue/Angular', 'JavaScript', 'HTML/CSS', 'TypeScript', 'Responsive Design'], timeline: '5-9 months', youtube: ['https://www.youtube.com/watch?v=bMknfKXIFA8'] },
      { name: 'Full Stack Developer', description: 'Work on both frontend and backend of web applications.', keywords: ['fullstack', 'full stack', 'mern', 'mean', 'web development'], skills: ['React/Vue', 'Node.js/Python', 'SQL', 'REST APIs', 'DevOps Basics'], timeline: '10-16 months', youtube: ['https://www.youtube.com/watch?v=nu_pCVPKzTk'] },
      { name: 'Product Manager', description: 'Lead product strategy and development, bridging business and technology.', keywords: ['product', 'management', 'communication', 'strategy', 'business', 'leadership'], skills: ['Product Strategy', 'User Research', 'Agile', 'Data Analysis', 'Communication'], timeline: '6-12 months', youtube: ['https://www.youtube.com/watch?v=yUOC-Y0f5ZQ'] },
      { name: 'Business Analyst', description: 'Bridge business needs with technical solutions.', keywords: ['business', 'analysis', 'requirements', 'communication', 'management'], skills: ['Business Analysis', 'Requirements Gathering', 'Process Modeling', 'SQL', 'Communication'], timeline: '4-8 months', youtube: ['https://www.youtube.com/watch?v=bEdjCbNEkFw'] },
      { name: 'UI/UX Designer', description: 'Create beautiful and intuitive user experiences.', keywords: ['design', 'ui', 'ux', 'figma', 'user experience', 'creative', 'visual'], skills: ['Figma', 'User Research', 'Wireframing', 'Prototyping', 'Visual Design'], timeline: '5-10 months', youtube: ['https://www.youtube.com/watch?v=c9Wg6Cb_YlU'] },
      { name: 'DevOps Engineer', description: 'Automate and streamline development and deployment processes.', keywords: ['devops', 'docker', 'kubernetes', 'ci/cd', 'aws', 'cloud', 'linux'], skills: ['Docker', 'Kubernetes', 'CI/CD', 'Cloud (AWS/GCP)', 'Linux'], timeline: '6-12 months', youtube: ['https://www.youtube.com/watch?v=7pz6BkVPgCI'] },
      { name: 'Cloud Solutions Architect', description: 'Design and implement cloud infrastructure solutions.', keywords: ['cloud', 'aws', 'azure', 'gcp', 'infrastructure', 'architecture'], skills: ['AWS/Azure/GCP', 'Networking', 'Security', 'Terraform', 'Cost Optimization'], timeline: '8-14 months', youtube: ['https://www.youtube.com/watch?v=SOTamWNgDKc'] },
      { name: 'Cybersecurity Analyst', description: 'Protect organizations from cyber threats and vulnerabilities.', keywords: ['security', 'cyber', 'hacking', 'penetration', 'network', 'encryption'], skills: ['Network Security', 'Penetration Testing', 'SIEM Tools', 'Cryptography', 'Incident Response'], timeline: '8-14 months', youtube: ['https://www.youtube.com/watch?v=inWWhr5tnEA'] },
      { name: 'Digital Marketing Specialist', description: 'Drive online growth through marketing strategies.', keywords: ['marketing', 'digital', 'seo', 'social media', 'content', 'advertising'], skills: ['SEO/SEM', 'Social Media Marketing', 'Content Strategy', 'Analytics', 'Ad Platforms'], timeline: '3-6 months', youtube: ['https://www.youtube.com/watch?v=bixR-KIJKYM'] },
      { name: 'HR Manager', description: 'Manage human resources and organizational development.', keywords: ['hr', 'human resources', 'recruitment', 'people', 'management', 'hiring'], skills: ['Recruitment', 'Employee Relations', 'HR Software', 'Labor Laws', 'Training'], timeline: '4-8 months', youtube: ['https://www.youtube.com/watch?v=aZETj6T8UoU'] },
      { name: 'Content Writer', description: 'Create compelling content for various platforms.', keywords: ['writing', 'content', 'blog', 'copywriting', 'creative writing'], skills: ['Writing', 'SEO', 'Research', 'Content Strategy', 'Editing'], timeline: '2-4 months', youtube: ['https://www.youtube.com/watch?v=3DSMWUH7WBk'] }
    ];

    const scoredCareers = careerDatabase.map(career => {
      let score = 0;
      let matchedKeywords: string[] = [];
      career.keywords.forEach(keyword => {
        if (combined.includes(keyword)) { score += 15; matchedKeywords.push(keyword); }
      });
      career.skills.forEach(skill => {
        if (combined.includes(skill.toLowerCase())) { score += 10; }
      });
      return { ...career, score, matchedKeywords };
    });

    return scoredCareers
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((career, index) => {
        const baseMatch = Math.min(95, Math.max(60, 60 + career.score));
        return {
          id: crypto.randomUUID(),
          career_name: career.name,
          description: career.description,
          match_percentage: baseMatch - (index * 3),
          required_skills: career.skills,
          youtube_links: career.youtube,
          estimated_timeline: career.timeline,
          roadmap_steps: [`Learn ${career.skills[0]} fundamentals`, `Build practice projects`, `Get certified in ${career.skills[1] || career.skills[0]}`, `Create portfolio showcasing your work`, `Apply for entry-level positions`],
          rationale: career.matchedKeywords.length > 0 ? `Matched based on your skills: ${career.matchedKeywords.join(', ')}` : `Based on your education in ${profile.fieldOfStudy || 'your field'} and career interests.`,
          projects: [],
          internships: [],
          certifications: [],
          competitions: []
        };
      });
  };

  // Skill gap analysis
  const getSkillGapData = () => {
    if (!selectedCareer) return { current: [], required: [], missing: [], matchPercent: 0 };
    const userSkillsRaw = profileData.skills || '';
    const currentSkills = userSkillsRaw.split(/[,;|\n]+/).map(s => s.trim()).filter(Boolean);
    const requiredSkills = selectedCareer.required_skills || [];
    const currentLower = currentSkills.map(s => s.toLowerCase());
    const missing = requiredSkills.filter(rs => !currentLower.some(cs => cs.includes(rs.toLowerCase()) || rs.toLowerCase().includes(cs)));
    const matched = requiredSkills.length - missing.length;
    const matchPercent = requiredSkills.length > 0 ? Math.round((matched / requiredSkills.length) * 100) : 0;
    return { current: currentSkills, required: requiredSkills, missing, matchPercent };
  };

  // Generate roadmap for selected career (with caching + quick mode)
  const generateRoadmap = async (career?: CareerOption) => {
    const target = career || selectedCareer;
    if (!target) return;
    
    // Check cache first
    const cacheKey = target.career_name;
    const cached = roadmapCache.current.get(cacheKey);
    if (cached) {
      setRoadmapData(cached);
      return;
    }
    
    setIsLoadingRoadmap(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-career-roadmap', {
        body: {
          careerName: target.career_name,
          profileData: {
            skills: profileData.skills,
            education: profileData.fieldOfStudy || profileData.educationLevel,
            interests: profileData.interests
          },
          language: 'en',
          mode: 'quick'
        }
      });
      if (error) throw error;
      let years: RoadmapYear[] = [];
      if (data?.roadmap?.years) {
        years = data.roadmap.years;
      } else if (data?.roadmap?.milestones) {
        const milestones = data.roadmap.milestones || [];
        years = milestones.slice(0, 4).map((m: any, i: number) => ({
          year: `Year ${i + 1}`,
          focus: m.title || m.name || `Phase ${i + 1}`,
          activities: m.tasks?.map((t: any) => typeof t === 'string' ? t : t.title) || m.activities || [],
          milestones: m.milestones || [`Complete ${m.title || 'phase'}`]
        }));
      } else {
        years = getFallbackRoadmap();
      }
      roadmapCache.current.set(cacheKey, years);
      setRoadmapData(years);
    } catch (error) {
      console.error('Roadmap generation failed:', error);
      const fallback = getFallbackRoadmap();
      setRoadmapData(fallback);
    } finally {
      setIsLoadingRoadmap(false);
    }
  };

  const getFallbackRoadmap = (): RoadmapYear[] => {
    const career = selectedCareer?.career_name || 'Career';
    return [
      { year: 'Year 1', focus: 'Learn Core Fundamentals', activities: ['Complete foundational courses', 'Practice basic skills daily', 'Join online communities'], milestones: ['Finish 2 beginner courses', 'Build first small project'] },
      { year: 'Year 2', focus: 'Build Projects & Portfolio', activities: ['Build 3-5 real projects', 'Contribute to open source', 'Start a portfolio website'], milestones: ['Complete portfolio', 'Get first freelance project'] },
      { year: 'Year 3', focus: 'Gain Industry Experience', activities: ['Apply for internships', 'Attend industry events', 'Network with professionals'], milestones: ['Complete internship', 'Earn professional certification'] },
      { year: 'Year 4', focus: 'Career Launch', activities: ['Prepare for interviews', 'Apply to target companies', 'Negotiate offers'], milestones: [`Land ${career} role`, 'Start professional career'] }
    ];
  };

  const getFallbackSuggestions = (): { projects: string[]; internships: string[]; certifications: string[]; competitions: string[] } => {
    const career = selectedCareer?.career_name?.toLowerCase() || '';
    if (career.includes('python') || career.includes('data') || career.includes('ml')) {
      return { projects: ['Build a data dashboard with Pandas & Streamlit', 'Create a ML prediction model', 'Automate tasks with Python scripts'], internships: ['Data Science Intern at startups', 'Analytics Intern at consulting firms', 'Research Assistant at universities'], certifications: ['Google Data Analytics Certificate', 'IBM Data Science Professional', 'AWS ML Specialty'], competitions: ['Kaggle Competitions', 'Google Code Jam', 'HackerEarth ML challenges'] };
    }
    if (career.includes('frontend') || career.includes('full stack') || career.includes('web')) {
      return { projects: ['Build a responsive portfolio site', 'Create a full-stack e-commerce app', 'Build a real-time chat app'], internships: ['Frontend Developer Intern', 'Web Development Intern', 'UI Engineer Intern'], certifications: ['Meta Frontend Developer Certificate', 'freeCodeCamp Full Stack', 'AWS Cloud Practitioner'], competitions: ['MLH Hackathons', 'Google Summer of Code', 'Hacktoberfest'] };
    }
    return { projects: ['Build a portfolio project', 'Contribute to open source', 'Create a case study'], internships: ['Industry intern at startups', 'Corporate internship programs', 'Virtual internship platforms'], certifications: ['Google Career Certificates', 'Coursera Professional Certificates', 'LinkedIn Learning Paths'], competitions: ['Industry hackathons', 'Case study competitions', 'Innovation challenges'] };
  };

  // Handle career selection - pre-fetch roadmap immediately
  const handleSelectCareer = (career: CareerOption) => {
    setSelectedCareer(career);
    setCurrentStep('skillGap');
    setRoadmapData([]);
    // Start roadmap generation in background while user views skill gap
    generateRoadmap(career);
  };

  const handleNextStep = () => {
    const steps: FlowStep[] = ['recommendations', 'skillGap', 'roadmap', 'suggestions'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      const next = steps[currentIndex + 1];
      setCurrentStep(next);
      // Roadmap already pre-fetching from handleSelectCareer, no need to trigger again
    }
  };

  const handlePrevStep = () => {
    const steps: FlowStep[] = ['recommendations', 'skillGap', 'roadmap', 'suggestions'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    } else {
      setSelectedCareer(null);
      setCurrentStep('recommendations');
    }
  };

  const handleStartJourney = () => {
    if (!selectedCareer) return;
    if (!user) {
      navigate('/auth');
      return;
    }
    // Store selected career in localStorage for the growth path page
    localStorage.setItem('selectedCareer', selectedCareer.career_name);
    toast.success(t('careerGuide.startingJourney').replace('{career}', selectedCareer.career_name));
    navigate(`/career-growth-path?career=${encodeURIComponent(selectedCareer.career_name)}`);
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
              <h2 className="text-2xl font-bold gradient-text-rainbow mb-2">{t('careerGuide.analyzingProfile')}</h2>
              <p className="text-muted-foreground">{t('careerGuide.findingMatches')}</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span>{t('careerGuide.analyzingSkills')}</span><span>85%</span></div>
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

  // Multi-step detail flow for selected career
  if (selectedCareer && currentStep !== 'recommendations') {
    const stepLabels: Record<FlowStep, string> = {
      recommendations: 'Careers',
      skillGap: 'Skill Gap Analysis',
      roadmap: 'Personalized Roadmap',
      suggestions: 'Projects & Internships'
    };
    const stepIcons: Record<FlowStep, React.ReactNode> = {
      recommendations: <Target className="w-4 h-4" />,
      skillGap: <Brain className="w-4 h-4" />,
      roadmap: <GraduationCap className="w-4 h-4" />,
      suggestions: <Briefcase className="w-4 h-4" />
    };
    const allSteps: FlowStep[] = ['skillGap', 'roadmap', 'suggestions'];
    const currentStepIndex = allSteps.indexOf(currentStep);
    const skillGap = getSkillGapData();
    const suggestions = selectedCareer.projects?.length ? selectedCareer : { ...selectedCareer, ...getFallbackSuggestions() };

    return (
      <div className="min-h-screen cyber-grid p-4 md:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Header with career name & back */}
          <Card className="glass-card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="icon" onClick={handlePrevStep}>
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                  <h2 className="text-xl font-bold gradient-text-rainbow">{selectedCareer.career_name}</h2>
                  <p className="text-xs text-muted-foreground">{selectedCareer.match_percentage}% Match</p>
                </div>
              </div>
              <Badge variant="outline">{stepLabels[currentStep]}</Badge>
            </div>
            {/* Step indicators */}
            <div className="flex gap-2 mt-3">
              {allSteps.map((s, i) => (
                <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${i <= currentStepIndex ? 'bg-primary' : 'bg-muted'}`} />
              ))}
            </div>
          </Card>

          {/* STEP: Skill Gap */}
          {currentStep === 'skillGap' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" /> Skill Gap Analysis
                </h3>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Skill Match</span>
                    <span className="font-semibold">{skillGap.matchPercent}%</span>
                  </div>
                  <Progress value={skillGap.matchPercent} className="h-3" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-green-500 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Your Skills</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {skillGap.current.length > 0 ? skillGap.current.map((s, i) => (
                        <Badge key={i} className="bg-green-500/10 text-green-600 border-green-500/30 text-xs">{s}</Badge>
                      )) : <p className="text-xs text-muted-foreground">No skills listed</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-blue-500 flex items-center gap-1"><Target className="w-4 h-4" /> Required Skills</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {skillGap.required.map((s, i) => (
                        <Badge key={i} className="bg-blue-500/10 text-blue-600 border-blue-500/30 text-xs">{s}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-red-500 flex items-center gap-1"><Lightbulb className="w-4 h-4" /> Missing Skills</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {skillGap.missing.length > 0 ? skillGap.missing.map((s, i) => (
                        <Badge key={i} className="bg-red-500/10 text-red-600 border-red-500/30 text-xs">{s}</Badge>
                      )) : <p className="text-xs text-green-500">All skills covered! 🎉</p>}
                    </div>
                  </div>
                </div>
              </Card>
              <div className="flex justify-end">
                <Button onClick={handleNextStep} className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                  Next: Personalized Roadmap <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP: Roadmap */}
          {currentStep === 'roadmap' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <Card className="glass-card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" /> Personalized Roadmap
                </h3>
                {isLoadingRoadmap ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3"></div>
                    <p className="text-sm text-muted-foreground">{loadingMessage || 'Generating your personalized roadmap...'}</p>
                    <div className="flex justify-center gap-1.5 mt-3">
                      {['Analyzing', 'Identifying', 'Building', 'Preparing'].map((_, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                          i <= ['Analyzing your skills...', 'Identifying career gaps...', 'Building your personalized roadmap...', 'Preparing growth recommendations...'].indexOf(loadingMessage)
                            ? 'bg-primary' : 'bg-muted'
                        }`} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {roadmapData.map((yr, i) => (
                      <div key={i} className="relative pl-8 border-l-2 border-primary/30 pb-4 last:pb-0">
                        <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-primary" />
                        <h4 className="font-bold text-primary">{yr.year} — {yr.focus}</h4>
                        <ul className="mt-2 space-y-1">
                          {yr.activities.map((a, j) => (
                            <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-primary/60 flex-shrink-0" /> {a}
                            </li>
                          ))}
                        </ul>
                        {yr.milestones.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {yr.milestones.map((m, j) => (
                              <Badge key={j} variant="outline" className="text-xs"><Trophy className="w-3 h-3 mr-1" />{m}</Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
              <div className="flex justify-end">
                <Button onClick={handleNextStep} className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
                  Next: Projects & Internships <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP: Suggestions (Projects, Internships, Certs, Competitions) */}
          {currentStep === 'suggestions' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SuggestionCard icon={<Code className="w-5 h-5 text-blue-500" />} title="Projects" items={suggestions.projects || []} color="blue" />
                <SuggestionCard icon={<Briefcase className="w-5 h-5 text-green-500" />} title="Internships" items={suggestions.internships || []} color="green" />
                <SuggestionCard icon={<GraduationCap className="w-5 h-5 text-purple-500" />} title="Certifications" items={suggestions.certifications || []} color="purple" />
                <SuggestionCard icon={<Trophy className="w-5 h-5 text-amber-500" />} title="Competitions" items={suggestions.competitions || []} color="amber" />
              </div>
              <div className="flex justify-center pt-2">
                <Button onClick={handleStartJourney} size="lg" className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105">
                  <Sparkles className="w-5 h-5 mr-2" /> Start This Journey <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // Main recommendations view
  return (
    <>
      <ConfettiEffect trigger={showConfetti} type="celebration" />
      <div className="min-h-screen cyber-grid p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* AI Chat */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl overflow-hidden">
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

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold gradient-text-rainbow">{t('careerGuide.perfectMatches')}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('careerGuide.basedOnProfile').replace('{count}', String(careerOptions.length)).replace('{name}', profileData.name || 'Student')}
            </p>
            <p className="text-sm text-muted-foreground">Click a career to explore skill gaps, roadmap & more</p>
          </motion.div>

          {/* Career Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {careerOptions.map((career, index) => (
              <motion.div key={career.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
                <Card className="glass-card p-6 h-full flex flex-col hover:shadow-2xl transition-all cursor-pointer group" onClick={() => handleSelectCareer(career)}>
                  <div className="space-y-4 flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold gradient-text-rainbow mb-2">{career.career_name}</h3>
                        <p className="text-muted-foreground text-sm">{career.description}</p>
                      </div>
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400 ml-4">
                        {career.match_percentage}% {t('careerGuide.match')}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">{t('careerGuide.timeline')}: {career.estimated_timeline}</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">{t('careerGuide.keySkillsNeeded')}:</p>
                      <div className="flex flex-wrap gap-2">
                        {career.required_skills.slice(0, 5).map((skill, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{skill}</Badge>
                        ))}
                      </div>
                    </div>
                    {career.youtube_links.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-2"><Video className="w-3 h-3 inline mr-1" />{t('careerGuide.learningResourcesLabel')}:</p>
                        <div className="space-y-1">
                          {career.youtube_links.map((link, i) => (
                            <a key={i} href={link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline block truncate" onClick={(e) => e.stopPropagation()}>
                              📺 Tutorial {i + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <Button variant="rainbow" size="lg" onClick={(e) => { e.stopPropagation(); handleSelectCareer(career); }}
                    className="w-full mt-4 relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(168,85,247,0.7)] border-2 border-white/30 hover:border-white/50 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 group">
                    <span className="relative z-10 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Explore This Career
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </span>
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

// Helper component for suggestion cards
const SuggestionCard: React.FC<{ icon: React.ReactNode; title: string; items: string[]; color: string }> = ({ icon, title, items, color }) => (
  <Card className="glass-card p-5">
    <h4 className="font-semibold mb-3 flex items-center gap-2">{icon} {title}</h4>
    {items.length > 0 ? (
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
            <div className={`w-1.5 h-1.5 rounded-full bg-${color}-500 mt-1.5 flex-shrink-0`} />
            {item}
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-sm text-muted-foreground italic">No suggestions available yet</p>
    )}
  </Card>
);
