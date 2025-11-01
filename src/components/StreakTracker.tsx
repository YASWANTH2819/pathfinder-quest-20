import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Flame, Calendar, TrendingUp } from 'lucide-react';

interface StreakTrackerProps {
  streakCount: number;
  xp: number;
  lastActivityDate?: string;
}

export const StreakTracker = ({ streakCount, xp, lastActivityDate }: StreakTrackerProps) => {
  const isActiveToday = lastActivityDate === new Date().toISOString().split('T')[0];

  return (
    <Card className="glass-card p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Your Progress</h3>
          {isActiveToday && (
            <Badge variant="secondary" className="bg-green-500/20 text-green-400">
              Active Today
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Streak */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 p-4 border border-orange-500/30"
          >
            <div className="flex items-center justify-between mb-2">
              <Flame className="w-6 h-6 text-orange-400" />
              <span className="text-xs text-muted-foreground">Daily Streak</span>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold gradient-text-rainbow">{streakCount}</p>
              <p className="text-xs text-muted-foreground">days in a row</p>
            </div>
            {streakCount > 0 && (
              <div className="absolute -bottom-2 -right-2 opacity-10">
                <Flame className="w-20 h-20" />
              </div>
            )}
          </motion.div>

          {/* XP */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-4 border border-purple-500/30"
          >
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-6 h-6 text-purple-400" />
              <span className="text-xs text-muted-foreground">Total XP</span>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-bold gradient-text-rainbow">{xp}</p>
              <p className="text-xs text-muted-foreground">experience points</p>
            </div>
            <div className="absolute -bottom-2 -right-2 opacity-10">
              <TrendingUp className="w-20 h-20" />
            </div>
          </motion.div>

          {/* Last Activity */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-500/20 to-teal-500/20 p-4 border border-green-500/30"
          >
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-6 h-6 text-green-400" />
              <span className="text-xs text-muted-foreground">Last Activity</span>
            </div>
            <div className="space-y-1">
              <p className="text-lg font-bold gradient-text-rainbow">
                {lastActivityDate 
                  ? new Date(lastActivityDate).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })
                  : 'Never'}
              </p>
              <p className="text-xs text-muted-foreground">
                {isActiveToday ? 'You\'re on fire! 🔥' : 'Keep the momentum!'}
              </p>
            </div>
            <div className="absolute -bottom-2 -right-2 opacity-10">
              <Calendar className="w-20 h-20" />
            </div>
          </motion.div>
        </div>

        {/* Motivational Message */}
        {streakCount >= 7 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30"
          >
            <p className="text-center text-sm font-semibold gradient-text-rainbow">
              🎉 Amazing! {streakCount} day streak! You're unstoppable!
            </p>
          </motion.div>
        )}
      </div>
    </Card>
  );
};
