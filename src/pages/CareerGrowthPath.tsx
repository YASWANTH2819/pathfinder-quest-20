import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
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
  const [careerOptions, setCareerOptions] = useState<CareerOption[]>([]);
  const [selectedCareer, setSelectedCareer] = useState<CareerOption | null>(null);
  const [careerProgress, setCareerProgress] = useState<CareerProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [startingJourney, setStartingJourney] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCareerOptions();
      fetchCareerProgress();
    }
  }, [user]);

  const fetchCareerOptions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('career_options')
        .select('*')
        .eq('user_id', user.id)
        .order('match_percentage', { ascending: false });

      if (error) throw error;
      setCareerOptions(data || []);
    } catch (error) {
      console.error('Error fetching career options:', error);
      toast.error('Failed to load career options');
    } finally {
      setLoading(false);
    }
  };

  const fetchCareerProgress = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('career_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setCareerProgress(data);
      
      if (data) {
        const selected = careerOptions.find(c => c.id === data.selected_career_id);
        if (selected) {
          setSelectedCareer(selected);
          setShowRoadmap(true);
        }
      }
    } catch (error) {
      console.error('Error fetching career progress:', error);
    }
  };

  const handleSelectCareer = async (career: CareerOption) => {
    if (!user) return;

    setStartingJourney(true);
    setSelectedCareer(career);

    try {
      // Generate roadmap for selected career
      const { data: roadmapData, error: roadmapError } = await supabase.functions.invoke('generate-roadmap', {
        body: {
          goal: `Become a ${career.career_name}`,
          profileData: {},
          language: 'en',
          userId: user.id,
          systemPrompt: `Create a comprehensive career roadmap for becoming a ${career.career_name}. Focus on skills: ${career.required_skills.join(', ')}.`
        }
      });

      if (roadmapError) throw roadmapError;

      // Save or update career progress
      const { error: progressError } = await supabase
        .from('career_progress')
        .upsert({
          user_id: user.id,
          selected_career_id: career.id,
          selected_career_name: career.career_name,
          xp: 0,
          streak_count: 0,
          roadmap_data: roadmapData.roadmap,
          last_activity_date: new Date().toISOString().split('T')[0]
        });

      if (progressError) throw progressError;

      await fetchCareerProgress();
      
      setTimeout(() => {
        setStartingJourney(false);
        setShowRoadmap(true);
        toast.success(`🎉 Journey started for ${career.career_name}!`);
      }, 2000);

    } catch (error) {
      console.error('Error starting career journey:', error);
      toast.error('Failed to start career journey');
      setStartingJourney(false);
    }
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

  if (startingJourney && selectedCareer) {
    return (
      <div className="min-h-screen cyber-grid flex items-center justify-center p-4">
        <Card className="glass-card p-8 max-w-md w-full text-center">
          <div className="space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-20 h-20 mx-auto bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center"
            >
              <Trophy className="w-10 h-10 text-white" />
            </motion.div>
            
            <div>
              <h2 className="text-2xl font-bold gradient-text-rainbow mb-2">
                Starting Your Journey
              </h2>
              <p className="text-muted-foreground">
                Preparing your personalized roadmap for {selectedCareer.career_name}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Level 1: Getting Started</span>
                <span>0%</span>
              </div>
              <Progress value={0} className="h-3 animate-pulse" />
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
        {/* Header */}
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

        {/* Career Options Grid */}
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
                    className="w-full group"
                    onClick={() => handleSelectCareer(career)}
                  >
                    <TrendingUp className="mr-2 w-4 h-4" />
                    Start Journey
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
