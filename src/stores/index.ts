import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ==================== TYPES ====================

export interface UserVehicle {
  id: string;
  year: string;
  make: string;
  model: string;
  trim: string;
  color: string;
  currentHP: number;
  currentTorque: number;
  installedMods: InstalledMod[];
  maintenanceLog: MaintenanceLogEntry[];
  dynoResults: DynoResult[];
  notes: string;
  dateAdded: string;
  vehicleSlug?: string;
  imageUrl?: string;
  drivetrain?: string;
  engineCode?: string;
}

export interface InstalledMod {
  id: string;
  partId: string;
  partName: string;
  category: string;
  hpGain: number;
  torqueGain: number;
  cost: number;
  installedDate: string;
  notes: string;
}

export interface MaintenanceLogEntry {
  id: string;
  type: string;
  date: string;
  mileage: number;
  cost: number;
  notes: string;
}

export interface DynoResult {
  id: string;
  date: string;
  hp: number;
  torque: number;
  notes: string;
}

export interface BuildPlan {
  id: string;
  vehicleId: string;
  name: string;
  stages: BuildStage[];
  dateCreated: string;
}

export interface BuildStage {
  id: string;
  name: string;
  order: number;
  parts: BuildStagePart[];
  completed: boolean;
}

export interface BuildStagePart {
  id: string;
  partId: string;
  partName: string;
  category: string;
  estimatedCost: number;
  estimatedHpGain: number;
  estimatedTorqueGain: number;
}

export interface DiaryEntry {
  id: string;
  vehicleId: string;
  date: string;
  title: string;
  description: string;
  partsInstalled: string[];
  beforeHP: number;
  afterHP: number;
  mood: 'great' | 'good' | 'neutral' | 'frustrated' | 'excited';
}

export interface CommunityBuild {
  id: string;
  vehicleId: string;
  userId: string;
  userName: string;
  vehicleName: string;
  vehicleSlug?: string;
  imageUrl?: string;
  year: string;
  make: string;
  model: string;
  engineCode?: string;
  stockHP: number;
  currentHP: number;
  totalInvested: number;
  modList: string[];
  upvotes: number;
  upvotedBy: string[];
  dateShared: string;
  featured: boolean;
  description: string;
}

export interface MaintenanceItem {
  id: string;
  vehicleId: string;
  name: string;
  intervalMiles: number;
  lastCompletedMileage: number;
  lastCompletedDate: string;
  currentMileage: number;
  isCustom: boolean;
  history: MaintenanceHistoryEntry[];
}

export interface MaintenanceHistoryEntry {
  id: string;
  date: string;
  mileage: number;
  cost: number;
  notes: string;
}

export interface WatchlistPart {
  id: string;
  partId: string;
  partName: string;
  partSlug: string;
  brand: string;
  currentPrice: number;
  originalPrice: number;
  priceHistory: PricePoint[];
  dateAdded: string;
  targetPrice: number;
  category: string;
}

export interface PricePoint {
  date: string;
  price: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  requirement: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastVisitDate: string;
  totalVisits: number;
}

// ==================== STORE ====================

interface AppState {
  // Garage
  vehicles: UserVehicle[];
  addVehicle: (vehicle: UserVehicle) => void;
  removeVehicle: (id: string) => void;
  updateVehicle: (id: string, updates: Partial<UserVehicle>) => void;
  addModToVehicle: (vehicleId: string, mod: InstalledMod) => void;
  addDynoResult: (vehicleId: string, result: DynoResult) => void;

  // Build Plans
  buildPlans: BuildPlan[];
  addBuildPlan: (plan: BuildPlan) => void;
  removeBuildPlan: (id: string) => void;
  updateBuildPlan: (id: string, updates: Partial<BuildPlan>) => void;
  toggleStageComplete: (planId: string, stageId: string) => void;

  // Diary
  diaryEntries: DiaryEntry[];
  addDiaryEntry: (entry: DiaryEntry) => void;
  removeDiaryEntry: (id: string) => void;

  // Community
  communityBuilds: CommunityBuild[];
  addCommunityBuild: (build: CommunityBuild) => void;
  upvoteBuild: (buildId: string, visitorId: string) => void;
  toggleFeatured: (buildId: string) => void;

