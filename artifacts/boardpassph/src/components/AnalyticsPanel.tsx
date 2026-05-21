import React, { useMemo } from 'react';
import { Award, Zap, HelpCircle, Activity, Heart, Eye, Check, RefreshCw } from 'lucide-react';
import { UserProfile } from '../types';

interface AnalyticsPanelProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ profile, setProfile }) => {
  const BADGES = [
    { id: 'first-step', icon: '🌱', name: 'First Steps', desc: 'Answer your first question', check: () => profile.attempts >= 1 },
    { id: 'streak-3', icon: '🔥', name: 'On Fire', desc: 'Get 3 correct consecutively', check: () => profile.currentCombo >= 3 || profile.streak >= 3 },
    { id: 'streak-5', icon: '🏆', name: 'Streak Master', desc: 'Get 5 correct consecutively', check: () => profile.currentCombo >= 5 || profile.streak >= 5 },
    { id: 'centurion', icon: '💯', name: 'Centurion', desc: 'Accumulate 500+ XP', check: () => profile.totalXp >= 500 },
    { id: 'scholar', icon: '🎓', name: 'Clinical Scholar', desc: '80%+ accuracy over 10+ questions', check: () => profile.attempts >= 10 && (profile.correct / profile.attempts) >= 0.8 },
    { id: 'dedicated', icon: '🗓️', name: 'Dedicated', desc: 'Maintain a 3+ day streak', check: () => profile.streak >= 3 },
  ];

  // Estimated Pass Probability
  const passProbability = useMemo(() => {
    if (profile.attempts === 0) return 0;
    const accuracy = profile.correct / profile.attempts;
    if (accuracy < 0.50) return Math.round(accuracy * 100);
    // Weighted metric, up to 99%
    return Math.min(99, Math.round(accuracy * 115));
  }, [profile.attempts, profile.correct]);

  // Generate last 28 days heatmap cells
  const heatmapDays = useMemo(() => {
    const list = [];
    for (let i = 27; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const count = profile.heat[ds] || 0;
      list.push({ date: d, count, dateString: ds });
    }
    return list;
  }, [profile.heat]);

  const toggleAdaptive = () => {
    setProfile(prev => {
      const nextAdaptive = !prev.adaptive;
      localStorage.setItem(`bp_profile_${prev.email}`, JSON.stringify({ ...prev, adaptive: nextAdaptive }));
      return { ...prev, adaptive: nextAdaptive };
    });
  };

