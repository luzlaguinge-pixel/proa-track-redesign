import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
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
  const syncedRef = useRef(false); // prevent double-sync on StrictMode double-invoke

  const isSupported =
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window;

  const getUserId = useCallback(() => {
    if (!user) return null;
    return user.employeeInternalId || (user.id != null ? String(user.id) : null);
  }, [user]);

  const checkSubscription = useCallback(async () => {
    if (!isSupported) return;
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
      return subscription;
    } catch {
      return null;
    }
  }, [isSupported]);

  // On mount (and whenever user is set): if permission is already granted,
  // ensure the subscription is synced to the server. This covers:
  // 1. User granted permission in a previous session but server never got it
  // 2. First launch after adding to home screen (SW just became active)
  useEffect(() => {
    if (!isSupported || !user || syncedRef.current) return;

    const currentPermission = Notification.permission;
    setPermission(currentPermission);

    if (currentPermission !== 'granted') {
      // Not yet granted — just track state, let banner prompt the user
      checkSubscription();
      return;
    }

    // Permission already granted — check if this device has a browser-side subscription.
    // If it does, sync it to the server (upsert by endpoint is safe — each device keeps its own row).
    // If not, show the banner with "Reintentar" so the user can re-subscribe on this device.
    syncedRef.current = true;
    (async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          // No browser subscription on this device. Let the banner handle re-subscription.
          setIsSubscribed(false);
          return;
        }

        // Browser subscription exists — sync it to the server for this device
        const userId = getUserId();
        if (!userId) return;
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription: subscription.toJSON(), userId }),
        });

        setIsSubscribed(true);
        console.log('[Push] Subscription synced for', userId, subscription.endpoint.slice(0, 50));
      } catch (err) {
        console.warn('[Push] Auto-sync failed:', err);
        syncedRef.current = false;
      }
    })();
  }, [isSupported, user, checkSubscription, getUserId]);

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
    if (!vapidKey) throw new Error('VITE_VAPID_PUBLIC_KEY is not defined');

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
    });

    const userId = getUserId();
    if (!userId) throw new Error('User not authenticated — cannot save subscription');

    const response = await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: subscription.toJSON(), userId }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error ?? 'Failed to save subscription');
    }

    setIsSubscribed(true);
    syncedRef.current = true;
    console.log('[Push] Subscribed for', userId);
  }, [isSupported, requestPermission, getUserId]);

  const unsubscribe = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) await subscription.unsubscribe();
      setIsSubscribed(false);
      syncedRef.current = false;
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
