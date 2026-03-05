import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  Code, 
  Palette, 
  BarChart, 
  Users, 
  Lightbulb,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Trophy,
  Target,
  CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { RoadmapView } from '@/components/RoadmapView';
import { getPredefinedRoadmap, getGenericRoadmap } from '@/data/predefinedRoadmaps';

interface CareerOption {
  id: string;
  career_name: string;
  description: string;
  match_percentage: number;
  required_skills: string[];
  rationale: string;
}

interface CareerProgress {
  id: string;
  selected_career_id: string;
  selected_career_name: string;
  xp: number;
  streak_count: number;
  roadmap_data: any;
}

const careerIcons: Record<string, any> = {
  'Product Manager': Briefcase,
  'Data Analyst': BarChart,
  'Software Engineer': Code,
  'UI/UX Designer': Palette,
  'Business Analyst': Users,
  'Marketing Manager': Lightbulb,
  'default': Target
};

const careerColors: Record<number, string> = {
  0: 'from-blue-500 to-cyan-500',
  1: 'from-purple-500 to-pink-500',
  2: 'from-green-500 to-emerald-500',
  3: 'from-orange-500 to-red-500',
  4: 'from-indigo-500 to-purple-500',
  5: 'from-yellow-500 to-orange-500',
};

export const CareerGrowthPath = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [careerOptions, setCareerOptions] = useState<CareerOption[]>([]);
  const [selectedCareer, setSelectedCareer] = useState<CareerOption | null>(null);
  const [careerProgress, setCareerProgress] = useState<CareerProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRoadmap, setShowRoadmap] = useState(false);

  const careerFromUrl = searchParams.get('career');

  useEffect(() => {
    if (!user) return;
    
    const init = async () => {
      setLoading(true);
      try {
        const [optionsResult, progressResult] = await Promise.all([
          supabase
            .from('career_options')
            .select('*')
            .eq('user_id', user.id)
            .order('match_percentage', { ascending: false }),
          supabase
            .from('career_progress')
            .select('*')
            .eq('user_id', user.id)
            .single()
        ]);

        const options = optionsResult.data || [];
        setCareerOptions(options);

        const progress = progressResult.data;
        const progressError = progressResult.error;
        
        if (progressError && progressError.code !== 'PGRST116') {
          console.error('Error fetching career progress:', progressError);
        }

        // If we have existing progress, show the roadmap immediately
        if (progress) {
          setCareerProgress(progress);
          const matched = options.find((c: CareerOption) => c.id === progress.selected_career_id);
          if (matched) {
            setSelectedCareer(matched);
            setShowRoadmap(true);
            setLoading(false);
            return;
          }
        }

        // If career param in URL, auto-start journey instantly
        if (careerFromUrl && options.length > 0) {
          const urlCareer = options.find(
            (c: CareerOption) => c.career_name.toLowerCase() === careerFromUrl.toLowerCase()
          );
          if (urlCareer) {
            setLoading(false);
            handleSelectCareer(urlCareer);
            return;
          }
        }

        // Also check localStorage for career selection
        const storedCareer = localStorage.getItem('selectedCareer');
        if (storedCareer && options.length > 0) {
          const stored = options.find(
            (c: CareerOption) => c.career_name.toLowerCase() === storedCareer.toLowerCase()
          );
          if (stored) {
            setLoading(false);
            handleSelectCareer(stored);
            return;
          }
        }
      } catch (error) {
        console.error('Error initializing career growth path:', error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [user, careerFromUrl]);

  const handleSelectCareer = async (career: CareerOption) => {
    if (!user) return;

    setSelectedCareer(career);

    // INSTANT: Load predefined roadmap immediately
    const predefined = getPredefinedRoadmap(career.career_name) || getGenericRoadmap(career.career_name);
    
    const transformedRoadmap = {
      steps: predefined.steps,
      milestones: predefined.levels.map((lvl, i) => ({
        id: `m${i + 1}`,
        title: `${lvl.level} — ${lvl.title}`,
        description: lvl.skills.join(', '),
        xpReward: (i + 1) * 100,
        tasks: lvl.skills.map((skill, j) => ({
          id: `t${i}_${j}`,
          title: skill,
          description: `Master ${skill}`,
          type: 'learning',
          xpReward: 10 + (i * 5),
          isCompleted: false,
        })),
      })),
      explanation: `Personalized roadmap for ${career.career_name}`,
    };

    // Save progress to DB (don't block UI)
    const savePromise = supabase
      .from('career_progress')
      .upsert({
        user_id: user.id,
        selected_career_id: career.id,
        selected_career_name: career.career_name,
        xp: 0,
        streak_count: 0,
        roadmap_data: transformedRoadmap,
        last_activity_date: new Date().toISOString().split('T')[0]
      }, { onConflict: 'user_id' });

    // Show roadmap INSTANTLY
    const tempProgress: CareerProgress = {
      id: 'temp',
      selected_career_id: career.id,
      selected_career_name: career.career_name,
      xp: 0,
      streak_count: 0,
      roadmap_data: transformedRoadmap,
    };
    setCareerProgress(tempProgress);
    setShowRoadmap(true);
    toast.success(`🎉 Journey started for ${career.career_name}!`);

    // Persist in background, then update with real ID
    try {
      const { error } = await savePromise;
      if (error) console.error('Error saving progress:', error);
      
      const { data: savedProgress } = await supabase
        .from('career_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (savedProgress) setCareerProgress(savedProgress);
    } catch (err) {
      console.error('Background save error:', err);
    }

    // Background: AI personalization (non-blocking)
    supabase.functions.invoke('generate-career-roadmap', {
      body: {
        careerName: career.career_name,
        profileData: {},
        language: 'en',
        mode: 'full'
      }
    }).then(({ data }) => {
      if (data?.roadmap) {
        console.log('AI personalization available for future use');
      }
    }).catch(() => {});
  };

  const getCareerIcon = (careerName: string) => {
    const Icon = careerIcons[careerName] || careerIcons.default;
    return Icon;
  };

  if (loading) {
    return (
      <div className="min-h-screen cyber-grid flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <p className="mt-4 text-muted-foreground">Loading your career path...</p>
        </div>
      </div>
    );
  }

  if (showRoadmap && selectedCareer && careerProgress) {
    return <RoadmapView career={selectedCareer} progress={careerProgress} onBack={() => setShowRoadmap(false)} />;
  }

  if (careerOptions.length === 0) {
    return (
      <div className="min-h-screen cyber-grid flex items-center justify-center p-4">
        <Card className="glass-card p-12 max-w-2xl w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-24 h-24 mx-auto bg-gradient-to-r from-primary via-secondary to-accent rounded-full flex items-center justify-center mb-6">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            
            <h2 className="text-4xl font-bold gradient-text-rainbow mb-4">
              No Career Options Yet
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8">
              Every expert was once a beginner.<br />
              Start your journey!
            </p>

            <Button 
              variant="rainbow" 
              size="lg"
              onClick={() => window.location.href = '/career-guide'}
              className="group"
            >
              <Target className="mr-2 w-5 h-5" />
              Complete Career Guidance
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen cyber-grid p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold gradient-text-rainbow">
            Your Career Growth Path
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose a career path that matches your skills and interests. Start your personalized learning journey today!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {careerOptions.map((career, index) => {
            const Icon = getCareerIcon(career.career_name);
            const gradient = careerColors[index % 6];

            return (
              <motion.div
                key={career.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="glass-card p-6 h-full flex flex-col hover:shadow-xl transition-shadow cursor-pointer group">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold gradient-text-rainbow">
                      {career.career_name}
                    </h3>
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                      {career.match_percentage}% Match
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 flex-1">
                    {career.description || career.rationale}
                  </p>

                  {career.required_skills && career.required_skills.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Key Skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {career.required_skills.slice(0, 3).map((skill, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {career.required_skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{career.required_skills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  <Button
                    variant="rainbow"
                    className="w-full group relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(168,85,247,0.7)] border-2 border-white/30 hover:border-white/50 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
                    onClick={() => handleSelectCareer(career)}
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      <TrendingUp className="mr-2 w-5 h-5" />
                      Explore Career Path
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  </Button>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
