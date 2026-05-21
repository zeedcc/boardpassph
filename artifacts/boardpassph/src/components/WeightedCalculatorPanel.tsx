import React, { useState, useEffect } from 'react';
import { Calculator, Percent, Award, AlertTriangle, CheckCircle2, RotateCcw, Info, Sparkles, Sliders, Save, Trash2 } from 'lucide-react';
import { UserProfile } from '../types';

interface SubjectScore {
  name: string;
  weight: number;
  score: number;
}

interface SavedPreset {
  id: string;
  label: string;
  scores: Record<string, number>;
  average: number;
  dateStr: string;
}

interface WeightedCalculatorPanelProps {
  profile?: UserProfile | null;
  setProfile?: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

export const WeightedCalculatorPanel: React.FC<WeightedCalculatorPanelProps> = ({ profile, setProfile }) => {
  // 4 Subjects under standard Board Exam for Psychometricians in the Philippines
  const [devScore, setDevScore] = useState<number | ''>(75);
  const [abnormalScore, setAbnormalScore] = useState<number | ''>(75);
  const [ioScore, setIoScore] = useState<number | ''>(75);
  const [assessmentScore, setAssessmentScore] = useState<number | ''>(75);

  // What-if simulator targets
  const [targetAverage, setTargetAverage] = useState<number>(75);
  const [targetSubject, setTargetSubject] = useState<string>('assessment'); // Which subject is solved for

  // Saved presets in localStorage
  const [presets, setPresets] = useState<SavedPreset[]>([]);
  const [newPresetLabel, setNewPresetLabel] = useState<string>('');

  useEffect(() => {
    const saved = localStorage.getItem('rp_score_calculator_presets');
    if (saved) {
      try {
        setPresets(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to parse saved calculator presets:', err);
      }
    }
  }, []);

  // Safe cast helper
  const getNumValue = (val: number | ''): number => {
    return val === '' ? 0 : val;
  };

  const devNum = getNumValue(devScore);
  const abnormalNum = getNumValue(abnormalScore);
  const ioNum = getNumValue(ioScore);
  const assessmentNum = getNumValue(assessmentScore);

  // Calculate weighted individual scores
  const devWeighted = devNum * 0.20;
  const abnormalWeighted = abnormalNum * 0.20;
  const ioWeighted = ioNum * 0.20;
  const assessmentWeighted = assessmentNum * 0.40;

  const totalWeightedAverage = devWeighted + abnormalWeighted + ioWeighted + assessmentWeighted;

  // Passing rules: 
  // 1. General Ave >= 75%
  // 2. No grade lower than 50% in ANY subject
  const belowFiftySubjects = [
    { name: 'Developmental Psychology', val: devNum },
    { name: 'Abnormal Psychology', val: abnormalNum },
    { name: 'Industrial/Organizational Psychology', val: ioNum },
    { name: 'Psychological Assessment', val: assessmentNum }
  ].filter(s => s.val < 50);

  const hasSubjectBelowFifty = belowFiftySubjects.length > 0;
  const isAveragePassing = totalWeightedAverage >= 75;

  let passingStatus: 'PASSED' | 'CONDITIONAL_FAILED' | 'FAILED' = 'FAILED';
  if (isAveragePassing && !hasSubjectBelowFifty) {
    passingStatus = 'PASSED';
  } else if (isAveragePassing && hasSubjectBelowFifty) {
    passingStatus = 'CONDITIONAL_FAILED';
  } else {
    passingStatus = 'FAILED';
  }

  // Preset quick appliers
  const applyPresetScores = (dev: number, abnormal: number, io: number, assessment: number) => {
    setDevScore(dev);
    setAbnormalScore(abnormal);
    setIoScore(io);
    setAssessmentScore(assessment);
  };

  // What-if Solver: Calculates what score is required in the target subject
  // to achieve target average, based on other 3 fixed scores.
  // Equation: TotalAverage = 0.20*Dev + 0.20*Abnormal + 0.20*IO + 0.40*Assessment
  const computeSolverRequired = (): { score: number; possible: boolean; message: string } => {
    let result = 0;
    let otherSum = 0;
    let targetWeight = 0.20;

    if (targetSubject === 'dev') {
      otherSum = abnormalNum * 0.20 + ioNum * 0.20 + assessmentNum * 0.40;
      targetWeight = 0.20;
    } else if (targetSubject === 'abnormal') {
      otherSum = devNum * 0.20 + ioNum * 0.20 + assessmentNum * 0.40;
      targetWeight = 0.20;
    } else if (targetSubject === 'io') {
      otherSum = devNum * 0.20 + abnormalNum * 0.20 + assessmentNum * 0.40;
      targetWeight = 0.20;
    } else { // assessment
      otherSum = devNum * 0.20 + abnormalNum * 0.20 + ioNum * 0.20;
      targetWeight = 0.40;
    }

    result = (targetAverage - otherSum) / targetWeight;
    const rounded = Math.round(result * 10) / 10;

    if (rounded < 0) {
      return {
        score: Math.max(0, rounded),
        possible: true,
        message: 'Perfect! You already exceeded this target average with other scores.'
      };
    } else if (rounded > 100) {
      return {
        score: rounded,
        possible: false,
        message: `Impossible (Requires ${rounded}%, which exceeds the 100% maximum exam capacity. Boost other subjects first!).`
      };
    } else {
      return {
        score: rounded,
        possible: true,
        message: rounded < 50 
          ? `Requires ${rounded}%. However, note that you still must score at least 50% to prevent failing under PRC policy!`
          : `Requires a score of exactly ${rounded}% to hit your target average.`
      };
    }
  };

  const solverAnswer = computeSolverRequired();

  // Save Current Targets as a new Preset
  const handleSavePreset = (e: React.FormEvent) => {
    e.preventDefault();
    const label = newPresetLabel.trim() || `Preset (${totalWeightedAverage.toFixed(1)}%)`;
    
    const newPreset: SavedPreset = {
      id: Date.now().toString(),
      label,
      scores: {
        dev: devNum,
        abnormal: abnormalNum,
        io: ioNum,
        assessment: assessmentNum
      },
      average: totalWeightedAverage,
      dateStr: new Date().toLocaleDateString()
    };

    const updated = [newPreset, ...presets];
    setPresets(updated);
    localStorage.setItem('rp_score_calculator_presets', JSON.stringify(updated));
    setNewPresetLabel('');
  };

  // Delete static saved preset
  const handleDeletePreset = (id: string) => {
    const updated = presets.filter(p => p.id !== id);
    setPresets(updated);
    localStorage.setItem('rp_score_calculator_presets', JSON.stringify(updated));
  };

  // Set scores to preset values
  const handleLoadPreset = (preset: SavedPreset) => {
    setDevScore(preset.scores.dev);
    setAbnormalScore(preset.scores.abnormal);
    setIoScore(preset.scores.io);
    setAssessmentScore(preset.scores.assessment);
  };

  return (
    <div id="rp_weighted_calculator_panel" className="bg-white border border-pine/10 rounded-3xl p-6 shadow-sm space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-pine text-cream rounded-xl flex items-center justify-center shadow-inner">
            <Calculator className="w-5 h-5 text-mint" />
          </div>
          <div>
            <span className="text-[9px] bg-pine/10 text-pine px-2 py-0.5 rounded font-black font-mono uppercase tracking-wide">
              Official board metrics
            </span>
            <h2 id="calculator_header_title" className="text-sm font-black text-pine-mid uppercase tracking-wide mt-1">
              RPm Weighted Board Rating Calculator
            </h2>
          </div>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => applyPresetScores(75, 75, 75, 75)}
            className="px-2.5 py-1 text-[10px] bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition font-bold"
            title="Set all subjects to exactly 75%"
          >
            📊 Base Passing (75s)
          </button>
          <button
            onClick={() => applyPresetScores(80, 80, 80, 80)}
            className="px-2.5 py-1 text-[10px] bg-pine/10 hover:bg-pine/20 text-pine rounded-lg transition font-bold"
            title="Set all subjects to 80%"
          >
            🛡️ Safe Target (80s)
          </button>
          <button
            onClick={() => applyPresetScores(88, 88, 86, 90)}
            className="px-2.5 py-1 text-[10px] bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg transition font-bold"
            title="Simulate high board scores"
          >
            🏆 Topnotcher (88s)
          </button>
          <button
            onClick={() => {
              setDevScore(70);
              setAbnormalScore(70);
              setIoScore(70);
              setAssessmentScore(70);
              setTargetAverage(75);
              setTargetSubject('assessment');
            }}
            className="p-1 px-2.5 text-[10px] text-gray-400 hover:text-gray-600 hover:bg-gray-50 border border-gray-200 rounded-lg transition flex items-center gap-1"
            title="Reset weights to default values"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* Primary Calculator Layout split in Two Columns */}
      <div id="calculator_twin_columns" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Inputs and Subject breakdown */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
            <h3 className="text-xs font-black text-pine-mid uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-sage" />
              1. Input Your Subject Ratings (Percentages 0 - 100)
            </h3>
            <p className="text-[10px] text-gray-500 mb-4 leading-normal">
              Enter either your actual board exam ratings, mocked benchmark percentiles, or target criteria. Ratings default to the Philippine standard raw or passing ranges.
            </p>

            <div className="space-y-4">
              {/* Subject 1: Developmental Psych */}
              <div className="bg-white border border-gray-200/60 p-3 rounded-xl shadow-sm hover:border-pine/30 transition">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-extrabold text-pine-mid">
                      Developmental Psychology
                    </span>
                    <span className="text-[9px] text-sage font-mono">
                      Weight: 20% of Rating
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="input_dev_score"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0"
                      value={devScore}
                      onChange={(e) => {
                        const v = e.target.value === '' ? '' : Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                        setDevScore(v);
                      }}
                      className="w-16 p-1 text-center bg-gray-50 border border-gray-200 rounded-md font-mono text-xs font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-pine focus:bg-white"
                    />
                    <span className="text-xs text-gray-400 font-mono">%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  {/* Slider */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={devNum}
                    onChange={(e) => setDevScore(parseInt(e.target.value))}
                    className="w-2/3 h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-pine"
                  />
                  <div className="text-[10px] font-mono text-gray-500">
                    Weighted: <span className="font-extrabold text-pine">{devWeighted.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* Subject 2: Abnormal Psych */}
              <div className="bg-white border border-gray-200/60 p-3 rounded-xl shadow-sm hover:border-pine/30 transition">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-extrabold text-pine-mid">
                      Abnormal Psychology
                    </span>
                    <span className="text-[9px] text-sage font-mono">
                      Weight: 20% of Rating
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="input_abnormal_score"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0"
                      value={abnormalScore}
                      onChange={(e) => {
                        const v = e.target.value === '' ? '' : Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                        setAbnormalScore(v);
                      }}
                      className="w-16 p-1 text-center bg-gray-50 border border-gray-200 rounded-md font-mono text-xs font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-pine focus:bg-white"
                    />
                    <span className="text-xs text-gray-400 font-mono">%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  {/* Slider */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={abnormalNum}
                    onChange={(e) => setAbnormalScore(parseInt(e.target.value))}
                    className="w-2/3 h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-pine"
                  />
                  <div className="text-[10px] font-mono text-gray-500">
                    Weighted: <span className="font-extrabold text-pine">{abnormalWeighted.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* Subject 3: Industrial/Organizational Psych */}
              <div className="bg-white border border-gray-200/60 p-3 rounded-xl shadow-sm hover:border-pine/30 transition">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-extrabold text-pine-mid">
                      Industrial/Organizational Psychology
                    </span>
                    <span className="text-[9px] text-sage font-mono">
                      Weight: 20% of Rating
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="input_io_score"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0"
                      value={ioScore}
                      onChange={(e) => {
                        const v = e.target.value === '' ? '' : Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                        setIoScore(v);
                      }}
                      className="w-16 p-1 text-center bg-gray-50 border border-gray-200 rounded-md font-mono text-xs font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-pine focus:bg-white"
                    />
                    <span className="text-xs text-gray-400 font-mono">%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  {/* Slider */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={ioNum}
                    onChange={(e) => setIoScore(parseInt(e.target.value))}
                    className="w-2/3 h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-pine"
                  />
                  <div className="text-[10px] font-mono text-gray-500">
                    Weighted: <span className="font-extrabold text-pine">{ioWeighted.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              {/* Subject 4: Psychological Assessment */}
              <div className="bg-white border border-rose-200/70 p-3 rounded-xl shadow-sm hover:border-rose-400/50 transition relative">
                <div className="absolute top-1 right-24 text-[8px] text-rose-700 bg-rose-50 font-black px-1 rounded uppercase tracking-wider">
                  ⚠️ Heavyweight Subject (40%)
                </div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-extrabold text-pine-mid">
                      Psychological Assessment
                    </span>
                    <span className="text-[9px] text-rose-700 font-mono font-black">
                      Weight: 40% of Rating
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="input_assessment_score"
                      type="number"
                      min="0"
                      max="100"
                      placeholder="0"
                      value={assessmentScore}
                      onChange={(e) => {
                        const v = e.target.value === '' ? '' : Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                        setAssessmentScore(v);
                      }}
                      className="w-16 p-1 text-center bg-gray-50 border border-rose-200 rounded-md font-mono text-xs font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-rose-500 focus:bg-white"
                    />
                    <span className="text-xs text-gray-400 font-mono">%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  {/* Slider */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={assessmentNum}
                    onChange={(e) => setAssessmentScore(parseInt(e.target.value))}
                    className="w-2/3 h-1 bg-rose-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
                  />
                  <div className="text-[10px] font-mono text-gray-500">
                    Weighted: <span className="font-extrabold text-rose-700">{assessmentWeighted.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
          
          {/* Quick Details / Summary Table matching requested raw formats */}
          <div className="overflow-x-auto border border-gray-100 rounded-xl">
            <table className="w-full text-left text-[11px] font-medium text-gray-600">
              <thead className="bg-gray-50 text-pine-mid uppercase tracking-wide text-[9px] font-black border-b border-gray-100">
                <tr>
                  <th className="p-2.5">Subject Descriptor</th>
                  <th className="p-2.5 text-center">Weight Weight</th>
                  <th className="p-2.5 text-center">Your Input Score</th>
                  <th className="p-2.5 text-right">Weighted Result Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono">
                <tr>
                  <td className="p-2.5 font-sans font-bold">Developmental Psychology</td>
                  <td className="p-2.5 text-center">20%</td>
                  <td className="p-2.5 text-center font-bold text-gray-800">{devNum}%</td>
                  <td className="p-2.5 text-right font-black text-pine">{devWeighted.toFixed(2)}%</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-sans font-bold">Abnormal Psychology</td>
                  <td className="p-2.5 text-center">20%</td>
                  <td className="p-2.5 text-center font-bold text-gray-800">{abnormalNum}%</td>
                  <td className="p-2.5 text-right font-black text-pine">{abnormalWeighted.toFixed(2)}%</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-sans font-bold">Industrial &amp; Org Psych</td>
                  <td className="p-2.5 text-center">20%</td>
                  <td className="p-2.5 text-center font-bold text-gray-800">{ioNum}%</td>
                  <td className="p-2.5 text-right font-black text-pine">{ioWeighted.toFixed(2)}%</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-sans font-bold text-rose-950">Psychological Assessment</td>
                  <td className="p-2.5 text-center text-rose-800 font-bold">40%</td>
                  <td className="p-2.5 text-center font-bold text-gray-800">{assessmentNum}%</td>
                  <td className="p-2.5 text-right font-black text-rose-700">{assessmentWeighted.toFixed(2)}%</td>
                </tr>
                <tr className="bg-pine/5 font-sans font-black text-xs text-pine-mid border-t border-pine/20">
                  <td className="p-2.5">TOTAL RATING MULTIPLIER</td>
                  <td className="p-2.5 text-center font-mono">100%</td>
                  <td className="p-2.5 text-center font-mono text-gray-400">-</td>
                  <td className="p-2.5 text-right font-mono text-pine-mid text-sm underline decoration-mint decoration-2">
                    {totalWeightedAverage.toFixed(2)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Calculations outcome visualizer & Interactive Solver */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Output Passing Block Dashboard */}
          <div className={`p-5 rounded-2xl border text-center relative overflow-hidden select-none ${
            passingStatus === 'PASSED'
              ? 'bg-emerald-50 border-emerald-100 text-emerald-950'
              : passingStatus === 'CONDITIONAL_FAILED'
              ? 'bg-amber-50 border-amber-200 text-amber-950'
              : 'bg-rose-50 border-rose-100 text-rose-950'
          }`}>
            
            {/* Visual background element */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-current opacity-[0.03] rounded-full" />

            <span className="text-[9px] uppercase font-mono tracking-widest font-black block">
              Result Simulation Outcome
            </span>

            {/* Giant Rating Percent display */}
            <div className="my-3 flex flex-col items-center justify-center">
              <span className="text-[10px] font-mono font-bold text-gray-500 uppercase">
                General Weighted Average (GWA)
              </span>
              <h3 className="text-4xl font-extrabold tracking-tight mt-1">
                {totalWeightedAverage.toFixed(2)}%
              </h3>
            </div>

            {/* Status indicators */}
            <div className="flex items-center justify-center gap-1.5 font-extrabold text-[13px] uppercase tracking-wide">
              {passingStatus === 'PASSED' && (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-emerald-800">PASSED RPm RATING</span>
                </>
              )}
              {passingStatus === 'CONDITIONAL_FAILED' && (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 select-none animate-pulse" />
                  <span className="text-amber-800">FAILED / CONDITIONAL RATING</span>
                </>
              )}
              {passingStatus === 'FAILED' && (
                <>
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="text-rose-800">UNDER PASSING THRESHOLD</span>
                </>
              )}
            </div>

            {/* In-depth contextual alert messages matching actual Philippine board guidelines */}
            <p className="text-[10.5px] mt-2.5 leading-relaxed text-gray-600 font-sans font-medium">
              {passingStatus === 'PASSED' && (
                "Excellent work! Your general average is above 75%, and you have no grades below the mandatory 50% subject minimum. You would be fully certified as a Registered Psychometrician!"
              )}
              {passingStatus === 'CONDITIONAL_FAILED' && (
                `Attention: Your general average is ${totalWeightedAverage.toFixed(1)}% (which is mathematically passing), but you scored below 50% in: ${belowFiftySubjects.map(s => s.name).join(', ')}. Under RA 10029, you are considered to have failed or are subject to repeat conditions.`
              )}
              {passingStatus === 'FAILED' && (
                `Your weighted average (${totalWeightedAverage.toFixed(1)}%) is below the required 75% standard passing score. Boost your focus areas to build safety margins.`
              )}
            </p>

            {/* Indicator progress track line */}
            <div className="mt-4 bg-gray-200/50 rounded-full h-2 overflow-hidden relative">
              <div 
                className={`h-full transition-all duration-300 rounded-full ${
                  passingStatus === 'PASSED' 
                    ? 'bg-emerald-500' 
                    : passingStatus === 'CONDITIONAL_FAILED' 
                    ? 'bg-amber-500' 
                    : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, totalWeightedAverage))}%` }}
              />
              {/* Mark standard 75% GWA line */}
              <div className="absolute left-[75%] top-0 bottom-0 w-0.5 bg-black/40" title="PRC Passing Mark (75%)" />
            </div>
            <div className="flex justify-between text-[8px] font-mono text-gray-400 mt-1 select-none">
              <span>0% (Floor)</span>
              <span className="text-black font-semibold">Passing Line: 75%</span>
              <span>100% (Ceiling)</span>
            </div>
          </div>

          {/* Feature: Awesome What-If Solver (Fulfill interactive calculation scenarios) */}
          <div className="bg-pine/5 border border-pine/10 p-4 rounded-2xl space-y-3">
            <h4 className="text-xs font-black text-pine uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-mint fill-current" />
              💡 High-Yield &quot;What-If&quot; Target Solver
            </h4>
            <p className="text-[10px] text-pine-mid/80 leading-relaxed">
              Curious what raw score you must hit in a particular subject to achieve a specific target board average? Lock your target average and select a focus subject.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[9px] font-bold text-pine-mid/70 uppercase block mb-1">
                  Desired Board GWA
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="50"
                    max="95"
                    step="1"
                    value={targetAverage}
                    onChange={(e) => setTargetAverage(parseInt(e.target.value))}
                    className="w-2/3 h-1 bg-pine/20 rounded accent-pine"
                  />
                  <span className="text-xs font-black text-pine font-mono">{targetAverage}%</span>
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold text-pine-mid/70 uppercase block mb-1">
                  Solve For Subject
                </label>
                <select
                  value={targetSubject}
                  onChange={(e) => setTargetSubject(e.target.value)}
                  className="w-full bg-white border border-pine/10 text-[10px] p-1 rounded font-bold text-pine focus:outline-none focus:ring-1 focus:ring-pine"
                >
                  <option value="dev">Dev Psych (20%)</option>
                  <option value="abnormal font-mono">Abnormal Psych (20%)</option>
                  <option value="io">I/O Psych (20%)</option>
                  <option value="assessment">Psych Assessment (40%)</option>
                </select>
              </div>
            </div>

            {/* Computed Solver Answer card */}
            <div className="bg-white border border-pine/10 p-3 rounded-xl space-y-1.5 mt-2">
              <span className="text-[8.5px] uppercase font-mono text-sage font-black tracking-wider">
                Target Projection Result:
              </span>
              <div className="flex items-start gap-2">
                <div className={`text-xs font-black font-mono px-2 py-0.5 rounded ${
                  solverAnswer.possible ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                }`}>
                  {solverAnswer.score}%
                </div>
                <p className="text-[10px] text-gray-700 font-medium leading-normal">
                  {solverAnswer.message}
                </p>
              </div>
            </div>
          </div>

          {/* Feature: Saved Presets manager to save user-defined targets to localStorage */}
          <div className="border border-gray-100 p-4 rounded-2xl space-y-3">
            <h4 className="text-xs font-black text-gray-800 uppercase tracking-wide flex items-center gap-1.5">
              <Save className="w-3.5 h-3.5 text-pine-mid" />
              💾 Store Target Configs &amp; Saved Milestones
            </h4>
            
            <form onSubmit={handleSavePreset} className="flex gap-2">
              <input
                type="text"
                placeholder="Label (e.g. My Target, Topper Spec)"
                value={newPresetLabel}
                onChange={(e) => setNewPresetLabel(e.target.value)}
                maxLength={30}
                className="flex-1 bg-gray-50 border border-gray-200 p-1.5 px-2.5 rounded-lg text-[10px] text-gray-700 placeholder-gray-400 font-semibold focus:outline-none focus:ring-1 focus:ring-pine focus:bg-white"
              />
              <button
                type="submit"
                className="bg-pine text-cream hover:bg-pine-mid px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition"
              >
                Save Present
              </button>
            </form>

            {presets.length > 0 ? (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pt-1 pr-1">
                {presets.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-2 bg-gray-50 hover:bg-gray-100 border border-gray-200/50 rounded-xl transition text-[10px]">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-gray-800 uppercase tracking-wide">{p.label}</span>
                      <span className="text-[8.5px] text-gray-400 font-mono">
                        GWA: <strong className="text-pine font-black">{p.average.toFixed(1)}%</strong> • {p.dateStr}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 select-none">
                      <button
                        onClick={() => handleLoadPreset(p)}
                        className="px-2 py-0.5 bg-white text-pine hover:bg-pine/10 text-[8px] font-black uppercase tracking-wide border border-gray-200 rounded-md transition"
                        title="Load target scores"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => handleDeletePreset(p.id)}
                        className="p-1 text-gray-300 hover:text-rose-600 transition"
                        title="Delete Preset"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[9.5px] italic text-gray-400 text-center py-2 select-none">
                No custom scores stored yet. Save your scores above to review again.
              </p>
            )}
          </div>

          {/* Official Filipino Board Exam Rating Policy Reminder */}
          <div className="bg-amber-50/40 border border-amber-100 p-3.5 rounded-xl flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="text-[9.5px] font-black text-amber-950 uppercase tracking-wide">
                Official Board Rating Policy (R.A. 10029 &amp; PRC guidelines):
              </h5>
              <p className="text-[9px] text-amber-900/80 leading-relaxed font-sans">
                Each subject represents a specific diagnostic pillar. To fully pass the licensure exam, examinees must obtain a General Weighted Average (GWA) of at least <strong>75%</strong>, with <strong>no grade lower than 50%</strong> in any subject. If a candidate scores below 50% in any subject, they are considered to have failed the licensure process regardless of their final GWA.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
