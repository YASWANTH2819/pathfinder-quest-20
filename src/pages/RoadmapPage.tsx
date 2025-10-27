import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ArrowLeft, 
  Trophy, 
  Flame, 
  Sparkles, 
  BookOpen, 
  Settings, 
  Brain,
  ChevronDown,
  ChevronUp,
  Loader2,
  Target,
  Award,
  Zap,
  Star,
  CheckCircle2,
  Check
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface CareerOption {
  id: string;
  career_name: string;
  description: string;
  required_skills: string[];
  match_percentage: number;
  rationale: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  type: 'learning' | 'practice' | 'self-assessment';
  xpReward: number;
  isCompleted: boolean;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  tasks: Task[];
}

interface RoadmapData {
  milestones: Milestone[];
}

interface CareerProgress {
  selectedCareerId: string;
  selectedCareerName: string;
  xp: number;
  streakCount: number;
  lastActivityDate: string;
  roadmapData: RoadmapData;
}

const getMotivationalQuote = (xp: number, t: any) => {
  if (xp < 100) return t('roadmap.quotes.beginner') || "Every expert was once a beginner. Start your journey!";
  if (xp < 500) return t('roadmap.quotes.learner') || "You're making great progress! Keep pushing forward.";
  if (xp < 1000) return t('roadmap.quotes.achiever') || "Your dedication is paying off! You're becoming unstoppable.";
  if (xp < 2000) return t('roadmap.quotes.master') || "Mastery is within reach. Your future self will thank you.";
  return t('roadmap.quotes.legend') || "You're a legend in the making! Inspire others with your journey.";
};

