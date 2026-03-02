// XP Awards for different actions
export const XP_ACTIONS = {
  ADD_VEHICLE: { amount: 50, label: 'Added a vehicle' },
  LOG_MOD: { amount: 25, label: 'Logged a mod' },
  WRITE_DIARY: { amount: 30, label: 'Wrote a diary entry' },
  COMPLETE_STAGE: { amount: 100, label: 'Completed a build stage' },
  SHARE_COMMUNITY: { amount: 75, label: 'Shared to community' },
  LOG_DYNO: { amount: 40, label: 'Logged dyno result' },
  COMPLETE_MAINTENANCE: { amount: 15, label: 'Completed maintenance' },
  ADD_WATCHLIST: { amount: 10, label: 'Added to watchlist' },
  DAILY_VISIT: { amount: 5, label: 'Daily visit' },
} as const;

export const LEVEL_THRESHOLDS = [
  { name: 'Wrench Turner', minXP: 0, maxXP: 199, color: 'text-zinc-400', bg: 'bg-zinc-500' },
  { name: 'Gearhead', minXP: 200, maxXP: 599, color: 'text-blue-400', bg: 'bg-blue-500' },
  { name: 'Tuner', minXP: 600, maxXP: 1499, color: 'text-green-400', bg: 'bg-green-500' },
  { name: 'Builder', minXP: 1500, maxXP: 3999, color: 'text-orange-400', bg: 'bg-orange-500' },
  { name: 'Legend', minXP: 4000, maxXP: Infinity, color: 'text-red-400', bg: 'bg-red-500' },
];

export function getLevelInfo(xp: number) {
  let current = LEVEL_THRESHOLDS[0];
  let nextLevel = LEVEL_THRESHOLDS[1];

  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i].minXP) {
      current = LEVEL_THRESHOLDS[i];
      nextLevel = LEVEL_THRESHOLDS[i + 1] || LEVEL_THRESHOLDS[i];
    }
  }

  const xpInLevel = xp - current.minXP;
  const xpForLevel = (nextLevel.minXP === Infinity ? current.minXP + 1000 : nextLevel.minXP) - current.minXP;
  const progress = Math.min((xpInLevel / xpForLevel) * 100, 100);

  return {
    level: current,
    nextLevel,
    xpInLevel,
    xpForLevel,
    progress,
  };
}
