import React, { useState } from 'react';
import { 
  Award, 
  Check, 
  X, 
  Zap, 
  BookOpen, 
  ShieldCheck, 
  Layers, 
  Calendar, 
  Sparkles, 
  Activity, 
  TrendingUp,
  BrainCircuit,
  Clock
} from 'lucide-react';

interface FeatureItem {
  name: string;
  description: string;
  category: 'practice' | 'simulators' | 'tools' | 'gamification';
  free: boolean | string;
  pro: boolean | string;
  clinical: boolean | string;
}

const COMPARISON_FEATURES: FeatureItem[] = [
  // Practice & Question Pool
  { 
    name: 'Daily Question Allowance', 
    description: 'Number of clinical board questions you can practice per day.',
    category: 'practice',
    free: '3 questions', 
    pro: 'Unlimited', 
    clinical: 'Unlimited' 
  },
  { 
    name: 'DSM-5 Clinical Core Trials', 
    description: 'Basics of diagnostic criteria & mental health classifications.',
    category: 'practice',
    free: true, 
    pro: true, 
    clinical: true 
  },
  { 
    name: 'PRC Board Topics index', 
    description: 'Theories of Personality, Abnormal, Assessment, and Industrial Psych.',
    category: 'practice',
    free: 'Core trial only', 
    pro: true, 
    clinical: true 
  },
  { 
    name: 'Pharmacology Q-Pack', 
    description: 'Advanced clinical Psychopharmacology add-on questions.',
    category: 'practice',
    free: false, 
    pro: false, 
    clinical: true 
  },

  // Simulators & Engine
  { 
    name: 'Adaptive Difficulty Engine', 
    description: 'Paces questions correctly based on your historical error margins.',
    category: 'simulators',
    free: false, 
    pro: true, 
    clinical: true 
  },
  { 
    name: '90s Timed Sprint Drills', 
    description: 'High-speed quick answer board challenges with live countdowns.',
    category: 'simulators',
    free: false, 
    pro: true, 
    clinical: true 
  },
  { 
    name: '100-item Mock Board Simulator', 
    description: 'Strict timer simulation mirroring the authentic PRC Psychometrician atmosphere.',
    category: 'simulators',
    free: false, 
    pro: false, 
    clinical: true 
  },

  // Study Tools
  { 
    name: 'Spaced Repetition Deck', 
    description: 'Auto-compiles clinical errors to review before they fade from memory.',
    category: 'tools',
    free: 'Basic list', 
    pro: true, 
    clinical: true 
  },
  { 
    name: 'Planner & Tracker Suite', 
    description: 'Intelligent monthly schedule matrix, integrated mood calendar, and checklist.',
    category: 'tools',
    free: false, 
    pro: false, 
    clinical: true 
  },
  { 
    name: 'Interactive Mnemonics Archive', 
    description: 'Recall tricks for complex DSM diagnostic codes & theory names.',
    category: 'tools',
    free: false, 
    pro: false, 
    clinical: true 
  },

  // Gamification & Support
  { 
    name: 'Dashboard Stats & XP System', 
    description: 'Earn Experience Points (XP) level-ups, dynamic badges, & track streak values.',
    category: 'gamification',
    free: 'Basic levels', 
    pro: true, 
    clinical: true 
  },
  { 
    name: 'Support & DSM-5 Corrective Auditing', 
    description: 'Priority line to psychometric review coordinators for content clarifications.',
    category: 'gamification',
    free: false, 
    pro: 'Standard Support', 
    clinical: 'Priority Support' 
  },
];

