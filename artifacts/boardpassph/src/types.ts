export interface TestAdministration {
  type: string;
  items: string;
  ageRange: string;
  time: string;
  trainingNeeded: string;
}

export interface PsychologyTest {
  id: string;
  name: string;
  category: string;
  developer: string;
  quickInfo: string;
  purpose: string;
  administration: TestAdministration;
  scoring: string;
  interpretation: string;
  mnemonics?: string;
  versions: string;
  factorsMeasured: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface Question {
  id?: string;
  category: string;
  vignette: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  source?: 'dsm5' | 'pharma' | 'assessment' | 'dev' | 'io' | 'local_test';
  testId?: string;
  difficulty?: 'easy' | 'medium' | 'hard' | 'random';
}

export interface UserProfile {
  email: string;
  tier: 'Free' | 'Pro' | 'Clinical' | 'Clinical Trial';
  adaptive: boolean;
  // coins system removed; legacy data may exist but UI no longer uses it
  username?: string;
  school?: string;
  photo?: string;
  totalXp: number;
  streak: number;
  streakShields: number;
  lastDate: string;
  currentCombo: number;
  attempts: number;
  correct: number;
  deck: Question[];
  notes: Record<string, string>;
  heat: Record<string, number>;
  badges: Record<string, boolean>;
  theme?: string;
  password?: string;
  passwordHint?: string;
  signUpDate?: string;
  moods?: Record<string, string>;
  habitsChecked?: Record<string, Record<string, boolean>>;
  calendarEvents?: Record<string, { id: string; title: string; note?: string; color: string }[]>;
  dailyChallenges?: Record<string, 'correct' | 'incorrect'>;
  // New settings
  allowPushNotifications?: boolean;
  rememberQuestionHistory?: boolean;
  autoSubjectAccuracy?: boolean;
  habits?: string[];
  habitDefinitions?: { id: string; name: string; xp: number }[];
  questionHistory?: string[]; // vignette snippets for AI deduplication
  subjectAccuracy?: Record<string, number>;
}

export interface ExamQuestionState {
  question: Question;
  selectedAnswer: number | null;
  flagged: boolean;
}

export interface MockExamState {
  questions: ExamQuestionState[];
  currentQuestionIndex: number;
  secondsRemaining: number;
  isActive: boolean;
  isCompleted: boolean;
  focusArea: string;
  score: number;
  gainedXp: number;
}
