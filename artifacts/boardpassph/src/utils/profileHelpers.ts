import { Question, UserProfile } from '../types';

export const DEFAULT_HABIT_DEFINITIONS = [
  { id: 'read-notes', name: '📖 Read 15 textbook pages / Diagnostic Codes', xp: 15 },
  { id: 'quiz-session', name: '🧠 Complete Practice Arena quiz', xp: 20 },
  { id: 'spaced-rep', name: '⚔️ Review Spaced Rep missed items', xp: 15 },
  { id: 'hydrate', name: '💧 Hydrate (8+ glasses of water)', xp: 10 },
  { id: 'sleep', name: '💤 Maintain 7+ hours of restful sleep', xp: 10 },
  { id: 'stretch', name: '🧘 Exercise / Deep breathing stretch', xp: 10 },
];

export type HabitDefinition = { id: string; name: string; xp: number };

export function getHabitDefinitions(profile: UserProfile): HabitDefinition[] {
  return profile.habitDefinitions?.length ? profile.habitDefinitions : DEFAULT_HABIT_DEFINITIONS;
}

const SUBJECT_BY_SOURCE: Record<string, string> = {
  dsm5: 'Abnormal Psychology',
  pharma: 'Psychopharmacology',
  assessment: 'Psychological Assessment',
  dev: 'Developmental Psychology',
  io: 'Industrial/Organizational Psychology',
  local_test: 'Psychological Assessment',
};

export function getSubjectKey(question: Question): string {
  if (question.source && SUBJECT_BY_SOURCE[question.source]) {
    return SUBJECT_BY_SOURCE[question.source];
  }
  return question.category || 'General Practice';
}

export function updateSubjectAccuracy(
  existing: Record<string, number> | undefined,
  subject: string,
  isCorrect: boolean
): Record<string, number> {
  const next = { ...(existing || {}) };
  const prior = next[subject] ?? 0.5;
  const delta = isCorrect ? 0.05 : -0.05;
  next[subject] = Math.min(1, Math.max(0, prior + delta));
  return next;
}

/** Vignette snippets sent to the AI (not base64 hashes). */
export function recordQuestionVignette(history: string[] | undefined, vignette: string): string[] {
  const snippet = vignette.trim().substring(0, 220);
  if (!snippet) return history || [];
  const existing = (history || []).filter(isVignetteSnippet);
  if (existing.includes(snippet)) return existing.slice(-100);
  return [...existing, snippet].slice(-100);
}

export function isVignetteSnippet(entry: string): boolean {
  if (!entry || entry.length < 12) return false;
  if (entry.includes(' ')) return true;
  return entry.length > 48;
}

export function getPreviousQuestionsForAi(profile: UserProfile): string[] {
  if (!profile.rememberQuestionHistory) return [];
  return (profile.questionHistory || []).filter(isVignetteSnippet).slice(-30);
}

export function getDailyQuestionLimit(tier: UserProfile['tier']): number | null {
  if (tier === 'Pro' || tier === 'Clinical') return null;
  if (tier === 'Clinical Trial') return 3;
  if (tier === 'Free') return 1;
  return 3;
}

export function isLimitedTier(tier: UserProfile['tier']): boolean {
  return getDailyQuestionLimit(tier) !== null;
}

export function getQuestionsUsedToday(profile: UserProfile): number {
  const today = new Date().toISOString().split('T')[0];
  return profile.heat?.[today] || 0;
}

export const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '';