export const PlanInfographic: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'practice' | 'simulators' | 'tools'>('all');

  const filteredFeatures = COMPARISON_FEATURES.filter(item => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  const renderValue = (val: boolean | string, tier: 'free' | 'pro' | 'clinical') => {
    if (typeof val === 'boolean') {
      if (val) {
        return (
          <div className="flex justify-center items-center">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
              tier === 'free' ? 'bg-emerald-100 text-emerald-800' :
              tier === 'pro' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
            }`}>
              <Check className="w-3.5 h-3.5 font-bold" />
            </div>
          </div>
        );
      } else {
        return (
          <div className="flex justify-center items-center opacity-30">
            <X className="w-4 h-4 text-gray-400" />
          </div>
        );
      }
    }
    
    // String content
    return (
      <span className={`text-[10px] font-bold block text-center px-2 py-0.5 rounded-md font-mono ${
        tier === 'free' ? 'bg-gray-100 text-gray-700' :
        tier === 'pro' ? 'bg-amber-50 text-amber-800 border border-amber-100' : 
        'bg-rose-50 text-rose-800 border border-rose-100'
      }`}>
        {val}
      </span>
    );
  };

  return (
    <div className="bg-white border border-pine/10 rounded-2xl p-6 shadow-sm space-y-8 select-none">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-gray-100 pb-5 gap-4">
        <div className="space-y-1">
          <span className="text-[9px] uppercase font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 tracking-wider">
            📊 Infographic Comparative matrix
          </span>
          <h3 className="font-display text-xl text-pine mt-1.5">
            BoardPassPH Blueprint: Free vs. Premium
          </h3>
          <p className="text-[10.5px] text-gray-400 font-mono leading-normal">
            Analyze features and target the perfect plan optimized for your PRC preparation timelines.
          </p>
        </div>

        {/* Category toggles */}
        <div className="flex gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100 self-stretch md:self-auto font-mono text-[9px] font-black uppercase">
          {[
            { id: 'all', label: 'All features' },
            { id: 'practice', label: 'Practice' },
            { id: 'simulators', label: 'Simulators' },
            { id: 'tools', label: 'Study Tools' },
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg transition duration-150 cursor-pointer ${
                activeCategory === cat.id 
                  ? 'bg-pine text-cream font-bold shadow-xs' 
                  : 'text-gray-400 hover:text-pine'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* THREE-WAY TIER SUMMARIES (VISUAL HERO CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* FREE CARD */}
        <div className="bg-gray-50/50 border border-gray-200/60 rounded-xl p-4 space-y-3 relative overflow-hidden">
          <div className="flex items-center gap-1.5 text-gray-400">
            <BookOpen className="w-4 h-4" />
            <h4 className="text-[10px] uppercase font-black tracking-wider font-mono">
              Free Trial
            </h4>
          </div>
          <div className="space-y-1.5">
            <div className="text-xl font-display font-bold text-gray-800">₱0 <span className="text-[10px] text-gray-450 font-normal">forever</span></div>
            <p className="text-[10px] text-gray-400 leading-normal">
              Best for a quick preview of core questions and platform diagnostic feel.
            </p>
          </div>
          {/* Key capability meter */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between items-center text-[8px] font-mono text-gray-400 uppercase font-black">
              <span>Exam Readiness Boost</span>
              <span>15%</span>
            </div>
            <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gray-400 rounded-full" style={{ width: '15%' }} />
            </div>
          </div>
        </div>

        {/* PRO SUITE CARD */}
        <div className="bg-amber-50/20 border border-amber-200 rounded-xl p-4 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-amber-500/10 rounded-bl-full pointer-events-none" />
          <div className="flex items-center gap-1.5 text-amber-700">
            <Award className="w-4 h-4 text-amber-500" />
            <h4 className="text-[10px] uppercase font-black tracking-wider font-mono">
              Pro Suite
            </h4>
          </div>
          <div className="space-y-1.5">
            <div className="text-xl font-display font-bold text-amber-950">₱299 <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded font-semibold">LIFETIME</span></div>
            <p className="text-[10px] text-amber-800/80 leading-normal italic font-serif">
              "Pay once, pass once. Use it until your board exam — no subscriptions, no stress."
            </p>
          </div>
          {/* Key capability meter */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between items-center text-[8px] font-mono text-amber-700 uppercase font-black">
              <span>Exam Readiness Boost</span>
              <span>75%</span>
            </div>
            <div className="h-1 w-full bg-amber-200 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: '75%' }} />
            </div>
          </div>
        </div>

        {/* CLINICAL SUITE CARD */}
        <div className="bg-rose-50/30 border border-rose-200 rounded-xl p-4 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-rose-500/10 rounded-bl-full pointer-events-none" />
          <div className="flex items-center gap-1.5 text-rose-700">
            <Zap className="w-4 h-4 text-rose-500 animate-pulse" />
            <h4 className="text-[10px] uppercase font-black tracking-wider font-mono animate-pulse">
              Clinical Suite
            </h4>
          </div>
          <div className="space-y-1.5">
            <div className="text-xl font-display font-bold text-rose-950">₱549 <span className="text-[10px] text-rose-800 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded font-semibold">LIFETIME</span></div>
            <p className="text-[10px] text-rose-800/80 leading-normal italic font-serif">
              "Pay once, pass once. Use it until your board exam — no subscriptions, no stress."
            </p>
          </div>
          {/* Key capability meter */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between items-center text-[8px] font-mono text-rose-700 uppercase font-black">
              <span>Exam Readiness Boost</span>
              <span>100%</span>
            </div>
            <div className="h-1 w-full bg-rose-200 rounded-full overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
        </div>

      </div>

      {/* INTERACTIVE FEATURE COMPANION COMPARATOR DIRECT GRID */}
      <div className="border border-gray-150 rounded-2xl overflow-hidden shadow-xs">
        
        {/* Table Head */}
        <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-150 p-3 text-[10px] font-mono font-black uppercase text-gray-500 select-none">
          <div className="col-span-6 text-left">Feature Details &amp; Objectives</div>
          <div className="col-span-2 text-center">Free Trial</div>
          <div className="col-span-2 text-center">Pro Suite</div>
          <div className="col-span-2 text-center">Clinical</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100">
          {filteredFeatures.map((feat, fIdx) => (
            <div 
              key={`${feat.name}-${fIdx}`}
              className="grid grid-cols-12 p-3.5 hover:bg-gray-50/50 transition duration-100 items-center gap-1"
            >
              {/* Feature info */}
              <div className="col-span-6 space-y-0.5 pr-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-gray-800 tracking-tight">{feat.name}</span>
                  {feat.category === 'simulators' && (
                    <span className="text-[7.5px] uppercase font-mono bg-indigo-50 text-[#382B6B] border border-indigo-100 px-1.5 py-0.2 rounded-md font-bold">Simulator</span>
                  )}
                  {feat.category === 'tools' && (
                    <span className="text-[7.5px] uppercase font-mono bg-teal-50 text-teal-800 border border-teal-100 px-1.5 py-0.2 rounded-md font-bold">Workspace Tools</span>
                  )}
                </div>
                <p className="text-[9.5px] text-gray-400 font-mono leading-relaxed max-w-md">{feat.description}</p>
              </div>

              {/* Tiers values and markers */}
              <div className="col-span-2 text-center">
                {renderValue(feat.free, 'free')}
              </div>
              <div className="col-span-2 text-center">
                {renderValue(feat.pro, 'pro')}
              </div>
              <div className="col-span-2 text-center">
                {renderValue(feat.clinical, 'clinical')}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* ROI & CONFIDENCE INDEX STATS COMPONENT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 border border-pine/10 bg-foam/15 rounded-xl p-4 divide-y lg:divide-y-0 lg:divide-x divide-gray-150">
        
        <div className="py-2 lg:py-0 lg:px-4 text-center space-y-1.5">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600">
            <TrendingUp className="w-4 h-4" />
          </div>
          <h5 className="text-[11px] font-black uppercase text-gray-700 font-mono">Passing Confidence Index</h5>
          <div className="text-2xl font-black font-mono text-emerald-600 leading-none">94.8%</div>
          <p className="text-[9.5px] text-gray-400 leading-normal font-mono">
            Pro and Clinical review cohorts reported a 32% absolute increase in situational decision confidence.
          </p>
        </div>

        <div className="pt-3 lg:pt-0 lg:px-4 text-center space-y-1.5">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-50 text-amber-600">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <h5 className="text-[11px] font-black uppercase text-gray-700 font-mono">Diagnostic Pacing Boost</h5>
          <div className="text-2xl font-black font-mono text-amber-600 leading-none">2.4x Faster</div>
          <p className="text-[9.5px] text-gray-400 leading-normal font-mono">
            90s timed sprints and 100-item Mock trials condition candidates to handle double-option board curves quickly.
          </p>
        </div>

        <div className="pt-3 lg:pt-0 lg:px-4 text-center space-y-1.5">
          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-rose-50 text-rose-500">
            <Clock className="w-4 h-4" />
          </div>
          <h5 className="text-[11px] font-black uppercase text-gray-700 font-mono">Retention Stability</h5>
          <div className="text-2xl font-black font-mono text-rose-500 leading-none">35 Days</div>
          <p className="text-[9.5px] text-gray-400 leading-normal font-mono">
            Spaced Repetition and Habit matrix systems extend psychological construct recall past clinical exam days.
          </p>
        </div>

      </div>

    </div>
  );
};