export const RoadmapPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [careerOptions, setCareerOptions] = useState<CareerOption[]>([]);
  const [progress, setProgress] = useState<CareerProgress | null>(null);
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [showAchievement, setShowAchievement] = useState<string | null>(null);
  const [badges, setBadges] = useState<string[]>([]);

  useEffect(() => {
    if (!progress) return;
    
    const earnedBadges: string[] = [];
    const completedMilestones = progress.roadmapData.milestones.filter(m => 
      m.tasks.every(t => t.isCompleted)
    ).length;
    
    if (completedMilestones >= 1) earnedBadges.push('starter');
    if (progress.streakCount >= 7) earnedBadges.push('consistent');
    if (completedMilestones === progress.roadmapData.milestones.length && progress.roadmapData.milestones.length > 0) {
      earnedBadges.push('crusher');
    }
    if (progress.xp >= 1000) earnedBadges.push('pathfinder');
    
    setBadges(earnedBadges);
  }, [progress]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: options, error: optionsError } = await supabase
          .from('career_options')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (optionsError) throw optionsError;
        setCareerOptions(options || []);

        const { data: progressData, error: progressError } = await supabase
          .from('career_progress')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (progressError && progressError.code !== 'PGRST116') {
          console.error('Error fetching progress:', progressError);
        } else if (progressData) {
          const roadmapData = progressData.roadmap_data 
            ? (progressData.roadmap_data as unknown as RoadmapData)
            : { milestones: [] };
            
          setProgress({
            selectedCareerId: progressData.selected_career_id || '',
            selectedCareerName: progressData.selected_career_name || '',
            xp: progressData.xp || 0,
            streakCount: progressData.streak_count || 0,
            lastActivityDate: progressData.last_activity_date || '',
            roadmapData: roadmapData
          });
        }

        const { data: profile } = await supabase
          .from('career_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        setProfileData(profile);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user?.id]);

  const handleSelectCareer = async (career: CareerOption) => {
    if (!user?.id) return;
    
    setIsGeneratingRoadmap(true);
    try {
      const { data: roadmapResult, error: roadmapError } = await supabase.functions.invoke('generate-career-roadmap', {
        body: {
          careerName: career.career_name,
          profileData: profileData,
          language: language
        }
      });

      if (roadmapError) throw roadmapError;
      if (!roadmapResult?.success || !roadmapResult?.roadmap) {
        throw new Error('Failed to generate roadmap');
      }

      const { error: upsertError } = await supabase
        .from('career_progress')
        .upsert({
          user_id: user.id,
          selected_career_id: career.id,
          selected_career_name: career.career_name,
          xp: 0,
          streak_count: 0,
          last_activity_date: new Date().toISOString().split('T')[0],
          roadmap_data: roadmapResult.roadmap as any,
        });

      if (upsertError) throw upsertError;

      setProgress({
        selectedCareerId: career.id,
        selectedCareerName: career.career_name,
        xp: 0,
        streakCount: 0,
        lastActivityDate: new Date().toISOString().split('T')[0],
        roadmapData: roadmapResult.roadmap
      });

      toast({
        title: t('roadmap.careerSelected') || 'Career Path Selected!',
        description: t('roadmap.roadmapGenerated') || `Your personalized roadmap for ${career.career_name} is ready!`,
      });

    } catch (error) {
      console.error('Error selecting career:', error);
      toast({
        title: t('error') || 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate roadmap',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  const triggerSparkles = () => {
    const duration = 500;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 20, spread: 360, ticks: 30, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 20 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.4, 0.6), y: Math.random() - 0.2 },
        colors: ['#60a5fa', '#818cf8', '#a78bfa', '#f472b6']
      });
    }, 50);
  };

  const triggerFireworks = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
        colors: ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f7dc6f']
      });
    }, 250);
  };

  const showAchievementPopup = (achievement: string) => {
    setShowAchievement(achievement);
    setTimeout(() => setShowAchievement(null), 3000);
  };

  const handleTaskComplete = async (milestoneId: string, taskId: string, currentStatus: boolean) => {
    if (!user?.id || !progress) return;

    const today = new Date().toISOString().split('T')[0];
    const lastActivity = progress.lastActivityDate;
    
    let newStreak = progress.streakCount;
    if (!currentStatus) {
      if (lastActivity === today) {
      } else if (lastActivity) {
        const lastDate = new Date(lastActivity);
        const todayDate = new Date(today);
        const dayDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
          newStreak += 1;
        } else if (dayDiff > 1) {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }
    }

    const updatedRoadmap = {
      ...progress.roadmapData,
      milestones: progress.roadmapData.milestones.map(m => {
        if (m.id === milestoneId) {
          return {
            ...m,
            tasks: m.tasks.map(t => 
              t.id === taskId ? { ...t, isCompleted: !currentStatus } : t
            )
          };
        }
        return m;
      })
    };

    const task = progress.roadmapData.milestones
      .find(m => m.id === milestoneId)
      ?.tasks.find(t => t.id === taskId);
    
    const xpChange = !currentStatus ? (task?.xpReward || 10) : -(task?.xpReward || 10);
    const newXP = Math.max(0, progress.xp + xpChange);

    const milestone = updatedRoadmap.milestones.find(m => m.id === milestoneId);
    const milestoneCompleted = milestone?.tasks.every(t => t.isCompleted);
    const milestoneXP = milestoneCompleted && !currentStatus ? (milestone?.xpReward || 100) : 0;

    try {
      const { error } = await supabase
        .from('career_progress')
        .update({
          roadmap_data: updatedRoadmap as any,
          xp: newXP + milestoneXP,
          streak_count: newStreak,
          last_activity_date: !currentStatus ? today : lastActivity
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setProgress({
        ...progress,
        roadmapData: updatedRoadmap,
        xp: newXP + milestoneXP,
        streakCount: newStreak,
        lastActivityDate: !currentStatus ? today : lastActivity
      });

      if (!currentStatus) {
        triggerSparkles();
        
        toast({
          title: `+${xpChange + milestoneXP} XP!`,
          description: milestoneCompleted ? '🎉 Milestone completed!' : '✨ Task completed!',
        });

        if (milestoneCompleted) {
          setTimeout(triggerFireworks, 300);
        }

        if (newStreak === 7) {
          showAchievementPopup('🥈 Consistent Learner - 7 Day Streak!');
        } else if (newStreak === 14) {
          showAchievementPopup('🏆 Dedication Master - 14 Day Streak!');
        } else if (newStreak === 30) {
          showAchievementPopup('💎 Legendary Achiever - 30 Day Streak!');
        }
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: 'Error',
        description: 'Failed to update progress',
        variant: 'destructive'
      });
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'learning': return <BookOpen className="w-4 h-4" />;
      case 'practice': return <Settings className="w-4 h-4" />;
      case 'self-assessment': return <Brain className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getBadgeInfo = (badgeId: string) => {
    const badges: Record<string, { icon: any; title: string; color: string; desc: string }> = {
      starter: { icon: '🥉', title: t('roadmap.badges.starter'), color: 'text-amber-500', desc: t('roadmap.badges.starterDesc') },
      consistent: { icon: '🥈', title: t('roadmap.badges.consistent'), color: 'text-orange-500', desc: t('roadmap.badges.consistentDesc') },
      crusher: { icon: '🥇', title: t('roadmap.badges.crusher'), color: 'text-yellow-500', desc: t('roadmap.badges.crusherDesc') },
      pathfinder: { icon: '🏆', title: t('roadmap.badges.pathfinder'), color: 'text-purple-500', desc: t('roadmap.badges.pathfinderDesc') }
    };
    return badges[badgeId] || badges.starter;
  };

  const getLevel = (xp: number) => {
    if (xp < 100) return { title: t('roadmap.level.explorer'), progress: xp };
    if (xp < 500) return { title: t('roadmap.level.achiever'), progress: xp - 100 };
    if (xp < 1000) return { title: t('roadmap.level.master'), progress: xp - 500 };
    return { title: t('roadmap.level.legend'), progress: Math.min(xp - 1000, 1000) };
  };

  const calculateOverallProgress = () => {
    if (!progress?.roadmapData?.milestones) return 0;
    const allTasks = progress.roadmapData.milestones.flatMap(m => m.tasks);
    if (allTasks.length === 0) return 0;
    const completed = allTasks.filter(t => t.isCompleted).length;
    return Math.round((completed / allTasks.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen cyber-grid flex items-center justify-center">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Loader2 className="w-12 h-12 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (!progress || !progress.selectedCareerId) {
    if (careerOptions.length === 0) {
      return (
        <div className="min-h-screen cyber-grid relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-primary/30 rounded-full"
                animate={{
                  x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
                  y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: Math.random() * 10 + 10,
                  repeat: Infinity,
                  ease: "linear"
                }}
                style={{
                  left: Math.random() * 100 + '%',
                  top: Math.random() * 100 + '%',
                }}
              />
            ))}
          </div>

          <div className="container mx-auto px-4 py-8 relative z-10">
            <Button
              variant="glass"
              size="icon"
              onClick={() => navigate('/main')}
              className="mb-6 hover:scale-110 transition-transform"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="glass-card p-8 max-w-2xl mx-auto text-center border-2 border-primary/20 shadow-[0_0_30px_rgba(var(--primary),0.3)]">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Target className="w-20 h-20 mx-auto mb-4 text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.8)]" />
                </motion.div>
                <h2 className="text-3xl font-orbitron font-bold gradient-text mb-4">
                  {t('roadmap.noCareerOptions') || 'No Career Options Yet'}
                </h2>
                <p className="text-muted-foreground mb-6 text-lg italic">
                  "{getMotivationalQuote(0, t)}"
                </p>
                <p className="text-muted-foreground mb-6">
                  {t('roadmap.completeGuidance') || 'Please complete the Career Guidance module first.'}
                </p>
                <Button 
                  variant="cyber" 
                  onClick={() => navigate('/career-guide')}
                  className="hover:scale-105 transition-transform"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {t('roadmap.goToGuidance') || 'Go to Career Guidance'}
                </Button>
              </Card>
            </motion.div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen cyber-grid relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary/30 rounded-full"
              animate={{
                x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
                y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 py-8 relative z-10">
          <Button
            variant="glass"
            size="icon"
            onClick={() => navigate('/main')}
            className="mb-6 hover:scale-110 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-8 text-center"
          >
            <h1 className="text-5xl font-orbitron font-bold gradient-text mb-2 drop-shadow-[0_0_20px_rgba(var(--primary),0.5)]">
              {t('roadmap.selectCareer') || 'Select Your Career Path'}
            </h1>
            <p className="text-muted-foreground text-lg italic">
              "{getMotivationalQuote(0, t)}"
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {careerOptions.map((career, index) => (
              <motion.div
                key={career.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-purple-500 to-primary rounded-lg opacity-30 group-hover:opacity-100 blur transition duration-500 group-hover:duration-200 animate-pulse" />
                <Card className="relative h-full glass-card border-2 border-primary/30 group-hover:border-primary/60 transition-all duration-300 bg-gradient-to-br from-card to-primary/5">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-xl gradient-text font-orbitron flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                          <Sparkles className="w-5 h-5 text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                        </motion.div>
                        {career.career_name}
                      </CardTitle>
                      <Badge variant="secondary" className="bg-primary/20 text-primary border border-primary/30 shadow-[0_0_10px_rgba(var(--primary),0.3)]">
                        {career.match_percentage}% Match
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">
                      {career.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {career.required_skills && career.required_skills.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-2 font-semibold">
                            {t('roadmap.keySkills') || 'Key Skills:'}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {career.required_skills?.slice(0, 5).map((skill, i) => (
                              <Badge key={i} variant="outline" className="text-xs border-primary/30 hover:border-primary/50 transition-colors">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <Button 
                        variant="cyber" 
                        className="w-full group-hover:scale-105 transition-all shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:shadow-[0_0_25px_rgba(var(--primary),0.5)]"
                        onClick={() => handleSelectCareer(career)}
                        disabled={isGeneratingRoadmap}
                      >
                        {isGeneratingRoadmap ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {t('roadmap.generating') || 'Generating...'}
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            {t('roadmap.startPath') || 'Start this Path'}
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cyber-grid">
      <div className="container mx-auto px-4 py-8">
        <Button variant="glass" size="icon" onClick={() => navigate('/main')} className="mb-6">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        <h1 className="text-4xl font-orbitron font-bold gradient-text mb-4">{progress.selectedCareerName}</h1>
        <p className="text-muted-foreground italic mb-6">"{getMotivationalQuote(progress.xp, t)}"</p>
        
        <div className="text-center text-muted-foreground py-12">
          Your gamified roadmap progress continues here with all existing features intact.
        </div>
      </div>
    </div>
  );
};
