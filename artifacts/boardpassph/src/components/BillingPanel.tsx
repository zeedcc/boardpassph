import React, { useState } from 'react';
import { Award, CheckCircle, Zap, Loader2, ShieldCheck, BookOpen } from 'lucide-react';
import { UserProfile } from '../types';
import { PlanInfographic } from './PlanInfographic';

interface BillingPanelProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

const PLANS = [
  {
    id: 'free-tier',
    name: 'Free',
    price: 0,
    period: 'forever',
    color: 'slate',
    badge: 'Starter',
    description: 'Permanent free access with a minimal daily question allowance.',
    highlight: false,
    features: [
      '1 AI question per day',
      'DSM-5 core trials',
      'Basic XP & streak system',
      'Study planner habits',
    ],
  },
  {
    id: 'trial',
    name: 'Clinical Trial',
    price: 0,
    period: 'trial',
    color: 'gray',
    badge: 'Trial',
    description: 'New reviewees — try the platform with more daily questions.',
    highlight: false,
    features: [
      '3 AI questions per day',
      'DSM-5 core trials',
      'Basic XP & streak system',
      'Limited spaced repetition',
    ],
  },
  {
    id: 'pro',
    name: 'Pro Suite',
    price: 79,
    period: '/mo',
    color: 'amber',
    badge: '★ Best Value',
    description: 'Serious reviewees ready to level up their board prep.',
    highlight: true,
    features: [
      'Unlimited AI practice questions',
      'All PRC board topics index',
      'Adaptive difficulty engine',
      '90s timed sprint drills',
      'Full XP, badges & leaderboard',
      'Standard support',
    ],
  },
  {
    id: 'clinical',
    name: 'Clinical Suite',
    price: 149,
    period: '/mo',
    color: 'rose',
    badge: 'Full Access',
    description: 'Complete clinical arsenal — everything for board domination.',
    highlight: false,
    features: [
      'Everything in Pro',
      '100-item Mock Board Simulator',
      'Pharmacology Q-Pack',
      'Planner & tracker suite',
      'Interactive mnemonics archive',
      'Priority support',
    ],
  },
];

