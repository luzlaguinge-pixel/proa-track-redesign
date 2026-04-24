import { useState } from 'react';

import Alert from '@material-hu/mui/Alert';
import Stack from '@material-hu/mui/Stack';

import Button from '@material-hu/components/design-system/Buttons/Button';
import { useNotificationPermission } from '../../../providers/NotificationContext';

const NotificationPermissionBanner = () => {
  const { permission, isSupported, isSubscribed, subscribe } = useNotificationPermission();
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Show when:
  // - permission not yet asked ('default') → prompt to enable
  // - permission denied ('denied') → instruct to change in browser settings
  // - permission granted but subscription not confirmed ('granted' + !isSubscribed) → auto-sync in progress; show retry if needed
  const needsAction =
    permission === 'default' ||
    permission === 'denied' ||
    (permission === 'granted' && !isSubscribed);

  if (!isSupported || !needsAction || dismissed) {
    return null;
  }

  const isDenied = permission === 'denied';
  const isGrantedNotSynced = permission === 'granted' && !isSubscribed;

  const handleEnable = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isDenied) {
        setError(
          'Las notificaciones están bloqueadas. En Safari: Configuración → [nombre del sitio] → Notificaciones.',
        );
        return;
      }
      // Call Notification.requestPermission() first to satisfy iOS user gesture requirement
      if (permission !== 'granted') {
        const perm = await Notification.requestPermission();
        if (perm !== 'granted') {
          setError(
            'No se otorgaron permisos. En Safari: Configuración → [nombre del sitio] → Notificaciones.',
          );
          return;
        }
      }
      await subscribe();
      setDismissed(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      setError(msg);
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
              {isGrantedNotSynced ? 'Reintentar' : 'Activar'}
            </Button>
          ) : undefined
        }
      >
        {error ??
          (isDenied
            ? 'Las notificaciones están bloqueadas. Habilitálas desde Configuración de tu navegador.'
            : isGrantedNotSynced
              ? 'Notificaciones activadas pero no sincronizadas. Tocá Reintentar.'
              : 'Activá las notificaciones para recibir recordatorios de materiales.')}
      </Alert>
    </Stack>
  );
};

export default NotificationPermissionBanner;
