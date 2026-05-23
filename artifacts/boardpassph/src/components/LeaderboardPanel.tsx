import React, { useState, useEffect } from 'react';
import { 
  Trophy, Search, Flame, Award, Target, Sparkles, RefreshCw, 
  HelpCircle, ShieldCheck, Star, Users, Check, ArrowUpRight
} from 'lucide-react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { UserProfile } from '../types';

interface LeaderboardPanelProps {
  profile: UserProfile;
}

interface RankedEntry {
  rank: number;
  email: string;
  username?: string;
  totalXp: number;
  streak: number;
  correct: number;
  attempts: number;
  tier: string;
  isCurrentUser: boolean;
}

export const LeaderboardPanel: React.FC<LeaderboardPanelProps> = ({ profile }) => {
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<RankedEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [rankingMetric, setRankingMetric] = useState<'xp' | 'streak' | 'accuracy'>('xp');
  const [errorText, setErrorText] = useState<string | null>(null);

  // Anonymization helper to guard student privacy, but highlight the current active user
  const renderObfuscatedName = (email: string, isCurrentUser: boolean, username?: string) => {
    if (username?.trim()) {
      if (isCurrentUser) {
        return (
          <span className="flex items-center gap-1.5 text-pine font-black font-sans">
            <span>YOU (@{username.trim()})</span>
            <span className="text-[8px] bg-pine/10 text-pine px-1.5 py-0.5 rounded uppercase font-mono font-bold">Active</span>
          </span>
        );
      }
      return (
        <div className="flex flex-col leading-tight">
          <span className="font-bold text-gray-700 font-mono text-xs">@{username.trim()}</span>
          <span className="text-[9px] text-sage font-sans font-medium">{getPinoyAffiliation(email)}</span>
        </div>
      );
    }
    if (!email) return 'Anonymous Candidate';
    if (isCurrentUser) {
      return (
        <span className="flex items-center gap-1.5 text-pine font-black font-sans">
          <span>YOU ({email})</span>
          <span className="text-[8px] bg-pine/10 text-pine px-1.5 py-0.5 rounded uppercase font-mono font-bold">Active</span>
        </span>
      );
    }
    const [local, domain] = email.split('@');
    if (!local || !domain) return 'Anonymous Reviewee';
    
    // Aesthetic local university/city attribution based on email hash to feel contextual to Philippines
    const philippinesAffiliation = getPinoyAffiliation(email);
    
    let anonymizedLocal = '';
    if (local.length <= 3) {
      anonymizedLocal = `${local[0]}***`;
    } else {
      anonymizedLocal = `${local[0]}${local[1]}***${local[local.length - 1]}`;
    }
    
    return (
      <div className="flex flex-col leading-tight">
        <span className="font-bold text-gray-700 font-mono text-xs">
          {anonymizedLocal}@{domain.replace('.com', '')}
        </span>
        <span className="text-[9px] text-sage font-sans font-medium">
          {philippinesAffiliation}
        </span>
      </div>
    );
  };

  // Fun, immersive PH-relevant affiliations to elevate board exam aesthetic (Psychology / Psychometrician review)
  const getPinoyAffiliation = (email: string) => {
    const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const schools = [
      'UP Diliman • Psychology Association',
      'UST Manila • Graduate School of Psych',
      'DLSU Manila • Clinical Psych Division',
      'ADMU Quezon City • Mental Health Dept',
      'USC Cebu • Psychometrician Guild',
      'Xavier University • Cagayan de Oro Reviewee',
      'SLU Baguio • Cordillera Boards Prep',
      'PUP Manila • Clinical Review Division',
      'PLM Manila • Psychological Sciences',
      'UM Davao • Psychology Review Circle',
      'CPU Iloilo • Western Visayas Psych Prep',
      'MSU-IIT Iligan • Board Study Circle'
    ];
    return schools[hash % schools.length];
  };

  const fetchRankings = async () => {
    setLoading(true);
    setErrorText(null);
    let fetchedProfiles: any[] = [];

    try {
      // Clean query based on metrics
      let q;
      if (rankingMetric === 'xp') {
        q = query(collection(db, 'profiles'), orderBy('totalXp', 'desc'), limit(50));
      } else if (rankingMetric === 'streak') {
        q = query(collection(db, 'profiles'), orderBy('streak', 'desc'), limit(50));
      } else {
        // Fallback or ordered by correct
        q = query(collection(db, 'profiles'), orderBy('correct', 'desc'), limit(50));
      }

      const snap = await getDocs(q);
      snap.forEach((doc) => {
        fetchedProfiles.push(doc.data());
      });
    } catch (err: any) {
      console.warn('Leaderboard connection failed while loading profiles from Firestore:', err);
    }

    const rawList = [...fetchedProfiles];

    // Insert active current user into list if they are not already retrieved to ensure they see their relative position
    const currentUserInList = rawList.some(p => p.email.toLowerCase() === profile.email.toLowerCase());
    if (!currentUserInList) {
      rawList.push({
        email: profile.email,
        username: profile.username,
        totalXp: profile.totalXp,
        streak: profile.streak,
        correct: profile.correct,
        attempts: profile.attempts,
        tier: profile.tier
      });
    }

    // Sort accordingly in state
    let sorted = [...rawList];
    if (rankingMetric === 'xp') {
      sorted.sort((a, b) => (b.totalXp || 0) - (a.totalXp || 0));
    } else if (rankingMetric === 'streak') {
      sorted.sort((a, b) => (b.streak || 0) - (a.streak || 0));
    } else {
      // Accuracy percentage (correct / attempts)
      sorted.sort((a, b) => {
        const accuracyA = (a.attempts || 0) > 0 ? (a.correct || 0) / (a.attempts || 1) : 0;
        const accuracyB = (b.attempts || 0) > 0 ? (b.correct || 0) / (b.attempts || 1) : 0;
        return accuracyB - accuracyA;
      });
    }

    // Map ranks
    const mapped: RankedEntry[] = sorted.map((item, idx) => ({
      rank: idx + 1,
      email: item.email,
      username: item.username,
      totalXp: item.totalXp || 0,
      streak: item.streak || 0,
      correct: item.correct || 0,
      attempts: item.attempts || 0,
      tier: item.tier || 'Free',
      isCurrentUser: item.email.toLowerCase() === profile.email.toLowerCase()
    }));

    setEntries(mapped);
    setLoading(false);
  };

  useEffect(() => {
    fetchRankings();
  }, [rankingMetric]);

  // Filter list by search query (obfuscated or exact email match)
  const filteredEntries = entries.filter(e => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const username = (e.username || '').toLowerCase();
    return e.email.toLowerCase().includes(q) || username.includes(q);
  });

  // Calculate self position
  const selfEntry = entries.find(e => e.isCurrentUser);

  return (
    <div className="space-y-6">
      
      {/* IMMERSIVE HEADER BANNER */}
      <div className="bg-gradient-to-br from-pine to-green-900 border border-green-800 rounded-3xl p-6 text-cream shadow-md relative overflow-hidden select-none">
        {/* Absolute Background Decors */}
        <div className="absolute right-0 bottom-0 opacity-15 translate-x-12 translate-y-12">
          <Trophy className="w-[200px] h-[200px] text-mint" />
        </div>
        <div className="absolute top-2 right-2 flex gap-1">
          <span className="text-[8px] font-mono leading-none bg-white/10 text-mint px-2 py-0.5 rounded border border-white/5 font-semibold">
            PRC RA10029
          </span>
          <span className="text-[8px] font-mono leading-none bg-mint text-pine px-2 py-0.5 rounded font-black">
            LIVE SCOREBOARD
          </span>
        </div>

        <div className="max-w-xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-mint border border-white/5">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Honorable Merit &amp; Consistency</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-condensed font-bold tracking-tight uppercase">
            BoardPassPH Topnotchers Leaderboard
          </h1>
          <p className="text-xs text-mint/80 font-sans leading-relaxed">
            Compare study statistics, cumulative Board XP, accuracy ratios, and sequential day consistency streaks against other active psychometrician and psychologist review candidates nationwide. 
          </p>
        </div>
      </div>

      {/* QUICK VIEW DYNAMIC RANKINGS HUD CARD (YOUR PLACEMENT) */}
      {selfEntry && (
        <div className="p-4 bg-gradient-to-r from-mint/10 to-foam border border-pine/10 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-pine flex flex-col items-center justify-center text-cream shadow-sm flex-shrink-0">
              <span className="text-[10px] uppercase font-black tracking-wider text-mint leading-none font-mono">Rank</span>
              <span className="text-lg font-bold leading-none font-sans mt-0.5">#{selfEntry.rank}</span>
            </div>
            <div>
              <p className="text-[10px] uppercase font-black text-sage tracking-wider font-mono">Personal Scoring Assessment</p>
              <h5 className="text-xs font-bold text-gray-800 leading-tight">
                {profile.email} ({profile.tier})
              </h5>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-[10px] text-pine font-semibold font-mono">
                <span>⚡ {selfEntry.totalXp} Cumulative XP</span>
                <span>🔥 {selfEntry.streak}-Day Streak</span>
                <span>🎯 {selfEntry.attempts > 0 ? Math.round((selfEntry.correct / selfEntry.attempts) * 100) : 0}% accuracy ratio</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selfEntry.rank <= 10 ? (
              <span className="text-[10px] uppercase font-black bg-amber-500 text-white px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-sm leading-none border border-amber-600">
                <Star className="w-3 h-3 fill-current text-white animate-spin-slow" />
                <span>Distinguished Topnotcher</span>
              </span>
            ) : (
              <span className="text-[10px] uppercase font-black bg-foam/90 text-pine px-3 py-1.5 rounded-xl border border-pine/20 font-mono text-center block">
                ⭐ Keep studying to reach the Top 10!
              </span>
            )}
          </div>
        </div>
      )}

      {/* LEADERBOARD UTILITIES ROW */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        
        {/* METRICS SELECTOR TAB SWITCHER */}
        <div className="md:col-span-8 bg-white border border-gray-100 p-1.5 rounded-2xl shadow-sm flex gap-1 select-none">
          <button
            onClick={() => setRankingMetric('xp')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] uppercase font-black tracking-wider transition-all rounded-xl cursor-pointer ${
              rankingMetric === 'xp'
                ? 'bg-pine text-cream font-bold shadow-sm'
                : 'text-pine-mid hover:bg-gray-50'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Cumulative Board XP</span>
          </button>

          <button
            onClick={() => setRankingMetric('streak')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] uppercase font-black tracking-wider transition-all rounded-xl cursor-pointer ${
              rankingMetric === 'streak'
                ? 'bg-pine text-cream font-bold shadow-sm'
                : 'text-pine-mid hover:bg-gray-50'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span>Consistency Streak</span>
          </button>

          <button
            onClick={() => setRankingMetric('accuracy')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] uppercase font-black tracking-wider transition-all rounded-xl cursor-pointer ${
              rankingMetric === 'accuracy'
                ? 'bg-pine text-cream font-bold shadow-sm'
                : 'text-pine-mid hover:bg-gray-50'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Accuracy Ratio</span>
          </button>
        </div>

        {/* SEARCH FILTER INPUT */}
        <div className="md:col-span-4 relative">
          <Search className="w-4 h-4 text-sage absolute left-3.5 top-1/2 -translate-y-1/2 cursor-default" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by username or email..."
            className="w-full bg-white border border-gray-100 text-xs text-gray-700 placeholder-sage px-10 py-2.5 rounded-2xl outline-none focus:ring-4 focus:ring-pine/5 focus:border-sage transition shadow-sm font-semibold"
          />
        </div>

      </div>

      {/* LEADERS BOARD TABLE / CORE CARD */}
      <div className="bg-white border border-pine/10 rounded-3xl overflow-hidden shadow-sm">
        
        {/* Tab Headers */}
        <div className="bg-foam/35 border-b border-gray-100 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-pine" />
            <h3 className="text-xs uppercase font-black text-pine tracking-wider">
              Review Ranking Scoreboard
            </h3>
          </div>
          <button
            onClick={fetchRankings}
            disabled={loading}
            className="p-1 px-3 bg-white hover:bg-gray-50 text-pine text-[10px] font-bold uppercase tracking-wider rounded-lg border border-gray-100 transition flex items-center gap-1 shadow-xs cursor-pointer select-none"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Live</span>
          </button>
        </div>

        {/* Actual Dynamic Rankings Content */}
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-pine animate-spin" />
            <p className="text-[10px] uppercase font-bold text-sage animate-pulse font-mono">
              Fetching registered Philippine board candidates...
            </p>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-16 text-center text-gray-400 space-y-2">
            <HelpCircle className="w-8 h-8 mx-auto text-sage" />
            <h4 className="text-[11px] uppercase font-bold text-gray-700 leading-none">No Candidates Located</h4>
            <p className="text-[10px] max-w-sm mx-auto">
              We couldn't locate any enrolled medical reviewee profile matching your search query. Try searching with general letters.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/10 text-[9px] uppercase font-black text-pine-mid/60 tracking-wider font-mono border-b border-gray-100 select-none">
                  <th className="py-3 px-4 w-16">Rank</th>
                  <th className="py-3 px-4">Philippine Board Reviewee Identifier</th>
                  <th className="py-3 px-4 text-center">Plan Tier</th>
                  <th className="py-3 px-4 text-right">Consecutive Streak</th>
                  <th className="py-3 px-4 text-right">Correct Vignettes</th>
                  <th className="py-3 px-4 text-right">Accumulated Board XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEntries.map((item, idx) => {
                  const isTop3 = item.rank <= 3;
                  let rankVisual = null;
                  let rowBackground = "hover:bg-gray-50/40";
                  
                  if (item.isCurrentUser) {
                    rowBackground = "bg-mint/5 hover:bg-mint/10 darkHighlight text-pine font-medium";
                  }

                  if (item.rank === 1) {
                    rankVisual = (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-amber-100 text-amber-700 font-bold border border-amber-300 font-sans shadow-sm text-xs">
                        🥇
                      </span>
                    );
                  } else if (item.rank === 2) {
                    rankVisual = (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-bold border border-slate-300 font-sans shadow-sm text-xs">
                        🥈
                      </span>
                    );
                  } else if (item.rank === 3) {
                    rankVisual = (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-amber-50 text-amber-900 font-bold border border-orange-200 font-sans shadow-sm text-xs">
                        🥉
                      </span>
                    );
                  } else {
                    rankVisual = (
                      <span className="text-[11px] font-bold text-sage font-mono">
                        #{item.rank}
                      </span>
                    );
                  }

                  // Compute accuracy
                  const accuracyRatio = item.attempts > 0 ? Math.round((item.correct / item.attempts) * 100) : 0;

                  return (
                    <tr 
                      key={item.email} 
                      className={`transition duration-100 items-center ${rowBackground}`}
                    >
                      {/* Rank badge */}
                      <td className="py-3 px-4 font-bold select-none align-middle">
                        <div className="flex items-center justify-center">
                          {rankVisual}
                        </div>
                      </td>

                      {/* Anonymized Email & School info */}
                      <td className="py-3 px-4 align-middle">
                        <div className="flex items-center gap-1.5">
                          {renderObfuscatedName(item.email, item.isCurrentUser, item.username)}
                          {item.rank <= 10 && (
                            <span className="text-[8px] uppercase font-mono font-bold text-[#b45309] bg-[#fef3c7] px-1.5 py-0.5 rounded ml-1 animate-pulse select-none border border-amber-250">
                              Topnotcher Merit
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Tier Badge */}
                      <td className="py-3 px-4 text-center align-middle select-none">
                        <span className={`inline-block text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full select-none ${
                          item.tier === 'Clinical' 
                            ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                            : item.tier === 'Pro' 
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                            : item.tier === 'Clinical Trial'
                            ? 'bg-amber-50 text-amber-700 border border-amber-100'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {item.tier}
                        </span>
                      </td>

                      {/* Consecutive Streak days with flame icon indicator */}
                      <td className="py-3 px-4 text-right align-middle font-semibold text-xs text-gray-700">
                        <div className="inline-flex items-center gap-1 font-mono">
                          <Flame className={`w-3.5 h-3.5 ${item.streak > 0 ? 'text-orange-500 fill-current' : 'text-gray-300'}`} />
                          <span>{item.streak} days</span>
                        </div>
                      </td>

                      {/* Correct ratio & accuracy */}
                      <td className="py-3 px-4 text-right align-middle text-xs text-gray-700 font-mono">
                        <div>
                          <span className="font-bold text-gray-800">{item.correct}</span>
                          <span className="text-gray-400 text-[10px]"> / {item.attempts}</span>
                          <span className="text-[9px] bg-foam text-pine ml-1.5 px-1 rounded-sm text-[9px] font-semibold">{accuracyRatio}%</span>
                        </div>
                      </td>

                      {/* Experience Points */}
                      <td className="py-3 px-4 text-right align-middle">
                        <span className="text-xs font-black text-pine font-mono block">
                          ⚡ {item.totalXp.toLocaleString()} XP
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Board room legal credit tag info bar */}
        <div className="bg-gray-50 border-t border-gray-100 p-4 text-[9px] text-gray-400 font-sans tracking-wide leading-relaxed">
          🏆 **菲律宾心理学家与心理计量学法案 (RA 10029) Regulatory Board Study Standards of Distinction.** Complete scores updated dynamically during connected sync operations. Your rank is computed against database user points to motivate consistent daily study sessions.
        </div>
      </div>

      {/* IMMERSIVE STUDY RETRIEVAL CARD LINK */}
      <div className="bg-[#123e25] text-cream p-5 rounded-2xl border border-pine-mid/25 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-[11px] uppercase font-black tracking-widest text-mint font-mono">⚡ Propel your Placement Rank</h4>
          <p className="text-[11px] text-cream/70 mt-1 max-w-xl">
            Need more XP? Head over to the **Practice Arena** or the strict **Mock Board Exam Simulator** to earn bonus multipliers, maintain streaks, and rise through the BoardPassPH rankings.
          </p>
        </div>
        <a
          href="#/practice"
          onClick={(e) => { e.preventDefault(); }}
          className="text-[10px] font-black uppercase tracking-wider bg-mint hover:bg-white text-pine px-4 py-2.5 rounded-xl transition flex items-center gap-1 select-none"
        >
          <span>Enter Practice Arena</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-pine" />
        </a>
      </div>

    </div>
  );
};
