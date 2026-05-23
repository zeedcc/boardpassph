import React, { useState, useRef } from 'react';
import { Camera, Edit3, Save, X, User, School, Lock, Eye, EyeOff, Star, Flame, Target } from 'lucide-react';
import { UserProfile } from '../types';

interface ProfilePanelProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

function getLevelFromXp(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

function getAccuracy(profile: UserProfile): number {
  if (profile.attempts === 0) return 0;
  return Math.round((profile.correct / profile.attempts) * 100);
}

export const ProfilePanel: React.FC<ProfilePanelProps> = ({ profile, setProfile }) => {
  const [isEditing, setIsEditing] = useState(false);

  const [draftUsername, setDraftUsername] = useState(profile.username || '');
  const [draftSchool, setDraftSchool] = useState(profile.school || '');
  const [draftPhoto, setDraftPhoto] = useState(profile.photo || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  const fileRef = useRef<HTMLInputElement>(null);

  const level = getLevelFromXp(profile.totalXp);
  const accuracy = getAccuracy(profile);
  const coins = 0;
  const displayName = profile.username || profile.email.split('@')[0];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      setSaveError('Photo must be under 500 KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setDraftPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    setSaveError('');
    setSaveSuccess('');

    if (newPassword) {
      if (!currentPassword) {
        setSaveError('Enter your current password to change it.');
        return;
      }
      if (currentPassword !== profile.password) {
        setSaveError('Current password is incorrect.');
        return;
      }
      if (newPassword.length < 6) {
        setSaveError('New password must be at least 6 characters.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setSaveError('New passwords do not match.');
        return;
      }
    }

    setProfile(prev => {
      if (!prev) return prev;
      const updated: UserProfile = {
        ...prev,
        username: draftUsername.trim() || undefined,
        school: draftSchool.trim() || undefined,
        photo: draftPhoto || undefined,
        ...(newPassword ? { password: newPassword } : {})
      };
      localStorage.setItem(`bp_profile_${prev.email}`, JSON.stringify(updated));
      return updated;
    });

    setSaveSuccess('Profile updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsEditing(false);
  };

  async function registerAndSubscribeForPush(email: string) {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      // fetch vapid key
      const r = await fetch('/api/push/vapidPublicKey');
      const data = await r.json();
      const publicKey = data.publicKey;
      function urlBase64ToUint8Array(base64String: string) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
          outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
      }
      const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(publicKey) });
      await fetch('/api/push/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, subscription: sub }) });
      return true;
    } catch (e) {
      console.warn('Push subscription failed', e);
      return false;
    }
  }

  const handleCancel = () => {
    setDraftUsername(profile.username || '');
    setDraftSchool(profile.school || '');
    setDraftPhoto(profile.photo || '');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setSaveError('');
    setSaveSuccess('');
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">

      {/* ID Card */}
      <div className="relative bg-gradient-to-br from-pine to-pine-mid rounded-3xl overflow-hidden shadow-xl border border-pine-light/20">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-mint via-sage to-pine-light" />

        <div className="relative p-6 sm:p-8">
          <div className="flex items-start gap-5">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl border-2 border-mint/30 overflow-hidden bg-pine shadow-lg">
                {draftPhoto || profile.photo ? (
                  <img src={draftPhoto || profile.photo} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-pine-light/20">
                    <User className="w-9 h-9 text-mint/60" />
                  </div>
                )}
              </div>
              {isEditing && (
                <>
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-mint text-pine rounded-lg flex items-center justify-center shadow cursor-pointer hover:bg-white transition"
                    title="Upload photo"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[9px] uppercase tracking-[0.3em] text-mint/70 font-mono font-bold">BoardPassPH Reviewee</span>
                <span className="text-[9px] bg-mint/15 text-mint border border-mint/20 px-2 py-0.5 rounded-full font-bold font-mono">LVL {level}</span>
              </div>
              <h2 className="font-display text-2xl text-cream leading-tight truncate">{displayName}</h2>
              <p className="text-xs text-mint/60 font-mono">{profile.email}</p>
              {(profile.school || isEditing) && (
                <p className="text-xs text-mint/50 font-sans flex items-center gap-1">
                  <School className="w-3 h-3" />
                  <span>{profile.school || '—'}</span>
                </p>
              )}
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-mint/10 hover:bg-mint/20 border border-mint/20 text-mint text-[10px] font-bold uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                Edit
              </button>
            )}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3 mt-6 pt-5 border-t border-pine-light/20">
            {[
                { icon: Star, label: 'XP', value: profile.totalXp.toLocaleString(), color: 'text-amber-300' },
                { icon: Flame, label: 'Streak', value: `${profile.streak}d`, color: 'text-orange-400' },
                { icon: Target, label: 'Accuracy', value: `${accuracy}%`, color: 'text-emerald-400' },
            ].map(stat => (
              <div key={stat.label} className="text-center space-y-1">
                <stat.icon className={`w-4 h-4 mx-auto ${stat.color}`} />
                <div className={`font-display text-lg leading-none ${stat.color}`}>{stat.value}</div>
                <div className="text-[9px] uppercase font-bold text-mint/40 tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Form */}
      {isEditing && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
          <h3 className="font-heading font-black text-pine text-xs uppercase tracking-widest flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-sage" />
            Edit Profile
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1.5">
                <User className="w-3 h-3" /> Display Name
              </label>
              <input
                type="text"
                value={draftUsername}
                onChange={e => setDraftUsername(e.target.value)}
                placeholder={profile.email.split('@')[0]}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-sage outline-none transition"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1.5">
                <School className="w-3 h-3" /> School / Institution
              </label>
              <input
                type="text"
                value={draftSchool}
                onChange={e => setDraftSchool(e.target.value)}
                placeholder="e.g. University of Santo Tomas"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-sage outline-none transition"
              />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-3">
            <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1.5">
              Settings
            </h4>
            <div className="grid grid-cols-1 gap-3">
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={!!profile.rememberQuestionHistory} onChange={e => setProfile(p => p ? { ...p, rememberQuestionHistory: e.target.checked } : null)} />
                <span className="text-sm">Remember seen questions (avoid repeats)</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={!!profile.allowPushNotifications} onChange={async e => {
                  const want = e.target.checked;
                  if (want && 'Notification' in window) {
                    try {
                      const perm = await Notification.requestPermission();
                      if (perm !== 'granted') {
                        alert('Notifications permission denied or dismissed. You can enable it in browser settings.');
                      } else {
                        // register service worker and subscribe
                        const ok = await registerAndSubscribeForPush(profile.email);
                        if (!ok) alert('Push subscription failed. Notifications may not work.');
                      }
                    } catch (err) { console.warn(err); }
                  }
                  setProfile(p => p ? { ...p, allowPushNotifications: want } : null);
                }} />
                <span className="text-sm">Enable calendar / PWA notifications</span>
              </label>
              <label className="flex items-center gap-3">
                <input type="checkbox" checked={!!profile.autoSubjectAccuracy} onChange={e => setProfile(p => p ? { ...p, autoSubjectAccuracy: e.target.checked } : null)} />
                <span className="text-sm">Auto subject accuracy (prioritize weak subjects)</span>
              </label>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-3">
            <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Habits</h4>
            <div className="space-y-2">
              <HabitsEditor profile={profile} setProfile={setProfile} />
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-3">
            <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1.5">
              <Lock className="w-3 h-3" /> Change Password <span className="font-normal normal-case text-gray-300">(leave blank to keep current)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Current Password', value: currentPassword, setter: setCurrentPassword, show: showCurrent, toggle: () => setShowCurrent(p => !p) },
                { label: 'New Password', value: newPassword, setter: setNewPassword, show: showNew, toggle: () => setShowNew(p => !p) },
                { label: 'Confirm New', value: confirmPassword, setter: setConfirmPassword, show: showNew, toggle: () => setShowNew(p => !p) },
              ].map(field => (
                <div key={field.label} className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">{field.label}</label>
                  <div className="relative">
                    <input
                      type={field.show ? 'text' : 'password'}
                      value={field.value}
                      onChange={e => field.setter(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:border-sage outline-none transition pr-9"
                    />
                    <button
                      type="button"
                      onClick={field.toggle}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {field.show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {saveError && (
            <p className="text-xs text-rose-600 bg-rose-50 border border-rose-100 px-3 py-2 rounded-xl">{saveError}</p>
          )}

          <div className="flex gap-2 justify-end pt-1">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-200 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-50 transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5 inline mr-1" />Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-pine text-white text-xs font-bold rounded-xl hover:bg-pine-mid transition cursor-pointer shadow"
            >
              <Save className="w-3.5 h-3.5 inline mr-1" />Save Changes
            </button>
          </div>
        </div>
      )}

      {saveSuccess && !isEditing && (
        <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-3 rounded-xl text-center font-bold">
          ✓ {saveSuccess}
        </p>
      )}

      {/* Account summary */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <h3 className="font-heading font-black text-pine text-xs uppercase tracking-widest mb-4">Session Overview</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
          {[
            { label: 'Total Questions', value: profile.attempts },
            { label: 'Correct Answers', value: profile.correct },
            { label: 'Missed (In Deck)', value: profile.deck.length },
            { label: 'Total XP Earned', value: profile.totalXp.toLocaleString() },
            { label: 'Streak Shields', value: profile.streakShields },
            // coins removed
          ].map(stat => (
            <div key={stat.label} className="bg-foam/40 border border-sage/10 rounded-xl p-3 space-y-0.5">
              <div className="font-display text-xl text-pine">{stat.value}</div>
              <div className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-4 font-mono">
          Member since {profile.signUpDate || 'N/A'} · {profile.email}
        </p>
      </div>

      <div className="mt-4 text-center">
        <button
          onClick={() => {
            if (!confirm('Permanently delete your account and all local data? THIS CANNOT BE UNDONE.')) return;
            try { localStorage.removeItem(`bp_profile_${profile.email}`); } catch {};
            setProfile({} as UserProfile);
            window.location.reload();
          }}
          className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold"
        >
          Permanently Delete Account
        </button>
      </div>

    </div>
  );
};

const HabitsEditor: React.FC<{ profile: UserProfile; setProfile: React.Dispatch<React.SetStateAction<UserProfile>> }> = ({ profile, setProfile }) => {
  const [newHabit, setNewHabit] = useState('');
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const habits = profile.habits || [];

  const persist = (updated: string[]) => {
    setProfile(p => {
      const next = { ...p, habits: updated } as UserProfile;
      localStorage.setItem(`bp_profile_${p.email}`, JSON.stringify(next));
      return next;
    });
  };

  const addHabit = () => {
    const v = newHabit.trim();
    if (!v) return;
    persist([...habits, v]);
    setNewHabit('');
  };

  const removeHabit = (idx: number) => {
    persist(habits.filter((_, i) => i !== idx));
  };

  const startEdit = (idx: number) => {
    setEditingIdx(idx);
    setEditValue(habits[idx]);
  };

  const saveEdit = () => {
    if (editingIdx === null || !editValue.trim()) return;
    const updated = habits.map((h, i) => (i === editingIdx ? editValue.trim() : h));
    persist(updated);
    setEditingIdx(null);
  };

  return (
    <div>
      <div className="flex gap-2">
        <input value={newHabit} onChange={e => setNewHabit(e.target.value)} placeholder="New habit (e.g. 30m review)" className="flex-1 border rounded-xl px-3 py-2" />
        <button onClick={addHabit} className="px-3 py-2 bg-mint text-pine rounded-xl">Add</button>
      </div>
      <div className="mt-2 space-y-2">
        {habits.length === 0 && <div className="text-sm text-gray-400">No habits yet.</div>}
        {habits.map((h, i) => (
          <div key={i} className="flex items-center justify-between gap-2 bg-foam/40 border border-sage/10 rounded-xl px-3 py-2">
            {editingIdx === i ? (
              <>
                <input value={editValue} onChange={e => setEditValue(e.target.value)} className="flex-1 text-sm border rounded-lg px-2 py-1" />
                <button onClick={saveEdit} className="text-xs text-emerald-700 font-bold">Save</button>
                <button onClick={() => setEditingIdx(null)} className="text-xs text-gray-500">Cancel</button>
              </>
            ) : (
              <>
                <div className="text-sm flex-1">{h}</div>
                <button onClick={() => startEdit(i)} className="text-xs text-pine font-bold">Edit</button>
                <button onClick={() => removeHabit(i)} className="text-xs text-rose-600">Delete</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