  // Maintenance
  maintenanceItems: MaintenanceItem[];
  addMaintenanceItem: (item: MaintenanceItem) => void;
  removeMaintenanceItem: (id: string) => void;
  updateMaintenanceItem: (id: string, updates: Partial<MaintenanceItem>) => void;
  completeMaintenanceItem: (id: string, mileage: number, cost: number, notes: string) => void;

  // Watchlist
  watchlistParts: WatchlistPart[];
  addToWatchlist: (part: WatchlistPart) => void;
  removeFromWatchlist: (id: string) => void;
  updateWatchlistPrices: () => void;

  // Gamification
  xp: number;
  level: string;
  achievements: Achievement[];
  addXP: (amount: number, action: string) => void;
  unlockAchievement: (id: string) => void;
  checkAchievements: () => string[];

  // Streak
  streak: StreakData;
  recordVisit: () => void;

  // AI Memory
  aiMemory: {
    pastQuestions: string[];
    preferredBrands: string[];
    budgetRange: string;
    drivingGoals: string[];
  };
  addAIQuestion: (question: string) => void;
  updateAIPreferences: (prefs: Partial<AppState['aiMemory']>) => void;
}

const LEVEL_THRESHOLDS = [
  { name: 'Wrench Turner', minXP: 0 },
  { name: 'Gearhead', minXP: 200 },
  { name: 'Tuner', minXP: 600 },
  { name: 'Builder', minXP: 1500 },
  { name: 'Legend', minXP: 4000 },
];

function getLevelFromXP(xp: number): string {
  let level = LEVEL_THRESHOLDS[0].name;
  for (const t of LEVEL_THRESHOLDS) {
    if (xp >= t.minXP) level = t.name;
  }
  return level;
}

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'first-build', name: 'First Build', description: 'Add your first vehicle to the garage', icon: '🔧', unlockedAt: null, requirement: 'Add 1 vehicle' },
  { id: '500hp-club', name: '500HP Club', description: 'Reach 500HP on any vehicle', icon: '🏎️', unlockedAt: null, requirement: '500+ HP on a vehicle' },
  { id: 'track-day', name: 'Track Day Warrior', description: 'Log 3 dyno results', icon: '🏁', unlockedAt: null, requirement: '3 dyno results' },
  { id: '10k-build', name: '$10K Build', description: 'Invest $10,000+ in mods', icon: '💰', unlockedAt: null, requirement: '$10K+ in mods' },
  { id: '5-vehicles', name: '5 Vehicles', description: 'Have 5 vehicles in your garage', icon: '🚗', unlockedAt: null, requirement: '5 vehicles' },
  { id: 'diary-keeper', name: 'Diary Keeper', description: 'Write 5 diary entries', icon: '📝', unlockedAt: null, requirement: '5 diary entries' },
  { id: 'community-star', name: 'Community Star', description: 'Share a build to the community', icon: '⭐', unlockedAt: null, requirement: 'Share 1 build' },
  { id: 'streak-7', name: 'Week Warrior', description: 'Visit 7 days in a row', icon: '🔥', unlockedAt: null, requirement: '7-day streak' },
];

