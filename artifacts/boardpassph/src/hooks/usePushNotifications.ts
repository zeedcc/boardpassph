import { useState } from 'react';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) output[i] = rawData.charCodeAt(i);
  return output;
}

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(() =>
    'Notification' in window ? Notification.permission : 'denied'
  );
  const [subscribed, setSubscribed] = useState(() =>
    localStorage.getItem('bp_push_subscribed') === '1'
  );
  const [requesting, setRequesting] = useState(false);

  const subscribe = async (email: string) => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    setRequesting(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') return;

      const reg = await navigator.serviceWorker.ready;
      const apiBase = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '';

      const res = await fetch(`${apiBase}/api/push/vapidPublicKey`);
      const { publicKey } = await res.json();

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        // @ts-ignore - TypeScript is overly strict about ArrayBufferLike vs ArrayBuffer, but this works at runtime
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      await fetch(`${apiBase}/api/push/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, subscription: sub.toJSON() }),
      });

      localStorage.setItem('bp_push_subscribed', '1');
      setSubscribed(true);
    } catch (err) {
      console.error('Push subscription failed', err);
    } finally {
      setRequesting(false);
    }
  };

  const dismissBanner = () => {
    localStorage.setItem('bp_push_dismissed', '1');
  };

  const isBannerDismissed = localStorage.getItem('bp_push_dismissed') === '1';

  return { permission, subscribed, requesting, subscribe, dismissBanner, isBannerDismissed };
}
