import React, { useState, useEffect } from 'react';
import { Shield, Search, RotateCcw, TrendingUp, UserCheck, Check, AlertCircle, RefreshCw, Star, Trash2, Megaphone, Pin, Send } from 'lucide-react';
import { UserProfile } from '../types';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, doc, getDoc, getDocs, setDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { Announcement } from './AnnouncementsPanel';

interface AdminPanelProps {
  profile: UserProfile | null;
  setProfile?: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ profile, setProfile }) => {
  const [searchEmail, setSearchEmail] = useState('');
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; ok: boolean } | null>(null);

  // Announcements state
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [annTitle, setAnnTitle] = useState('');
  const [annBody, setAnnBody] = useState('');
  const [annType, setAnnType] = useState<'info' | 'warning' | 'success'>('info');
  const [annPinned, setAnnPinned] = useState(false);
  const [annLoading, setAnnLoading] = useState(false);
  const [annStatus, setAnnStatus] = useState<{ text: string; ok: boolean } | null>(null);

  // Field change states
  const [customXp, setCustomXp] = useState<number>(0);
  const [customStreak, setCustomStreak] = useState<number>(0);
  const [customStreakShields, setCustomStreakShields] = useState<number>(0);
  const [customTier, setCustomTier] = useState<string>('Free');

  // Load announcements via real-time listener
  useEffect(() => {
    const col = collection(db, 'announcements');
    const unsub = onSnapshot(col, (snap) => {
      const list: Announcement[] = [];
      snap.forEach((d) => list.push(d.data() as Announcement));
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAnnouncements(list);
    }, (err) => {
      console.warn('Announcements listener failed:', err);
    });
    return () => unsub();
  }, []);

  const handlePostAnnouncement = async () => {
    if (!annTitle.trim() || !annBody.trim()) {
      setAnnStatus({ text: 'Title and body are required.', ok: false });
      return;
    }
    setAnnLoading(true);
    setAnnStatus(null);
    const id = `ann_${Date.now()}`;
    const ann: Announcement = {
      id,
      title: annTitle.trim(),
      body: annBody.trim(),
      author: profile?.email || 'Admin',
      createdAt: new Date().toISOString(),
      pinned: annPinned,
      type: annType,
    };
    try {
      await setDoc(doc(db, 'announcements', id), ann);
      setAnnTitle('');
      setAnnBody('');
      setAnnPinned(false);
      setAnnType('info');
      setAnnStatus({ text: '✅ Announcement posted successfully!', ok: true });
    } catch (err: any) {
      setAnnStatus({ text: `❌ Failed to post: ${err?.message || err}`, ok: false });
    } finally {
      setAnnLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await deleteDoc(doc(db, 'announcements', id));
    } catch (err: any) {
      alert(`Delete failed: ${err?.message || err}`);
    }
  };

  // Load all profiles from Firebase Cloud Firestore
  const fetchAllProfiles = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const querySnapshot = await getDocs(collection(db, 'profiles'));
      const profilesList: UserProfile[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data() as UserProfile;
        if (data.email) {
          profilesList.push(data);
        }
      });
      setAllProfiles(profilesList);
      
      // Auto-select logged-in profile if first time
      if (!selectedProfile && profile) {
        const found = profilesList.find(p => p.email.toLowerCase() === profile.email.toLowerCase());
        if (found) {
          handleSelectProfile(found);
        }
      }
    } catch (err) {
      console.warn("Could not list profiles. Attempting fallback or error reporting.", err);
      // Failover list with current active profile
      if (profile) {
        setAllProfiles([profile]);
        handleSelectProfile(profile);
      }
      setStatusMessage({ 
        text: "Could not auto-fetch all cloud documents. You can still look up any email manually below.", 
        ok: false 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setStatusMessage(null);
    const queryCol = collection(db, 'profiles');
    
    const unsubscribe = onSnapshot(queryCol, (snapshot) => {
      const profilesList: UserProfile[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as UserProfile;
        if (data.email) {
          profilesList.push(data);
        }
      });
      setAllProfiles(profilesList);
      setLoading(false);
      
      // Auto-select logged-in profile if first time or keep active selection updated
      setProfile((prevActive) => {
        const currentActive = prevActive;
        setSelectedProfile((prevSelected) => {
          if (prevSelected) {
            const match = profilesList.find(p => p.email.toLowerCase().trim() === prevSelected.email.toLowerCase().trim());
            return match || prevSelected;
          } else if (currentActive) {
            const found = profilesList.find(p => p.email.toLowerCase().trim() === currentActive.email.toLowerCase().trim());
            if (found) {
              setCustomXp(found.totalXp);
              setCustomStreak(found.streak);
              setCustomStreakShields(found.streakShields ?? 0);
              setCustomTier(found.tier);
              return found;
            }
          }
          return prevSelected;
        });
        return prevActive;
      });
    }, (error) => {
      console.warn("Real-time Admin List listener failed, reverting to static query:", error);
      fetchAllProfiles();
    });

    return () => unsubscribe();
  }, [profile?.email]);

  const handleSelectProfile = (prof: UserProfile) => {
    setSelectedProfile(prof);
    setCustomXp(prof.totalXp);
    setCustomStreak(prof.streak);
    setCustomStreakShields(prof.streakShields ?? 0);
    setCustomTier(prof.tier);
    setStatusMessage(null);
  };

  const handleManualSearch = async () => {
    if (!searchEmail.trim()) {
      alert("Please specify a reviewee email address to query!");
      return;
    }
    setLoading(true);
    setStatusMessage(null);
    const emailLower = searchEmail.toLowerCase().trim();

    try {
      const docRef = doc(db, 'profiles', emailLower);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const prof = docSnap.data() as UserProfile;
        handleSelectProfile(prof);
        setStatusMessage({ text: `✨ Found user of interest: ${emailLower}`, ok: true });
      } else {
        // Try local storage local fallback
        const localStored = localStorage.getItem(`bp_profile_${emailLower}`);
        if (localStored) {
          const prof = JSON.parse(localStored) as UserProfile;
          handleSelectProfile(prof);
          setStatusMessage({ text: `💡 User loaded from Local Fallback Registry (not yet indexed on cloud).`, ok: true });
        } else {
          setStatusMessage({ text: `❌ Reviewee "${emailLower}" is not registered on either Firebase cloud or standard legacy registry.`, ok: false });
        }
      }
    } catch (err) {
      setStatusMessage({ text: `❌ Lookup failed during connection: ${err instanceof Error ? err.message : String(err)}`, ok: false });
    } finally {
      setLoading(false);
    }
  };

  // Resets
  const resetSelectedStreak = () => {
    setCustomStreak(0);
    setStatusMessage({ text: "Streak value modified locally to 0. Press \"Update Profile\" to commit.", ok: true });
  };

  const resetSelectedXp = () => {
    setCustomXp(0);
    setStatusMessage({ text: "XP value modified locally to 0. Press \"Update Profile\" to commit.", ok: true });
  };

  // Add utilities
  const addTenXp = () => {
    setCustomXp(prev => prev + 10);
  };

  const addHundredXp = () => {
    setCustomXp(prev => prev + 100);
  };

  const addWeeklyStreak = () => {
    setCustomStreak(prev => prev + 7);
  };

  // Commit updates back to Firestore & Local Storage
  const handleUpdateCommit = async () => {
    if (!selectedProfile) return;

    setLoading(true);
    setStatusMessage(null);

    const updatedProfile: UserProfile = {
      ...selectedProfile,
      totalXp: Number(customXp),
      streak: Number(customStreak),
      streakShields: Number(customStreakShields),
      tier: customTier as any
    };

    try {
      // 1. Sync to Cloud Firestore
      const docRef = doc(db, 'profiles', selectedProfile.email.toLowerCase().trim());
      await setDoc(docRef, updatedProfile);

      // 2. Sync to local caching registry
      localStorage.setItem(`bp_profile_${selectedProfile.email.toLowerCase().trim()}`, JSON.stringify(updatedProfile));

      // 3. Mirror to active reviewee session if editing their own credentials
      if (profile && profile.email.toLowerCase() === selectedProfile.email.toLowerCase()) {
        setProfile(updatedProfile);
      }

      // Update state in matching listed user
      setSelectedProfile(updatedProfile);
      setAllProfiles(prev => prev.map(p => p.email.toLowerCase() === updatedProfile.email.toLowerCase() ? updatedProfile : p));

      setStatusMessage({ 
        text: `💚 Successfully synchronized adjustments for ${selectedProfile.email}! Streak: ${customStreak}, XP: ${customXp}, Tier: ${customTier}.`, 
        ok: true 
      });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ 
        text: `❌ Firestore secure locks blocked action: ${err?.message || err}. Syncing locally.`, 
        ok: false 
      });
      // Fallback
      localStorage.setItem(`bp_profile_${selectedProfile.email.toLowerCase().trim()}`, JSON.stringify(updatedProfile));
      if (profile && profile.email.toLowerCase() === selectedProfile.email.toLowerCase()) {
        setProfile(updatedProfile);
      }
    } finally {
      setLoading(false);
    }
  };

  // Client side filtered list
  const filteredProfiles = allProfiles.filter(p => 
    p.email.toLowerCase().includes(searchEmail.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="text-center space-y-2 select-none">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-900/30 border border-red-500/20 rounded-full text-[10px] uppercase font-black tracking-widest text-[#EC9FA5] animate-pulse">
          <Shield className="w-3.5 h-3.5" />
          <span>Security Administration Level</span>
        </div>
        <h2 className="font-display text-3xl text-pine">Admin Console</h2>
        <p className="text-xs text-gray-500 max-w-lg mx-auto leading-relaxed">
          Reset review streaks, update experience levels (XP), override subscription tiers, and audit all BoardPassPH reviewees safely stored on Google Cloud Firestore.
        </p>
      </div>

      {/* ── ANNOUNCEMENT COMPOSER ─────────────────────────────── */}
      <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm space-y-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <Megaphone className="w-4 h-4 text-pine" />
          <span className="text-xs uppercase font-extrabold text-pine tracking-wide">Post Announcement</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Title</label>
            <input
              type="text"
              value={annTitle}
              onChange={e => setAnnTitle(e.target.value)}
              placeholder="e.g. System maintenance on Aug 5"
              className="w-full px-3 py-2 border border-gray-200 outline-none rounded-xl text-xs bg-gray-50/50 focus:bg-white focus:border-pine font-sans transition"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1 space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Type</label>
              <select
                value={annType}
                onChange={e => setAnnType(e.target.value as 'info' | 'warning' | 'success')}
                className="w-full px-3 py-2 border border-gray-200 outline-none rounded-xl text-xs bg-gray-50/50 focus:bg-white focus:border-pine transition"
              >
                <option value="info">ℹ️ Info</option>
                <option value="warning">⚠️ Warning</option>
                <option value="success">✅ Success</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Pin</label>
              <button
                type="button"
                onClick={() => setAnnPinned(p => !p)}
                className={`h-9 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer select-none ${annPinned ? 'bg-pine text-cream border-pine' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-pine/30'}`}
              >
                <Pin className="w-3.5 h-3.5" />
                {annPinned ? 'Pinned' : 'Pin it'}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Body</label>
          <textarea
            value={annBody}
            onChange={e => setAnnBody(e.target.value)}
            placeholder="Write the announcement message here…"
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 outline-none rounded-xl text-xs bg-gray-50/50 focus:bg-white focus:border-pine font-sans transition resize-none"
          />
        </div>

        {annStatus && (
          <div className={`p-2.5 rounded-xl border text-xs font-semibold ${annStatus.ok ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
            {annStatus.text}
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={handlePostAnnouncement}
            disabled={annLoading}
            className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-pine to-emerald-800 hover:from-pine-mid text-white font-bold text-xs rounded-xl cursor-pointer select-none shadow hover:shadow-md transition disabled:opacity-50"
          >
            {annLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Post Announcement
          </button>
        </div>

        {/* Existing announcements list */}
        {announcements.length > 0 && (
          <div className="border-t border-gray-100 pt-4 space-y-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Posted ({announcements.length})</span>
            <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
              {announcements.map(ann => (
                <div key={ann.id} className="flex items-start justify-between gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {ann.pinned && <Pin className="w-3 h-3 text-pine" />}
                      <span className="text-xs font-bold text-gray-800 truncate">{ann.title}</span>
                      <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${ann.type === 'warning' ? 'bg-amber-100 text-amber-800' : ann.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                        {ann.type || 'info'}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{ann.body}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteAnnouncement(ann.id)}
                    className="p-1.5 hover:bg-rose-50 hover:text-rose-600 text-gray-400 rounded-lg transition cursor-pointer shrink-0"
                    title="Delete announcement"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── REVIEWEE PROFILES MANAGEMENT ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start max-w-7xl mx-auto w-full">
        {/* Left Side: Users Database and Search */}
        <div className="lg:col-span-1 bg-white border border-gray-150 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span className="text-xs uppercase font-extrabold text-pine tracking-wide block">Reviewee Registry</span>
            <button 
              onClick={fetchAllProfiles}
              disabled={loading}
              className="p-1 px-2.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-[10px] text-teal-800 font-bold tracking-tight transition flex items-center gap-1 cursor-pointer select-none"
              title="Refresh Firestore documents list"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Search Inputs */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Find or Query Email</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. maria@gmail.com"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-gray-200 outline-none rounded-xl text-xs bg-gray-50/50 hover:bg-gray-50 focus:bg-white focus:border-pine font-mono transition"
                />
              </div>
              <button
                onClick={handleManualSearch}
                className="px-3.5 py-1.5 bg-pine text-white font-bold text-xs rounded-xl cursor-pointer hover:bg-pine-mid transition"
              >
                Load
              </button>
            </div>
          </div>

          {/* Users List Container */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">All Indexed Profiles ({allProfiles.length})</label>
            <div className="border border-gray-100 rounded-xl overflow-hidden max-h-56 overflow-y-auto divide-y divide-gray-50">
              {filteredProfiles.length === 0 ? (
                <div className="p-4 text-center text-[11px] text-gray-400 italic">
                  No registered profiles found matching criteria.
                </div>
              ) : (
                filteredProfiles.map((p) => {
                  const isSelected = selectedProfile?.email.toLowerCase() === p.email.toLowerCase();
                  const isSelf = profile?.email.toLowerCase() === p.email.toLowerCase();
                  return (
                    <button
                      key={p.email}
                      onClick={() => handleSelectProfile(p)}
                      className={`w-full flex items-center justify-between text-left p-2.5 transition text-xs select-none cursor-pointer ${
                        isSelected 
                          ? 'bg-pine text-white' 
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <span className="font-mono font-medium block truncate text-[11px] leading-tight">
                          {p.email}
                        </span>
                        <span className={`text-[9px] uppercase tracking-wider font-extrabold font-sans ${isSelected ? 'text-teal-200' : 'text-teal-700'}`}>
                          {p.tier}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] block font-mono font-bold">
                          {p.totalXp} XP
                        </span>
                        <span className="text-[9px] block text-gray-400 font-sans">
                          ⚡ {p.streak}d
                        </span>
                      </div>
                      {isSelf && (
                        <span className="ml-1 px-1 bg-teal-800 border border-teal-600 text-[8px] rounded uppercase font-black text-teal-200">
                          Self
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Configuration console */}
        <div className="lg:col-span-2 bg-white border border-gray-150 rounded-3xl p-6 shadow-sm space-y-6">
          {selectedProfile ? (
            <div className="space-y-6">
              {/* Profile Card Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gray-50/50 border border-gray-100 p-4 rounded-2xl">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase tracking-wide font-black text-teal-700 block">Selected Focus User</span>
                  <h3 className="font-mono text-base font-bold text-gray-900 truncate max-w-sm" title={selectedProfile.email}>
                    {selectedProfile.email}
                  </h3>
                  <div className="flex flex-wrap gap-2 pt-0.5">
                    <span className="px-2 py-0.5 border border-amber-300 bg-amber-50 rounded-full text-[9px] text-amber-800 font-extrabold uppercase font-sans">
                      XP: {selectedProfile.totalXp}
                    </span>
                    <span className="px-2 py-0.5 border border-rose-300 bg-rose-50 rounded-full text-[9px] text-rose-800 font-extrabold uppercase font-sans">
                      Streak: {selectedProfile.streak} days
                    </span>
                    <span className="px-2 py-0.5 border border-teal-300 bg-teal-50 rounded-full text-[9px] text-teal-800 font-extrabold uppercase font-sans">
                      Tier: {selectedProfile.tier}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <UserCheck className="w-5 h-5 text-teal-500 animate-pulse shrink-0" />
                  <span className="text-[10px] font-mono text-gray-500 whitespace-nowrap bg-teal-50/20 border border-teal-500/10 p-1 px-2.5 rounded-lg font-bold">
                    Connected to Cloud Node
                  </span>
                </div>
              </div>

              {/* Reset Actions and Controls Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. STREAK ADJUSTMENTS */}
                <div className="border border-gray-100 p-4 rounded-2xl bg-white space-y-4 shadow-sm">
                  <div className="space-y-1">
                    <h4 className="text-xs uppercase font-extrabold text-pine tracking-wide font-sans">⚡ Streak Operations</h4>
                    <p className="text-[10px] text-gray-400">Instantly wipe out or safely augment consecutive daily review milestones.</p>
                  </div>

                  <div className="space-y-3">
                    {/* Reset Button */}
                    <button
                      onClick={resetSelectedStreak}
                      className="w-full py-2 bg-rose-50 border border-rose-200 hover:bg-rose-100/80 active:bg-rose-100 font-semibold text-rose-800 rounded-xl text-xs flex items-center justify-center gap-1.5 transition select-none cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4 shrink-0" />
                      Reset Streak to 0
                    </button>

                    <div className="flex gap-2">
                      <button
                        onClick={addWeeklyStreak}
                        className="flex-1 py-1 px-2.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        +7 Days Streak
                      </button>
                    </div>

                    {/* Numeric Input */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Set Manual Streak</label>
                      <input
                        type="number"
                        min="0"
                        value={customStreak}
                        onChange={(e) => setCustomStreak(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-3 py-1.5 border border-gray-200 outline-none rounded-xl text-xs bg-gray-50/50 hover:bg-gray-50 focus:bg-white focus:border-pine font-mono transition"
                      />
                    </div>

                    {/* Streak Shields input */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Streak Shields Available</label>
                      <input
                        type="number"
                        min="0"
                        value={customStreakShields}
                        onChange={(e) => setCustomStreakShields(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-3 py-1.5 border border-gray-200 outline-none rounded-xl text-xs bg-gray-50/50 hover:bg-gray-50 focus:bg-white focus:border-pine font-mono transition"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. EXPERIENCE LEVEL (XP) ADJUSTMENTS */}
                <div className="border border-gray-100 p-4 rounded-2xl bg-white space-y-4 shadow-sm">
                  <div className="space-y-1">
                    <h4 className="text-xs uppercase font-extrabold text-pine tracking-wide font-sans">🌟 XP Level Operations</h4>
                    <p className="text-[10px] text-gray-400">Instantly wipe out or grant premium rewards of psychological clinical experience point credentials.</p>
                  </div>

                  <div className="space-y-3">
                    {/* Reset Button */}
                    <button
                      onClick={resetSelectedXp}
                      className="w-full py-2 bg-red-50 border border-red-200 hover:bg-red-100/80 active:bg-red-100 font-semibold text-red-800 rounded-xl text-xs flex items-center justify-center gap-1.5 transition select-none cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4 shrink-0" />
                      Reset XP to 0
                    </button>

                    <div className="flex gap-2">
                      <button
                        onClick={addTenXp}
                        className="flex-1 py-1 px-2 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-lg text-[10px] font-bold flex items-center justify-center gap-0.5 cursor-pointer"
                      >
                        +10 XP
                      </button>
                      <button
                        onClick={addHundredXp}
                        className="flex-1 py-1 px-2 border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-lg text-[10px] font-bold flex items-center justify-center gap-0.5 cursor-pointer"
                      >
                        +100 XP
                      </button>
                    </div>

                    {/* Numeric Input */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Set Manual total XP</label>
                      <input
                        type="number"
                        min="0"
                        value={customXp}
                        onChange={(e) => setCustomXp(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-3 py-1.5 border border-gray-200 outline-none rounded-xl text-xs bg-gray-50/50 hover:bg-gray-50 focus:bg-white focus:border-pine font-mono transition"
                      />
                    </div>

                    {/* Choose Tier Option */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Subscription Membership tier</label>
                      <select
                        value={customTier}
                        onChange={(e) => setCustomTier(e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-200 outline-none rounded-xl text-xs bg-gray-50/50 hover:bg-gray-50 focus:bg-white focus:border-pine transition"
                      >
                        <option value="Free">Free Basic Tier</option>
                        <option value="Pro">Pro Board Pass Suite</option>
                        <option value="Clinical">Clinical Expert Suite</option>
                        <option value="Clinical Trial">Clinical Trial Sandbox</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Indicator */}
              {statusMessage && (
                <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs animate-in fade-in duration-100 ${
                  statusMessage.ok 
                    ? 'bg-emerald-50 border-emerald-150 text-emerald-800' 
                    : 'bg-rose-50 border-rose-150 text-rose-800'
                }`}>
                  {statusMessage.ok ? (
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span className="leading-normal font-semibold">
                    {statusMessage.text}
                  </span>
                </div>
              )}

              {/* Commit Action Footer bar */}
              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={() => handleSelectProfile(selectedProfile)}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-semibold cursor-pointer select-none"
                >
                  Discard Changes
                </button>
                <button
                  type="button"
                  onClick={handleUpdateCommit}
                  disabled={loading}
                  className="px-5 py-2 bg-gradient-to-r from-pine to-emerald-800 hover:from-pine-mid hover:to-emerald-900 text-white font-bold text-xs rounded-xl cursor-pointer select-none shadow hover:shadow-md active:scale-98 transition flex items-center gap-1.5"
                >
                  {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Save &amp; Update Firestore Document
                </button>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center space-y-3">
              <Shield className="w-12 h-12 text-gray-300 mx-auto animate-bounce" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-gray-700">No Reviewee Profile Selected</h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Type a user's email into the Registry search, or select an existing indexed profile from the left sidebar documents list to begin live database streak/XP overrides.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
