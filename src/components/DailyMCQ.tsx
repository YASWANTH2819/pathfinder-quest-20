import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Trophy, Sparkles, ChevronLeft, ChevronRight, Send, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ConfettiEffect } from './ConfettiEffect';

interface MCQ {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  xpReward: number;
  difficulty: string;
}

interface DailyMCQProps {
  userId: string;
  careerName: string;
  onXPEarned: (xp: number) => void;
}

export const DailyMCQ = ({ userId, careerName, onXPEarned }: DailyMCQProps) => {
  const [mcqList, setMcqList] = useState<MCQ[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetchDailyMCQs();
  }, [careerName]);

  const fetchDailyMCQs = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('daily_mcqs')
        .select('*')
        .eq('career_name', careerName)
        .limit(10);

      if (error) {
        console.error('Error fetching MCQs:', error);
        toast.error('Failed to load today\'s quiz');
        return;
      }

      if (data && data.length > 0) {
        const shuffled = data.sort(() => 0.5 - Math.random()).slice(0, 10);
        setMcqList(shuffled.map(mcq => ({
          id: mcq.id,
          question: mcq.question,
          options: mcq.options as string[],
          correctAnswer: mcq.correct_answer,
          xpReward: mcq.xp_reward,
          difficulty: mcq.difficulty
        })));
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    if (showResults) return;
    
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleSubmitQuiz = async () => {
    let correctCount = 0;
    const totalXP = mcqList.reduce((total, mcq, index) => {
      const isCorrect = answers[index] === mcq.correctAnswer;
      if (isCorrect) {
        correctCount++;
        return total + mcq.xpReward;
      }
      return total;
    }, 0);

    setScore(correctCount);
    setShowResults(true);
    
    // Show fireworks for completion
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
    
    if (onXPEarned) {
      onXPEarned(totalXP);
    }

    // Save all responses
    try {
      const responses = mcqList.map((mcq, index) => ({
        user_id: userId,
        mcq_id: mcq.id,
        selected_answer: answers[index] || '',
        is_correct: answers[index] === mcq.correctAnswer,
        xp_earned: answers[index] === mcq.correctAnswer ? mcq.xpReward : 0
      }));

      await supabase.from('user_mcq_responses').insert(responses);
      
      toast.success(`Quiz Complete! You scored ${correctCount}/10 🎉`);
    } catch (error) {
      console.error('Error saving responses:', error);
    }
  };

  if (loading) {
    return (
      <Card className="glass-card p-6">
        <div className="text-center">Loading your daily quiz...</div>
      </Card>
    );
  }

  if (mcqList.length === 0) {
    return (
      <Card className="glass-card p-6">
        <div className="text-center text-muted-foreground">
          No quiz available for today. Check back tomorrow!
        </div>
      </Card>
    );
  }

  const currentMCQ = mcqList[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const canSubmit = answeredCount === mcqList.length;

  return (
    <>
      <ConfettiEffect trigger={showConfetti} type="fireworks" />
      
      <div className="space-y-4">
        {/* Progress Bar */}
        <Card className="glass-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Question {currentIndex + 1} of {mcqList.length}</span>
            <span className="text-sm text-muted-foreground">{answeredCount}/{mcqList.length} answered</span>
          </div>
          <Progress value={(answeredCount / mcqList.length) * 100} className="h-2" />
        </Card>

        {!showResults ? (
          <>
            {/* Current Question */}
            <Card className="glass-card p-6">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Question Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-3">
                      {currentMCQ.difficulty}
                    </Badge>
                    <h3 className="text-lg font-medium mb-4">{currentMCQ.question}</h3>
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {currentMCQ.options.map((option: string, index: number) => {
                    const isSelected = answers[currentIndex] === option;
                    let optionClass = 'glass-card p-4 cursor-pointer transition-all hover:border-primary/50';
                    
                    if (isSelected) {
                      optionClass += ' border-primary bg-primary/10 animate-pulse-glow';
                    }

                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={optionClass}
                        onClick={() => handleAnswerSelect(currentIndex, option)}
                        whileHover={{ scale: 1.01, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-primary bg-primary' : 'border-muted-foreground'
                          }`}>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                          </div>
                          <span className="flex-1">{option}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {answers[currentIndex] && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
                      <p className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Good enough! Keep going! 💪
                      </p>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
                className="relative overflow-hidden border-2 border-blue-500/50 bg-transparent hover:bg-blue-500/10 hover:border-blue-500 text-foreground hover:scale-105 transition-all duration-300 group"
              >
                <span className="relative z-10 flex items-center">
                  <ChevronLeft className="w-5 h-5 mr-1 group-hover:-translate-x-1 transition-transform" />
                  Previous
                </span>
              </Button>

              {currentIndex < mcqList.length - 1 ? (
                <Button
                  onClick={() => setCurrentIndex(currentIndex + 1)}
                  disabled={!answers[currentIndex]}
                  className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(168,85,247,0.7)] border-2 border-white/30 hover:border-white/50 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 group"
                >
                  <span className="relative z-10 flex items-center">
                    Next Question
                    <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </Button>
              ) : (
                <Button
                  onClick={handleSubmitQuiz}
                  disabled={!canSubmit}
                  className="relative overflow-hidden bg-gradient-to-r from-green-500 via-emerald-500 to-blue-500 hover:from-green-600 hover:via-emerald-600 hover:to-blue-600 text-white font-bold shadow-[0_0_20px_rgba(34,197,94,0.5)] hover:shadow-[0_0_30px_rgba(16,185,129,0.7)] border-2 border-white/30 hover:border-white/50 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 group"
                >
                  <span className="relative z-10 flex items-center">
                    <Send className="w-5 h-5 mr-2" />
                    Submit Quiz
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </Button>
              )}
            </div>
          </>
        ) : (
          /* Results View */
          <Card className="glass-card p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                <Trophy className="w-12 h-12 text-white" />
              </div>
              
              <div>
                <h2 className="text-3xl font-bold gradient-text-rainbow mb-2">
                  Quiz Complete! 🎉
                </h2>
                <p className="text-xl font-semibold">
                  You scored {score} out of {mcqList.length}
                </p>
                <p className="text-muted-foreground mt-2">
                  {score === 10 && "Perfect score! You're absolutely crushing it! 🏆"}
                  {score >= 7 && score < 10 && "Excellent work! Keep it up! 🌟"}
                  {score >= 5 && score < 7 && "Good effort! Practice makes perfect! 💪"}
                  {score < 5 && "Keep learning! You'll get better! 📚"}
                </p>
              </div>

              {/* Review Answers */}
              <div className="space-y-3 text-left mt-6">
                <h3 className="font-semibold mb-3">Review Your Answers:</h3>
                {mcqList.map((mcq, index) => {
                  const userAnswer = answers[index];
                  const isCorrect = userAnswer === mcq.correctAnswer;
                  
                  return (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border ${
                        isCorrect 
                          ? 'bg-green-500/10 border-green-500/30' 
                          : 'bg-red-500/10 border-red-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm font-medium flex-1">Q{index + 1}: {mcq.question}</p>
                        {isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Your answer: <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>{userAnswer || 'Not answered'}</span>
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-muted-foreground">
                          Correct answer: <span className="text-green-600">{mcq.correctAnswer}</span>
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <Button
                onClick={() => {
                  setShowResults(false);
                  setAnswers({});
                  setCurrentIndex(0);
                  fetchDailyMCQs();
                }}
                className="relative overflow-hidden w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white font-bold shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:shadow-[0_0_30px_rgba(168,85,247,0.7)] border-2 border-white/30 hover:border-white/50 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 group"
              >
                <span className="relative z-10 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 mr-2 group-hover:rotate-[-360deg] transition-transform duration-700" />
                  Take Another Quiz
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
              </Button>
            </motion.div>
          </Card>
        )}
      </div>
    </>
  );
};
