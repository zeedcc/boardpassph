import { PsychologyTest, Category } from '../types';

export const CATEGORIES: Category[] = [
  {
    id: 'intelligence',
    name: 'I. Intelligence & Developmental Tests',
    description: 'Assessments for cognitive ability, developmental milestones, and academic achievement (including achievement batteries).'
  },
  {
    id: 'personality',
    name: 'II. Personality & Clinical Tests',
    description: 'Inventories, projective techniques, and clinical scales for personality traits, emotional states, and psychopathologies.'
  },
  {
    id: 'interest',
    name: 'III. Interest & Career Tests',
    description: 'Tools designed to measure vocational interests, career preferences, and conative styles.'
  }
];

// Combine all into one exportable TESTS array for the app
export const TESTS: PsychologyTest[] = [
  {
    id: 'stanford-binet',
    name: 'Stanford–Binet Intelligence Scales',
    category: 'intelligence',
    developer: 'Alfred Binet & Theodore Simon (later Lewis Terman)',
    quickInfo: 'One of the oldest and most widely used intelligence tests.',
    purpose: 'To measure cognitive ability and intelligence across five factors.',
    administration: {
      type: 'Individual',
      items: 'Varies by level',
      ageRange: '2 to 85+ years',
      time: '45-90 minutes',
      trainingNeeded: 'High (Professional/Clinical)'
    },
    scoring: 'Standard Age Score (SAS), Mean of 100, SD of 15.',
    interpretation: 'Based on deviation IQ; compares performance to age-related norms.',
    mnemonics: 'S-B: Smart-Brains',
    versions: 'SB-5 (Current)',
    factorsMeasured: 'Fluid Reasoning, Knowledge, Quantitative Reasoning, Visual-Spatial Processing, Working Memory.'
  },
  {
    id: 'beck-depression-ii',
    name: 'Beck Depression Inventory (BDI-II)',
    category: 'personality',
    developer: 'Aaron T. Beck',
    quickInfo: 'The gold standard self-report for measuring depression severity.',
    purpose: 'To assess symptoms of depression matching DSM-IV criteria.',
    administration: {
      type: 'Self-report',
      items: '21',
      ageRange: '13 to 80 years',
      time: '5-10 minutes',
      trainingNeeded: 'Minimal for administration'
    },
    scoring: 'Sum of 21 items (0-3 each).',
    interpretation: '0-13 minimal, 14-19 mild, 20-28 moderate, 29-63 severe.',
    versions: 'BDI, BDI-1A, BDI-II',
    factorsMeasured: 'Affective, Cognitive, and Somatic symptoms of depression.'
  },
  {
    id: 'beck-anxiety',
    name: 'Beck Anxiety Inventory (BAI)',
    category: 'personality',
    developer: 'Aaron T. Beck',
    quickInfo: 'Measures the severity of anxiety in adults and adolescents.',
    purpose: 'To discriminate between anxiety and depression.',
    administration: {
      type: 'Self-report',
      items: '21',
      ageRange: '17 to 80 years',
      time: '5-10 minutes',
      trainingNeeded: 'Minimal'
    },
    scoring: 'Scale of 0-63.',
    interpretation: '0-7 minimal, 8-15 mild, 16-25 moderate, 26-63 severe.',
    versions: 'Standard',
    factorsMeasured: 'Subjective, somatic, and panic-related symptoms of anxiety.'
  },
  {
    id: 'beck-hopelessness',
    name: 'Beck Hopelessness Scale (BHS)',
    category: 'personality',
    developer: 'Aaron T. Beck',
    quickInfo: 'True/false inventory measuring negative expectations about the future.',
    purpose: 'To gauge suicide risk and negative outlook.',
    administration: {
      type: 'Self-report',
      items: '20',
      ageRange: '17 to 80 years',
      time: '5 minutes',
      trainingNeeded: 'Moderate'
    },
    scoring: '0-20 (higher indicates hopelessness).',
    interpretation: 'Identifies pessimistic views related to suicide potential.',
    versions: 'Standard',
    factorsMeasured: 'Feelings about the future, loss of motivation, expectations.'
  },
  {
    id: 'hamilton-anxiety',
    name: 'Hamilton Anxiety Rating Scale - Revised (HARS-R)',
    category: 'personality',
    developer: 'Max Hamilton',
    quickInfo: 'One of the first rating scales for anxiety symptoms.',
    purpose: 'To quantify the severity of anxiety symptoms.',
    administration: {
      type: 'Clinician-rated',
      items: '14',
      ageRange: 'Adults',
      time: '15-20 minutes',
      trainingNeeded: 'Moderate (Clinical)'
    },
    scoring: '0-56 scale.',
    interpretation: '<17 Mild, 18-24 Mild to Moderate, 25-30 Moderate to Severe.',
    versions: 'HARS, HARS-R',
    factorsMeasured: 'Psychic and somatic anxiety symptoms.'
  },
  {
    id: 'hamilton-depression',
    name: 'Hamilton Rating Scale for Depression (HRSD-R)',
    category: 'personality',
    developer: 'Max Hamilton',
    quickInfo: 'Commonly used clinician-administered depression scale.',
    purpose: 'To assess depression severity before, during, and after treatment.',
    administration: {
      type: 'Clinician-rated',
      items: '17 to 21',
      ageRange: 'Adults',
      time: '20-30 minutes',
      trainingNeeded: 'Clinical Professional'
    },
    scoring: '0-54 (on 17-item version).',
    interpretation: '0-7 Normal, 8-13 Mild, 14-18 Moderate, 19-22 Severe, >23 Very Severe.',
    versions: 'HAM-D (17, 21, 24 items)',
    factorsMeasured: 'Mood, feelings of guilt, suicide, insomnia, agitation, anxiety, etc.'
  },
  {
    id: 'mmpi',
    name: 'Minnesota Multiphasic Personality Inventory (MMPI)',
    category: 'personality',
    developer: 'Hathaway and McKinley',
    quickInfo: 'The most widely used clinical personality inventory.',
    purpose: 'To assess psychopathology and personality structure.',
    administration: {
      type: 'Self-report',
      items: '567 (MMPI-2)',
      ageRange: '18+ years',
      time: '60-90 minutes',
      trainingNeeded: 'High (Professional)'
    },
    scoring: 'T-scores (Mean 50, SD 10).',
    interpretation: 'Profile analysis based on validity and clinical scales.',
    versions: 'MMPI, MMPI-2, MMPI-2-RF, MMPI-3',
    factorsMeasured: 'Hypochondriasis, Depression, Hysteria, Psychopathic Deviate, Paranoia, Psychasthenia, Schizophrenia, Hypomania, Social Introversion.'
  },
  {
    id: 'wais-iii',
    name: 'Wechsler Adult Intelligence Scale - Third Edition (WAIS-III)',
    category: 'intelligence',
    developer: 'David Wechsler',
    quickInfo: 'A major revision of the adult intelligence scale.',
    purpose: 'To measure cognitive ability in adults.',
    administration: {
      type: 'Individual',
      items: '14 subtests',
      ageRange: '16 to 89 years',
      time: '75-100 minutes',
      trainingNeeded: 'High'
    },
    scoring: 'Verbal, Performance, and Full Scale IQ.',
    interpretation: 'Focuses on verbal comprehension and perceptual organization.',
    versions: 'WAIS-III (Legacy), WAIS-IV (Current)',
    factorsMeasured: 'Verbal Comprehension, Perceptual Organization, Working Memory, Processing Speed.'
  },
  {
    id: 'digit-span',
    name: 'Digit Span (WAIS subtest)',
    category: 'intelligence',
    developer: 'David Wechsler',
    quickInfo: 'Crucial subtest for measuring working memory.',
    purpose: 'To assess attention, concentration, and immediate memory.',
    administration: {
      type: 'Individual',
      items: 'Digits Forward, Backward, and Sequencing',
      ageRange: '16+ years',
      time: '5 minutes',
      trainingNeeded: 'Clinical Training'
    },
    scoring: 'Raw score converted to scaled score.',
    interpretation: 'Measures phonological loop and mental manipulation.',
    versions: 'Part of WAIS evolution',
    factorsMeasured: 'Auditory attention, short-term memory, working memory.'
  },
  {
    id: 'flanagan-industrial',
    name: 'Flanagan Industrial Tests (FIT)',
    category: 'intelligence',
    developer: 'John C. Flanagan',
    quickInfo: 'A battery for industrial selection and placement.',
    purpose: 'To assess specific aptitudes required for industrial jobs.',
    administration: {
      type: 'Group/Individual',
      items: '18 subtests',
      ageRange: 'Adults',
      time: '5-15 mins per subtest',
      trainingNeeded: 'Moderate'
    },
    scoring: 'Raw scores for each subtest.',
    interpretation: 'Matching profile to job requirements.',
    mnemonics: 'FIT: Factor-Industrial-Tests',
    versions: 'Standard',
    factorsMeasured: 'Assembly, Components, Coordination, Electronics, Expression, Ingenuity, Inspection, Judgment, Comprehension, Mathematics, Reasoning, Mechanics, Arithmetic, Memory, Patterns, Planning, Precision, Scales, Tables, Vocabulary.'
  },
  {
    id: 'fact-battery',
    name: 'FACT™ Battery',
    category: 'intelligence',
    developer: 'John C. Flanagan',
    quickInfo: 'Flanagan Aptitude Classification Test for vocational guidance.',
    purpose: 'To classify aptitudes for vocational guidance.',
    administration: {
      type: 'Group',
      items: '16 subtests',
      ageRange: 'High school and up',
      time: 'Several hours',
      trainingNeeded: 'High'
    },
    scoring: 'Specific aptitude profile.',
    interpretation: 'Predictive of occupational success.',
    versions: 'Standard',
    factorsMeasured: 'Inspecting, Coding, Memory, Precision, Assembly, Scales, Coordination, Judgment, Arithmetic, Patterns, Components, Tables, Mechanics, Expression, Reasoning, Ingenuity.'
  },
  {
    id: 'ipip-neo',
    name: 'IPIP-NEO Personality Test',
    category: 'personality',
    developer: 'Lewis Goldberg (International Personality Item Pool)',
    quickInfo: 'A public-domain version of the NEO-PI-R.',
    purpose: 'To measure the Big Five personality traits.',
    administration: {
      type: 'Self-report',
      items: '300 (Long) or 120 (Short)',
      ageRange: 'Adolescents to Adults',
      time: '15-40 minutes',
      trainingNeeded: 'Low'
    },
    scoring: 'Scores for 5 domains and 30 facets.',
    interpretation: 'Compares individual scores to normative database.',
    versions: 'Long and Short forms',
    factorsMeasured: 'Extraversion, Agreeableness, Conscientiousness, Neuroticism, Openness to Experience.'
  },
  {
    id: 'kolbe-index',
    name: 'Kolbe Index',
    category: 'interest',
    developer: 'Kathy Kolbe',
    quickInfo: 'Measures conative (instinctive) strengths.',
    purpose: 'To identify natural ways of taking action.',
    administration: {
      type: 'Self-report',
      items: '36',
      ageRange: 'Adults (Index A)',
      time: '15-20 minutes',
      trainingNeeded: 'Certification needed for interpretation'
    },
    scoring: 'Kolbe Result (e.g., 5-3-9-2).',
    interpretation: 'Based on 4 Action Modes.',
    versions: 'Kolbe A (Adult), Kolbe B (Job), Kolbe Y (Youth)',
    factorsMeasured: 'Fact Finder, Follow Through, Quick Start, Implementor.'
  },
  {
    id: 'benton-visual',
    name: 'Benton Visual Retention Test (Benton)',
    category: 'intelligence',
    developer: 'Arthur Benton',
    quickInfo: 'Measures visual perception and visual memory.',
    purpose: 'To identify brain damage and cognitive impairment.',
    administration: {
      type: 'Individual',
      items: '10 designs',
      ageRange: '8 years to Adults',
      time: '5-10 minutes',
      trainingNeeded: 'Moderate'
    },
    scoring: 'Number of correct designs and total errors.',
    interpretation: 'Performance compared to estimated premorbid levels.',
    versions: 'Forms C, D, E',
    factorsMeasured: 'Visual perception, visual memory, visuoconstructive abilities.'
  },
  {
    id: 'cpi',
    name: 'California Psychological Inventory (CPI)',
    category: 'personality',
    developer: 'Harrison Gough',
    quickInfo: 'The "sane man\'s MMPI."',
    purpose: 'To assess normal personality in social contexts.',
    administration: {
      type: 'Self-report',
      items: '434 items',
      ageRange: '13+ years',
      time: '45-60 minutes',
      trainingNeeded: 'Moderate'
    },
    scoring: 'Standardized scores on folk scales.',
    interpretation: 'Measures interpersonal behavior and social interactions.',
    versions: 'Original, 434-item, 260-item',
    factorsMeasured: 'Dominance, Capacity for Status, Sociability, Social Presence, Self-acceptance, etc.'
  },
  {
    id: 'das',
    name: 'Differential Ability Scales (DAS)',
    category: 'intelligence',
    developer: 'Colin Elliott',
    quickInfo: 'Profiles cognitive strengths and weaknesses.',
    purpose: 'To assess children\'s learning and cognitive abilities.',
    administration: {
      type: 'Individual',
      items: 'Varies by age',
      ageRange: '2.5 to 17 years',
      time: '45-60 minutes',
      trainingNeeded: 'High'
    },
    scoring: 'General Conceptual Ability (GCA) score.',
    interpretation: 'Focuses on subtest disparities.',
    versions: 'DAS, DAS-II',
    factorsMeasured: 'Verbal, Nonverbal Reasoning, Spatial Ability.'
  },
  {
    id: 'k-tea',
    name: 'Kaufman Test of Educational Achievement (K-TEA)',
    category: 'intelligence',
    developer: 'Alan & Nadeen Kaufman',
    quickInfo: 'Measures key academic skills.',
    purpose: 'To monitor student progress and identify needs.',
    administration: {
      type: 'Individual',
      items: 'Comprehensive & Brief forms',
      ageRange: '4 to 25 years',
      time: '30-80 minutes',
      trainingNeeded: 'Moderate'
    },
    scoring: 'Standardized achievement scores.',
    interpretation: 'Comparison between ability and achievement.',
    versions: 'Comprehensive Form, Brief Form (K-TEA-3)',
    factorsMeasured: 'Reading, Math, Written Expression, Oral Language.'
  },
  {
    id: 'wrat',
    name: 'Wide Range Achievement Test (WRAT)',
    category: 'intelligence',
    developer: 'Joseph Jastak (Original)',
    quickInfo: 'Rapid screening for academic skills.',
    purpose: 'To assess fundamental reading, spelling, and math skills.',
    administration: {
      type: 'Individual/Group',
      items: 'Short subtests',
      ageRange: '5 to 94 years',
      time: '15-30 minutes',
      trainingNeeded: 'Low to Moderate'
    },
    scoring: 'Standard scores, percentiles.',
    interpretation: 'Provides overall academic level.',
    versions: 'WRAT-5 (Current)',
    factorsMeasured: 'Word Reading, Sentence Comprehension, Spelling, Math Computation.'
  },
  {
    id: 'piat',
    name: 'Peabody Individual Achievement Test (PIAT)',
    category: 'intelligence',
    developer: 'Lunn & Dunn',
    quickInfo: 'Comprehensive screening of scholastic achievement.',
    purpose: 'To gain educational progress data.',
    administration: {
      type: 'Individual',
      items: 'Multiple-choice format',
      ageRange: '5 to 18 years',
      time: '30-40 minutes',
      trainingNeeded: 'Moderate'
    },
    scoring: 'Age and grade equivalents.',
    interpretation: 'Criterion-referenced screening.',
    versions: 'PIAT-R/NU',
    factorsMeasured: 'General Information, Reading Recognition, Reading Comprehension, Mathematics, Spelling.'
  },
  {
    id: 'mat-test',
    name: 'Metropolitan Achievement Test',
    category: 'intelligence',
    developer: 'Harcourt Assessments',
    quickInfo: 'Standardized assessment for Pre-K through Grade 12.',
    purpose: 'To evaluate academic knowledge and progress.',
    administration: {
      type: 'Group',
      items: 'Varies',
      ageRange: '4-18 years',
      time: 'Several hours',
      trainingNeeded: 'Moderate'
    },
    scoring: 'Scaled scores, national percentiles.',
    interpretation: 'School-level academic evaluation.',
    versions: 'MAT-8 (Current)',
    factorsMeasured: 'Reading, Math, Language, Science, Social Studies.'
  },
  {
    id: 'stanford-achievement',
    name: 'Stanford Achievement Test',
    category: 'intelligence',
    developer: 'Pearson Education',
    quickInfo: 'A battery used for standards-based school assessment.',
    purpose: 'To check student proficiency in national standards.',
    administration: {
      type: 'Group',
      items: 'Varies',
      ageRange: 'K-12',
      time: 'Varies',
      trainingNeeded: 'Moderate'
    },
    scoring: 'Stanines, percentiles.',
    interpretation: 'Academic bench-marking.',
    versions: 'Stanford 10 (Current)',
    factorsMeasured: 'Reading, Math, Language, Science, Social Studies.'
  },
  {
    id: 'k-abc',
    name: 'Kaufman Assessment Battery for Children (K-ABC)',
    category: 'intelligence',
    developer: 'Alan & Nadeen Kaufman',
    quickInfo: 'Minimizes verbal content for fairer testing.',
    purpose: 'To assess intelligence and achievement in children.',
    administration: {
      type: 'Individual',
      items: 'Sequential & Simultaneous processing',
      ageRange: '3 to 18 years',
      time: '30-70 minutes',
      trainingNeeded: 'High'
    },
    scoring: 'MPC (Mental Processing Composite).',
    interpretation: 'Neurological vs. Cattell-Horn-Carroll models.',
    versions: 'KABC-II (Current)',
    factorsMeasured: 'Sequential Processing, Simultaneous Processing, Planning, Learning, Knowledge.'
  },
  {
    id: 'mapi',
    name: 'Millon Adolescent Personality Inventory (MAPI)',
    category: 'personality',
    developer: 'Theodore Millon',
    quickInfo: 'Designed for the unique personality of adolescents.',
    purpose: 'To identify personality styles and behavioral trends.',
    administration: {
      type: 'Self-report',
      items: '150 items',
      ageRange: '13-18 years',
      time: '20-30 minutes',
      trainingNeeded: 'High'
    },
    scoring: 'Base Rate (BR) scores.',
    interpretation: 'Focuses on adolescent concerns.',
    versions: 'Standard',
    factorsMeasured: 'Personality styles, expressed concerns, behavioral trends.'
  },
  {
    id: 'pai',
    name: 'Personality Assessment Inventory (PAI)',
    category: 'personality',
    developer: 'Leslie Morey',
    quickInfo: 'Comprehensive assessment of adult psychopathology.',
    purpose: 'To provide info for clinical diagnosis and treatment.',
    administration: {
      type: 'Self-report',
      items: '344 items',
      ageRange: '18+ years',
      time: '40-50 minutes',
      trainingNeeded: 'High'
    },
    scoring: 'T-scores on 22 non-overlapping scales.',
    interpretation: 'Assesses common clinical syndromes.',
    versions: 'Adult, Adolescent (PAI-A)',
    factorsMeasured: 'Somatic complaints, Anxiety, Depression, Mania, Paranoia, Schizophrenia, Borderline, Antisocial.'
  },
  {
    id: 'stai',
    name: 'State-Trait Anxiety Inventory (STAI)',
    category: 'personality',
    developer: 'Charles Spielberger',
    quickInfo: 'Differentiates between temporary and stable anxiety.',
    purpose: 'To measure "state" and "trait" anxiety.',
    administration: {
      type: 'Self-report',
      items: '40',
      ageRange: 'Adults',
      time: '10-20 minutes',
      trainingNeeded: 'Minimal'
    },
    scoring: 'Range of 20-80.',
    interpretation: 'Higher scores indicate greater anxiety.',
    versions: 'Form X, Form Y',
    factorsMeasured: 'State Anxiety, Trait Anxiety.'
  },
  {
    id: 'wahler',
    name: 'Wahler Physical Symptoms Inventory',
    category: 'personality',
    developer: 'H. J. Wahler',
    quickInfo: 'Measures self-reported somatic complaints.',
    purpose: 'To gauge physical symptoms related to psychological stress.',
    administration: {
      type: 'Self-report',
      items: '42 items',
      ageRange: 'Adults',
      time: '5-10 minutes',
      trainingNeeded: 'Minimal'
    },
    scoring: 'Frequency of somatic symptoms.',
    interpretation: 'High scores suggest somatization.',
    versions: 'Standard',
    factorsMeasured: 'Somatic distress symptoms.'
  },
  {
    id: 'fear-survey',
    name: 'Fear Survey Schedule',
    category: 'personality',
    developer: 'Wolpe & Lang',
    quickInfo: 'Measures self-reported fear response.',
    purpose: 'To identify specific phobias and fear severity.',
    administration: {
      type: 'Self-report',
      items: '72-108 items',
      ageRange: 'Adults',
      time: '10-15 minutes',
      trainingNeeded: 'Minimal'
    },
    scoring: 'Severity rating for each stimulus.',
    interpretation: 'Hierarchical mapping of fears.',
    versions: 'FSS-III, FSS-II',
    factorsMeasured: 'Animal fear, social anxiety, tissue damage fear.'
  },
  {
    id: 'spm',
    name: 'Raven Standard Progressive Matrices (SPM)',
    category: 'intelligence',
    developer: 'John C. Raven',
    quickInfo: 'Classic non-verbal intelligence test.',
    purpose: 'To measure abstract reasoning and fluid intelligence.',
    administration: {
      type: 'Group/Individual',
      items: '60 items',
      ageRange: '6 years and up',
      time: '45 minutes',
      trainingNeeded: 'Minimal'
    },
    scoring: 'Sum of correct responses converted to percentiles.',
    interpretation: 'Measures "g" (general intelligence).',
    versions: 'Standard, Coloured, Advanced',
    factorsMeasured: 'Abstract reasoning, spatial ability.'
  },
  {
    id: 'vabs',
    name: 'Vineland Adaptive Behavior Scales (VABS)',
    category: 'intelligence',
    developer: 'Edgar Doll (Original), Sparrow et al. (Current)',
    quickInfo: 'Measures adaptive behavior and social competence.',
    purpose: 'To assess personal and social sufficiency.',
    administration: {
      type: 'Interview/Checklist',
      items: 'Varies',
      ageRange: 'Birth to 90 years',
      time: '20-60 minutes',
      trainingNeeded: 'Moderate'
    },
    scoring: 'Standard scores, v-scores, age equivalents.',
    interpretation: 'Comparison of adaptive behavior to age-matched peers.',
    versions: 'Vineland-3 (Current)',
    factorsMeasured: 'Communication, Daily Living Skills, Socialization, Motor Skills.'
  },
  {
    id: 'wiat',
    name: 'Wechsler Individual Achievement Test (WIAT)',
    category: 'intelligence',
    developer: 'The Psychological Corporation',
    quickInfo: 'Assesses clinical academic achievement.',
    purpose: 'To assess academic skills across reading, math, and writing.',
    administration: {
      type: 'Individual',
      items: 'Subtests vary',
      ageRange: '4 to 85 years',
      time: '45-90 minutes',
      trainingNeeded: 'Moderate'
    },
    scoring: 'Standard scores, percentiles.',
    interpretation: 'Used for identifying learning disabilities.',
    versions: 'WIAT-4 (Current)',
    factorsMeasured: 'Reading, Writing, Mathematics, Oral Language.'
  },
  {
    id: 'wms-iii',
    name: 'Wechsler Memory Scale - Third Edition (WMS-III)',
    category: 'intelligence',
    developer: 'David Wechsler',
    quickInfo: 'Assesses various memory functions.',
    purpose: 'To assess memory components.',
    administration: {
      type: 'Individual',
      items: '11 subtests',
      ageRange: '16 to 89 years',
      time: '30-45 minutes',
      trainingNeeded: 'High'
    },
    scoring: 'Index scores for Auditory, Visual, Working Memory.',
    interpretation: 'Evaluates immediate and delayed recall.',
    versions: 'WMS-IV (Current)',
    factorsMeasured: 'Immediate Memory, Delayed Memory, Working Memory, Auditory/Visual Memory.'
  },
  {
    id: 'woodcock-cognitive',
    name: 'Woodcock-Johnson III Test of Cognitive Ability',
    category: 'intelligence',
    developer: 'Woodcock, McGrew, Mather',
    quickInfo: 'Based on the CHC theory of intelligence.',
    purpose: 'To provide a broad assessment of cognitive ability.',
    administration: {
      type: 'Individual',
      items: '20 subtests',
      ageRange: '2 to 90 years',
      time: '60-90 minutes',
      trainingNeeded: 'High'
    },
    scoring: 'GIA (General Intellectual Ability).',
    interpretation: 'Discrepancy analysis for learning issues.',
    versions: 'WJ-IV (Current)',
    factorsMeasured: 'Comprehension-Knowledge, Long-Term Retrieval, Visual-Spatial Thinking, Auditory Processing, Fluid Reasoning, Processing Speed, Short-Term Memory.'
  },
  {
    id: 'woodcock-achievement',
    name: 'Woodcock-Johnson III Test of Achievement',
    category: 'intelligence',
    developer: 'Woodcock, McGrew, Mather',
    quickInfo: 'Comprehensive assessment of academic skills.',
    purpose: 'To evaluate academic knowledge and diagnostic info.',
    administration: {
      type: 'Individual',
      items: 'Standard & Extended batteries',
      ageRange: '2 to 90 years',
      time: '60-90 minutes',
      trainingNeeded: 'High'
    },
    scoring: 'Standard scores, grade equivalents.',
    interpretation: 'Academic bench-marking.',
    versions: 'WJ-IV (Current)',
    factorsMeasured: 'Reading, Math, Writing, Oral Language, Academic Knowledge.'
  },
  {
    id: 'lnnb',
    name: 'Luria-Nebraska Neuropsychological Battery (LNNB)',
    category: 'intelligence',
    developer: 'Charles Golden',
    quickInfo: 'Identifies neuropsychological impairment.',
    purpose: 'To screen for brain damage and cognitive impact.',
    administration: {
      type: 'Individual',
      items: '269 items',
      ageRange: '15+ years',
      time: '1.5-2.5 hours',
      trainingNeeded: 'High'
    },
    scoring: 'T-scores for 11 clinical scales.',
    interpretation: 'Diagnostic signs of brain damage.',
    versions: 'Form I and II',
    factorsMeasured: 'Motor, Rhythm, Tactile, Visual, Speech, Writing, Reading, Arithmetic, Memory, Intelligence.'
  },
  {
    id: 'halstead',
    name: 'Halstead Neuropsychological Battery',
    category: 'intelligence',
    developer: 'Ward Halstead & Ralph Reitan',
    quickInfo: 'Gold standard for assessing brain-behavior relationships.',
    purpose: 'To localize brain damage.',
    administration: {
      type: 'Individual Battery',
      items: 'Multiple subtests',
      ageRange: '5 to Adults',
      time: '5-8 hours',
      trainingNeeded: 'High'
    },
    scoring: 'Impairment Index.',
    interpretation: 'Pattern analysis of deficits.',
    versions: 'Standard',
    factorsMeasured: 'Sensory-perceptual, motor, language, attention, memory, executive functions.'
  },
  {
    id: 'hit',
    name: 'Holtzman Inkblot Technique (HIT)',
    category: 'personality',
    developer: 'Wayne Holtzman',
    quickInfo: 'Stronger psychometric projective test than Rorschach.',
    purpose: 'To address psychometric flaws of the Rorschach.',
    administration: {
      type: 'Individual',
      items: '45 cards',
      ageRange: '5 years to Adults',
      time: '45-60 minutes',
      trainingNeeded: 'High'
    },
    scoring: 'Standardized 22-variable system.',
    interpretation: 'Quantitative analysis of projective data.',
    versions: 'Form A and B',
    factorsMeasured: 'Location, Determinants, Content, Pathological thinking.'
  },
  {
    id: 'rorschach',
    name: 'Rorschach Inkblot Test',
    category: 'personality',
    developer: 'Hermann Rorschach',
    quickInfo: 'Famous projective test using inkblots.',
    purpose: 'To examine personality and emotional functioning.',
    administration: {
      type: 'Individual Projective',
      items: '10 symmetry inkblots',
      ageRange: '5 years and up',
      time: '45-90 minutes',
      trainingNeeded: 'Very High'
    },
    scoring: 'Exner System or R-PAS.',
    interpretation: 'Unstructured stimuli perception.',
    versions: 'Standard',
    factorsMeasured: 'Emotional states, perception style, interpersonal behavior.'
  },
  {
    id: 'temas',
    name: 'TEMAS',
    category: 'personality',
    developer: 'Constantino et al.',
    quickInfo: 'Multicultural thematic apperception test.',
    purpose: 'To assess personality in minority groups.',
    administration: {
      type: 'Projective',
      items: '23 cards',
      ageRange: '5-18 years',
      time: '45-60 mins',
      trainingNeeded: 'High'
    },
    scoring: 'Quantitative scale.',
    interpretation: 'Multicultural personality functions.',
    versions: 'Black and Hispanic forms',
    factorsMeasured: 'Interpersonal relationships, self-concept.'
  },
  {
    id: 'ppvt-r',
    name: 'Peabody Picture Vocabulary Test -- Revised (PPVT-R)',
    category: 'intelligence',
    developer: 'Dunn & Dunn',
    quickInfo: 'Measures receptive vocabulary.',
    purpose: 'To estimate verbal intelligence.',
    administration: {
      type: 'Individual',
      items: '175 items',
      ageRange: '2.5 to 90 years',
      time: '10-15 minutes',
      trainingNeeded: 'Low'
    },
    scoring: 'Standard scores, percentiles.',
    interpretation: 'Screening for verbal ability.',
    versions: 'PPVT-5 (Current)',
    factorsMeasured: 'Receptive vocabulary.'
  },
  {
    id: 'apm',
    name: 'Advanced Progressive Matrices (APM)',
    category: 'intelligence',
    developer: 'John C. Raven',
    quickInfo: 'A test of higher-level non-verbal reasoning.',
    purpose: 'To assess abstract reasoning in high-ability individuals.',
    administration: {
      type: 'Individual/Group',
      items: '36 items (Set II)',
      ageRange: 'Adolescents to Adults',
      time: '40-60 minutes',
      trainingNeeded: 'Minimal'
    },
    scoring: 'Standardized percentiles.',
    interpretation: 'Measures "g" in the top 20% of the population.',
    versions: 'Standard set',
    factorsMeasured: 'Complex non-verbal reasoning, eductive ability.'
  },
  {
    id: 'army-alpha-beta',
    name: 'Army Alpha/Beta Test',
    category: 'intelligence',
    developer: 'Robert Yerkes et al.',
    quickInfo: 'Historical group intelligence tests for military recruits.',
    purpose: 'To screen and classify recruits during WWI.',
    administration: {
      type: 'Group',
      items: 'Multiple subtests',
      ageRange: 'Adults (Recruits)',
      time: '45-60 minutes',
      trainingNeeded: 'Military Proctor'
    },
    scoring: 'Letter grades A to E.',
    interpretation: 'Alpha (Literate), Beta (Illiterate/Non-English).',
    versions: 'Alpha and Beta forms',
    factorsMeasured: 'General intelligence, spatial ability, verbal skills.'
  },
  {
    id: 'bender-gestalt',
    name: 'Bender Visual-Motor Gestalt Test, 2nd Edition',
    category: 'intelligence',
    developer: 'Lauretta Bender (Original), Gary Brannigan & Scott Decker (Revised)',
    quickInfo: 'Assesses visual-motor maturity and coordination.',
    purpose: 'To screen for developmental disorders and brain damage.',
    administration: {
      type: 'Individual',
      items: '16 figures (9 original + 7 new)',
      ageRange: '4 to 85+ years',
      time: '5-10 minutes',
      trainingNeeded: 'Moderate'
    },
    scoring: 'Global Scoring System.',
    interpretation: 'Evaluates visual-motor integration and processing.',
    versions: 'Bender-Gestalt II',
    factorsMeasured: 'Visual-motor integration, motor coordination, visual perception.'
  },
  {
    id: 'ctmm',
    name: 'California Test of Mental Maturity (CTMM)',
    category: 'intelligence',
    developer: 'Sullivan, Clark, & Tiegs',
    quickInfo: 'A group intelligence test for schools.',
    purpose: 'To provide diagnostic info on mental capacity.',
    administration: {
      type: 'Group',
      items: 'Language and Non-language subtests',
      ageRange: 'Kindergarten to Adult',
      time: '45-90 minutes',
      trainingNeeded: 'Teacher/Administrator'
    },
    scoring: 'M.A. (Mental Age) and IQ scores.',
    interpretation: 'Profiles verbal and non-verbal capacity.',
    versions: 'Standard',
    factorsMeasured: 'Memory, Spatial Relationships, Logical Reasoning, Numerical Reasoning, Verbal Concepts.'
  },
  {
    id: 'cpm',
    name: 'Colored Progressive Matrices (CPM)',
    category: 'intelligence',
    developer: 'John C. Raven',
    quickInfo: 'A simpler version of the RPM for specific populations.',
    purpose: 'To assess intelligence in children and the elderly.',
    administration: {
      type: 'Individual/Group',
      items: '36 items in 3 sets',
      ageRange: '5 to 11 years, and elderly',
      time: '15-30 minutes',
      trainingNeeded: 'Minimal'
    },
    scoring: 'Raw score to percentile.',
    interpretation: 'Measures eductive ability in lower age ranges.',
    versions: 'Standard',
    factorsMeasured: 'Observation, clear thinking, non-verbal logic.'
  },
  {
    id: 'cfit',
    name: 'Culture Fair Intelligence Test (CFIT)',
    category: 'intelligence',
    developer: 'Raymond B. Cattell',
    quickInfo: 'Designed to measure fluid intelligence with minimal cultural bias.',
    purpose: 'To assess intelligence while controlling for education and culture.',
    administration: {
      type: 'Group/Individual',
      items: '4 subtests (Series, Classification, Matrices, Conditions)',
      ageRange: '4 years to Adult (3 Scales)',
      time: '12-30 minutes',
      trainingNeeded: 'Moderate'
    },
    scoring: 'Normalized IQ scores.',
    interpretation: 'Measures fluid intelligence (Gf).',
    versions: 'Scale 1, Scale 2, Scale 3',
    factorsMeasured: 'Fluid intelligence, non-verbal reasoning.'
  },
  {
    id: 'mbti',
    name: 'Myers-Briggs Type Indicator (MBTI)',
    category: 'personality',
    developer: 'Katharine Cook Briggs & Isabel Briggs Myers',
    quickInfo: 'The world\'s most popular personality type instrument.',
    purpose: 'To help people understand their personal preferences.',
    administration: {
      type: 'Self-report',
      items: '93 items (Form M)',
      ageRange: '14+ years',
      time: '20-30 minutes',
      trainingNeeded: 'Certification Required for Professionals'
    },
    scoring: 'Categorization into 16 types (e.g., INTJ).',
    interpretation: 'Based on 4 dichotomies (E/I, S/N, T/F, J/P).',
    versions: 'Step I, Step II',
    factorsMeasured: 'Extraversion/Introversion, Sensing/Intuition, Thinking/Feeling, Judging/Perceiving.'
  },
  {
    id: 'neo-pi-r',
    name: 'NEO Personality Inventory, Revised (NEO-PI-R)',
    category: 'personality',
    developer: 'Paul Costa Jr. & Robert McCrae',
    quickInfo: 'The definitive instrument for the Five Factor Model (FFM).',
    purpose: 'To provide a comprehensive assessment of adult personality.',
    administration: {
      type: 'Self-report / Observer-report',
      items: '240 items',
      ageRange: '17+ years',
      time: '35-45 minutes',
      trainingNeeded: 'Moderate'
    },
    scoring: 'T-scores for 5 domains and 30 facets.',
    interpretation: 'Profile analysis of the "Big Five."',
    versions: 'NEO-PI-R, NEO-PI-3 (Current), NEO-FFI (Short)',
    factorsMeasured: 'Neuroticism, Extraversion, Openness, Agreeableness, Conscientiousness.'
  },
  {
    id: 'qoli',
    name: 'Quality of Life Inventory (QOLI)',
    category: 'personality',
    developer: 'Michael Frisch',
    quickInfo: 'Measures life satisfaction and well-being.',
    purpose: 'To assess a person\'s quality of life and plan interventions.',
    administration: {
      type: 'Self-report',
      items: '32 items',
      ageRange: '17+ years',
      time: '5-10 minutes',
      trainingNeeded: 'Minimal'
    },
    scoring: 'Weighted satisfaction scores.',
    interpretation: 'Measures happiness across 16 life areas.',
    versions: 'Standard',
    factorsMeasured: 'Health, Self-Esteem, Goals, Money, Work, Play, Love, Friends, etc.'
  },
  {
    id: 'ssct',
    name: 'Sach\'s Sentence Completion Test (SSCT)',
    category: 'personality',
    developer: 'Joseph M. Sacks',
    quickInfo: 'A semi-structured projective technique.',
    purpose: 'To obtain clinical data on attitudes and interpersonal relationships.',
    administration: {
      type: 'Individual/Group Projective',
      items: '60 items',
      ageRange: 'Adults',
      time: '20-40 minutes',
      trainingNeeded: 'High'
    },
    scoring: 'Rating scale (0-2) of disturbance.',
    interpretation: 'Evaluates family, sex, interpersonal, and self-concept areas.',
    versions: 'Standard',
    factorsMeasured: 'Significant attitudes and ego conflicts.'
  },
  {
    id: 'scbg',
    name: 'Sentence Completion for Boys and Girls',
    category: 'personality',
    developer: 'Various versions (e.g., Hart, Rotter)',
    quickInfo: 'Projective technique adapted for children.',
    purpose: 'To explore a child\'s emotional world and concerns.',
    administration: {
      type: 'Individual Projective',
      items: '30-40 items',
      ageRange: '7 to 12 years',
      time: '20-30 minutes',
      trainingNeeded: 'Moderate'
    },
    scoring: 'Qualitative/Thematic analysis.',
    interpretation: 'Identify themes of family, school, and social anxiety.',
    versions: 'Standard adaptions',
    factorsMeasured: 'Inner thoughts, anxieties, and desires in children.'
  },
  {
    id: 'tat',
    name: 'Thematic Apperception Test (TAT)',
    category: 'personality',
    developer: 'Henry Murray & Christiana Morgan',
    quickInfo: 'A "picture interpretation technique" projective test.',
    purpose: 'To uncover a person\'s unconscious drives and conflicts.',
    administration: {
      type: 'Individual Projective',
      items: '31 picture cards (usually 10-12 used)',
      ageRange: '5 years to Adult',
      time: '60-120 minutes',
      trainingNeeded: 'Very High (Clinical)'
    },
    scoring: 'Qualitative analysis of needs and presses.',
    interpretation: 'Story analysis reveals underlying personality dynamics.',
    versions: 'Standard set',
    factorsMeasured: 'Needs, presses, interpersonal patterns, achievement motivation.'
  },
  {
    id: 'bpi',
    name: 'Basic Personality Inventory (BPI)',
    category: 'personality',
    developer: 'Douglas N. Jackson',
    quickInfo: 'A true/false personality inventory for clinical and non-clinical use.',
    purpose: 'To identify psychopathology in adolescents and adults.',
    administration: {
      type: 'Self-report',
      items: '240 items',
      ageRange: '12 years to Adult',
      time: '35-45 minutes',
      trainingNeeded: 'Moderate'
    },
    scoring: '12 clinical scales.',
    interpretation: 'T-scores used to identify social and emotional maladjustment.',
    versions: 'Standard',
    factorsMeasured: 'Hypochondriasis, Depression, Denial, Interpersonal Problems, Alienation, Persecutory Ideas, Anxiety, etc.'
  },
  {
    id: 'epps',
    name: 'Edwards Personal Preference Schedule (EPPS)',
    category: 'personality',
    developer: 'Allen L. Edwards',
    quickInfo: 'Measures non-psychopathological traits.',
    purpose: 'To assess the relative strength of 15 personality needs.',
    administration: {
      type: 'Forced-choice Inventory',
      items: '225 pairs of statements',
      ageRange: 'College students and Adults',
      time: '40-50 minutes',
      trainingNeeded: 'Moderate'
    },
    scoring: 'Ipsative scoring (forced choice).',
    interpretation: 'Based on Murray\'s system of needs.',
    versions: 'Standard',
    factorsMeasured: 'Achievement, Deference, Order, Exhibition, Autonomy, Affiliation, Intraception, Succorance, Dominance, Abasement, Nurturance, Change, Endurance, Heterosexuality, Aggression.'
  },
  {
    id: '16pf',
    name: 'Sixteen Personality Factor Questionnaire (16PF)',
    category: 'personality',
    developer: 'Raymond B. Cattell',
    quickInfo: 'Measures 16 primary personality factors.',
    purpose: 'To provide a comprehensive profile of normal personality.',
    administration: {
      type: 'Self-report',
      items: '185 items (5th Ed)',
      ageRange: '16 years to Adult',
      time: '35-50 minutes',
      trainingNeeded: 'High'
    },
    scoring: 'Sten scores (Standard Ten).',
    interpretation: 'Profile analysis across 16 primary and 5 global factors.',
    versions: '16PF 5th Edition (Current)',
    factorsMeasured: 'Warmth, Reasoning, Emotional Stability, Dominance, Liveliness, Rule-Consciousness, Social Boldness, Sensitivity, Vigilance, Abstractedness, Privateness, Apprehension, Openness to Change, Self-Reliance, Perfectionism, Tension.'
  },
  {
    id: 'neo-ffi',
    name: 'NEO Five Factor Inventory (NEO-FFI)',
    category: 'personality',
    developer: 'Paul Costa Jr. & Robert McCrae',
    quickInfo: 'The short version of the NEO-PI-R.',
    purpose: 'To provide a brief, comprehensive measure of the Big Five.',
    administration: {
      type: 'Self-report',
      items: '60 items',
      ageRange: '17+ years',
      time: '10-15 minutes',
      trainingNeeded: 'Moderate'
    },
    scoring: 'T-scores for 5 domains.',
    interpretation: 'Overview of the Big Five without facet-level detail.',
    versions: 'NEO-FFI-3',
    factorsMeasured: 'Neuroticism, Extraversion, Openness, Agreeableness, Conscientiousness.'
  },
  {
    id: 'pup',
    name: 'Panukat ng Ugali at Pagkatao (PUP)',
    category: 'personality',
    developer: 'Virgilio Enriquez',
    quickInfo: 'Indigenous Filipino personality test.',
    purpose: 'To measure Filipino personality traits and behaviors.',
    administration: {
      type: 'Self-report',
      items: '160 items',
      ageRange: 'Adults',
      time: '45-60 minutes',
      trainingNeeded: 'Moderate'
    },
    scoring: 'Based on 24 trait scales.',
    interpretation: 'Contextualized within Filipino psychology (Sikolohiyang Pilipino).',
    versions: 'Standard',
    factorsMeasured: 'Ambition, Honesty, Helpfulness, Emotional Stability, etc.'
  },
  {
    id: 'mapangloob',
    name: 'Masaklaw na Panukat ng Loob (Mapangloob)',
    category: 'personality',
    developer: 'Gregorio E.H. Del Pilar',
    quickInfo: 'Filipino Five-Factor Model inventory.',
    purpose: 'To assess the Big Five personality traits in the Filipino context.',
    administration: {
      type: 'Self-report',
      items: '188 items',
      ageRange: 'College students and Adults',
      time: '45-60 minutes',
      trainingNeeded: 'Moderate'
    },
    scoring: 'T-scores for 5 domains and 20 facets.',
    interpretation: 'Cultural adaptation of the FFM.',
    versions: 'Standard',
    factorsMeasured: 'Hinahon (Neuroticism), Sigla (Extraversion), Bukas-loob (Openness), Bait (Agreeableness), Sipag (Conscientiousness).'
  },
  {
    id: 'cbcl',
    name: 'Child Behavior Checklist (CBCL)',
    category: 'personality',
    developer: 'Thomas Achenbach',
    quickInfo: 'Parent-report for identifying child behavior problems.',
    purpose: 'To detect emotional and behavioral problems in children.',
    administration: {
      type: 'Parent/Teacher/Self Report',
      items: '113 items',
      ageRange: '1.5 to 18 years',
      time: '15-20 minutes',
      trainingNeeded: 'Moderate'
    },
    scoring: 'T-scores for internalizing and externalizing behaviors.',
    interpretation: 'Identifies syndromes like anxiety, depression, and aggression.',
    versions: 'ASEBA forms',
    factorsMeasured: 'Anxious/Depressed, Withdrawn, Somatic Complaints, Social Problems, Thought Problems, Attention Problems, Rule-Breaking, Aggressive Behavior.'
  },
  {
    id: 'waIS-iv',
    name: 'Wechsler Adult Intelligence Scale - Fourth Edition (WAIS-IV)',
    category: 'intelligence',
    developer: 'David Wechsler / Pearson',
    quickInfo: 'Current standard for adult intelligence testing.',
    purpose: 'To measure intellectual ability in older adolescents and adults.',
    administration: {
      type: 'Individual',
      items: '10 core subtests, 5 supplemental',
      ageRange: '16 to 90 years',
      time: '60-90 minutes',
      trainingNeeded: 'High'
    },
    scoring: 'Full Scale IQ (FSIQ) and 4 Index scores.',
    interpretation: 'Cognitive profiling across 4 domains.',
    versions: 'WAIS, WAIS-R, WAIS-III, WAIS-IV',
    factorsMeasured: 'Verbal Comprehension, Perceptual Reasoning, Working Memory, Processing Speed.'
  },
  {
    id: 'wj-iii-cog',
    name: 'Woodcock-Johnson III Tests of Cognitive Abilities',
    category: 'intelligence',
    developer: 'Woodcock, McGrew, & Mather',
    quickInfo: 'A battery based on the Cattell-Horn-Carroll (CHC) theory.',
    purpose: 'To assess general and specific cognitive abilities.',
    administration: {
      type: 'Individual',
      items: 'Up to 20 subtests',
      ageRange: '2 to 90+ years',
      time: '60-90 minutes',
      trainingNeeded: 'High'
    },
    scoring: 'Standard scores, percentiles, GIA score.',
    interpretation: 'Identifies cognitive strengths and weaknesses.',
    versions: 'WJ-III, WJ-IV',
    factorsMeasured: 'Comprehension-Knowledge, Long-Term Retrieval, Visual-Spatial Thinking, Auditory Processing, Fluid Reasoning, Processing Speed, Short-Term Memory.'
  },
  {
    id: 'wj-iii-ach',
    name: 'Woodcock-Johnson III Tests of Achievement',
    category: 'intelligence',
    developer: 'Woodcock, McGrew, & Mather',
    quickInfo: 'Comprehensive academic assessment.',
    purpose: 'To evaluate academic proficiency and identify disabilities.',
    administration: {
      type: 'Individual',
      items: 'Up to 22 subtests',
      ageRange: '2 to 90+ years',
      time: '60-90 minutes',
      trainingNeeded: 'High'
    },
    scoring: 'Standard scores, grade equivalents.',
    interpretation: 'Compares academic achievement with cognitive potential.',
    versions: 'WJ-III, WJ-IV',
    factorsMeasured: 'Reading, Mathematics, Written Language, Oral Language.'
  },
  {
    id: 'dat',
    name: 'Differential Aptitude Test (DAT)',
    category: 'intelligence',
    developer: 'Bennett, Seashore, & Wesman',
    quickInfo: 'Integrated battery for vocational and educational guidance.',
    purpose: 'To assess specialized aptitudes related to success in various fields.',
    administration: {
      type: 'Group',
      items: '8 subtests',
      ageRange: 'Grades 7-12 and Adults',
      time: '2-3 hours',
      trainingNeeded: 'Moderate'
    },
    scoring: 'Percentile norms for each aptitude.',
    interpretation: 'Aptitude profile for career/school counseling.',
    versions: 'DAT for Guidance, DAT for Personnel Selection',
    factorsMeasured: 'Verbal Reasoning, Numerical Ability, Abstract Reasoning, Clerical Speed and Accuracy, Mechanical Reasoning, Space Relations, Spelling, Language Usage.'
  },
  {
    id: 'wpt',
    name: 'Wonderlic Personnel Test (WPT)',
    category: 'intelligence',
    developer: 'Eldon F. Wonderlic',
    quickInfo: 'A rapid 12-minute general intelligence test.',
    purpose: 'To determine general cognitive ability for employment.',
    administration: {
      type: 'Group/Individual',
      items: '50 items',
      ageRange: 'Adults',
      time: '12 minutes (Strict)',
      trainingNeeded: 'Low'
    },
    scoring: 'Raw score (0-50).',
    interpretation: 'Scores correspond to job complexity levels.',
    versions: 'WPT-R, WPT-Q',
    factorsMeasured: 'General cognitive ability, problem solving, speed.'
  },
  {
    id: 'ttct',
    name: 'Torrance Test of Creative Thinking (TTCT)',
    category: 'intelligence',
    developer: 'E. Paul Torrance',
    quickInfo: 'Leading instrument for measuring divergent thinking.',
    purpose: 'To assess the ability to think creatively.',
    administration: {
      type: 'Group/Individual',
      items: 'Verbal and Figural tasks',
      ageRange: 'Kindergarten to Adult',
      time: '30-90 minutes',
      trainingNeeded: 'Moderate to High'
    },
    scoring: 'Norm-referenced scores for 5 creative qualities.',
    interpretation: 'Identifies creative potential and strengths.',
    versions: 'TTCT Verbal, TTCT Figural',
    factorsMeasured: 'Fluency, Flexibility, Originality, Elaboration, Resistance to Premature Closure.'
  },
  {
    id: 'wrmaint',
    name: 'Woodcock Reading Mastery Test (WRMT)',
    category: 'intelligence',
    developer: 'Richard W. Woodcock',
    quickInfo: 'In-depth assessment of reading readiness and achievement.',
    purpose: 'To diagnose reading disabilities and track growth.',
    administration: {
      type: 'Individual',
      items: '9 subtests',
      ageRange: '4 to 75+ years',
      time: '15-45 minutes',
      trainingNeeded: 'Moderate'
    },
    scoring: 'Growth Scale Values (GSV).',
    interpretation: 'Detailed analysis of basic reading and comprehension skills.',
    versions: 'WRMT-III (Current)',
    factorsMeasured: 'Phonological Awareness, Letter Identification, Word Identification, Word Attack, Word Comprehension, Passage Comprehension.'
   },
   {
    id: 'wechsler-bellevue',
    name: 'Wechsler-Bellevue Intelligence Scale',
    category: 'intelligence',
    developer: 'David Wechsler',
    quickInfo: 'The precursor to the WAIS.',
    purpose: 'To measure adult intelligence (first of its kind).',
    administration: {
      type: 'Individual',
      items: '11 subtests',
      ageRange: 'Adults',
      time: '60-90 minutes',
      trainingNeeded: 'High'
    },
    scoring: 'IQ score with Verbal and Performance scales.',
    interpretation: 'Introduced the deviation IQ concept.',
    versions: '1939 Form I, 1946 Form II',
    factorsMeasured: 'Verbal and performance intelligence.'
  },
  {
    id: 'wais-r',
    name: 'Wechsler Adult Intelligence Scale - Revised (WAIS-R)',
    category: 'intelligence',
    developer: 'David Wechsler',
    quickInfo: 'The 1981 revision of the original WAIS.',
    purpose: 'To assess intellectual ability in adults.',
    administration: {
      type: 'Individual',
      items: '11 subtests',
      ageRange: '16 to 74 years',
      time: '60-90 minutes',
      trainingNeeded: 'High'
    },
    scoring: 'VIQ, PIQ, and FSIQ.',
    interpretation: 'Standardized on 1980 US Census data.',
    versions: 'Revised (Legacy)',
    factorsMeasured: 'Verbal and Performance intelligence.'
  },
  {
    id: 'wisc-r',
    name: 'Wechsler Intelligence Scale for Children - Revised (WISC-R)',
    category: 'intelligence',
    developer: 'David Wechsler',
    quickInfo: 'Legacy version for school-age children.',
    purpose: 'To measure intelligence in children.',
    administration: {
      type: 'Individual',
      items: '12 subtests',
      ageRange: '6 to 16 years',
      time: '50-70 minutes',
      trainingNeeded: 'High'
    },
    scoring: 'VIQ, PIQ, and FSIQ.',
    interpretation: 'Most widely used test for children in the 70s and 80s.',
    versions: 'Revised (Legacy)',
    factorsMeasured: 'Verbal and Performance components.'
  },
  {
    id: 'wisc-iii',
    name: 'Wechsler Intelligence Scale for Children - Third Edition (WISC-III)',
    category: 'intelligence',
    developer: 'David Wechsler / Pearson',
    quickInfo: '1991 revision for children.',
    purpose: 'To assess intellectual capacity and cognitive profile.',
    administration: {
      type: 'Individual',
      items: '13 subtests',
      ageRange: '6 to 16 years',
      time: '60-80 minutes',
      trainingNeeded: 'High'
    },
    scoring: 'IQ and Index scores.',
    interpretation: 'Focuses on four factor indices.',
    versions: 'Third Edition (Legacy)',
    factorsMeasured: 'Verbal Comprehension, Perceptual Organization, Freedom from Distractibility, Processing Speed.'
  },
  {
    id: 'wisc-iv',
    name: 'Wechsler Intelligence Scale for Children - Fourth Edition (WISC-IV)',
    category: 'intelligence',
    developer: 'David Wechsler / Pearson',
    quickInfo: '2003 revision for children.',
    purpose: 'To measure cognitive ability and provide clinical info.',
    administration: {
      type: 'Individual',
      items: '10 core subtests',
      ageRange: '6:0 to 16:11 years',
      time: '65-80 minutes',
      trainingNeeded: 'High'
    },
    scoring: 'FSIQ and 4 Index scores.',
    interpretation: 'Major shift from VIQ/PIQ to Index scores.',
    versions: 'WISC-IV (Legacy), WISC-V (Current)',
    factorsMeasured: 'Verbal Comprehension, Perceptual Reasoning, Working Memory, Processing Speed.'
  },
  {
    id: 'wppsi',
    name: 'Wechsler Preschool and Primary Scale of Intelligence (WPPSI)',
    category: 'intelligence',
    developer: 'David Wechsler',
    quickInfo: 'Intelligence scale for very young children.',
    purpose: 'To assess the cognitive development of preschoolers.',
    administration: {
      type: 'Individual',
      items: '11 subtests',
      ageRange: '4 to 6.5 years',
      time: '30-60 minutes',
      trainingNeeded: 'High'
    },
    scoring: 'VIQ, PIQ, and FSIQ.',
    interpretation: 'Measures early childhood development.',
    versions: 'Original (Legacy)',
    factorsMeasured: 'Verbal and Performance intelligence.'
  },
  {
    id: 'wppsi-r',
    name: 'Wechsler Preschool and Primary Scale of Intelligence - Revised (WPPSI-R)',
    category: 'intelligence',
    developer: 'David Wechsler',
    quickInfo: '1989 revision for young children.',
    purpose: 'To measure cognitive ability in children as young as 3.',
    administration: {
      type: 'Individual',
      items: '12 subtests',
      ageRange: '3 to 7 years',
      time: '60-90 minutes',
      trainingNeeded: 'High'
    },
    scoring: 'VIQ, PIQ, and FSIQ.',
    interpretation: 'Expanded age range from original WPPSI.',
    versions: 'Revised (Legacy)',
    factorsMeasured: 'Verbal and Performance intelligence.'
  },
  {
    id: 'wppsi-iii',
    name: 'Wechsler Preschool and Primary Scale of Intelligence - Third Edition (WPPSI-III)',
    category: 'intelligence',
    developer: 'David Wechsler',
    quickInfo: '2002 revision for preschoolers.',
    purpose: 'To provide a comprehensive cognitive assessment for young children.',
    administration: {
      type: 'Individual',
      items: '14 subtests',
      ageRange: '2.6 to 7.3 years',
      time: '30-50 minutes',
      trainingNeeded: 'High'
    },
    scoring: 'Full Scale IQ and Quotient scores.',
    interpretation: 'Includes a General Language Composite.',
    versions: 'WPPSI-III (Legacy), WPPSI-IV (Current)',
    factorsMeasured: 'Verbal, Performance, Processing Speed, General Language.'
  },
  {
    id: 'wiat-ii',
    name: 'Wechsler Individual Achievement Test - Second Edition (WIAT-II)',
    category: 'intelligence',
    developer: 'Pearson',
    quickInfo: 'Comprehensive achievement test linked to Wechsler IQ.',
    purpose: 'To identify achievement gaps and learning disabilities.',
    administration: {
      type: 'Individual',
      items: '9 subtests',
      ageRange: '4 to 85 years',
      time: '45-90 minutes',
      trainingNeeded: 'Moderate'
    },
    scoring: 'Standardized achievement composites.',
    interpretation: 'Analysis of ability-achievement discrepancies.',
    versions: 'WIAT-II (Legacy), WIAT-4 (Current)',
    factorsMeasured: 'Reading, Math, Writing, Oral Language.'
  },
  {
    id: 'stanford-math-diag',
    name: 'Stanford Diagnostic Mathematics Test',
    category: 'intelligence',
    developer: 'Beatty et al.',
    quickInfo: 'Diagnoses specific gaps in math proficiency.',
    purpose: 'To identify areas of weakness in math for remediation.',
    administration: {
      type: 'Group',
      items: 'Multiple subtests',
      ageRange: 'Grades 1-12',
      time: 'Varies',
      trainingNeeded: 'Teacher'
    },
    scoring: 'Criterion-referenced scores.',
    interpretation: 'Identifies specific math concept mastery.',
    versions: 'Fourth Edition',
    factorsMeasured: 'Number Concepts, Computation, Applications.'
  },
  {
    id: 'porteus-maze',
    name: 'Porteus Maze Test',
    category: 'intelligence',
    developer: 'Stanley Porteus',
    quickInfo: 'Non-verbal test of planning and foresight.',
    purpose: 'To measure social intelligence and impulsivity.',
    administration: {
      type: 'Individual',
      items: 'Paper-and-pencil maze tasks',
      ageRange: '3 years to Adult',
      time: '15-25 minutes',
      trainingNeeded: 'Moderate'
    },
    scoring: 'Test Age score and Qualitative (Q) score.',
    interpretation: 'High Q-scores indicate poor social adjustment.',
    versions: 'Standard, Extension, Supplement',
    factorsMeasured: 'Planning, foresight, impulse control.'
  },
  {
    id: 'sb-lm',
    name: 'Stanford-Binet Intelligence Scale: Form L-M (3rd Edition)',
    category: 'intelligence',
    developer: 'Terman & Merrill',
    quickInfo: 'Legacy version of the SB using the ratio IQ.',
    purpose: 'To assess the intelligence of children and adults.',
    administration: {
      type: 'Individual',
      items: 'Varies by mental age',
      ageRange: '2+ years',
      time: '60-90 minutes',
      trainingNeeded: 'High'
    },
    scoring: 'Ratio IQ (MA/CA * 100).',
    interpretation: 'Mental Age concepts.',
    versions: 'Form L-M (Legacy)',
    factorsMeasured: 'General intelligence.'
  },
  {
    id: 'sb-4',
    name: 'Stanford-Binet Intelligence Scale - 4th Edition',
    category: 'intelligence',
    developer: 'Thorndike, Hagen, & Sattler',
    quickInfo: 'Shifted the SB to a point-scale format.',
    purpose: 'To assess cognitive ability across four main areas.',
    administration: {
      type: 'Individual',
      items: '15 subtests',
      ageRange: '2 to 23 years',
      time: '60-90 minutes',
      trainingNeeded: 'High'
    },
    scoring: 'Standard Age Score (SAS).',
    interpretation: 'Profile analysis across 4 domains.',
    versions: '4th Edition (Legacy)',
    factorsMeasured: 'Verbal Reasoning, Abstract/Visual Reasoning, Quantitative Reasoning, Short-term Memory.'
  },
  {
    id: 'mooney-problem',
    name: 'Mooney Problem Checklist',
    category: 'personality',
    developer: 'Ross L. Mooney',
    quickInfo: 'Identifies problems as perceived by the individual.',
    purpose: 'To help students and adults express their personal problems.',
    administration: {
      type: 'Self-report Checklist',
      items: '210-330 items',
      ageRange: 'High School to Adult',
      time: '20-30 minutes',
      trainingNeeded: 'Low'
    },
    scoring: 'Count of problems underlined (marked).',
    interpretation: 'Focuses on the content of the issues raised.',
    versions: 'J, H, C, A levels',
    factorsMeasured: 'Health, Money, Social, Home, Religion, Sex, School, etc.'
  },
  {
    id: 'aui',
    name: 'Alcohol Use Inventory (AUI)',
    category: 'personality',
    developer: 'Horn, Wanberg, & Foster',
    quickInfo: 'Assesses the nature and severity of alcohol use.',
    purpose: 'To provide a basis for treatment planning in alcoholism.',
    administration: {
      type: 'Self-report',
      items: '228 items',
      ageRange: '16+ years',
      time: '35-60 minutes',
      trainingNeeded: 'Moderate'
    },
    scoring: '24 scales across 4 domains.',
    interpretation: 'Identifies drinking patterns and consequences.',
    versions: 'Standard',
    factorsMeasured: 'Drinking styles, benefits, consequences, concerns.'
  },
  {
    id: 'cat-projective',
    name: 'Children\'s Apperception Test (CAT)',
    category: 'personality',
    developer: 'Leopold & Sonya Bellak',
    quickInfo: 'Thematic test for children using animal figures.',
    purpose: 'To explore a child\'s personality and psychological conflicts.',
    administration: {
      type: 'Individual Projective',
      items: '10 cards',
      ageRange: '3 to 10 years',
      time: '20-45 minutes',
      trainingNeeded: 'High'
    },
    scoring: 'Qualitative analysis of themes.',
    interpretation: 'Examines child\'s relation to adult figures and siblings.',
    versions: 'CAT (Animals), CAT-H (Humans), CAT-S (Supplement)',
    factorsMeasured: 'Personality structure, conflicts, family relations.'
  },
  {
    id: 'szondi',
    name: 'Szondi Test',
    category: 'personality',
    developer: 'Leopold Szondi',
    quickInfo: 'Projective test based on instinctual drives.',
    purpose: 'To uncover the psychological drives through facial preference.',
    administration: {
      type: 'Projective (Faces selection)',
      items: '48 photographs of psychiatric patients',
      ageRange: 'Adults',
      time: '5-10 minutes',
      trainingNeeded: 'Very High'
    },
    scoring: 'Choice of "liked" and "disliked" faces.',
    interpretation: 'Eclectic and complex "Fate Analysis."',
    versions: 'Standard',
    factorsMeasured: 'Instinctual vectors: sexual, paroxysmal, ego, social.'
  },
  {
    id: 'word-assoc',
    name: 'Word Association Test',
    category: 'personality',
    developer: 'Jung / Rapaport',
    quickInfo: 'Measures unconscious associations.',
    purpose: 'To investigate psychological complexes.',
    administration: {
      type: 'Individual Projective',
      items: '60-100 words',
      ageRange: 'All ages',
      time: '20-30 minutes',
      trainingNeeded: 'Moderate'
    },
    scoring: 'Reaction time and content analysis.',
    interpretation: 'Identifies emotional blockages and "complexes."',
    versions: 'Jung, Kent-Rosanoff, Rapaport',
    factorsMeasured: 'Unconscious complexes, emotional reactivity.'
  },
  {
    id: 'risb',
    name: 'Rotter Incomplete Sentences Blank (RISB)',
    category: 'personality',
    developer: 'Julian Rotter',
    quickInfo: 'Most popular standardized sentence completion test.',
    purpose: 'To screen for overall maladjustment.',
    administration: {
      type: 'Projective (Semi-structured)',
      items: '40 sentence stems',
      ageRange: 'High School to Adult',
      time: '20-40 minutes',
      trainingNeeded: 'Moderate'
    },
    scoring: 'Overall adjustment score (0-240).',
    interpretation: 'Higher scores indicate greater conflict/maladjustment.',
    versions: 'High School, College, Adult Forms',
    factorsMeasured: 'Overall adjustment, psychological health.'
   },
   {
    id: 'aamd-adaptive',
    name: 'AAMD Adaptive Behavior Scale',
    category: 'intelligence',
    developer: 'Nihira et al.',
    quickInfo: 'Assesses personal independence and social responsibility.',
    purpose: 'To identify adaptive behavior levels in individuals with IDs.',
    administration: {
      type: 'Informant Rating',
      items: 'Part I (10 domains) and Part II (14 domains)',
      ageRange: '3 to 69 years',
      time: '45-60 minutes',
      trainingNeeded: 'Moderate'
    },
    scoring: 'Domain-wise raw scores.',
    interpretation: 'Identifies behavioral maladjustment.',
    versions: 'Public School, Residential/Community',
    factorsMeasured: 'Self-help, physical dev, language, social behavior, etc.'
  },
  {
    id: 'balthazar-scales',
    name: 'Balthazar Scales of Adaptive Behavior I',
    category: 'intelligence',
    developer: 'Earl E. Balthazar',
    quickInfo: 'Measures functional independence in profoundly retarded individuals.',
    purpose: 'To provide objective assessments for program planning.',
    administration: {
      type: 'Observation',
      items: '8 sections',
      ageRange: 'Profoundly/Severely Retarded Patients',
      time: 'Varies',
      trainingNeeded: 'High'
    },
    scoring: 'Direct observation scores.',
    interpretation: 'Focuses on "BSAB-I: Functional Independence."',
    versions: 'Standard',
    factorsMeasured: 'Eating, dressing, toileting, etc.'
  },
  {
    id: 'child-neuro-quest',
    name: 'Child Neuropsychological Questionnaire',
    category: 'intelligence',
    developer: 'Varies',
    quickInfo: 'Screening for neurological soft signs in children.',
    purpose: 'To identify children at risk for neurological issues.',
    administration: {
      type: 'Parent/Teacher rating',
      items: 'Varies',
      ageRange: 'Children',
      time: '15-20 minutes',
      trainingNeeded: 'Moderate'
    },
    scoring: 'Frequency count of symptoms.',
    interpretation: 'Screening only.',
    versions: 'Standard',
    factorsMeasured: 'Motor coordination, sensory perception, language.'
  },
  {
    id: 'childhood-trauma-quest',
    name: 'Childhood Trauma Questionnaire (CTQ)',
    category: 'personality',
    developer: 'David P. Bernstein',
    quickInfo: 'Measures early childhood abuse and neglect.',
    purpose: 'To screen for history of child maltreatment.',
    administration: {
      type: 'Self-report',
      items: '28 items',
      ageRange: '12+ years',
      time: '5 minutes',
      trainingNeeded: 'Minimal'
    },
    scoring: 'Five clinical scales.',
    interpretation: 'Higher scores indicate more severe maltreatment.',
    versions: 'Standard (Short Form)',
    factorsMeasured: 'Physical abuse, sexual abuse, emotional abuse, physical neglect, emotional neglect.'
  },
  {
    id: 'children-depression-inv',
    name: 'Children\'s Depression Inventory (CDI)',
    category: 'personality',
    developer: 'Maria Kovacs',
    quickInfo: 'The BDI equivalent for children.',
    purpose: 'To assess the cognitive and behavioral symptoms of depression in kids.',
    administration: {
      type: 'Self-report',
      items: '27 items',
      ageRange: '7 to 17 years',
      time: '15 minutes',
      trainingNeeded: 'Moderate'
    },
    scoring: 'Sum scores for 5 factors.',
    interpretation: 'Profile of depressive symptoms.',
    versions: 'CDI, CDI-2 (Current)',
    factorsMeasured: 'Negative Mood, Interpersonal Problems, Ineffectiveness, Anhedonia, Negative Self-Esteem.'
  },
  {
    id: 'ciss',
    name: 'Coping Intervention for Stressful Situations (CISS)',
    category: 'personality',
    developer: 'Endler & Parker',
    quickInfo: 'Measures three main types of coping styles.',
    purpose: 'To determine how an individual deals with stress.',
    administration: {
      type: 'Self-report',
      items: '48 items',
      ageRange: 'Adults and Adolescents',
      time: '10-15 minutes',
      trainingNeeded: 'Minimal'
    },
    scoring: 'Sum of scores for 3 main scales.',
    interpretation: 'Identifies preferred coping style.',
    versions: 'Standard',
    factorsMeasured: 'Task-oriented coping, Emotion-oriented coping, Avoidance-oriented coping.'
  },
  {
    id: 'dispositional-resilience',
    name: 'Dispositional Resilience Scale (DRS)',
    category: 'personality',
    developer: 'Paul Bartone',
    quickInfo: 'Measures "Hardiness" or psychological resilience.',
    purpose: 'To assess resilience to stress and life challenges.',
    administration: {
      type: 'Self-report',
      items: '15 items (Short form)',
      ageRange: 'Adults',
      time: '5 minutes',
      trainingNeeded: 'Minimal'
    },
    scoring: 'Sum of 3 components.',
    interpretation: 'Higher scores indicate higher psychological hardiness.',
    versions: 'DRS-15, DRS-30',
    factorsMeasured: 'Commitment, Control, Challenge.'
  },
  {
    id: 'edi-2',
    name: 'Eating Disorder Inventory - 2nd Ed (EDI-2)',
    category: 'personality',
    developer: 'David Garner',
    quickInfo: 'Self-report measure of eating disorder symptoms.',
    purpose: 'To assess the psychological traits associated with eating disorders.',
    administration: {
      type: 'Self-report',
      items: '91 items',
      ageRange: '12 years to Adult',
      time: '20 minutes',
      trainingNeeded: 'High (Clinical)'
    },
    scoring: '11 scales.',
    interpretation: 'Profile of psychological and behavioral symptoms.',
    versions: 'EDI-2, EDI-3 (Current)',
    factorsMeasured: 'Drive for Thinness, Bulimia, Body Dissatisfaction, Ineffectiveness, Perfectionism, Interpersonal Distrust, etc.'
  },
  {
    id: 'cvfes',
    name: 'Family Environment Scale: Children\'s Ver (CVFES)',
    category: 'personality',
    developer: 'Moos & Moos',
    quickInfo: 'Measures the social climate of families for children.',
    purpose: 'To assess family dynamics from a child\'s perspective.',
    administration: {
      type: 'Picture/Interview format',
      items: '30 items',
      ageRange: '5 to 12 years',
      time: '15-20 minutes',
      trainingNeeded: 'Moderate'
    },
    scoring: 'Based on 10 dimensions.',
    interpretation: 'Evaluates cohesion, expressiveness, and conflict.',
    versions: 'Standard',
    factorsMeasured: 'Relationship, Personal Growth, System Maintenance dimensions.'
  },
  {
    id: 'fssct',
    name: 'Forer Structured Sentence Completion Test (FSSCT)',
    category: 'personality',
    developer: 'Bertram Forer',
    quickInfo: 'A projective test for personality and interpersonal attitudes.',
    purpose: 'To obtain info on interpersonal and intrapersonal attitudes.',
    administration: {
      type: 'Individual Projective',
      items: '100 items',
      ageRange: 'Children to Adults',
      time: '30-45 minutes',
      trainingNeeded: 'High'
    },
    scoring: 'Qualitative analysis across 4 categories.',
    interpretation: 'Reveals attitudes toward self, world, others.',
    versions: 'Standard',
    factorsMeasured: 'Interpersonal, Wishes, Causes of Aggression, Fears.'
  },
  {
    id: 'general-self-efficacy',
    name: 'General Self-Efficacy Scale (GSE)',
    category: 'personality',
    developer: 'Schwarzer & Jerusalem',
    quickInfo: 'Measures optimistic self-belief in coping with challenges.',
    purpose: 'To assess a person\'s belief in their ability to handle difficulties.',
    administration: {
      type: 'Self-report',
      items: '10 items',
      ageRange: '12+ years',
      time: '4 minutes',
      trainingNeeded: 'Minimal'
    },
    scoring: 'Sum of items (10-40).',
    interpretation: 'Higher scores indicate stronger self-efficacy.',
    versions: 'Standard',
    factorsMeasured: 'General perceived self-efficacy.'
  },
  {
    id: 'guildford-zimmerman',
    name: 'Guilford Zimmerman Temperament Survey (GZTS)',
    category: 'personality',
    developer: 'Guilford & Zimmerman',
    quickInfo: 'Objectively measures 10 personality traits.',
    purpose: 'To provide a concise profile of an individual\'s temperament.',
    administration: {
      type: 'Self-report (Yes/No)',
      items: '300 items',
      ageRange: '16+ years',
      time: '45 minutes',
      trainingNeeded: 'Moderate'
    },
    scoring: '10 factor scales.',
    interpretation: 'Profile analysis for vocational/clinical use.',
    versions: 'Standard',
    factorsMeasured: 'General Activity, Restraint, Ascendance, Sociability, Emotional Stability, Objectivity, Friendliness, Thoughtfulness, Personal Relations, Masculinity/Feminity.'
  },
  {
    id: 'jenkins-activity',
    name: 'Jenkins Activity Survey (JAS)',
    category: 'personality',
    developer: 'C. David Jenkins',
    quickInfo: 'Measures the Type A Behavior Pattern (TABP).',
    purpose: 'To identify behaviors related to coronary heart disease.',
    administration: {
      type: 'Self-report',
      items: '52 items',
      ageRange: 'Adults',
      time: '15-20 minutes',
      trainingNeeded: 'Moderate'
    },
    scoring: 'Type A scale and 3 subscales.',
    interpretation: 'Higher scores indicate more "Type A" behavior.',
    versions: 'Standard',
    factorsMeasured: 'Speed and Impatience, Job Involvement, Hard-Driving Competitiveness.'
  },
  {
    id: 'lot-r',
    name: 'Life Orientation Test - Revised (LOT-R)',
    category: 'personality',
    developer: 'Scheier, Carver, & Bridges',
    quickInfo: 'Measures dispositional optimism.',
    purpose: 'To assess individual differences in generalized optimism versus pessimism.',
    administration: {
      type: 'Self-report',
      items: '10 items',
      ageRange: 'Adults',
      time: '5 minutes',
      trainingNeeded: 'Minimal'
    },
    scoring: 'Sum of optimism and pessimism items.',
    interpretation: 'Measures expectations of positive/negative outcomes.',
    versions: 'LOT (Original), LOT-R (Revised)',
    factorsMeasured: 'Optimism, Pessimism.'
  },
  {
    id: 'panas',
    name: 'Positive and Negative Affect Schedule (PANAS)',
    category: 'personality',
    developer: 'Watson, Clark, & Tellegen',
    quickInfo: 'Measures two primary dimensions of mood.',
    purpose: 'To provide a brief measure of positive and negative affect.',
    administration: {
      type: 'Self-report',
      items: '20 items',
      ageRange: 'Adults',
      time: '5 minutes',
      trainingNeeded: 'Minimal'
    },
    scoring: 'Sum for PA and NA scales.',
    interpretation: 'Describes "Positive Affect" and "Negative Affect" states.',
    versions: 'Adult, Child (PANAS-C)',
    factorsMeasured: 'Positive Affect, Negative Affect.'
  },
  {
    id: 'pkp',
    name: 'Panukat ng Katalinuhang Pilipino (PKP)',
    category: 'intelligence',
    developer: 'Aurora Palacio',
    quickInfo: 'Filipino-made intelligence test.',
    purpose: 'To assess the cognitive ability of Filipinos using local norms.',
    administration: {
      type: 'Individual/Group',
      items: 'Varies',
      ageRange: 'Adults',
      time: '45-60 minutes',
      trainingNeeded: 'Moderate'
    },
    scoring: 'Scaled scores based on Filipino norms.',
    interpretation: 'Measures general and specific mental abilities.',
    versions: 'Standard',
    factorsMeasured: 'Verbal, Numerical, Non-verbal reasoning.'
  },
  {
    id: 'ppp-personality',
    name: 'Panukat ng Pagkataong Pilipino (PPP)',
    category: 'personality',
    developer: 'Annadaisy J. Carlota',
    quickInfo: 'Multi-dimensional Filipino personality inventory.',
    purpose: 'To measure 19 personality traits relevant to Filipinos.',
    administration: {
      type: 'Self-report',
      items: '210 items (Long form)',
      ageRange: '13 years to Adult',
      time: '50 minutes',
      trainingNeeded: 'Moderate'
    },
    scoring: 'Standardized norms for each trait.',
    interpretation: 'Contextual analysis of Filipino character.',
    versions: 'Form A, Form B, Form Senior',
    factorsMeasured: 'Pagkakaibigan, Pagkamagalang, Pagkamasunurin, Katapatan, etc.'
  },
  {
    id: 'personality-research-form',
    name: 'Personality Research Form (PRF)',
    category: 'personality',
    developer: 'Douglas N. Jackson',
    quickInfo: 'Highly structured personality inventory.',
    purpose: 'To measure Murry\'s system of manifest needs.',
    administration: {
      type: 'Self-report (True/False)',
      items: '352-440 items',
      ageRange: 'High School to Adult',
      time: '45-75 minutes',
      trainingNeeded: 'High'
    },
    scoring: 'Profile on 20 personality scales.',
    interpretation: 'Based on rigorous psychometric item selection.',
    versions: 'Form A, B, E',
    factorsMeasured: 'Abasement, Achievement, Affiliation, Aggression, Autonomy, Change, Cognitive Structure, etc.'
  },
  {
    id: 'pictorial-self-concept',
    name: 'Pictorial Self-Concept Scale',
    category: 'personality',
    developer: 'Angelo Bolea',
    quickInfo: 'Non-verbal measure of self-concept for children.',
    purpose: 'To assess how children perceive themselves.',
    administration: {
      type: 'Card sorting',
      items: '50 picture cards',
      ageRange: 'Pre-K to Grade 4',
      time: '15-20 minutes',
      trainingNeeded: 'Moderate'
    },
    scoring: 'Sorting into "Like Me" and "Not Like Me."',
    interpretation: 'Global self-concept index.',
    versions: 'Standard',
    factorsMeasured: 'Self-concept domains in young children.'
  },
  {
    id: 'pnlt',
    name: 'Purdue Non-Language Test (PNLT)',
    category: 'intelligence',
    developer: 'Tiffin, Grubner, & Kay',
    quickInfo: 'Culture-fair test of general mental ability.',
    purpose: 'To assess intelligence without relying on language.',
    administration: {
      type: 'Group/Individual',
      items: '48 items',
      ageRange: 'Adults',
      time: '25 minutes (Power test)',
      trainingNeeded: 'Moderate'
    },
    scoring: 'Raw score to percentile.',
    interpretation: 'Measures abstract reasoning ability.',
    versions: 'Form A, Form B',
    factorsMeasured: 'Non-verbal reasoning, visual perception.'
  },
  {
    id: 'swls',
    name: 'Satisfaction with Life Scale (SWLS)',
    category: 'personality',
    developer: 'Ed Diener',
    quickInfo: 'Measures cognitive appraisal of life satisfaction.',
    purpose: 'To assess general well-being and happiness.',
    administration: {
      type: 'Self-report',
      items: '5 items',
      ageRange: '13+ years',
      time: '1-2 minutes',
      trainingNeeded: 'Minimal'
    },
    scoring: 'Sum of 5 items (5-35).',
    interpretation: 'Scores correspond to degrees of satisfaction.',
    versions: 'Standard',
    factorsMeasured: 'Overall life satisfaction.'
  },
  {
    id: 'scii',
    name: 'Strong Interest Inventory (SII/SCII)',
    category: 'interest',
    developer: 'E.K. Strong Jr. (updated by Donnay et al.)',
    quickInfo: 'The definitive instrument for career counseling.',
    purpose: 'To match a person\'s interests with those of people in various occupations.',
    administration: {
      type: 'Self-report',
      items: '291 items (Standard Edition)',
      ageRange: '16+ years',
      time: '30-45 minutes',
      trainingNeeded: 'Certification needed for interpretation'
    },
    scoring: 'RIASEC codes and Occupational Scales.',
    interpretation: 'Holland\'s Hexagon (RIASEC) framework.',
    versions: 'Strong Campbell (Legacy), Strong Interest Inventory (Current)',
    factorsMeasured: 'Realistic, Investigative, Artistic, Social, Enterprising, Conventional.'
  },
  {
    id: 'thurstone-interest',
    name: 'Thurstone Interest Inventory (TIS)',
    category: 'interest',
    developer: 'L.L. Thurstone',
    quickInfo: 'Early measure of vocational interests.',
    purpose: 'To identify vocational interest patterns.',
    administration: {
      type: 'Self-report',
      items: '100 items',
      ageRange: 'High School and Adult',
      time: '15-20 minutes',
      trainingNeeded: 'Moderate'
    },
    scoring: '10 vocational field scores.',
    interpretation: 'Identifies broad career preferences.',
    versions: 'Standard',
    factorsMeasured: 'Biological, Computational, Musical, Artistic, Literary, etc.'
  },
  {
    id: 'ttma',
    name: 'Thurstone Test of Mental Alertness (TTMA)',
    category: 'intelligence',
    developer: 'Thurstone & Thurstone',
    quickInfo: 'Quick measure of general mental capacity.',
    purpose: 'To assess the ability to learn new tasks and solve problems.',
    administration: {
      type: 'Group',
      items: '60-80 items',
      ageRange: 'Adults',
      time: '20 minutes (Timed)',
      trainingNeeded: 'Moderate'
    },
    scoring: 'Raw score converted to percentile.',
    interpretation: 'Measures "Information/Reasoning" agility.',
    versions: 'Standard (Legacy)',
    factorsMeasured: 'L (Linguistic), Q (Quantitative) ability.'
  },
  {
    id: 'wgcta',
    name: 'Watson Glaser Critical Thinking Appraisal',
    category: 'intelligence',
    developer: 'Watson & Glaser',
    quickInfo: 'Premier tool for assessing critical thinking skills.',
    purpose: 'To measure the ability to think analytically and logically.',
    administration: {
      type: 'Group/Individual',
      items: '40-80 items',
      ageRange: 'High School to Adult',
      time: '30-60 minutes',
      trainingNeeded: 'Moderate'
    },
    scoring: 'Profile across 5 critical thinking areas.',
    interpretation: 'Predictive of success in law, executive, and technical roles.',
    versions: 'WGCTA-III (Current)',
    factorsMeasured: 'Inference, Recognition of Assumptions, Deduction, Interpretation, Evaluation of Arguments.'
  },
  {
    id: 'wrat-3',
    name: 'Wide Range Achievement Test - Third Edition (WRAT-3)',
    category: 'intelligence',
    developer: 'Wilkinson',
    quickInfo: 'Legacy version of the popular screening tool.',
    purpose: 'To screen for basic academic skills in a clinical setting.',
    administration: {
      type: 'Individual',
      items: 'Reading, Spelling, Arithmetic subtests',
      ageRange: '5 to 75 years',
      time: '15-30 minutes',
      trainingNeeded: 'Moderate'
    },
    scoring: 'Standard scores, percentiles.',
    interpretation: 'Provides quick instructional level.',
    versions: 'Blue and Tan forms',
    factorsMeasured: 'Reading Recognition, Spelling, Math Computation.'
  },
  {
    id: 'wpds',
    name: 'Woodworth Personal Data Sheet (WPDS)',
    category: 'personality',
    developer: 'Robert S. Woodworth',
    quickInfo: 'The first personality inventory ever created (1919).',
    purpose: 'To screen military recruits for psychoneurosis (shell shock).',
    administration: {
      type: 'Self-report (Yes/No)',
      items: '116 items',
      ageRange: 'Adults',
      time: '15-20 minutes',
      trainingNeeded: 'Low (Historical)'
    },
    scoring: 'Count of "symptomatic" responses.',
    interpretation: 'Screening for emotional stability.',
    versions: 'Historical (WWI)',
    factorsMeasured: 'Emotional stability, neurotic symptoms.'
  },
  {
    id: 'agct',
    name: 'Army General Classification Test (AGCT)',
    category: 'intelligence',
    developer: 'Personnel Research Section (U.S. Army)',
    quickInfo: 'WWII-era general intelligence test for sorting soldiers.',
    purpose: 'To classify soldiers by their ability to learn.',
    administration: {
      type: 'Group',
      items: 'Multiple-choice items',
      ageRange: 'Adults (Military)',
      time: '40-60 minutes',
      trainingNeeded: 'Military Proctor'
    },
    scoring: 'Standardized score (Mean 100).',
    interpretation: 'Categorized soldiers into five grades of learning ability.',
    versions: 'Standard (Legacy)',
    factorsMeasured: 'Verbal, Arithmetic, Spatial reasoning.'
  },
  {
    id: 'drs-clinical',
    name: 'Dementia Rating Scale - 2nd Ed (DRS-2)',
    category: 'personality',
    developer: 'Steven Mattis',
    quickInfo: 'Assesses cognitive status in older adults.',
    purpose: 'To identify and track the progression of dementia.',
    administration: {
      type: 'Individual',
      items: '36 tasks',
      ageRange: '55 to 89 years',
      time: '30-45 minutes',
      trainingNeeded: 'High (Clinical)'
    },
    scoring: 'Subscale and Total scores.',
    interpretation: 'Identifies cognitive impairment level.',
    versions: 'DRS (Original), DRS-2',
    factorsMeasured: 'Attention, Initiation/Perseveration, Construction, Conceptualization, Memory.'
  },
  {
    id: 'htp-test',
    name: 'House-Tree-Person (HTP)',
    category: 'personality',
    developer: 'John Buck',
    quickInfo: 'Projective drawing technique.',
    purpose: 'To provide info on personality, brain damage, and general mental functioning.',
    administration: {
      type: 'Individual Projective (Drawing)',
      items: '3 drawings (House, Tree, Person)',
      ageRange: '3 years to Adult',
      time: '30-90 minutes',
      trainingNeeded: 'High'
    },
    scoring: 'Qualitative/Quantitative (Buck\'s system).',
    interpretation: 'Drawings symbolize self, household, and environmental relations.',
    versions: 'Standard, H-T-P:P-L-P',
    factorsMeasured: 'Self-image, family dynamics, environmental adjustment.'
  },
  {
    id: 'mcmi-iii',
    name: 'Millon Clinical Multiaxial Inventory-III (MCMI-III)',
    category: 'personality',
    developer: 'Theodore Millon',
    quickInfo: 'Clinical assessment of adult personality and psychopathology.',
    purpose: 'To diagnose DSM personality disorders and clinical syndromes.',
    administration: {
      type: 'Self-report (True/False)',
      items: '175 items',
      ageRange: '18+ years',
      time: '25-30 minutes',
      trainingNeeded: 'High (Professional)'
    },
    scoring: 'Base Rate (BR) scores.',
    interpretation: 'Aligned with Millon\'s evolutionary theory of personality.',
    versions: 'MCMI-I, MCMI-II, MCMI-III, MCMI-IV (Current)',
    factorsMeasured: '14 personality disorder scales, 10 clinical syndrome scales.'
  },
  {
    id: 'mmpi-2-short',
    name: 'MMPI-2 Short Form',
    category: 'personality',
    developer: 'Hathaway & McKinley (Shortened versions)',
    quickInfo: 'A condensed version of the MMPI-2.',
    purpose: 'To provide a faster screen for psychopathology.',
    administration: {
      type: 'Self-report',
      items: '370 items (most common version)',
      ageRange: '18+ years',
      time: '30-45 minutes',
      trainingNeeded: 'High'
    },
    scoring: 'Scaled T-scores for basic clinical scales.',
    interpretation: 'Focuses on the core 10 clinical scales.',
    versions: '370-item, 168-item',
    factorsMeasured: 'Core clinical syndromes.'
  },
  {
    id: 'mmpi-a',
    name: 'MMPI-Adolescent (MMPI-A)',
    category: 'personality',
    developer: 'Butcher et al.',
    quickInfo: 'MMPI specifically normed for adolescents.',
    purpose: 'To assess psychopathology and personality in youths.',
    administration: {
      type: 'Self-report',
      items: '478 items',
      ageRange: '14 to 18 years',
      time: '45-60 minutes',
      trainingNeeded: 'High'
    },
    scoring: 'T-scores on adolescent-specific scales.',
    interpretation: 'Profile analysis for behavioral problems in teens.',
    versions: 'MMPI-A, MMPI-A-RF (Restructured Form)',
    factorsMeasured: 'Clinical scales, adolescent-specific content scales (e.g., School Problems).'
  },
  {
    id: 'stat-test',
    name: 'Sternberg Triarchic Abilities Test (STAT)',
    category: 'intelligence',
    developer: 'Robert Sternberg',
    quickInfo: 'Measures intelligence beyond traditional IQ.',
    purpose: 'To assess the three facets of intelligence in the Triarchic Theory.',
    administration: {
      type: 'Group/Individual',
      items: 'Multiple-choice and Essay tasks',
      ageRange: 'Kindergarten to Adult',
      time: 'Varies',
      trainingNeeded: 'Moderate'
    },
    scoring: 'Analytical, Creative, and Practical scores.',
    interpretation: 'Identifies "Successful Intelligence."',
    versions: 'Level H (Adult)',
    factorsMeasured: 'Analytical Intelligence, Creative Intelligence, Practical Intelligence.'
  },
  {
    id: 'bender-monograph',
    name: 'Bender Gestalt Monograph',
    category: 'personality',
    developer: 'Lauretta Bender',
    quickInfo: 'The 1938 classic research on the Visual Motor Gestalt test.',
    purpose: 'Original scientific foundation for the Bender-Gestalt test.',
    administration: {
      type: 'Historical Reference / Qualitative',
      items: '9 figures',
      ageRange: 'All',
      time: 'Varies',
      trainingNeeded: 'Historical interest'
    },
    scoring: 'Developmental norms (original).',
    interpretation: 'Psychological maturation of the gestalt function.',
    versions: '1938 original',
    factorsMeasured: 'Visual-motor integration, gestalt perception.'
  },
  {
    id: 'rpm-general',
    name: 'Raven\'s Progressive Matrices (RPM) - General',
    category: 'intelligence',
    developer: 'John C. Raven',
    quickInfo: 'Unified entry for the Raven\'s matrices system.',
    purpose: 'Overview of the SPM, APM, and CPM series.',
    administration: {
      type: 'Varies',
      items: '36 to 60 items',
      ageRange: '5 years to Adult',
      time: '15-60 minutes',
      trainingNeeded: 'Minimal'
    },
    scoring: 'Percentile ranking.',
    interpretation: 'The "gold standard" for non-verbal eductive ability.',
    versions: 'SPM, CPM, APM',
    factorsMeasured: 'General factor (g), non-verbal reasoning.'
  },
  {
    id: 'rist-2',
    name: "RIST-2: Reynold's Intellectual Screening Test",
    category: 'intelligence',
    developer: 'Cecil R. Reynolds & Randy W. Kamphaus',
    quickInfo: 'A brief, reliable screening measure of general intelligence.',
    purpose: 'To provide a quick estimate of intellectual functioning.',
    administration: {
      type: 'Individual',
      items: '2 subtests (Guess What & Odd-Item Out)',
      ageRange: '3 to 94 years',
      time: '15 minutes',
      trainingNeeded: 'Level B'
    },
    scoring: 'Standard scores and percentiles.',
    interpretation: 'Screening for cognitive impairment or giftedness.',
    versions: 'RIST, RIST-2',
    factorsMeasured: 'Verbal and non-verbal intelligence.'
  },
  {
    id: 'basc-3',
    name: 'BASC: Behavioral Assessment System for Children',
    category: 'personality',
    developer: 'Cecil R. Reynolds & Randy W. Kamphaus',
    quickInfo: 'Multidimensional system for evaluating behavior and self-perceptions.',
    purpose: 'To assess emotional and behavioral disorders in children.',
    administration: {
      type: 'Multi-informant (Teacher, Parent, Self)',
      items: 'Varies',
      ageRange: '2 to 25 years',
      time: '10-20 minutes',
      trainingNeeded: 'Moderate'
    },
    scoring: 'T-scores and percentiles.',
    interpretation: 'Identifies clinical and adaptive behaviors.',
    versions: 'BASC, BASC-2, BASC-3',
    factorsMeasured: 'Hyperactivity, Aggression, Depression, Anxiety, Adaptability, Social Skills.'
  },
  {
    id: 'lec-5',
    name: 'LEC-5: Life Event Checklist',
    category: 'personality',
    developer: 'Gray, Litz, Hsu, & Lombardo',
    quickInfo: 'A self-report measure to screen for potentially traumatic events.',
    purpose: 'To identify exposure to traumatic events in a person\'s lifetime.',
    administration: {
      type: 'Self-report',
      items: '17 items',
      ageRange: 'Adults',
      time: '5-10 minutes',
      trainingNeeded: 'Minimal'
    },
    scoring: 'Frequency of exposure types.',
    interpretation: 'Used to screen for PTSD-related trauma exposure.',
    versions: 'LEC, LEC-5',
    factorsMeasured: 'Traumatic event exposure.'
  },
  {
    id: 'pcl-5',
    name: 'PCL-5: Posttraumatic Stress Disorder Checklist',
    category: 'personality',
    developer: 'Weathers et al.',
    quickInfo: 'A self-report rating scale for PTSD symptoms.',
    purpose: 'To monitor symptom change and screen for PTSD.',
    administration: {
      type: 'Self-report',
      items: '20 items',
      ageRange: 'Adults',
      time: '5-10 minutes',
      trainingNeeded: 'Minimal'
    },
    scoring: 'Total severity score (0-80).',
    interpretation: 'Cut-point of 31-33 often used for diagnosis.',
    versions: 'PCL-C, PCL-S, PCL-M, PCL-5',
    factorsMeasured: 'Intrusion, Avoidance, Negative Alterations in Cognition/Mood, Hyperarousal.'
  },
  {
    id: 'ace-q',
    name: 'ACE-Q: Adverse Childhood Experience Questionnaire',
    category: 'personality',
    developer: 'Felitti et al. (CDC-Kaiser)',
    quickInfo: 'Measures childhood trauma and household dysfunction.',
    purpose: 'To determine the degree of trauma experienced during childhood.',
    administration: {
      type: 'Self-report',
      items: '10 items',
      ageRange: 'Adults (Retrospective)',
      time: '5 minutes',
      trainingNeeded: 'Minimal'
    },
    scoring: 'ACE score (0-10).',
    interpretation: 'Higher scores correlate with health and social problems later in life.',
    versions: 'Standard',
    factorsMeasured: 'Abuse, Neglect, Household Dysfunction.'
  },
  {
    id: 'phq-9',
    name: 'PHQ-9: Patient Health Questionnaire',
    category: 'personality',
    developer: 'Kroenke, Spitzer, & Williams',
    quickInfo: 'Brief depression severity measure.',
    purpose: 'To objectify the degree of depression severity.',
    administration: {
      type: 'Self-report',
      items: '9 items',
      ageRange: 'Adults',
      time: '2-5 minutes',
      trainingNeeded: 'Minimal'
    },
    scoring: 'Score 0-27 (5, 10, 15, 20 are cut-offs).',
    interpretation: 'Classification from Minimal to Severe depression.',
    versions: 'PHQ-2 (Screener), PHQ-9 (Full)',
    factorsMeasured: 'Depressive symptoms (DSM-IV criteria).'
  },
  {
    id: 'k-gsads-a',
    name: 'K-GSADS-A: Kutcher General Social Anxiety Disorder Scale for Adolescents',
    category: 'personality',
    developer: 'Stan Kutcher',
    quickInfo: 'Measure for social anxiety in adolescents.',
    purpose: 'To assess the severity of social anxiety disorder in teens.',
    administration: {
      type: 'Self-report',
      items: '6 items',
      ageRange: '12 to 18 years',
      time: '5 minutes',
      trainingNeeded: 'Minimal'
    },
    scoring: 'Sum of scores.',
    interpretation: 'Higher scores reflect greater social anxiety.',
    versions: 'Standard',
    factorsMeasured: 'Social anxiety, fear of negative evaluation.'
  },
  {
    id: 'c-ssrs',
    name: 'C-SSRS: Columbia Suicide Severity Rating Scale',
    category: 'personality',
    developer: 'Posner et al.',
    quickInfo: 'The "gold standard" for suicide risk assessment.',
    purpose: 'To screen for suicidal ideation and behavior.',
    administration: {
      type: 'Structured Interview / Self-report',
      items: 'Varies (usually 6 items for screening)',
      ageRange: 'All ages',
      time: '5-10 minutes',
      trainingNeeded: 'Moderate'
    },
    scoring: 'Risk categories (Low to High).',
    interpretation: 'Identifies immediate risk for suicide.',
    versions: 'Screener, Life-time/Recent, Risk Assessment',
    factorsMeasured: 'Suicidal ideation, intensity of ideation, suicidal behavior.'
  },
  {
    id: 'tsq',
    name: 'TSQ: Trauma Screening Questionnaire',
    category: 'personality',
    developer: 'Brewin et al.',
    quickInfo: 'Brief screening tool for PTSD.',
    purpose: 'To screen for PTSD in survivors of traumatic events.',
    administration: {
      type: 'Self-report',
      items: '10 items',
      ageRange: 'Adults',
      time: '5 minutes',
      trainingNeeded: 'Minimal'
    },
    scoring: 'Count of "Yes" responses (Cut-off of 6).',
    interpretation: 'High sensitivity for detecting PTSD.',
    versions: 'Standard',
    factorsMeasured: 'PTSD symptoms (Re-experiencing and Arousal).'
  },
  {
    id: 'aps',
    name: 'APS: Adolescent Psychopathology Scale',
    category: 'personality',
    developer: 'William M. Reynolds',
    quickInfo: 'Comprehensive measure of adolescent psychopathology.',
    purpose: 'To assess for symptoms of DSM disorders in adolescents.',
    administration: {
      type: 'Self-report',
      items: '346 items (Full), 115 items (Short Form)',
      ageRange: '12 to 19 years',
      time: '45-60 minutes',
      trainingNeeded: 'High'
    },
    scoring: 'T-scores and percentiles.',
    interpretation: 'Clinical profile mapping to DSM diagnoses.',
    versions: 'APS, APS-SF',
    factorsMeasured: 'Clinical disorders, personality traits, psychosocial stressors.'
  },
  {
    id: 'adhdt-2',
    name: 'ADHDT-2: Attention-Deficit/Hyperactivity Disorder Test',
    category: 'personality',
    developer: 'James E. Gilliam',
    quickInfo: 'Identifies and evaluates ADHD symptoms.',
    purpose: 'To assist in the diagnosis of ADHD.',
    administration: {
      type: 'Teacher/Parent Rating',
      items: '36 items',
      ageRange: '5 to 22 years',
      time: '10-15 minutes',
      trainingNeeded: 'Moderate'
    },
    scoring: 'ADHD Index and percentiles.',
    interpretation: 'Based on DSM-5 criteria.',
    versions: 'ADHDT, ADHDT-2',
    factorsMeasured: 'Inattention, Hyperactivity/Impulsivity.'
  },
  {
    id: 'beck-depression',
    name: 'Beck Depression Inventory (BDI)',
    category: 'personality',
    developer: 'Aaron T. Beck',
    quickInfo: 'The 1961 original version of the BDI.',
    purpose: 'To measure the severity of depression.',
    administration: {
      type: 'Self-report',
      items: '21 items',
      ageRange: 'Adolescents and Adults',
      time: '10 minutes',
      trainingNeeded: 'Moderate'
    },
    scoring: 'Sum of responses.',
    interpretation: 'Measures depth of depression.',
    versions: 'BDI (Original), BDI-II',
    factorsMeasured: 'Mood, pessimism, sense of failure, etc.'
  },
  {
    id: 'sb-5',
    name: 'Stanford-Binet Intelligence Scale - 5th Edition',
    category: 'intelligence',
    developer: 'Roid',
    quickInfo: 'The current version of the Stanford-Binet.',
    purpose: 'To provide a comprehensive assessment of intelligence.',
    administration: {
      type: 'Individual',
      items: '10 subtests',
      ageRange: '2 to 85+ years',
      time: '45-90 minutes',
      trainingNeeded: 'High'
    },
    scoring: 'Full Scale IQ, Verbal IQ, Non-verbal IQ.',
    interpretation: 'Based on the CHC model of intelligence.',
    versions: 'SB-5',
    factorsMeasured: 'Fluid Reasoning, Knowledge, Quantitative Reasoning, Visual-Spatial Processing, Working Memory.'
  },
  {
    id: 'wais',
    name: 'Wechsler Adult Intelligence Scale (WAIS)',
    category: 'intelligence',
    developer: 'David Wechsler',
    quickInfo: 'The 1955 original adult intelligence scale.',
    purpose: 'To measure cognitive ability in adults.',
    administration: {
      type: 'Individual',
      items: '11 subtests',
      ageRange: '16 to 64 years',
      time: '60-90 minutes',
      trainingNeeded: 'High'
    },
    scoring: 'Verbal IQ, Performance IQ, Full Scale IQ.',
    interpretation: 'Classic profile analysis.',
    versions: 'WAIS (Original)',
    factorsMeasured: 'Verbal and performance capacity.'
  },
  {
    id: 'mcmi',
    name: 'Millon Clinical Multiaxial Inventory (MCMI)',
    category: 'personality',
    developer: 'Theodore Millon',
    quickInfo: 'Original version of the Millon inventory.',
    purpose: 'To identify personality disorders and clinical syndromes.',
    administration: {
      type: 'Self-report',
      items: '175 items',
      ageRange: '18+ years',
      time: '25-30 minutes',
      trainingNeeded: 'High'
    },
    scoring: 'Base Rate (BR) scores.',
    interpretation: 'Focuses on personality pathology.',
    versions: 'MCMI',
    factorsMeasured: 'Basic Personality Patterns, Pathological Personality Disorders, Clinical Syndromes.'
  },
  {
    id: 'mcmi-ii',
    name: 'Millon Clinical Multiaxial Inventory-II (MCMI-II)',
    category: 'personality',
    developer: 'Theodore Millon',
    quickInfo: 'The 1987 revision of the MCMI.',
    purpose: 'To diagnose personality disorders and symptoms.',
    administration: {
      type: 'Self-report',
      items: '175 items',
      ageRange: '18+ years',
      time: '25-30 minutes',
      trainingNeeded: 'High'
    },
    scoring: 'Base Rate (BR) scores.',
    interpretation: 'Updated scales and norms.',
    versions: 'MCMI-II',
    factorsMeasured: 'Clinical personality patterns, severe personality pathology.'
  },
  {
    id: 'halstead-reitan',
    name: 'Halstead-Reitan Neuropsychological Test Battery',
    category: 'intelligence',
    developer: 'Ward Halstead & Ralph Reitan',
    quickInfo: 'Comprehensive neuropsychological assessment tool.',
    purpose: 'To evaluate brain behavior relationships and localize brain damage.',
    administration: {
      type: 'Individual',
      items: 'Multiple subtests (Category, Tactual, Rhythm, etc)',
      ageRange: 'Children and Adults',
      time: '6-8 hours',
      trainingNeeded: 'Very High (Neuropsychologist)'
    },
    scoring: 'Impairment Index (0.0 to 1.0).',
    interpretation: 'Pattern analysis of neurocognitive deficits.',
    versions: 'Standard',
    factorsMeasured: 'Abstract reasoning, tactile perception, motor speed, rhythmic perception, language.'
  }
];

