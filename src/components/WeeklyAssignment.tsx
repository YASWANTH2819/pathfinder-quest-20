import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import { FileText, Upload, CheckCircle, Calendar, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ConfettiEffect } from './ConfettiEffect';

interface WeeklyAssignmentProps {
  userId: string;
  careerName: string;
  onXPEarned: (xp: number) => void;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  instructions: string[];
  xpReward: number;
  deadline: string;
}

export const WeeklyAssignment: React.FC<WeeklyAssignmentProps> = ({ 
  userId, 
  careerName,
  onXPEarned 
}) => {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    loadWeeklyAssignment();
    checkSubmissionStatus();
  }, [careerName]);

  const loadWeeklyAssignment = () => {
    // Generate assignment based on career
    const assignments: Record<string, Assignment> = {
      'Product Manager': {
        id: '1',
        title: 'Product Strategy Case Study',
        description: 'Analyze a real-world product and create a strategic improvement plan',
        instructions: [
          'Select a product you use regularly',
          'Identify 3 key pain points',
          'Propose solutions with user impact analysis',
          'Create a prioritization matrix (Impact vs Effort)',
          'Write a 500-word product brief'
        ],
        xpReward: 50,
        deadline: getNextWeekDate()
      },
      'Data Analyst': {
        id: '2',
        title: 'Data Visualization Challenge',
        description: 'Create insights from a sample dataset',
        instructions: [
          'Download the provided sales dataset',
          'Clean and prepare the data',
          'Create 3 meaningful visualizations',
          'Write insights for each visualization',
          'Propose 2 business recommendations'
        ],
        xpReward: 50,
        deadline: getNextWeekDate()
      },
      'Software Engineer': {
        id: '3',
        title: 'Mini Project: Build a Todo API',
        description: 'Create a REST API with CRUD operations',
        instructions: [
          'Set up a basic REST API (any language)',
          'Implement Create, Read, Update, Delete endpoints',
          'Add input validation',
          'Write API documentation',
          'Share your GitHub repository link'
        ],
        xpReward: 50,
        deadline: getNextWeekDate()
      },
      'UI/UX Designer': {
        id: '4',
        title: 'App Redesign Challenge',
        description: 'Redesign a mobile app screen',
        instructions: [
          'Choose a popular app screen',
          'Identify UX problems',
          'Create wireframes for improvements',
          'Design high-fidelity mockups',
          'Explain your design decisions'
        ],
        xpReward: 50,
        deadline: getNextWeekDate()
      },
      'Business Analyst': {
        id: '5',
        title: 'Business Process Analysis',
        description: 'Analyze and optimize a business process',
        instructions: [
          'Select a business process to analyze',
          'Create an AS-IS process diagram',
          'Identify inefficiencies and bottlenecks',
          'Design a TO-BE improved process',
          'Calculate potential cost/time savings'
        ],
        xpReward: 50,
        deadline: getNextWeekDate()
      },
      'Marketing Manager': {
        id: '6',
        title: 'Marketing Campaign Strategy',
        description: 'Design a digital marketing campaign',
        instructions: [
          'Choose a product/service to promote',
          'Define target audience and personas',
          'Select 3 digital marketing channels',
          'Create a content calendar (1 month)',
          'Set KPIs and success metrics'
        ],
        xpReward: 50,
        deadline: getNextWeekDate()
      }
    };

    const careerAssignment = assignments[careerName] || assignments['Product Manager'];
    setAssignment(careerAssignment);
    setLoading(false);
  };

  const checkSubmissionStatus = async () => {
    // Check if already submitted this week
    const weekStart = getWeekStart();
    const { data } = await supabase
      .from('user_badges')
      .select('earned_at')
      .eq('user_id', userId)
      .eq('badge_code', `weekly_${weekStart}`)
      .single();

    if (data) {
      setIsSubmitted(true);
    }
  };

  const handleSubmit = async () => {
    if (!submission.trim()) {
      toast.error('Please provide your submission');
      return;
    }

    if (!assignment) return;

    try {
      // Award badge for weekly completion
      const weekStart = getWeekStart();
      await supabase.from('user_badges').insert({
        user_id: userId,
        badge_code: `weekly_${weekStart}`,
        badge_name: 'Weekly Assignment Complete',
        badge_description: `Completed: ${assignment.title}`,
        icon_name: 'FileText'
      });

      // Award XP
      onXPEarned(assignment.xpReward);
      
      setIsSubmitted(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      
      toast.success('🎉 Assignment submitted successfully!');
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast.error('Failed to submit assignment');
    }
  };

  if (loading || !assignment) {
    return (
      <Card className="glass-card p-6">
        <div className="text-center">Loading weekly assignment...</div>
      </Card>
    );
  }

  return (
    <>
      <ConfettiEffect trigger={showConfetti} type="celebration" />
      
      <Card className="glass-card p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold gradient-text-rainbow">{assignment.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{assignment.description}</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-purple-500/10">
              +{assignment.xpReward} XP
            </Badge>
          </div>

          {/* Deadline */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Due: {assignment.deadline}</span>
          </div>

          {/* Instructions */}
          <div className="space-y-3">
            <h4 className="font-semibold">Assignment Instructions:</h4>
            <ul className="space-y-2">
              {assignment.instructions.map((instruction, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-2"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold">{index + 1}</span>
                  </div>
                  <span className="text-sm">{instruction}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Submission Area */}
          {!isSubmitted ? (
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-semibold">Your Submission:</h4>
              <Textarea
                placeholder="Paste your work, GitHub link, or brief summary here..."
                value={submission}
                onChange={(e) => setSubmission(e.target.value)}
                rows={8}
                className="resize-none"
              />
              <Button 
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                <Upload className="w-4 h-4 mr-2" />
                Submit Assignment
              </Button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 bg-green-500/10 border border-green-500/30 rounded-lg text-center"
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h4 className="text-lg font-bold text-green-600 dark:text-green-400 mb-2">
                Assignment Completed! 🎉
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                Great work! You've earned {assignment.xpReward} XP
              </p>
              <Badge variant="outline" className="bg-green-500/10">
                <Trophy className="w-3 h-3 mr-1" />
                Weekly Badge Earned
              </Badge>
            </motion.div>
          )}
        </motion.div>
      </Card>
    </>
  );
};

function getNextWeekDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getWeekStart(): string {
  const date = new Date();
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  return date.toISOString().split('T')[0];
}