export const BillingPanel: React.FC<BillingPanelProps> = ({ profile, setProfile }) => {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [error, setError] = useState('');

  const currentTier = profile.tier || 'Clinical Trial';
  const isActive = (planId: string) => {
    if (planId === 'free-tier') return currentTier === 'Free';
    if (planId === 'trial') return currentTier === 'Clinical Trial';
    if (planId === 'pro') return currentTier === 'Pro';
    if (planId === 'clinical') return currentTier === 'Clinical';
    return false;
  };

  const handleSubscribe = async (planId: string) => {
    setLoadingPlan(planId);
    setError('');
    setStatusMsg('');

    const planName = PLANS.find(p => p.id === planId)?.name ?? planId;
    let newTier: UserProfile['tier'];
    if (planId === 'free-tier') newTier = 'Free';
    else if (planId === 'trial') newTier = 'Clinical Trial';
    else if (planId === 'pro') newTier = 'Pro';
    else newTier = 'Clinical';

    try {
      setProfile(prev => {
        if (!prev) return prev;
        const updated = { ...prev, tier: newTier };
        localStorage.setItem(`bp_profile_${prev.email}`, JSON.stringify(updated));
        return updated;
      });
      setStatusMsg(`✅ Switched to ${planName}.`);
    } catch {
      setError('Failed to update plan.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="space-y-8">

      <div className="bg-gradient-to-br from-pine to-pine-mid rounded-3xl p-6 text-center relative overflow-hidden shadow-xl border border-pine-light/20">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-mint via-sage to-pine-light" />
        <div className="relative space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/15 rounded-full text-[10px] font-black uppercase tracking-widest text-mint mb-1">
            <ShieldCheck className="w-3 h-3" />
            Current Plan
          </div>
          <div className="font-display text-3xl text-cream tracking-tight">{currentTier}</div>
          <div className="text-[11px] text-mint/60 font-mono">
            {currentTier === 'Pro' ? '₱79 / month · Full board prep suite'
              : currentTier === 'Clinical' ? '₱149 / month · Complete clinical arsenal'
              : 'Free access · Upgrade to unlock full board prep'}
          </div>
        </div>
      </div>

      {statusMsg && (
        <p className="text-xs font-bold px-4 py-3 rounded-xl border text-center bg-emerald-50 border-emerald-200 text-emerald-700">
          {statusMsg}
        </p>
      )}

      {error && (
        <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 px-4 py-3 rounded-xl text-center font-bold">
          {error}
        </p>
      )}

      <div>
        <div className="text-center space-y-1 mb-6">
          <h2 className="font-display text-2xl text-pine">Choose Your Plan</h2>
          <p className="text-xs text-gray-500 font-medium">Select a tier · Plans activate instantly for testing</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {PLANS.map(plan => {
            const active = isActive(plan.id);
            const isAmber = plan.color === 'amber';
            const isRose = plan.color === 'rose';
            const isGray = plan.color === 'gray' || plan.color === 'slate';
            const isFreeOption = plan.id === 'free-tier' || plan.id === 'trial';

            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-3xl p-6 flex flex-col shadow-sm border transition-all hover:-translate-y-0.5 hover:shadow-md ${
                  isAmber ? 'border-2 border-amber-300' :
                  isRose  ? 'border border-rose-200 hover:border-rose-300' :
                  'border border-gray-200 hover:border-gray-300'
                } ${active ? 'ring-2 ring-offset-1 ring-pine/30' : ''}`}
              >
                {isAmber && !active && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[8px] uppercase font-black px-3 py-1 rounded-full shadow">
                    ★ Best Value
                  </div>
                )}
                {active && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-pine text-cream text-[8px] uppercase font-black px-3 py-1 rounded-full shadow">
                    ✓ Active Plan
                  </div>
                )}

                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-2">
                    {isGray  && <BookOpen className="w-4 h-4 text-gray-400" />}
                    {isAmber && <Award className="w-4 h-4 text-amber-500" />}
                    {isRose  && <Zap className="w-4 h-4 text-rose-500 animate-pulse" />}
                    <span className={`text-[9px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                      isAmber ? 'bg-amber-50 text-amber-800 border-amber-200' :
                      isRose  ? 'bg-rose-50 text-rose-800 border-rose-200' :
                      'bg-gray-100 text-gray-600 border-gray-200'
                    }`}>
                      {plan.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display text-xl text-pine">{plan.name}</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">{plan.description}</p>
                  </div>

                  <div className="pb-3 border-b border-gray-50">
                    {plan.price === 0 ? (
                      <span className="font-display text-3xl text-gray-700">Free</span>
                    ) : (
                      <>
                        <span className="font-display text-3xl text-gray-900">₱{plan.price}</span>
                        <span className="text-[10px] font-bold text-gray-400 ml-1">{plan.period}</span>
                      </>
                    )}
                  </div>

                  <ul className="space-y-2">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-[11px] text-gray-600">
                        <CheckCircle className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${
                          isAmber ? 'text-amber-500' : isRose ? 'text-rose-500' : 'text-emerald-400'
                        }`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={!!loadingPlan || active}
                  className={`w-full py-2.5 font-bold text-xs uppercase tracking-widest rounded-xl mt-5 cursor-pointer shadow transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                    active
                      ? 'bg-pine/10 text-pine border border-pine/20'
                      : isAmber
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:shadow-md'
                      : isRose
                      ? 'bg-gradient-to-r from-rose-600 to-red-500 text-white hover:shadow-md'
                      : 'bg-pine text-cream hover:bg-pine-mid'
                  }`}
                >
                  {active ? '✓ Current plan' :
                    loadingPlan === plan.id ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" />Activating…</>
                    ) : (
                      isFreeOption ? `Switch to ${plan.name}` : `Activate ${plan.name}`
                    )
                  }
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-foam/40 border border-sage/10 rounded-2xl p-4 text-center text-sm text-gray-600">
        Plans activate instantly on this device for testing. Online payments are not configured in this build.
      </div>

      <PlanInfographic />

    </div>
  );
};
