import { useState } from 'react';

import {
  getNavegantesConConfirmacionesPendientes,
  sendBulkReminderNotifications,
} from '../../Notifications/List/services';

export type SendReminderResult = {
  success: boolean;
  message: string;
  navegantesNotificados: number;
};

export const useSendReminder = () => {
  const [isLoading, setIsLoading] = useState(false);

  const sendReminder = async (): Promise<SendReminderResult> => {
    setIsLoading(true);
    try {
      const navegantes = getNavegantesConConfirmacionesPendientes();

      if (navegantes.length === 0) {
        return {
          success: true,
          message: 'No hay navegantes con confirmaciones pendientes.',
          navegantesNotificados: 0,
        };
      }

      // Generate notifications for all navegantes with pending confirmations
      const notificaciones = sendBulkReminderNotifications();

      return {
        success: true,
        message: `Recordatorio enviado a ${navegantes.length} ${navegantes.length === 1 ? 'navegante' : 'navegantes'} con confirmaciones pendientes.`,
        navegantesNotificados: navegantes.length,
      };
    } catch (error) {
      console.error('Error sending reminder:', error);
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
