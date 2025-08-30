import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { GraduationCap, Code, Briefcase, Target, Clock, CheckCircle2 } from 'lucide-react';
import { RoadmapStep } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';

interface RoadmapTimelineProps {
  steps: RoadmapStep[];
  onStepComplete: (stepId: string, isCompleted: boolean) => void;
  className?: string;
}

const getStepIcon = (type: RoadmapStep['type']) => {
  const iconProps = { className: "w-6 h-6" };
  switch (type) {
    case 'skill':
      return <Code {...iconProps} />;
    case 'project':
      return <Target {...iconProps} />;
    case 'internship':
      return <Briefcase {...iconProps} />;
    case 'prep':
      return <GraduationCap {...iconProps} />;
    default:
      return <Clock {...iconProps} />;
  }
};

const getStepColor = (type: RoadmapStep['type']) => {
  switch (type) {
    case 'skill':
      return 'text-[hsl(var(--cyber-blue))]';
    case 'project':
      return 'text-[hsl(var(--cyber-purple))]';
    case 'internship':
      return 'text-[hsl(var(--cyber-green))]';
    case 'prep':
      return 'text-[hsl(var(--cyber-orange))]';
    default:
      return 'text-muted-foreground';
  }
};

const getBadgeVariant = (type: RoadmapStep['type']) => {
  switch (type) {
    case 'skill':
      return 'secondary';
    case 'project':
      return 'default';
    case 'internship':
      return 'outline';
    case 'prep':
      return 'destructive';
    default:
      return 'secondary';
  }
};

export const RoadmapTimeline: React.FC<RoadmapTimelineProps> = ({
  steps,
  onStepComplete,
  className = ''
}) => {
  const { t } = useTranslation();

  const groupedSteps = steps.reduce((acc, step) => {
    const semester = step.semester || 1;
    if (!acc[semester]) {
      acc[semester] = [];
    }
    acc[semester].push(step);
    return acc;
  }, {} as Record<number, RoadmapStep[]>);

  return (
    <div className={`space-y-8 ${className}`}>
      {Object.entries(groupedSteps)
        .sort(([a], [b]) => parseInt(a) - parseInt(b))
        .map(([semester, semesterSteps], semesterIndex) => (
          <motion.div
            key={semester}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: semesterIndex * 0.2 }}
            className="relative"
          >
            {/* Semester Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[hsl(var(--cyber-purple))] to-[hsl(var(--cyber-blue))] flex items-center justify-center font-orbitron font-bold text-white">
                {semester}
              </div>
              <h3 className="text-xl font-orbitron font-semibold gradient-text">
                {t('roadmap.semester')} {semester}
              </h3>
            </div>

            {/* Timeline Line */}
            <div className="absolute left-6 top-20 bottom-0 w-0.5 bg-gradient-to-b from-[hsl(var(--cyber-purple))] to-[hsl(var(--cyber-blue))] opacity-30" />

            {/* Steps */}
            <div className="space-y-4 ml-16">
              {semesterSteps.map((step, stepIndex) => (
                <motion.div
                  key={step.id}
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ 
                    duration: 0.5, 
                    delay: semesterIndex * 0.2 + stepIndex * 0.1 
                  }}
                  className="relative"
                >
                  {/* Connection Line */}
                  <div className="absolute -left-16 top-6 w-12 h-0.5 bg-gradient-to-r from-[hsl(var(--cyber-purple))] to-[hsl(var(--cyber-blue))] opacity-50" />
                  
                  {/* Step Node */}
                  <div className={`absolute -left-[72px] top-4 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                    step.isCompleted 
                      ? 'bg-[hsl(var(--cyber-green))] border-[hsl(var(--cyber-green))]' 
                      : 'bg-[hsl(var(--glass-background))] border-[hsl(var(--glass-border-bright))]'
                  }`}>
                    {step.isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <div className={`w-2 h-2 rounded-full ${getStepColor(step.type)}`} />
                    )}
                  </div>

                  <Card className={`glass-card transition-all duration-300 ${
                    step.isCompleted 
                      ? 'bg-[hsl(var(--cyber-green)/0.1)] border-[hsl(var(--cyber-green)/0.3)]' 
                      : 'hover:border-[hsl(var(--cyber-purple)/0.4)]'
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`${getStepColor(step.type)}`}>
                            {getStepIcon(step.type)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-lg">{step.title}</h4>
                            <Badge variant={getBadgeVariant(step.type) as any} className="mt-1">
                              {t(`roadmap.${step.type}`)}
                            </Badge>
                          </div>
                        </div>
                        
                        <Checkbox
                          checked={step.isCompleted}
                          onCheckedChange={(checked) => 
                            onStepComplete(step.id, checked === true)
                          }
                          className="w-5 h-5"
                        />
                      </div>

                      <p className="text-muted-foreground mb-4">
                        {step.description}
                      </p>

                      {step.recommendedResources && step.recommendedResources.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-[hsl(var(--cyber-purple))]">
                            Recommended Resources:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {step.recommendedResources.map((resource, index) => (
                              <Badge 
                                key={index} 
                                variant="outline" 
                                className="text-xs"
                              >
                                {resource}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
    </div>
  );
};