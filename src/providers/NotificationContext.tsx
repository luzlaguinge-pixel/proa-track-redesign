import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import { useAuth } from './AuthContext';

type NotificationContextType = {
  permission: NotificationPermission | null;
  isSupported: boolean;
  isSubscribed: boolean;
  requestPermission: () => Promise<NotificationPermission>;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const isSupported =
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window;

  const getUserId = useCallback(() => {
    if (!user) return null;
    return user.employeeInternalId || (user.id != null ? String(user.id) : null);
  }, [user]);

  // Only check browser-side subscription state — do NOT auto-save to server.
  // Subscriptions are saved ONLY when the user explicitly taps the banner button.
  // This prevents the desktop Chrome subscription from silently overwriting the mobile one.
  useEffect(() => {
    if (!isSupported) return;
    setPermission(Notification.permission);
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setIsSubscribed(!!sub))
      .catch(() => {});
  }, [isSupported]);

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) throw new Error('Notifications not supported');
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, [isSupported]);

  const subscribe = useCallback(async () => {
    if (!isSupported) throw new Error('Notifications not supported');

    if (Notification.permission !== 'granted') {
      const perm = await requestPermission();
      if (perm !== 'granted') throw new Error('Notification permission denied');
    }

    const registration = await navigator.serviceWorker.ready;
    const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!vapidKey) throw new Error('VAPID public key not configured');

    let subscription: PushSubscription;
    try {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // biome-ignore lint/suspicious/noConsole: intentional push debug log
      console.error('[Push] pushManager.subscribe failed:', msg);
      throw new Error(`Subscription failed: ${msg}`);
    }

    const userId = getUserId();
    if (!userId) throw new Error('User not authenticated');

    const subJson = subscription.toJSON();
    // biome-ignore lint/suspicious/noConsole: intentional push debug log
    console.log('[Push] Subscribing:', {
      userId,
      endpoint: subscription.endpoint.slice(0, 60),
      hasP256dh: !!subJson.keys?.p256dh,
      hasAuth: !!subJson.keys?.auth,
    });

    const response = await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: subJson, userId }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error ?? 'Server failed to save subscription');
    }

    setIsSubscribed(true);
    // biome-ignore lint/suspicious/noConsole: intentional push debug log
    console.log('[Push] Subscribed and saved for', userId, subscription.endpoint.slice(0, 60));
  }, [isSupported, requestPermission, getUserId]);

  const unsubscribe = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) await subscription.unsubscribe();
      setIsSubscribed(false);
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      throw error;
    }
  }, []);

  return (
    <NotificationContext.Provider
      value={{ permission, isSupported, isSubscribed, requestPermission, subscribe, unsubscribe }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationPermission = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationPermission must be used within NotificationProvider');
  }
  return context;
};

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
