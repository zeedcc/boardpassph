import React, { useState, useEffect } from 'react';
import {
  Shield, Search, RotateCcw, TrendingUp, UserCheck, Check, AlertCircle,
  RefreshCw, Trash2, Megaphone, Pin, Send, CloudUpload, Zap, Users,
  ChevronRight, CloudOff, Cloud
} from 'lucide-react';
import { UserProfile } from '../types';
import { db } from '../firebase';
import {
  collection, doc, getDoc, getDocs, setDoc, onSnapshot, deleteDoc
} from 'firebase/firestore';
import { Announcement } from './AnnouncementsPanel';

interface AdminPanelProps {
  profile: UserProfile | null;
  setProfile?: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ profile, setProfile }) => {
  /* ── state ───────────────────────────────────────────────── */
  const [searchEmail, setSearchEmail]   = useState('');
  const [allProfiles, setAllProfiles]   = useState<UserProfile[]>([]);
  const [selected, setSelected]         = useState<UserProfile | null>(null);
  const [loading, setLoading]           = useState(false);
  const [status, setStatus]             = useState<{ text: string; ok: boolean } | null>(null);

  // editable fields
  const [editXp,      setEditXp]      = useState(0);
  const [editStreak,  setEditStreak]  = useState(0);
  const [editShields, setEditShields] = useState(0);
  const [editTier,    setEditTier]    = useState<string>('Clinical Trial');

  // announcements
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [annTitle,  setAnnTitle]  = useState('');
  const [annBody,   setAnnBody]   = useState('');
  const [annType,   setAnnType]   = useState<'info' | 'warning' | 'success'>('info');
  const [annPinned, setAnnPinned] = useState(false);
  const [annLoading, setAnnLoading] = useState(false);
  const [annStatus,  setAnnStatus] = useState<{ text: string; ok: boolean } | null>(null);

  // cloud sync
  const [syncing,   setSyncing]   = useState(false);
  const [syncResult, setSyncResult] = useState<{ ok: number; fail: number } | null>(null);

  /* ── helpers ─────────────────────────────────────────────── */
  const getLocalProfiles = (): UserProfile[] => {
    const out: UserProfile[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith('bp_profile_')) continue;
      try {
        const raw = localStorage.getItem(key);
        if (raw) { const p = JSON.parse(raw) as UserProfile; if (p.email) out.push(p); }
      } catch {}
    }
    return out;
  };

  const mergeProfiles = (cloud: UserProfile[], local: UserProfile[]): UserProfile[] => {
    const m = new Map<string, UserProfile>();
    local.forEach(p => m.set(p.email.toLowerCase(), p));
    cloud.forEach(p => m.set(p.email.toLowerCase(), p));
    return Array.from(m.values()).sort((a, b) => a.email.localeCompare(b.email));
  };

  const selectProfile = (p: UserProfile) => {
    setSelected(p);
    setEditXp(p.totalXp);
    setEditStreak(p.streak);
    setEditShields(p.streakShields ?? 0);
    setEditTier(p.tier ?? 'Clinical Trial');
    setStatus(null);
  };

  /* ── real-time profiles listener ─────────────────────────── */
  useEffect(() => {
    setLoading(true);
    const unsub = onSnapshot(
      collection(db, 'profiles'),
      (snap) => {
        const cloud: UserProfile[] = [];
        snap.forEach(d => { const p = d.data() as UserProfile; if (p.email) cloud.push(p); });
        const merged = mergeProfiles(cloud, getLocalProfiles());
        setAllProfiles(merged);
        setLoading(false);
        // keep selected in sync
        setSelected(prev => {
          if (!prev) return prev;
          return merged.find(p => p.email.toLowerCase() === prev.email.toLowerCase()) ?? prev;
        });
      },
      () => {
        const local = getLocalProfiles();
        setAllProfiles(local);
        if (local.length) setStatus({ text: `⚠️ Firestore unavailable — showing ${local.length} local profile(s).`, ok: false });
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  /* ── announcements listener ──────────────────────────────── */
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'announcements'), (snap) => {
      const list: Announcement[] = [];
      snap.forEach(d => list.push(d.data() as Announcement));
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAnnouncements(list);
    }, () => {});
    return () => unsub();
  }, []);

  /* ── manual search ───────────────────────────────────────── */
  const handleSearch = async () => {
    const em = searchEmail.toLowerCase().trim();
    if (!em) return;
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, 'profiles', em));
      if (snap.exists()) { selectProfile(snap.data() as UserProfile); return; }
    } catch {}
    const local = localStorage.getItem(`bp_profile_${em}`);
    if (local) { selectProfile(JSON.parse(local) as UserProfile); setLoading(false); return; }
    setStatus({ text: `❌ No profile found for "${em}"`, ok: false });
    setLoading(false);
  };

  /* ── 1. RESET XP ─────────────────────────────────────────── */
  const handleResetXp = () => { setEditXp(0); setStatus({ text: 'XP reset to 0 — click Save to commit.', ok: true }); };

  /* ── 2. RESET STREAK ─────────────────────────────────────── */
  const handleResetStreak = () => { setEditStreak(0); setStatus({ text: 'Streak reset to 0 — click Save to commit.', ok: true }); };

  /* ── 3. SAVE (XP + streak + shields + tier) ──────────────── */
  const handleSave = async () => {
    if (!selected) return;
    setLoading(true);
    setStatus(null);
    const updated: UserProfile = {
      ...selected,
      totalXp: Number(editXp),
      streak: Number(editStreak),
      streakShields: Number(editShields),
      tier: editTier as UserProfile['tier'],
    };
    try {
      await setDoc(doc(db, 'profiles', selected.email.toLowerCase()), updated);
      localStorage.setItem(`bp_profile_${selected.email.toLowerCase()}`, JSON.stringify(updated));
      if (setProfile && profile?.email.toLowerCase() === selected.email.toLowerCase()) setProfile(updated);
      setSelected(updated);
      setAllProfiles(prev => prev.map(p => p.email.toLowerCase() === updated.email.toLowerCase() ? updated : p));
      setStatus({ text: `✅ Saved & synced ${selected.email} — Streak: ${editStreak}, XP: ${editXp}, Tier: ${editTier}.`, ok: true });
    } catch (err: any) {
      localStorage.setItem(`bp_profile_${selected.email.toLowerCase()}`, JSON.stringify(updated));
      if (setProfile && profile?.email.toLowerCase() === selected.email.toLowerCase()) setProfile(updated);
      setSelected(updated);
      setStatus({ text: `⚠️ Saved locally (Firestore error: ${err?.message ?? err}). Will sync when online.`, ok: false });
    } finally {
      setLoading(false);
    }
  };

  /* ── 4. POST ANNOUNCEMENT ────────────────────────────────── */
  const handlePostAnn = async () => {
    if (!annTitle.trim() || !annBody.trim()) { setAnnStatus({ text: 'Title and body are required.', ok: false }); return; }
    setAnnLoading(true);
    setAnnStatus(null);
    const id = `ann_${Date.now()}`;
    const ann: Announcement = {
      id, title: annTitle.trim(), body: annBody.trim(),
      author: profile?.email ?? 'Admin',
      createdAt: new Date().toISOString(),
      pinned: annPinned, type: annType,
    };
    try {
      await setDoc(doc(db, 'announcements', id), ann);
      setAnnTitle(''); setAnnBody(''); setAnnPinned(false); setAnnType('info');
      setAnnStatus({ text: '✅ Announcement posted!', ok: true });
    } catch (err: any) {
      setAnnStatus({ text: `❌ Failed: ${err?.message ?? err}`, ok: false });
    } finally {
      setAnnLoading(false);
    }
  };

  const handleDeleteAnn = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    try { await deleteDoc(doc(db, 'announcements', id)); } catch (err: any) { alert(`Delete failed: ${err?.message ?? err}`); }
  };

  /* ── 5. SYNC CLOUD TO FIREBASE ───────────────────────────── */
  const handleSyncAll = async () => {
    setSyncing(true);
    setSyncResult(null);
    setStatus(null);
    const localProfiles = getLocalProfiles();
    let ok = 0, fail = 0;
    for (const p of localProfiles) {
      try {
        await setDoc(doc(db, 'profiles', p.email.toLowerCase()), p);
        ok++;
      } catch {
        fail++;
      }
    }
    // Also try to pull all cloud profiles back into local
    try {
      const snap = await getDocs(collection(db, 'profiles'));
      snap.forEach(d => {
        const p = d.data() as UserProfile;
        if (p.email) localStorage.setItem(`bp_profile_${p.email.toLowerCase()}`, JSON.stringify(p));
      });
    } catch {}
    setSyncResult({ ok, fail });
    setSyncing(false);
  };

  /* ── derived ─────────────────────────────────────────────── */
  const filtered = allProfiles.filter(p => p.email.toLowerCase().includes(searchEmail.toLowerCase()));

  /* ── render ──────────────────────────────────────────────── */
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="text-center space-y-2 select-none">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-900/30 border border-red-500/20 rounded-full text-[10px] uppercase font-black tracking-widest text-[#EC9FA5] animate-pulse">
          <Shield className="w-3.5 h-3.5" />
          Admin Console · studyfilesbyz@gmail.com
        </div>
        <h2 className="font-display text-3xl text-pine">Admin Panel</h2>
        <p className="text-xs text-gray-500 max-w-lg mx-auto leading-relaxed">
          Manage reviewee profiles, post announcements, and sync all data to Firebase Cloud Firestore.
        </p>
      </div>

      {/* ── SYNC CLOUD TO FIREBASE ─────────────────────────── */}
      <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <CloudUpload className="w-4 h-4 text-pine" />
            <span className="text-xs uppercase font-extrabold text-pine tracking-wide">Sync Cloud to Firebase</span>
          </div>
          <span className="text-[10px] text-gray-400 font-mono">{allProfiles.length} profiles indexed</span>
        </div>
        <p className="text-[11px] text-gray-400 leading-relaxed">
          Pushes every locally cached profile to Google Cloud Firestore, then pulls the full cloud snapshot back into local storage for consistency.
        </p>
        {syncResult && (
          <div className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold ${syncResult.fail === 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-amber-50 border-amber-100 text-amber-800'}`}>
            {syncResult.fail === 0 ? <Cloud className="w-4 h-4" /> : <CloudOff className="w-4 h-4" />}
            {syncResult.ok} synced · {syncResult.fail} failed
          </div>
        )}
        <button
          onClick={handleSyncAll}
          disabled={syncing}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pine to-emerald-800 hover:from-pine-mid text-white font-bold text-xs rounded-xl cursor-pointer shadow hover:shadow-md transition disabled:opacity-50 select-none"
        >
          {syncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CloudUpload className="w-3.5 h-3.5" />}
          {syncing ? 'Syncing all profiles…' : 'Sync All to Firebase'}
        </button>
      </div>

      {/* ── ANNOUNCEMENT COMPOSER ──────────────────────────── */}
      <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <Megaphone className="w-4 h-4 text-pine" />
          <span className="text-xs uppercase font-extrabold text-pine tracking-wide">Post Announcement</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Title</label>
            <input
              value={annTitle} onChange={e => setAnnTitle(e.target.value)}
              placeholder="e.g. System maintenance on Aug 5"
              className="w-full px-3 py-2 border border-gray-200 outline-none rounded-xl text-xs bg-gray-50/50 focus:bg-white focus:border-pine font-sans transition"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1 space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Type</label>
              <select value={annType} onChange={e => setAnnType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-200 outline-none rounded-xl text-xs bg-gray-50/50 focus:border-pine transition">
                <option value="info">ℹ️ Info</option>
                <option value="warning">⚠️ Warning</option>
                <option value="success">✅ Success</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Pin</label>
              <button type="button" onClick={() => setAnnPinned(p => !p)}
                className={`h-9 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer select-none ${annPinned ? 'bg-pine text-cream border-pine' : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-pine/30'}`}>
                <Pin className="w-3.5 h-3.5" />{annPinned ? 'Pinned' : 'Pin it'}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Body</label>
          <textarea value={annBody} onChange={e => setAnnBody(e.target.value)}
            placeholder="Write the announcement message here…" rows={3}
            className="w-full px-3 py-2 border border-gray-200 outline-none rounded-xl text-xs bg-gray-50/50 focus:bg-white focus:border-pine font-sans transition resize-none" />
        </div>

        {annStatus && (
          <div className={`p-2.5 rounded-xl border text-xs font-semibold ${annStatus.ok ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
            {annStatus.text}
          </div>
        )}

        <div className="flex justify-end">
          <button onClick={handlePostAnn} disabled={annLoading}
            className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-pine to-emerald-800 hover:from-pine-mid text-white font-bold text-xs rounded-xl cursor-pointer shadow hover:shadow-md transition disabled:opacity-50 select-none">
            {annLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Post Announcement
          </button>
        </div>

        {announcements.length > 0 && (
          <div className="border-t border-gray-100 pt-4 space-y-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Posted ({announcements.length})</span>
            <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
              {announcements.map(ann => (
                <div key={ann.id} className="flex items-start justify-between gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {ann.pinned && <Pin className="w-3 h-3 text-pine" />}
                      <span className="text-xs font-bold text-gray-800 truncate">{ann.title}</span>
                      <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${ann.type === 'warning' ? 'bg-amber-100 text-amber-800' : ann.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                        {ann.type}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-1">{ann.body}</p>
                  </div>
                  <button onClick={() => handleDeleteAnn(ann.id)}
                    className="p-1.5 hover:bg-rose-50 hover:text-rose-600 text-gray-400 rounded-lg transition cursor-pointer shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── REVIEWEE MANAGER ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* Left: profile list */}
        <div className="bg-white border border-gray-150 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-pine" />
              <span className="text-xs uppercase font-extrabold text-pine tracking-wide">Reviewee Registry</span>
            </div>
            <button onClick={async () => {
              setLoading(true);
              try {
                const snap = await getDocs(collection(db, 'profiles'));
                const cloud: UserProfile[] = [];
                snap.forEach(d => { const p = d.data() as UserProfile; if (p.email) cloud.push(p); });
                setAllProfiles(mergeProfiles(cloud, getLocalProfiles()));
              } catch { setAllProfiles(getLocalProfiles()); }
              setLoading(false);
            }} disabled={loading}
              className="p-1 px-2.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-[10px] text-teal-800 font-bold tracking-tight transition flex items-center gap-1 cursor-pointer select-none">
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {/* Search */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
              <input value={searchEmail} onChange={e => setSearchEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="email@example.com"
                className="w-full pl-9 pr-3 py-1.5 border border-gray-200 outline-none rounded-xl text-xs bg-gray-50/50 focus:bg-white focus:border-pine font-mono transition" />
            </div>
            <button onClick={handleSearch}
              className="px-3.5 py-1.5 bg-pine text-white font-bold text-xs rounded-xl cursor-pointer hover:bg-pine-mid transition">
              Load
            </button>
          </div>

          {/* Profile list */}
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">All ({filtered.length})</span>
            <div className="border border-gray-100 rounded-xl overflow-hidden max-h-64 overflow-y-auto divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <div className="p-4 text-center text-[11px] text-gray-400 italic">No profiles found.</div>
              ) : filtered.map(p => {
                const isSel = selected?.email.toLowerCase() === p.email.toLowerCase();
                return (
                  <button key={p.email} onClick={() => selectProfile(p)}
                    className={`w-full flex items-center justify-between text-left p-2.5 transition text-xs select-none cursor-pointer ${isSel ? 'bg-pine text-white' : 'hover:bg-gray-50 text-gray-700'}`}>
                    <div className="truncate pr-2">
                      <span className="font-mono font-medium block truncate text-[11px] leading-tight">{p.email}</span>
                      <span className={`text-[9px] uppercase tracking-wider font-extrabold ${isSel ? 'text-teal-200' : 'text-teal-700'}`}>{p.tier}</span>
                    </div>
                    <div className="text-right shrink-0 flex items-center gap-1">
                      <div>
                        <span className="text-[10px] block font-mono font-bold">{p.totalXp} XP</span>
                        <span className="text-[9px] block text-gray-400">⚡ {p.streak}d</span>
                      </div>
                      <ChevronRight className={`w-3 h-3 shrink-0 ${isSel ? 'text-white/50' : 'text-gray-300'}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: edit panel */}
        <div className="lg:col-span-2 bg-white border border-gray-150 rounded-3xl p-6 shadow-sm">
          {selected ? (
            <div className="space-y-6">

              {/* Selected profile header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gray-50/70 border border-gray-100 p-4 rounded-2xl">
                <div className="space-y-1 min-w-0">
                  <span className="text-[9px] uppercase tracking-wide font-black text-teal-700 block">Editing Profile</span>
                  <h3 className="font-mono text-base font-bold text-gray-900 truncate max-w-xs">{selected.email}</h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-0.5 border border-amber-300 bg-amber-50 rounded-full text-[9px] text-amber-800 font-extrabold uppercase">XP: {selected.totalXp}</span>
                    <span className="px-2 py-0.5 border border-rose-300 bg-rose-50 rounded-full text-[9px] text-rose-800 font-extrabold uppercase">Streak: {selected.streak}d</span>
                    <span className="px-2 py-0.5 border border-teal-300 bg-teal-50 rounded-full text-[9px] text-teal-800 font-extrabold uppercase">{selected.tier}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <UserCheck className="w-4 h-4 text-teal-500" />
                  <span className="text-[10px] font-mono text-gray-500 bg-teal-50 border border-teal-100 px-2 py-1 rounded-lg font-bold">Selected</span>
                </div>
              </div>

              {/* Controls grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* 1 + 2: Streak & XP resets */}
                <div className="border border-gray-100 p-4 rounded-2xl bg-white space-y-4 shadow-sm">
                  <h4 className="text-xs uppercase font-extrabold text-pine tracking-wide flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" /> Streak & XP
                  </h4>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Streak (days)</label>
                      <div className="flex gap-2">
                        <input type="number" min="0" value={editStreak}
                          onChange={e => setEditStreak(Math.max(0, parseInt(e.target.value) || 0))}
                          className="flex-1 px-3 py-1.5 border border-gray-200 outline-none rounded-xl text-xs bg-gray-50/50 focus:bg-white focus:border-pine font-mono transition" />
                        <button onClick={handleResetStreak}
                          className="px-3 py-1.5 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-800 rounded-xl text-[10px] font-bold flex items-center gap-1 cursor-pointer transition">
                          <RotateCcw className="w-3 h-3" /> Reset
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total XP</label>
                      <div className="flex gap-2">
                        <input type="number" min="0" value={editXp}
                          onChange={e => setEditXp(Math.max(0, parseInt(e.target.value) || 0))}
                          className="flex-1 px-3 py-1.5 border border-gray-200 outline-none rounded-xl text-xs bg-gray-50/50 focus:bg-white focus:border-pine font-mono transition" />
                        <button onClick={handleResetXp}
                          className="px-3 py-1.5 bg-red-50 border border-red-200 hover:bg-red-100 text-red-800 rounded-xl text-[10px] font-bold flex items-center gap-1 cursor-pointer transition">
                          <RotateCcw className="w-3 h-3" /> Reset
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Streak Shields</label>
                      <input type="number" min="0" value={editShields}
                        onChange={e => setEditShields(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-3 py-1.5 border border-gray-200 outline-none rounded-xl text-xs bg-gray-50/50 focus:bg-white focus:border-pine font-mono transition" />
                    </div>
                  </div>
                </div>

                {/* 4: Upgrade plan */}
                <div className="border border-gray-100 p-4 rounded-2xl bg-white space-y-4 shadow-sm">
                  <h4 className="text-xs uppercase font-extrabold text-pine tracking-wide flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-teal-500" /> Upgrade Plan
                  </h4>
                  <p className="text-[10px] text-gray-400 leading-relaxed">Set the subscription tier directly — useful for manual GCash confirmations.</p>
                  <div className="space-y-2">
                    {(['Free', 'Clinical Trial', 'Pro', 'Clinical'] as const).map(tier => (
                      <button key={tier} onClick={() => setEditTier(tier)}
                        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${editTier === tier
                          ? tier === 'Pro'      ? 'bg-amber-500 text-white border-amber-500'
                          : tier === 'Clinical' ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-pine text-cream border-pine'
                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
                        }`}>
                        <span>{tier}</span>
                        {editTier === tier && <Check className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono pt-1">
                    Prices: Free (₱0) · Pro (₱79/mo) · Clinical (₱149/mo)
                  </div>
                </div>
              </div>

              {/* Status */}
              {status && (
                <div className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${status.ok ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
                  {status.ok ? <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />}
                  <span className="leading-normal font-semibold">{status.text}</span>
                </div>
              )}

              {/* Save footer */}
              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button onClick={() => selectProfile(selected)}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-xs font-semibold cursor-pointer select-none transition">
                  Discard
                </button>
                <button onClick={handleSave} disabled={loading}
                  className="px-5 py-2 bg-gradient-to-r from-pine to-emerald-800 hover:from-pine-mid text-white font-bold text-xs rounded-xl cursor-pointer shadow hover:shadow-md transition disabled:opacity-60 flex items-center gap-1.5 select-none">
                  {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Save & Sync to Firestore
                </button>
              </div>

            </div>
          ) : (
            <div className="py-24 text-center space-y-3">
              <Shield className="w-12 h-12 text-gray-200 mx-auto" />
              <div>
                <h4 className="text-sm font-bold text-gray-600">No Reviewee Selected</h4>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                  Search an email or pick one from the registry on the left to start editing.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
