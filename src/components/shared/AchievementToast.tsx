'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { useAppStore } from '@/stores';

export default function AchievementToast() {
  const [toasts, setToasts] = useState<{ id: string; name: string; icon: string }[]>([]);
  const achievements = useAppStore((s) => s.achievements);
  const checkAchievements = useAppStore((s) => s.checkAchievements);

  useEffect(() => {
    const newlyUnlocked = checkAchievements();
    if (newlyUnlocked.length > 0) {
      const newToasts = newlyUnlocked.map((id) => {
        const achievement = achievements.find((a) => a.id === id);
        return { id, name: achievement?.name || '', icon: achievement?.icon || '🏆' };
      });
      setToasts((prev) => [...prev, ...newToasts]);
    }
  }, [achievements.length, checkAchievements, achievements]);

  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts((prev) => prev.slice(1));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toasts]);

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl px-5 py-3 flex items-center gap-3 shadow-lg shadow-yellow-500/10"
          >
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center text-lg">
              {toast.icon}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                <p className="text-xs text-yellow-400 font-medium">Achievement Unlocked!</p>
              </div>
              <p className="text-sm font-bold text-white">{toast.name}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
