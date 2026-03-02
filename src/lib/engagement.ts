export function getDaysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function getStreakEmoji(streak: number): string {
  if (streak >= 30) return '💎';
  if (streak >= 14) return '🔥';
  if (streak >= 7) return '⚡';
  if (streak >= 3) return '✨';
  return '🌱';
}

export function getStreakMessage(streak: number): string {
  if (streak >= 30) return 'Legendary dedication!';
  if (streak >= 14) return 'On fire! Two weeks strong!';
  if (streak >= 7) return 'Week warrior!';
  if (streak >= 3) return 'Building momentum!';
  if (streak >= 1) return 'Keep it going!';
  return 'Start your streak today!';
}
