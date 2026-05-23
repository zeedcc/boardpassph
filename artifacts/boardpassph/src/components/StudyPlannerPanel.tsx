import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Plus, 
  Trash2, 
  Sparkles, 
  Smile, 
  Compass, 
  Bookmark, 
  Bell, 
  Info,
  Clock
} from 'lucide-react';
import { UserProfile } from '../types';
import { DEFAULT_HABIT_DEFINITIONS, getHabitDefinitions, type HabitDefinition } from '../utils/profileHelpers';

interface StudyPlannerPanelProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

const MOODS = [
  { id: 'motivated', name: 'Motivated', emoji: '🎯', color: 'bg-amber-500 text-white', accent: 'border-amber-200 bg-amber-50/50' },
  { id: 'calm', name: 'Calm', emoji: '🌊', color: 'bg-teal-500 text-white', accent: 'border-teal-200 bg-teal-50/50' },
  { id: 'anxious', name: 'Anxious', emoji: '🧠', color: 'bg-indigo-500 text-white', accent: 'border-indigo-200 bg-indigo-50/50' },
  { id: 'tired', name: 'Tired', emoji: '☕', color: 'bg-orange-500 text-white', accent: 'border-orange-200 bg-orange-50/50' },
  { id: 'sad', name: 'Sad', emoji: '🌧️', color: 'bg-slate-500 text-white', accent: 'border-slate-200 bg-slate-50/50' },
];

