'use client';

import { Flame } from 'lucide-react';
import { useAppStore } from '@/stores';
import { getStreakMessage } from '@/lib/engagement';

export default function StreakBadge() {
  const streak = useAppStore((s) => s.streak);

  if (streak.currentStreak === 0) return null;

  return (
    <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-1.5">
      <Flame className="w-4 h-4 text-orange-400" />
      <span className="text-sm font-bold text-orange-400">{streak.currentStreak}</span>
      <span className="text-xs text-orange-400/70">{getStreakMessage(streak.currentStreak)}</span>
    </div>
  );
}
