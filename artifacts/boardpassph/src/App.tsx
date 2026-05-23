import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Target, 
  Award, 
  Layers, 
  Activity, 
  Calendar, 
  CreditCard, 
  LogOut, 
  ShieldAlert, 
  Flame, 
  Zap, 
  Palette,
  MessageSquare,
  Shield,
  Trophy,
  Calculator,
  Megaphone,
  User,
  Menu,
  X
} from 'lucide-react';
import { UserProfile, Question } from './types';
import { getPreviousQuestionsForAi } from './utils/profileHelpers';
import { Header } from './components/Header';
import { RpgBar } from './components/RpgBar';
import { StudentHubCard } from './components/StudentHubCard';
import { LibraryPanel } from './components/LibraryPanel';
import { PracticePanel } from './components/PracticePanel';
import { MockExamPanel } from './components/MockExamPanel';
import { SpacedRepPanel } from './components/SpacedRepPanel';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { StudyPlannerPanel } from './components/StudyPlannerPanel';
import { BillingPanel } from './components/BillingPanel';
import { FeedbackPanel } from './components/FeedbackPanel';
import { AdminPanel } from './components/AdminPanel';
import { LeaderboardPanel } from './components/LeaderboardPanel';
import { FocusArenaPanel } from './components/FocusArenaPanel';
import { WeightedCalculatorPanel } from './components/WeightedCalculatorPanel';
import { AnnouncementsPanel } from './components/AnnouncementsPanel';
import { ProfilePanel } from './components/ProfilePanel';
import { getRandomLocalQuestion } from './utils/questionGenerator';
import { db, firestoreWithTimeout } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const THEME_OPTIONS = [
  { id: 'strawberry-matcha', name: 'Strawberry Matcha', emoji: '🍓🍵', bg: 'bg-[#1B3518]', accent: 'bg-[#E5526C]' },
  { id: 'lilac-dream', name: 'Lilac Dream', emoji: '💜🦄', bg: 'bg-[#261B4E]', accent: 'bg-[#9C85E5]' },
  { id: 'winter', name: 'Winter Frost', emoji: '❄️☃️', bg: 'bg-[#0F2038]', accent: 'bg-[#50A3EF]' },
  { id: 'pastel-pink-coquette', name: 'Pastel Coquette', emoji: '🎀🩰', bg: 'bg-[#401B22]', accent: 'bg-[#EC9FA5]' },
  { id: 'red-blush', name: 'Red Blush', emoji: '🌹💄', bg: 'bg-[#470D14]', accent: 'bg-[#F43F5E]' }
];

