import { PsychologyTest, Question } from '../types';
import { TESTS } from '../data/tests';
import { SEED_QUESTIONS } from '../data/seedQuestions';

export function generateLocalQuestionForTest(test: PsychologyTest, seedValue: number): Question {
  const mode = seedValue % 4;

  const distractors = TESTS.filter(t => t.id !== test.id);

  if (mode === 0) {
    const options = [test.developer, ...distractors.slice(0, 3).map(d => d.developer)]
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 4);
    while (options.length < 4) {
      options.push("Inapplicable researcher");
    }
    const shuffled = [...options].sort(() => Math.random() - 0.5);
    const correctIndex = shuffled.indexOf(test.developer);
    return {
      category: `Psychological Assessment — Developers`,
      vignette: `According to standard Philippine board reviews in psychological assessment, who is officially credited with developing the "${test.name}"?`,
      options: shuffled,
      correctIndex,
      explanation: `The "${test.name}" was developed by ${test.developer}. Its clinical purpose is: ${test.purpose}`,
      source: 'assessment',
      testId: test.id
    };
  } else if (mode === 1) {
    const correctAns = `${test.administration.type} test (${test.administration.items} items), suitable for ${test.administration.ageRange}.`;
    const options = [
      correctAns,
      `Self-administered questionnaire (120 items), suitable for children aged 3-6 years.`,
      `Individually rated assessment (10 items), targeting psychiatric adult inpatients.`,
      `Group test (45 items) with a strict 3-hour time constraint.`
    ];
    const shuffled = [...options].sort(() => Math.random() - 0.5);
    const correctIndex = shuffled.indexOf(correctAns);
    return {
      category: `Psychological Assessment — Standard Administration`,
      vignette: `When preparing a testing room for the "${test.name}", what standard administration parameters (type, approximate items, and target age group) must the psychometrician observe?`,
      options: shuffled,
      correctIndex,
      explanation: `The "${test.name}" is administered as a ${test.administration.type} test with ${test.administration.items} items, targeted for ${test.administration.ageRange}, and generally takes about ${test.administration.time} to complete.`,
      source: 'assessment',
      testId: test.id
    };
  } else if (mode === 2) {
    const options = [test.scoring, ...distractors.map(d => d.scoring)].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4);
    while (options.length < 4) {
      options.push("Score sum evaluated on a 5-point ordinal scale of 1 to 5.");
    }
    const shuffled = [...options].sort(() => Math.random() - 0.5);
    const correctIndex = shuffled.indexOf(test.scoring);
    return {
      category: `Psychological Assessment — Scoring & Standard Metrics`,
      vignette: `In reports prepared under the Philippine Psychology Act of 2009 (RA 10029), what metric or scoring methodology is validated for interpreting the "${test.name}"?`,
      options: shuffled,
      correctIndex,
      explanation: `The "${test.name}" is scored by: ${test.scoring}. Clinical interpretation guidelines state: ${test.interpretation}`,
      source: 'assessment',
      testId: test.id
    };
  } else {
    const options = [test.factorsMeasured, ...distractors.map(d => d.factorsMeasured)].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4);
    while (options.length < 4) {
      options.push("General intelligence and cognitive deterioration ratio.");
    }
    const shuffled = [...options].sort(() => Math.random() - 0.5);
    const correctIndex = shuffled.indexOf(test.factorsMeasured);
    return {
      category: `Psychological Assessment — Factors Measured`,
      vignette: `A licensed psychologist indicates that a client's profile shows significant findings on certain subscales/factors. Which specific constructs or factors are primarily measured by the "${test.name}"?`,
      options: shuffled,
      correctIndex,
      explanation: `The "${test.name}" is designated to measure: ${test.factorsMeasured}. Quick description: ${test.quickInfo}`,
      source: 'assessment',
      testId: test.id
    };
  }
}

export function getRandomLocalQuestion(
  source?: 'dsm5' | 'pharma' | 'assessment' | 'dev' | 'io',
  difficulty?: 'easy' | 'medium' | 'hard' | 'random'
): Question {
  if (source === 'assessment' && (!difficulty || difficulty === 'random' || difficulty === 'easy' || difficulty === 'medium')) {
    const randomTest = TESTS[Math.floor(Math.random() * TESTS.length)];
    const q = generateLocalQuestionForTest(randomTest, Math.floor(Math.random() * 100));
    q.difficulty = difficulty === 'random' ? 'easy' : difficulty;
    return q;
  }
  let filtered = source ? SEED_QUESTIONS.filter(q => q.source === source) : SEED_QUESTIONS;
  if (difficulty && difficulty !== 'random') {
    const diffMatch = filtered.filter(q => q.difficulty === difficulty);
    if (diffMatch.length > 0) {
      filtered = diffMatch;
    }
  }
  const pool = filtered.length > 0 ? filtered : SEED_QUESTIONS;
  return pool[Math.floor(Math.random() * pool.length)];
}
