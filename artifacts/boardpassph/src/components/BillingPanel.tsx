import React, { useState } from 'react';
import { Award, CheckCircle, ArrowRight, Wallet, Copy, Check, Info } from 'lucide-react';
import { UserProfile } from '../types';
import { PlanInfographic } from './PlanInfographic';

interface BillingPanelProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

export const BillingPanel: React.FC<BillingPanelProps> = ({ profile, setProfile }) => {
  const [selectedTier, setSelectedTier] = useState<'Pro' | 'Clinical' | null>(null);
  const [copied, setCopied] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [gainedMessage, setGainedMessage] = useState('');

  const launchGCashCheckout = (tier: 'Pro' | 'Clinical') => {
    setSelectedTier(tier);
    setCopied(false);
    setIsCheckoutOpen(true);
    setGainedMessage('');
  };

  const handleCopyNo = () => {
    navigator.clipboard.writeText('09763333248');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simulates an immediate, premium upgrade for sandbox test verification
  const handleInstantUpgrade = () => {
    if (!selectedTier) return;
    setProfile(prev => {
      const updated = {
        ...prev,
        tier: selectedTier
      };
      localStorage.setItem(`bp_profile_${prev.email}`, JSON.stringify(updated));
      return updated;
    });
    setGainedMessage(`🎉 Verification upgrade simulated! Your account is officially upgraded to ${selectedTier} Suite!`);
  };

  return (
    <div className="space-y-6">
      {/* Intro info */}
      <div className="text-center space-y-3 select-none">
        <h2 className="font-display text-3xl text-pine">Unlock All Study Matrices</h2>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#fef3c7] border border-amber-200 text-amber-950 text-[10px] font-bold mx-auto">
          <span>🏷️ Lifetime Value Promo: No subscriptions, no stress.</span>
        </div>
        <p className="text-xs text-pine-mid font-medium max-w-lg mx-auto italic font-serif">
          "Pay once, pass once. Use it until your board exam — no subscriptions, no stress."
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch pt-2 max-w-7xl mx-auto w-full">
        
        {/* FREE PLAN */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200 content-start">
          <div className="space-y-4">
            <span className="text-[9px] uppercase font-bold text-gray-400 bg-gray-50 border border-gray-100 px-3 py-1 rounded-full w-max block">Basic entry</span>
            <div>
              <h3 className="font-display text-xl text-pine">Free</h3>
              <p className="text-[10px] text-gray-400 mt-0.5 font-medium leading-none">Diagnostic core trials</p>
            </div>
            
            <div className="py-2 border-b border-gray-50">
              <span className="font-display text-3xl text-gray-900 tracking-tight">₱0</span>
              <span className="text-xs text-gray-400 font-medium ml-1">forever</span>
            </div>

            <ul className="space-y-2.5 text-xs text-gray-600 font-medium">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>3 Practice Qs / day limit</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>DSM-5 clinical core trials</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300 pointer-events-none line-through">
                <CheckCircle className="w-4 h-4 text-gray-200 flex-shrink-0 mt-0.5" />
                <span>Psychopharmacology Addons</span>
              </li>
              <li className="flex items-start gap-2 text-gray-300 pointer-events-none line-through">
                <CheckCircle className="w-4 h-4 text-gray-200 flex-shrink-0 mt-0.5" />
                <span>100-Question Mock Board Simulator</span>
              </li>
            </ul>
          </div>

          <button
            disabled={profile.tier === 'Free'}
            className="w-full py-2.5 bg-gray-100 hover:bg-gray-100 text-gray-400 text-xs font-bold rounded-xl mt-6 pointer-events-none text-center block"
          >
            {profile.tier === 'Free' ? '✓ Registered Pool' : 'Standard Baseline'}
          </button>
        </div>

        {/* PRO PLAN */}
        <div className="bg-white border-2 border-amber-300 rounded-3xl p-6 flex flex-col justify-between shadow-md relative group hover:-translate-y-0.5 transition-all duration-200">
          <div className="absolute top-0 right-6 -translate-y-1/2 bg-amber-500 text-white text-[8px] uppercase tracking-widest font-black px-3 py-1 rounded-full border border-amber-300 shadow shadow-amber-900/15">
            ★ Lifetime Pass
          </div>

          <div className="space-y-4">
            <span className="text-[9px] uppercase font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full w-max block">Review suite</span>
            <div>
              <h3 className="font-display text-xl text-pine">Pro Suite</h3>
              <p className="text-[10px] text-gray-400 mt-0.5 font-medium leading-none">Complete PRC subjects index</p>
            </div>
            
            <div className="py-2 border-b border-amber-50">
              <span className="font-display text-3xl text-gray-900 tracking-tight">₱299</span>
              <span className="text-[9px] font-black text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded ml-1">LIFETIME ACCESS</span>
              <p className="text-[9px] font-serif text-amber-950 italic mt-1 leading-normal">
                "Pay once, pass once. Use it until your board exam — no subscriptions, no stress."
              </p>
            </div>

            <ul className="space-y-2.5 text-xs text-gray-600 font-medium font-sans">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>Unlimited clinical questions daily</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>All core DSM chapters + PRC subjects</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>Adaptive Difficulty Engine</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span>90s Timed Study Sprints</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => launchGCashCheckout('Pro')}
            className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl mt-6 cursor-pointer select-none shadow hover:shadow-md transition active:scale-95 text-center block"
          >
            {profile.tier === 'Pro' ? '✓ Active Plan' : 'Purchase Pro Suite'}
          </button>
        </div>

        {/* CLINICAL SUITE */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 flex flex-col justify-between shadow-sm hover:shadow-md hover:border-rose-200 hover:-translate-y-0.5 transition-all duration-200">
          <div className="space-y-4">
            <span className="text-[9px] uppercase font-bold text-rose-800 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full w-max block">Maximum Mastery</span>
            <div>
              <h3 className="font-display text-xl text-pine">Clinical Suite</h3>
              <p className="text-[10px] text-gray-400 mt-0.5 font-medium leading-none">Unlimited diagnostic simulators</p>
            </div>
            
            <div className="py-2 border-b border-gray-50">
              <span className="font-display text-3xl text-gray-900 tracking-tight">₱549</span>
              <span className="text-[9px] font-black text-rose-800 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded ml-1">LIFETIME ACCESS</span>
              <p className="text-[9px] font-serif text-rose-950 italic mt-1 leading-normal">
                "Pay once, pass once. Use it until your board exam — no subscriptions, no stress."
              </p>
            </div>

            <ul className="space-y-2.5 text-xs text-gray-600 font-medium font-sans">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <span className="font-semibold text-rose-950">Everything in Pro tier</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <span>Pharmacology Add-On Pack Qs</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <span>100-Question Board Exam Simulator</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <span>Planner &amp; Study Trackers Matrix</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <span>Mnemonics on Demand &amp; Duels</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => launchGCashCheckout('Clinical')}
            className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-red-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl mt-6 cursor-pointer select-none shadow hover:shadow-md transition active:scale-95 text-center block"
          >
            {profile.tier === 'Clinical' ? '✓ Active Plan' : 'Purchase Clinical plan'}
          </button>
        </div>

      </div>

      {/* Plan Infographic Highlights */}
      <PlanInfographic />

      {/* SECURE GCASH GATEWAY POPUP POPUP */}
      {isCheckoutOpen && selectedTier && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex justify-center items-center p-4">
          <div className="bg-white max-w-sm w-full rounded-2xl shadow-2xl p-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-120">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#005CE6]" />
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-[#005CE6] p-1 shadow-inner bg-gray-50 rounded-full font-bold select-none cursor-pointer"
            >
              &times;
            </button>

            {/* GCash Logo */}
            <div className="text-center pb-4 border-b border-gray-100 select-none">
              <span className="text-[26px] font-black text-[#005CE6] font-display">GCash</span>
              <span className="text-xs text-gray-400 font-semibold block leading-none mt-1">Registry Secure Payment</span>
            </div>

            {/* Pricing specs */}
            <div className="space-y-4 pt-4">
              <div className="bg-gray-50 border border-gray-100 p-3.5 rounded-lg text-left select-none">
                <span className="text-[8px] uppercase tracking-wider font-extrabold text-gray-400 block pb-0.5">Purchasing details</span>
                <span className="font-heading font-black text-xs text-gray-800 block">{selectedTier} Suite Selection</span>
                <span className="font-display text-xl text-gray-900 tracking-tight block mt-0.5">
                  ₱{selectedTier === 'Pro' ? '299' : '549'} (One-Time Lifetime Pass)
                </span>
                <p className="text-[9px] text-gray-500 italic mt-1 font-serif">
                  "Pay once, pass once. Use it until your board exam — no subscriptions, no stress."
                </p>
              </div>

              {/* QR / Account number details */}
              <div className="bg-[#eaf3ff] border border-blue-200 p-4 rounded-xl text-center relative space-y-1 select-none">
                <span className="text-[8px] uppercase font-black text-[#005ce6] block tracking-widest mb-1">Transfer GCash amount to</span>
                <span className="font-display text-2xl text-[#005ce6] tracking-widest block font-mono font-black select-all">
                  0976 333 3248
                </span>
                <span className="text-[10px] text-blue-800 font-semibold block">Receiver: DEDC</span>
              </div>

              {/* Instruction parameters */}
              <div className="bg-amber-50/20 border border-amber-100 rounded-xl p-3.5 flex gap-2">
                <div className="text-xs leading-relaxed text-amber-950 font-normal leading-normal font-sans">
                  <strong className="text-amber-800 font-bold">Important Instructions:</strong>
                  <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                    1. Send the amount to the registered GCash account above.<br />
                    2. Take a screenshot of your transfer transaction.<br />
                    3. Send the image to <strong className="text-[#005ce6]">dsmind.pmle@gmail.com</strong> along with your account email.<br />
                    4. Upgrades are cleared and verified within 24 hours.
                  </p>
                </div>
              </div>



              {/* Copy and Close buttons */}
              <div className="flex gap-1.5 justify-end items-center select-none mt-2">
                <button
                  onClick={handleCopyNo}
                  className="px-3 py-2 border border-[#005ce6]/20 bg-[#005ce6]/5 text-[#005ce6] text-[10px] font-bold rounded-lg cursor-pointer flex items-center gap-1 transition"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copied ? 'Copied' : 'Copy No'}</span>
                </button>
                <button
                  onClick={() => setIsCheckoutOpen(false)}
                  className="px-3 py-2 hover:bg-gray-100 border border-gray-200 text-gray-600 text-[10px] font-bold rounded-lg cursor-pointer"
                >
                  Close
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
