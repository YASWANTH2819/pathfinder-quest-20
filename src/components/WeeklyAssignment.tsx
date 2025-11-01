import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { FileText, Upload, CheckCircle, Calendar, Trophy, File, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ConfettiEffect } from './ConfettiEffect';
import { Progress } from '@/components/ui/progress';

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF, DOCX, JPG, or PNG file');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error('File size must be less than 20MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleSubmit = async () => {
    if (!submission.trim() && !selectedFile) {
      toast.error('Please provide a submission text or upload a file');
      return;
    }

    if (!assignment) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      let fileUrl = null;

      // Upload file if selected
      if (selectedFile) {
        const weekStart = getWeekStart();
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${userId}/${weekStart}_${Date.now()}.${fileExt}`;
        
        setUploadProgress(30);

        const { error: uploadError } = await supabase.storage
          .from('assignment-submissions')
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;

        setUploadProgress(60);

        const { data: urlData } = supabase.storage
          .from('assignment-submissions')
          .getPublicUrl(fileName);

        fileUrl = urlData.publicUrl;
      }

      setUploadProgress(80);

      // Award badge for weekly completion
      const weekStart = getWeekStart();
      await supabase.from('user_badges').insert({
        user_id: userId,
        badge_code: `weekly_${weekStart}`,
        badge_name: 'Weekly Assignment Complete',
        badge_description: `Completed: ${assignment.title}${fileUrl ? ' (File uploaded)' : ''}`,
        icon_name: 'FileText'
      });

      // Award XP
      onXPEarned(assignment.xpReward);
      
      setUploadProgress(100);
      setIsSubmitted(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
      
      toast.success('🎉 Assignment submitted successfully!');
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast.error('Failed to submit assignment');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
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
            <div className="space-y-6 pt-6 border-t border-border/50">
              <h4 className="font-semibold text-lg">Your Submission:</h4>
              
              {/* Text Submission */}
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Written Submission or Links</label>
                <Textarea
                  placeholder="Paste your work, GitHub link, or brief summary here..."
                  value={submission}
                  onChange={(e) => setSubmission(e.target.value)}
                  rows={6}
                  className="resize-none bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-colors"
                  disabled={isUploading}
                />
              </div>

              {/* File Upload */}
              <div className="space-y-3">
                <label className="text-sm text-muted-foreground">Upload File (Optional)</label>
                <div className="flex items-center gap-3">
                  <Input
                    type="file"
                    onChange={handleFileSelect}
                    accept=".pdf,.docx,.jpg,.jpeg,.png"
                    className="hidden"
                    id="file-upload"
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-border/50 rounded-lg cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group"
                  >
                    <File className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
                      {selectedFile ? 'Change File' : 'Choose File (.pdf, .docx, .jpg, .png)'}
                    </span>
                  </label>
                </div>

                {/* Selected File Display */}
                {selectedFile && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <File className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium truncate max-w-[200px]">{selectedFile.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveFile}
                      className="h-8 w-8 p-0 hover:bg-destructive/10"
                      disabled={isUploading}
                    >
                      <X className="w-4 h-4 text-destructive" />
                    </Button>
                  </motion.div>
                )}
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Uploading...</span>
                    <span className="font-medium text-primary">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </motion.div>
              )}

              {/* Submit Button */}
              <Button 
                onClick={handleSubmit}
                disabled={isUploading || (!submission.trim() && !selectedFile)}
                className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 h-12 text-base font-semibold rounded-xl"
              >
                {isUploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    Submit Assignment
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Supported formats: PDF, DOCX, JPG, PNG (Max 20MB)
              </p>
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
