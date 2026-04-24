import { useState } from 'react';

import Alert from '@material-hu/mui/Alert';
import Stack from '@material-hu/mui/Stack';

import Button from '@material-hu/components/design-system/Buttons/Button';
import { useNotificationPermission } from '../../../providers/NotificationContext';

const NotificationPermissionBanner = () => {
  const { permission, isSupported, subscribe } = useNotificationPermission();
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Show the banner when the user hasn't been asked yet ('default')
  // or when permission was explicitly denied ('denied').
  // Hide if already granted or if the user dismissed the banner this session.
  if (!isSupported || permission === 'granted' || dismissed) {
    return null;
  }

  const isDenied = permission === 'denied';

  const handleEnable = async () => {
    if (isDenied) {
      // Can't re-prompt when denied — user must change it in browser settings
      setError(
        'Las notificaciones están bloqueadas en tu navegador. Andá a Configuración del sitio para habilitarlas.',
      );
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await subscribe();
      setDismissed(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      if (msg.includes('denied')) {
        setError(
          'Bloqueaste las notificaciones. Podés habilitarlas desde Configuración del sitio en tu navegador.',
        );
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack sx={{ mb: 2 }}>
      <Alert
        severity={isDenied ? 'error' : 'info'}
        onClose={() => setDismissed(true)}
        action={
          !isDenied ? (
            <Button
              variant="tertiary"
              size="small"
              onClick={handleEnable}
              loading={loading}
            >
              Activar
            </Button>
          ) : undefined
        }
      >
        {error ??
          (isDenied
            ? 'Las notificaciones están bloqueadas. Habilitálas desde Configuración de tu navegador para recibir recordatorios.'
            : 'Activá las notificaciones para recibir recordatorios de confirmación de materiales.')}
      </Alert>
    </Stack>
  );
};

export default NotificationPermissionBanner;
