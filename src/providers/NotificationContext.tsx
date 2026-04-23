import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

type NotificationContextType = {
  permission: NotificationPermission | null;
  isSupported: boolean;
  isSubscribed: boolean;
  requestPermission: () => Promise<NotificationPermission>;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const isSupported = 'Notification' in window && 'serviceWorker' in navigator;

  const checkSubscription = useCallback(async () => {
    if (!isSupported) return;

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Failed to check subscription:', error);
    }
  }, [isSupported]);

  useEffect(() => {
    if (!isSupported) return;

    setPermission(Notification.permission);
    checkSubscription();
  }, [isSupported, checkSubscription]);

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      throw new Error('Notifications not supported');
    }

    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  };

  const subscribe = async () => {
    if (!isSupported) {
      throw new Error('Notifications not supported');
    }

    if (Notification.permission !== 'granted') {
      const perm = await requestPermission();
      if (perm !== 'granted') {
        throw new Error('Notification permission denied');
      }
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        throw new Error('VITE_VAPID_PUBLIC_KEY is not defined');
      }
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
      });

      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscription: subscription.toJSON() }),
      });

      setIsSubscribed(true);
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      throw error;
    }
  };

  const unsubscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }
      setIsSubscribed(false);
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      throw error;
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        permission,
        isSupported,
        isSubscribed,
        requestPermission,
        subscribe,
        unsubscribe,
      }}
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
