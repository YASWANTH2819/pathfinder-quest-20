import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Target } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface AnalyticsProps {
  healthScoreHistory: Array<{ date: string; score: number }>;
  atsScoreHistory: Array<{ date: string; score: number }>;
  skillsProgress: Array<{ skill: string; proficiency: number; required: number }>;
  className?: string;
}

export const EnhancedAnalytics: React.FC<AnalyticsProps> = ({
  healthScoreHistory,
  atsScoreHistory,
  skillsProgress,
  className = ''
}) => {
  const { t } = useTranslation();

  // Color scheme for charts
  const colors = {
    primary: 'hsl(270, 85%, 65%)',
    secondary: 'hsl(190, 100%, 65%)',
    accent: 'hsl(315, 100%, 70%)',
    success: 'hsl(120, 100%, 60%)',
    warning: 'hsl(50, 100%, 70%)',
    danger: 'hsl(0, 84%, 60%)'
  };

  // Skill gap chart colors
  const SKILL_COLORS = [colors.primary, colors.secondary, colors.accent, colors.success];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Career Health Score Trend */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-orbitron">
              <TrendingUp className="w-5 h-5 text-[hsl(var(--cyber-purple))]" />
              Career Health Score Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={healthScoreHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--glass-border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--glass-background))',
                    border: '1px solid hsl(var(--glass-border-bright))',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke={colors.primary}
                  strokeWidth={3}
                  dot={{ fill: colors.primary, strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: colors.primary, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* ATS Score History */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-orbitron">
              <BarChart3 className="w-5 h-5 text-[hsl(var(--cyber-blue))]" />
              ATS Score History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={atsScoreHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--glass-border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--glass-background))',
                    border: '1px solid hsl(var(--glass-border-bright))',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)'
                  }}
                />
                <Bar 
                  dataKey="score" 
                  fill={colors.secondary}
                  radius={[4, 4, 0, 0]}
                  className="drop-shadow-lg"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Skills Gap Analysis */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-orbitron">
              <Target className="w-5 h-5 text-[hsl(var(--cyber-green))]" />
              {t('dashboard.skillGap')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={skillsProgress} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--glass-border))" />
                <XAxis 
                  type="number" 
                  domain={[0, 100]}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  type="category"
                  dataKey="skill" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  width={120}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--glass-background))',
                    border: '1px solid hsl(var(--glass-border-bright))',
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)'
                  }}
                />
                <Bar 
                  dataKey="required" 
                  fill="hsl(var(--glass-border))"
                  radius={[0, 4, 4, 0]}
                  name="Required"
                />
                <Bar 
                  dataKey="proficiency" 
                  fill={colors.accent}
                  radius={[0, 4, 4, 0]}
                  name="Current"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};