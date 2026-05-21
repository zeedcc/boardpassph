import React, { useState, useMemo } from 'react';
import { Search, Sparkles, BookOpen, Clock, Activity, Target, Award, ListFilter, HelpCircle } from 'lucide-react';
import { CATEGORIES, TESTS } from '../data/tests';
import { PsychologyTest, Question } from '../types';
import { generateLocalQuestionForTest } from '../utils/questionGenerator';

interface LibraryPanelProps {
  onPracticeTest: (question: Question) => void;
}

export const LibraryPanel: React.FC<LibraryPanelProps> = ({ onPracticeTest }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);
  const [activeTest, setActiveTest] = useState<PsychologyTest | null>(null);

  // Filter list of tests
  const filteredTests = useMemo(() => {
    return TESTS.filter(t => {
      const matchSearch = 
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.developer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.factorsMeasured.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchCat = selectedCatId ? t.category === selectedCatId : true;
      return matchSearch && matchCat;
    });
  }, [searchQuery, selectedCatId]);

  const handleLaunchPractice = (test: PsychologyTest) => {
    // Generate a test-specific question
    const seed = Math.floor(Math.random() * 100);
    const mockQ = generateLocalQuestionForTest(test, seed);
    onPracticeTest(mockQ);
  };

  return (
    <div className="space-y-6">
      {/* Intro branding */}
      <div>
        <h2 className="font-display text-2xl text-pine">Psychological Assessment Encyclopedia</h2>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
          Study and practice the PRC Psychometrician board-mandatory clinical tests, cognitive batteries, lifespans, and specialized scales. 
          Tap on any profile to review its parameters, or launch a dedicated practice multiple choice exam!
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tests by name, developer, subscales, or clinical purpose..."
            className="w-full bg-white border border-gray-200 focus:border-sage focus:ring-3 focus:ring-sage/10 pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium placeholder-gray-400 outline-none transition-all"
          />
        </div>

        {/* Category filtering selection */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar md:pb-0">
          <button
            onClick={() => setSelectedCatId(null)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer select-none ${
              selectedCatId === null 
                ? 'bg-pine text-white' 
                : 'bg-white border border-gray-200 text-gray-600 hover:border-sage'
            }`}
          >
            All Scales ({TESTS.length})
          </button>
          {CATEGORIES.map(cat => {
            const count = TESTS.filter(t => t.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCatId(cat.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer select-none ${
                  selectedCatId === cat.id 
                    ? 'bg-pine text-white' 
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-sage'
                }`}
              >
                {cat.name.split('.')[1] || cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTests.map(test => (
          <div 
            key={test.id}
            className="bg-white border border-gray-200 rounded-2xl hover:shadow-lg hover:border-sage/40 hover:-translate-y-0.5 p-4 flex flex-col justify-between transition-all duration-200 ease-out relative group"
          >
            <div className="space-y-3">
              {/* Card Badge header */}
              <div className="flex justify-between items-start gap-2">
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100">
                  {test.category}
                </span>
                <span className="text-[9px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100 font-mono font-bold">
                  {test.administration.type}
                </span>
              </div>

              {/* Title & Developer */}
              <div>
                <h4 className="font-heading font-black text-gray-900 text-sm tracking-tight leading-snug group-hover:text-pine transition-colors">
                  {test.name}
                </h4>
                <p className="text-[10px] text-gray-400 font-medium italic mt-0.5">
                  by {test.developer}
                </p>
              </div>

              {/* Intended purpose */}
              <p className="text-xs text-gray-600 font-medium line-clamp-2">
                {test.purpose}
              </p>

              {/* Quick statistics row */}
              <div className="grid grid-cols-2 gap-2 bg-gray-50/70 p-2.5 rounded-xl border border-gray-100/50 text-[10px]">
                <div>
                  <span className="text-gray-400 block font-bold uppercase tracking-wider text-[8px]">Administration</span>
                  <span className="text-gray-700 font-semibold truncate block mt-0.5">{test.administration.time}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-bold uppercase tracking-wider text-[8px]">Total Items</span>
                  <span className="text-gray-700 font-semibold truncate block mt-0.5">{test.administration.items} Items</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-gray-100">
              <button
                onClick={() => setActiveTest(test)}
                className="px-3 py-1.5 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold rounded-lg cursor-pointer transition active:scale-95 text-center"
              >
                📖 Study Detail
              </button>
              <button
                onClick={() => handleLaunchPractice(test)}
                className="px-3 py-1.5 bg-gradient-to-r from-pine to-pine-mid text-white text-xs font-bold rounded-lg cursor-pointer shadow-sm hover:shadow active:scale-95 transition text-center"
              >
                🎯 Practice test
              </button>
            </div>
          </div>
        ))}

        {filteredTests.length === 0 && (
          <div className="col-span-full bg-white border border-dashed border-gray-200 rounded-3xl p-12 text-center text-gray-500">
            <HelpCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h5 className="font-bold text-gray-700">No Assessment Scales Found</h5>
            <p className="text-xs text-gray-400 mt-1">Try refining your search keyword or clearing the filter.</p>
          </div>
        )}
      </div>

      {/* FULL RECORD MODAL POPUP */}
      {activeTest && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-xs z-[1500] flex justify-center items-center p-4 animate-in fade-in duration-100">
          <div className="bg-white max-w-2xl w-full rounded-2xl shadow-2xl border border-pine/10 p-6 relative max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setActiveTest(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-pine p-1 text-xl leading-none font-bold bg-gray-50 hover:bg-gray-100 rounded-full transition cursor-pointer select-none"
            >
              &times;
            </button>

            {/* Test detail heading */}
            <div className="border-b border-gray-100 pb-4 mb-4 space-y-2">
              <span className="text-[10px] uppercase font-black text-rose-600 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full">
                Encyclopedia Entry
              </span>
              <h3 className="font-display text-2xl text-pine tracking-tight leading-tight mt-1">
                {activeTest.name}
              </h3>
              <p className="text-xs text-gray-400 italic">
                First standardized by: {activeTest.developer} (Versions: {activeTest.versions})
              </p>
            </div>

            {/* Test attributes detail fields */}
            <div className="space-y-4">
              {/* Purpose */}
              <div className="space-y-1">
                <h5 className="text-[10px] uppercase tracking-wider font-extrabold text-pine-light">Clinical Assessment Purpose</h5>
                <p className="text-xs text-gray-700 leading-relaxed font-semibold bg-gray-50 p-2.5 rounded-lg">
                  {activeTest.purpose}
                </p>
              </div>

              {/* Factors Measured */}
              <div className="space-y-1">
                <h5 className="text-[10px] uppercase tracking-wider font-extrabold text-pine-light">Factors & Subscales Measured</h5>
                <p className="text-xs text-gray-700 leading-relaxed bg-gray-50 p-2.5 rounded-lg border-l-2 border-sage">
                  {activeTest.factorsMeasured}
                </p>
              </div>

              {/* Administration details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="border border-gray-100 rounded-xl p-2.5 text-center">
                  <span className="text-[8px] text-gray-400 block font-bold uppercase tracking-widest">Age Parameters</span>
                  <span className="text-xs text-gray-700 font-bold block mt-0.5">{activeTest.administration.ageRange}</span>
                </div>
                <div className="border border-gray-100 rounded-xl p-2.5 text-center">
                  <span className="text-[8px] text-gray-400 block font-bold uppercase tracking-widest">Time Constraint</span>
                  <span className="text-xs text-gray-700 font-bold block mt-0.5">{activeTest.administration.time}</span>
                </div>
                <div className="border border-gray-100 rounded-xl p-2.5 text-center">
                  <span className="text-[8px] text-gray-400 block font-bold uppercase tracking-widest">Required Training</span>
                  <span className="text-xs text-gray-700 font-bold block mt-0.5 text-teal-700">{activeTest.administration.trainingNeeded}</span>
                </div>
              </div>

              {/* Scoring and Interpretation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-0.5 border border-teal-100 bg-teal-50/20 rounded-xl p-3">
                  <h5 className="text-[9px] uppercase tracking-widest font-extrabold text-teal-800">Scoring Mechanism</h5>
                  <p className="text-xs text-gray-700 leading-relaxed font-medium mt-1">
                    {activeTest.scoring}
                  </p>
                </div>
                <div className="space-y-0.5 border border-indigo-100 bg-indigo-50/20 rounded-xl p-3">
                  <h5 className="text-[9px] uppercase tracking-widest font-extrabold text-indigo-800">Standard Interpretation</h5>
                  <p className="text-xs text-gray-700 leading-relaxed font-medium mt-1">
                    {activeTest.interpretation}
                  </p>
                </div>
              </div>

              {/* Mnemonic rule if exists */}
              {activeTest.mnemonics && (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex gap-2">
                  <span className="text-base select-none">💡</span>
                  <div>
                    <h6 className="text-[9px] uppercase font-bold text-amber-800 tracking-wider">High Yield Study Mnemonic</h6>
                    <p className="text-xs text-amber-900 leading-relaxed font-semibold font-mono mt-0.5">
                      {activeTest.mnemonics}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer triggers */}
            <div className="flex justify-end gap-2.5 mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => setActiveTest(null)}
                className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-lg cursor-pointer"
              >
                Close Profile
              </button>
              <button
                onClick={() => {
                  const t = activeTest;
                  setActiveTest(null);
                  handleLaunchPractice(t);
                }}
                className="px-4 py-2 bg-pine text-white text-xs font-bold rounded-lg cursor-pointer hover:bg-pine-mid hover:shadow-md transition"
              >
                Launch Mock Question →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
