import React, { useState } from 'react';
import { Award, CheckCircle, Zap, ExternalLink, Loader2, RefreshCw, Info, ShieldCheck, BookOpen } from 'lucide-react';
import { UserProfile } from '../types';
import { PlanInfographic } from './PlanInfographic';

interface PendingLink {
  link_id: string;
  plan: 'pro' | 'clinical';
  planName: string;
}

interface BillingPanelProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

const PLANS = [
  {
    id: 'free',
    name: 'Clinical Trial',
    price: 0,
    period: 'forever',
    color: 'gray',
    badge: 'Free',
    description: 'Try the platform with limited daily questions.',
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
  const [verifying, setVerifying] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState('');
  const [error, setError] = useState('');
  const [pendingLink, setPendingLink] = useState<PendingLink | null>(null);

  const currentTier = profile.tier || 'Clinical Trial';
  const isActive = (planId: string) => {
    if (planId === 'free') return currentTier === 'Clinical Trial' || currentTier === 'Free';
    if (planId === 'pro') return currentTier === 'Pro';
    if (planId === 'clinical') return currentTier === 'Clinical';
    return false;
  };

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') return;
    setLoadingPlan(planId);
    setError('');
    try {
      // PayMongo removed — activate plan locally for now
      const planName = PLANS.find(p => p.id === planId)?.name ?? planId;
      const newTier = planId === 'pro' ? 'Pro' : 'Clinical';
      setProfile(prev => {
        if (!prev) return prev;
        const updated = { ...prev, tier: newTier as UserProfile['tier'] };
        localStorage.setItem(`bp_profile_${prev.email}`, JSON.stringify(updated));
        return updated;
      });
      setVerifyMsg(`✅ Subscribed locally to ${planName}. (Payments removed)`);
    } catch {
      setError('Failed to activate plan locally.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleVerify = async () => {
    if (!pendingLink) return;
    setVerifying(true);
    setVerifyMsg('');
    setError('');
    try {
      const res = await fetch('/api/paymongo/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link_id: pendingLink.link_id, email: profile.email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Verification failed.'); return; }
      if (data.paid) {
        const newTier = pendingLink.plan === 'pro' ? 'Pro' : 'Clinical';
        setProfile(prev => {
          if (!prev) return prev;
          const updated = { ...prev, tier: newTier as UserProfile['tier'] };
          localStorage.setItem(`bp_profile_${prev.email}`, JSON.stringify(updated));
          return updated;
        });
        localStorage.removeItem('bp_pending_sub');
        setPendingLink(null);
        setVerifyMsg(`🎉 Subscription activated! You're now on ${pendingLink.planName}.`);
      } else {
        setVerifyMsg(`Payment status: ${data.status || 'unpaid'}. Complete checkout then verify again.`);
      }
    } catch {
      setError('Network error during verification.');
    } finally {
      setVerifying(false);
    }
  };

  const dismissPending = () => {};

  return (
    <div className="space-y-8">

      {/* Current tier hero */}
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

      {/* Pending payment banner */}
      {pendingLink && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <p className="text-xs font-bold text-amber-800">
              Pending payment — {pendingLink.planName} subscription
            </p>
            <p className="text-[10px] text-amber-700">
              Complete checkout in the new tab, then click Verify below to activate your plan.
            </p>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleVerify}
                disabled={verifying}
                className="px-4 py-1.5 bg-amber-500 text-white text-[10px] font-bold rounded-lg cursor-pointer hover:bg-amber-600 transition flex items-center gap-1.5"
              >
                {verifying ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                Verify Payment
              </button>
              <button onClick={dismissPending} className="px-3 py-1.5 border border-amber-200 text-amber-700 text-[10px] font-bold rounded-lg cursor-pointer hover:bg-amber-100 transition">
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {verifyMsg && (
        <p className={`text-xs font-bold px-4 py-3 rounded-xl border text-center ${verifyMsg.startsWith('🎉') ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
          {verifyMsg}
        </p>
      )}

      {error && (
        <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 px-4 py-3 rounded-xl text-center font-bold">
          {error}
        </p>
      )}

      {/* Plan cards */}
      <div>
          <div className="text-center space-y-1 mb-6">
            <h2 className="font-display text-2xl text-pine">Choose Your Plan</h2>
            <p className="text-xs text-gray-500 font-medium">Monthly subscription · Cancel anytime</p>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map(plan => {
            const active = isActive(plan.id);
            const isAmber = plan.color === 'amber';
            const isRose = plan.color === 'rose';
            const isGray = plan.color === 'gray';

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

                {plan.id === 'free' ? (
                  <div className={`w-full py-2.5 text-center font-bold text-xs uppercase tracking-widest rounded-xl mt-5 border ${
                    active ? 'bg-pine/5 border-pine/20 text-pine' : 'bg-gray-50 border-gray-200 text-gray-400'
                  }`}>
                    {active ? 'Current Plan' : 'No action needed'}
                  </div>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={!!loadingPlan || active}
                    className={`w-full py-2.5 font-bold text-xs uppercase tracking-widest rounded-xl mt-5 cursor-pointer shadow transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                      active
                        ? 'bg-pine/10 text-pine border border-pine/20'
                        : isAmber
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:shadow-md'
                        : 'bg-gradient-to-r from-rose-600 to-red-500 text-white hover:shadow-md'
                    }`}
                  >
                    {active ? '✓ Subscribed' :
                      loadingPlan === plan.id ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" />Creating link…</>
                      ) : (
                        <><ExternalLink className="w-3.5 h-3.5" />Subscribe via GCash / Card</>
                      )
                    }
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Payments removed: subscriptions activate locally for testing */}
      <div className="bg-foam/40 border border-sage/10 rounded-2xl p-4 text-center text-sm text-gray-600">
        Payments integration removed for this build. Subscriptions activate locally for testing purposes.
      </div>

      {/* Plan comparison infographic */}
      <PlanInfographic />

    </div>
  );
};
