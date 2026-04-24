import { useEffect, useState } from 'react';

import Box from '@material-hu/mui/Box';
import Button from '@material-hu/components/design-system/Buttons/Button';
import Chip from '@material-hu/mui/Chip';
import Paper from '@material-hu/mui/Paper';
import Stack from '@material-hu/mui/Stack';
import Typography from '@material-hu/mui/Typography';

import { useAuth } from '../../providers/AuthContext';
import { useDispatchedNotifications } from '../../hooks/useDispatchedNotifications';

type SwStatus = {
  supported: boolean;
  registration: string;
  scope?: string;
  scriptURL?: string;
  state?: string;
};

type PushStatus = {
  supported: boolean;
  permission: string;
  subscription: string;
  endpoint?: string;
};

const DebugPage = () => {
  const { user } = useAuth();
  const { data: notifications = [], refetch } = useDispatchedNotifications();
  const [sw, setSw] = useState<SwStatus | null>(null);
  const [push, setPush] = useState<PushStatus | null>(null);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      if (!('serviceWorker' in navigator)) {
        setSw({ supported: false, registration: 'not supported' });
        setPush({ supported: false, permission: 'n/a', subscription: 'n/a' });
        return;
      }

      try {
        const reg = await navigator.serviceWorker.ready;
        setSw({
          supported: true,
          registration: 'active',
          scope: reg.scope,
          scriptURL: reg.active?.scriptURL ?? '(none)',
          state: reg.active?.state ?? 'unknown',
        });

        const perm = Notification.permission;
        const sub = await reg.pushManager.getSubscription();
        setPush({
          supported: 'PushManager' in window,
          permission: perm,
          subscription: sub ? 'subscribed' : 'not subscribed',
          endpoint: sub ? sub.endpoint.slice(0, 80) + '...' : undefined,
        });
      } catch (err) {
        setSw({ supported: true, registration: `error: ${String(err)}` });
        setPush({ supported: false, permission: 'error', subscription: 'error' });
      }
    };
    check();
  }, []);

  const sendTestNotification = async () => {
    setSending(true);
    setSendResult(null);
    try {
      const userId =
        (user as { employeeInternalId?: string } | null)?.employeeInternalId ??
        String((user as { id?: number } | null)?.id ?? '');
      const dispatcherName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Debug';

      const res = await fetch('/api/notifications/send-custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIds: [userId],
          title: 'Test desde Debug',
          body: `Enviado a ${userId} — ${new Date().toLocaleTimeString('es-AR')}`,
          url: '/debug',
          dispatcherName,
          dispatcherId: userId,
        }),
      });
      const data = await res.json();
      setSendResult(JSON.stringify(data, null, 2));
      refetch();
    } catch (err) {
      setSendResult(`Error: ${String(err)}`);
    } finally {
      setSending(false);
    }
  };

  const userId =
    (user as { employeeInternalId?: string } | null)?.employeeInternalId ??
    String((user as { id?: number } | null)?.id ?? '—');

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
        Diagnóstico de Notificaciones
      </Typography>

      <Stack sx={{ gap: 2 }}>
        {/* Session */}
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="overline" color="text.secondary">Sesión</Typography>
          <Stack sx={{ mt: 1, gap: 0.5 }}>
            <Typography variant="body2">Usuario: <strong>{user?.firstName} {user?.lastName}</strong></Typography>
            <Typography variant="body2">User ID (push key): <code style={{ fontSize: 11 }}>{userId}</code></Typography>
          </Stack>
        </Paper>

        {/* Service Worker */}
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="overline" color="text.secondary">Service Worker</Typography>
          {sw ? (
            <Stack sx={{ mt: 1, gap: 0.5 }}>
              <Stack direction="row" gap={1} alignItems="center">
                <Typography variant="body2">Estado:</Typography>
                <Chip
                  label={sw.registration}
                  size="small"
                  color={sw.registration === 'active' ? 'success' : 'error'}
                />
              </Stack>
              {sw.scriptURL && (
                <Typography variant="body2" sx={{ fontSize: 11, color: 'text.secondary' }}>
                  Script: {sw.scriptURL}
                </Typography>
              )}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">Cargando...</Typography>
          )}
        </Paper>

        {/* Push Subscription */}
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="overline" color="text.secondary">Push Subscription</Typography>
          {push ? (
            <Stack sx={{ mt: 1, gap: 0.5 }}>
              <Stack direction="row" gap={1} alignItems="center">
                <Typography variant="body2">Permiso:</Typography>
                <Chip
                  label={push.permission}
                  size="small"
                  color={push.permission === 'granted' ? 'success' : push.permission === 'denied' ? 'error' : 'default'}
                />
              </Stack>
              <Stack direction="row" gap={1} alignItems="center">
                <Typography variant="body2">Suscripción:</Typography>
                <Chip
                  label={push.subscription}
                  size="small"
                  color={push.subscription === 'subscribed' ? 'success' : 'warning'}
                />
              </Stack>
              {push.endpoint && (
                <Typography variant="body2" sx={{ fontSize: 10, color: 'text.secondary', wordBreak: 'break-all' }}>
                  Endpoint: {push.endpoint}
                </Typography>
              )}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">Cargando...</Typography>
          )}
        </Paper>

        {/* Test send */}
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="overline" color="text.secondary">Test de Envío</Typography>
          <Stack sx={{ mt: 1, gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Envía una notificación a tu propio usuario y verifica que aparezca en la campana.
            </Typography>
            <Button
              variant="primary"
              size="small"
              onClick={sendTestNotification}
              loading={sending}
            >
              Enviar test a mí mismo
            </Button>
            {sendResult && (
              <Box
                component="pre"
                sx={{
                  fontSize: 10,
                  p: 1.5,
                  bgcolor: 'grey.50',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'grey.200',
                  overflow: 'auto',
                  maxHeight: 200,
                }}
              >
                {sendResult}
              </Box>
            )}
          </Stack>
        </Paper>

        {/* Recent notifications */}
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="overline" color="text.secondary">
              Últimas notificaciones en DB ({notifications.length})
            </Typography>
            <Button variant="tertiary" size="small" onClick={() => refetch()}>
              Actualizar
            </Button>
          </Stack>
          {notifications.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Sin notificaciones. Enviá el test y presioná Actualizar.
            </Typography>
          ) : (
            <Stack sx={{ gap: 1 }}>
              {notifications.slice(0, 5).map(n => (
                <Box
                  key={n.id}
                  sx={{
                    p: 1.5,
                    bgcolor: 'grey.50',
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: n.isRead ? 'grey.200' : 'primary.200',
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{n.title}</Typography>
                    <Chip
                      label={n.pushStatus}
                      size="small"
                      color={
                        n.pushStatus === 'sent' ? 'success' :
                        n.pushStatus === 'no_subscription' ? 'warning' :
                        n.pushStatus === 'failed' ? 'error' : 'default'
                      }
                    />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">{n.body}</Typography>
                  <br />
                  <Typography variant="caption" color="text.disabled">
                    {new Date(n.createdAt).toLocaleString('es-AR')}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </Paper>

        {/* iOS PWA note */}
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'warning.50', borderColor: 'warning.200' }}>
          <Typography variant="overline" color="warning.dark">iOS: Requisito de PWA</Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            En iOS, las notificaciones push <strong>solo llegan si la app está guardada en la pantalla de inicio</strong> (Compartir → Agregar a inicio). Si la abrís desde Safari sin instalarla, los push se descartan silenciosamente.
          </Typography>
        </Paper>
      </Stack>
    </Box>
  );
};

export default DebugPage;
