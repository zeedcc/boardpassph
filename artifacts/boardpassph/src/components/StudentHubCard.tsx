import React, { useState, useEffect } from 'react';
import { Clock, ShieldAlert, Award, ArrowRight, Star } from 'lucide-react';
import { UserProfile } from '../types';

interface StudentHubCardProps {
  profile: UserProfile;
  onNavigate: (tabId: string) => void;
}

export const StudentHubCard: React.FC<StudentHubCardProps> = ({ profile, onNavigate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOver: false
  });

  const [trialDaysLeft, setTrialDaysLeft] = useState(0);

  // 1. Live Countdown for PmLE 2026 (August 19, 2026 08:00:00 PST / GMT+8)
  useEffect(() => {
    const targetDate = new Date('2026-08-19T08:00:00+08:00').getTime();

    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isOver: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isOver: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  // 2. Trial Period Days Left Calculation
  useEffect(() => {
    if (!profile.signUpDate) {
      setTrialDaysLeft(7);
      return;
    }

    const calculateTrialDays = () => {
      const signUpStr = profile.signUpDate || '';
      const signUpDate = new Date(signUpStr);
      signUpDate.setHours(0, 0, 0, 0);

      const trialLength = 7; // 7-day trial
      const endDate = new Date(signUpDate.getTime() + trialLength * 24 * 60 * 60 * 1000);
      endDate.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const diffTime = endDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      setTrialDaysLeft(Math.max(0, diffDays));
    };

    calculateTrialDays();
  }, [profile.signUpDate]);

  const isTrial = profile.tier === 'Clinical Trial' || profile.tier === 'Free';

  return (
    <div className="space-y-4">
      {/* 1. PmLE COUNTDOWN CARD */}
      <div className="bg-gradient-to-br from-pine to-pine-mid border border-pine-light/20 rounded-2xl p-4 text-cream shadow-md relative overflow-hidden select-none">
        {/* Subtle decorative grid background */}
        <div className="absolute inset-0 opacity-5 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-mint animate-pulse" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-mint/95 font-mono">
            PmLE 2026 Board Count
          </span>
        </div>

        {timeLeft.isOver ? (
          <div className="text-center font-display text-lg text-mint font-semibold">
            🎉 Board Exam is today! Good luck!
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-1.5 text-center">
            <div className="bg-pine-mid/55 border border-pine-light/10 rounded-xl p-2 animate-in fade-in zoom-in-95 duration-200">
              <span className="block font-heading font-black text-lg text-cream leading-tight font-mono">
                {timeLeft.days}
              </span>
              <span className="text-[8px] uppercase tracking-wider text-sage font-semibold font-mono">
                Days
              </span>
            </div>
            <div className="bg-pine-mid/55 border border-pine-light/10 rounded-xl p-2 animate-in fade-in zoom-in-95 duration-200">
              <span className="block font-heading font-black text-lg text-cream leading-tight font-mono font-sans">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[8px] uppercase tracking-wider text-sage font-semibold font-mono">
                Hours
              </span>
            </div>
            <div className="bg-pine-mid/55 border border-pine-light/10 rounded-xl p-2 animate-in fade-in zoom-in-95 duration-200">
              <span className="block font-heading font-black text-lg text-cream leading-tight font-mono">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[8px] uppercase tracking-wider text-sage font-semibold font-mono">
                Mins
              </span>
            </div>
            <div className="bg-pine-mid/55 border border-pine-light/10 rounded-xl p-2 animate-in fade-in zoom-in-95 duration-200">
              <span className="block font-heading font-black text-lg text-cream leading-tight font-mono animate-pulse">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[8px] uppercase tracking-wider text-sage font-semibold font-mono">
                Secs
              </span>
            </div>
          </div>
        )}

        <div className="mt-3 text-[9px] text-sage/75 text-center italic font-mono leading-relaxed">
          &quot;August 19, 2026 — Master your PRC Psychometrician matrices daily.&quot;
        </div>
      </div>

      {/* 2. TRIAL STATUS CARD */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm select-none">
        {isTrial ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5 text-rose-700">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                <span className="text-[10px] uppercase font-bold tracking-wide font-mono animate-pulse">
                  Trial Status
                </span>
              </div>
              <span className="text-[10px] font-mono font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                {trialDaysLeft} {trialDaysLeft === 1 ? 'day' : 'days'} left
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-baseline">
                <span className="text-[11px] font-bold text-gray-800 uppercase font-mono">
                  Reviewer Core Access
                </span>
                <span className="text-[9px] text-gray-400 font-mono">
                  {trialDaysLeft} of 7 days
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    trialDaysLeft <= 2 
                      ? 'bg-gradient-to-r from-red-500 to-rose-400' 
                      : 'bg-gradient-to-r from-teal-500 to-mint'
                  }`}
                  style={{ width: `${(trialDaysLeft / 7) * 100}%` }}
                />
              </div>
            </div>

            <p className="text-[9.5px] text-gray-400 leading-normal">
              Unlock the complete PRC subjects index, 100-item timer board, and AI PDF generation today.
            </p>

            <button
              onClick={() => onNavigate('billingTab')}
              className="w-full flex items-center justify-between px-3 py-2 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 text-white font-sans text-[11px] font-black uppercase tracking-wider rounded-xl transition shadow hover:shadow-md cursor-pointer select-none group"
            >
              <span>Unlock Premium Access</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 animate-pulse" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5 text-amber-700">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 animate-pulse" />
                <span className="text-[10px] uppercase font-bold tracking-wide font-mono">
                  License Status
                </span>
              </div>
              <span className="text-[9px] font-mono font-black text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                PRO ACTIVE
              </span>
            </div>

            <div className="p-2.5 bg-amber-50/45 border border-amber-100 rounded-xl">
              <div className="flex items-start gap-2">
                <Award className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-[11px] font-extrabold text-amber-950 uppercase leading-snug">
                    {profile.tier} Subscription Active
                  </h5>
                  <p className="text-[9.5px] text-amber-800/80 leading-normal mt-0.5 animate-in fade-in-20">
                    Your portal has unlimited clinical questions, flashcard sets, custom PDF engines, and mock systems unlocked.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
