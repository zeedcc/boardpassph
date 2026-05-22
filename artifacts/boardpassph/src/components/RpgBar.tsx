import React, { useState } from 'react';
import { Flame, Zap, Percent, ShieldAlert, ShoppingBag, Plus, Sparkles, LogOut } from 'lucide-react';
import { UserProfile } from '../types';

interface RpgBarProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onNavigate: (tabId: string) => void;
  onLogout: () => void;
}

export const RpgBar: React.FC<RpgBarProps> = ({ profile, setProfile, onNavigate, onLogout }) => {
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [shopMsg, setShopMsg] = useState('');

  const XP_LVL = 300;
  const currentLvl = Math.floor(profile.totalXp / XP_LVL) + 1;
  const currentLvlXp = profile.totalXp % XP_LVL;
  const xpPercent = Math.round((currentLvlXp / XP_LVL) * 100);

  const correctPct = profile.attempts > 0 
    ? Math.round((profile.correct / profile.attempts) * 100) 
    : null;

  // Let's implement the shop to purchase Streak Shields
  const buyStreakShield = () => {
    const cost = 250; // XP cost
    if (profile.totalXp < cost) {
      setShopMsg("❌ Insufficient XP. Keep practicing to accumulate at least 250 XP!");
      return;
    }

    setProfile(prev => ({
      ...prev,
      totalXp: prev.totalXp - cost,
      streakShields: prev.streakShields + 1
    }));
    setShopMsg("🎉 Mnemonic Shield Purchased! Your next missed daily study session is fully protected! 🛡️");
  };

  return (
    <div className="bg-gradient-to-r from-foam to-[#deebe3] border-b border-pine/10 px-4 py-3 shadow-sm select-none">
      <div className="max-w-7xl mx-auto space-y-2">
        {/* XP bar row */}
        <div className="flex justify-between items-baseline">
          <span className="font-heading font-black text-pine text-sm uppercase tracking-wider" id="levelTxt">
            Level {currentLvl}
          </span>
          <span className="text-xs font-mono text-pine-light font-bold" id="xpTxt">
            {currentLvlXp} / {XP_LVL} XP ({xpPercent}%)
          </span>
        </div>
        <div className="h-2 w-full bg-pine/10 rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-pine-light to-sage rounded-full transition-all duration-500 ease-out"
            style={{ width: `${xpPercent}%` }}
            id="xpFill"
          />
        </div>

        {/* Single stats + actions row */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-0.5">
          {/* Streak */}
          <div className="flex items-center gap-1 px-2.5 py-1 bg-rose-50/80 border border-rose-100 rounded-full text-rose-700 text-xs font-bold shadow-sm shrink-0" title="Consecutive study days">
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            <span className="font-mono" id="streakLbl">{profile.streak}d</span>
          </div>

          {/* Combo */}
          <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full text-amber-800 text-xs font-bold shadow-sm shrink-0" title="Answer combo multiplier">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-mono" id="comboLbl">{profile.currentCombo}x</span>
          </div>

          {/* Shields */}
          <div
            onClick={() => { setIsShopOpen(true); setShopMsg(''); }}
            className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 border border-blue-200 hover:border-blue-300 rounded-full text-blue-800 text-xs font-bold shadow-sm cursor-pointer hover:bg-blue-100/60 transition-all active:scale-95 shrink-0"
            title="Streak shields — click to buy more"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-blue-500" />
            <span className="font-mono">{profile.streakShields}</span>
          </div>

          {/* Accuracy */}
          <div className="flex items-center gap-1 px-2.5 py-1 bg-teal-50 border border-teal-200 rounded-full text-teal-800 text-xs font-bold shadow-sm shrink-0" title="Overall accuracy">
            <Percent className="w-3 h-3 text-teal-600" />
            <span className="font-mono" id="accLbl">{correctPct !== null ? `${correctPct}%` : '—'}</span>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Shield Shop */}
          <button
            onClick={() => { setIsShopOpen(true); setShopMsg(''); }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 border border-amber-300 text-white font-bold text-xs shadow hover:shadow-md cursor-pointer transition-all active:scale-95 shrink-0"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Shield Shop</span>
          </button>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="text-gray-400 hover:text-rose-600 hover:bg-rose-50/60 p-1.5 rounded-full cursor-pointer transition shrink-0"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* STREAK SHIELD SHOP MODAL */}
      {isShopOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex justify-center items-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl border border-pine/10 p-6 relative overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 to-yellow-400" />
            <div className="flex items-center gap-2 font-display text-lg text-pine mb-3">
              <ShoppingBag className="w-5 h-5 text-amber-500" />
              <h3>Streak Shield & Mnemonic Shop</h3>
            </div>
            
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              Daily streaks prevent study procrastination and solidify memory retention. 
              Keep an emergency <strong>Streak Shield</strong> 🛡️ active in case you miss a day! 
              (They of course prevent streak resets!)
            </p>

            <div className="border border-amber-100 bg-amber-50/40 rounded-xl p-4 flex flex-col gap-3 mb-4">
              <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-amber-100 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-gray-800">Streak Shield 🛡️</h5>
                    <p className="text-[10px] text-gray-400 mt-0.5">Locks &amp; seals your daily streak</p>
                  </div>
                </div>
                <button
                  onClick={buyStreakShield}
                  disabled={profile.totalXp < 250}
                  className="px-3 py-1.5 text-xs font-heading font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-white rounded-lg shadow disabled:opacity-40 select-none cursor-pointer"
                >
                  250 XP
                </button>
              </div>

              <div className="flex justify-between items-center px-2">
                <span className="text-[11px] text-gray-500">Your Current Balance:</span>
                <span className="text-xs font-mono font-bold text-pine-light bg-pine/5 px-2 py-0.5 rounded-full">
                  {profile.totalXp} XP Available
                </span>
              </div>
            </div>

            {shopMsg && (
              <div className={`p-3 rounded-xl border text-xs leading-relaxed mb-4 ${
                shopMsg.startsWith('❌') 
                  ? 'bg-rose-50 border-rose-100 text-rose-800' 
                  : 'bg-emerald-50 border-emerald-100 text-emerald-800 font-medium'
              }`}>
                {shopMsg}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
              <button 
                onClick={() => setIsShopOpen(false)}
                className="px-4 py-2 hover:bg-gray-100 border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg cursor-pointer max-w-max transition-all"
              >
                Close Shop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
