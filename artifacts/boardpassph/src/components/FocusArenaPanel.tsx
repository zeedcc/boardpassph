import React, { useState, useEffect, useRef } from 'react';
import { 
  Flame, Gamepad2, Timer, Lock, Volume2, VolumeX, ShieldAlert, 
  HelpCircle, Trophy, Users, Award, Zap, Compass, CheckCircle2, 
  AlertTriangle, Copy, Mail, PlusCircle, Bookmark, Compass as CompassIcon,
  Sparkles, Check, ChevronRight, Play, Square, RotateCcw, Share2, 
  UserPlus, Star, Target, Brain, TrendingUp, Shield, Search
} from 'lucide-react';
import { UserProfile, Question } from '../types';
import { db, firestoreWithTimeout } from '../firebase';
import {
  doc as firestoreDoc,
  setDoc,
  getDoc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  serverTimestamp
} from 'firebase/firestore';

interface FocusArenaPanelProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  onNavigate: (tabId: string) => void;
}

// Immutable Table Of Specifications (TOS) Board Categories in the Philippines (PRC RA10029)
interface TosItem {
  id: string;
  name: string;
  officialWeight: number; // percentage
  description: string;
}

const PHILIPPINE_TOS: TosItem[] = [
  { id: 'developmental', name: 'Developmental Psychology', officialWeight: 20, description: 'Nature-nurture, lifecycle tasks, milestones, and major developmental theories' },
  { id: 'assessment', name: 'Psychological Assessment', officialWeight: 40, description: 'Test construction, psychometrics, stats, uses, administration, and ethical practice' },
  { id: 'abnormal', name: 'Abnormal Psychology', officialWeight: 20, description: 'Psychopathology, etiology, DSM-5 diagnostics, interventions, and mental health laws' },
  { id: 'industrial', name: 'Industrial/Organizational Psych', officialWeight: 20, description: 'Org behavior, structures, HR development, team dynamics, change and development' }
];

interface ChecklistTopic {
  id: string;
  name: string;
  subtopics: string[];
}

interface SubjectTOSData {
  subjectId: string;
  title: string;
  weight: number;
  topics: ChecklistTopic[];
}

const TOS_CHECKLIST_DATA: SubjectTOSData[] = [
  {
    subjectId: 'developmental',
    title: 'Developmental Psychology',
    weight: 20,
    topics: [
      {
        id: 'dev_nature_nurture',
        name: 'A. Perspectives on Nature and Nurture',
        subtopics: [
          'Explain the role of heredity and environment in human growth and development',
          'Illustrate the influence of heredity and environment on the development of persons',
          'Identify characteristics that pertain to heredity and environment'
        ]
      },
      {
        id: 'dev_research_methods',
        name: 'B. Research Methods and Ethics',
        subtopics: [
          'Identify ethical considerations of various research methods in developmental psychology',
          'Recognize basic research designs in studying human development',
          'Differentiate cross-sectional and longitudinal research studies'
        ]
      },
      {
        id: 'dev_theories',
        name: 'C. Developmental Theories',
        subtopics: [
          "Freud's psychosexual theory of personality development",
          "Erikson's psychosocial theory of development",
          "Piaget's cognitive development across the life span",
          "Kohlberg's stages of moral growth and reasoning",
          "Bronfenbrenner's ecological systems model of personality",
          "Vygotsky's socio-cultural system in human skill acquisition",
          "Ainsworth and Mahler's attachment and separation-individuation",
          "Marcia's system of teenage identity formation profiles",
          'Behaviorism and social learning theories of development',
          "Wilson's evolutionary theory of biological development"
        ]
      },
      {
        id: 'dev_principles',
        name: 'D. Developmental Principles',
        subtopics: [
          'Explain appropriate developmental principles in the study of life-span development'
        ]
      },
      {
        id: 'dev_issues_tasks',
        name: 'E. Developmental Issues and Tasks',
        subtopics: [
          'Critical issues pertaining to heredity and environment during prenatal development',
          'Critical issues related to physical, cognitive, socio-emotional prenatal milestones',
          'Assess developmental issues and developmental tasks during childhood and adolescence',
          'Assess developmental issues and developmental tasks during adulthood stages of development',
          'Identify critical issues concerning death, bereavement, and end-of-life'
        ]
      },
      {
        id: 'dev_challenges_milestones',
        name: 'F. Developmental Challenges and Milestones',
        subtopics: [
          'Explain developmental challenges faced during prenatal and childhood stages',
          'Illustrate challenges faced during adolescence and adulthood stages',
          'Point out expected physical, cognitive, and socio-emotional milestones during childhood/adolescence',
          'Point out expected physical, cognitive, and socio-emotional milestones during adulthood',
          'Illustrate issues involved in decision-making and coping with death'
        ]
      }
    ]
  },
  {
    subjectId: 'assessment',
    title: 'Psychological Assessment',
    weight: 40,
    topics: [
      {
        id: 'assess_properties',
        name: 'A. Psychometric Properties and Principles',
        subtopics: [
          'Ascertain psychometric properties (constructing, selecting, interpreting tests)',
          'Describe value of different psychometric standards and procedures',
          'Justify reasons for accepting or rejecting instruments based on test soundness',
          'Manifest capacity to interpret and utilize test results based on psychometrics',
          'Examine ways psychometric principles are applied to interpretation and outcome usage',
          'Evaluate the application of principles in the development of assessment instruments'
        ]
      },
      {
        id: 'assess_research_stats',
        name: 'B. Research Methods and Statistics',
        subtopics: [
          'Recognize statistics applied in research studies on tests and test development',
          'Explain methods and statistics used in research studies and test construction',
          'Apply appropriate research methods and statistics in test development & standardization',
          'Analyze research and statistical methods applied in test studies and findings',
          'Appraise the appropriateness of statistics and methods applied for a given goal'
        ]
      },
      {
        id: 'assess_uses_benefits',
        name: 'C. Uses, Benefits, and Limitations',
        subtopics: [
          'State purposes of given assessment (methods vs tools)',
          'Describe benefits derived from different types of cognitive and personality assessments',
          'Determine appropriate selection tools for given populations and clinical-industrial settings',
          'Analyze the structural strengths and limitations of assessment tools',
          'Assess the appropriateness of selected assessment tools and referral questions'
        ]
      },
      {
        id: 'assess_selection',
        name: 'D. Selection of Assessment Methods',
        subtopics: [
          'Identify appropriate assessment methods and tools for specific purposes',
          'Clarify rationale for selecting assessment methods for specific populations',
          'Specify areas of assessment or tools needed for specific circumstances/settings',
          'Determine best methods and tools for both Individuals and Groups',
          'Evaluate whether selected methods and instruments yield the needed diagnostic info',
          'Recommend methods and instruments required for specific clinical/industrial goals'
        ]
      },
      {
        id: 'assess_admin_scoring',
        name: 'E. Test Administration, Scoring & Usage',
        subtopics: [
          'Detect and troubleshoot errors in test selection, administration, and scoring',
          'Show recognition of impact of errors in test administration, scoring, and interpretation',
          'Respond appropriately to challenges in test usage, admin, scoring, and interpretation',
          'Explore anomalies in test administration, scoring, and interpretation',
          'Appraise the usefulness of test batteries under varying testing conditions'
        ]
      },
      {
        id: 'assess_ethics',
        name: 'F. Ethical Principles and Standards of Practice',
        subtopics: [
          'Identify ethical principles that pertain to test selection, use, and interpretation',
          'Expound on what makes a situation or activity a violation of professional PAP ethics',
          'Appropriately handle different situations that challenge ethical principles and standards',
          'Explore different possibilities for avoiding ethical violations in practice',
          'Evaluate ethical appropriateness of how psychometric or psychological matters are managed'
        ]
      }
    ]
  },
  {
    subjectId: 'abnormal',
    title: 'Abnormal Psychology',
    weight: 20,
    topics: [
      {
        id: 'abn_manifestations',
        name: 'A. Manifestations of Behavior',
        subtopics: [
          'Recognize normal and abnormal manifestations of behavioral patterns',
          'Assess abnormal manifestations of behaviors based on diverse social and clinical contexts'
        ]
      },
      {
        id: 'abn_disorders',
        name: 'B. Psychological Disorders and DSM Rules',
        subtopics: [
          'Differentiate Anxiety Disorders from other psychological disorders under DSM criteria',
          'Differentiate Trauma-and-Stressor Related Disorders from competing pathologies',
          'Differentiate Obsessive-Compulsive and Related Disorders from other psychological spectrums',
          'Explain somatic symptom and related clinical disorders',
          'Evaluate dissociative disorders and distinct somatic profiles',
          'Illustrate Depressive and Bipolar Mood Disorders and specific symptoms',
          'Explain Eating and Sleep-wake Disorders',
          'Evaluate Sexual Dysfunctions, Paraphilic Disorders, and Gender Dysphoria',
          'Explain Substance-Related and Addictive Disorders',
          'Explain impulse control and conduct behavioral disruptions',
          'Illustrate different Personality Disorders and their clinical phenotypes',
          'Illustrate Schizophrenia spectrum and other Psychotic Disorders',
          'Identify different Neurodevelopmental and Neurocognitive Disorders based on DSM criteria'
        ]
      },
      {
        id: 'abn_theories_etiology',
        name: 'C. Theoretical Approaches of Etiology',
        subtopics: [
          'Illustrate genetic and biological contributions in the development of mental disorders',
          'Illustrate the role of biological and neurological bases in development',
          'Illustrate the role of behavioral conditioning and learning in psychopathology',
          'Explain cognitive theories in the development of psychological disorders',
          'Attribute the diathesis-stress model to the origin of psychological disorders',
          'Analyze the role of gene-environment interaction in development',
          'Assess the role of culture, social forces, and interpersonal factors in psychopathology'
        ]
      },
      {
        id: 'abn_interventions',
        name: 'D. Therapeutic Interventions',
        subtopics: [
          'Explain different behavioral, cognitive, or pharmacotherapy interventions',
          'Illustrate application of psychological interventions for treatment of specific disorders',
          'Evaluate efficacy and outcome metrics of various interventions for psychopathology'
        ]
      },
      {
        id: 'abn_social_ethics',
        name: 'E. Socio-cultural Factors and Ethical Principles',
        subtopics: [
          'Identify socio-cultural factors that may impact diagnosing of mental disorders',
          'Apply appropriate ethical principles and standards of practice in clinical diagnosing'
        ]
      },
      {
        id: 'abn_crisis_law',
        name: 'F. Global Health Crisis and Mental Health Law',
        subtopics: [
          'Recognize issues/concerns of global stressors (e.g. COVID-19) on mental wellness',
          'Analyze the challenges of implementing Mental Health Law (R.A. 11036) in the Philippines',
          'Evaluate the impact of global crises on community-based psychological care'
        ]
      }
    ]
  },
  {
    subjectId: 'industrial',
    title: 'Industrial/Organizational Psych',
    weight: 20,
    topics: [
      {
        id: 'io_theory',
        name: 'A. Organization Theory',
        subtopics: [
          'Describe different organizational theories, models, and structural concepts',
          'Apply theories of organization to the overall understanding of human behavior in settings',
          'Determine focus and analyze differences between core Org Theories (Classical, Neo-Classical, Modern, Contingency, Motivation, Open Systems)',
          'Examine the importance of organization theory in improving structure, efficiency and culture'
        ]
      },
      {
        id: 'io_structures',
        name: 'B. Organizational Structures & Systems',
        subtopics: [
          'Evaluate organizational models (functional, multi-divisional, flat, matrix, network, hierarchy)',
          'Define elements of structural design (job design, departmentation, delegation, span of control, command)',
          'Apply understanding of organizational design to appreciate roles and performance accountability',
          'Explain the importance of aligning organizational structure with business strategy',
          'Apply understanding of business elements to ensure corporate profitability and success'
        ]
      },
      {
        id: 'io_hrd_hrm',
        name: 'C. Human Resource Development & Management',
        subtopics: [
          'Differentiate Human Resource Development (HRD), HRM, OD, and Employee Training',
          'Identify activities, scope, coverage and processes involved in HRD processes',
          'Examine HRD areas: training, learning, career pathing, talent, appraising, engagement',
          'Analyze HRM activities: manpower planning, staffing, developing, monitoring, and evaluating',
          'Compare the tactical and executive roles of HR Manager vs HRD Manager'
        ]
      },
      {
        id: 'io_team_dynamics',
        name: 'D. Team Dynamics',
        subtopics: [
          'Explain the importance and corporate impact of team dynamics in an organization',
          'Identify individual stages of team development (Tuckman model)',
          'Examine collective group processes that affect team synergy and effectiveness',
          'Identify common interpersonal problems and friction points that occur in business teams',
          'Apply knowledge of dynamics to troubleshoot team problems and optimize performance'
        ]
      },
      {
        id: 'io_change_dev',
        name: 'E. Organizational Change & Development',
        subtopics: [
          'Distinguish between Organizational Change, Organizational Development (OD), and Transformation',
          'Analyze internal/external driving forces causing corporate organizational change',
          'Identify types and implications of large-scale structural changes',
          'Evaluate types of OD interventions to enhance wellness, engagement, and productivity',
          'Examine strategic techniques to manage, cope with, or achieve change efficiency'
        ]
      }
    ]
  }
];

