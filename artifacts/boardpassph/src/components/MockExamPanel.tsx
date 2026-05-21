import React, { useState, useEffect, useRef } from 'react';
import { Award, Clock, ArrowRight, ArrowLeft, AlertTriangle, CheckCircle, Percent, Flag, Eye, ChevronRight, Printer, RefreshCw } from 'lucide-react';
import { Question, UserProfile } from '../types';
import { SEED_QUESTIONS } from '../data/seedQuestions';
import { TESTS } from '../data/tests';
import { generateLocalQuestionForTest } from '../utils/questionGenerator';

interface MockExamPanelProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onNavigate: (tabId: string) => void;
}

export const MockExamPanel: React.FC<MockExamPanelProps> = ({ profile, setProfile, onNavigate }) => {
  const [examState, setExamState] = useState<'intro' | 'testing' | 'results'>('intro');
  const [examLength, setExamLength] = useState<20 | 100>(20);
  const [focusFilter, setFocusFilter] = useState<'comprehensive' | 'dsm_only' | 'prc_only'>('comprehensive');
  
  // Active questions, selected answers, and flagged state
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({}); // qIndex -> optionIndex
  const [flags, setFlags] = useState<Record<number, boolean>>({}); // qIndex -> isFlagged
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(1800); // 30 mins for 20 questions, 2 hours for 100 questions
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Constructs the mock board exam questions based on proportions
  const buildExamQuestions = (count: number) => {
    const list: Question[] = [];

    // Calculate portions
    const assessmentsPortion = Math.round(count * 0.2); // 20%
    const pharmaPortion = Math.round(count * 0.2); // 20%
    const devPortion = Math.round(count * 0.1); // 10%
    const ioPortion = Math.round(count * 0.1); // 10%
    const clinicalPortion = count - (assessmentsPortion + pharmaPortion + devPortion + ioPortion); // Rest (40%)

    // 1. Gather Clinical (dsm5)
    let clinicalSeeds = SEED_QUESTIONS.filter(q => q.source === 'dsm5');
    while (clinicalSeeds.length < clinicalPortion) {
      clinicalSeeds = [...clinicalSeeds, ...clinicalSeeds];
    }
    list.push(...clinicalSeeds.slice(0, clinicalPortion));

    // 2. Gather Psychological Assessment (assessments)
    // We dynamically generate questions based on our 30+ tests inside tests.ts! This ensures robust question variety
    const testPool = [...TESTS].sort(() => Math.random() - 0.5);
    let testIdx = 0;
    for (let i = 0; i < assessmentsPortion; i++) {
      const test = testPool[testIdx % testPool.length];
      const generatedQ = generateLocalQuestionForTest(test, Math.floor(Math.random() * 100));
      list.push(generatedQ);
      testIdx++;
    }

    // 3. Gather Psychopharmacology
    let pharmaSeeds = SEED_QUESTIONS.filter(q => q.source === 'pharma');
    while (pharmaSeeds.length < pharmaPortion) {
      pharmaSeeds = [...pharmaSeeds, ...pharmaSeeds];
    }
    list.push(...pharmaSeeds.slice(0, pharmaPortion));

    // 4. Gather Developmental
    let devSeeds = SEED_QUESTIONS.filter(q => q.source === 'dev');
    while (devSeeds.length < devPortion) {
      devSeeds = [...devSeeds, ...devSeeds];
    }
    list.push(...devSeeds.slice(0, devPortion));

    // 5. Gather I/O Psychology
    let ioSeeds = SEED_QUESTIONS.filter(q => q.source === 'io');
    while (ioSeeds.length < ioPortion) {
      ioSeeds = [...ioSeeds, ...ioSeeds];
    }
    list.push(...ioSeeds.slice(0, ioPortion));

    // Shuffle the final merged exam list
    return list.sort(() => Math.random() - 0.5);
  };

  const startExam = () => {
    const questions = buildExamQuestions(examLength);
    setExamQuestions(questions);
    setAnswers({});
    setFlags({});
    setCurrentIdx(0);
    setSecondsRemaining(examLength === 20 ? 1800 : 7200); // 30m vs 120m
    setExamState('testing');
  };

  // Exam Countdown handler
  useEffect(() => {
    if (examState !== 'testing') return;

    timerRef.current = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          alert("⏱️ Diagnostic exam period finished! Your answers are submitted.");
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examState]);

  const handleSubmitExam = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setExamState('results');

    // Calculate score metrics
    let correctCount = 0;
    examQuestions.forEach((q, idx) => {
      if (answers[idx] === q.correctIndex) {
        correctCount++;
      }
    });

    // Score XP based on results (XP reward + 100 XP bonus for passing)
    const passed = (correctCount / examLength) >= 0.75;
    const gainedXp = correctCount * 10 + (passed ? 150 : 25);

    setProfile(prev => {
      const isCorrectDelta = correctCount;
      const attsDelta = examLength;
      
      const updatedProfile = {
        ...prev,
        attempts: prev.attempts + attsDelta,
        correct: prev.correct + isCorrectDelta,
        totalXp: prev.totalXp + gainedXp,
      };

      localStorage.setItem(`bp_profile_${prev.email}`, JSON.stringify(updatedProfile));
      return updatedProfile;
    });
  };

  // Computes category score breakdowns for the report
  const getSubcategoryMetrics = () => {
    const scores: Record<string, { correct: number; total: number }> = {};
    examQuestions.forEach((q, idx) => {
      const source = q.source || 'Others';
      let title = "DSM-5 clinical";
      if (source === 'pharma') title = "Psychopharmacology";
      if (source === 'assessment') title = "Psychological Assessment";
      if (source === 'dev') title = "Lifespan Development";
      if (source === 'io') title = "Industrial-Organizational";

      if (!scores[title]) scores[title] = { correct: 0, total: 0 };
      scores[title].total++;
      if (answers[idx] === q.correctIndex) {
        scores[title].correct++;
      }
    });
    return scores;
  };

  const getTimerString = () => {
    const h = Math.floor(secondsRemaining / 3600);
    const m = Math.floor((secondsRemaining % 3600) / 60);
    const s = secondsRemaining % 60;
    return `${h > 0 ? `${h}:` : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    const answeredCount = Object.keys(answers).length;
    return Math.round((answeredCount / examLength) * 100);
  };

  return (
    <div className="space-y-6">
      {/* 1. INTRODUCTION LAUNCH PANEL */}
      {examState === 'intro' && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6 max-w-2xl mx-auto">
          {/* Header titles */}
          <div className="text-center space-y-2 pb-5 border-b border-gray-100">
            <div className="p-3 bg-red-50 text-rose-500 rounded-full w-max mx-auto border border-rose-100 shadow-sm">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="font-display text-2xl text-pine">Board Exam Simulation</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              Test your clinical, pharmacological, and assessive competencies in full PRC-standardized simulated parameters.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Exam Length Parameter */}
            <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 space-y-2">
              <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Exam Volume selection</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setExamLength(20)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border cursor-pointer select-none transition-all ${
                    examLength === 20 
                      ? 'bg-pine text-white border-pine shadow-sm' 
                      : 'bg-white border-gray-200 text-gray-700 hover:border-sage'
                  }`}
                >
                  Quick diagnostic (20 Qs)
                </button>
                <button
                  onClick={() => setExamLength(100)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border cursor-pointer select-none transition-all ${
                    examLength === 100 
                      ? 'bg-pine text-white border-pine shadow-sm' 
                      : 'bg-white border-gray-200 text-gray-700 hover:border-sage'
                  }`}
                >
                  Full Board (100 Qs)
                </button>
              </div>
            </div>

            {/* Simulated Timing */}
            <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-4 flex flex-col justify-center">
              <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">Timed Limits allocation</span>
              <span className="text-sm font-bold text-gray-800 mt-1 flex items-center gap-1.5 font-mono">
                <Clock className="w-4 h-4 text-pine-light" />
                {examLength === 20 ? '30 minutes (1,800s)' : '120 minutes (7,200s)'}
              </span>
            </div>
          </div>

          {/* Guidelines notes */}
          <div className="space-y-2 bg-rose-50/20 border border-rose-100/50 rounded-xl p-4">
            <h5 className="font-heading font-black text-[10px] uppercase text-rose-800 tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Board regulations &amp; parameter constraints
            </h5>
            <ul className="text-[10px] text-gray-600 space-y-1.5 leading-relaxed list-disc list-inside">
              <li>Formulated strictly proportionally from Abnormal Psych, assessments, psychopharmacological therapy, lifespan theory, and I/O.</li>
              <li>You may jump back and forth between questions using the navigations or grid panel.</li>
              <li>Use the <strong>"Flag"</strong> `🚩` trigger to mark questions you need to review.</li>
              <li>Leaving or closing this tab before final submission forfeits active answers.</li>
            </ul>
          </div>

          <button
            onClick={startExam}
            className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg border-b-2 border-rose-800 shadow-rose-900/10 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 select-none transition"
          >
            Initiate Simulated Simulation
          </button>
        </div>
      )}

      {/* 2. ACTIVE TESTING METHOD */}
      {examState === 'testing' && examQuestions.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
          {/* Question Interface Area (9 column columns) */}
          <div className="lg:col-span-8 space-y-5">
            {/* Headers, Timer state */}
            <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-sm flex justify-between items-center select-none">
              <div className="space-y-0.5">
                <span className="text-gray-400 block font-bold uppercase text-[9px] tracking-wider">Exam Progress Status</span>
                <span className="font-heading font-black text-xs text-pine">
                  Question {currentIdx + 1} of {examLength}
                </span>
              </div>

              {/* Progress Bar overall */}
              <div className="w-[120px] bg-gray-100 h-2.5 rounded-full overflow-hidden shadow-inner hidden sm:block">
                <div 
                  className="h-full bg-sage rounded-full"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>

              {/* Timing clock state */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-100 text-rose-800 font-bold rounded-lg font-mono">
                <Clock className="w-4 h-4 text-rose-500 animate-pulse" />
                <span>{getTimerString()}</span>
              </div>
            </div>

            {/* Diagnostic Card Question */}
            <div className="bg-white border border-gray-200 border-l-4 border-l-pine rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center gap-3">
                <span className="text-[10px] uppercase font-bold text-teal-800 bg-teal-50 border border-teal-100 px-3 py-0.5 rounded-full">
                  {examQuestions[currentIdx]?.category || "DSM-5 Assessment"}
                </span>

                <button
                  onClick={() => setFlags(prev => ({ ...prev, [currentIdx]: !prev[currentIdx] }))}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider select-none cursor-pointer transition-all border ${
                    flags[currentIdx]
                      ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-sm font-black'
                      : 'bg-gray-50 text-gray-400 border-gray-200 hover:text-gray-600 hover:border-gray-300'
                  }`}
                >
                  <Flag className={`w-3 h-3 ${flags[currentIdx] ? 'fill-rose-500' : ''}`} />
                  <span>Flag</span>
                </button>
              </div>

              <p className="text-xs text-gray-800 font-medium leading-relaxed font-sans mt-2">
                {examQuestions[currentIdx]?.vignette}
              </p>
            </div>

            {/* Option selection blocks */}
            <div className="space-y-2">
              {examQuestions[currentIdx]?.options.map((opt, optIdx) => {
                const letter = String.fromCharCode(65 + optIdx);
                const isSelected = answers[currentIdx] === optIdx;

                return (
                  <button
                    key={optIdx}
                    onClick={() => setAnswers(prev => ({ ...prev, [currentIdx]: optIdx }))}
                    className={`w-full text-left flex items-center gap-4 border p-4 rounded-xl cursor-pointer select-none transition-all duration-150 active:scale-[0.99] ${
                      isSelected 
                        ? 'border-pine bg-foam/40 text-pine ring-2 ring-pine/5 font-semibold shadow-sm'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-sage'
                    }`}
                  >
                    <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center border rounded-lg text-xs leading-none font-mono ${
                      isSelected ? 'bg-pine text-white border-pine' : 'bg-gray-50 text-gray-500 border-gray-100'
                    }`}>
                      {letter}
                    </div>
                    <span className="text-xs">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Footer Navigation handles */}
            <div className="flex justify-between items-center gap-3 select-none">
              <button
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(prev => prev - 1)}
                className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-xl font-bold text-gray-700 hover:border-sage bg-white cursor-pointer select-none transition disabled:opacity-30 disabled:cursor-not-allowed text-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Prev Question</span>
              </button>

              {currentIdx < examLength - 1 ? (
                <button
                  onClick={() => setCurrentIdx(prev => prev + 1)}
                  className="flex items-center gap-1 px-4 py-2 bg-pine text-white font-bold rounded-xl hover:bg-pine-mid cursor-pointer select-none transition shadow-sm text-xs"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmitExam}
                  className="px-6 py-2 bg-rose-600 hover:bg-rose-700 font-bold text-xs uppercase tracking-widest text-white rounded-xl cursor-pointer select-none shadow hover:shadow-md transition"
                >
                  Submit Exam Report
                </button>
              )}
            </div>
          </div>

          {/* Gridded Flagger Index Panel (4 column columns) */}
          <div className="lg:col-span-4 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <h5 className="font-heading font-black text-pine text-xs uppercase tracking-widest flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-sage" />
                Question Flagger Index
              </h5>
              <p className="text-[10px] text-gray-400 mt-0.5">Quick selection panel grid. Red is flagged, green is completed.</p>
            </div>

            <div className="grid grid-cols-5 gap-2 pb-4 border-b border-gray-100 max-h-[220px] overflow-y-auto no-scrollbar">
              {examQuestions.map((_, idx) => {
                const isSelected = idx === currentIdx;
                const isAnswered = answers[idx] !== undefined;
                const isFlagged = flags[idx] === true;

                let cellClass = "border-gray-200 bg-white hover:border-sage text-gray-500 hover:bg-gray-50";

                if (isSelected) {
                  cellClass = "border-pine bg-pine text-white font-extrabold ring-2 ring-pine/20 shadow-sm";
                } else if (isFlagged) {
                  cellClass = "border-rose-300 bg-rose-50 text-rose-700 font-black";
                } else if (isAnswered) {
                  cellClass = "border-emerald-300 bg-emerald-50 text-emerald-700 font-semibold";
                }

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentIdx(idx)}
                    className={`aspect-square flex items-center justify-center border rounded-xl text-[11px] font-mono leading-none cursor-pointer transition select-none ${cellClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Summary statistics legended */}
            <div className="space-y-2 text-[10px] text-gray-500 font-medium">
              <div className="flex justify-between items-center">
                <span>Completed responses:</span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 border border-emerald-100 rounded-full">
                  {Object.keys(answers).length} / {examLength}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Flagged parameters:</span>
                <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 border border-rose-100 rounded-full">
                  {Object.keys(flags).filter(f => flags[parseInt(f)]).length} flagged
                </span>
              </div>
            </div>

            {/* Quick Submit Exam Action */}
            <button
              onClick={handleSubmitExam}
              className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow cursor-pointer transition select-none text-center"
            >
              Forced submission
            </button>
          </div>
        </div>
      )}

      {/* 3. REPORT GRADUATION RESULTS AND FORMAL PRINT FILE */}
      {examState === 'results' && examQuestions.length > 0 && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Formally Styled Professional Board Certificate PDF */}
          <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xl" id="printableReport">
            
            {/* Header top section */}
            <div className="p-8 border-b-2 border-pine bg-gradient-to-br from-cream to-[#ebf1ee] flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-left select-none print:bg-white print:p-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black tracking-widest text-[#1a3821] bg-teal-100/50 px-3 py-1 rounded-full border border-teal-200/50">
                  Registry of Assessment Performance
                </span>
                <h3 className="font-display text-2xl text-pine mt-1 leading-tight tracking-tight print:text-black">
                  PRC Psychological Assessment Division
                </h3>
                <p className="text-[10px] text-gray-400 font-semibold font-mono">
                  BoardPassPH Examination Suite • Issued: {new Date().toISOString().split('T')[0]}
                </p>
              </div>

              {/* Pass label */}
              {(() => {
                let correctCount = 0;
                examQuestions.forEach((q, idx) => {
                  if (answers[idx] === q.correctIndex) correctCount++;
                });
                const passed = (correctCount / examLength) >= 0.75;
                return (
                  <div className={`text-center p-3 rounded-2xl border ${
                    passed 
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
                      : 'bg-rose-50 border-rose-300 text-rose-800'
                  }`}>
                    <span className="text-[8px] uppercase font-black block tracking-widest">Diagnostic grade status</span>
                    <span className="font-heading font-black text-xl tracking-tight uppercase">
                      {passed ? 'Passed 🎓' : 'Unfinished 📚'}
                    </span>
                  </div>
                );
              })()}
            </div>

            {/* Main Score breakdown details */}
            <div className="p-8 space-y-6 print:p-4">
              <div className="text-center bg-gray-50/70 rounded-2xl p-5 border border-gray-100 select-none">
                <span className="text-xs uppercase font-extrabold tracking-widest text-gray-400 block p-0.5">Overall board accuracy</span>
                <h2 className="font-display text-5xl text-pine tracking-tighter mt-1 print:text-black">
                  {(() => {
                    let correctCount = 0;
                    examQuestions.forEach((q, idx) => {
                      if (answers[idx] === q.correctIndex) correctCount++;
                    });
                    return Math.round((correctCount / examLength) * 100);
                  })()}%
                </h2>
                <div className="flex justify-center gap-4 text-xs font-bold text-gray-500 mt-2 font-mono">
                  <span>
                    ✅ {examQuestions.filter((q, idx) => answers[idx] === q.correctIndex).length} Correct
                  </span>
                  <span>
                     Incorrect: {examLength - examQuestions.filter((q, idx) => answers[idx] === q.correctIndex).length}
                  </span>
                </div>
              </div>

              {/* Sub-competencies metrics categories breakdown */}
              <div className="space-y-3">
                <h5 className="font-heading font-black text-pine text-xs uppercase tracking-widest border-b border-gray-100 pb-2 select-none">
                  Competency score breakdown matrices
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(getSubcategoryMetrics()).map(([cat, metric]) => {
                    const pct = Math.round((metric.correct / metric.total) * 100);
                    return (
                      <div key={cat} className="space-y-1.5 border border-gray-100 bg-gray-50/20 p-4 rounded-xl shadow-sm">
                        <div className="flex justify-between items-center text-xs font-bold text-gray-700">
                          <span className="truncate max-w-[200px]">{cat}</span>
                          <span className="font-mono text-[11px] text-pine-light">{metric.correct}/{metric.total} ({pct}%)</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden select-none">
                          <div 
                            className={`h-full rounded-full ${pct >= 75 ? 'bg-pine-light' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-yellow-50/50 border border-yellow-100 text-yellow-900 rounded-2xl p-5 leading-relaxed space-y-1 select-none">
                <h6 className="font-heading font-black text-[10px] uppercase text-yellow-800 tracking-wider">🎓 High-yield Study recommendation details</h6>
                <p className="text-xs leading-relaxed text-yellow-950 font-medium">
                  {(() => {
                    const subMetrics = Object.entries(getSubcategoryMetrics());
                    const weakest = subMetrics.sort((a,b) => (a[1].correct/a[1].total) - (b[1].correct/b[1].total))[0];
                    if (weakest && (weakest[1].correct/weakest[1].total) < 0.75) {
                      return `Your evaluation indicates potential growth room in the "${weakest[0]}" domain. Select this subject area in the Practice config list to practice focused clinical vignettes.`;
                    }
                    return "Outstanding performance! Your competencies meet high baseline diagnostic board standards. Consistently practice using the Psychological Assessment Library catalog to maintain your peak score matrices.";
                  })()}
                </p>
              </div>
            </div>
          </div>

          {/* Action triggers print report */}
          <div className="flex justify-center items-center gap-3 select-none">
            <button
              onClick={() => setExamState('intro')}
              className="px-6 py-2.5 hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold text-xs uppercase tracking-widest rounded-xl cursor-pointer"
            >
              Close Simulator
            </button>
            
            <button
              onClick={() => window.print()}
              className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-widest rounded-xl cursor-pointer flex items-center gap-2 shadow hover:shadow-lg transition"
            >
              <Printer className="w-4 h-4" />
              <span>Download PDF Score Report</span>
            </button>
          </div>

          <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #printableReport, #printableReport * {
                visibility: visible;
              }
              #printableReport {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                border: none;
                box-shadow: none;
                page-break-after: avoid;
              }
            }
          `}</style>

        </div>
      )}
    </div>
  );
};
