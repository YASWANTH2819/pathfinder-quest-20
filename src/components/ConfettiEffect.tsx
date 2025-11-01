import { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiEffectProps {
  trigger: boolean;
  type?: 'success' | 'celebration' | 'fireworks';
}

export const ConfettiEffect = ({ trigger, type = 'success' }: ConfettiEffectProps) => {
  useEffect(() => {
    if (!trigger) return;

    if (type === 'fireworks') {
      // Fireworks effect
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      
      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        confetti({
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          zIndex: 9999,
          origin: {
            x: randomInRange(0.1, 0.9),
            y: Math.random() - 0.2
          },
          colors: ['#4F46E5', '#9333EA', '#10B981', '#F59E0B', '#EF4444']
        });
      }, 250);

      return () => clearInterval(interval);
    } else if (type === 'celebration') {
      // Big celebration
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
        zIndex: 9999,
        colors: ['#4F46E5', '#9333EA', '#10B981', '#F59E0B']
      };

      function fire(particleRatio: number, opts: any) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio)
        });
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
      });

      fire(0.2, {
        spread: 60,
      });

      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8
      });

      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2
      });

      fire(0.1, {
        spread: 120,
        startVelocity: 45,
      });
    } else {
      // Simple success confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        zIndex: 9999,
        colors: ['#4F46E5', '#9333EA', '#10B981']
      });
    }
  }, [trigger, type]);

  return null;
};
