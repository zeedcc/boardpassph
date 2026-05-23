import { useEffect } from 'react';
import { UserProfile } from '../types';

/**
 * Client-side study reminder checker.
 * Scans the user's calendarEvents every 30 seconds. When the current clock
 * matches an event's `time` on today's date, it fires a local notification
 * and optionally calls the server push endpoint for delivery even when the
 * PWA is backgrounded (Android).
 */
export function useStudyReminders(profile: UserProfile | null) {
  useEffect(() => {
    if (!profile) return;
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    // Clean up stale reminder-sent flags (anything before today)
    const todayStr = new Date().toISOString().split('T')[0];
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith('bp_reminder_') && !key.startsWith(`bp_reminder_${todayStr}_`)) {
        localStorage.removeItem(key);
      }
    }

    const checkReminders = () => {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      const events = profile.calendarEvents?.[dateStr] || [];
      for (const evt of events) {
        if (!evt.time) continue;
        const [h, m] = evt.time.split(':').map(Number);
        if (h !== currentHour || m !== currentMinute) continue;

        const sentKey = `bp_reminder_${dateStr}_${evt.id}`;
        if (localStorage.getItem(sentKey)) continue;

        // Local notification (works while app is open)
        try {
          new Notification('BoardPassPH · Study Reminder', {
            body: evt.title,
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            tag: evt.id,
            data: { url: '/' },
          });
        } catch {
          /* some browsers block Notification constructor */
        }

        // Server push (attempts to reach the device even when closed)
        const apiBase = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '';
        if (apiBase) {
          fetch(`${apiBase}/api/push/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: profile.email,
              title: 'BoardPassPH · Study Reminder',
              body: evt.title,
              data: { url: '/' },
            }),
          }).catch(() => {});
        }

        localStorage.setItem(sentKey, '1');
      }
    };

    checkReminders();
    const interval = setInterval(checkReminders, 30000);
    return () => clearInterval(interval);
  }, [profile]);
}
