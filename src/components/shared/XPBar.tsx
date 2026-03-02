'use client';

import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useAppStore } from '@/stores';
import { getLevelInfo } from '@/lib/gamification';

export default function XPBar() {
  const xp = useAppStore((s) => s.xp);
  const level = useAppStore((s) => s.level);
  const info = getLevelInfo(xp);

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-lg ${info.level.bg}/20 flex items-center justify-center`}>
            <Zap className={`w-4 h-4 ${info.level.color}`} />
          </div>
          <div>
            <p className={`text-sm font-bold ${info.level.color}`}>{level}</p>
            <p className="text-xs text-zinc-500">{xp} XP</p>
          </div>
        </div>
        {info.nextLevel.minXP !== Infinity && (
          <p className="text-xs text-zinc-500">
            {info.xpForLevel - info.xpInLevel} XP to {info.nextLevel.name}
          </p>
        )}
      </div>
      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${info.level.bg}`}
          initial={{ width: 0 }}
          animate={{ width: `${info.progress}%` }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] as const }}
        />
      </div>
    </div>
  );
}
