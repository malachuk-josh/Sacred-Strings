export type SkillLevel = "beginner" | "intermediate" | "advanced";

export interface Profile {
  displayName: string;
  skillLevel: SkillLevel;
  updatedAt?: string;
}

export interface HistoryEntry {
  date: string; // YYYY-MM-DD
  minutes: number;
  exercises: number;
}

export interface Progress {
  completedLessons: string[];
  completedExercises: string[];
  currentStreak: number;
  longestStreak: number;
  totalMinutes: number;
  lastActive: string | null; // YYYY-MM-DD
  history: HistoryEntry[];
}

export const defaultProfile: Profile = {
  displayName: "",
  skillLevel: "beginner",
};

export const defaultProgress: Progress = {
  completedLessons: [],
  completedExercises: [],
  currentStreak: 0,
  longestStreak: 0,
  totalMinutes: 0,
  lastActive: null,
  history: [],
};

export const SKILL_LEVELS: SkillLevel[] = ["beginner", "intermediate", "advanced"];

export function profileKey(userId: string) {
  return `sacred:user:${userId}:profile`;
}

export function progressKey(userId: string) {
  return `sacred:user:${userId}:progress`;
}
