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
  Star
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

  // Calculate badges based on progress
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

  // Fetch career options and progress
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch career options
        const { data: options, error: optionsError } = await supabase
          .from('career_options')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (optionsError) throw optionsError;
        setCareerOptions(options || []);

        // Fetch progress
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

        // Fetch profile data for AI context
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
      // Generate roadmap using AI
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

      // Save progress
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
    
    // Calculate streak
    let newStreak = progress.streakCount;
    if (!currentStatus) { // If marking as complete
      if (lastActivity === today) {
        // Same day, no streak change
      } else if (lastActivity) {
        const lastDate = new Date(lastActivity);
        const todayDate = new Date(today);
        const dayDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
          newStreak += 1; // Consecutive day
        } else if (dayDiff > 1) {
          newStreak = 1; // Streak broken, restart
        }
      } else {
        newStreak = 1; // First activity
      }
    }

    // Update roadmap data
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

    // Calculate XP change
    const task = progress.roadmapData.milestones
      .find(m => m.id === milestoneId)
      ?.tasks.find(t => t.id === taskId);
    
    const xpChange = !currentStatus ? (task?.xpReward || 10) : -(task?.xpReward || 10);
    const newXP = Math.max(0, progress.xp + xpChange);

    // Check if milestone completed
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
        // Trigger sparkles for task completion
        triggerSparkles();
        
        toast({
          title: `+${xpChange + milestoneXP} XP!`,
          description: milestoneCompleted ? '🎉 Milestone completed!' : '✨ Task completed!',
        });

        // Fireworks for milestone completion
        if (milestoneCompleted) {
          setTimeout(triggerFireworks, 300);
        }

        // Special streak achievements
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
    const badges: Record<string, { icon: any; title: string; color: string }> = {
      starter: { icon: Award, title: 'Starter', color: 'text-amber-500' },
      consistent: { icon: Flame, title: 'Consistent Learner', color: 'text-orange-500' },
      crusher: { icon: Trophy, title: 'Goal Crusher', color: 'text-yellow-500' },
      pathfinder: { icon: Star, title: 'Pathfinder Pro', color: 'text-purple-500' }
    };
    return badges[badgeId] || badges.starter;
  };

  const getLevel = (xp: number) => {
    if (xp < 100) return { title: 'Explorer', progress: xp };
    if (xp < 500) return { title: 'Achiever', progress: xp - 100 };
    if (xp < 1000) return { title: 'Master', progress: xp - 500 };
    return { title: 'Legend', progress: Math.min(xp - 1000, 1000) };
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

  // Career Selection View
  if (!progress || !progress.selectedCareerId) {
    if (careerOptions.length === 0) {
      return (
        <div className="min-h-screen cyber-grid relative overflow-hidden">
          {/* Particle Background */}
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
                <p className="text-muted-foreground mb-6 text-lg">
                  {t('roadmap.completeGuidance') || 'Please complete the Career Guidance module first to get personalized career recommendations.'}
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
        {/* Particle Background */}
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
            <p className="text-muted-foreground text-lg">
              {t('roadmap.selectCareerDesc') || 'Choose a career to start your personalized learning journey'}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {careerOptions.map((career, index) => (
              <motion.div
                key={career.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <Card className="glass-card h-full border-2 border-primary/20 hover:border-primary/50 transition-all duration-300 shadow-[0_0_20px_rgba(var(--primary),0.2)] hover:shadow-[0_0_40px_rgba(var(--primary),0.4)]">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-xl gradient-text font-orbitron">
                        {career.career_name}
                      </CardTitle>
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Badge variant="secondary" className="bg-primary/20 text-primary border border-primary/30 shadow-[0_0_10px_rgba(var(--primary),0.3)]">
                          {career.match_percentage}% Match
                        </Badge>
                      </motion.div>
                    </div>
                    <CardDescription className="text-sm">
                      {career.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-2 font-semibold">
                          {t('roadmap.keySkills') || 'Key Skills:'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {career.required_skills?.slice(0, 5).map((skill, i) => (
                            <motion.div
                              key={i}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.1 * i }}
                            >
                              <Badge variant="outline" className="text-xs border-primary/30 hover:border-primary/50 transition-colors">
                                {skill}
                              </Badge>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                      
                      {career.rationale && (
                        <p className="text-xs text-muted-foreground italic">
                          {career.rationale}
                        </p>
                      )}

                      <Button 
                        variant="cyber" 
                        className="w-full hover:scale-105 transition-transform shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:shadow-[0_0_25px_rgba(var(--primary),0.5)]"
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

  // Progress Dashboard View
  const overallProgress = calculateOverallProgress();
  const completedMilestones = progress.roadmapData.milestones.filter(m => 
    m.tasks.every(t => t.isCompleted)
  ).length;
  const level = getLevel(progress.xp);

  return (
    <div className="min-h-screen cyber-grid relative overflow-hidden">
      {/* Particle Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full"
            animate={{
              x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 15 + 15,
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

      {/* Achievement Popup */}
      <AnimatePresence>
        {showAchievement && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-1/2 transform -translate-x-1/2 z-50"
          >
            <Card className="glass-card border-2 border-yellow-500/50 shadow-[0_0_40px_rgba(234,179,8,0.5)]">
              <CardContent className="p-6 text-center">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: Infinity,
                    repeatDelay: 0.5,
                  }}
                >
                  <Trophy className="w-12 h-12 mx-auto mb-2 text-yellow-500" />
                </motion.div>
                <h3 className="text-xl font-orbitron font-bold gradient-text">
                  Achievement Unlocked!
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {showAchievement}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="glass"
            size="icon"
            onClick={() => navigate('/main')}
            className="hover:scale-110 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          {/* XP and Streak Display */}
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-4 py-2 glass-card rounded-full border border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.2)]"
            >
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="font-orbitron font-bold">{progress.xp} XP</span>
              <Badge variant="secondary" className="text-xs">{level.title}</Badge>
            </motion.div>
            
            <motion.div
              animate={{
                scale: progress.streakCount >= 7 ? [1, 1.1, 1] : 1,
              }}
              transition={{
                duration: 2,
                repeat: progress.streakCount >= 7 ? Infinity : 0,
              }}
              whileHover={{ scale: 1.05 }}
              className={`flex items-center gap-2 px-4 py-2 glass-card rounded-full border ${
                progress.streakCount >= 7 
                  ? 'border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.4)]' 
                  : 'border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.2)]'
              }`}
            >
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="font-orbitron font-bold">{progress.streakCount} Day{progress.streakCount !== 1 ? 's' : ''}</span>
            </motion.div>
          </div>
        </div>

        {/* Trophy Wall */}
        {badges.length > 0 && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-6"
          >
            <Card className="glass-card border border-primary/30 shadow-[0_0_20px_rgba(var(--primary),0.2)]">
              <CardHeader>
                <CardTitle className="text-lg gradient-text flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Trophy Wall
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {badges.map((badgeId, index) => {
                    const badge = getBadgeInfo(badgeId);
                    const Icon = badge.icon;
                    return (
                      <motion.div
                        key={badgeId}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.1, y: -5 }}
                      >
                        <div className={`p-4 glass-card rounded-lg border-2 ${badge.color} border-current shadow-[0_0_15px_currentColor] hover:shadow-[0_0_25px_currentColor] transition-all cursor-pointer`}>
                          <Icon className={`w-8 h-8 ${badge.color} mx-auto mb-2`} />
                          <p className="text-xs font-semibold text-center">{badge.title}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Career Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <h1 className="text-4xl font-orbitron font-bold gradient-text mb-4 drop-shadow-[0_0_20px_rgba(var(--primary),0.5)]">
            {progress.selectedCareerName}
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Progress value={overallProgress} className="h-4 shadow-[0_0_10px_rgba(var(--primary),0.3)]" />
              <p className="text-xs text-muted-foreground mt-1">
                {completedMilestones} / {progress.roadmapData.milestones.length} {t('roadmap.milestones') || 'milestones completed'}
              </p>
            </div>
            <motion.span
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="text-3xl font-orbitron font-bold text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.8)]"
            >
              {overallProgress}%
            </motion.span>
          </div>
        </motion.div>

        {/* Milestones */}
        <div className="space-y-6">
          {progress.roadmapData.milestones.map((milestone, mIndex) => {
            const completedTasks = milestone.tasks.filter(t => t.isCompleted).length;
            const milestoneProgress = Math.round((completedTasks / milestone.tasks.length) * 100);
            const isExpanded = expandedMilestone === milestone.id;
            const isMilestoneComplete = milestone.tasks.every(t => t.isCompleted);

            return (
              <motion.div
                key={milestone.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: mIndex * 0.1 }}
                whileHover={{ scale: 1.01 }}
              >
                <Card className={`glass-card border-2 transition-all duration-300 ${
                  isMilestoneComplete 
                    ? 'border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]' 
                    : 'border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.2)]'
                }`}>
                  <CardHeader 
                    className="cursor-pointer hover:bg-white/5 transition-colors rounded-t-lg"
                    onClick={() => setExpandedMilestone(isExpanded ? null : milestone.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-2xl gradient-text flex items-center gap-2 font-orbitron">
                            {isMilestoneComplete && (
                              <motion.div
                                animate={{
                                  scale: [1, 1.2, 1],
                                  rotate: [0, 360],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                }}
                              >
                                <Sparkles className="w-6 h-6 text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                              </motion.div>
                            )}
                            {milestone.title}
                          </CardTitle>
                          <Badge variant="outline" className="border-primary/50">
                            {completedTasks}/{milestone.tasks.length}
                          </Badge>
                        </div>
                        <CardDescription className="text-base">{milestone.description}</CardDescription>
                        <div className="flex items-center gap-2 mt-3">
                          <Progress value={milestoneProgress} className="flex-1 h-3 shadow-[0_0_10px_rgba(var(--primary),0.2)]" />
                          <span className="text-lg font-semibold text-primary">{milestoneProgress}%</span>
                        </div>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="w-6 h-6" />
                      </motion.div>
                    </div>
                  </CardHeader>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CardContent className="space-y-3 pt-4">
                          {milestone.tasks.map((task, tIndex) => (
                            <motion.div
                              key={task.id}
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: tIndex * 0.05 }}
                              whileHover={{ scale: 1.02, x: 5 }}
                              className={`p-4 rounded-lg border-2 ${
                                task.isCompleted 
                                  ? 'bg-green-500/10 border-green-500/40 shadow-[0_0_15px_rgba(34,197,94,0.2)]' 
                                  : 'bg-white/5 border-primary/20 hover:border-primary/40 shadow-[0_0_10px_rgba(var(--primary),0.1)]'
                              } transition-all duration-300`}
                            >
                              <div className="flex items-start gap-3">
                                <Checkbox
                                  checked={task.isCompleted}
                                  onCheckedChange={() => handleTaskComplete(milestone.id, task.id, task.isCompleted)}
                                  className="mt-1 border-primary/50"
                                />
                                <div className="flex-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <h4 className={`font-semibold flex items-center gap-2 text-base ${
                                      task.isCompleted ? 'line-through text-muted-foreground' : ''
                                    }`}>
                                      {getTaskIcon(task.type)}
                                      {task.title}
                                    </h4>
                                    <motion.div
                                      whileHover={{ scale: 1.1 }}
                                    >
                                      <Badge variant="secondary" className="text-xs bg-primary/20 border border-primary/30">
                                        <Zap className="w-3 h-3 mr-1" />
                                        +{task.xpReward} XP
                                      </Badge>
                                    </motion.div>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-2">
                                    {task.description}
                                  </p>
                                  <Badge variant="outline" className="mt-2 text-xs border-primary/30">
                                    {task.type === 'learning' && '📘 Learning'}
                                    {task.type === 'practice' && '⚙️ Practice'}
                                    {task.type === 'self-assessment' && '🧠 Self-Assessment'}
                                  </Badge>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                          
                          {isMilestoneComplete && (
                            <motion.div
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="text-center p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border-2 border-green-500/40 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                            >
                              <motion.div
                                animate={{
                                  scale: [1, 1.2, 1],
                                  rotate: [0, 360],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                }}
                              >
                                <Sparkles className="w-12 h-12 mx-auto mb-3 text-green-500" />
                              </motion.div>
                              <p className="font-orbitron font-bold text-lg text-green-400 mb-1">
                                🎉 {t('roadmap.milestoneComplete') || 'Milestone Complete!'}
                              </p>
                              <p className="text-sm text-green-300">
                                Bonus: +{milestone.xpReward} XP
                              </p>
                            </motion.div>
                          )}
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};