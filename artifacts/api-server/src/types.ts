export interface Question {
  id?: string;
  category: string;
  vignette: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  source?: 'dsm5' | 'pharma' | 'assessment' | 'dev' | 'io' | 'local_test';
  difficulty?: 'easy' | 'medium' | 'hard' | 'random';
  testId?: string;
}

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