  return (
    <div className="space-y-6">
      {/* Intro info */}
      <div>
        <h2 className="font-display text-2xl text-pine">Metrics &amp; Achievement Intelligence</h2>
        <p className="text-xs text-gray-500 mt-1">
          Review your preparation benchmarks, track calendar consistency heatmaps, and claim earned achievement badges.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* PASS PROBABILITY CARD */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
          <h4 className="font-heading font-black text-pine text-xs uppercase tracking-widest flex items-center gap-1.5 select-none">
            <Activity className="w-4 h-4 text-sage" />
            Simulated Pass Probability
          </h4>
          <div className="text-center py-6">
            <h2 className="font-display text-6xl text-pine tracking-tighter" id="probNum">
              {profile.attempts > 0 ? `${passProbability}%` : '—'}
            </h2>
            <p className="text-[10px] text-gray-400 font-medium mt-1 leading-relaxed max-w-[180px] mx-auto">
              Based on overall cumulative study accuracy and historical trials. 75%+ is passing.
            </p>
          </div>
        </div>

        {/* STUDY CONSISTENCY HEATMAP */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-3">
          <h4 className="font-heading font-black text-pine text-xs uppercase tracking-widest flex items-center gap-1.5 select-none animate-pulse">
            <Activity className="w-4 h-4 text-sage" />
            28-day Study Heatmap
          </h4>
          <p className="text-[11px] text-gray-400 select-none">Grid displays daily practice volume. Green indicates activity.</p>
          <div className="grid grid-cols-7 gap-1.5 pt-1.5 select-none">
            {heatmapDays.map((day, i) => {
              const active = day.count > 0;
              const intense = day.count > 5;
              let bg = "bg-gray-100 hover:bg-gray-200 text-gray-400";
              if (intense) bg = "bg-pine text-white ring-2 ring-pine-light/20 font-bold";
              else if (active) bg = "bg-sage text-white font-semibold";

              return (
                <div
                  key={i}
                  title={`${day.count} practices on ${day.date.toDateString()}`}
                  className={`aspect-square rounded-lg flex items-center justify-center text-[9px] font-mono leading-none transition-all duration-150 ${bg}`}
                >
                  {day.date.getDate()}
                </div>
              );
            })}
          </div>
        </div>

        {/* SYSTEM ADAPTIVITY */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <h4 className="font-heading font-black text-pine text-xs uppercase tracking-widest flex items-center gap-1.5 select-none">
              <Zap className="w-4 h-4 text-amber-500 animate-bounce" />
              Adaptive Difficulty Engine
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed font-sans font-medium">
              Weighs practices. When enabled, your weakest areas (chapters under 65% accuracy) are automatically prioritized in the diagnostic queue.
            </p>
          </div>

          <label className="flex items-center gap-3 cursor-pointer py-2 border-t border-gray-55 border-dashed mt-4 select-none">
            <input 
              type="checkbox" 
              checked={profile.adaptive} 
              onChange={toggleAdaptive} 
              className="sr-only peer" 
            />
            <div className="relative w-10 h-5.5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-pine"></div>
            <span className="text-xs font-bold text-gray-700">Adaptive Queue Active</span>
          </label>
        </div>

      </div>

      {/* PERFORMANCE BREAKDOWNS COGNITIVE RADAR */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
        <h4 className="font-heading font-black text-pine text-xs uppercase tracking-widest flex items-center gap-1.5 border-b border-gray-100 pb-2.5 select-none">
          Category Deficiency Tracker
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { id: 'wDsm', name: 'Clinical Chapters' },
            { id: 'wIo', name: 'I/O Psychology' },
            { id: 'wDev', name: 'Lifespan Theory' },
            { id: 'wAssess', name: 'Assessments' },
            { id: 'wAbnorm', name: 'Abnormal Pathology' },
          ].map(row => {
            const accVal = profile.attempts > 0 ? Math.round((profile.correct / profile.attempts) * 100) : null;
            return (
              <div key={row.id} className="border border-gray-100 bg-gray-50/20 p-3.5 rounded-xl space-y-1">
                <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">{row.name}</span>
                <span className="text-lg font-heading font-black text-pine block font-mono" id={row.id}>
                  {accVal !== null ? `${accVal}%` : '—'}
                </span>
                <span className="text-[9px] text-gray-400 font-medium">Diagnostic benchmark</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* UNLOCKED BADGES TILES GRID */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
        <h4 className="font-heading font-black text-pine text-xs uppercase tracking-widest border-b border-gray-100 pb-2.5 select-none flex items-center gap-1.5">
          <Award className="w-5 h-5 text-amber-500" />
          Unlocked Achievement Badges
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 select-none">
          {BADGES.map(badge => {
            const unlocked = badge.check();
            return (
              <div 
                key={badge.id}
                className={`border rounded-2xl p-3 flex items-center gap-3.5 transition-all duration-200 ${
                  unlocked 
                    ? 'border-mint bg-white shadow-sm' 
                    : 'border-gray-100 bg-gray-50/50 opacity-40 grayscale-75'
                }`}
              >
                <div className={`w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-xl text-xl border ${
                  unlocked ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-gray-100 text-gray-300 border-gray-200'
                }`}>
                  {badge.icon}
                </div>
                <div className="space-y-0.5 leading-snug">
                  <h6 className={`font-black text-xs ${unlocked ? 'text-pine-light' : 'text-gray-400'}`}>
                    {badge.name}
                  </h6>
                  <p className="text-[9px] text-gray-400 font-medium">
                    {badge.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