const DAILY_CHALLENGES_REGISTRY: Question[] = [
  {
    category: 'Assessment & Ethics',
    vignette: 'During court proceedings in a child custody case, the opposing legal team subpoenas the raw scores, client-completed test answers, and diagnostic response protocols of a child. Under PAP Ethics Code and RA 10029, the registered psychometrician should:',
    options: [
      'Release the documents immediately under court mandate to demonstrate transparency',
      'Refuse flatly and assert absolute psychological privilege even under contempt warning',
      'Provide raw data only to a qualified peer or psychologist who is competent to interpret the results',
      'Post the complete answers on a digital review directory for public feedback'
    ],
    correctIndex: 2,
    explanation: 'Under the PAP Code of Ethics, psychometricians make every effort to avoid releasing raw test materials to unqualified individuals (such as lawyers or judges) to preserve test integrity. Raw data should only be routed through qualified psychologists who are trained to interpret them safely.'
  },
  {
    category: 'Clinical Psychology',
    vignette: 'During an intake assessment at an outpatient clinic, a 28-year-old reviewee describes a 3-week onset of severe depressive symptoms, accompanied by alternating episodes where she speaks rapidly, requires only 3 hours of sleep, exhibits grand ideas of passing the topspot with minimal review, and manifests severe buying impulses. No drug abuse detected. Under DSM-5-TR, which formulation is correct?',
    options: [
      'Major Depressive Disorder with psychotic features',
      'Cyclothymic pattern with rapid-progression indicators',
      'Bipolar I Disorder, current episode manic with mixed elements',
      'Borderline Personality Disorder triggered by PRC exam pressure'
    ],
    correctIndex: 2,
    explanation: 'The presence of at least one core manic episode (lasting at least one week, marked by grandiosity, decreased need for sleep, and flight of ideas) alternating with depressive episodes indicates Bipolar I Disorder. Distinct manic episodes rule out Major Depressive Disorder or isolated Bipolar II.'
  },
  {
    category: 'Psychological Assessment',
    vignette: 'An assessment psychologist performs an exploratory factor analysis on a new Licensure Self-Efficacy Scale. The Scree plot displays a sharp bend after the second factor, with eigenvalues of 4.2, 2.8, 0.9, and 0.5. According to Kaiser’s criterion and the Scree test, how many dimensions should be retained?',
    options: [
      'One dimension with high internal consistency',
      'Two dimensions with eigenvalues greater than 1.0',
      'Three dimensions to account for marginal error variance',
      'Four dimensions to cover the complete domain'
    ],
    correctIndex: 1,
    explanation: 'According to Kaiser\'s rule, factors with eigenvalues greater than 1.0 should be retained (which is two factors: 4.2 and 2.8). The Scree test also indicates retaining factors before the elbow or bend, which suggests a two-factor structure.'
  },
  {
    category: 'Abnormal Psychology',
    vignette: 'A 72-year-old former Manila clerk displays insidious declines in executive functioning, memory recall, and social conduct. A brain MRI shows prominent bilateral frontal lobe atrophy and normal temporal lobes. Personality changes include disinhibition, loss of empathy, and hyperorality. Standard clinical differential diagnostic criteria point to:',
    options: [
      'Alzheimer’s type dementia with early-onset memory degradation',
      'Frontotemporal Neurocognitive Disorder (Pick’s Disease)',
      'Vascular Neurocognitive Disorder following chronic silent infarcts',
      'Pseudodementia secondary to late-onset major depression'
    ],
    correctIndex: 1,
    explanation: 'Behavioral-variant frontotemporal neurocognitive disorder is characterized by bilateral frontal lobe atrophy, executive function declines, loss of empathy, behavioral disinhibition, apathy, and hyperorality, occurring before prominent amnestic or spatial memory deterioration.'
  },
  {
    category: 'Industrial/Organizational Psych',
    vignette: 'An I/O consultant calculates that the cross-validation coefficient of a complex cognitive aptitude test is considerably lower than its initial shrinkage-predicted coefficient. This disparity suggests:',
    options: [
      'High test-retest reliability across multiple assessment iterations',
      'The regression equation capitalized on chance/idiosyncratic sample characteristics',
      'The test possesses exceptional criterion-related validities across domains',
      'Range restriction occurred in the applicant screening pool'
    ],
    correctIndex: 1,
    explanation: 'A significant difference between the initial derivation R-squared and the cross-validation R-squared (shrinkage) indicates that the regression weights capitalized heavily on sample-specific chance fluctuations, leading to over-fitted predictability that doesn\'t generalize.'
  },
  {
    category: 'Clinical Psychology',
    vignette: 'A 24-year-old student reports sudden-onset blindness in her left eye immediately after failing a vital board practice trial. Extensive ophthalmological reviews and visual evoked potential tests are entirely normal. She seems strangely unconcerned about her blindness. Which category matches this presentation?',
    options: [
      'Factitious Disorder imposed on self',
      'Illness Anxiety Disorder centered on neurological integrity',
      'Conversion Disorder (Functional Neurological Symptom Disorder)',
      'Somatic Symptom Disorder with severe sensory distress'
    ],
    correctIndex: 2,
    explanation: 'Conversion Disorder is characterized by symptoms of altered voluntary motor or sensory function (like sudden blindness) that are incompatible with recognized neurological or medical conditions, often presenting with "la belle indifférence" (lack of concern).'
  },
  {
    category: 'Abnormal Psychology',
    vignette: 'A 31-year-old male exhibits continuous grandiose delusions and auditory hallucinations for 6 months. During this period, he experiences a severe major depressive episode lasting for 3 weeks. What is the differential diagnosis priority under DSM-5-TR?',
    options: [
      'Schizophrenia',
      'Schizoaffective Disorder, depressive type',
      'Major Depressive Disorder with psychotic features',
      'Delusional Disorder with transient depressive features'
    ],
    correctIndex: 0,
    explanation: 'Because the active psychotic symptoms persisted for several months in the absolute absence of a prominent mood episode, the correct diagnosis is Schizophrenia. In Schizoaffective Disorder, major mood episodes must be present for the majority of the active and residual duration of the illness.'
  }
];

