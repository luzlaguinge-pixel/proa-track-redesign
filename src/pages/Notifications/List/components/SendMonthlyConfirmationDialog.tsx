import { useState } from 'react';

import Button from '@material-hu/components/design-system/Buttons/Button';
import Stack from '@material-hu/mui/Stack';
import Typography from '@material-hu/mui/Typography';
import CircularProgress from '@material-hu/mui/CircularProgress';

interface SendMonthlyConfirmationDialogProps {
  recipientCount: number;
  userCount: number;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export function SendMonthlyConfirmationDialog({
  recipientCount,
  userCount,
  onConfirm,
  onCancel,
}: SendMonthlyConfirmationDialogProps) {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setError(null);
    setIsSending(true);
    try {
      await onConfirm();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error enviando notificaciones'
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Stack sx={{ gap: 2 }}>
      <Typography variant="body2">
        Estás a punto de enviar una notificación de confirmación mensual a:{' '}
      </Typography>

      <Stack sx={{ gap: 1, bgcolor: 'info.50', p: 2, borderRadius: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {userCount} usuario{userCount !== 1 ? 's' : ''}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {recipientCount} material{recipientCount !== 1 ? 'es' : ''} a confirmar
        </Typography>
      </Stack>

      <Typography variant="caption" color="text.secondary">
        Los usuarios recibirán una notificación push con el título "Confirmá tus
        materiales" y podrán acceder directamente a la pantalla de confirmación.
      </Typography>

      {error && (
        <Typography variant="caption" color="error">
          {error}
        </Typography>
      )}

      <Stack sx={{ flexDirection: 'row', gap: 1, justifyContent: 'flex-end' }}>
        <Button
          variant="text"
          onClick={onCancel}
          disabled={isSending}
        >
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleConfirm}
          disabled={isSending}
          endIcon={isSending ? <CircularProgress size={16} /> : undefined}
        >
          {isSending ? 'Enviando...' : 'Enviar notificaciones'}
        </Button>
      </Stack>
    </Stack>
  );
}
