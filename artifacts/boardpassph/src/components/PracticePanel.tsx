import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, Play, Award, CheckCircle2, AlertTriangle, BookOpen, Clock, 
  Heart, Edit3, ArrowRight, Upload, X, FileText, Trash2, CheckSquare
} from 'lucide-react';
import { Question, UserProfile } from '../types';
import {
  getDailyQuestionLimit,
  getQuestionsUsedToday,
  getSubjectKey,
  isLimitedTier,
  recordQuestionVignette,
  updateSubjectAccuracy,
} from '../utils/profileHelpers';

interface PracticePanelProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  currentQuestion: Question | null;
  onFetchQuestion: (
    focusArea: string, 
    source: 'dsm5' | 'pharma' | 'assessment' | 'dev' | 'io' | 'local_test',
    difficulty: 'easy' | 'medium' | 'hard' | 'random',
    fileData?: string,
    fileMimeType?: string
  ) => void;
  loading: boolean;
  selectedModel: 'budget' | 'standard' | 'premium';
  onModelChange: (model: 'budget' | 'standard' | 'premium') => void;
}

interface UploadedFileObj {
  id: string;
  name: string;
  size: number;
  type: string;
  base64: string;
}

export const PracticePanel: React.FC<PracticePanelProps> = ({
  profile,
  setProfile,
  currentQuestion,
  onFetchQuestion,
  loading,
  selectedModel,
  onModelChange
}) => {
  const [focusSelect, setFocusSelect] = useState('any random DSM-5 disorder chapter');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'random'>('random');
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [answeredState, setAnsweredState] = useState<'pending' | 'submitted'>('pending');
  const [timedToggle, setTimedToggle] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(90);
  const [noteText, setNoteText] = useState('');
  
  // States for post-actions
  const [mnemonicText, setMnemonicText] = useState('');
  const [loadingMnemonic, setLoadingMnemonic] = useState(false);
  const [isDiffDuelOpen, setIsDiffDuelOpen] = useState(false);

  // States for file upload integration
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileObj[]>(() => {
    try {
      const saved = localStorage.getItem('bp_uploaded_files');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [selectedFileId, setSelectedFileId] = useState<string | null>(() => {
    try {
      const savedFiles = localStorage.getItem('bp_uploaded_files');
      if (savedFiles) {
        const parsed = JSON.parse(savedFiles) as UploadedFileObj[];
        if (parsed.length > 0) return parsed[0].id;
      }
    } catch {}
    return null;
  });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Get source based on focus selection
  const getSourceFromFocus = (): 'dsm5' | 'pharma' | 'assessment' | 'dev' | 'io' | 'local_test' => {
    if (focusSelect.includes('Psychopharmacology')) return 'pharma';
    if (focusSelect.includes('Assessment') || focusSelect.includes('Tests')) return 'assessment';
    if (focusSelect.includes('Industrial')) return 'io';
    if (focusSelect.includes('Developmental')) return 'dev';
    return 'dsm5';
  };

  // Triggers fetching a question
  const handleFetchNext = () => {
    if (atDailyLimit) {
      alert(`Daily AI question limit reached (${dailyLimit}/day on ${profile.tier}). Upgrade in Billing for unlimited practice.`);
      return;
    }
    setSelectedIdx(null);
    setAnsweredState('pending');
    setMnemonicText('');
    setIsDiffDuelOpen(false);
    
    // Pass active study document if attached
    const activeFile = uploadedFiles.find(f => f.id === selectedFileId);
    
    onFetchQuestion(
      focusSelect, 
      getSourceFromFocus(), 
      difficulty,
      activeFile?.base64,
      activeFile?.type
    );
  };

  const handleFiles = (files: FileList) => {
    const file = files[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      alert("⚠️ File size exceeds the maximum limit of 1.5MB. Please upload a smaller study resource.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = reader.result as string;
      const commaIdx = resultStr.indexOf(',');
      const base64Data = commaIdx !== -1 ? resultStr.substring(commaIdx + 1) : resultStr;
      
      const newFileObj: UploadedFileObj = {
        id: Date.now().toString(),
        name: file.name,
        size: file.size,
        type: file.type,
        base64: base64Data
      };

      setUploadedFiles(prev => {
        const next = [newFileObj, ...prev];
        localStorage.setItem('bp_uploaded_files', JSON.stringify(next));
        return next;
      });
      setSelectedFileId(newFileObj.id);
    };

    reader.onerror = () => {
      alert("❌ Critical failure reading the study reference file. Please try again.");
    };

    reader.readAsDataURL(file);
  };

  const deleteFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedFiles(prev => {
      const next = prev.filter(f => f.id !== id);
      localStorage.setItem('bp_uploaded_files', JSON.stringify(next));
      return next;
    });
    if (selectedFileId === id) {
      setSelectedFileId(null);
    }
  };

  // Handles starting / resets countdowns
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!timedToggle || answeredState === 'submitted' || !currentQuestion) {
      setSecondsLeft(90);
      return;
    }

    setSecondsLeft(90);
    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          alert("⏱️ Sprint limit reached! Your answer is entering auto-evaluation.");
          setAnsweredState('submitted');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timedToggle, answeredState, currentQuestion]);

  // Load / Sync Notes
  useEffect(() => {
    if (currentQuestion) {
      const key = btoa(currentQuestion.vignette.substring(0, 15));
      setNoteText(profile.notes[key] || '');
    }
  }, [currentQuestion, profile.notes]);

  const saveNote = (val: string) => {
    setNoteText(val);
    if (currentQuestion) {
      const key = btoa(currentQuestion.vignette.substring(0, 15));
      setProfile(prev => {
        const updatedNotes = { ...prev.notes, [key]: val };
        // Sync local storage
        localStorage.setItem(`bp_notes_${prev.email}`, JSON.stringify(updatedNotes));
        return { ...prev, notes: updatedNotes };
      });
    }
  };

  // Evaluate clinical options
  const handleEval = () => {
    if (selectedIdx === null || !currentQuestion) return;

    setAnsweredState('submitted');
    
    const isCorrect = selectedIdx === currentQuestion.correctIndex;
    const ptsAwarded = isCorrect ? (50 + profile.currentCombo * 5) : 10;

    setProfile(prev => {
      const newAttempts = prev.attempts + 1;
      const newCorrect = prev.correct + (isCorrect ? 1 : 0);
      const newCombo = isCorrect ? prev.currentCombo + 1 : 0;
      const isRecordDeck = !isCorrect;

      // Add to Spaced Rep if incorrect
      const updatedDeck = isRecordDeck 
        ? [...prev.deck, currentQuestion]
        : prev.deck;

      // Update heatmap count
      const todayString = new Date().toISOString().split('T')[0];
      const todayHeat = (prev.heat[todayString] || 0) + 1;

      const profilePayload = {
        ...prev,
        attempts: newAttempts,
        correct: newCorrect,
        currentCombo: newCombo,
        totalXp: prev.totalXp + ptsAwarded,
        deck: updatedDeck,
        heat: { ...prev.heat, [todayString]: todayHeat }
      };

      if (prev.rememberQuestionHistory !== false && currentQuestion?.vignette) {
        profilePayload.questionHistory = recordQuestionVignette(
          prev.questionHistory,
          currentQuestion.vignette
        );
      }

      if (currentQuestion) {
        const subject = getSubjectKey(currentQuestion);
        profilePayload.subjectAccuracy = updateSubjectAccuracy(
          prev.subjectAccuracy,
          subject,
          isCorrect
        );
      }

      // Backup local storage too
      localStorage.setItem(`bp_profile_${prev.email}`, JSON.stringify(profilePayload));
      return profilePayload;
    });
  };

  // Request Mnemonic on Demand
  const handleGetMnemonic = async () => {
    if (!currentQuestion) return;
    setLoadingMnemonic(true);
    setMnemonicText('');
    try {
      const res = await fetch("/api/generate-mnemonic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vignette: currentQuestion.vignette,
          explanation: currentQuestion.explanation
        })
      });
      const data = await res.json();
      
      if (data.mnemonic && !data.isFallback) {
        setMnemonicText(data.mnemonic);
      } else {
        // Fallback or returned generic mock - trigger smart local fallback
        throw new Error("Triggering custom local fallback");
      }
    } catch {
      // Intelligently generate high-yield clinical mnemonic fallback custom to this disease!
      const txt = (currentQuestion.vignette + " " + currentQuestion.category).toLowerCase();
      let customMnemonic = "";

      if (txt.includes("depress") || txt.includes("mdd") || txt.includes("dysthymia")) {
        customMnemonic = `💡 **HIGH YIELD DEPRESSION MNEMONIC: S-I-G-E-C-A-P-S**\n\nUse this standard scale to recall the 9 hallmark criteria for a Major Depressive Episode:\n*   **S**leep disruption (insomnia or hypersomnia)\n*   **I**nterest diminished (anhedonia - core symptom)\n*   **G**uilt or worthlessness feelings\n*   **E**nergy deficit (fatigue)\n*   **C**oncentration impairments or indecisiveness\n*   **A**ppetite or weight fluctuation\n*   **P**sychomotor agitation or retardation\n*   **S**uicidal ideation or recurrent thoughts of death\n\n*Note: Diagnosis requires 5+ symptoms, with at least 1 being depressed mood or anhedonia, present for at least 2 weeks.*`;
      } else if (txt.includes("bipolar") || txt.includes("mania") || txt.includes("manic")) {
        customMnemonic = `💡 **HIGH YIELD MANIA MNEMONIC: D-I-G F-A-S-T**\n\nUse this to recall the DSM-5 criteria for a manic episode:\n*   **D**istractibility (easily drawn to irrelevant external stimuli)\n*   **I**ndiscretion (excessive involvement in high-risk, pleasurable activities)\n*   **G**randiosity or inflated self-esteem\n*   **F**light of ideas or subjective feeling of racing thoughts\n*   **A**ctivity increase (socially, occupationally, or sexually) or psychomotor agitation\n*   **S**leep requirement decreased (feels rested after only 3 hours)\n*   **T**alkativeness (pressured speech)\n\n*Note: Manic episode requires elevated, expansive, or irritable mood lasting 1+ week.*`;
      } else if (txt.includes("schizo") || txt.includes("psychotic") || txt.includes("psychosis") || txt.includes("delusion")) {
        customMnemonic = `💡 **HIGH YIELD SCHIZOPHRENIA SYMPTOMS: T-H-E-S-E L-I-E-S**\n\nRecall the key diagnostic features:\n*   **T**hought delusions (hallmark false beliefs)\n*   **H**allucinations (primarily auditory)\n*   **E**rratic or disorganized speech (frequent derailment/looseness)\n*   **S**everely disorganized or catatonic behavior\n*   **E**xtreme negative symptoms (flat affect, avolition, alogia)\n\n*Note: Active-phase symptoms must persist for at least 1 month, with total continuous signs of disturbance for at least 6 months.*`;
      } else if (txt.includes("panic") || txt.includes("anxiety") || txt.includes("gad") || txt.includes("phobia")) {
        customMnemonic = `💡 **HIGH YIELD PANIC ATTACK SYMPTOMS: C-H-E-S-T-P-A-I-N-S**\n\nRecall somatic and cognitive symptoms during panic surges:\n*   **C**hest discomfort or pain\n*   **H**yperventilating / **H**eart racing (palpitations)\n*   **E**xtreme sweating\n*   **S**haking or trembling\n*   **T**remors & **T**ingling (paresthesias)\n*   **P**ear of dying or losing control\n*   **A**bdominal distress or nausea\n*   **I**nstability (dizzy, lightheaded, faint)\n*   **N**umbness or chills\n*   **S**uffocation or choking sensation`;
      } else if (txt.includes("ocd") || txt.includes("obsessive") || txt.includes("compulsive")) {
        customMnemonic = `💡 **HIGH YIELD OCD MNEMONIC: O-B-S-E-S-S-I-V-E**\n\nKey components of Obsessive-Compulsive Disorder:\n*   **O**bjects of doubt (persistent intrusions)\n*   **B**ehaviors repeated as rituals (compulsions)\n*   **S**ignificant distress or functional impairment (>1 hour/day)\n*   **E**xcluding other organic disorders or substance triggers\n*   **S**ense of urgency to neutralize anxiety\n*   **S**timuli trigger repetitive avoidance patterns\n*   **I**nsight level tracking (good, poor, or absent/delusional)\n*   **V**olume of clinical thoughts leading to high exhaustion`;
      } else if (txt.includes("borderline") || txt.includes("bpd") || txt.includes("personality")) {
        customMnemonic = `💡 **HIGH YIELD BORDERLINE PERSONALITY: I DESPAIR**\n\nRecall the 9 symptoms of BPD:\n*   **I**dentity disturbance (unstable self-image)\n*   **D**isordered mood (affective instability)\n*   **E**mpty feelings (chronic emptiness)\n*   **S**uicidal behavior or self-mutilating threats\n*   **P**aranoia/dissociation under stress\n*   **A**bondonment avoidance (frantic efforts)\n*   **I**mpulsivity in high-risk areas (spending, sex, etc.)\n*   **R**uns of anger (uncontrolled, intense wrath)`;
      } else {
        customMnemonic = `💡 **COMPREHENSIVE DSM BOARD RECALL MNEMONIC: C-L-I-N-I-C-A-L**\n\nUse this systematic approach for any ambiguous board exam question:\n*   **C**ount criteria: Verify how many symptoms are explicitly described in the vignette.\n*   **L**asting duration: Ensure symptoms meet duration milestones (e.g., 2 weeks for MDD, 6 months for GAD).\n*   **I**mpairment check: Confirm clinically significant distress or functional occupational decline.\n*   **N**atural substances rule-out: Exclude side effects of medications, medical conditions (e.g., hyperthyroidism).\n*   **I**nsight and Specifiers: Check modifier levels (e.g., with atypical features, mild/moderate/severe).\n*   **C**o-morbidity verification: Exclude better explanations (differential rule-outs).\n*   **H**igh-Yield mnemonic review: Study clinical acronyms on demand.\n*   **L**ocal PRC laws: Recall Republic Act 10029 (Psychology Law) ethical standards.`;
      }

      setMnemonicText(customMnemonic);
    } finally {
      setLoadingMnemonic(false);
    }
  };

  const dailyLimit = getDailyQuestionLimit(profile.tier);
  const questionsUsedToday = getQuestionsUsedToday(profile);
  const atDailyLimit = dailyLimit !== null && questionsUsedToday >= dailyLimit;
  const isLimitedPlan = isLimitedTier(profile.tier);

  return (
    <div className="space-y-6">
      {isLimitedPlan && dailyLimit !== null && (
        <div className={`rounded-2xl border px-4 py-3 text-xs font-semibold ${atDailyLimit ? 'border-rose-200 bg-rose-50 text-rose-800' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
          {profile.tier} plan: {questionsUsedToday} / {dailyLimit} AI questions used today
          {atDailyLimit ? ' — limit reached. Visit Billing to upgrade.' : ''}
        </div>
      )}
      {/* Configuration Tray */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
        <h4 className="font-heading font-black text-pine text-xs uppercase tracking-widest flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-sage" />
          Practice parameters
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Focus Subject Area</label>
            <select
              value={focusSelect}
              onChange={(e) => setFocusSelect(e.target.value)}
              className="w-full bg-white border border-gray-200 text-xs font-semibold py-2.5 px-3 rounded-xl outline-none focus:border-sage transition-all"
            >
              <optgroup label="Core Clinical Subjects">
                <option value="any random DSM-5 disorder chapter">Comprehensive Clinical — All Chapters</option>
                <option value="Neurodevelopmental Disorders chapter">Neurodevelopmental Disorders</option>
                <option value="Schizophrenia Spectrum & Psychotic Disorders chapter">Schizophrenia Spectrum</option>
                <option value="Bipolar and Related Disorders chapter">Bipolar Spectrum</option>
                <option value="Depressive Disorders chapter">Depressive Disorders</option>
                <option value="Anxiety Disorders chapter">Anxiety Disorders</option>
                <option value="Trauma and Stressor-Related Disorders chapter">Trauma & Stressor</option>
                <option value="Personality Disorders chapter">Personality Disorders</option>
              </optgroup>
              <optgroup label="💊 Pharmacology Add-On pack">
                <option value="Psychopharmacology first-line drug treatments for Major Depression and Anxiety">Pharmacology: Mood & Anxiety</option>
                <option value="Psychopharmacology mood stabilizers for Bipolar and antipsychotics for Schizophrenia">Pharmacology: Bipolar & Psychosis</option>
                <option value="Psychopharmacology stimulant first-line treatments for Pediatric ADHD">Pharmacology: Pediatric & ADHD</option>
              </optgroup>
              <optgroup label="PRC Board Competencies">
                <option value="Industrial-Organizational Psychology (work motivation, job analysis, HR metrics)">I/O Psychology</option>
                <option value="Developmental Psychology (Jean Piaget, Erik Erikson, cognitive milestones)">Developmental Psychology</option>
                <option value="Psychological Assessment (Reliability, Validity, PATS, MEPS, and RA 10029 codes)">Psychological Assessment</option>
              </optgroup>
            </select>
          </div>

          <div className="space-y-1 md:border-l border-gray-100 md:pl-4">
            <label className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Difficulty Level</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as any)}
              className="w-full bg-white border border-gray-200 text-xs font-semibold py-2.5 px-3 rounded-xl outline-none focus:border-sage transition-all"
            >
              <option value="easy">🟢 Easy — Diagnostic Criteria Baseline</option>
              <option value="medium">🟡 Medium — DSM-5 Specifiers Focus</option>
              <option value="hard">🔴 Hard — Complex Differentials & No Diagnosis</option>
              <option value="random">⚡ Random — Varying Dynamic Range</option>
            </select>
          </div>

          <div className="flex items-center justify-between border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-5">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">90s Timed Sprint</span>
              <p className="text-[10px] text-gray-400">Forces automatic submission upon timeout</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={timedToggle}
                onChange={(e) => setTimedToggle(e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pine"></div>
            </label>
          </div>
        </div>

        {/* Model Tier Selection */}
        <div className="border-t border-gray-100 pt-4">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">AI Model Tier</label>
            <select
              value={selectedModel}
              onChange={(e) => onModelChange(e.target.value as 'budget' | 'standard' | 'premium')}
              className="w-full bg-white border border-gray-200 text-xs font-semibold py-2.5 px-3 rounded-xl outline-none focus:border-sage transition-all"
            >
              <option value="budget">🟢 Llama 3.2 Budget — fast, lightweight inference</option>
              <option value="standard">🟡 Claude Haiku 4.5 — balanced accuracy</option>
              <option value="premium">🔴 Gemini 2.0 Flash — premium clinical reasoning</option>
            </select>
          </div>
        </div>

        {/* Study File Upload Integration Row */}
        <div className="border-t border-gray-100 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
              📂 Ingest Custom Study Resource (PDF, TXT, Images)
            </span>
            <span className="text-[9px] text-[#2e5e41] font-mono font-bold bg-[#deebe3] px-2 py-0.5 rounded-full">
              Dynamic AI Reference
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
            <div className="lg:col-span-5">
              <input
                ref={fileInputRef}
                type="file"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
                accept=".txt,.pdf,image/*"
                className="hidden"
                id="boardpass-study-uploader"
              />
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    handleFiles(e.dataTransfer.files);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`border rounded-xl p-4 text-center cursor-pointer flex flex-col items-center justify-center min-h-[90px] transition-all duration-150 ${
                  isDragging 
                    ? 'border-solid border-pine bg-foam/85 ring-2 ring-pine/10 shadow-sm' 
                    : 'border-dashed border-gray-200 hover:border-sage hover:bg-foam/25 shadow-sm'
                }`}
              >
                <Upload className="w-5 h-5 text-sage mb-1 animate-bounce" />
                <span className="text-[11px] font-bold text-pine font-sans">Drag & drop or Click to browse</span>
                <span className="text-[8px] text-gray-400 font-mono mt-0.5">Supports PDF, TXT, PNG, JPG (Max 1.5MB)</span>
              </div>
            </div>

            <div className="lg:col-span-7 flex flex-col justify-between">
              {uploadedFiles.length === 0 ? (
                <div className="bg-foam/25 border border-dashed border-gray-100 rounded-xl p-3 flex flex-col items-center justify-center h-full min-h-[90px] text-center">
                  <span className="text-[10px] text-gray-400 font-sans italic">
                    No custom study resource attached.
                  </span>
                  <p className="text-[8px] text-gray-400 font-sans max-w-xs mt-1">
                    Upload your raw notes or diagnostic criteria to generate custom case questions.
                  </p>
                </div>
              ) : (
                <div className="border border-gray-100 bg-white rounded-xl p-2.5 max-h-[140px] overflow-y-auto space-y-2 shadow-inner w-full">
                  {uploadedFiles.map((file) => {
                    const isSelected = selectedFileId === file.id;
                    return (
                      <div 
                        key={file.id}
                        onClick={() => setSelectedFileId(file.id)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer border transition-all ${
                          isSelected 
                            ? 'bg-foam/45 border-pine/30 shadow-sm' 
                            : 'bg-white hover:bg-gray-50/50 border-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 max-w-[80%]">
                          <input 
                            type="radio" 
                            name="activeStudyFile"
                            checked={isSelected}
                            onChange={() => setSelectedFileId(file.id)}
                            className="text-pine border-gray-300 focus:ring-pine cursor-pointer w-3 h-3"
                          />
                          <FileText className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? 'text-pine' : 'text-sage'}`} />
                          <div className="truncate">
                            <p className="text-[10px] font-bold text-gray-700 truncate leading-tight select-none">
                              {file.name}
                            </p>
                            <p className="text-[8px] text-gray-400 font-mono leading-none">
                              {Math.round(file.size / 1024)} KB • {file.type.split('/')[1] || 'study text'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={(e) => deleteFile(file.id, e)}
                          title="Remove Resource"
                          className="p-1 rounded text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Difficulty Helper alert bubble */}
        <div className="bg-foam/35 border border-sage/10 rounded-xl p-3 text-[10px] text-pine leading-normal font-mono">
          {difficulty === 'easy' && (
            <span>🟢 <strong>Easy mode</strong> selects or generates direct clinical criteria baseline questions, omitting dense specifier subcomponents or trick exclusions.</span>
          )}
          {difficulty === 'medium' && (
            <span>🟡 <strong>Medium mode</strong> shifts focus to DSM-5 modifiers and features (e.g. <i>with mixed features</i>, <i>with melancholic features</i>, <i>rapid cycling</i>).</span>
          )}
          {difficulty === 'hard' && (
            <span>🔴 <strong>Hard mode</strong> incorporates tough differential rule-outs or realistic scenarios where no clinical disorder diagnosis threshold is met, requiring selection of the "No diagnosis" option.</span>
          )}
          {difficulty === 'random' && (
            <span>⚡ <strong>Random mode</strong> dynamically oscillates review difficulty levels to provide realistic training for the authentic PRC exam environment.</span>
          )}
        </div>

        {/* Initial Study Launch Button */}
        {!currentQuestion && !loading && (
          <button
            onClick={handleFetchNext}
            className="w-full py-3 bg-pine hover:bg-pine-mid text-white font-bold rounded-xl shadow-md border-b-2 border-pine-mid shadow-pine/10 hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 select-none text-center transition-all block text-xs uppercase tracking-widest mt-4"
          >
            Launch Board Question Pool
          </button>
        )}
      </div>

      {/* Timed Sprint ProgressBar */}
      {timedToggle && answeredState !== 'submitted' && currentQuestion && (
        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden shadow-inner">
          <div 
            className={`h-full transition-all duration-1000 linear ${secondsLeft < 20 ? 'bg-rose-500 animate-pulse' : 'bg-pine-light'}`}
            style={{ width: `${(secondsLeft / 90) * 100}%` }}
          />
        </div>
      )}

      {/* Loading state indicator */}
      {loading && (
        <div className="bg-white border border-gray-200 rounded-3xl p-16 text-center shadow-sm space-y-3">
          <div className="w-10 h-10 border-4 border-sage/20 border-t-pine rounded-full animate-spin mx-auto" />
          <h5 className="font-heading font-black text-pine text-sm uppercase tracking-wider">Formulating Diagnostic Clinical Case</h5>
          <p className="text-xs text-gray-400">Assembling high-yield differentials and medical questions...</p>
        </div>
      )}

      {/* Main Question Display Wrapper */}
      {currentQuestion && !loading && (
        <div className="space-y-6">
          {/* Diagnostic Case Card */}
          <div className="bg-white border border-gray-200 border-l-4 border-l-pine-light rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center gap-3">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#2e5e41] bg-[#deebe3] px-3 py-1 rounded-full font-bold">
                {currentQuestion.category || "Board Vignette"}
              </span>
              {timedToggle && answeredState !== 'submitted' && (
                <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                  ⏱️ {secondsLeft}s left
                </span>
              )}
            </div>

            <p className="text-sm text-gray-800 leading-relaxed font-sans font-medium">
              {currentQuestion.vignette}
            </p>

            {/* Private user handwritten study pad */}
            <div className="pt-3 border-t border-dashed border-gray-100 space-y-1">
              <label className="text-[9px] uppercase font-bold text-sage block tracking-wider">✍️ Case study notepad (Private annotations)</label>
              <textarea
                value={noteText}
                onChange={(e) => saveNote(e.target.value)}
                placeholder="Annotate key diagnostic indicators, rule-outs, or treatment protocols..."
                rows={2}
                className="w-full bg-foam/40 border border-pine/10 focus:border-sage pl-3 pr-3 py-2 text-xs font-sans rounded-xl outline-none resize-none transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Answer Options list */}
          <div className="space-y-2.5">
            {currentQuestion.options.map((opt, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const isSelected = selectedIdx === idx;
              const isCorrectOpt = idx === currentQuestion.correctIndex;
              const isSubmitted = answeredState === 'submitted';

              let optClass = "border-gray-200 bg-white text-gray-800 hover:border-sage hover:bg-foam/30";
              let badgeClass = "bg-foam text-pine border-pine/10 font-bold";

              if (isSubmitted) {
                if (isCorrectOpt) {
                  optClass = "border-emerald-300 bg-emerald-50 text-emerald-800 font-bold pointer-events-none";
                  badgeClass = "bg-emerald-200 text-emerald-800 border-emerald-400 font-bold";
                } else if (isSelected) {
                  optClass = "border-rose-300 bg-rose-50 text-rose-800 line-through opacity-80 pointer-events-none";
                  badgeClass = "bg-rose-200 text-rose-800 border-rose-400 font-bold";
                } else {
                  optClass = "border-gray-100 bg-white text-gray-400 opacity-60 pointer-events-none";
                  badgeClass = "bg-gray-100 text-gray-300 border-gray-200";
                }
              } else if (isSelected) {
                optClass = "border-pine bg-foam/50 text-pine ring-2 ring-pine/5 font-semibold";
                badgeClass = "bg-pine text-white border-pine font-bold";
              }

              return (
                <button
                  key={idx}
                  disabled={isSubmitted}
                  onClick={() => setSelectedIdx(idx)}
                  className={`w-full text-left flex items-center gap-4 border p-4 rounded-xl cursor-pointer transition-all duration-150 active:scale-[0.99] select-none ${optClass}`}
                >
                  <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center border rounded-lg text-xs leading-none font-mono ${badgeClass}`}>
                    {letter}
                  </div>
                  <span className="text-xs leading-relaxed leading-normal">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Action triggers */}
          <div className="flex flex-wrap items-center gap-2">
            {answeredState === 'pending' ? (
              <button
                onClick={handleEval}
                disabled={selectedIdx === null}
                className="px-6 py-2.5 bg-pine hover:bg-pine-mid text-white font-bold text-xs uppercase tracking-widest rounded-xl disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed select-none shadow hover:shadow-md cursor-pointer transition-all duration-150 active:scale-95"
              >
                Evaluate Selection
              </button>
            ) : (
              <>
                <button
                  onClick={handleFetchNext}
                  className="px-6 py-2.5 bg-pine hover:bg-pine-mid text-white font-bold text-xs uppercase tracking-widest rounded-xl select-none shadow-md hover:shadow-lg cursor-pointer flex items-center gap-2 transition active:scale-95 border-b-2 border-pine-mid"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleGetMnemonic}
                  className="px-4 py-2.5 hover:bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold rounded-xl cursor-pointer shadow-sm select-none transition"
                >
                  🧠 Mnemonic
                </button>

                <button
                  onClick={() => setIsDiffDuelOpen(prev => !prev)}
                  className="px-4 py-2.5 hover:bg-cyan-50 border border-cyan-300 text-cyan-800 text-xs font-bold rounded-xl cursor-pointer shadow-sm select-none transition"
                >
                  ⚖️ Differential Duel
                </button>
              </>
            )}
          </div>

          {/* EXPANDABLE HIGH YIELD EXPLANATION PANEL */}
          {answeredState === 'submitted' && (
            <div className="bg-gradient-to-br from-foam to-[#e4eed9] border border-[#cbd9bc] rounded-2xl p-5 space-y-4 shadow-inner animate-in slide-in-from-top-4 duration-150">
              <div className="flex items-center gap-2 text-pine mb-1">
                <CheckCircle2 className="w-5 h-5 text-pine-light" />
                <h4 className="font-heading font-black text-xs uppercase tracking-widest">Mastery Rationale Explanation</h4>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed leading-normal font-sans font-medium">
                {currentQuestion.explanation}
              </p>

              {/* Differential Duel Box */}
              {isDiffDuelOpen && (
                <div className="border border-cyan-200 bg-cyan-50/40 p-4 rounded-xl leading-relaxed space-y-2 select-none animate-in fade-in duration-100">
                  <h5 className="font-heading font-black text-[10px] uppercase tracking-wider text-cyan-800">⚖️ Clinical Differential Duel Active</h5>
                  <p className="text-[11px] text-cyan-900 leading-relaxed font-medium">
                    Analyze the options strictly. <strong>{currentQuestion.options[currentQuestion.correctIndex]}</strong> represents the primary FDA diagnosis because it directly treats the specific target receptors indicated in this DSM profile.
                    The secondary options act as distractors—ranging from second-tier therapeutics with slower clinical times to off-target drug categories with higher liability ratios, making them contraindicated.
                  </p>
                </div>
              )}

              {/* Mnemonic Loader/Display on demand */}
              {(loadingMnemonic || mnemonicText) && (
                <div className="border border-amber-200 bg-white/70 p-4 rounded-xl shadow-inner space-y-2 animate-in fade-in duration-100">
                  <div className="flex items-center gap-1.5 text-amber-800">
                    <Sparkles className="w-4.5 h-4.5 text-amber-500" />
                    <h5 className="font-heading font-black text-[10px] uppercase tracking-wider">🧠 AI Mnemonic Generated</h5>
                  </div>
                  
                  {loadingMnemonic && (
                    <div className="flex items-center gap-2.5 py-1 text-xs text-gray-500 font-medium">
                      <div className="w-3.5 h-3.5 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin" />
                      <span>Formulating memorable review rule...</span>
                    </div>
                  )}

                  {!loadingMnemonic && mnemonicText && (
                    <div className="text-[11px] text-gray-700 leading-relaxed font-sans space-y-1 font-medium whitespace-pre-line">
                      {mnemonicText}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
};