export const StudyPlannerPanel: React.FC<StudyPlannerPanelProps> = ({ profile, setProfile }) => {
  // Calendar States
  const today = new Date(2026, 4, 20); // Static current calendar date aligned with local mock system constraints
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(4); // 0-indexed: May is 4
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-05-20');

  // Input states for adding new custom events
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventNote, setNewEventNote] = useState('');
  const [newEventColor, setNewEventColor] = useState('pine');
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitXp, setNewHabitXp] = useState(10);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editHabitName, setEditHabitName] = useState('');
  const [editHabitXp, setEditHabitXp] = useState(10);
  const [showHabitManager, setShowHabitManager] = useState(false);

  const habitDefinitions = useMemo(() => getHabitDefinitions(profile), [profile.habitDefinitions]);

  // Load or pre-populate events
  const initializedEvents = useMemo(() => {
    const custom = profile.calendarEvents || {};
    
    // If we have existing user calendarEvents in profile, use them
    if (Object.keys(custom).length > 0) {
      return custom;
    }

    // Otherwise, pre-populate standard PRC psychometrician exam track items
    return {
      '2026-05-20': [
        { id: 'm1', title: '🚀 BoardPassPH Review Started', note: 'Diagnose learning baselines & activate index cards.', color: 'pine' }
      ],
      '2026-06-25': [
        { id: 'm2', title: '⏱️ Mid-review 100-item Mock Simulation', note: 'Test compliance to strict board bounds and speed metrics.', color: 'indigo' }
      ],
      '2026-07-15': [
        { id: 'm3', title: '🎯 Comprehensive Assessment Board', note: 'Targeting psychological evaluations and core testing guidelines.', color: 'amber' }
      ],
      '2026-08-18': [
        { id: 'm4', title: '🕯️ Pre-Exam Focus & Mindfulness', note: 'Review notes briefly, prepare gear/calculators, sleep early.', color: 'rose' }
      ],
      '2026-08-19': [
        { id: 'm5', title: '🏁 PRC PmLE Board Exam — Day 1', note: 'Abnormal Psychology & Theories of Personality. Rise and shine!', color: 'rose' }
      ],
      '2026-08-20': [
        { id: 'm6', title: '🏁 PRC PmLE Board Exam — Day 2', note: 'Psychological Assessment & Industrial Psychology. Finish with absolute triumph!', color: 'rose' }
      ]
    };
  }, [profile.calendarEvents]);

  // Safely get list of habits checked today
  const dailyHabits = useMemo(() => {
    return profile.habitsChecked?.[selectedDateStr] || {};
  }, [profile.habitsChecked, selectedDateStr]);

  // Get current selected day's mood
  const dailyMood = useMemo(() => {
    return profile.moods?.[selectedDateStr] || '';
  }, [profile.moods, selectedDateStr]);

  // Days of current month array generator
  const calendarCells = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const startDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

    const cells = [];

    // Adjacent Prev Month Offset padding
    const prevMonthDaysCount = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const pmDay = prevMonthDaysCount - i;
      const pmMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const pmYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateString = `${pmYear}-${String(pmMonth + 1).padStart(2, '0')}-${String(pmDay).padStart(2, '0')}`;
      cells.push({
        day: pmDay,
        month: pmMonth,
        year: pmYear,
        isCurrentMonth: false,
        dateString
      });
    }

    // Current Month active cells
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({
        day,
        month: currentMonth,
        year: currentYear,
        isCurrentMonth: true,
        dateString
      });
    }

    // Trailing adjacent Next Month padding to form exact grid bounds
    const totalFilledCells = cells.length;
    const remainingSlots = 42 - totalFilledCells; // 6 rows * 7 days
    for (let day = 1; day <= remainingSlots; day++) {
      const nmMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nmYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const actualDateStr = `${nmYear}-${String(nmMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({
        day,
        month: nmMonth,
        year: nmYear,
        isCurrentMonth: false,
        dateString: actualDateStr
      });
    }

    return cells;
  }, [currentYear, currentMonth]);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleSelectDay = (dateStr: string) => {
    setSelectedDateStr(dateStr);
    setNewEventTitle('');
    setNewEventNote('');
  };

  // Log or Toggle habits
  const handleToggleHabit = (habitId: string, habitName: string, xpReward: number) => {
    const updatedHabits = { ...profile.habitsChecked };
    if (!updatedHabits[selectedDateStr]) {
      updatedHabits[selectedDateStr] = {};
    }

    const wasChecked = !!updatedHabits[selectedDateStr][habitId];
    updatedHabits[selectedDateStr][habitId] = !wasChecked;

    // Trigger feedback and update Profile state
    // Give XP on check, deduct slightly or don't if unchecking
    setProfile(prev => {
      const currentXp = prev.totalXp;
      const newXp = wasChecked ? Math.max(0, currentXp - xpReward) : currentXp + xpReward;

      // Update streaks as gamification surprise if they completed all review habits!
      let newStreak = prev.streak;
      if (!wasChecked) {
        // Just checked it off
        const totalCompletedToday = Object.values(updatedHabits[selectedDateStr]).filter(Boolean).length;
        if (totalCompletedToday === habitDefinitions.length) {
          // Surpassed full checklist today! Honor streak
          newStreak += 1;
        }
      }

      const next = {
        ...prev,
        totalXp: newXp,
        streak: newStreak,
        habitsChecked: updatedHabits
      };

      // Sync custom profile
      localStorage.setItem(`bp_profile_${prev.email}`, JSON.stringify(next));
      return next;
    });
  };

  // Toggle mood
  const handleSelectMood = (moodId: string) => {
    const updatedMoods = { ...profile.moods };
    const hadMood = updatedMoods[selectedDateStr] === moodId;
    
    if (hadMood) {
      delete updatedMoods[selectedDateStr]; // Clear
    } else {
      updatedMoods[selectedDateStr] = moodId;
    }

    setProfile(prev => {
      const next = {
        ...prev,
        moods: updatedMoods,
        totalXp: hadMood ? prev.totalXp : prev.totalXp + 5 // Small bonus for self-reflection!
      };
      localStorage.setItem(`bp_profile_${prev.email}`, JSON.stringify(next));
      return next;
    });
  };

  // Add Calendar Event
  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const newEvent = {
      id: 'evt-' + Date.now().toString(36),
      title: newEventTitle.trim(),
      note: newEventNote.trim() || undefined,
      color: newEventColor
    };

    const currentDayEvents = initializedEvents[selectedDateStr] || [];
    const updatedEvents = {
      ...initializedEvents,
      [selectedDateStr]: [...currentDayEvents, newEvent]
    };

    setProfile(prev => {
      const next = {
        ...prev,
        calendarEvents: updatedEvents,
        totalXp: prev.totalXp + 10 // Study event planned bonus
      };
      localStorage.setItem(`bp_profile_${prev.email}`, JSON.stringify(next));
      return next;
    });

    setNewEventTitle('');
    setNewEventNote('');
  };

  // Delete Calendar Event
  const handleDeleteEvent = (eventId: string) => {
    const currentDayEvents = initializedEvents[selectedDateStr] || [];
    const updatedDayEvents = currentDayEvents.filter(evt => evt.id !== eventId);
    
    const updatedEvents = { ...initializedEvents };
    if (updatedDayEvents.length === 0) {
      delete updatedEvents[selectedDateStr];
    } else {
      updatedEvents[selectedDateStr] = updatedDayEvents;
    }

    setProfile(prev => {
      const next = {
        ...prev,
        calendarEvents: updatedEvents
      };
      localStorage.setItem(`bp_profile_${prev.email}`, JSON.stringify(next));
      return next;
    });
  };

  // Format Helper YYYY-MM-DD display
  const formatFriendlyDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split('-');
      const dObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
      return dObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Check today completion metrics
  const habitsCompletedCount = Object.values(dailyHabits).filter(Boolean).length;

  const persistHabitDefinitions = (defs: HabitDefinition[]) => {
    setProfile(prev => {
      const next = { ...prev, habitDefinitions: defs };
      localStorage.setItem(`bp_profile_${prev.email}`, JSON.stringify(next));
      return next;
    });
  };

  const handleAddHabit = () => {
    const name = newHabitName.trim();
    if (!name) return;
    const id = `habit-${Date.now().toString(36)}`;
    persistHabitDefinitions([...habitDefinitions, { id, name, xp: newHabitXp }]);
    setNewHabitName('');
    setNewHabitXp(10);
  };

  const handleDeleteHabit = (id: string) => {
    if (!confirm('Remove this habit from your checklist?')) return;
    persistHabitDefinitions(habitDefinitions.filter(h => h.id !== id));
  };

  const handleStartEditHabit = (habit: HabitDefinition) => {
    setEditingHabitId(habit.id);
    setEditHabitName(habit.name);
    setEditHabitXp(habit.xp);
  };

  const handleSaveEditHabit = () => {
    if (!editingHabitId || !editHabitName.trim()) return;
    persistHabitDefinitions(
      habitDefinitions.map(h =>
        h.id === editingHabitId ? { ...h, name: editHabitName.trim(), xp: editHabitXp } : h
      )
    );
    setEditingHabitId(null);
  };

  const handleResetHabits = () => {
    if (!confirm('Restore the default habit checklist?')) return;
    persistHabitDefinitions([...DEFAULT_HABIT_DEFINITIONS]);
  };
  const currentSelectedMoodObj = MOODS.find(m => m.id === dailyMood);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* HEADER HERO BANNER */}
      <div className="bg-gradient-to-r from-pine via-pine-mid to-[#1b2f24] rounded-2xl p-6 text-cream shadow-sm relative overflow-hidden select-none border border-pine-light/10">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FFF_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
        <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-mint/5 blur-2xl" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-black tracking-widest text-mint font-mono bg-pine-mid/50 px-2.5 py-1 rounded-full border border-pine-light/25">
              🎓 Study Companion Deck
            </span>
            <h2 className="font-display text-2xl sm:text-3xl text-cream tracking-tight leading-tight mt-1.5">
              Habit Tracker &amp; Board Calendar
            </h2>
            <p className="text-[11px] text-sage/85 max-w-lg leading-relaxed">
              Maintain diagnostic consistency, log emotional progress indices, and schedule psychological milestones leading up to <strong>PmLE 2026</strong>.
            </p>
          </div>
          <div className="bg-pine/60 border border-pine-light/20 rounded-xl p-3 text-center sm:text-right flex-shrink-0 min-w-[120px]">
            <span className="text-[9px] uppercase font-mono text-sage block">Consistency Streak</span>
            <span className="text-xl font-bold font-mono text-mint flex items-center justify-center sm:justify-end gap-1">
              🔥 {profile.streak} Days
            </span>
          </div>
        </div>
      </div>

      {/* PARENT TWO-COLUMN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: INTERACTIVE MONTHLY CALENDAR (8 / 12) */}
        <div className="xl:col-span-8 bg-white border border-pine/10 rounded-2xl p-4 shadow-sm space-y-4">
          
          {/* Calendar Controls */}
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-foam text-pine flex items-center justify-center font-bold">
                <CalendarIcon className="w-4 h-4 text-pine" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-pine uppercase tracking-wider font-mono">
                  {monthNames[currentMonth]} {currentYear}
                </h3>
                <span className="text-[9px] text-gray-400 font-mono italic">
                  *Click any day to logs review stats &amp; custom events
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button 
                onClick={handlePrevMonth}
                className="w-8 h-8 rounded-lg border border-gray-100 hover:bg-gray-50 text-gray-600 flex items-center justify-center cursor-pointer transition active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setCurrentMonth(4); // Reset to today
                  setCurrentYear(2026);
                  handleSelectDay('2026-05-20');
                }}
                className="text-[10px] font-bold uppercase font-mono px-2.5 py-1.5 rounded-lg border border-gray-150 text-pine bg-foam hover:bg-gray-100 transition active:scale-95 cursor-pointer"
              >
                May &apos;26
              </button>
              <button 
                onClick={handleNextMonth}
                className="w-8 h-8 rounded-lg border border-gray-100 hover:bg-gray-50 text-gray-600 flex items-center justify-center cursor-pointer transition active:scale-95"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Monthly grid */}
          <div className="space-y-1">
            {/* Week Headers */}
            <div className="grid grid-cols-7 text-center select-none">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <span key={day} className="text-[9.5px] font-extrabold font-mono text-gray-500 uppercase py-1">
                  {day}
                </span>
              ))}
            </div>

            {/* Days block */}
            <div className="grid grid-cols-7 gap-1">
              {calendarCells.map((cell, idx) => {
                const isSelected = cell.dateString === selectedDateStr;
                const isToday = cell.dateString === '2026-05-20';
                
                // Fetch stats for markers
                const dayMoodId = profile.moods?.[cell.dateString] || '';
                const dayMoodObj = MOODS.find(m => m.id === dayMoodId);
                
                const dayHabits = profile.habitsChecked?.[cell.dateString] || {};
                const completedHabits = Object.values(dayHabits).filter(Boolean).length;
                
                const cellEvents = initializedEvents[cell.dateString] || [];

                return (
                  <button
                    key={`${cell.dateString}-${idx}`}
                    onClick={() => handleSelectDay(cell.dateString)}
                    type="button"
                    className={`min-h-[75px] max-h-[90px] border rounded-xl p-1.5 text-left flex flex-col justify-between transition-all duration-150 cursor-pointer text-ellipsis overflow-hidden ${
                      cell.isCurrentMonth ? 'bg-white' : 'bg-gray-50/50 opacity-40'
                    } ${
                      isSelected 
                        ? 'border-pine-light ring-2 ring-pine/10 bg-foam/45' 
                        : isToday 
                        ? 'border-mint ring-1 ring-mint/50 bg-foam/30' 
                        : 'border-gray-100 hover:border-pine/20 hover:bg-gray-50/20'
                    }`}
                  >
                    {/* Day Number and Mood Spot Badge */}
                    <div className="flex items-center justify-between w-full">
                      <span className={`text-[11px] font-black font-mono transition-transform ${
                        isToday ? 'bg-pine text-cream w-5 h-5 rounded-full flex items-center justify-center shadow-sm font-black' : 'text-gray-700'
                      } ${isSelected ? 'scale-110 font-black text-pine' : ''}`}>
                        {cell.day}
                      </span>
                      {dayMoodObj && (
                        <span className="text-[11px] select-none" title={`Logged Mood: ${dayMoodObj.name}`}>
                          {dayMoodObj.emoji}
                        </span>
                      )}
                    </div>

                    {/* Micro indicators array */}
                    <div className="w-full space-y-1 overflow-hidden pointer-events-none">
                      {/* Habits small meter */}
                      {completedHabits > 0 && (
                        <div className="flex gap-0.5 h-1 items-center bg-gray-100 rounded-full overflow-hidden w-full">
                          {Array.from({ length: habitDefinitions.length }).map((_, hIdx) => (
                            <div 
                              key={hIdx}
                              className={`h-full flex-1 rounded-full ${
                                hIdx < completedHabits 
                                  ? 'bg-emerald-500 shadow-xs' 
                                  : 'bg-transparent'
                              }`} 
                            />
                          ))}
                        </div>
                      )}

                      {/* Event badging */}
                      {cellEvents.map(evt => {
                        let badgeColor = 'bg-pine text-cream';
                        if (evt.color === 'indigo') badgeColor = 'bg-[#382B6B] text-cream';
                        else if (evt.color === 'amber') badgeColor = 'bg-amber-600 text-cream';
                        else if (evt.color === 'rose') badgeColor = 'bg-rose-700 text-cream';
                        
                        return (
                          <div 
                            key={evt.id} 
                            className={`text-[8px] font-extrabold uppercase px-1 py-0.5 rounded leading-tight line-clamp-1 border border-white/10 ${badgeColor}`}
                          >
                            {evt.title}
                          </div>
                        );
                      })}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Informational Guide */}
          <div className="bg-sage/5 border border-sage/10 rounded-xl p-3 flex gap-2.5 items-start mt-2">
            <Info className="w-4 h-4 text-sage mt-0.5 flex-shrink-0" />
            <p className="text-[9.5px] text-pine-mid/95 leading-normal font-mono">
              <strong>Interactive Guide</strong>: Add custom review check-ins, mock schedules, and physical rest markers. Every completed review habit on the checklist awards up to <strong>20 XP</strong> directly towards your board exam readiness tier!
            </p>
          </div>

        </div>

        {/* RIGHT COLUMN: JOURNAL DETAIL DRAWER (4 / 12) */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* SELECTED DAY PANEL */}
          <div className="bg-white border border-pine/10 rounded-2xl p-4 shadow-sm space-y-4">
            
            {/* Day Title */}
            <div>
              <span className="text-[8px] uppercase font-black font-mono px-2 py-0.5 bg-pine-mid/5 text-pine rounded-full tracking-wider select-none">
                🗓️ Selected Review Slot
              </span>
              <h4 className="font-display text-base text-pine mt-1.5">
                {formatFriendlyDate(selectedDateStr)}
              </h4>
            </div>

            {/* 1. DAILY MOOD SELECTION */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-wide block font-mono">
                Log Mood Tracker
              </label>
              
              <div className="grid grid-cols-5 gap-1">
                {MOODS.map(m => {
                  const isActive = dailyMood === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => handleSelectMood(m.id)}
                      type="button"
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer select-none ${
                        isActive 
                          ? `${m.color} ring-2 ring-emerald-500/20 scale-105 shadow-sm` 
                          : 'bg-white hover:bg-gray-50 border-gray-150'
                      }`}
                      title={m.name}
                    >
                      <span className="text-sm block">{m.emoji}</span>
                      <span className={`text-[8px] uppercase tracking-tighter mt-1 font-mono leading-none ${isActive ? 'text-white font-bold' : 'text-gray-400'}`}>
                        {m.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. SPECIFIC DAY STUDY HABITS */}
            <div className="space-y-2 border-t border-gray-100 pt-3">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase text-gray-500 tracking-wide font-mono">
                  Habit Checklist
                </label>
                <span className="text-[9px] font-mono font-bold bg-foam px-2 py-0.5 rounded-full text-pine-mid">
                  {habitsCompletedCount} / {habitDefinitions.length} done
                </span>
              </div>

              <div className="mb-2">
                <button
                  type="button"
                  onClick={() => setShowHabitManager(v => !v)}
                  className="text-[9px] font-black uppercase tracking-wider text-pine hover:underline"
                >
                  {showHabitManager ? 'Hide habit editor' : 'Add / edit / delete habits'}
                </button>
              </div>

              {showHabitManager && (
                <div className="mb-3 p-3 rounded-xl border border-pine/10 bg-foam/30 space-y-2">
                  <div className="flex gap-2">
                    <input
                      value={newHabitName}
                      onChange={e => setNewHabitName(e.target.value)}
                      placeholder="New habit label"
                      className="flex-1 text-[10px] border rounded-lg px-2 py-1.5"
                    />
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={newHabitXp}
                      onChange={e => setNewHabitXp(Number(e.target.value))}
                      className="w-14 text-[10px] border rounded-lg px-2 py-1.5"
                      title="XP reward"
                    />
                    <button type="button" onClick={handleAddHabit} className="px-2 py-1.5 bg-pine text-cream text-[9px] font-bold rounded-lg">Add</button>
                  </div>
                  {habitDefinitions.map(habit => (
                    <div key={habit.id} className="flex items-center gap-2 text-[10px]">
                      {editingHabitId === habit.id ? (
                        <>
                          <input value={editHabitName} onChange={e => setEditHabitName(e.target.value)} className="flex-1 border rounded px-2 py-1" />
                          <input type="number" value={editHabitXp} onChange={e => setEditHabitXp(Number(e.target.value))} className="w-12 border rounded px-1 py-1" />
                          <button type="button" onClick={handleSaveEditHabit} className="text-emerald-700 font-bold">Save</button>
                          <button type="button" onClick={() => setEditingHabitId(null)} className="text-gray-500">Cancel</button>
                        </>
                      ) : (
                        <>
                          <span className="flex-1 truncate">{habit.name} (+{habit.xp}xp)</span>
                          <button type="button" onClick={() => handleStartEditHabit(habit)} className="text-pine font-bold">Edit</button>
                          <button type="button" onClick={() => handleDeleteHabit(habit.id)} className="text-rose-600"><Trash2 className="w-3 h-3" /></button>
                        </>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={handleResetHabits} className="text-[9px] text-gray-500 underline">Reset to defaults</button>
                </div>
              )}

              <div className="space-y-1.5">
                {habitDefinitions.map(habit => {
                  const isChecked = !!dailyHabits[habit.id];
                  
                  return (
                    <button
                      key={habit.id}
                      onClick={() => handleToggleHabit(habit.id, habit.name, habit.xp)}
                      type="button"
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition duration-150 cursor-pointer select-none ${
                        isChecked 
                          ? 'border-emerald-200 bg-emerald-50/20 text-emerald-950 font-medium' 
                          : 'border-gray-100 bg-white hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${
                        isChecked 
                          ? 'bg-emerald-500 border-emerald-600 text-white' 
                          : 'border-gray-350 bg-white'
                      }`}>
                        {isChecked && <Check className="w-2.5 h-2.5" />}
                      </div>
                      <div className="flex-1 flex justify-between items-center min-w-0 pr-1">
                        <span className="text-[10.5px] truncate leading-tight">
                          {habit.name}
                        </span>
                        <span className={`text-[8.5px] font-extrabold font-mono rounded px-1 flex-shrink-0 ${isChecked ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'}`}>
                          +{habit.xp}xp
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. CALENDAR EVENTS FOR THIS DAY */}
            <div className="space-y-3.5 border-t border-gray-100 pt-3">
              <label className="text-[10px] font-black uppercase text-gray-500 tracking-wide block font-mono">
                Day Schedule &amp; Milestones
              </label>

              {/* Existing events list */}
              <div className="space-y-2">
                {(initializedEvents[selectedDateStr] || []).length === 0 ? (
                  <p className="text-[10px] text-gray-400 italic font-mono text-center py-2">
                    No custom reminders marked for this day.
                  </p>
                ) : (
                  (initializedEvents[selectedDateStr] || []).map(evt => {
                    let borderClass = 'border-l-4 border-l-pine bg-foam/40';
                    if (evt.color === 'indigo') borderClass = 'border-l-4 border-l-[#382B6B] bg-[#f0edf7]';
                    else if (evt.color === 'amber') borderClass = 'border-l-4 border-l-amber-500 bg-amber-50/40';
                    else if (evt.color === 'rose') borderClass = 'border-l-4 border-[#E5526C] bg-rose-50/30';

                    return (
                      <div 
                        key={evt.id} 
                        className={`p-2.5 rounded-xl border border-gray-150/70 flex justify-between items-start gap-2 text-left relative ${borderClass}`}
                      >
                        <div className="space-y-1 min-w-0">
                          <h5 className="text-[11px] font-extrabold text-gray-800 uppercase leading-none truncate">
                            {evt.title}
                          </h5>
                          {evt.note && (
                            <p className="text-[10px] text-gray-500 leading-normal font-mono select-text">
                              {evt.note}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteEvent(evt.id)}
                          type="button"
                          className="text-gray-400 hover:text-rose-500 p-0.5 rounded cursor-pointer transition flex-shrink-0"
                          title="Delete Milestone"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Add event small form */}
              <form onSubmit={handleAddEvent} className="bg-gray-50/50 hover:bg-gray-50 border border-gray-150 rounded-xl p-3 space-y-2.5">
                <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider flex items-center gap-1 font-mono">
                  <Plus className="w-3 h-3 text-pine" /> Create Study Milestone
                </span>

                <div className="space-y-1.5">
                  <input
                    type="text"
                    required
                    placeholder="Milestone title (e.g. abnormal mock review)"
                    value={newEventTitle}
                    onChange={e => setNewEventTitle(e.target.value)}
                    className="w-full text-[11px] px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-pine/30 placeholder:text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Brief description / checklist details"
                    value={newEventNote}
                    onChange={e => setNewEventNote(e.target.value)}
                    className="w-full text-[10.5px] px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-pine/30 placeholder:text-gray-400 font-mono"
                  />
                </div>

                <div className="flex gap-2 items-center justify-between">
                  <div className="flex gap-1.5">
                    {[
                      { id: 'pine', class: 'bg-[#1B3518]' },
                      { id: 'indigo', class: 'bg-[#382B6B]' },
                      { id: 'amber', class: 'bg-amber-500' },
                      { id: 'rose', class: 'bg-rose-500' },
                    ].map(col => (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => setNewEventColor(col.id)}
                        className={`w-3.5 h-3.5 rounded-full text-[6px] text-white flex items-center justify-center transition-all ${col.class} ${
                          newEventColor === col.id ? 'ring-2 ring-offset-1 ring-gray-400 scale-110' : ''
                        }`}
                      >
                        {newEventColor === col.id && '✓'}
                      </button>
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="px-3 py-1 bg-pine text-cream text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-pine-mid transition flex items-center gap-1 cursor-pointer select-none"
                  >
                    Add to Calendar
                  </button>
                </div>
              </form>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
