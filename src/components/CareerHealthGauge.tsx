import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Award, Target, Zap } from 'lucide-react';

interface CareerHealthGaugeProps {
  atsScore: number;
  skillsMatch: number;
  roadmapProgress: number;
}

export const CareerHealthGauge = ({ atsScore, skillsMatch, roadmapProgress }: CareerHealthGaugeProps) => {
  const careerHealthScore = Math.round((atsScore + skillsMatch + roadmapProgress) / 3);
  
  const getHealthStatus = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-green-400', bg: 'bg-green-400/10' };
    if (score >= 60) return { label: 'Good', color: 'text-blue-400', bg: 'bg-blue-400/10' };
    if (score >= 40) return { label: 'Fair', color: 'text-yellow-400', bg: 'bg-yellow-400/10' };
    return { label: 'Needs Improvement', color: 'text-red-400', bg: 'bg-red-400/10' };
  };

  const status = getHealthStatus(careerHealthScore);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Main Health Score */}
      <Card className="glass-card p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-green-500/5" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Career Health Score
            </h3>
            <Badge className={`${status.bg} ${status.color} border-0`}>
              {status.label}
            </Badge>
          </div>
          
          <div className="text-center mb-6">
            <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
              {careerHealthScore}%
            </div>
            <p className="text-sm text-muted-foreground">
              Formula: (ATS Score + Skills Match + Roadmap Progress) ÷ 3
            </p>
          </div>
          
          <Progress value={careerHealthScore} className="h-3" />
        </div>
      </Card>

      {/* Breakdown Metrics */}
      <Card className="glass-card p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-purple-400" />
          Score Breakdown
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-400" />
              <span className="text-sm">ATS Score</span>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={atsScore} className="w-20 h-2" />
              <span className="text-sm font-medium w-12 text-right">{atsScore}%</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-400" />
              <span className="text-sm">Skills Match</span>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={skillsMatch} className="w-20 h-2" />
              <span className="text-sm font-medium w-12 text-right">{skillsMatch}%</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-sm">Roadmap Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={roadmapProgress} className="w-20 h-2" />
              <span className="text-sm font-medium w-12 text-right">{roadmapProgress}%</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};