export const FocusArenaPanel: React.FC<FocusArenaPanelProps> = ({ profile, setProfile, onNavigate }) => {
  // Current view states of the Focus & Game Arena
  const [activeSubTab, setActiveSubTab] = useState<'pomodoro' | 'blocker' | 'tos' | 'daily' | 'adaptive' | 'peer' | 'referrals'>('pomodoro');
  
  // Audio state
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Success/Bonus triggers
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // --- FEATURE 1: TABLE OF SPECIFICATIONS (TOS) WEIGHT TRACKER STATES ---
  const [tosProgress, setTosProgress] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem(`bp_tos_${profile.email}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migrate old clinical value to developmental if needed
      if (parsed.clinical !== undefined && parsed.developmental === undefined) {
        parsed.developmental = parsed.clinical;
      }
      return parsed;
    }
    return { developmental: 55, assessment: 60, abnormal: 50, industrial: 45 };
  });

  const handleTosChange = (id: string, val: number) => {
    const updated = { ...tosProgress, [id]: val };
    setTosProgress(updated);
    localStorage.setItem(`bp_tos_${profile.email}`, JSON.stringify(updated));
  };

  // Compute overall weighted score
  const overallTosScore = PHILIPPINE_TOS.reduce((acc, curr) => {
    const oldKey = curr.id === 'developmental' ? 'clinical' : curr.id;
    const selfRating = tosProgress[curr.id] ?? tosProgress[oldKey] ?? 0;
    return acc + (selfRating * (curr.officialWeight / 100));
  }, 0);

  // --- TOS TRACKER CHECKLIST STATES ---
  const [tosChecked, setTosChecked] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(`bp_tos_checked_${profile.email}`);
    return saved ? JSON.parse(saved) : {};
  });

  const handleToggleChecked = (itemId: string) => {
    const updated = { ...tosChecked, [itemId]: !tosChecked[itemId] };
    setTosChecked(updated);
    localStorage.setItem(`bp_tos_checked_${profile.email}`, JSON.stringify(updated));
  };

  const [expandedTosSubject, setExpandedTosSubject] = useState<string | null>(null);
  const [tosSearchQuery, setTosSearchQuery] = useState('');

  const syncMasteryFromChecklist = (subjectId: string) => {
    const data = TOS_CHECKLIST_DATA.find(s => s.subjectId === subjectId);
    if (!data) return;
    
    // Find all subtopic ids for this subject
    const allSubtopicIds: string[] = [];
    data.topics.forEach(t => {
      t.subtopics.forEach((_, idx) => {
        allSubtopicIds.push(`${t.id}_${idx}`);
      });
    });

    const checkedCount = allSubtopicIds.filter(id => tosChecked[id]).length;
    const totalCount = allSubtopicIds.length;
    const computedMastery = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

    handleTosChange(subjectId, computedMastery);
    showToast(`🔄 Combined ${checkedCount}/${totalCount} topics. Updated ${data.title} Mastery to ${computedMastery}%!`);
  };

  // --- FEATURE 2: POMODORO TIMER STATES ---
  const [pomodoroSeconds, setPomodoroSeconds] = useState(25 * 60);
  const [pomodoroIsActive, setPomodoroIsActive] = useState(false);
  const [pomodoroMode, setPomodoroMode] = useState<'study' | 'shortBreak' | 'longBreak'>('study');
  const [pomodoroConfig, setPomodoroConfig] = useState({ study: 25, shortBreak: 5, longBreak: 15 });
  const [focusTask, setFocusTask] = useState('Reviewing DSM-5 Personality Clusters...');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Web Audio Synth to create genuine, zero-file-dependency focus tones
  const playBeepTone = (freq: number, duration: number, type: 'sine' | 'square' | 'triangle' = 'sine') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio Context beep tone deferred:", e);
    }
  };

  const startTimer = () => {
    setPomodoroIsActive(true);
    playBeepTone(440, 0.15);
  };

  const pauseTimer = () => {
    setPomodoroIsActive(false);
    playBeepTone(330, 0.1);
  };

  const resetTimer = () => {
    setPomodoroIsActive(false);
    const durationMins = pomodoroMode === 'study' ? pomodoroConfig.study : (pomodoroMode === 'shortBreak' ? pomodoroConfig.shortBreak : pomodoroConfig.longBreak);
    setPomodoroSeconds(durationMins * 60);
    playBeepTone(220, 0.2);
  };

  const handlePomodoroModeChange = (mode: 'study' | 'shortBreak' | 'longBreak') => {
    setPomodoroMode(mode);
    setPomodoroIsActive(false);
    const mins = mode === 'study' ? pomodoroConfig.study : (mode === 'shortBreak' ? pomodoroConfig.shortBreak : pomodoroConfig.longBreak);
    setPomodoroSeconds(mins * 60);
    playBeepTone(350, 0.15, 'triangle');
  };

  useEffect(() => {
    if (pomodoroIsActive) {
      timerRef.current = setInterval(() => {
        setPomodoroSeconds((prev) => {
          if (prev <= 1) {
            // Timer finished!
            clearInterval(timerRef.current!);
            setPomodoroIsActive(false);
            
            if (pomodoroMode === 'study') {
              // Eearned Focus XP reward!
              const gainXpAmount = 25;
              const newScore = profile.correct + 2; 
              const newXp = profile.totalXp + gainXpAmount;
              setProfile(prevProf => prevProf ? {
                ...prevProf,
                totalXp: newXp
              } : null);

              playBeepTone(880, 0.4, 'sine');
              setTimeout(() => playBeepTone(1100, 0.5, 'sine'), 150);
              showToast(`🎯 Great job studying! Spent ${pomodoroConfig.study} minutes on target. Eearned +${gainXpAmount} Board XP!`);
              
              // Automatically switch to break
              handlePomodoroModeChange('shortBreak');
            } else {
              playBeepTone(520, 0.35, 'triangle');
              showToast("🔋 Break session completed. Ready to hit the Board Matrices again?");
              handlePomodoroModeChange('study');
            }
            return 0;
          }
          // Tick sound every 10 seconds for immersion (optional and subtle)
          if (prev % 10 === 0) {
            playBeepTone(600, 0.015, 'triangle');
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [pomodoroIsActive, pomodoroMode, profile]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // --- FEATURE 3: ALLOWLISTED APP SHIELD FOCUS LOCK ---
  const [studyLockOn, setStudyLockOn] = useState(false);
  const [focusBreachCount, setFocusBreachCount] = useState(0);
  const [selectedAllowlist, setSelectedAllowlist] = useState<string[]>([
    'boardpass-arena', 'calculator', 'dsm5-reference'
  ]);

  const allowlistedAppsCatalog = [
    { id: 'boardpass-arena', name: 'BoardPassPH Main Simulator', details: 'Practice vignettes environment' },
    { id: 'calculator', name: 'PRC Board Calculator', details: 'Non-programmable math utility' },
    { id: 'dsm5-reference', name: 'DSM-5 Diagnostic Criteria Manual', details: 'Mental health differential dictionary' },
    { id: 'pharmacology-sheet', name: 'Basic Psychopharmacology Cheat sheet', details: 'Medication classes index' },
    { id: 'ethics-ph', name: 'PAP Code of Ethical Practice', details: 'PRC professional board handbook' }
  ];

  const handleToggleAllowlist = (id: string) => {
    if (selectedAllowlist.includes(id)) {
      setSelectedAllowlist(selectedAllowlist.filter(item => item !== id));
    } else {
      setSelectedAllowlist([...selectedAllowlist, id]);
    }
  };

  // Blur event listener to detect when user moves to non-allowlisted background tasks
  useEffect(() => {
    if (!studyLockOn) return;

    const handleFocusLoss = () => {
      setFocusBreachCount(prev => {
        const next = prev + 1;
        playBeepTone(150, 0.5, 'square');
        return next;
      });
    };

    window.addEventListener('blur', handleFocusLoss);
    return () => {
      window.removeEventListener('blur', handleFocusLoss);
    };
  }, [studyLockOn]);

  const triggerActivateFocusLock = () => {
    setFocusBreachCount(0);
    setStudyLockOn(true);
    playBeepTone(500, 0.35, 'sine');
    showToast("🛡️ Focus Lock Active! Moving away from this tab will trigger a Focus Breach. Remain disciplined!");
  };

  const triggerDeactivateFocusLock = () => {
    setStudyLockOn(false);
    playBeepTone(300, 0.2, 'triangle');
    
    // Reward based on lock integrity
    if (focusBreachCount === 0) {
      const bonus = 40;
      setProfile(p => p ? { ...p, totalXp: p.totalXp + bonus } : null);
      showToast(`🏆 Flawless Focus Shield! 0 breaches detected. Claimed +${bonus} Focus Board XP.`);
    } else {
      showToast(`🔒 Focus session closed. Detected ${focusBreachCount} off-board workspace breaches.`);
    }
  };

  // --- FEATURE 4: DYNAMIC DAILY CHALLENGE STATES & CORE VIGNETTE ---
  const todayString = new Date().toISOString().split('T')[0];
  const dailyStatus = profile.dailyChallenges?.[todayString] || 'unattempted';
  const [selectedDailyAnswer, setSelectedDailyAnswer] = useState<number | null>(null);

  const todayIndex = new Date().getDay(); // 0 to 6
  const ACTIVE_DAILY_VIGNETTE = DAILY_CHALLENGES_REGISTRY[todayIndex];

  const handleSubmitDailyChallenge = () => {
    if (selectedDailyAnswer === null) return;
    
    const isCorrect = selectedDailyAnswer === ACTIVE_DAILY_VIGNETTE.correctIndex;
    const statusVal = isCorrect ? 'correct' : 'incorrect';
    
    // Play sound feedback
    if (isCorrect) {
      playBeepTone(900, 0.25, 'sine');
      setTimeout(() => playBeepTone(1200, 0.4, 'sine'), 100);
    } else {
      playBeepTone(200, 0.45, 'square');
    }

    // Award bonus XP and track daily completion status in the user profile
    const bonusXp = isCorrect ? 150 : 25; // High-difficulty grants 150 bonus XP on correct!
    
    setProfile(p => {
      if (!p) return null;
      
      const updatedChallenges: Record<string, 'correct' | 'incorrect'> = {
        ...(p.dailyChallenges || {}),
        [todayString]: statusVal
      };

      return {
        ...p,
        totalXp: p.totalXp + (isCorrect ? bonusXp : 10), // attempts get a small consolation XP too
        streakShields: p.streakShields + (isCorrect ? 1 : 0),
        correct: p.correct + (isCorrect ? 1 : 0),
        attempts: p.attempts + 1,
        dailyChallenges: updatedChallenges
      };
    });

    if (isCorrect) {
      showToast(`🎉 Correct! Today's Daily challenge completed. Claimed +${bonusXp} XP and +1 Streak Shield.`);
    } else {
      showToast(`❌ Incorrect clinical formulation. Wrote attempts data but review discussion below!`);
    }
  };

  const handleClearDailyChallenge = () => {
    setProfile(p => {
      if (!p) return null;
      const updatedChallenges: Record<string, 'correct' | 'incorrect'> = { ...(p.dailyChallenges || {}) };
      delete updatedChallenges[todayString];
      return {
        ...p,
        dailyChallenges: updatedChallenges
      };
    });
    setSelectedDailyAnswer(null);
    playBeepTone(440, 0.1);
  };

  // --- FEATURE 5: ADAPTIVE TESTING STATES ---
  const currentAccuracy = profile.attempts > 0 ? (profile.correct / profile.attempts) : 0.60;
  
  // Custom difficulty computation
  const getAdaptiveDifficultyLevel = () => {
    if (currentAccuracy < 0.45) return { name: 'Level 1: Foundational Recall', desc: 'Slightly simplified board recall and elementary concepts', icon: '🌱' };
    if (currentAccuracy < 0.65) return { name: 'Level 2: Standard Application', desc: 'Standard vignette scenarios common to the PRC Psychometrician boards', icon: '🧠' };
    if (currentAccuracy < 0.80) return { name: 'Level 3: Clinical Diagnosis', desc: 'Complex differentials, comorbid conditions, and ethical codes weighting 30%', icon: '🚀' };
    return { name: 'Level 4: Master Topnotcher High-Yield', desc: 'Elite challenges matching Top 10 criteria and advanced psych diagnostics', icon: '👑' };
  };

  const currentDifficultyObj = getAdaptiveDifficultyLevel();

  const handleToggleAdaptiveSetting = () => {
    const nextVal = !profile.adaptive;
    setProfile(p => p ? { ...p, adaptive: nextVal } : null);
    playBeepTone(400, 0.2, 'triangle');
    showToast(nextVal ? "🧠 Adaptive Board Matrix IQ Auto-scaling enabled!" : "🔒 Fixed study difficulty mode configured.");
  };

  // --- FEATURE 6: GROUP STUDY (live Firestore sync) ---
  const [groupRoomName, setGroupRoomName] = useState('');
  const [groupRoomId, setGroupRoomId] = useState<string | null>(null);
  const [groupRoomLink, setGroupRoomLink] = useState<string | null>(null);
  const [groupParticipants, setGroupParticipants] = useState<string[]>([]);
  const [groupRoomLive, setGroupRoomLive] = useState(false);
  const groupRoomUnsubRef = useRef<(() => void) | null>(null);
  const localRoomPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const generateRoomId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  const applyRoomSnapshot = (room: { name?: string; participants?: string[] } | undefined) => {
    if (!room) return;
    setGroupParticipants(room.participants || []);
    if (room.name) setGroupRoomName(room.name);
  };

  const subscribeToGroupRoom = (id: string, useLocal: boolean) => {
    if (groupRoomUnsubRef.current) {
      groupRoomUnsubRef.current();
      groupRoomUnsubRef.current = null;
    }
    if (localRoomPollRef.current) {
      clearInterval(localRoomPollRef.current);
      localRoomPollRef.current = null;
    }

    if (useLocal) {
      setGroupRoomLive(false);
      const readLocal = () => {
        try {
          const localRooms = JSON.parse(localStorage.getItem('bp_local_studyRooms') || '{}');
          applyRoomSnapshot(localRooms[id]);
        } catch { /* ignore */ }
      };
      readLocal();
      const onStorage = (ev: StorageEvent) => {
        if (ev.key === 'bp_local_studyRooms') readLocal();
      };
      window.addEventListener('storage', onStorage);
      localRoomPollRef.current = setInterval(readLocal, 2000);
      groupRoomUnsubRef.current = () => {
        window.removeEventListener('storage', onStorage);
        if (localRoomPollRef.current) clearInterval(localRoomPollRef.current);
      };
      return;
    }

    const roomRef = firestoreDoc(db, 'studyRooms', id);
    groupRoomUnsubRef.current = onSnapshot(
      roomRef,
      (snap) => {
        if (snap.exists()) {
          setGroupRoomLive(true);
          applyRoomSnapshot(snap.data() as { name?: string; participants?: string[] });
        }
      },
      () => setGroupRoomLive(false)
    );
  };

  const handleCreateGroupRoom = async (e?: React.FormEvent) => {
    e?.preventDefault?.();
    if (!groupRoomName.trim()) {
      alert('Please provide a name for the study space.');
      return;
    }

    const id = generateRoomId();
    const link = `${window.location.origin}${window.location.pathname}#group-study=${id}`;

    try {
      const roomRef = firestoreDoc(db, 'studyRooms', id);
      await firestoreWithTimeout(setDoc(roomRef, {
        id,
        name: groupRoomName.trim(),
        host: profile.email,
        participants: [profile.email],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }));

      setGroupRoomId(id);
      setGroupRoomLink(link);
      window.location.hash = `group-study=${id}`;
      subscribeToGroupRoom(id, false);
      playBeepTone(700, 0.18, 'sine');
      showToast(`Study space "${groupRoomName}" created — share the link with classmates.`);
    } catch (err) {
      console.error('Failed to create room', err);
      try {
        const localRooms = JSON.parse(localStorage.getItem('bp_local_studyRooms') || '{}');
        localRooms[id] = {
          id,
          name: groupRoomName.trim(),
          host: profile.email,
          participants: [profile.email],
          createdAt: Date.now(),
        };
        localStorage.setItem('bp_local_studyRooms', JSON.stringify(localRooms));
        setGroupRoomId(id);
        setGroupRoomLink(link);
        window.location.hash = `group-study=${id}`;
        setGroupParticipants([profile.email]);
        subscribeToGroupRoom(id, true);
        playBeepTone(700, 0.18, 'sine');
        showToast(`Study space created locally (same browser). For live multi-device sync, allow Firestore access.`);
      } catch {
        showToast('Unable to create study room. Please check your connection and try again.');
      }
    }
  };

  const handleCopyGroupLink = async () => {
    if (!groupRoomLink) return;
    try {
      await navigator.clipboard.writeText(groupRoomLink);
      showToast('Link copied to clipboard');
    } catch (e) {
      // fallback
      prompt('Copy the study room link:', groupRoomLink);
    }
  };

  // Auto-join room if URL hash contains group-study
  useEffect(() => {
    if (!profile?.email) return;
    const hash = window.location.hash || '';
    const m = hash.match(/group-study=([A-Za-z0-9\-]+)/);
    if (!m) return;
    const id = m[1];
    if (groupRoomId === id && groupRoomUnsubRef.current) return;

    const roomRef = firestoreDoc(db, 'studyRooms', id);
    const link = `${window.location.origin}${window.location.pathname}#group-study=${id}`;

    (async () => {
      try {
        const snap = await firestoreWithTimeout(getDoc(roomRef));
        if (!snap.exists()) {
          const localRooms = JSON.parse(localStorage.getItem('bp_local_studyRooms') || '{}');
          if (localRooms[id]) {
            const room = localRooms[id];
            if (!room.participants.includes(profile.email)) {
              room.participants.push(profile.email);
              localRooms[id] = room;
              localStorage.setItem('bp_local_studyRooms', JSON.stringify(localRooms));
            }
            setGroupRoomId(id);
            setGroupRoomLink(link);
            setGroupRoomName(room.name || '');
            subscribeToGroupRoom(id, true);
            showToast(`Joined local study space: ${room.name}`);
            return;
          }
          showToast('Study room not found.');
          return;
        }

        await firestoreWithTimeout(updateDoc(roomRef, {
          participants: arrayUnion(profile.email),
          updatedAt: serverTimestamp(),
        }));
        setGroupRoomId(id);
        setGroupRoomLink(link);
        setGroupRoomName(snap.data()?.name || '');
        subscribeToGroupRoom(id, false);
        playBeepTone(520, 0.12, 'sine');
        showToast(`Joined study space: ${snap.data()?.name || id}`);
      } catch (err) {
        console.error('Failed to join room', err);
        try {
          const localRooms = JSON.parse(localStorage.getItem('bp_local_studyRooms') || '{}');
          if (localRooms[id]) {
            const room = localRooms[id];
            if (!room.participants.includes(profile.email)) {
              room.participants.push(profile.email);
              localRooms[id] = room;
              localStorage.setItem('bp_local_studyRooms', JSON.stringify(localRooms));
            }
            setGroupRoomId(id);
            setGroupRoomLink(link);
            setGroupRoomName(room.name || '');
            subscribeToGroupRoom(id, true);
            showToast(`Joined local study space: ${room.name}`);
            return;
          }
        } catch { /* ignore */ }
        showToast('Unable to join study room. Please verify the room link and try again.');
      }
    })();

    return () => {
      if (groupRoomUnsubRef.current) {
        groupRoomUnsubRef.current();
        groupRoomUnsubRef.current = null;
      }
    };
  }, [profile?.email]);

  // --- FEATURE 7: CLASSMATE STUDY REFERRAL SYSTEM ---
  const [referralEmailInput, setReferralEmailInput] = useState('');
  const [invitedPeers, setInvitedPeers] = useState<string[]>(() => {
    const saved = localStorage.getItem(`bp_referred_${profile.email}`);
    return saved ? JSON.parse(saved) : [];
  });

  const generateReferralCode = () => {
    const prefix = "BPP";
    const userPart = profile.email.split('@')[0].toUpperCase().slice(0, 5);
    const hash = profile.email.length * 377 % 1000;
    return `${prefix}-${userPart}${hash}`;
  };

  const referralCodeString = generateReferralCode();

  const handleInvitePeer = (e: React.FormEvent) => {
    e.preventDefault();
    const mail = referralEmailInput.trim().toLowerCase();
    if (!mail) return;
    if (mail === profile.email) {
      alert("⚠️ You cannot refer your own active account!");
      return;
    }
    if (invitedPeers.includes(mail)) {
      alert("⚠️ That classmate has already been invited or registered!");
      return;
    }

    const updated = [...invitedPeers, mail];
    setInvitedPeers(updated);
    localStorage.setItem(`bp_referred_${profile.email}`, JSON.stringify(updated));

    // Dynamic award (Bonus! Invite yields immediate 100 XP + 1 streak shield!)
    setProfile(p => p ? {
      ...p,
      totalXp: p.totalXp + 200,
      streakShields: p.streakShields + 1
    } : null);

    setReferralEmailInput('');
    playBeepTone(800, 0.25, 'sine');
    showToast(`✉️ Invitation routed to ${mail}! You claimed +200 Board XP & +1 Streak Shield.`);
  };

  return (
    <div className="space-y-6">
      
      {/* GLOBAL TOAST NOTIFIER FOR ACTIONS */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-pine text-cream px-5 py-3.5 rounded-2xl border border-mint/20 shadow-xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <div className="w-2 h-2 rounded-full bg-mint animate-ping" />
          <span className="text-xs font-bold leading-tight font-sans tracking-wide">
            {toastMessage}
          </span>
        </div>
      )}

      {/* COMPACT INTEGRATED CONTROLS HEADER */}
      <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-lg font-heading font-black text-pine uppercase tracking-tight flex items-center gap-1.5 leading-none">
            <Flame className="w-5 h-5 text-rose-500 fill-current animate-pulse" />
            <span>Focus &amp; Study Arena</span>
          </h2>
          <p className="text-[10px] text-sage font-mono uppercase tracking-widest font-bold">
            Interactive metrics, cognitive tools &amp; peers duels
          </p>
        </div>

        {/* Global Sound & Action utility controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              playBeepTone(440, 0.1, 'sine');
            }}
            className="p-2 bg-foam/70 hover:bg-foam rounded-xl text-pine transition border border-pine/5 flex items-center gap-1 cursor-pointer select-none"
            title="Toggle focus metrics feedback sounds"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-gray-400" />
            )}
            <span className="text-[9px] font-bold uppercase tracking-wider font-mono">
              {soundEnabled ? 'SFX ON' : 'SFX OFF'}
            </span>
          </button>

          <span className="text-[10px] font-mono bg-pine/5 text-pine font-black px-3 py-1.5 rounded-xl border border-pine/10">
            ⚡ {profile.totalXp.toLocaleString()} BOARD XP
          </span>
        </div>
      </div>

      {/* SYSTEM SUB-MENU TABS */}
      <div className="flex flex-wrap bg-white border border-gray-100 p-1.5 rounded-2xl shadow-sm gap-1 select-none">
        <button
          onClick={() => { setActiveSubTab('pomodoro'); playBeepTone(500, 0.1); }}
          className={`px-3 py-2 text-[10px] uppercase font-black tracking-wider rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'pomodoro' ? 'bg-pine text-cream font-bold shadow' : 'text-pine hover:bg-gray-50'
          }`}
        >
          <Timer className="w-3.5 h-3.5" />
          <span>Pomodoro Timer</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('blocker'); playBeepTone(500, 0.1); }}
          className={`px-3 py-2 text-[10px] uppercase font-black tracking-wider rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'blocker' ? 'bg-pine text-cream font-bold shadow' : 'text-pine hover:bg-gray-50'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Focus Study Lock</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('tos'); playBeepTone(500, 0.1); }}
          className={`px-3 py-2 text-[10px] uppercase font-black tracking-wider rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'tos' ? 'bg-pine text-cream font-bold shadow' : 'text-pine hover:bg-gray-50'
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>TOS Weight Tracker</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('daily'); playBeepTone(500, 0.1); }}
          className={`px-3 py-2 text-[10px] uppercase font-black tracking-wider rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'daily' ? 'bg-pine text-cream font-bold shadow' : 'text-pine hover:bg-gray-50'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
          <span>Daily Case Study</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('adaptive'); playBeepTone(500, 0.1); }}
          className={`px-3 py-2 text-[10px] uppercase font-black tracking-wider rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'adaptive' ? 'bg-pine text-cream font-bold shadow' : 'text-pine hover:bg-gray-50'
          }`}
        >
          <Brain className="w-3.5 h-3.5" />
          <span>Adaptive Testing</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('peer'); playBeepTone(500, 0.1); }}
          className={`px-3 py-2 text-[10px] uppercase font-black tracking-wider rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'peer' ? 'bg-pine text-cream font-bold shadow' : 'text-pine hover:bg-gray-50'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Group Study</span>
        </button>

        <button
          onClick={() => { setActiveSubTab('referrals'); playBeepTone(500, 0.1); }}
          className={`px-3 py-2 text-[10px] uppercase font-black tracking-wider rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
            activeSubTab === 'referrals' ? 'bg-pine text-cream font-bold shadow' : 'text-pine hover:bg-gray-50'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5 animate-pulse" />
          <span>Referral System</span>
        </button>
      </div>

      {/* VIEWPORT AREA */}
      <div className="bg-white border border-pine/10 rounded-3xl p-6 shadow-sm min-h-[350px] relative">
        
        {/* TAB 1: CUSTOM POMODORO FOCUS TIMER */}
        {activeSubTab === 'pomodoro' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Radial countdown display */}
              <div className="md:col-span-5 flex flex-col items-center justify-center space-y-4">
                <div className="relative w-48 h-48 rounded-full border-8 border-gray-100 flex flex-col items-center justify-center select-none shadow-inner">
                  {/* Subtle timer rings */}
                  <div className="absolute inset-2 border border-dashed border-sage/30 rounded-full animate-spin-slow" />
                  
                  <span className="text-[10px] font-mono font-black uppercase text-sage tracking-widest leading-none">
                    {pomodoroMode === 'study' ? 'STUDY BLOCK' : 'COGNITIVE REFRESH'}
                  </span>
                  
                  <h3 className="text-4xl font-black font-sans tracking-tight text-pine my-1 animate-pulse">
                    {formatTime(pomodoroSeconds)}
                  </h3>

                  <span className="text-[9px] bg-emerald-50 text-emerald-800 font-bold border border-emerald-100 px-2.5 py-0.5 rounded-full uppercase leading-none font-mono">
                    {pomodoroMode === 'study' ? '+25 XP Reward' : 'RECHARGE'}
                  </span>
                </div>

                {/* Primary countdown timer controls */}
                <div className="flex gap-2">
                  {pomodoroIsActive ? (
                    <button
                      onClick={pauseTimer}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-1 shadow-sm cursor-pointer"
                    >
                      <Square className="w-3.5 h-3.5 text-white" />
                      <span>Pause Focus</span>
                    </button>
                  ) : (
                    <button
                      onClick={startTimer}
                      className="px-5 py-2.5 bg-pine hover:bg-pine-mid text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-1 shadow-md cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current text-white" />
                      <span>Start Ticking</span>
                    </button>
                  )}

                  <button
                    onClick={resetTimer}
                    className="px-4 py-2.5 hover:bg-gray-100 text-gray-500 font-bold text-xs uppercase tracking-wider rounded-xl border border-gray-100 transition flex items-center gap-1 cursor-pointer"
                    title="Reset Focus Timer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* Configure durations & specify workspace focus */}
              <div className="md:col-span-7 space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono bg-rose-50 text-rose-800 px-2 py-0.5 border border-rose-200 rounded uppercase font-bold">Clinical Consistency</span>
                  <h3 className="text-md font-heading font-bold text-pine uppercase">Configure Focus Interval</h3>
                  <p className="text-xs text-gray-500">
                    Switch states instantly to sync your brain frequencies with targeted diagnostic review lengths:
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handlePomodoroModeChange('study')}
                    className={`p-3 rounded-xl border text-left transition select-none flex flex-col justify-between ${
                      pomodoroMode === 'study' ? 'border-pine bg-foam/40' : 'border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-pine uppercase font-mono">Study Block</span>
                    <span className="text-md font-extrabold text-gray-800 leading-none mt-1">{pomodoroConfig.study}m</span>
                  </button>

                  <button
                    onClick={() => handlePomodoroModeChange('shortBreak')}
                    className={`p-3 rounded-xl border text-left transition select-none flex flex-col justify-between ${
                      pomodoroMode === 'shortBreak' ? 'border-pine bg-foam/40' : 'border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-pine uppercase font-mono">Short Break</span>
                    <span className="text-md font-extrabold text-gray-800 leading-none mt-1">{pomodoroConfig.shortBreak}m</span>
                  </button>

                  <button
                    onClick={() => handlePomodoroModeChange('longBreak')}
                    className={`p-3 rounded-xl border text-left transition select-none flex flex-col justify-between ${
                      pomodoroMode === 'longBreak' ? 'border-pine bg-foam/40' : 'border-gray-100 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-pine uppercase font-mono">Long Break</span>
                    <span className="text-md font-extrabold text-gray-800 leading-none mt-1">{pomodoroConfig.longBreak}m</span>
                  </button>
                </div>

                {/* Focus Target Description Input */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-sage uppercase font-mono block">Active Study Objective:</label>
                  <input
                    type="text"
                    value={focusTask}
                    onChange={(e) => setFocusTask(e.target.value)}
                    placeholder="E.g., Reviewing Clinical Diagnosis Criteria..."
                    className="w-full bg-foam/10 border border-pine/10 text-xs text-gray-800 outline-none p-3 rounded-xl focus:border-sage tracking-wide font-semibold"
                  />
                </div>

                <div className="p-3 bg-foam/60 border border-pine/5 rounded-xl text-[10px] text-gray-600 font-sans leading-relaxed">
                  💡 **Topnotcher Study Habit Tip:** Studying in 25-minute sprints without distractions avoids brain depletion. On timer expiry, you receive high-priority XP as consistency milestones!
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: ALLOWLISTED APP FOCUS Lock */}
        {activeSubTab === 'blocker' && (
          <div className="space-y-6">
            
            {studyLockOn ? (
              // FULL SCREEN/SANCTUARY DISTRACTION BLOCKER MODE ACTIVE
              <div className="p-8 bg-gradient-to-br from-pine to-green-950 text-cream rounded-3xl border border-green-800 text-center space-y-6 relative overflow-hidden select-none animate-in fade-in zoom-in-95 duration-200">
                <div className="absolute top-2 right-2 flex gap-1">
                  <span className="text-[8px] font-mono leading-none bg-rose-500 text-white px-2 py-1 rounded font-black max-w-fit block">
                    SHIELD ACTIVE
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="w-16 h-16 bg-white/10 text-mint border border-white/10 rounded-2xl flex items-center justify-center mx-auto animate-pulse">
                    <Lock className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold font-heading uppercase tracking-wide">
                    Distraction Blocker Shield Is ON 🛡️
                  </h3>
                  <p className="text-xs text-mint/80 max-w-sm mx-auto leading-relaxed">
                    We are tracking browser activity &amp; focus on this tab. Moving elsewhere to open chat, social media, or game tabs will result in workspace focus breaches!
                  </p>
                </div>

                {/* Breach notification tally */}
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl max-w-xs mx-auto">
                  <h5 className="text-[10px] font-mono font-black text-sage uppercase tracking-wider">Breach Counters</h5>
                  <div className="font-sans font-black text-2xl text-cream mt-1">{focusBreachCount}</div>
                  <p className="text-[9px] text-rose-300 mt-1">
                    {focusBreachCount === 0 
                      ? '⭐ Perfect discipline! Keep your focus here.' 
                      : '⚠️ Warning: Refrain from switching browser focus!'}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] text-white/50 uppercase font-mono">Active Allowlisted Tools Allowed:</p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {selectedAllowlist.map(id => {
                      const app = allowlistedAppsCatalog.find(a => a.id === id);
                      return (
                        <span key={id} className="text-[9px] bg-white/10 text-mint border border-white/5 px-2 py-0.5 rounded font-bold uppercase tracking-wider font-mono">
                          ✓ {app?.name || id}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={triggerDeactivateFocusLock}
                  className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md cursor-pointer mx-auto block active:scale-95"
                >
                  Terminate Study Lock &amp; Grade Session
                </button>
              </div>
            ) : (
              // LOCKED CONFIGURATION LOBBY
              <div className="space-y-5">
                <div className="p-5 bg-gradient-to-r from-pine/10 to-transparent border border-pine/5 rounded-2xl space-y-2 select-none">
                  <h3 className="text-sm font-bold text-pine uppercase flex items-center gap-1.5 leading-none">
                    <ShieldAlert className="w-4 h-4 text-rose-500 animate-bounce" />
                    <span>Distraction Blocker and App Allowlist</span>
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    In order to help you pass the Philippine Boards, secure a distraction-free, sandboxed study vault. Selecting allowlisted tools, we monitor tab change blur parameters to compute consistency and discipline score bonuses.
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-black uppercase text-sage tracking-wider block">
                    Choose Allowlisted Applications required for study session:
                  </span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {allowlistedAppsCatalog.map(app => {
                      const isSelected = selectedAllowlist.includes(app.id);
                      return (
                        <button
                          key={app.id}
                          onClick={() => handleToggleAllowlist(app.id)}
                          className={`p-3 border rounded-xl text-left transition select-none cursor-pointer flex items-start gap-2.5 ${
                            isSelected 
                              ? 'border-pine bg-foam/30' 
                              : 'border-gray-50 hover:bg-gray-50 text-gray-600'
                          }`}
                        >
                          <div className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border transition flex-shrink-0 ${
                            isSelected ? 'bg-pine text-white border-pine' : 'border-gray-300'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 text-cream" />}
                          </div>
                          <div>
                            <h5 className="text-[11px] font-bold text-gray-800 leading-tight uppercase font-sans">
                              {app.name}
                            </h5>
                            <p className="text-[9.5px] text-gray-400 mt-0.5 leading-normal">
                              {app.details}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={triggerActivateFocusLock}
                    disabled={selectedAllowlist.length === 0}
                    className="w-full flex items-center justify-center gap-1.5 py-3 bg-pine hover:bg-pine-mid text-cream font-bold text-xs uppercase tracking-wider rounded-xl transition shadow disabled:opacity-50 cursor-pointer select-none"
                  >
                    <Lock className="w-4 h-4 text-mint" />
                    <span>Engage Full Sandbox Study Lock</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 3: TABLE OF SPECIFICATIONS (TOS) WEIGHT TRACKER */}
        {activeSubTab === 'tos' && (
          <div className="space-y-6 select-none">
            
            <div className="bg-foam/25 border border-pine/5 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-mono bg-pine text-cream px-2 py-0.5 rounded font-black">Official PRC Framework</span>
                <h3 className="text-xs uppercase font-black text-pine tracking-wider mt-1">TOS Competency Metrics</h3>
                <p className="text-xs text-gray-500 max-w-lg leading-relaxed">
                  Table of Specifications (TOS) lists correct board subjects weights under Republic Act 10029 guidelines. Rate your personal mastery level of diagnostic matrices below to observe a weighted study readiness index.
                </p>
              </div>

              {/* Massive weighted gauge indicator */}
              <div className="w-24 h-24 rounded-full bg-white border border-gray-100 flex flex-col items-center justify-center text-center shadow-sm flex-shrink-0">
                <span className="text-[9px] text-sage font-mono uppercase font-black leading-none">Weighted</span>
                <span className="text-2xl font-black font-sans text-pine tracking-tight my-0.5">{Math.round(overallTosScore)}%</span>
                <span className="text-[8px] bg-mint text-pine font-black px-1 rounded uppercase">Readiness</span>
              </div>
            </div>

            {/* Sliders loop representing weights */}
            <div className="space-y-4">
              {PHILIPPINE_TOS.map(item => {
                const oldKey = item.id === 'developmental' ? 'clinical' : item.id;
                const currentVal = tosProgress[item.id] ?? tosProgress[oldKey] ?? 0;
                
                return (
                  <div key={item.id} className="p-3 bg-white hover:bg-gray-50 border border-gray-100 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-pine" />
                        <h4 className="font-bold text-gray-800 font-sans uppercase text-[11px]">{item.name}</h4>
                        <span className="text-[9px] text-sage font-mono font-bold bg-foam px-2 py-0.5 rounded-full">
                          Weight: {item.officialWeight}%
                        </span>
                      </div>
                      <span className="font-mono text-[11px] font-black text-gray-700">{currentVal}% Mastery</span>
                    </div>

                    <p className="text-[10px] text-gray-400 font-sans leading-normal">
                      {item.description}
                    </p>

                    {/* Styled slider track input */}
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={currentVal}
                        onChange={(e) => handleTosChange(item.id, Number(e.target.value))}
                        className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-pine"
                      />
                      <span className="text-[9px] font-mono text-gray-400 font-bold w-6 text-right select-none">
                        {currentVal >= 80 ? '🎯' : currentVal >= 50 ? '⚡' : '🌱'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Recommendation block */}
            <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-3">
              <h5 className="text-[10px] font-mono text-[#065f46] uppercase font-black tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#065f46]" />
                <span>PRC Board Exam Prep Recommendation</span>
              </h5>
              <div className="text-[10px] text-emerald-950 leading-relaxed space-y-1">
                <p>Based on your current rated Table of Specifications matrices, here is your curated roadmap:</p>
                <ul className="list-disc pl-4 space-y-1 mt-1 font-semibold">
                  {overallTosScore < 60 && (
                    <li>💡 Prioritize **Psychological Assessment** (holds a critical 40% weight!) and your lower slider categories.</li>
                  )}
                  {Object.entries(tosProgress).map(([id, val]) => {
                    const valNum = val as number;
                    if (valNum < 50) {
                      const prcTitle = PHILIPPINE_TOS.find(p => p.id === id)?.name || id;
                      return <li key={id}>⚡ Your rated mastery of **{prcTitle}** is low ({valNum}%). Complete the detailed competency checklists below to build familiarity.</li>;
                    }
                    return null;
                  })}
                </ul>
              </div>
            </div>

            {/* --- NEW CHECKLIST OF PRC TOPICS FOR PSYCHOMETRICIAN --- */}
            <div className="border border-pine/10 bg-white rounded-2xl p-4 space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-gray-150 pb-3">
                <div>
                  <h4 className="text-xs uppercase font-black text-pine tracking-wide uppercase flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-pine" />
                    <span>RPm TOS Competency Checklist Blueprint</span>
                  </h4>
                  <p className="text-[10px] text-gray-500 mt-1 leading-normal">
                    Derived from official professional Board Annex Table of Specifications. Expand subjects and track individual compliance tasks.
                  </p>
                </div>

                {/* Search query input */}
                <div className="relative min-w-[200px]">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={tosSearchQuery}
                    onChange={(e) => setTosSearchQuery(e.target.value)}
                    placeholder="Search competencies..."
                    className="w-full pl-8 pr-2.5 py-1.5 border border-gray-200 rounded-xl text-[10.5px] bg-gray-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-pine focus:border-pine font-sans"
                  />
                  {tosSearchQuery && (
                    <button
                      onClick={() => setTosSearchQuery('')}
                      className="absolute right-2 px-1 text-[9px] bg-gray-200 text-gray-600 rounded hover:bg-gray-300 top-1/2 -translate-y-1/2"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Accordion loop */}
              <div className="space-y-3">
                {(() => {
                  const query = tosSearchQuery.toLowerCase().trim();
                  
                  return TOS_CHECKLIST_DATA.map(subject => {
                    // Filter topics
                    let displayedTopics = subject.topics;
                    let matchesSubject = true;
                    
                    if (query) {
                      const topicMatches = subject.topics.map(t => {
                        const matchingSubtopics = t.subtopics.filter(sub => 
                          sub.toLowerCase().includes(query) || t.name.toLowerCase().includes(query)
                        );
                        return { ...t, subtopics: matchingSubtopics };
                      }).filter(t => t.subtopics.length > 0);

                      const nameMatches = subject.title.toLowerCase().includes(query);
                      displayedTopics = nameMatches ? subject.topics : topicMatches;
                      matchesSubject = nameMatches || topicMatches.length > 0;
                    }

                    if (!matchesSubject) return null;

                    // Calculate progress
                    const allSubtopicIds: string[] = [];
                    subject.topics.forEach(t => {
                      t.subtopics.forEach((_, idx) => {
                        allSubtopicIds.push(`${t.id}_${idx}`);
                      });
                    });

                    const checkedCount = allSubtopicIds.filter(id => tosChecked[id]).length;
                    const totalCount = allSubtopicIds.length;
                    const percentComplete = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

                    const isExpanded = expandedTosSubject === subject.subjectId || !!query;

                    return (
                      <div
                        key={subject.subjectId}
                        className="border border-gray-100 rounded-2xl overflow-hidden transition-all duration-200 hover:shadow-sm"
                      >
                        {/* Accordion Header */}
                        <div
                          onClick={() => setExpandedTosSubject(isExpanded ? null : subject.subjectId)}
                          className="p-3 bg-gray-50 hover:bg-cream/20 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer select-none transition"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-pine/10 text-pine rounded flex items-center justify-center font-bold text-[10px]">
                              {subject.weight}%
                            </div>
                            <div>
                              <h4 className="font-bold text-[11px] text-gray-800 uppercase font-sans tracking-wide">
                                {subject.title}
                              </h4>
                              {/* Miniature Progress Bar */}
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="bg-pine h-full transition-all duration-350"
                                    style={{ width: `${percentComplete}%` }}
                                  />
                                </div>
                                <span className="text-[8.5px] font-mono text-sage font-bold leading-none">
                                  {percentComplete}% completed ({checkedCount}/{totalCount})
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end md:self-auto">
                            {/* Sync Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                syncMasteryFromChecklist(subject.subjectId);
                              }}
                              className="px-2.5 py-1 text-[9.5px] font-black font-mono tracking-wider text-pine uppercase bg-white border border-pine/15 rounded-lg shadow-sm hover:bg-pine hover:text-cream leading-tight cursor-pointer transition active:scale-95"
                              title="Update above mastery percentages directly from checkmarks progress"
                            >
                              Sync Rating
                            </button>
                            <ChevronRight
                              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                                isExpanded ? 'rotate-90' : ''
                              }`}
                            />
                          </div>
                        </div>

                        {/* Accordion Body */}
                        {isExpanded && (
                          <div className="p-4 bg-white/40 border-t border-gray-100/50 space-y-4">
                            {displayedTopics.map(topic => (
                              <div key={topic.id} className="space-y-1.5">
                                <h5 className="text-[10px] font-black text-pine tracking-wider uppercase font-mono bg-foam/15 px-2 py-0.5 rounded max-w-fit">
                                  {topic.name}
                                </h5>
                                <div className="grid grid-cols-1 gap-1 pl-1">
                                  {topic.subtopics.map((sub, idx) => {
                                    const itemId = `${topic.id}_${idx}`;
                                    const isChecked = !!tosChecked[itemId];
                                    return (
                                      <label
                                        key={itemId}
                                        className={`flex items-start gap-2.5 p-2 bg-white rounded-xl border transition cursor-pointer select-none text-[10.5px] leading-relaxed ${
                                          isChecked 
                                            ? 'bg-cream/15 text-gray-400 border-gray-100 hover:bg-cream/20' 
                                            : 'text-gray-800 border-gray-50 hover:bg-gray-50 hover:border-gray-200'
                                        }`}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          onChange={() => handleToggleChecked(itemId)}
                                          className="mt-0.5 w-3.5 h-3.5 text-pine rounded border-gray-300 focus:ring-pine accent-pine cursor-pointer"
                                        />
                                        <span className={isChecked ? 'line-through decoration-pine/20 text-gray-400/80' : ''}>
                                          {sub}
                                        </span>
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: INTERACTIVE DAILY BOARD CHALLENGE */}
        {activeSubTab === 'daily' && (
          <div className="space-y-6">
            
            {/* Header vignette indicator */}
            <div className="bg-gradient-to-r from-rose-50 to-amber-50 border border-rose-100 rounded-2xl p-4 flex items-start gap-4 select-none">
              <div className="w-10 h-10 bg-rose-500 text-cream rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm animate-pulse">
                <Sparkles className="w-5 h-5 fill-current text-white" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[9px] bg-rose-100 text-rose-800 border border-rose-200 px-2 py-0.5 rounded font-black font-mono">
                    SPECIAL HIGH-YIELD CASE
                  </span>
                  <span className="text-[9px] bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-bold font-mono">
                    🏆 +150 XP BONUS &amp; SHIELD
                  </span>
                </div>
                <h4 className="text-xs font-bold text-rose-950 uppercase mt-1">Daily Boardroom Challenge</h4>
                 <p className="text-[10px] text-rose-900/75 leading-relaxed">
                  Earn high-difficulty XP multipliers and protective Streak Shields! Complete today's scenario correctly. Refreshes daily.
                </p>
                
                {/* Visual completion tracker from user profile */}
                <div className="pt-2 flex items-center gap-2 border-t border-rose-200/40">
                  <span className="text-[9.5px] font-mono text-rose-950 font-bold">
                    Profile Daily Ledger:
                  </span>
                  <div className="flex gap-1">
                    {Array.from({ length: 7 }).map((_, i) => {
                      const d = new Date();
                      d.setDate(d.getDate() - (6 - i));
                      const dateStr = d.toISOString().split('T')[0];
                      const status = profile.dailyChallenges?.[dateStr];
                      const isToday = dateStr === todayString;
                      
                      return (
                        <div
                          key={dateStr}
                          title={`${dateStr}: ${status || 'Uncompleted'}${isToday ? ' (Today)' : ''}`}
                          className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-black border ${
                            status === 'correct' 
                              ? 'bg-emerald-500 border-emerald-600 text-white'
                              : status === 'incorrect'
                              ? 'bg-rose-500 border-rose-600 text-white'
                              : isToday
                              ? 'bg-amber-100 border-amber-400 text-amber-700 animate-pulse'
                              : 'bg-gray-100 border-gray-200 text-gray-400'
                          }`}
                        >
                          {status === 'correct' ? '✓' : status === 'incorrect' ? '✗' : i + 1}
                        </div>
                      );
                    })}
                  </div>
                  <span className="text-[9px] font-mono text-rose-800 font-semibold italic">
                    ({Object.keys(profile.dailyChallenges || {}).length} completed profile entries)
                  </span>
                </div>
              </div>
            </div>

            {/* Scenario vignette display */}
            <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl space-y-3 font-semibold">
              <span className="text-[9px] uppercase font-mono text-sage tracking-wider block">High Capacity Case Study Scenario ({ACTIVE_DAILY_VIGNETTE.category}):</span>
              <p className="text-xs text-gray-700 leading-relaxed font-sans font-medium italic">
                &quot;{ACTIVE_DAILY_VIGNETTE.vignette}&quot;
              </p>
            </div>

            {/* Interactive answers list */}
            {dailyStatus === 'unattempted' ? (
              <div className="space-y-2">
                {ACTIVE_DAILY_VIGNETTE.options.map((opt, idx) => {
                  const isChecked = selectedDailyAnswer === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => { setSelectedDailyAnswer(idx); playBeepTone(400, 0.08, 'triangle'); }}
                      className={`w-full p-3.5 rounded-xl border text-left text-xs font-semibold transition cursor-pointer flex items-center justify-between ${
                        isChecked 
                          ? 'border-rose-500 bg-rose-50/40 text-rose-950 font-bold' 
                          : 'border-gray-100 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span>{opt}</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isChecked ? 'bg-rose-500 border-rose-500 text-white' : 'border-gray-300'
                      }`}>
                        {isChecked && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}

                <div className="pt-2 select-none">
                  <button
                    onClick={handleSubmitDailyChallenge}
                    disabled={selectedDailyAnswer === null}
                    className="w-full flex items-center justify-center gap-1 py-3 bg-pine hover:bg-pine-mid text-cream text-xs font-bold uppercase tracking-wider rounded-xl transition disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    <span>Log Diagnosis &amp; Claim Board XP</span>
                  </button>
                </div>
              </div>
            ) : (
              // ANSWER GRADING VIEW WITH DISCUSSION & HIGHLIGHTS
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className={`p-4 rounded-2xl border ${
                  dailyStatus === 'correct' 
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-950' 
                    : 'bg-red-50 border-red-100 text-red-950'
                }`}>
                  <div className="flex items-start gap-2">
                    {dailyStatus === 'correct' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4 className="text-xs font-black uppercase font-sans tracking-wide">
                        {dailyStatus === 'correct' ? '🎉 DIAGNOSIS LOGGED CORRECTLY!' : '⚠️ COMPREHENDING CLINICAL ANALYSIS'}
                      </h4>
                      <p className="text-[10px] mt-1 leading-normal">
                        {dailyStatus === 'correct' 
                          ? 'Awesome diagnostic instincts reviewee! You earned 150 Board XP + 1 Streak Shield protection directly in your persistent profile.' 
                          : 'The selected formulation has differential caveats. Re-evaluate the diagnostic specifications below.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-foam/40 border border-pine/5 rounded-2xl space-y-2">
                  <span className="text-[9px] uppercase font-mono text-pine tracking-wider font-extrabold block">Official Psychometrician Board Discussion:</span>
                  <p className="text-xs text-gray-700 leading-relaxed font-sans font-medium">
                    {ACTIVE_DAILY_VIGNETTE.explanation}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center pt-2">
                  <button
                    onClick={handleClearDailyChallenge}
                    className="py-2 px-3 border border-gray-100 hover:bg-gray-50 text-[10px] font-black uppercase tracking-wider rounded-xl transition cursor-pointer select-none"
                  >
                    🔄 Clear &amp; Retry Trial
                  </button>
                  <button
                    onClick={() => { onNavigate('quizTab'); playBeepTone(440, 0.1); }}
                    className="py-2 px-3 bg-pine hover:bg-pine-mid text-cream text-[10px] font-black uppercase tracking-wider rounded-xl transition cursor-pointer select-none"
                  >
                    🎯 Go to Practice Arena
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 5: ADAPTIVE TESTING DIAGNOSTICS */}
        {activeSubTab === 'adaptive' && (
          <div className="space-y-6 select-none">
            
            <div className="flex flex-col md:flex-row items-center justify-between p-4 bg-foam border border-pine/10 rounded-2xl gap-4">
              <div className="space-y-1">
                <span className="text-[9px] font-mono uppercase bg-pine text-cream px-2.5 py-0.5 rounded font-black">AI Cognitive Engine</span>
                <h3 className="text-xs font-bold text-pine uppercase tracking-wide mt-1">Adaptive Testing Status</h3>
                
                <p className="text-xs text-[11px] text-gray-500 leading-normal max-w-md">
                  When enabled, questions programmatically scale in difficulty based on your lifetime practice accuracy. This mimics the actual modern board-grading model.
                </p>
              </div>

              {/* Toggle switch */}
              <button
                onClick={handleToggleAdaptiveSetting}
                className={`py-2 px-4 rounded-xl text-[10px] uppercase tracking-wider font-black transition flex items-center gap-1.5 cursor-pointer leading-none border ${
                  profile.adaptive 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-400' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600 border-gray-300'
                }`}
              >
                <span>{profile.adaptive ? '✓ Adaptive Active' : 'Adaptive Disabled'}</span>
              </button>
            </div>

            {/* Performance Diagnostic Assessment Details */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              <div className="md:col-span-4 bg-gray-50 border border-gray-100 p-4 rounded-2xl flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <span className="text-[8px] font-mono text-sage uppercase font-black block">Active Accuracy Weight</span>
                  <div className="text-2xl font-black font-mono text-gray-800">
                    {Math.round(currentAccuracy * 100)}% Correct
                  </div>
                  <p className="text-[10.4px] text-gray-400 leading-tight">
                    Computed based on {profile.correct} correct of {profile.attempts} lifetime vignette attempts.
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[8px] font-mono text-sage uppercase font-black block">Suggested Board Score</span>
                  <div className="text-md font-bold text-pine font-sans uppercase">
                    {currentAccuracy >= 0.70 ? '⭐⭐ Pass (Topnotcher)' : currentAccuracy >= 0.50 ? '⭐ Pass (Passing Grade)' : '🌱 Conditioning Required'}
                  </div>
                </div>
              </div>

              <div className="md:col-span-8 p-4 border border-gray-100 rounded-2xl flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs text-rose-950 font-bold uppercase font-mono">
                    <TrendingUp className="w-4 h-4 text-rose-500" />
                    <span>Your Current Score Level Index</span>
                  </div>

                  {/* Level visualization */}
                  <div className="p-3.5 bg-gray-50 border border-gray-100 rounded-xl flex items-center gap-3">
                    <span className="text-2xl">{currentDifficultyObj.icon}</span>
                    <div>
                      <h4 className="text-[11px] font-bold text-gray-800 uppercase font-sans">
                        {currentDifficultyObj.name}
                      </h4>
                      <p className="text-[10px] text-gray-500 font-sans mt-0.5 leading-normal">
                        {currentDifficultyObj.desc}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-foam text-[10px] text-pine-mid font-medium leading-relaxed rounded-xl">
                  🛠️ **Dynamic Adjustment Algorithm:** Getting consecutive questions correct will automatically boost the vignette complexity, offering you higher board XP payouts per answer!
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 6: GROUP STUDY */}
        {activeSubTab === 'peer' && (
          <div className="space-y-6">
            <div className="space-y-5">
              <div className="p-5 bg-gradient-to-r from-pine/10 to-transparent border border-pine/5 rounded-2xl space-y-2 select-none">
                <h3 className="text-sm font-bold text-pine uppercase flex items-center gap-1.5 leading-none font-sans">
                  <UserPlus className="w-4 h-4 text-emerald-600 animate-pulse" />
                  <span>Live Group Study Room</span>
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Create a study space, share the link, and see classmates join in real time via Firestore sync.
                </p>
                {groupRoomId && (
                  <span className={`inline-block text-[9px] font-mono font-bold px-2 py-0.5 rounded ${groupRoomLive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                    {groupRoomLive ? '● Live sync active' : '○ Local / offline sync'}
                  </span>
                )}
              </div>

              <form onSubmit={handleCreateGroupRoom} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-sage uppercase font-mono block">Study Space Name</label>
                  <input
                    type="text"
                    value={groupRoomName}
                    onChange={(e) => setGroupRoomName(e.target.value)}
                    placeholder="E.g., Psych Boards Study Group A"
                    className="w-full bg-foam/10 border border-pine/10 text-xs text-gray-800 outline-none p-3 rounded-xl focus:border-sage font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-1 py-3 bg-pine hover:bg-pine-mid text-cream text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-md cursor-pointer select-none"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create Study Space &amp; Generate Link</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setGroupRoomName('');
                      setGroupRoomLink(null);
                      setGroupRoomId(null);
                      setGroupParticipants([]);
                      window.location.hash = '';
                      if (groupRoomUnsubRef.current) groupRoomUnsubRef.current();
                      playBeepTone(300, 0.08);
                    }}
                    className="w-full py-3 border border-gray-100 hover:bg-gray-50 text-[10px] font-black uppercase tracking-wider rounded-xl transition cursor-pointer select-none"
                  >
                    Leave room
                  </button>
                </div>
              </form>

              {groupRoomLink && (
                <div className="p-3 bg-foam/40 border border-pine/5 rounded-xl space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h5 className="text-[10px] font-bold text-gray-800">Shareable Link</h5>
                      <p className="text-[9px] text-gray-600 mt-1 break-all">{groupRoomLink}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={handleCopyGroupLink} className="px-3 py-2 bg-foam/20 border border-pine/10 rounded-lg text-[10px] font-bold">Copy</button>
                      <button
                        onClick={() => { navigator.share ? navigator.share({ title: groupRoomName, url: groupRoomLink }) : handleCopyGroupLink(); }}
                        className="px-3 py-2 bg-white border border-gray-100 rounded-lg text-[10px] font-bold"
                      >
                        Share
                      </button>
                    </div>
                  </div>
                  <div>
                    <h5 className="text-[10px] font-bold text-gray-800 mb-1">Participants ({groupParticipants.length})</h5>
                    <ul className="space-y-1 max-h-32 overflow-y-auto">
                      {groupParticipants.map((p) => (
                        <li key={p} className={`text-[10px] font-mono px-2 py-1 rounded ${p === profile.email ? 'bg-pine/10 text-pine font-bold' : 'text-gray-600'}`}>
                          {p === profile.email ? `${p} (you)` : p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 7: CLASSMATE STUDY REFERRAL SYSTEM */}
        {activeSubTab === 'referrals' && (
          <div className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Promo graphics and credentials info */}
              <div className="md:col-span-7 space-y-4 select-none">
                <div className="space-y-1">
                  <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-black font-mono">
                    UNLEASH XP BONUSES
                  </span>
                  <h3 className="text-md font-heading font-black text-pine uppercase tracking-tight">
                    Invite Your Classmates &amp; Classmates Prep Groups
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Passing the Philippine board exams is better with friends. Invite clinical and IO psychology reviewers to BoardPassPH. For every candidate who accesses using your code, you claim massive rewards!
                  </p>
                </div>

                {/* Display unique code */}
                <div className="p-4 bg-[#fbf9f4] border border-amber-250 rounded-2xl space-y-2">
                  <span className="text-[8px] font-mono font-black text-amber-800 uppercase block tracking-wider">
                    Your Unique Licensure Referral Code:
                  </span>
                  <div className="flex items-center justify-between bg-white border border-amber-200 p-2.5 rounded-xl">
                    <span className="font-mono font-black text-sm text-amber-900 tracking-widest uppercase">
                      {referralCodeString}
                    </span>
                    
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(referralCodeString);
                        playBeepTone(440, 0.1);
                        showToast("📋 Referral Code copied to clipboard!");
                      }}
                      className="p-1.5 hover:bg-amber-50 rounded-lg text-amber-800 transition flex items-center gap-1 cursor-pointer"
                      title="Copy Code"
                    >
                      <Copy className="w-4 h-4" />
                      <span className="text-[10px] uppercase font-bold font-mono">Copy Code</span>
                    </button>
                  </div>
                </div>

                {/* Invitation Submission forms */}
                <form onSubmit={handleInvitePeer} className="space-y-2">
                  <label className="text-[10px] font-bold text-sage uppercase font-mono block">Classmate Email address:</label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      required
                      value={referralEmailInput}
                      onChange={(e) => setReferralEmailInput(e.target.value)}
                      placeholder="E.g., reviewer_friend@gmail.com"
                      className="flex-1 bg-white border border-pine/15 text-xs text-zinc-800 placeholder-sage outline-none px-3.5 py-2.5 rounded-xl focus:border-sage font-semibold"
                    />
                    <button
                      type="submit"
                      className="px-5 bg-pine hover:bg-pine-mid text-cream text-xs font-black uppercase tracking-wider rounded-xl transition flex items-center gap-1 cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5 text-mint" />
                      <span>Send Code</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Milestone achievements panel */}
              <div className="md:col-span-5 border border-gray-100 p-4 rounded-3xl space-y-3.5 select-none bg-foam/15">
                <h4 className="text-[10px] font-mono font-black text-pine uppercase tracking-wider border-b border-gray-100 pb-2">
                  🎁 Referral Milestones
                </h4>

                <div className="space-y-2.5">
                  {[
                    { count: 1, label: 'Claim 1 Shield + 200 XP', claimed: invitedPeers.length >= 1 },
                    { count: 3, label: 'Claim 2 Shields + 500 XP', claimed: invitedPeers.length >= 3 },
                    { count: 5, label: 'Unlock Board Champ Badge', claimed: invitedPeers.length >= 5 }
                  ].map((mile, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 bg-white border border-gray-50 rounded-xl">
                      <div>
                        <span className="text-[10px] font-black text-gray-800 font-sans block leading-tight">
                          {mile.count} Classmate {mile.count === 1 ? 'Referral' : 'Referrals'}
                        </span>
                        <span className="text-[9px] font-sans text-gray-500 mt-1 block">
                          {mile.label}
                        </span>
                      </div>

                      {mile.claimed ? (
                        <span className="text-[8px] bg-teal-50 text-teal-700 px-2 py-1 rounded font-bold border border-teal-100 uppercase tracking-wide flex items-center gap-0.5 leading-none">
                          <Check className="w-3 h-3 text-teal-600" />
                          <span>Unlocked</span>
                        </span>
                      ) : (
                        <span className="text-[8px] bg-gray-100 text-gray-400 px-2 py-1 rounded font-bold uppercase tracking-wide leading-none">
                          {invitedPeers.length} / {mile.count}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="text-[9px] text-gray-400 leading-normal font-sans italic text-center">
                  ⚠️ Simulated invitations are evaluated instantly upon student review codes distribution. Earn multi-disciplinary rewards!
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
};
