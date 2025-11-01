import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Target, 
  BookOpen, 
  Code, 
  Award,
  CheckCircle,
  Circle,
  ArrowLeft,
  Zap,
  Star,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
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
}

interface RoadmapViewProps {
  career: CareerOption;
  progress: CareerProgress;
  onBack: () => void;
}

interface RoadmapTask {
  task: string;
  duration: string;
  type: string;
  resources: string[];
  description: string;
  completed?: boolean;
}

export const RoadmapView: React.FC<RoadmapViewProps> = ({ career, progress, onBack }) => {
  const { user } = useAuth();
  const [currentXP, setCurrentXP] = useState(progress.xp || 0);
  const [currentLevel, setCurrentLevel] = useState(Math.floor((progress.xp || 0) / 100) + 1);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const roadmap = progress.roadmap_data || {
    shortTerm: [],
    midTerm: [],
    longTerm: [],
    explanation: 'Your personalized roadmap is being generated...'
  };

  const handleTaskComplete = async (task: RoadmapTask, phase: string) => {
    if (!user) return;

    const taskKey = `${phase}-${task.task}`;
    if (completedTasks.has(taskKey)) return;

    const xpGain = 25;
    const newXP = currentXP + xpGain;
    const newLevel = Math.floor(newXP / 100) + 1;

    try {
      const { error } = await supabase
        .from('career_progress')
        .update({
          xp: newXP,
          last_activity_date: new Date().toISOString().split('T')[0]
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setCompletedTasks(prev => new Set([...prev, taskKey]));
      setCurrentXP(newXP);
      
      if (newLevel > currentLevel) {
        setCurrentLevel(newLevel);
        toast.success(`🎉 Level Up! You've reached Level ${newLevel}!`, {
          description: 'Keep up the great work on your career journey!'
        });
      } else {
        toast.success(`+${xpGain} XP earned! 🌟`, {
          description: 'Great progress on your learning journey!'
        });
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  };

  const renderTask = (task: RoadmapTask, index: number, phase: string) => {
    const taskKey = `${phase}-${task.task}`;
    const isCompleted = completedTasks.has(taskKey);

    const typeIcons: Record<string, any> = {
      skill: BookOpen,
      project: Code,
      certification: Award,
      internship: Target,
      default: Circle
    };

    const Icon = typeIcons[task.type] || typeIcons.default;

    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <Card className={`p-4 mb-3 ${isCompleted ? 'bg-green-500/10 border-green-500/30' : 'glass-card'}`}>
          <div className="flex items-start space-x-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              isCompleted ? 'bg-green-500' : 'bg-gradient-to-r from-primary to-secondary'
            }`}>
              {isCompleted ? (
                <CheckCircle className="w-5 h-5 text-white" />
              ) : (
                <Icon className="w-5 h-5 text-white" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold">{task.task}</h4>
                  <p className="text-sm text-muted-foreground">{task.description}</p>
                </div>
                <Badge variant="outline" className="ml-2">
                  {task.duration}
                </Badge>
              </div>

              {task.resources && task.resources.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Resources:</p>
                  <div className="flex flex-wrap gap-2">
                    {task.resources.map((resource, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {resource}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {!isCompleted && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleTaskComplete(task, phase)}
                  className="mt-2"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark Complete
                </Button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  const levelProgress = ((currentXP % 100) / 100) * 100;

  return (
    <div className="min-h-screen cyber-grid p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold gradient-text-rainbow">
                  {career.career_name} Journey
                </h1>
                <p className="text-sm text-muted-foreground">
                  Level {currentLevel} • {currentXP} XP
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-semibold">Level {currentLevel}</p>
                <p className="text-xs text-muted-foreground">
                  {currentXP % 100}/100 XP to Level {currentLevel + 1}
                </p>
              </div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                <Trophy className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Progress value={levelProgress} className="h-3" />
          </div>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass-card p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{currentXP}</p>
                <p className="text-sm text-muted-foreground">Total XP</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{progress.streak_count || 0}</p>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedTasks.size}</p>
                <p className="text-sm text-muted-foreground">Tasks Done</p>
              </div>
            </div>
          </Card>
        </div>

        {/* AI Explanation */}
        {roadmap.explanation && (
          <Card className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Target className="w-5 h-5 mr-2 text-primary" />
              Your Personalized Roadmap
            </h3>
            <p className="text-muted-foreground whitespace-pre-line">
              {roadmap.explanation}
            </p>
          </Card>
        )}

        {/* Roadmap Tabs */}
        <Card className="glass-card p-6">
          <Tabs defaultValue="short" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="short">
                Short Term (0-3 months)
              </TabsTrigger>
              <TabsTrigger value="mid">
                Mid Term (3-6 months)
              </TabsTrigger>
              <TabsTrigger value="long">
                Long Term (6+ months)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="short" className="mt-6">
              {roadmap.shortTerm && roadmap.shortTerm.length > 0 ? (
                roadmap.shortTerm.map((task: RoadmapTask, index: number) =>
                  renderTask(task, index, 'short')
                )
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No tasks available yet. Check back soon!
                </p>
              )}
            </TabsContent>

            <TabsContent value="mid" className="mt-6">
              {roadmap.midTerm && roadmap.midTerm.length > 0 ? (
                roadmap.midTerm.map((task: RoadmapTask, index: number) =>
                  renderTask(task, index, 'mid')
                )
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No tasks available yet. Check back soon!
                </p>
              )}
            </TabsContent>

            <TabsContent value="long" className="mt-6">
              {roadmap.longTerm && roadmap.longTerm.length > 0 ? (
                roadmap.longTerm.map((task: RoadmapTask, index: number) =>
                  renderTask(task, index, 'long')
                )
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No tasks available yet. Check back soon!
                </p>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};
