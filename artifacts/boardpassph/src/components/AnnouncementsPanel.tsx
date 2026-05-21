import React, { useState, useEffect } from 'react';
import { Megaphone, Pin, Info, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

export interface Announcement {
  id: string;
  title: string;
  body: string;
  author: string;
  createdAt: string;
  pinned?: boolean;
  type?: 'info' | 'warning' | 'success';
}

const LOCAL_KEY = 'bp_announcements';

function loadLocalAnnouncements(): Announcement[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export const AnnouncementsPanel: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>(loadLocalAnnouncements);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const col = collection(db, 'announcements');
    const q = query(col, orderBy('createdAt', 'desc'));

    const unsub = onSnapshot(q, (snap) => {
      const list: Announcement[] = [];
      snap.forEach((d) => list.push(d.data() as Announcement));
      setAnnouncements(list);
      localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
      setLoading(false);
    }, () => {
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const sorted = [
    ...announcements.filter(a => a.pinned),
    ...announcements.filter(a => !a.pinned),
  ];

  const typeStyle = (type?: string) => {
    switch (type) {
      case 'warning': return { border: 'border-amber-200', bg: 'bg-amber-50', icon: <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />, badge: 'bg-amber-100 text-amber-800' };
      case 'success': return { border: 'border-emerald-200', bg: 'bg-emerald-50', icon: <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />, badge: 'bg-emerald-100 text-emerald-800' };
      default:        return { border: 'border-blue-200',   bg: 'bg-blue-50',    icon: <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />,            badge: 'bg-blue-100 text-blue-800' };
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-display text-2xl text-pine">Announcements</h2>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Official updates, reminders, and news from the BoardPassPH team.
          </p>
        </div>
        <span className="text-xs font-mono font-bold text-pine bg-foam border border-pine/10 px-3 py-1.5 rounded-full select-none">
          {sorted.length} Post{sorted.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <div className="py-16 text-center space-y-3">
          <Megaphone className="w-10 h-10 text-gray-300 mx-auto animate-pulse" />
          <p className="text-xs text-gray-400">Loading announcements…</p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-200 rounded-3xl p-16 text-center text-gray-500 max-w-lg mx-auto">
          <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h5 className="font-heading font-black text-gray-700">No Announcements Yet</h5>
          <p className="text-xs text-gray-400 mt-1">
            Check back here for official updates, exam reminders, and platform news.
          </p>
        </div>
      ) : (
        <div className="space-y-4 max-w-3xl">
          {sorted.map((ann) => {
            const s = typeStyle(ann.type);
            return (
              <div
                key={ann.id}
                className={`border ${s.border} ${s.bg} rounded-2xl p-5 space-y-2 shadow-sm`}
              >
                <div className="flex items-start gap-3">
                  {s.icon}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-heading font-black text-sm text-gray-900 leading-snug">
                        {ann.title}
                      </h3>
                      {ann.pinned && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-pine text-cream text-[9px] font-black uppercase tracking-wider rounded-full">
                          <Pin className="w-2.5 h-2.5" />
                          Pinned
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide ${s.badge}`}>
                        {ann.type || 'info'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed mt-1.5 whitespace-pre-line">
                      {ann.body}
                    </p>
                    <div className="flex items-center gap-3 mt-3 text-[10px] text-gray-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(ann.createdAt)}
                      </span>
                      <span>· Posted by <strong className="text-gray-500">{ann.author}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
