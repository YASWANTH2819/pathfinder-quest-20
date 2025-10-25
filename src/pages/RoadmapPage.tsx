import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Target
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
        toast({
          title: `+${xpChange + milestoneXP} XP!`,
          description: milestoneCompleted ? '🎉 Milestone completed!' : 'Task completed!',
        });

        // Special streak animations
        if (newStreak === 7 || newStreak === 14 || newStreak === 30) {
          toast({
            title: `🔥 ${newStreak} Day Streak!`,
            description: 'Amazing consistency! Keep it up!',
          });
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
      case 'learning': return '📘';
      case 'practice': return '⚙️';
      case 'self-assessment': return '🧠';
      default: return '📌';
    }
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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Career Selection View
  if (!progress || !progress.selectedCareerId) {
    if (careerOptions.length === 0) {
      return (
        <div className="min-h-screen cyber-grid">
          <div className="container mx-auto px-4 py-8">
            <Button
              variant="glass"
              size="icon"
              onClick={() => navigate('/main')}
              className="mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <Card className="glass-card p-8 max-w-2xl mx-auto text-center">
              <Target className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold gradient-text mb-4">
                {t('roadmap.noCareerOptions') || 'No Career Options Yet'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {t('roadmap.completeGuidance') || 'Please complete the Career Guidance module first to get personalized career recommendations.'}
              </p>
              <Button variant="cyber" onClick={() => navigate('/career-guide')}>
                {t('roadmap.goToGuidance') || 'Go to Career Guidance'}
              </Button>
            </Card>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen cyber-grid">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="glass"
            size="icon"
            onClick={() => navigate('/main')}
            className="mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-8 text-center"
          >
            <h1 className="text-4xl font-orbitron font-bold gradient-text mb-2">
              {t('roadmap.selectCareer') || 'Select Your Career Path'}
            </h1>
            <p className="text-muted-foreground">
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
              >
                <Card className="glass-card h-full hover:shadow-glow transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-xl gradient-text">
                        {career.career_name}
                      </CardTitle>
                      <Badge variant="secondary" className="bg-primary/20 text-primary">
                        {career.match_percentage}% Match
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">
                      {career.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {t('roadmap.keySkills') || 'Key Skills:'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {career.required_skills?.slice(0, 5).map((skill, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
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
                        className="w-full"
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

  return (
    <div className="min-h-screen cyber-grid">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="glass"
            size="icon"
            onClick={() => navigate('/main')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          {/* XP and Streak Display */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 glass-card rounded-full">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="font-orbitron font-bold">{progress.xp} XP</span>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2 glass-card rounded-full">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="font-orbitron font-bold">{progress.streakCount} 🔥</span>
            </div>
          </div>
        </div>

        {/* Career Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-orbitron font-bold gradient-text mb-2">
            {progress.selectedCareerName}
          </h1>
          <div className="flex items-center gap-4">
            <Progress value={overallProgress} className="flex-1 h-3" />
            <span className="text-xl font-orbitron font-bold text-[hsl(var(--cyber-green))]">
              {overallProgress}%
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {completedMilestones} / {progress.roadmapData.milestones.length} {t('roadmap.milestones') || 'milestones completed'}
          </p>
        </motion.div>

        {/* Milestones */}
        <div className="space-y-4">
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
              >
                <Card className={`glass-card ${isMilestoneComplete ? 'border-green-500/50' : ''}`}>
                  <CardHeader 
                    className="cursor-pointer hover:bg-white/5 transition-colors"
                    onClick={() => setExpandedMilestone(isExpanded ? null : milestone.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl gradient-text flex items-center gap-2">
                            {isMilestoneComplete && <Sparkles className="w-5 h-5 text-green-500" />}
                            {milestone.title}
                          </CardTitle>
                          <Badge variant="outline">
                            {completedTasks}/{milestone.tasks.length}
                          </Badge>
                        </div>
                        <CardDescription>{milestone.description}</CardDescription>
                        <div className="flex items-center gap-2 mt-2">
                          <Progress value={milestoneProgress} className="flex-1 h-2" />
                          <span className="text-sm font-semibold">{milestoneProgress}%</span>
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp /> : <ChevronDown />}
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
                        <CardContent className="space-y-3">
                          {milestone.tasks.map((task) => (
                            <div
                              key={task.id}
                              className={`p-4 rounded-lg border ${
                                task.isCompleted 
                                  ? 'bg-green-500/10 border-green-500/30' 
                                  : 'bg-white/5 border-white/10'
                              } transition-all duration-300`}
                            >
                              <div className="flex items-start gap-3">
                                <Checkbox
                                  checked={task.isCompleted}
                                  onCheckedChange={() => handleTaskComplete(milestone.id, task.id, task.isCompleted)}
                                  className="mt-1"
                                />
                                <div className="flex-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <h4 className={`font-semibold flex items-center gap-2 ${
                                      task.isCompleted ? 'line-through text-muted-foreground' : ''
                                    }`}>
                                      <span>{getTaskIcon(task.type)}</span>
                                      {task.title}
                                    </h4>
                                    <Badge variant="secondary" className="text-xs">
                                      +{task.xpReward} XP
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {task.description}
                                  </p>
                                  <Badge variant="outline" className="mt-2 text-xs">
                                    {task.type}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {isMilestoneComplete && (
                            <div className="text-center p-4 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg border border-green-500/30">
                              <Sparkles className="w-8 h-8 mx-auto mb-2 text-green-500" />
                              <p className="font-semibold text-green-400">
                                🎉 {t('roadmap.milestoneComplete') || 'Milestone Complete!'} +{milestone.xpReward} XP
                              </p>
                            </div>
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