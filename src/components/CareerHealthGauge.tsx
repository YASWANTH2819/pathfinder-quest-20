import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, TrendingUp, TrendingDown } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface CareerHealthGaugeProps {
  overallScore: number;
  atsScore: number;
  skillsMatchScore: number;
  roadmapProgress: number;
  previousScore?: number;
  className?: string;
}

export const CareerHealthGauge: React.FC<CareerHealthGaugeProps> = ({
  overallScore,
  atsScore,
  skillsMatchScore,
  roadmapProgress,
  previousScore,
  className = ''
}) => {
  const { t } = useTranslation();

  // Determine color based on score
  const getScoreColor = (score: number) => {
    if (score < 40) return 'text-red-400';
    if (score < 70) return 'text-yellow-400';
    return 'text-[hsl(var(--cyber-green))]';
  };

  const getScoreGlow = (score: number) => {
    if (score < 40) return 'shadow-[0_0_30px_rgba(248,113,113,0.6)]';
    if (score < 70) return 'shadow-[0_0_30px_rgba(250,204,21,0.6)]';
    return 'shadow-[0_0_30px_hsl(var(--cyber-green)/0.6)]';
  };

  const getBadgeLevel = (score: number) => {
    if (score < 40) return { level: 'Beginner', color: 'destructive' };
    if (score < 70) return { level: 'Builder', color: 'secondary' };
    if (score < 85) return { level: 'Job-Ready', color: 'default' };
    return { level: 'Pro', color: 'default' };
  };

  const badge = getBadgeLevel(overallScore);
  const scoreChange = previousScore ? overallScore - previousScore : 0;
  
  // Calculate circumference for progress ring
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  return (
    <TooltipProvider>
      <Card className={`glass-card p-6 ${className}`}>
        <CardHeader className="text-center pb-2">
          <CardTitle className="font-orbitron text-2xl gradient-text flex items-center justify-center gap-2">
            {t('dashboard.careerHealthScore')}
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-5 h-5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <div className="space-y-2">
                  <p className="font-semibold">Formula:</p>
                  <p>(ATS Score + Skills Match + Roadmap Progress) ÷ 3</p>
                  <p className="text-sm text-muted-foreground">
                    Example: ({atsScore} + {skillsMatchScore} + {roadmapProgress}) ÷ 3 = {overallScore}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex flex-col items-center space-y-6">
          {/* Circular Progress Gauge */}
          <div className="relative">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`relative ${getScoreGlow(overallScore)} rounded-full`}
            >
              <svg width="280" height="280" className="transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="140"
                  cy="140"
                  r={radius}
                  stroke="hsl(var(--glass-border))"
                  strokeWidth="12"
                  fill="transparent"
                  className="opacity-30"
                />
                
                {/* Progress circle */}
                <motion.circle
                  cx="140"
                  cy="140"
                  r={radius}
                  stroke="url(#scoreGradient)"
                  strokeWidth="12"
                  fill="transparent"
                  strokeLinecap="round"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  className="filter drop-shadow-lg"
                />
                
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={overallScore < 40 ? '#f87171' : overallScore < 70 ? '#facc15' : 'hsl(var(--cyber-green))'} />
                    <stop offset="100%" stopColor={overallScore < 40 ? '#ef4444' : overallScore < 70 ? '#eab308' : 'hsl(var(--cyber-blue))'} />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Score Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="text-center"
                >
                  <div className={`text-6xl font-orbitron font-bold ${getScoreColor(overallScore)}`}>
                    {overallScore}
                  </div>
                  <div className="text-lg text-muted-foreground font-medium">
                    /100
                  </div>
                  
                  {/* Score Change Indicator */}
                  {scoreChange !== 0 && (
                    <div className={`flex items-center justify-center mt-2 text-sm ${scoreChange > 0 ? 'text-[hsl(var(--cyber-green))]' : 'text-red-400'}`}>
                      {scoreChange > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                      {scoreChange > 0 ? '+' : ''}{scoreChange}
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Badge Level */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            <Badge variant={badge.color as any} className="px-4 py-2 text-lg font-orbitron">
              {badge.level}
            </Badge>
          </motion.div>

          {/* Score Breakdown */}
          <div className="w-full space-y-3">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 2, duration: 0.5 }}
              className="flex justify-between items-center"
            >
              <span className="text-sm text-muted-foreground">{t('dashboard.atsScore')}</span>
              <span className={`font-semibold ${getScoreColor(atsScore)}`}>{atsScore}</span>
            </motion.div>
            
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 2.2, duration: 0.5 }}
              className="flex justify-between items-center"
            >
              <span className="text-sm text-muted-foreground">{t('dashboard.skillsMatch')}</span>
              <span className={`font-semibold ${getScoreColor(skillsMatchScore)}`}>{skillsMatchScore}</span>
            </motion.div>
            
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 2.4, duration: 0.5 }}
              className="flex justify-between items-center"
            >
              <span className="text-sm text-muted-foreground">{t('dashboard.roadmapProgress')}</span>
              <span className={`font-semibold ${getScoreColor(roadmapProgress)}`}>{roadmapProgress}</span>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};