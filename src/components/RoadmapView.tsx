import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  CheckCircle, 
  Circle, 
  BookOpen,
  Trophy,
  Target,
  Zap,
  Lock
} from 'lucide-react';
import { DailyMCQ } from './DailyMCQ';
import { BadgeDisplay } from './BadgeDisplay';
import { StreakTracker } from './StreakTracker';
import { WeeklyAssignment } from './WeeklyAssignment';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CareerOption {
  id: string;
  career_name: string;
  description: string;
  match_percentage: number;
  required_skills: string[];
}

interface CareerProgress {
  id: string;
  selected_career_id: string;
  selected_career_name: string;
  xp: number;
  streak_count: number;
  roadmap_data: any;
  last_activity_date?: string;
}

interface RoadmapViewProps {
  career: CareerOption;
  progress: CareerProgress;
  onBack: () => void;
}

interface RoadmapStep {
  title: string;
  description: string;
  completed: boolean;
  resources?: string[];
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({ career, progress, onBack }) => {
  const { user } = useAuth();
  const [currentProgress, setCurrentProgress] = useState(progress);
  const [activeView, setActiveView] = useState<'roadmap' | 'quiz' | 'assignment' | 'badges'>('roadmap');
  
  const roadmapData = currentProgress.roadmap_data || {};
  const steps = roadmapData.steps || [];
  const completedSteps = steps.filter((step: RoadmapStep) => step.completed).length;
  const totalSteps = steps.length;
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  useEffect(() => {
    if (user) {
      updateLastActivity();
    }
  }, [user]);

  const updateLastActivity = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const lastActivity = currentProgress.last_activity_date;

    let newStreakCount = currentProgress.streak_count || 0;
    
    if (lastActivity) {
      const lastDate = new Date(lastActivity);
      const todayDate = new Date(today);
      const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        newStreakCount += 1;
      } else if (diffDays > 1) {
        newStreakCount = 1;
      }
    } else {
      newStreakCount = 1;
    }

    const { data, error } = await supabase
      .from('career_progress')
      .update({
        last_activity_date: today,
        streak_count: newStreakCount
      })
      .eq('user_id', user.id)
      .eq('id', currentProgress.id)
      .select()
      .single();

