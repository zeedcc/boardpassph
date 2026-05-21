import React, { useState } from 'react';
import { Layers, CheckCircle2, ChevronRight, HelpCircle, ArrowRight, RotateCw, Smile, Award } from 'lucide-react';
import { Question, UserProfile } from '../types';

interface SpacedRepPanelProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onStartReviewQuiz: (question: Question) => void;
}

export const SpacedRepPanel: React.FC<SpacedRepPanelProps> = ({
  profile,
  setProfile,
  onStartReviewQuiz
}) => {
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);

  // Cleans / removes an item from the spaced repetition deck
  const handleMastered = (idxToRemove: number, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent flipping the card
    setFlippedIndex(null);

    setProfile(prev => {
      const updatedDeck = prev.deck.filter((_, i) => i !== idxToRemove);
      
      // Update local storage backup
      localStorage.setItem(`bp_profile_${prev.email}`, JSON.stringify({
        ...prev,
        deck: updatedDeck
      }));
      return { ...prev, deck: updatedDeck };
    });
  };

  return (
    <div className="space-y-6">
      {/* Intro section */}
      <div className="flex justify-between items-center gap-3 flex-wrap">
        <div>
          <h2 className="font-display text-2xl text-pine">Spaced Repetition Deck</h2>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Missed items from Practice and Mock Exams are compiled here. 
            Review details as flipped flashcards or study them in a practice queue.
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-pine bg-foam border border-pine/10 px-3 py-1.5 rounded-full select-none">
          Active Pool: {profile.deck.length} Items
        </span>
      </div>

      {profile.deck.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-3xl p-16 text-center text-gray-500 max-w-lg mx-auto">
          <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h5 className="font-heading font-black text-gray-700">Perfect Cleared Deck!</h5>
          <p className="text-xs text-gray-400 mt-1">
            Excellent! You currently have zero missed questions. Keep practicing to maintain your diagnostics.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {profile.deck.map((item, idx) => {
            const isFlipped = flippedIndex === idx;

            return (
              <div
                key={idx}
                className="perspective-[1000px] h-[340px] cursor-pointer"
                onClick={() => setFlippedIndex(isFlipped ? null : idx)}
              >
                {/* 3D Flashcard flip container */}
                <div 
                  className={`relative w-full h-full text-left transition-transform duration-500 preserve-3d shadow-sm hover:shadow-md rounded-2xl border border-gray-200/80 ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                >
                  
                  {/* FRONT SIDE (Vignette) */}
                  <div className="absolute inset-0 bg-white p-5 rounded-2xl backface-hidden flex flex-col justify-between overflow-hidden">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center bg-gray-50 p-2 rounded-lg text-[9px] uppercase font-bold text-gray-500 tracking-wider">
                        <span>Card #{idx + 1}</span>
                        <span>{item.category || "Assessment"}</span>
                      </div>
                      <p className="text-xs text-gray-800 leading-relaxed font-sans line-clamp-6 font-medium">
                        {item.vignette}
                      </p>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-gray-400 border-t border-gray-100 pt-3 select-none">
                      <span className="flex items-center gap-1 font-bold">
                        <RotateCw className="w-3 h-3 text-sage" />
                        Click Card to Reveal Explanation
                      </span>
                      
                      <button
                        onClick={(e) => handleMastered(idx, e)}
                        className="px-2.5 py-1 text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200 rounded transition cursor-pointer"
                        title="Removes card from deck review pool"
                      >
                        ✓ Mastery
                      </button>
                    </div>
                  </div>

                  {/* BACK SIDE (Answers & Explanation) */}
                  <div className="absolute inset-0 bg-[#f7fbf8] p-5 rounded-2xl backface-hidden rotate-y-180 flex flex-col justify-between overflow-hidden border-2 border-pine/5">
                    <div className="space-y-3 h-full overflow-y-auto no-scrollbar">
                      <div className="flex justify-between items-center bg-[#deebe3] p-1.5 px-3 rounded-lg text-[9px] uppercase font-black text-[#1e3e29] tracking-wider select-none">
                        <span>High-Yield Rationale</span>
                        <span>✓ Correct Option</span>
                      </div>

                      {/* Correct answer identifier */}
                      <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl flex items-start gap-2 select-none">
                        <Smile className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[8px] uppercase tracking-wider font-extrabold text-emerald-600">Correct Option</span>
                          <p className="text-xs text-emerald-950 font-bold leading-tight mt-0.5">
                            {item.options[item.correctIndex]}
                          </p>
                        </div>
                      </div>

                      {/* explanation text */}
                      <p className="text-[11px] text-gray-600 leading-relaxed font-sans font-medium">
                        {item.explanation}
                      </p>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-gray-400 border-t border-gray-100 pt-3 select-none">
                      <span className="flex items-center gap-1 font-bold">
                        <RotateCw className="w-3 h-3 text-sage" />
                        Click to flip back
                      </span>

                      <button
                        onClick={(e) => handleMastered(idx, e)}
                        className="px-2.5 py-1 text-[9px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200 rounded transition cursor-pointer"
                      >
                        ✓ Mastered
                      </button>
                    </div>

                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Spaced rep custom review stylesheet styles */}
      <style>{`
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        .perspective-\\[1000px\\] {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
};
