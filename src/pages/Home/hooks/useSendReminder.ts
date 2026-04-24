import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { DISPATCHED_NOTIFS_KEY } from '../../../hooks/useDispatchedNotifications';
import { useAuth } from '../../../providers/AuthContext';

export type SendReminderResult = {
  success: boolean;
  message: string;
  navegantesNotificados: number;
};

export const useSendReminder = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const qc = useQueryClient();

  const sendReminder = async (): Promise<SendReminderResult> => {
    setIsLoading(true);
    try {
      const dispatcherName = user
        ? `${user.firstName} ${user.lastName}`.trim()
        : 'Admin';
      const dispatcherId =
        (user as { employeeInternalId?: string } | null)?.employeeInternalId ??
        String((user as { id?: number } | null)?.id ?? 'admin');

      const response = await fetch(
        '/api/notifications/send-monthly-confirmation',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dispatcherName,
            dispatcherId,
            // Empty array → API falls back to all users in push_subscriptions
            userIds: [],
          }),
        },
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(
          (err as { error?: string }).error ?? 'Failed to send notifications',
        );
      }

      const result = await response.json();
      const count: number = result.inApp ?? 0;

      // Refresh the bell so the sender sees their own notification immediately
      qc.invalidateQueries({ queryKey: DISPATCHED_NOTIFS_KEY });

      return {
        success: true,
        message: `Recordatorio enviado a ${count} ${count === 1 ? 'usuario' : 'usuarios'}.`,
        navegantesNotificados: count,
      };
    } catch (error) {
      console.error('[useSendReminder] dispatch failed:', error);
      return {
        success: false,
        message: 'Error al enviar recordatorio. Intenta más tarde.',
        navegantesNotificados: 0,
      };
    } finally {
      setIsLoading(false);
    }
  };

  return { sendReminder, isLoading };
};
