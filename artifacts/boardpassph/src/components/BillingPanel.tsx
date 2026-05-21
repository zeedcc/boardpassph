import React, { useState } from 'react';
import { Coins, CheckCircle, Zap, ExternalLink, Loader2, RefreshCw, Info } from 'lucide-react';
import { UserProfile } from '../types';

interface BillingPanelProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

const PACKAGES = [
  {
    id: 'sulit',
    name: 'Sulit',
    price: 50,
    coins: 50000,
    bonus: 0,
    color: 'emerald',
    badge: 'Starter',
    description: 'Perfect for trying out AI practice questions',
    perQ: { budget: 10000, standard: 500, premium: 250 },
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 149,
    coins: 150000,
    bonus: 10000,
    color: 'amber',
    badge: '★ Best Value',
    description: 'Most popular choice for serious reviewees',
    perQ: { budget: 32000, standard: 1600, premium: 800 },
  },
  {
    id: 'clinical',
    name: 'Clinical',
    price: 299,
    coins: 300000,
    bonus: 50000,
    color: 'rose',
    badge: 'Maximum',
    description: 'Full clinical review arsenal for board exam',
    perQ: { budget: 70000, standard: 3500, premium: 1750 },
  },
];

const MODELS = [
  { key: 'budget', label: 'Llama 3.2 Budget', cost: 5, raw: '₱0.005/1k tokens', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { key: 'standard', label: 'Claude Haiku 4.5', cost: 100, raw: '₱0.17/1k tokens', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  { key: 'premium', label: 'Gemini 2.0 Flash', cost: 200, raw: '₱0.30/1k tokens', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
];

export const BillingPanel: React.FC<BillingPanelProps> = ({ profile, setProfile }) => {
  const [loadingPkg, setLoadingPkg] = useState<string | null>(null);
  const [pendingLink, setPendingLink] = useState<{ link_id: string; coins: number; pkg: string } | null>(() => {
    try {
      const s = localStorage.getItem('bp_pending_payment');
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });
  const [verifying, setVerifying] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState('');
  const [error, setError] = useState('');

  const coins = profile.coins ?? 0;

  const handleBuy = async (pkgId: string) => {
    setLoadingPkg(pkgId);
    setError('');
    try {
      const res = await fetch('/api/paymongo/create-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: pkgId, email: profile.email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not create payment link.');
        return;
      }
      const pending = { link_id: data.link_id, coins: data.coins, pkg: pkgId };
      setPendingLink(pending);
      localStorage.setItem('bp_pending_payment', JSON.stringify(pending));
      window.open(data.checkout_url, '_blank');
    } catch {
      setError('Network error — please try again.');
    } finally {
      setLoadingPkg(null);
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
      if (!res.ok) {
        setError(data.error || 'Verification failed.');
        return;
      }
      if (data.paid) {
        setProfile(prev => {
          const updated = { ...prev, coins: (prev.coins ?? 0) + pendingLink.coins };
          localStorage.setItem(`bp_profile_${prev.email}`, JSON.stringify(updated));
          return updated;
        });
        localStorage.removeItem('bp_pending_payment');
        setPendingLink(null);
        setVerifyMsg(`🎉 Payment verified! ${pendingLink.coins.toLocaleString()} coins added to your account.`);
      } else {
        setVerifyMsg(`Payment status: ${data.status || 'unpaid'}. Complete your payment then verify again.`);
      }
    } catch {
      setError('Network error during verification.');
    } finally {
      setVerifying(false);
    }
  };

  const dismissPending = () => {
    setPendingLink(null);
    localStorage.removeItem('bp_pending_payment');
  };

  return (
    <div className="space-y-6">

      {/* Coin balance hero */}
      <div className="bg-gradient-to-br from-pine to-pine-mid rounded-3xl p-6 text-center relative overflow-hidden shadow-xl border border-pine-light/20">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-mint via-sage to-pine-light" />
        <div className="relative space-y-2">
          <Coins className="w-10 h-10 text-yellow-300 mx-auto" />
          <div className="font-display text-4xl text-cream tracking-tight">
            {coins.toLocaleString()}
          </div>
          <div className="text-xs text-mint/70 font-bold uppercase tracking-widest">Coin Balance</div>
          <div className="text-[10px] text-mint/50 font-mono">
            ≈ {Math.floor(coins / 5).toLocaleString()} Budget Qs · {Math.floor(coins / 100).toLocaleString()} Standard Qs · {Math.floor(coins / 200).toLocaleString()} Premium Qs
          </div>
        </div>
      </div>

      {/* Pending payment banner */}
      {pendingLink && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <p className="text-xs font-bold text-amber-800">
              Pending payment detected — {pendingLink.coins.toLocaleString()} coins waiting
            </p>
            <p className="text-[10px] text-amber-700">
              Complete your payment in the checkout tab, then click Verify Payment below.
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

      {/* Packages */}
      <div>
        <div className="text-center space-y-1 mb-5">
          <h2 className="font-display text-2xl text-pine">Buy Coins</h2>
          <p className="text-xs text-gray-500 font-medium">Pay-As-You-Go · No subscriptions · No expiry</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PACKAGES.map(pkg => {
            const totalCoins = pkg.coins + pkg.bonus;
            const isAmber = pkg.color === 'amber';
            const isRose = pkg.color === 'rose';
            return (
              <div
                key={pkg.id}
                className={`relative bg-white rounded-3xl p-6 flex flex-col shadow-sm border transition-all hover:-translate-y-0.5 hover:shadow-md ${
                  isAmber ? 'border-2 border-amber-300' : isRose ? 'border border-rose-200 hover:border-rose-300' : 'border border-gray-200 hover:border-emerald-200'
                }`}
              >
                {isAmber && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[8px] uppercase font-black px-3 py-1 rounded-full shadow">
                    ★ Best Value
                  </div>
                )}

                <div className="space-y-3 flex-1">
                  <span className={`text-[9px] uppercase font-bold px-3 py-1 rounded-full border w-max block ${
                    isAmber ? 'bg-amber-50 text-amber-800 border-amber-200' :
                    isRose ? 'bg-rose-50 text-rose-800 border-rose-200' :
                    'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    {pkg.badge}
                  </span>

                  <div>
                    <h3 className="font-display text-xl text-pine">{pkg.name} Tier</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">{pkg.description}</p>
                  </div>

                  <div className="py-2 border-b border-gray-50">
                    <span className="font-display text-3xl text-gray-900">₱{pkg.price}</span>
                    <span className="text-[9px] font-bold text-gray-400 ml-1">one-time</span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                      <span className="text-sm font-bold text-gray-800">
                        {pkg.coins.toLocaleString()} coins
                      </span>
                    </div>
                    {pkg.bonus > 0 && (
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <span className="text-xs font-bold text-amber-700">+{pkg.bonus.toLocaleString()} bonus coins</span>
                      </div>
                    )}
                    <div className="text-[10px] text-gray-400 font-mono mt-1">
                      Total: {totalCoins.toLocaleString()} coins
                    </div>
                    <ul className="text-[10px] text-gray-500 space-y-0.5 pt-1">
                      <li className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-400" />{pkg.perQ.budget.toLocaleString()} Budget questions</li>
                      <li className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-400" />{pkg.perQ.standard.toLocaleString()} Standard questions</li>
                      <li className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-400" />{pkg.perQ.premium.toLocaleString()} Premium questions</li>
                    </ul>
                  </div>
                </div>

                <button
                  onClick={() => handleBuy(pkg.id)}
                  disabled={!!loadingPkg}
                  className={`w-full py-2.5 font-bold text-xs uppercase tracking-widest rounded-xl mt-5 cursor-pointer shadow transition active:scale-95 flex items-center justify-center gap-2 ${
                    isAmber ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:shadow-md' :
                    isRose ? 'bg-gradient-to-r from-rose-600 to-red-500 text-white hover:shadow-md' :
                    'bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:shadow-md'
                  } disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  {loadingPkg === pkg.id ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" />Creating link…</>
                  ) : (
                    <><ExternalLink className="w-3.5 h-3.5" />Buy via GCash / Card</>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Model pricing table */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <h3 className="font-heading font-black text-pine text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
          <Zap className="w-4 h-4 text-sage" />
          AI Model Coin Pricing
        </h3>
        <div className="space-y-2">
          {MODELS.map(m => (
            <div key={m.key} className={`flex items-center justify-between border rounded-xl px-4 py-3 ${m.bg} ${m.border}`}>
              <div>
                <span className={`text-xs font-bold ${m.color}`}>{m.label}</span>
                <p className="text-[10px] text-gray-400 font-mono">{m.raw}</p>
              </div>
              <div className="text-right">
                <span className={`font-display text-lg ${m.color}`}>{m.cost}</span>
                <span className="text-[10px] text-gray-400 ml-1 font-mono">coins/Q</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-400 font-mono mt-3 text-center">
          Coin cost is charged per question generated. Unused coins never expire.
        </p>
      </div>

      {/* PayMongo note */}
      <div className="bg-[#eaf3ff] border border-blue-200 rounded-2xl p-4 text-center space-y-1">
        <span className="text-[26px] font-black text-[#005CE6] font-display block leading-none">PayMongo</span>
        <p className="text-[10px] text-blue-700 font-medium">
          Secure Philippine payments via GCash, Maya, credit/debit cards &amp; more.
        </p>
        <p className="text-[9px] text-blue-500 font-mono">
          After checkout, click "Verify Payment" to instantly credit your coins.
        </p>
      </div>

    </div>
  );
};
