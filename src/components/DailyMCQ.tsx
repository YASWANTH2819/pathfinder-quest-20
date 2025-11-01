import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Zap, Trophy, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ConfettiEffect } from './ConfettiEffect';

interface MCQ {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  xp_reward: number;
  difficulty: string;
}

interface DailyMCQProps {
  userId: string;
  careerName: string;
  onXPEarned: (xp: number) => void;
}

export const DailyMCQ = ({ userId, careerName, onXPEarned }: DailyMCQProps) => {
  const [currentMCQ, setCurrentMCQ] = useState<MCQ | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerActive, setTimerActive] = useState(true);

  useEffect(() => {
    fetchDailyMCQ();
  }, [careerName]);

  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setTimerActive(false);
          if (!isAnswered) {
            toast.error('Time\'s up!');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerActive, timeLeft, isAnswered]);

  const fetchDailyMCQ = async () => {
    try {
      // Fetch a random MCQ for this career
      const { data, error } = await supabase
        .from('daily_mcqs')
        .select('*')
        .eq('career_name', careerName)
        .limit(1)
        .single();

      if (error) throw error;

      if (data) {
        setCurrentMCQ({
          ...data,
          options: data.options as string[]
        });
      }
    } catch (error) {
      console.error('Error fetching MCQ:', error);
      toast.error('Failed to load today\'s quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = async (answer: string) => {
    if (isAnswered || timeLeft === 0) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);
    setTimerActive(false);

    const correct = answer === currentMCQ?.correct_answer;
    setIsCorrect(correct);

    if (correct) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      
      const xpEarned = currentMCQ?.xp_reward || 10;
      onXPEarned(xpEarned);
      
      toast.success(`🎉 Correct! +${xpEarned} XP`);

      // Save response
      await supabase.from('user_mcq_responses').insert({
        user_id: userId,
        mcq_id: currentMCQ?.id,
        selected_answer: answer,
        is_correct: true,
        xp_earned: xpEarned
      });
    } else {
      toast.error('❌ Incorrect. Keep learning!');
      
      // Save response
      await supabase.from('user_mcq_responses').insert({
        user_id: userId,
        mcq_id: currentMCQ?.id,
        selected_answer: answer,
        is_correct: false,
        xp_earned: 0
      });
    }
  };

  if (loading) {
    return (
      <Card className="glass-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-primary/20 rounded w-3/4"></div>
          <div className="h-4 bg-primary/20 rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  if (!currentMCQ) {
    return (
      <Card className="glass-card p-6 text-center">
        <p className="text-muted-foreground">No quiz available today. Check back tomorrow!</p>
      </Card>
    );
  }

  return (
    <>
      <ConfettiEffect trigger={showConfetti} type="success" />
      
      <Card className="glass-card p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Daily Quiz</h3>
                <p className="text-xs text-muted-foreground">Earn {currentMCQ.xp_reward} XP</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="secondary" className="bg-primary/20">
                {currentMCQ.difficulty}
              </Badge>
              {timerActive && !isAnswered && (
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold">{timeLeft}s</span>
                </div>
              )}
            </div>
          </div>

          {/* Timer Progress */}
          {timerActive && !isAnswered && (
            <Progress value={(timeLeft / 60) * 100} className="h-2" />
          )}

          {/* Question */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{currentMCQ.question}</h4>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <AnimatePresence>
              {currentMCQ.options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const isCorrectOption = isAnswered && option === currentMCQ.correct_answer;
                const isWrongSelected = isAnswered && isSelected && !isCorrect;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left p-4 h-auto transition-all ${
                        isCorrectOption
                          ? 'bg-green-500/20 border-green-500 text-green-400'
                          : isWrongSelected
                          ? 'bg-red-500/20 border-red-500 text-red-400'
                          : isSelected
                          ? 'border-primary bg-primary/10'
                          : ''
                      }`}
                      onClick={() => handleAnswerSelect(option)}
                      disabled={isAnswered || timeLeft === 0}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{option}</span>
                        {isCorrectOption && <CheckCircle className="w-5 h-5 text-green-400" />}
                        {isWrongSelected && <XCircle className="w-5 h-5 text-red-400" />}
                      </div>
                    </Button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Result Message */}
          {isAnswered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg ${
                isCorrect
                  ? 'bg-green-500/20 border border-green-500/50'
                  : 'bg-red-500/20 border border-red-500/50'
              }`}
            >
              <div className="flex items-center space-x-2">
                {isCorrect ? (
                  <>
                    <Trophy className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 font-semibold">
                      Excellent! You earned {currentMCQ.xp_reward} XP!
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-red-400" />
                    <span className="text-red-400">
                      The correct answer is: {currentMCQ.correct_answer}
                    </span>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </Card>
    </>
  );
};
