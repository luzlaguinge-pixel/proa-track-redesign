import { useState } from 'react';

import Alert from '@material-hu/mui/Alert';
import Stack from '@material-hu/mui/Stack';

import Button from '@material-hu/components/design-system/Buttons/Button';
import { useNotificationPermission } from '../../../providers/NotificationContext';

const NotificationPermissionBanner = () => {
  const { permission, isSupported, subscribe } = useNotificationPermission();
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (!isSupported || permission !== 'denied' || dismissed) {
    return null;
  }

  const handleEnable = async () => {
    setLoading(true);
    try {
      await subscribe();
      setDismissed(true);
    } catch (error) {
      console.error('Failed to subscribe:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack sx={{ mb: 2 }}>
      <Alert
        severity="warning"
        onClose={() => setDismissed(true)}
        action={
          <Button
            variant="tertiary"
            size="small"
            onClick={handleEnable}
            loading={loading}
          >
            Habilitar
          </Button>
        }
      >
        Las notificaciones están deshabilitadas. Actívalas para recibir recordatorios y updates.
      </Alert>
    </Stack>
  );
};

export default NotificationPermissionBanner;
