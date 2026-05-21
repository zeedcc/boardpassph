import { Question } from '../types';

export const SEED_QUESTIONS: Question[] = [
  // --- Requested Hard Question ---
  {
    category: "DSM-5 — Depressive Disorders (Hard Differential)",
    vignette: "A 23-year-old corporate worker presents for an assessment, reporting a \"constant dark cloud\" over her life. She explains that since breaking up with her partner of three years four months ago, she has felt deeply sad, has had difficulty falling asleep most nights, and feels a lack of energy during her weekends. However, she notes that she still manages to perform exceptionally well at her new job, has not missed any deadlines, and continues to eat normally and hang out with her friends every Friday night. She denies any suicidal ideation, feelings of worthlessness, or psychomotor changes. Based on the DSM-5 diagnostic criteria, what is the most appropriate initial diagnostic conclusion?",
    options: [
      "No diagnosis; the criteria for a mental disorder abnormality are not met",
      "Adjustment Disorder with Depressed Mood",
      "Major Depressive Disorder, Mild severity with atypical features",
      "Persistent Depressive Disorder (Dysthymia)"
    ],
    correctIndex: 0,
    explanation: "The correct conclusion is 'No diagnosis'. While the individual reports subjective sadness and minor sleep/energy fluctuations after a breakup, she continues to function exceptionally well at work, eats normally, and maintains robust social relationships. Under DSM-5, a mental disorder requires clinically significant distress or impairment in social, occupational, or other important areas of functioning. Since her functional impairment is absent, she does not meet the basic threshold for a clinical diagnosis. This reflects normal grief/sadness rather than pathology.",
    source: "dsm5",
    difficulty: "hard"
  },
  // --- Pharmacology Add-on Pack ---
  {
    category: "Psychopharmacology — Depressive Disorders",
    vignette: "A 28-year-old female presents with a 6-month history of depressed mood, anhedonia, hypersomnia, and feelings of worthlessness. She has no history of manic or hypomanic episodes. She is diagnosed with Major Depressive Disorder (MDD). What is the FDA-approved first-line pharmacological treatment?",
    options: [
      "Escitalopram (SSRI)",
      "Amitriptyline (TCA)",
      "Phenelzine (MAOI)",
      "Lithium Carbonate"
    ],
    correctIndex: 0,
    explanation: "Selective Serotonin Reuptake Inhibitors (SSRIs) like Escitalopram, Sertraline, and Fluoxetine are the gold-standard, FDA-approved first-line pharmacological treatments for Major Depressive Disorder due to their favorable safety profile and tolerability compared to TCAs and MAOIs.",
    source: "pharma",
    difficulty: "easy"
  },
  {
    category: "Psychopharmacology — Bipolar Spectrum",
    vignette: "A 34-year-old male is admitted during an acute manic episode presenting with grandiose ideas, pressured speech, and decreased need for sleep. The psychiatric consultant intends to initiate a classic, FDA-approved mood stabilizer that requires close serum level monitoring to avoid toxicity.",
    options: [
      "Lithium Carbonate",
      "Haloperidol",
      "Lamotrigine",
      "Sertraline"
    ],
    correctIndex: 0,
    explanation: "Lithium remains the classic first-line FDA-approved mood stabilizer for acute mania and maintenance therapy in Bipolar I Disorder. It requires strict therapeutic drug monitoring (target: 0.6 to 1.2 mEq/L) because of its narrow therapeutic index.",
    source: "pharma",
    difficulty: "easy"
  },
  {
    category: "Psychopharmacology — Schizophrenia",
    vignette: "A 22-year-old male is diagnosed with Schizophrenia after experiencing 7 months of auditory hallucinations, persecutory delusions, and social withdrawal. What represents the standard first-line antipsychotic class used today?",
    options: [
      "Second-Generation (Atypical) Antipsychotics (e.g., Risperidone, Aripiprazole)",
      "First-Generation (Typical) Antipsychotics (e.g., Chlorpromazine)",
      "Monoamine Oxidase Inhibitors (MAOIs)",
      "High-dose Benzodiazepines"
    ],
    correctIndex: 0,
    explanation: "Second-Generation (Atypical) Antipsychotics such as Risperidone, Olanzapine, and Aripiprazole are preferred as first-line treatments for Schizophrenia. They target both positive and negative symptoms while presenting a significantly lower risk of Extrapyramidal Symptoms (EPS) compared to first-generation neuroleptics.",
    source: "pharma",
    difficulty: "easy"
  },
  {
    category: "Psychopharmacology — ADHD",
    vignette: "An 8-year-old boy is diagnosed with ADHD, Combined Type. He exhibits substantial inattention and hyperactivity in school. What is the FDA-approved, first-line psychostimulant drug class most commonly selected?",
    options: [
      "Methylphenidate (e.g., Ritalin)",
      "Atomoxetine (Strattera)",
      "Clonidine",
      "Imipramine"
    ],
    correctIndex: 0,
    explanation: "Stimulants, particularly Methylphenidate and Ampheteramine derivatives, are FDA-approved first-line pharmacological agents for ADHD, with therapeutic response rates exceeding 70-80%. Atomoxetine is an approved non-stimulant second-line alternative.",
    source: "pharma",
    difficulty: "easy"
  },
  {
    category: "Psychopharmacology — Anxiety Disorders",
    vignette: "A 45-year-old bank manager describes persistent, excessive anxiety about daily activities, financial security, and health for over 8 months, accompanied by muscle tension and restlessness. For long-term pharmacological management of this Generalized Anxiety Disorder (GAD), which is the first-line treatment?",
    options: [
      "Escitalopram or Duloxetine (SSRI/SNRI)",
      "Alprazolam (Benzodiazepine) as monotherapy",
      "Propranolol (Beta-blocker)",
      "Lithium Carbonate"
    ],
    correctIndex: 0,
    explanation: "SSRIs (like Escitalopram) and SNRIs (like Duloxetine or Venlafaxine) are FDA-approved, non-addictive first-line pharmacological treatments for Generalized Anxiety Disorder (GAD). Benzodiazepines like Alprazolam are reserved for short-term relief due to dependence risk.",
    source: "pharma",
    difficulty: "easy"
  },
  {
    category: "Psychopharmacology — Obsessive-Compulsive Disorder",
    vignette: "A patient diagnosed with Obsessive-Compulsive Disorder (OCD) continues to experience distressing symmetry obsessions and counting compulsions despite undergoing Cognitive Behavioral Therapy. Which pharmacological strategy represents the first-line pharmacotherapeutic approach?",
    options: [
      "High-dose SSRI (e.g., Sertraline or Fluoxetine)",
      "Low-dose Benzodiazepines",
      "Valproic Acid",
      "Prazosin"
    ],
    correctIndex: 0,
    explanation: "FDA-approved first-line treatment for OCD consists of Selective Serotonin Reuptake Inhibitors (SSRIs) such as Sertraline, Fluoxetine, or Fluvoxamine, often initiated and maintained at significantly higher doses than those used for depression.",
    source: "pharma",
    difficulty: "medium"
  },

  // --- Psychological Assessment & Tests (Encyclopedia Integration) ---
  {
    category: "Psychological Assessment — Cognitive Scales",
    vignette: "An assessment psychologist is evaluating a 9-year-old child for suspected intellectual giftedness. Which Wechsler intelligence scale is specifically designed as an individual test for children aged 6 to 16 years?",
    options: [
      "WISC-V (Wechsler Intelligence Scale for Children)",
      "WAIS-IV (Wechsler Adult Intelligence Scale)",
      "WPPSI-IV (Wechsler Preschool and Primary Scale)",
      "SB-5"
    ],
    correctIndex: 0,
    explanation: "The WISC (currently in its 5th edition, WISC-V) is Wechsler's gold-standard individual intelligence test designed for children aged 6:0 to 16:11. The WAIS is for adults (16-90), and the WPPSI is for younger children (2:6 to 7:7).",
    source: "assessment",
    testId: "wisc-v"
  },
  {
    category: "Psychological Assessment — Personality Inventories",
    vignette: "A psychometrician administers a legendary objective personality inventory consisting of 567 True/False items to screen for clinical psychopathology and assess personality structure. The report highlights elevation on Scale 2 (Depression) and Scale 7 (Psychasthenia). Which test was administered?",
    options: [
      "Minnesota Multiphasic Personality Inventory - 2 (MMPI-2)",
      "Million Clinical Multiaxial Inventory (MCMI-IV)",
      "Thematic Apperception Test (TAT)",
      "16 Personality Factors (16PF)"
    ],
    correctIndex: 0,
    explanation: "The MMPI-2 contains 567 authentic true-false test items and forms the backbone of clinical psychopathology screening. It utilizes basic clinical scales numbered 1 to 0 (including Scale 2 for Depression and Scale 7 for Psychasthenia/anxiety).",
    source: "assessment",
    testId: "mmpi-2"
  },
  {
    category: "Psychological Assessment — Projective Techniques",
    vignette: "During a psychological battery, a licensed psychologist displays a series of ambiguous black-and-white cards depicting human situations and instructs the client to create a dramatic story with a beginning, middle, and end. Which projective test is being utilized?",
    options: [
      "Thematic Apperception Test (TAT)",
      "Rorschach Inkblot Method",
      "Bentton Visual Retention Test (BVRT)",
      "House-Tree-Person (HTP)"
    ],
    correctIndex: 0,
    explanation: "The Thematic Apperception Test (TAT), developed by Henry Murray and Christiana Morgan, is a projective test consisting of 31 cards representing interpersonal situations. Clients are asked to construct narratives about what is happening, what led up to it, and the resolution.",
    source: "assessment",
    testId: "tat"
  },
  {
    category: "Psychological Assessment — Mood Scales",
    vignette: "A clinician wants to track a depressed patient's symptom severity weekly. She selects a brief, 21-item self-report inventory that takes only 5-10 minutes to complete. The items are scored 0 to 3, with a total score range of 0 to 63. Which test is this?",
    options: [
      "Beck Depression Inventory-II (BDI-II)",
      "Hamilton Depression Rating Scale (HAM-D)",
      "Zung Self-Rating Depression Scale",
      "MMPI-2 Content Scale"
    ],
    correctIndex: 0,
    explanation: "The Beck Depression Inventory-II (BDI-II) consists of 21 multiple-choice items scored 0-3 based on subjective reports of depressive symptoms matching DSM-4 diagnostic thresholds over the preceding two weeks.",
    source: "assessment",
    testId: "beck-depression-ii"
  },

  // --- Clinical DSM-5 cases ---
  {
    category: "DSM-5 — Neurodevelopmental Disorders",
    vignette: "A 4-year-old child is brought to a neurodevelopmental clinic. The parents report a severe deficit in reciprocal social-communication, a total absence of eye contact, a lack of joint attention, and repetitive hand-flapping behaviors. No imaginative play is observed. What diagnostic category encompasses these symptoms?",
    options: [
      "Autism Spectrum Disorder (ASD)",
      "Social Communication Disorder",
      "Attention-Deficit/Hyperactivity Disorder (ADHD)",
      "Reactive Attachment Disorder"
    ],
    correctIndex: 0,
    explanation: "Under the DSM-5, symptoms of persistent deficits in social communication and social interaction, alongside restricted, repetitive patterns of behavior, interests, or activities (such as hand-flapping), are unified under Autism Spectrum Disorder.",
    source: "dsm5"
  },
  {
    category: "DSM-5 — Trauma and Stressor-Related Disorders",
    vignette: "A 25-year-old veteran returned from deployment 5 months ago. She reports persistent intrusive combat flashbacks, hyperarousal, avoidance of crowded places, sleep onset insomnia, and emotional numbing. These symptoms are causing severe occupational distress. What is the most accurate diagnosis?",
    options: [
      "Post-Traumatic Stress Disorder (PTSD)",
      "Acute Stress Disorder",
      "Adjustment Disorder",
      "Generalized Anxiety Disorder"
    ],
    correctIndex: 0,
    explanation: "PTSD is diagnosed when symptoms of intrusion, avoidance, cognitive/mood alterations, and hyperarousal persist for MORE than one month following exposure to a qualifying traumatic event.",
    source: "dsm5"
  },

  // --- Developmental Psychology ---
  {
    category: "Developmental Psychology — Erickson's Stages",
    vignette: "A 16-year-old high school student in Manila is highly preoccupied with finding her career path, experimenting with clothing and peer groups, and exploring personal values, occasionally clashing with her parents. According to Erik Erikson, which psychosocial crisis is she currently negotiating?",
    options: [
      "Identity vs. Role Confusion",
      "Industry vs. Inferiority",
      "Intimacy vs. Isolation",
      "Autonomy vs. Shame & Doubt"
    ],
    correctIndex: 0,
    explanation: "Erik Erikson's stage corresponding to adolescence (typically ages 12 to 18) is Identity vs. Role Confusion, where youngsters search for a coherent sense of self, personal values, and future direction in adult society.",
    source: "dev"
  },
  {
    category: "Developmental Psychology — Piaget's Stages",
    vignette: "During a developmental task, a psychologist pours equal amounts of water into two identical short glasses. She then pours one glass into a tall, thin beaker. An 8-year-old girl correctly states that both containers still hold the exact same volume of liquid. Under Piagetian theory, this demonstrates the acquisition of:",
    options: [
      "Conservation",
      "Object Permanence",
      "Egocentrism",
      "Abstract Hypothesis Testing"
    ],
    correctIndex: 0,
    explanation: "Conservation is the understanding that certain physical traits of objects (such as volume, mass, or number) remain identical despite variations in their physical shape or container. This is typically acquired during Piaget's Concrete Operational Stage (ages 7 to 11).",
    source: "dev"
  },

  // --- Industrial-Organizational Psychology ---
  {
    category: "I/O Psychology — Motivation Theories",
    vignette: "In a BPO office in Cebu, the HR team notices that while increasing commission payouts boosts call volume temporarily, keeping the workspace secure, clean, and providing stable medical benefits is essential for stopping high employee turnover. Which dual-factor theory separates hygiene factors from true motivators?",
    options: [
      "Herzberg's Two-Factor Theory",
      "Maslow's Hierarchy of Needs",
      "Vroom's Expectancy Theory",
      "Locke's Goal-Setting Theory"
    ],
    correctIndex: 0,
    explanation: "Frederick Herzberg's Two-Factor (Motivator-Hygiene) Theory proposes that workspace factors like safety, salary, and company policy are 'Hygiene Factors'—essential to prevent dissatisfaction but incapable of driving long-term positive motivation, which requires 'Motivators' like alignment, achievement, and recognition.",
    source: "io"
  },
  {
    category: "I/O Psychology — Selection Metrics",
    vignette: "An organizational psychologist wants to ensure that a pre-employment cognitive test used for selecting call center operators truly predicts their on-the-job KPI performance (e.g., ticket resolution speed and positive customer ratings) over their first six months. This HR manager is seeking to establish:",
    options: [
      "Criterion-related (Predictive) Validity",
      "Internal Consistency Reliability",
      "Content Validity",
      "Test-retest Coefficient of Stability"
    ],
    correctIndex: 0,
    explanation: "Criterion-related validity (specifically Predictive Validity) is the standard method for verifying that score metrics obtained on selection instruments accurately correlate with subsequent observable job performance measures (the criteria).",
    source: "io"
  }
];
