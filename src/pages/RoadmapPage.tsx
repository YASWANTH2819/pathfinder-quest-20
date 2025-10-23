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
import { geminiService } from '@/services/geminiService';
import { useToast } from '@/hooks/use-toast';

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
  const [roadmapSteps, setRoadmapSteps] = useState<RoadmapStep[]>(mockRoadmapSteps);
  const [isGenerating, setIsGenerating] = useState(false);

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

    // Update career health score in localStorage (mock implementation)
    const profileData = JSON.parse(localStorage.getItem('career_profile_data') || '{}');
    if (profileData) {
      // This would trigger a health score recalculation in a real app
      toast({
        title: isCompleted ? "Step Completed!" : "Step Marked Incomplete",
        description: isCompleted 
          ? "Your career health score has been updated." 
          : "Your progress has been adjusted.",
      });
    }
  };

  const generateRoadmap = async () => {
    setIsGenerating(true);
    try {
      const profileData = JSON.parse(localStorage.getItem('career_profile_data') || '{}');
      
      if (!profileData.name) {
        toast({
          title: "Profile Required",
          description: "Please complete your career profile first.",
          variant: "destructive"
        });
        return;
      }

      // Generate roadmap using Gemini
      const roadmapPrompt = `
        Based on this profile: ${JSON.stringify(profileData)}
        
        Generate a detailed career roadmap with specific steps for the next 3 semesters.
        Each step should have:
        - Clear title and description
        - Type: skill, project, internship, or prep
        - Semester assignment (1, 2, or 3)
        - Recommended resources
        
        Format as JSON array with this structure:
        [
          {
            "title": "Step title",
            "description": "Detailed description",
            "type": "skill|project|internship|prep",
            "semester": 1,
            "recommendedResources": ["Resource 1", "Resource 2"]
          }
        ]
        
        Focus on practical, actionable steps for Indian students entering ${profileData.fieldOfStudy}.
      `;

      const generatedRoadmap = await geminiService.generateCareerResponse(profileData, roadmapPrompt, language);
      
      // Parse the response and create roadmap steps
      // This is a simplified version - in reality you'd parse the JSON response
      const newSteps: RoadmapStep[] = [
        {
          id: Date.now().toString(),
          userId: 'user1',
          title: 'Updated Learning Path',
          description: 'AI-generated roadmap based on your current profile',
          type: 'skill',
          semester: 1,
          isCompleted: false,
          recommendedResources: ['Generated Resource'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      setRoadmapSteps(prev => [...prev, ...newSteps]);
      
      toast({
        title: "Roadmap Generated!",
        description: "Your personalized career roadmap has been updated.",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate roadmap. Please try again.",
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