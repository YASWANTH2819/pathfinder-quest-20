import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Wand2, RefreshCw } from 'lucide-react';
import { RoadmapTimeline } from '@/components/RoadmapTimeline';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useLanguage } from '@/contexts/LanguageContext';
import { RoadmapStep } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Mock roadmap data for demo
const mockRoadmapSteps: RoadmapStep[] = [
  {
    id: '1',
    userId: 'user1',
    title: 'Master JavaScript Fundamentals',
    description: 'Learn ES6+, async/await, closures, and prototypes',
    type: 'skill',
    semester: 1,
    isCompleted: true,
    recommendedResources: ['MDN JavaScript Guide', 'JavaScript.info', 'FreeCodeCamp'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15'
  },
  {
    id: '2',
    userId: 'user1',
    title: 'Build Personal Portfolio Website',
    description: 'Create a responsive portfolio showcasing your projects',
    type: 'project',
    semester: 1,
    isCompleted: true,
    recommendedResources: ['React Documentation', 'Tailwind CSS', 'Vercel Deployment'],
    createdAt: '2024-01-01',
    updatedAt: '2024-02-01'
  },
  {
    id: '3',
    userId: 'user1',
    title: 'Learn React & State Management',
    description: 'Master React hooks, context API, and Redux toolkit',
    type: 'skill',
    semester: 2,
    isCompleted: false,
    recommendedResources: ['React Official Tutorial', 'Redux Toolkit Guide'],
    createdAt: '2024-02-01',
    updatedAt: '2024-02-01'
  },
  {
    id: '4',
    userId: 'user1',
    title: 'Frontend Development Internship',
    description: 'Apply for internships at startups or tech companies',
    type: 'internship',
    semester: 2,
    isCompleted: false,
    recommendedResources: ['LinkedIn', 'AngelList', 'Internshala'],
    createdAt: '2024-02-01',
    updatedAt: '2024-02-01'
  },
  {
    id: '5',
    userId: 'user1',
    title: 'Prepare for Technical Interviews',
    description: 'Practice data structures, algorithms, and system design',
    type: 'prep',
    semester: 3,
    isCompleted: false,
    recommendedResources: ['LeetCode', 'GeeksforGeeks', 'System Design Primer'],
    createdAt: '2024-03-01',
    updatedAt: '2024-03-01'
  }
];

export const RoadmapPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const [roadmapSteps, setRoadmapSteps] = useState<RoadmapStep[]>(mockRoadmapSteps);
  const [isGenerating, setIsGenerating] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // Fetch profile data from database
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        setIsLoadingProfile(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('career_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile:', error);
        } else if (data) {
          setProfileData(data);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  const completedSteps = roadmapSteps.filter(step => step.isCompleted).length;
  const progressPercentage = Math.round((completedSteps / roadmapSteps.length) * 100);

  const handleStepComplete = (stepId: string, isCompleted: boolean) => {
    setRoadmapSteps(prev => 
      prev.map(step => 
        step.id === stepId 
          ? { ...step, isCompleted, updatedAt: new Date().toISOString() }
          : step
      )
    );

    toast({
      title: isCompleted ? "Step Completed!" : "Step Marked Incomplete",
      description: isCompleted 
        ? "Your career health score has been updated." 
        : "Your progress has been adjusted.",
    });
  };

  const generateRoadmap = async () => {
    setIsGenerating(true);
    try {
      if (!profileData?.name) {
        toast({
          title: "Profile Required",
          description: "Please complete your career profile first.",
          variant: "destructive"
        });
        setIsGenerating(false);
        return;
      }

      // Call edge function to generate roadmap
      const { data, error } = await supabase.functions.invoke('generate-roadmap', {
        body: {
          profileData: profileData,
          goal: `Career roadmap for ${profileData.field_of_study || profileData.fieldOfStudy}`,
          language: language,
          userId: user?.id,
          systemPrompt: 'You are a career guidance expert. Create detailed, actionable roadmaps for Indian students.'
        }
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate roadmap');
      }

      if (data?.roadmap) {
        // Convert the AI-generated roadmap to our RoadmapStep format
        const allSteps: any[] = [
          ...(data.roadmap.shortTerm || []),
          ...(data.roadmap.midTerm || []),
          ...(data.roadmap.longTerm || [])
        ];

        const newSteps: RoadmapStep[] = allSteps.map((step, index) => ({
          id: `${Date.now()}-${index}`,
          userId: user?.id || 'guest',
          title: step.task || step.title || 'Career Step',
          description: step.description || '',
          type: step.type || 'skill',
          semester: Math.floor(index / 2) + 1, // Distribute across semesters
          isCompleted: false,
          recommendedResources: step.resources || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }));

        setRoadmapSteps(newSteps);
        
        toast({
          title: "Roadmap Generated!",
          description: data.explanation || "Your personalized career roadmap has been created.",
        });
      }
    } catch (error) {
      console.error('Roadmap generation error:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate roadmap. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen cyber-grid">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button
              variant="glass"
              size="icon"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-orbitron font-bold gradient-text">
                {t('roadmap.title')}
              </h1>
              <p className="text-muted-foreground mt-1">
                {t('roadmap.subtitle')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Button 
              variant="cyber" 
              onClick={generateRoadmap}
              disabled={isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
              {t('roadmap.generateRoadmap')}
            </Button>
          </div>
        </div>

        {/* Progress Overview */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="font-orbitron gradient-text">
                Progress Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold">
                  {completedSteps} of {roadmapSteps.length} steps completed
                </span>
                <span className="text-2xl font-orbitron font-bold text-[hsl(var(--cyber-green))]">
                  {progressPercentage}%
                </span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Roadmap Timeline */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <RoadmapTimeline
            steps={roadmapSteps}
            onStepComplete={handleStepComplete}
          />
        </motion.div>
      </div>
    </div>
  );
};