    if (!error && data) {
      setCurrentProgress(data);
      
      if (newStreakCount === 7) {
        await awardBadge('week_streak', '7 Day Streak', 'Maintained a 7-day learning streak!', 'Flame');
      } else if (newStreakCount === 30) {
        await awardBadge('month_streak', '30 Day Streak', 'Incredible! 30 days of consistent learning!', 'Crown');
      }
    }
  };

  const handleXPEarned = async (xp: number) => {
    if (!user) return;

    const newXP = (currentProgress.xp || 0) + xp;

    const { data, error } = await supabase
      .from('career_progress')
      .update({ xp: newXP })
      .eq('user_id', user.id)
      .eq('id', currentProgress.id)
      .select()
      .single();

    if (!error && data) {
      setCurrentProgress(data);
      
      if (newXP >= 100 && (currentProgress.xp || 0) < 100) {
        await awardBadge('xp_100', '100 XP Milestone', 'Earned your first 100 XP!', 'Zap');
      } else if (newXP >= 500 && (currentProgress.xp || 0) < 500) {
        await awardBadge('xp_500', '500 XP Milestone', 'Amazing! 500 XP achieved!', 'Trophy');
      } else if (newXP >= 1000 && (currentProgress.xp || 0) < 1000) {
        await awardBadge('xp_1000', '1000 XP Master', 'You are a learning master!', 'Crown');
      }
    }
  };

  const awardBadge = async (badgeCode: string, badgeName: string, description: string, iconName: string) => {
    if (!user) return;

    const { data: existing } = await supabase
      .from('user_badges')
      .select('id')
      .eq('user_id', user.id)
      .eq('badge_code', badgeCode)
      .single();

    if (!existing) {
      await supabase.from('user_badges').insert({
        user_id: user.id,
        badge_code: badgeCode,
        badge_name: badgeName,
        badge_description: description,
        icon_name: iconName
      });

      toast.success(`🏆 New Badge Unlocked: ${badgeName}!`);
    }
  };

  return (
    <div className="min-h-screen cyber-grid p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold gradient-text-rainbow">
                  {career.career_name} Journey
                </h1>
                <p className="text-sm text-muted-foreground">
                  Level 1: Getting Started
                </p>
              </div>
            </div>

            <Badge variant="secondary" className="bg-primary/20">
              {career.match_percentage}% Match
            </Badge>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Overall Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
          </div>
        </Card>

        {/* View Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border-b border-primary/20 pb-2">
          <Button
            variant={activeView === 'roadmap' ? 'default' : 'ghost'}
            onClick={() => setActiveView('roadmap')}
            className={`relative overflow-hidden w-full rounded-xl transition-all duration-300 ${
              activeView === 'roadmap' 
                ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold shadow-[0_0_20px_rgba(59,130,246,0.5)] border-2 border-white/30 hover:scale-105' 
                : 'border-2 border-transparent hover:border-primary/50 hover:bg-primary/5 hover:scale-105'
            }`}
          >
            <Target className="w-5 h-5 mr-2" />
            Roadmap
            {activeView === 'roadmap' && (
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer-slide"></div>
            )}
          </Button>
          <Button
            variant={activeView === 'quiz' ? 'default' : 'ghost'}
            onClick={() => setActiveView('quiz')}
            className={`relative overflow-hidden w-full rounded-xl transition-all duration-300 ${
              activeView === 'quiz' 
                ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold shadow-[0_0_20px_rgba(59,130,246,0.5)] border-2 border-white/30 hover:scale-105' 
                : 'border-2 border-transparent hover:border-primary/50 hover:bg-primary/5 hover:scale-105'
            }`}
          >
            <Zap className="w-5 h-5 mr-2" />
            Daily Quiz
            {activeView === 'quiz' && (
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer-slide"></div>
            )}
          </Button>
          <Button
            variant={activeView === 'assignment' ? 'default' : 'ghost'}
            onClick={() => setActiveView('assignment')}
            className={`relative overflow-hidden w-full rounded-xl transition-all duration-300 ${
              activeView === 'assignment' 
                ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold shadow-[0_0_20px_rgba(59,130,246,0.5)] border-2 border-white/30 hover:scale-105' 
                : 'border-2 border-transparent hover:border-primary/50 hover:bg-primary/5 hover:scale-105'
            }`}
          >
            <BookOpen className="w-5 h-5 mr-2" />
            Assignment
            {activeView === 'assignment' && (
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer-slide"></div>
            )}
          </Button>
          <Button
            variant={activeView === 'badges' ? 'default' : 'ghost'}
            onClick={() => setActiveView('badges')}
            className={`relative overflow-hidden w-full rounded-xl transition-all duration-300 ${
              activeView === 'badges' 
                ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-bold shadow-[0_0_20px_rgba(59,130,246,0.5)] border-2 border-white/30 hover:scale-105' 
                : 'border-2 border-transparent hover:border-primary/50 hover:bg-primary/5 hover:scale-105'
            }`}
          >
            <Trophy className="w-5 h-5 mr-2" />
            Badges
            {activeView === 'badges' && (
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer-slide"></div>
            )}
          </Button>
        </div>

        {/* Streak & Progress Stats */}
        {user && (
          <StreakTracker 
            streakCount={currentProgress.streak_count || 0}
            xp={currentProgress.xp || 0}
            lastActivityDate={currentProgress.last_activity_date}
          />
        )}

        {/* Content based on active view */}
        {activeView === 'roadmap' && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold gradient-text-rainbow">Your Learning Path</h3>
            {steps.map((step: RoadmapStep, index: number) => {
              const isLocked = index > 0 && !steps[index - 1].completed;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`glass-card p-4 ${
                    step.completed 
                      ? 'border-green-500/50' 
                      : isLocked 
                      ? 'border-gray-500/30 opacity-60' 
                      : 'border-primary/30'
                  }`}>
                    <div className="flex items-start space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        step.completed 
                          ? 'bg-green-500/20 text-green-400' 
                          : isLocked
                          ? 'bg-gray-500/20 text-gray-400'
                          : 'bg-primary/20 text-primary'
                      }`}>
                        {step.completed ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : isLocked ? (
                          <Lock className="w-5 h-5" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold mb-1">{step.title}</h4>
                          {isLocked && (
                            <Badge variant="outline" className="text-xs">
                              Complete previous step
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                        
                        {step.resources && step.resources.length > 0 && !isLocked && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {step.resources.map((resource: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                <BookOpen className="w-3 h-3 mr-1" />
                                {resource}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        {!step.completed && !isLocked && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="relative overflow-hidden mt-2 border-2 border-green-500/50 bg-transparent hover:bg-green-500/10 hover:border-green-500 text-foreground hover:scale-105 transition-all duration-300 group"
                            onClick={() => toast.info('Mark this step complete in your learning journey!')}
                          >
                            <span className="relative z-10 flex items-center">
                              <CheckCircle className="w-4 h-4 mr-1 group-hover:scale-110 transition-transform" />
                              Mark Complete
                            </span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {activeView === 'quiz' && user && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold gradient-text-rainbow">Today's Challenge - 10 Questions</h3>
            <DailyMCQ 
              userId={user.id}
              careerName={career.career_name}
              onXPEarned={handleXPEarned}
            />
          </div>
        )}

        {activeView === 'assignment' && user && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold gradient-text-rainbow">Weekly Assignment</h3>
            <WeeklyAssignment
              userId={user.id}
              careerName={career.career_name}
              onXPEarned={handleXPEarned}
            />
          </div>
        )}

        {activeView === 'badges' && user && (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold gradient-text-rainbow">Your Achievements</h3>
            <BadgeDisplay userId={user.id} />
          </div>
        )}
      </div>
    </div>
  );
};
