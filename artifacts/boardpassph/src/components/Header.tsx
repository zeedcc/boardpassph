import React, { useState } from 'react';
import { Award, BookOpen, Palette, Check, Cloud, RefreshCw } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  profile: UserProfile;
  onNavigate: (tabId: string) => void;
  theme: string;
  onThemeChange: (newTheme: string) => void;
  syncStatus?: 'syncing' | 'synced';
}

const THEME_OPTIONS = [
  { id: 'strawberry-matcha', name: 'Strawberry Matcha', emoji: '🍓🍵', bg: 'bg-[#1B3518]', accent: 'bg-[#E5526C]' },
  { id: 'lilac-dream', name: 'Lilac Dream', emoji: '💜🦄', bg: 'bg-[#261B4E]', accent: 'bg-[#9C85E5]' },
  { id: 'winter', name: 'Winter Frost', emoji: '❄️☃️', bg: 'bg-[#0F2038]', accent: 'bg-[#50A3EF]' },
  { id: 'pastel-pink-coquette', name: 'Pastel Coquette', emoji: '🎀🩰', bg: 'bg-[#401B22]', accent: 'bg-[#EC9FA5]' },
  { id: 'red-blush', name: 'Red Blush', emoji: '🌹💄', bg: 'bg-[#470D14]', accent: 'bg-[#F43F5E]' }
];

export const Header: React.FC<HeaderProps> = ({ profile, onNavigate, theme, onThemeChange, syncStatus = 'synced' }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getTierColor = () => {
    switch (profile.tier?.toLowerCase()) {
      case 'clinical':
      case 'clinical trial':
        return 'bg-gradient-to-r from-red-600 to-rose-500 shadow-md shadow-rose-900/10 border-rose-300';
      case 'pro':
        return 'bg-gradient-to-r from-amber-600 to-yellow-500 shadow-md shadow-amber-900/10 border-yellow-300';
      default:
        return 'bg-gradient-to-r from-teal-700 to-emerald-600 border-teal-300';
    }
  };

  return (
    <header className="relative bg-gradient-to-br from-pine to-[#091b14] overflow-hidden px-6 py-8 border-b border-pine-mid">
      {/* Decorative vectors */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:32px_32px]"
      />
      <div className="absolute -top-24 -right-12 w-64 h-64 rounded-full bg-sage/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-12 w-48 h-48 rounded-full bg-rose-500/5 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-4 max-w-7xl mx-auto w-full">
        {/* Branding Title */}
        <div className="flex items-center gap-3 select-none">
          <div className="p-3 bg-teal-900/50 rounded-2xl border border-teal-500/20 shadow-inner">
            <BookOpen className="w-8 h-8 text-mint" />
          </div>
          <div>
            <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-sage">PRC Psychometrician & Board Review</span>
            <h1 className="font-display text-4xl text-cream tracking-tight leading-none mt-1">
              Board<span className="text-mint font-normal italic">Pass</span>PH
            </h1>
          </div>
        </div>

        {/* Custom Actions Container */}
        <div className="flex items-center gap-4">
          
          {/* Dynamic Theme Palette Selector */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3.5 py-2 bg-pine-mid/95 hover:bg-pine-light/80 border border-pine-light/30 hover:border-mint text-cream font-mono text-xs rounded-full transition-all cursor-pointer shadow-sm select-none"
              title="Select Workspace Palette style"
            >
              <Palette className="w-3.5 h-3.5 text-mint animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wide">
                🎨 Theme: {THEME_OPTIONS.find(t => t.id === theme)?.emoji || '🍓🍵'}
              </span>
            </button>

            {dropdownOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-cream border border-pine-light/30 rounded-2xl shadow-xl p-2.5 z-50 animate-in fade-in slide-in-from-top-3 duration-150">
                  <span className="px-2.5 py-1 text-[9px] uppercase tracking-wider font-extrabold text-pine-mid opacity-80 block font-mono">
                    Workspace Themes
                  </span>
                  <div className="h-px bg-pine-light/10 my-1.5" />
                  <div className="space-y-1">
                    {THEME_OPTIONS.map((opt) => {
                      const isActive = opt.id === theme;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => {
                            onThemeChange(opt.id);
                            setDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between text-left px-2.5 py-2 rounded-xl transition cursor-pointer text-xs ${
                            isActive 
                              ? 'bg-pine text-cream font-bold' 
                              : 'hover:bg-pine/10 text-pine font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">{opt.emoji}</span>
                            <span>{opt.name}</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <div className="flex gap-0.5">
                              <span className={`w-2 h-2 rounded-full ${opt.bg} border border-white/20 inline-block`} />
                              <span className={`w-2 h-2 rounded-full ${opt.accent} border border-white/20 inline-block`} />
                            </div>
                            {isActive && <Check className="w-3 h-3 text-mint" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Real-time Cloud Synchronization status indicator */}
          <div 
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-[10px] select-none transition-all duration-200 border ${
              syncStatus === 'syncing' 
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' 
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}
            title={syncStatus === 'syncing' ? 'Publishing changes to Google Cloud Firestore...' : 'All edits have been securely persisted on Google Cloud Firestore.'}
          >
            {syncStatus === 'syncing' ? (
              <>
                <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
                <span className="font-extrabold uppercase tracking-wide">Syncing</span>
              </>
            ) : (
              <>
                <Cloud className="w-3 h-3 text-emerald-400" />
                <span className="font-extrabold uppercase tracking-wide">Cloud Synced</span>
              </>
            )}
          </div>

          <div className="flex flex-col items-end hidden sm:flex select-none">
            <span className="text-[10px] uppercase tracking-wider text-sage font-bold">Review Class Session</span>
            <span className="text-xs text-mint/80 font-mono mt-0.5" id="myRankName">
              {profile.email ? profile.email.split('@')[0] : 'Reviewee'}
            </span>
          </div>

          <button
            onClick={() => onNavigate('billingTab')}
            className={`flex items-center gap-1.5 px-4 py-2 border rounded-full text-white font-sans font-bold text-xs uppercase tracking-widest cursor-pointer select-none transition-all duration-150 hover:scale-[1.03] active:scale-[0.98] ${getTierColor()}`}
            id="tierChip"
          >
            <Award className="w-3.5 h-3.5" />
            <span>{profile.tier || 'Clinical Trial'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