export default function App() {
  const [emailInput, setEmailInput] = useState('');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<string>('plannerTab');
  const [navOpen, setNavOpen] = useState(false);
  
  const [theme, setTheme] = useState<string>(() => {
    return localStorage.getItem('bp_theme') || 'strawberry-matcha';
  });

  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordHintInput, setPasswordHintInput] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryStep, setRecoveryStep] = useState<'email' | 'reset'>('email');
  const [recoveredProfile, setRecoveredProfile] = useState<UserProfile | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [recoveryOtp, setRecoveryOtp] = useState('');
  const [enteredRecoveryOtp, setEnteredRecoveryOtp] = useState('');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('bp_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!profile) return;
    if (window.location.hash.includes('group-study=')) {
      setActiveTab('focusArenaTab');
    }
  }, [profile]);

  const [syncStatus, setSyncStatus] = useState<'syncing' | 'synced'>('synced');

  useEffect(() => {
    if (!profile) return;
    
    localStorage.setItem(`bp_profile_${profile.email}`, JSON.stringify(profile));

    const syncDoc = async () => {
      setSyncStatus('syncing');
      try {
        const docRef = doc(db, 'profiles', profile.email);
        await firestoreWithTimeout(setDoc(docRef, profile));
        setSyncStatus('synced');
      } catch (err) {
        console.warn('Background cloud profile synchronization deferred:', err);
        setSyncStatus('synced');
      }
    };
    syncDoc();
  }, [profile]);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    if (profile) {
      const updated = { ...profile, theme: newTheme };
      setProfile(updated);
      localStorage.setItem(`bp_profile_${profile.email}`, JSON.stringify(updated));
    }
  };

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'budget' | 'standard' | 'premium'>('budget');

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      alert("Please enter a valid reviewee email address!");
      return;
    }
    
    const emailLower = emailInput.toLowerCase().trim();
    const todayStr = new Date().toISOString().split('T')[0];
    
    let storedProfile: UserProfile | null = null;
    let fallbackUsed = false;

    try {
      const docRef = doc(db, 'profiles', emailLower);
      const docSnap = await firestoreWithTimeout(getDoc(docRef));
      if (docSnap.exists()) {
        storedProfile = docSnap.data() as UserProfile;
      }
    } catch (err) {
      console.warn('Firestore read failed during auth, attempting local storage fallback:', err);
    }

    const localStored = localStorage.getItem(`bp_profile_${emailLower}`);
    if (!storedProfile && localStored) {
      storedProfile = JSON.parse(localStored);
      fallbackUsed = true;
    }

    if (authMode === 'signup') {
      if (!passwordInput) {
        alert("Please set up a reviewee access password!");
        return;
      }
      if (storedProfile) {
        alert("⚠️ Email already registered! Switching to \"Sign In\" so you can enter the board room.");
        setAuthMode('login');
        return;
      }

      const newProfile: UserProfile = {
        email: emailLower,
        tier: 'Clinical Trial',
        totalXp: 150,
        streak: 1,
        streakShields: 1,
        lastDate: todayStr,
        currentCombo: 0,
        attempts: 0,
        correct: 0,
        adaptive: true,
        deck: [],
        notes: {},
        heat: { [todayStr]: 0 },
        badges: {},
        theme: theme,
        password: passwordInput,
        passwordHint: passwordHintInput.trim() || 'No password hint was set.',
        signUpDate: todayStr,
        rememberQuestionHistory: true,
        autoSubjectAccuracy: true,
      };

      try {
        setSyncStatus('syncing');
        const docRef = doc(db, 'profiles', emailLower);
        await firestoreWithTimeout(setDoc(docRef, newProfile));
        setSyncStatus('synced');
        alert("🎉 Cloud Account Created Successfully! Welcome to BoardPassPH.");
      } catch (err) {
        setSyncStatus('synced');
        console.warn('Fallen back to local sandbox context:', err);
        alert("🎉 Account Created Successfully! Saved on local sandbox context.");
      }

      setProfile(newProfile);
      setActiveTab('plannerTab');
      setPasswordInput('');
      setPasswordHintInput('');
      return;
    }

    if (authMode === 'login') {
      if (!storedProfile) {
        alert("⚠️ Reviewee email not registered! Type your email and select \"Sign Up\" first to create your board credentials.");
        setAuthMode('signup');
        return;
      }

      if (storedProfile.password) {
        if (storedProfile.password !== passwordInput) {
          alert("❌ Incorrect password! Please verify your password. If forgotten, select the \"Forgot Password\" utility.");
          return;
        }
      } else {
        storedProfile.password = passwordInput || '123456';
        storedProfile.passwordHint = 'Legacy Auto-Set Hint';
      }

      if (storedProfile.lastDate && storedProfile.lastDate !== todayStr) {
        const last = new Date(storedProfile.lastDate);
        const today = new Date(todayStr);
        const diffTime = Math.abs(today.getTime() - last.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays > 1) {
          if (storedProfile.streakShields && storedProfile.streakShields > 0) {
            storedProfile.streakShields -= 1;
            alert(`🛡️ Streak Shield Activated! Your ${storedProfile.streak}-day review streak has been preserved.`);
          } else {
            storedProfile.streak = 0;
            storedProfile.currentCombo = 0;
          }
        } else if (diffDays === 1) {
          storedProfile.streak += 1;
        }
      }
      
      storedProfile.lastDate = todayStr;
      
      if (storedProfile.theme) {
        setTheme(storedProfile.theme);
      } else {
        storedProfile.theme = theme;
      }

      if (!storedProfile.signUpDate) {
        storedProfile.signUpDate = storedProfile.lastDate || todayStr;
      }

      const storedNotes = localStorage.getItem(`bp_notes_${emailLower}`);
      if (storedNotes && (!storedProfile.notes || Object.keys(storedProfile.notes).length === 0)) {
        storedProfile.notes = JSON.parse(storedNotes);
      }

      if (fallbackUsed) {
        try {
          setSyncStatus('syncing');
          await firestoreWithTimeout(setDoc(doc(db, 'profiles', emailLower), storedProfile));
          setSyncStatus('synced');
        } catch (syncErr) {
          setSyncStatus('synced');
          console.warn('Deferred account migration sync:', syncErr);
        }
      }

      setProfile(storedProfile);
      setActiveTab('plannerTab');
      setPasswordInput('');
    }
  };

  const handleForgotPasswordVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail.trim()) {
      alert("Please specify your registered email address!");
      return;
    }
    const emailLower = recoveryEmail.toLowerCase().trim();
    
    let loadedProfile: UserProfile | null = null;
    try {
      const docSnap = await firestoreWithTimeout(getDoc(doc(db, 'profiles', emailLower)));
      if (docSnap.exists()) {
        loadedProfile = docSnap.data() as UserProfile;
      }
    } catch (err) {
      console.warn('Firestore read failed during recovery:', err);
    }

    if (!loadedProfile) {
      const localStored = localStorage.getItem(`bp_profile_${emailLower}`);
      if (localStored) {
        loadedProfile = JSON.parse(localStored);
      }
    }

    if (!loadedProfile) {
      alert("❌ Reviewee email not found in cloud or local system! Confirm spelling or register as a new reviewee.");
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const apiBase = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '';
    try {
      const res = await fetch(`${apiBase}/api/send-recovery-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient_email: emailLower, otp }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload.error || 'Unable to send recovery email. Ensure the API server is running with MY_EMAIL and MY_PASSWORD set.');
      }
      alert('Recovery email sent. Check your inbox (and spam) for the OTP.');
      setRecoveredProfile(loadedProfile);
      setRecoveryOtp(otp);
      setEnteredRecoveryOtp('');
      setRecoveryStep('reset');
    } catch (err) {
      console.error('Recovery email failed', err);
      const hint = err instanceof Error ? err.message : 'Email delivery failed';
      alert(`${hint}\n\nFor local dev: run the API server (port 8080) and set MY_EMAIL + MY_PASSWORD (Gmail App Password).`);
    }
  };

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredRecoveryOtp.trim()) {
      alert('Enter the OTP sent to your recovery email.');
      return;
    }
    if (enteredRecoveryOtp !== recoveryOtp) {
      alert('Incorrect OTP. Please check the code in your email.');
      return;
    }
    if (!newPasswordInput.trim()) {
      alert("Reviewee password cannot be blank!");
      return;
    }
    if (!recoveredProfile) return;

    recoveredProfile.password = newPasswordInput;
    localStorage.setItem(`bp_profile_${recoveredProfile.email}`, JSON.stringify(recoveredProfile));
    
    try {
      setSyncStatus('syncing');
      await firestoreWithTimeout(setDoc(doc(db, 'profiles', recoveredProfile.email), recoveredProfile));
      setSyncStatus('synced');
      alert("💚 Password reset successful! Cloud credentials synchronized. Log in below with your updated password.");
    } catch (err) {
      setSyncStatus('synced');
      console.warn('Firestore cloud lock synchronized error:', err);
      alert("💚 Password reset successful! Log in below with your updated password.");
    }

    setEmailInput(recoveredProfile.email);
    setAuthMode('login');
    setRecoveryEmail('');
    setRecoveryStep('email');
    setRecoveredProfile(null);
    setNewPasswordInput('');
  };

  const handleLogout = () => {
    setProfile(null);
    setCurrentQuestion(null);
    setEmailInput('');
    setPasswordInput('');
  };

  const handleFetchQuestion = async (
    focusArea: string, 
    source: 'dsm5' | 'pharma' | 'assessment' | 'dev' | 'io' | 'local_test',
    difficulty: 'easy' | 'medium' | 'hard' | 'random' = 'random',
    fileData?: string,
    fileMimeType?: string
  ) => {
    if (!profile) return;

    setLoadingQuestion(true);
    setCurrentQuestion(null);

    try {
      let finalFocusArea = focusArea;
      if (profile.adaptive) {
        finalFocusArea += ` (Integrate specific emphasis on fields where correctness is historically lower than 75% accuracy)`;
      }
      // auto subject accuracy: prioritize weakest subject if enabled
      if (profile.autoSubjectAccuracy && profile.subjectAccuracy && Object.keys(profile.subjectAccuracy).length > 0) {
        try {
          const entries = Object.entries(profile.subjectAccuracy || {});
          entries.sort((a, b) => a[1] - b[1]);
          const weakest = entries[0]?.[0];
          if (weakest) finalFocusArea += ` (Focus more on: ${weakest})`;
        } catch (e) { /* ignore */ }
      }

      const previousQuestions = getPreviousQuestionsForAi(profile);
      const res = await fetch("/api/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          focusArea: finalFocusArea, 
          source, 
          difficulty,
          fileData,
          fileMimeType,
          model: selectedModel,
          previousQuestions
        })
      });

      const qObj = await res.json();
      setCurrentQuestion(qObj);

    } catch (err) {
      console.warn("Backend failed or API not configured, using local generator:", err);
      const fallbackSource = source === 'local_test' ? 'assessment' : (source === 'dsm5' ? undefined : source);
      const localQ = getRandomLocalQuestion(fallbackSource, difficulty);
      setCurrentQuestion(localQ);
    } finally {
      setLoadingQuestion(false);
    }
  };

  const handlePracticeLocalTest = (question: Question) => {
    setCurrentQuestion(question);
    setActiveTab('quizTab');
  };

  const handleLoadGeneratedQuestion = (question: Question) => {
    setCurrentQuestion(question);
  };

  const handleStartReviewQuiz = (question: Question) => {
    setCurrentQuestion(question);
    setActiveTab('quizTab');
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pine via-pine-mid to-[#091b14] flex flex-col justify-center items-center p-6 relative overflow-hidden transition-all duration-300">
        <div className="absolute top-5 right-5 z-50 bg-pine-mid/90 border border-pine-light/30 backdrop-blur rounded-2xl shadow-xl px-4 py-3 flex flex-col gap-2.5 min-w-[120px]">
          <span className="text-[9px] uppercase font-black text-mint/70 tracking-widest font-mono select-none text-center">Theme</span>
          <div className="grid grid-cols-5 gap-1.5">
            {[
              { id: 'strawberry-matcha', color: '#E5526C', label: 'Berry' },
              { id: 'lilac-dream', color: '#9C85E5', label: 'Lilac' },
              { id: 'winter', color: '#50A3EF', label: 'Frost' },
              { id: 'pastel-pink-coquette', color: '#EC9FA5', label: 'Rose' },
              { id: 'red-blush', color: '#F43F5E', label: 'Blush' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleThemeChange(opt.id)}
                title={opt.label}
                className="flex flex-col items-center gap-1 cursor-pointer select-none group"
              >
                <span
                  className={`w-8 h-8 rounded-xl block transition-all duration-150 shadow-sm border-2 ${
                    theme === opt.id ? 'border-white scale-110 shadow-md' : 'border-white/20 group-hover:border-white/60 group-hover:scale-105'
                  }`}
                  style={{ background: opt.color }}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-sage/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-mint/5 blur-3xl pointer-events-none animate-pulse" />

        <div className="max-w-md w-full bg-pine-mid/95 backdrop-blur-md rounded-3xl border border-pine-light/30 shadow-2xl p-8 relative z-10 text-center space-y-6">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-mint via-sage to-pine-light" />
          <div className="space-y-2">
            <div className="w-14 h-14 bg-pine rounded-2xl border border-pine-light/30 shadow-inner flex items-center justify-center mx-auto mb-2 text-mint">
              <BookOpen className="w-7 h-7" />
            </div>
            <span className="text-[10px] tracking-[0.4em] uppercase font-bold text-mint/85 block">Standardized Review Suite</span>
            <h1 className="font-display text-4xl text-cream tracking-tight leading-none mt-1">
              Board<span className="text-mint font-normal italic">Pass</span>PH
            </h1>
            <p className="text-xs text-mint/60 leading-relaxed max-w-xs mx-auto">
              Professional Board Review Engine for Psychometricians &amp; Clinical Professionals in the Philippines.
            </p>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-2 p-1 bg-pine border border-pine-light/10 rounded-xl">
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setPasswordInput(''); }}
                className={`py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  authMode === 'login' ? 'bg-mint text-pine shadow' : 'text-cream/60 hover:text-cream'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('signup'); setPasswordInput(''); }}
                className={`py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  authMode === 'signup' ? 'bg-mint text-pine shadow' : 'text-cream/60 hover:text-cream'
                }`}
              >
                Sign Up
              </button>
            </div>

            {authMode !== 'forgot' ? (
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] uppercase font-bold text-mint/80 tracking-wider block font-mono">
                    Registered Reviewee Email
                  </label>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-pine border border-pine-light/30 text-xs font-semibold text-cream placeholder-mint/30 px-4 py-2.5 rounded-xl outline-none focus:border-mint focus:ring-4 focus:ring-mint/10 transition-all text-center"
                  />
                </div>

                <div className="space-y-1.5 text-left">
                  <label className="text-[10px] uppercase font-bold text-mint/80 tracking-wider block font-mono">
                    Security Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-pine border border-pine-light/30 text-xs font-semibold text-cream placeholder-mint/30 px-4 py-2.5 rounded-xl outline-none focus:border-mint focus:ring-4 focus:ring-mint/10 transition-all text-center"
                  />
                  {authMode === 'login' && (
                    <div className="text-right mt-2">
                      <button
                        type="button"
                        onClick={() => { setAuthMode('forgot'); setRecoveryEmail(''); setRecoveryStep('email'); setRecoveredProfile(null); }}
                        className="text-xs text-mint/70 hover:text-mint font-mono"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}
                </div>

                {authMode === 'signup' && (
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] uppercase font-bold text-mint/80 tracking-wider block font-mono">
                      Password Hint (Display on Recovery)
                    </label>
                    <input
                      type="text"
                      value={passwordHintInput}
                      onChange={(e) => setPasswordHintInput(e.target.value)}
                      placeholder="e.g. My puppy name / mom bday"
                      className="w-full bg-pine border border-pine-light/30 text-xs font-semibold text-cream placeholder-mint/30 px-4 py-2.5 rounded-xl outline-none focus:border-mint focus:ring-4 focus:ring-mint/10 transition-all text-center"
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full mt-2 py-3 bg-mint text-pine font-sans uppercase tracking-widest font-black text-xs rounded-xl shadow-md cursor-pointer select-none border-b-2 border-emerald-700 hover:bg-white hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  {authMode === 'login' ? 'Enter Board Room' : 'Create Credentials'}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                {recoveryStep === 'email' ? (
                  <form onSubmit={handleForgotPasswordVerify} className="space-y-4">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] uppercase font-bold text-mint/80 tracking-wider block font-mono">
                        Enter Registered Email for Recovery
                      </label>
                      <input
                        type="email"
                        required
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full bg-pine border border-pine-light/30 text-xs font-semibold text-cream placeholder-mint/30 px-4 py-2.5 rounded-xl outline-none focus:border-mint focus:ring-4 focus:ring-mint/10 transition-all text-center"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-mint text-pine font-sans uppercase tracking-widest font-black text-xs rounded-xl shadow-md border-b-2 border-emerald-700"
                      >
                        Verify Email
                      </button>
                      <button
                        type="button"
                        onClick={() => { setAuthMode('login'); setRecoveryEmail(''); }}
                        className="flex-1 py-3 bg-transparent text-cream/60 border border-pine-light/20 rounded-xl text-xs font-bold"
                      >
                        Back
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] uppercase font-bold text-mint/80 tracking-wider block font-mono">
                        Password Hint
                      </label>
                      <div className="text-xs text-cream/60 px-4 py-2.5 bg-pine border border-pine-light/30 rounded-xl">
                        {recoveredProfile?.passwordHint ?? 'No password hint available.'}
                      </div>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] uppercase font-bold text-mint/80 tracking-wider block font-mono">
                        Recovery OTP
                      </label>
                      <input
                        type="text"
                        required
                        value={enteredRecoveryOtp}
                        onChange={(e) => setEnteredRecoveryOtp(e.target.value)}
                        placeholder="Enter the code from your email"
                        className="w-full bg-pine border border-pine-light/30 text-xs font-semibold text-cream placeholder-mint/30 px-4 py-2.5 rounded-xl outline-none focus:border-mint focus:ring-4 focus:ring-mint/10 transition-all text-center"
                      />
                      <p className="text-[10px] text-cream/50">A one-time recovery code was sent to your registered email.</p>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] uppercase font-bold text-mint/80 tracking-wider block font-mono">
                        New Password
                      </label>
                      <input
                        type="password"
                        required
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full bg-pine border border-pine-light/30 text-xs font-semibold text-cream placeholder-mint/30 px-4 py-2.5 rounded-xl outline-none focus:border-mint focus:ring-4 focus:ring-mint/10 transition-all text-center"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-mint text-pine font-sans uppercase tracking-widest font-black text-xs rounded-xl shadow-md border-b-2 border-emerald-700"
                      >
                        Reset Password
                      </button>
                      <button
                        type="button"
                        onClick={() => { setAuthMode('login'); setRecoveryStep('email'); setRecoveredProfile(null); }}
                        className="flex-1 py-3 bg-transparent text-cream/60 border border-pine-light/20 rounded-xl text-xs font-bold"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          <p className="text-[10px] text-mint/30 mt-6 text-center font-mono select-none">
            BoardPassPH v2.0 · AI-Powered Philippine Psych Board Review
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profileTab', label: 'Profile', icon: User },
    { id: 'plannerTab', label: 'Study Planner', icon: Calendar },
    { id: 'quizTab', label: 'AI Practice', icon: Target },
    { id: 'examTab', label: 'Mock Exam', icon: Shield },
    { id: 'libraryTab', label: 'Test Library', icon: BookOpen },
    { id: 'spacedRepTab', label: 'Spaced Rep', icon: Layers },
    { id: 'analyticsTab', label: 'Analytics', icon: Activity },
    { id: 'leaderboardTab', label: 'Leaderboard', icon: Trophy },
    { id: 'focusArenaTab', label: 'Focus Arena', icon: Zap },
    { id: 'calculatorTab', label: 'GWA Calculator', icon: Calculator },
    { id: 'announcementsTab', label: 'Announcements', icon: Megaphone },
    { id: 'feedbackTab', label: 'Feedback', icon: MessageSquare },
    { id: 'billingTab', label: 'Plans', icon: CreditCard },
  ];

  const isAdmin = profile.email === 'studyfilesbyz@gmail.com';

  const allNavTabs = [
    ...tabs,
    ...(isAdmin ? [{ id: 'adminTab', label: 'Admin Console', icon: ShieldAlert }] : []),
  ];

  const activeTabLabel = allNavTabs.find(t => t.id === activeTab)?.label ?? 'BoardPassPH';

  return (
    <div className="min-h-screen bg-foam transition-all duration-300">
      <Header 
        profile={profile} 
        onNavigate={setActiveTab} 
        theme={theme}
        onThemeChange={handleThemeChange}
        syncStatus={syncStatus}
      />
      
      <RpgBar 
        profile={profile} 
        setProfile={setProfile as React.Dispatch<React.SetStateAction<UserProfile>>}
        onNavigate={setActiveTab}
        onLogout={handleLogout}
      />

      {/* ── Sticky nav bar with hamburger ───────────────────────── */}
      <div className="border-b border-pine/10 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-3 px-4 max-w-7xl mx-auto h-12">
          <button
            onClick={() => setNavOpen(true)}
            className="p-2 rounded-xl hover:bg-pine/10 text-pine transition-all cursor-pointer select-none"
            aria-label="Open navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="flex-1 text-center text-[11px] font-black uppercase tracking-widest text-pine/60 truncate">
            {activeTabLabel}
          </span>
          <div className="w-9" />
        </div>
      </div>

      {/* ── Slide-in navigation drawer ───────────────────────────── */}
      {navOpen && (
        <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setNavOpen(false)}
          />

          {/* Drawer panel */}
          <div className="relative w-72 max-w-[85vw] bg-pine h-full flex flex-col overflow-hidden shadow-2xl">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
              <div>
                <p className="text-[9px] uppercase tracking-[0.3em] font-bold text-sage">Navigation</p>
                <h2 className="font-display text-xl text-cream leading-none mt-0.5">
                  Board<span className="text-mint font-normal italic">Pass</span>PH
                </h2>
              </div>
              <button
                onClick={() => setNavOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-cream/60 hover:text-cream transition cursor-pointer"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User info strip */}
            <div className="px-5 py-3 border-b border-white/10 bg-black/10 shrink-0">
              <p className="text-[10px] text-sage font-mono truncate">{profile.email}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-[9px] uppercase tracking-wider font-black text-mint bg-teal-900/50 border border-teal-500/20 px-2 py-0.5 rounded-full">
                  {profile.tier}
                </span>
                {/* coins removed from UI */}
                <span className="text-[9px] text-cream/50 font-mono">
                  ⚡ {profile.streak}d streak
                </span>
              </div>
            </div>

            {/* Theme picker */}
            <div className="px-5 py-4 border-b border-white/10 shrink-0">
              <p className="text-[9px] uppercase tracking-[0.25em] font-black text-sage/70 mb-3 font-mono">Workspace Theme</p>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { id: 'strawberry-matcha',    color: '#E5526C', label: 'Berry'    },
                  { id: 'lilac-dream',           color: '#9C85E5', label: 'Lilac'    },
                  { id: 'winter',                color: '#50A3EF', label: 'Frost'    },
                  { id: 'pastel-pink-coquette',  color: '#EC9FA5', label: 'Rose'     },
                  { id: 'red-blush',             color: '#F43F5E', label: 'Blush'    },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => handleThemeChange(opt.id)}
                    className="flex flex-col items-center gap-1 cursor-pointer select-none group"
                    title={opt.label}
                  >
                    <span
                      className={`w-9 h-9 rounded-xl border-2 transition-all duration-150 block shadow-sm ${theme === opt.id ? 'border-white scale-110 shadow-md' : 'border-white/20 group-hover:border-white/50 group-hover:scale-105'}`}
                      style={{ background: opt.color }}
                    />
                    <span className={`text-[8px] font-bold uppercase tracking-wide transition-all ${theme === opt.id ? 'text-cream' : 'text-cream/40 group-hover:text-cream/70'}`}>
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab list */}
            <nav className="flex-1 overflow-y-auto py-2 no-scrollbar">
              {allNavTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id); setNavOpen(false); }}
                    className={`w-full flex items-center gap-3 px-5 py-3 text-sm font-bold transition-all cursor-pointer select-none border-l-2 ${
                      isActive
                        ? 'bg-white/15 text-cream border-mint'
                        : 'text-cream/55 hover:text-cream hover:bg-white/8 border-transparent'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-mint shrink-0" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Sign out at bottom */}
            <div className="px-5 py-4 border-t border-white/10 shrink-0">
              <button
                onClick={() => { handleLogout(); setNavOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 bg-red-900/30 hover:bg-red-900/50 border border-red-500/20 text-red-300 hover:text-red-200 font-bold text-xs rounded-xl transition cursor-pointer select-none"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          
          {activeTab !== 'plannerTab' && (
            <div className="xl:col-span-1 hidden xl:block">
              <StudentHubCard profile={profile} onNavigate={setActiveTab} />
            </div>
          )}

          <div className={activeTab !== 'plannerTab' ? 'xl:col-span-3' : 'xl:col-span-4'}>
            {activeTab === 'profileTab' && (
              <ProfilePanel
                profile={profile}
                setProfile={setProfile as React.Dispatch<React.SetStateAction<UserProfile>>}
              />
            )}

            {activeTab === 'plannerTab' && (
              <StudyPlannerPanel 
                profile={profile} 
                setProfile={setProfile as React.Dispatch<React.SetStateAction<UserProfile>>}
              />
            )}

            {activeTab === 'quizTab' && (
              <PracticePanel
                profile={profile}
                setProfile={setProfile as React.Dispatch<React.SetStateAction<UserProfile>>}
                currentQuestion={currentQuestion}
                loading={loadingQuestion}
                onFetchQuestion={handleFetchQuestion}
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
              />
            )}

            {activeTab === 'examTab' && (
              <MockExamPanel
                profile={profile}
                setProfile={setProfile as React.Dispatch<React.SetStateAction<UserProfile>>}
                onNavigate={setActiveTab}
              />
            )}

            {activeTab === 'libraryTab' && (
              <LibraryPanel
                onPracticeTest={handlePracticeLocalTest}
              />
            )}

            {activeTab === 'spacedRepTab' && (
              <SpacedRepPanel
                profile={profile}
                setProfile={setProfile as React.Dispatch<React.SetStateAction<UserProfile>>}
                onStartReviewQuiz={handleStartReviewQuiz}
              />
            )}

            {activeTab === 'analyticsTab' && (
              <AnalyticsPanel profile={profile} setProfile={setProfile as React.Dispatch<React.SetStateAction<UserProfile>>} />
            )}

            {activeTab === 'leaderboardTab' && (
              <LeaderboardPanel profile={profile} />
            )}

            {activeTab === 'focusArenaTab' && (
              <FocusArenaPanel
                profile={profile}
                setProfile={setProfile as React.Dispatch<React.SetStateAction<UserProfile>>}
                onNavigate={setActiveTab}
              />
            )}

            {activeTab === 'calculatorTab' && (
              <WeightedCalculatorPanel />
            )}

            {activeTab === 'feedbackTab' && (
              <FeedbackPanel profile={profile} />
            )}

            {activeTab === 'announcementsTab' && (
              <AnnouncementsPanel />
            )}

            {activeTab === 'billingTab' && (
              <BillingPanel
                profile={profile}
                setProfile={setProfile as React.Dispatch<React.SetStateAction<UserProfile>>}
              />
            )}

            {activeTab === 'adminTab' && isAdmin && (
              <AdminPanel
                profile={profile}
                setProfile={setProfile as React.Dispatch<React.SetStateAction<UserProfile | null>>}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
