import { useAppStore } from '@/stores';

export function buildAIContext(): string {
  const state = useAppStore.getState();

  const parts: string[] = [];

  // User's vehicles
  if (state.vehicles.length > 0) {
    const vehicleInfo = state.vehicles.map((v) =>
      `${v.year} ${v.make} ${v.model} ${v.trim} (${v.currentHP}hp, ${v.installedMods.length} mods installed)`
    ).join(', ');
    parts.push(`User's vehicles: ${vehicleInfo}`);
  }

  // Installed mods
  const allMods = state.vehicles.flatMap((v) => v.installedMods);
  if (allMods.length > 0) {
    const modNames = allMods.map((m) => m.partName).slice(0, 10).join(', ');
    parts.push(`Installed mods: ${modNames}`);
  }

  // Budget
  if (state.aiMemory.budgetRange) {
    parts.push(`Budget range: ${state.aiMemory.budgetRange}`);
  }

  // Goals
  if (state.aiMemory.drivingGoals.length > 0) {
    parts.push(`Driving goals: ${state.aiMemory.drivingGoals.join(', ')}`);
  }

  // Preferred brands
  if (state.aiMemory.preferredBrands.length > 0) {
    parts.push(`Preferred brands: ${state.aiMemory.preferredBrands.join(', ')}`);
  }

  // Recent questions
  if (state.aiMemory.pastQuestions.length > 0) {
    const recent = state.aiMemory.pastQuestions.slice(-5).join(' | ');
    parts.push(`Recent questions: ${recent}`);
  }

  // Active build plans
  if (state.buildPlans.length > 0) {
    const planInfo = state.buildPlans.map((p) => {
      const completedStages = p.stages.filter((s) => s.completed).length;
      return `"${p.name}" (${completedStages}/${p.stages.length} stages done)`;
    }).join(', ');
    parts.push(`Active build plans: ${planInfo}`);
  }

  if (parts.length === 0) return '';

  return `\n\nUSER CONTEXT (from their CarSource AI profile):\n${parts.join('\n')}`;
}
