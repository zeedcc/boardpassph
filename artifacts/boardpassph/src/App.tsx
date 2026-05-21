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
  Calculator
} from 'lucide-react';
import { UserProfile, Question } from './types';
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
import { getRandomLocalQuestion } from './utils/questionGenerator';
import { db } from './firebase';
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

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('bp_theme', theme);
  }, [theme]);

  const [syncStatus, setSyncStatus] = useState<'syncing' | 'synced'>('synced');

  useEffect(() => {
    if (!profile) return;
    
    localStorage.setItem(`bp_profile_${profile.email}`, JSON.stringify(profile));

    const syncDoc = async () => {
      setSyncStatus('syncing');
      try {
        const docRef = doc(db, 'profiles', profile.email);
        await setDoc(docRef, profile);
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
      const docSnap = await getDoc(docRef);
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
        signUpDate: todayStr
      };

      try {
        setSyncStatus('syncing');
        const docRef = doc(db, 'profiles', emailLower);
        await setDoc(docRef, newProfile);
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
          await setDoc(doc(db, 'profiles', emailLower), storedProfile);
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
      const docSnap = await getDoc(doc(db, 'profiles', emailLower));
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

    setRecoveredProfile(loadedProfile);
    setRecoveryStep('reset');
  };

  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPasswordInput.trim()) {
      alert("Reviewee password cannot be blank!");
      return;
    }
    if (!recoveredProfile) return;

    recoveredProfile.password = newPasswordInput;
    localStorage.setItem(`bp_profile_${recoveredProfile.email}`, JSON.stringify(recoveredProfile));
    
    try {
      setSyncStatus('syncing');
      await setDoc(doc(db, 'profiles', recoveredProfile.email), recoveredProfile);
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

      const res = await fetch("/api/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          focusArea: finalFocusArea, 
          source, 
          difficulty,
          fileData,
          fileMimeType
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
        
        <div className="absolute top-6 right-6 z-50 flex items-center gap-1.5 bg-pine-mid/90 border border-pine-light/35 backdrop-blur px-3 py-1.5 rounded-full shadow-lg">
          <span className="text-[10px] uppercase font-bold text-mint/90 tracking-wider mr-1 hidden sm:inline select-none font-mono">
            🎨 Select Style:
          </span>
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleThemeChange(opt.id)}
              className={`w-8 h-8 flex items-center justify-center rounded-full text-sm transition-all duration-150 cursor-pointer select-none active:scale-90 ${
                theme === opt.id 
                  ? 'bg-mint text-pine transform scale-110 shadow border border-white/20' 
                  : 'hover:bg-pine-light/40 text-cream/70'
              }`}
              title={opt.name}
            >
              {opt.emoji}
            </button>
          ))}
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

          {authMode !== 'forgot' ? (
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
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] uppercase font-bold text-mint/80 tracking-wider block font-mono">
                      Security Password
                    </label>
                    {authMode === 'login' && (
                      <button
                        type="button"
                        onClick={() => { setAuthMode('forgot'); setRecoveryStep('email'); setRecoveryEmail(emailInput); }}
                        className="text-[10px] font-bold text-mint hover:underline font-mono cursor-pointer"
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-pine border border-pine-light/30 text-xs font-semibold text-cream placeholder-mint/30 px-4 py-2.5 rounded-xl outline-none focus:border-mint focus:ring-4 focus:ring-mint/10 transition-all text-center"
                  />
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
            </div>
          ) : (
            <div className="space-y-5 text-left">
              <div className="flex items-center justify-between border-b border-pine-light/20 pb-2">
                <h3 className="text-xs uppercase font-bold text-cream tracking-wider font-mono">
                  🔑 Credentials Recovery Panel
                </h3>
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setRecoveryEmail(''); setRecoveryStep('email'); setRecoveredProfile(null); setNewPasswordInput(''); }}
                  className="text-[10px] uppercase font-extrabold text-mint hover:underline font-mono cursor-pointer"
                >
                  Back to Log In
                </button>
              </div>

              {recoveryStep === 'email' ? (
                <form onSubmit={handleForgotPasswordVerify} className="space-y-4">
                  <p className="text-[11px] text-mint/70 leading-relaxed">
                    Forgot your password? Specify your registered email below to fetch your security hint and establish a replacement passcode.
                  </p>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-mint/80 tracking-wider block font-mono">Reviewee Email</label>
                    <input
                      type="email"
                      required
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-pine border border-pine-light/30 text-xs font-semibold text-cream placeholder-mint/30 px-4 py-2.5 rounded-xl outline-none focus:border-mint transition-all text-center"
                    />
                  </div>
                  <button type="submit" className="w-full py-2.5 bg-mint text-pine font-sans uppercase tracking-widest font-black text-xs rounded-xl cursor-pointer">
                    Retrieve Password Hint
                  </button>
                </form>
              ) : (
                <div className="space-y-4">
                  {recoveredProfile?.passwordHint && (
                    <div className="bg-pine/50 border border-pine-light/20 rounded-xl p-3">
                      <span className="text-[10px] uppercase font-bold text-mint/80 tracking-wider block font-mono mb-1">Your Password Hint</span>
                      <p className="text-xs text-cream font-medium">{recoveredProfile.passwordHint}</p>
                    </div>
                  )}
                  <form onSubmit={handlePasswordResetSubmit} className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-mint/80 tracking-wider block font-mono">New Password</label>
                      <input
                        type="password"
                        required
                        value={newPasswordInput}
                        onChange={(e) => setNewPasswordInput(e.target.value)}
                        placeholder="New secure password"
                        className="w-full bg-pine border border-pine-light/30 text-xs font-semibold text-cream placeholder-mint/30 px-4 py-2.5 rounded-xl outline-none focus:border-mint transition-all text-center"
                      />
                    </div>
                    <button type="submit" className="w-full py-2.5 bg-mint text-pine font-sans uppercase tracking-widest font-black text-xs rounded-xl cursor-pointer">
                      Reset Password
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>

        <p className="text-[10px] text-mint/30 mt-6 text-center font-mono select-none">
          BoardPassPH v2.0 · AI-Powered Philippine Psych Board Review
        </p>
      </div>
    );
  }

  const tabs = [
    { id: 'plannerTab', label: 'Study Planner', icon: Calendar },
    { id: 'quizTab', label: 'AI Practice', icon: Target },
    { id: 'examTab', label: 'Mock Exam', icon: Shield },
    { id: 'libraryTab', label: 'Test Library', icon: BookOpen },
    { id: 'spacedRepTab', label: 'Spaced Rep', icon: Layers },
    { id: 'analyticsTab', label: 'Analytics', icon: Activity },
    { id: 'leaderboardTab', label: 'Leaderboard', icon: Trophy },
    { id: 'focusArenaTab', label: 'Focus Arena', icon: Zap },
    { id: 'calculatorTab', label: 'GWA Calculator', icon: Calculator },
    { id: 'feedbackTab', label: 'Feedback', icon: MessageSquare },
    { id: 'billingTab', label: 'Plans', icon: CreditCard },
  ];

  const isAdmin = profile.email === 'admin@boardpassph.com' || profile.email === 'test@test.com';

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

      <div className="border-b border-pine/10 bg-white/60 backdrop-blur-sm sticky top-0 z-30 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-0.5 px-4 max-w-7xl mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-3 text-[11px] font-bold uppercase tracking-wide whitespace-nowrap transition-all duration-150 cursor-pointer select-none border-b-2 ${
                  isActive 
                    ? 'border-pine text-pine' 
                    : 'border-transparent text-pine/50 hover:text-pine/80 hover:border-pine/20'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
          {isAdmin && (
            <button
              onClick={() => setActiveTab('adminTab')}
              className={`flex items-center gap-1.5 px-3 py-3 text-[11px] font-bold uppercase tracking-wide whitespace-nowrap transition-all duration-150 cursor-pointer select-none border-b-2 ${
                activeTab === 'adminTab'
                  ? 'border-pine text-pine' 
                  : 'border-transparent text-pine/50 hover:text-pine/80'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          
          {activeTab !== 'plannerTab' && (
            <div className="xl:col-span-1 hidden xl:block">
              <StudentHubCard profile={profile} onNavigate={setActiveTab} />
            </div>
          )}

          <div className={activeTab !== 'plannerTab' ? 'xl:col-span-3' : 'xl:col-span-4'}>
            {activeTab === 'plannerTab' && (
              <StudyPlannerPanel 
                profile={profile} 
                setProfile={setProfile as React.Dispatch<React.SetStateAction<UserProfile>>}
                onNavigate={setActiveTab}
              />
            )}

            {activeTab === 'quizTab' && (
              <PracticePanel
                profile={profile}
                setProfile={setProfile as React.Dispatch<React.SetStateAction<UserProfile>>}
                currentQuestion={currentQuestion}
                loadingQuestion={loadingQuestion}
                onFetchQuestion={handleFetchQuestion}
                onLoadGeneratedQuestion={handleLoadGeneratedQuestion}
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
                onPracticeLocalTest={handlePracticeLocalTest}
                onFetchQuestion={handleFetchQuestion}
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
              <AnalyticsPanel profile={profile} />
            )}

            {activeTab === 'leaderboardTab' && (
              <LeaderboardPanel profile={profile} />
            )}

            {activeTab === 'focusArenaTab' && (
              <FocusArenaPanel
                profile={profile}
                setProfile={setProfile as React.Dispatch<React.SetStateAction<UserProfile>>}
                onFetchQuestion={handleFetchQuestion}
              />
            )}

            {activeTab === 'calculatorTab' && (
              <WeightedCalculatorPanel />
            )}

            {activeTab === 'feedbackTab' && (
              <FeedbackPanel profile={profile} />
            )}

            {activeTab === 'billingTab' && (
              <BillingPanel
                profile={profile}
                setProfile={setProfile as React.Dispatch<React.SetStateAction<UserProfile>>}
              />
            )}

            {activeTab === 'adminTab' && isAdmin && (
              <AdminPanel profile={profile} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