const SAMPLE_VEHICLES: UserVehicle[] = [
  {
    id: 'sample-1',
    year: '2021',
    make: 'Toyota',
    model: 'GR Supra',
    trim: '3.0 Premium',
    color: 'Renaissance Red',
    currentHP: 442,
    currentTorque: 428,
    installedMods: [
      { id: 'sm-1', partId: 'p1', partName: 'BMS Stage 1 Intake', category: 'Intake', hpGain: 15, torqueGain: 12, cost: 329, installedDate: '2025-08-15', notes: '' },
      { id: 'sm-2', partId: 'p2', partName: 'Downpipe Catless 4"', category: 'Exhaust', hpGain: 25, torqueGain: 30, cost: 650, installedDate: '2025-09-02', notes: '' },
      { id: 'sm-3', partId: 'p3', partName: 'MHD Stage 2 Tune', category: 'ECU & Tuning', hpGain: 20, torqueGain: 18, cost: 499, installedDate: '2025-09-10', notes: '' },
    ],
    maintenanceLog: [],
    dynoResults: [
      { id: 'dr-1', date: '2025-09-15', hp: 438, torque: 425, notes: '91 octane, Stage 2 tune' },
    ],
    notes: 'Weekend track car. Going for 500whp next season.',
    dateAdded: '2025-07-20',
    vehicleSlug: 'toyota-gr-supra-a90',
    imageUrl: '/api/car-image?name=Toyota_GR_Supra',
    drivetrain: 'RWD',
    engineCode: 'B58 3.0T I6',
  },
  {
    id: 'sample-2',
    year: '2019',
    make: 'Honda',
    model: 'Civic Type R',
    trim: 'Type R',
    color: 'Championship White',
    currentHP: 346,
    currentTorque: 335,
    installedMods: [
      { id: 'sm-4', partId: 'p4', partName: 'PRL Cobra Cold Air Intake', category: 'Intake', hpGain: 12, torqueGain: 10, cost: 399, installedDate: '2025-06-10', notes: '' },
      { id: 'sm-5', partId: 'p5', partName: 'AWE Touring Exhaust', category: 'Exhaust', hpGain: 8, torqueGain: 10, cost: 1150, installedDate: '2025-07-01', notes: '' },
      { id: 'sm-6', partId: 'p6', partName: 'Hondata FlashPro', category: 'ECU & Tuning', hpGain: 20, torqueGain: 20, cost: 695, installedDate: '2025-07-15', notes: '' },
    ],
    maintenanceLog: [],
    dynoResults: [],
    notes: 'Daily driver. Keeping it reliable with bolt-ons only.',
    dateAdded: '2025-06-01',
    vehicleSlug: 'honda-civic-type-r-fk8',
    imageUrl: '/api/car-image?name=Honda_Civic_Type_R',
    drivetrain: 'FWD',
    engineCode: 'K20C1 2.0T',
  },
  {
    id: 'sample-3',
    year: '2023',
    make: 'Toyota',
    model: 'GR86',
    trim: 'Premium',
    color: 'Trueno Blue',
    currentHP: 248,
    currentTorque: 200,
    installedMods: [
      { id: 'sm-7', partId: 'p7', partName: 'JDL UEL Header', category: 'Exhaust', hpGain: 12, torqueGain: 10, cost: 899, installedDate: '2025-10-01', notes: '' },
      { id: 'sm-8', partId: 'p8', partName: 'Ecutek Stage 1 Tune', category: 'ECU & Tuning', hpGain: 8, torqueGain: 6, cost: 550, installedDate: '2025-10-10', notes: '' },
    ],
    maintenanceLog: [],
    dynoResults: [],
    notes: 'Canyon carver. Suspension mods coming next.',
    dateAdded: '2025-09-15',
    vehicleSlug: 'toyota-gr86',
    imageUrl: '/api/car-image?name=Toyota_GR86',
    drivetrain: 'RWD',
    engineCode: 'FA24 2.4L NA',
  },
];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Garage
      vehicles: SAMPLE_VEHICLES,
      addVehicle: (vehicle) =>
        set((state) => ({ vehicles: [...state.vehicles, vehicle] })),
      removeVehicle: (id) =>
        set((state) => ({ vehicles: state.vehicles.filter((v) => v.id !== id) })),
      updateVehicle: (id, updates) =>
        set((state) => ({
          vehicles: state.vehicles.map((v) =>
            v.id === id ? { ...v, ...updates } : v
          ),
        })),
      addModToVehicle: (vehicleId, mod) =>
        set((state) => ({
          vehicles: state.vehicles.map((v) =>
            v.id === vehicleId
              ? {
                  ...v,
                  installedMods: [...v.installedMods, mod],
                  currentHP: v.currentHP + mod.hpGain,
                  currentTorque: v.currentTorque + mod.torqueGain,
                }
              : v
          ),
        })),
      addDynoResult: (vehicleId, result) =>
        set((state) => ({
          vehicles: state.vehicles.map((v) =>
            v.id === vehicleId
              ? { ...v, dynoResults: [...v.dynoResults, result] }
              : v
          ),
        })),

      // Build Plans
      buildPlans: [],
      addBuildPlan: (plan) =>
        set((state) => ({ buildPlans: [...state.buildPlans, plan] })),
      removeBuildPlan: (id) =>
        set((state) => ({ buildPlans: state.buildPlans.filter((p) => p.id !== id) })),
      updateBuildPlan: (id, updates) =>
        set((state) => ({
          buildPlans: state.buildPlans.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),
      toggleStageComplete: (planId, stageId) =>
        set((state) => ({
          buildPlans: state.buildPlans.map((p) =>
            p.id === planId
              ? {
                  ...p,
                  stages: p.stages.map((s) =>
                    s.id === stageId ? { ...s, completed: !s.completed } : s
                  ),
                }
              : p
          ),
        })),

      // Diary
      diaryEntries: [],
      addDiaryEntry: (entry) =>
        set((state) => ({ diaryEntries: [...state.diaryEntries, entry] })),
      removeDiaryEntry: (id) =>
        set((state) => ({ diaryEntries: state.diaryEntries.filter((e) => e.id !== id) })),

      // Community
      communityBuilds: [],
      addCommunityBuild: (build) =>
        set((state) => ({ communityBuilds: [...state.communityBuilds, build] })),
      upvoteBuild: (buildId, visitorId) =>
        set((state) => ({
          communityBuilds: state.communityBuilds.map((b) =>
            b.id === buildId && !b.upvotedBy.includes(visitorId)
              ? { ...b, upvotes: b.upvotes + 1, upvotedBy: [...b.upvotedBy, visitorId] }
              : b
          ),
        })),
      toggleFeatured: (buildId) =>
        set((state) => ({
          communityBuilds: state.communityBuilds.map((b) =>
            b.id === buildId ? { ...b, featured: !b.featured } : b
          ),
        })),

      // Maintenance
      maintenanceItems: [],
      addMaintenanceItem: (item) =>
        set((state) => ({ maintenanceItems: [...state.maintenanceItems, item] })),
      removeMaintenanceItem: (id) =>
        set((state) => ({ maintenanceItems: state.maintenanceItems.filter((m) => m.id !== id) })),
      updateMaintenanceItem: (id, updates) =>
        set((state) => ({
          maintenanceItems: state.maintenanceItems.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
        })),
      completeMaintenanceItem: (id, mileage, cost, notes) =>
        set((state) => ({
          maintenanceItems: state.maintenanceItems.map((m) =>
            m.id === id
              ? {
                  ...m,
                  lastCompletedMileage: mileage,
                  lastCompletedDate: new Date().toISOString(),
                  currentMileage: mileage,
                  history: [
                    ...m.history,
                    {
                      id: `mh-${Date.now()}`,
                      date: new Date().toISOString(),
                      mileage,
                      cost,
                      notes,
                    },
                  ],
                }
              : m
          ),
        })),

      // Watchlist
      watchlistParts: [],
      addToWatchlist: (part) =>
        set((state) => ({ watchlistParts: [...state.watchlistParts, part] })),
      removeFromWatchlist: (id) =>
        set((state) => ({ watchlistParts: state.watchlistParts.filter((p) => p.id !== id) })),
      updateWatchlistPrices: () =>
        set((state) => ({
          watchlistParts: state.watchlistParts.map((p) => {
            const fluctuation = (Math.random() - 0.45) * 0.06;
            const newPrice = Math.round(p.currentPrice * (1 + fluctuation));
            const today = new Date().toISOString().split('T')[0];
            const existsToday = p.priceHistory.some((ph) => ph.date === today);
            return {
              ...p,
              currentPrice: Math.max(Math.round(p.originalPrice * 0.7), newPrice),
              priceHistory: existsToday
                ? p.priceHistory
                : [...p.priceHistory.slice(-29), { date: today, price: newPrice }],
            };
          }),
        })),

      // Gamification
      xp: 0,
      level: 'Wrench Turner',
      achievements: DEFAULT_ACHIEVEMENTS,
      addXP: (amount, _action) =>
        set((state) => {
          const newXP = state.xp + amount;
          return { xp: newXP, level: getLevelFromXP(newXP) };
        }),
      unlockAchievement: (id) =>
        set((state) => ({
          achievements: state.achievements.map((a) =>
            a.id === id && !a.unlockedAt ? { ...a, unlockedAt: new Date().toISOString() } : a
          ),
        })),
      checkAchievements: () => {
        const state = get();
        const newlyUnlocked: string[] = [];

        // First Build
        if (state.vehicles.length >= 1 && !state.achievements.find((a) => a.id === 'first-build')?.unlockedAt) {
          state.unlockAchievement('first-build');
          newlyUnlocked.push('first-build');
        }

        // 500HP Club
        const has500hp = state.vehicles.some((v) => v.currentHP >= 500);
        if (has500hp && !state.achievements.find((a) => a.id === '500hp-club')?.unlockedAt) {
          state.unlockAchievement('500hp-club');
          newlyUnlocked.push('500hp-club');
        }

        // Track Day Warrior
        const totalDyno = state.vehicles.reduce((sum, v) => sum + v.dynoResults.length, 0);
        if (totalDyno >= 3 && !state.achievements.find((a) => a.id === 'track-day')?.unlockedAt) {
          state.unlockAchievement('track-day');
          newlyUnlocked.push('track-day');
        }

        // $10K Build
        const totalInvested = state.vehicles.reduce(
          (sum, v) => sum + v.installedMods.reduce((ms, m) => ms + m.cost, 0), 0
        );
        if (totalInvested >= 10000 && !state.achievements.find((a) => a.id === '10k-build')?.unlockedAt) {
          state.unlockAchievement('10k-build');
          newlyUnlocked.push('10k-build');
        }

        // 5 Vehicles
        if (state.vehicles.length >= 5 && !state.achievements.find((a) => a.id === '5-vehicles')?.unlockedAt) {
          state.unlockAchievement('5-vehicles');
          newlyUnlocked.push('5-vehicles');
        }

        // Diary Keeper
        if (state.diaryEntries.length >= 5 && !state.achievements.find((a) => a.id === 'diary-keeper')?.unlockedAt) {
          state.unlockAchievement('diary-keeper');
          newlyUnlocked.push('diary-keeper');
        }

        // Community Star
        if (state.communityBuilds.length >= 1 && !state.achievements.find((a) => a.id === 'community-star')?.unlockedAt) {
          state.unlockAchievement('community-star');
          newlyUnlocked.push('community-star');
        }

        // Week Warrior
        if (state.streak.currentStreak >= 7 && !state.achievements.find((a) => a.id === 'streak-7')?.unlockedAt) {
          state.unlockAchievement('streak-7');
          newlyUnlocked.push('streak-7');
        }

        return newlyUnlocked;
      },

      // Streak
      streak: {
        currentStreak: 0,
        longestStreak: 0,
        lastVisitDate: '',
        totalVisits: 0,
      },
      recordVisit: () =>
        set((state) => {
          const today = new Date().toISOString().split('T')[0];
          if (state.streak.lastVisitDate === today) return state;

          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
          const isConsecutive = state.streak.lastVisitDate === yesterday;
          const newStreak = isConsecutive ? state.streak.currentStreak + 1 : 1;

          return {
            streak: {
              currentStreak: newStreak,
              longestStreak: Math.max(state.streak.longestStreak, newStreak),
              lastVisitDate: today,
              totalVisits: state.streak.totalVisits + 1,
            },
          };
        }),

      // AI Memory
      aiMemory: {
        pastQuestions: [],
        preferredBrands: [],
        budgetRange: '',
        drivingGoals: [],
      },
      addAIQuestion: (question) =>
        set((state) => ({
          aiMemory: {
            ...state.aiMemory,
            pastQuestions: [...state.aiMemory.pastQuestions.slice(-19), question],
          },
        })),
      updateAIPreferences: (prefs) =>
        set((state) => ({
          aiMemory: { ...state.aiMemory, ...prefs },
        })),
    }),
    {
      name: 'carsource-ai-storage',
      version: 1,
    }
  )
);