export const SMO_34_TEST_IDS = [
  'aui', 'mbti', 'beck-anxiety', 'neo-pi-r', 'beck-depression', 'personality-research-form',
  'beck-depression-ii', 'porteus-maze', 'beck-hopelessness', 'spm', 'bender-monograph',
  'rorschach', 'bender-gestalt', 'risb', 'cpi', '16pf', 'cbcl', 'sb-lm', 'child-neuro-quest',
  'sb-4', 'childhood-trauma-quest', 'sb-5', 'cat-projective', 'stai', 'children-depression-inv',
  'szondi', 'drs-clinical', 'tat', 'edi-2', 'wms-iii', 'epps', 'wais', 'cvfes', 'wais-r',
  'halstead-reitan', 'wais-iii', 'hit', 'wechsler-bellevue', 'htp-test', 'wiat-ii',
  'jenkins-activity', 'wisc-r', 'k-abc', 'wisc-iii', 'lnnb', 'wisc-iv', 'mapi', 'wppsi',
  'mcmi', 'wppsi-r', 'mcmi-ii', 'wppsi-iii', 'mcmi-iii', 'wpt', 'mmpi', 'wj-iii-ach',
  'mmpi-2-short', 'wj-iii-cog', 'mmpi-a', 'word-assoc'
];

