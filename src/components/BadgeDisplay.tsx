import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Trophy, Award, Star, Zap, Target, Crown, Flame, Rocket } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface UserBadge {
  id: string;
  badge_code: string;
  badge_name: string;
  badge_description: string;
  icon_name: string;
  earned_at: string;
}

interface BadgeDisplayProps {
  userId: string;
}

const iconMap: Record<string, any> = {
  Trophy,
  Award,
  Star,
  Zap,
  Target,
  Crown,
  Flame,
  Rocket
};

export const BadgeDisplay = ({ userId }: BadgeDisplayProps) => {
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadges();
  }, [userId]);

  const fetchBadges = async () => {
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      if (error) throw error;
      setBadges(data || []);
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="glass-card p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-primary/20 rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-primary/10 rounded-lg"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (badges.length === 0) {
    return (
      <Card className="glass-card p-6 text-center">
        <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">No badges earned yet. Keep learning!</p>
      </Card>
    );
  }

  return (
    <Card className="glass-card p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Your Badges</h3>
          <Badge variant="secondary" className="bg-primary/20">
            {badges.length} Earned
          </Badge>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {badges.map((badge, index) => {
            const Icon = iconMap[badge.icon_name] || Trophy;
            
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <Card className="glass-card p-4 text-center hover:shadow-xl transition-all cursor-pointer">
                  <div className="relative">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-primary via-accent to-secondary flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2">
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                        <Star className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  </div>
                  <h4 className="font-semibold text-sm mb-1">{badge.badge_name}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {badge.badge_description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(badge.earned_at).toLocaleDateString()}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
