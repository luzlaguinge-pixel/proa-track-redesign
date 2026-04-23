import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  IconCheck,
  IconBellOff,
  IconAlertTriangle,
  IconX,
  IconCircleCheck,
  IconInfoCircle,
} from '@material-hu/icons/tabler';
import Button from '@material-hu/components/design-system/Buttons/Button';
import Chip from '@material-hu/mui/Chip';
import Divider from '@material-hu/mui/Divider';
import Paper from '@material-hu/mui/Paper';
import Stack from '@material-hu/mui/Stack';
import Typography from '@material-hu/mui/Typography';

import { useProfile } from '../../../providers/ProfileContext';
import { markAllRead, markRead } from '../store';
import { type Notificacion, getNotificacionesCaptador, getNotificacionesLiderAdmin } from '../List/services';

const DEMO_CAPTADOR_NOMBRE = 'Ana García';
const DEMO_LIDER_NOMBRE = 'Carlos López';
const DEMO_TEAM_NOMBRES = [
  'Ana García',
  'María Rodríguez',
  'Luis Martínez',
  'Pablo Fernández',
  'Sofía Torres',
];

const SEVERITY_CONFIG = {
  info: {
    icon: <IconInfoCircle size={18} />,
    color: 'info.main' as const,
    bgColor: 'info.50',
    label: 'Info',
  },
  warning: {
    icon: <IconAlertTriangle size={18} />,
    color: 'warning.main' as const,
    bgColor: 'warning.50',
    label: 'Aviso',
  },
  error: {
    icon: <IconX size={18} />,
    color: 'error.main' as const,
    bgColor: 'error.50',
    label: 'Urgente',
  },
  success: {
    icon: <IconCircleCheck size={18} />,
    color: 'success.main' as const,
    bgColor: 'success.50',
    label: 'Ok',
  },
};

const formatFecha = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const NotifCardCompact = ({
  notif,
  onRead,
}: {
  notif: Notificacion;
  onRead: (id: string) => void;
}) => {
  const cfg = SEVERITY_CONFIG[notif.severity];
  const navigate = useNavigate();

  const handleClick = () => {
    if (!notif.leida) {
      onRead(notif.id);
    }
    if (notif.navigationPath) {
      navigate(notif.navigationPath);
    }
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 1,
        borderLeft: '3px solid',
        borderLeftColor: notif.leida ? 'divider' : cfg.color,
        opacity: notif.leida ? 0.65 : 1,
        transition: 'opacity 0.2s',
        cursor: notif.navigationPath ? 'pointer' : (notif.leida ? 'default' : 'pointer'),
        '&:hover': notif.navigationPath || !notif.leida ? { bgcolor: 'action.hover' } : {},
      }}
      onClick={handleClick}
    >
      <Stack sx={{ flexDirection: 'row', gap: 1, alignItems: 'flex-start' }}>
        <Stack
          sx={{
            color: notif.leida ? 'text.disabled' : cfg.color,
            mt: '1px',
            flexShrink: 0,
          }}
        >
          {cfg.icon}
        </Stack>
        <Stack sx={{ flex: 1, gap: 0.25, minWidth: 0 }}>
          <Typography
            variant="caption"
            sx={{ fontWeight: notif.leida ? 400 : 600, color: notif.leida ? 'text.secondary' : 'text.primary' }}
          >
            {notif.titulo}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            {formatFecha(notif.fecha)}
          </Typography>
        </Stack>
        {!notif.leida && (
          <Stack
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: cfg.color,
              flexShrink: 0,
              mt: '5px',
            }}
          />
        )}
      </Stack>
    </Paper>
  );
};

export const NotificationsMenu = ({
  onClose,
}: {
  onClose?: () => void;
}) => {
  const { perfil } = useProfile();
  const [tick, setTick] = useState(0);

  const notifs: Notificacion[] =
    perfil === 'navegante'
      ? getNotificacionesCaptador(DEMO_CAPTADOR_NOMBRE)
      : getNotificacionesLiderAdmin(DEMO_TEAM_NOMBRES);

  const unread = notifs.filter(n => !n.leida);
  const read = notifs.filter(n => n.leida);

  const handleRead = (id: string) => {
    markRead(id);
    setTick(t => t + 1);
  };

  const handleMarkAllRead = () => {
    markAllRead(notifs.map(n => n.id));
    setTick(t => t + 1);
  };

  return (
    <Paper
      sx={{
        width: 320,
        maxHeight: 500,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        borderRadius: 1,
      }}
      variant="outlined"
    >
      <Stack
        sx={{
          p: 2,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid',
          borderBottomColor: 'divider',
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          Notificaciones
        </Typography>
        {unread.length > 0 && (
          <Button
            variant="text"
            size="small"
            startIcon={<IconCheck size={14} />}
            onClick={handleMarkAllRead}
            sx={{ fontSize: '0.75rem' }}
          >
            Marcar todo
          </Button>
        )}
      </Stack>

      {notifs.length === 0 ? (
        <Stack sx={{ alignItems: 'center', gap: 1.5, py: 4, px: 2, justifyContent: 'center' }}>
          <Stack sx={{ color: 'text.disabled' }}>
            <IconBellOff size={32} />
          </Stack>
          <Typography variant="caption" color="text.disabled" sx={{ textAlign: 'center' }}>
            Sin notificaciones
          </Typography>
        </Stack>
      ) : (
        <Stack sx={{ flex: 1, overflowY: 'auto', gap: 1, p: 2 }}>
          {unread.length > 0 && (
            <Stack sx={{ gap: 1 }}>
              <Stack sx={{ flexDirection: 'row', gap: 0.5, alignItems: 'center' }}>
                <Typography variant="overline" sx={{ fontWeight: 600, fontSize: '0.65rem', color: 'text.secondary' }}>
                  Sin leer
                </Typography>
                <Chip label={unread.length} size="small" color="primary" sx={{ height: 16, fontSize: '0.65rem' }} />
              </Stack>
              {unread.map(n => (
                <NotifCardCompact key={`${n.id}-${tick}`} notif={n} onRead={handleRead} />
              ))}
            </Stack>
          )}

          {unread.length > 0 && read.length > 0 && <Divider sx={{ my: 0.5 }} />}

          {read.length > 0 && (
            <Stack sx={{ gap: 1 }}>
              <Typography variant="overline" sx={{ fontWeight: 600, fontSize: '0.65rem', color: 'text.disabled' }}>
                Leídas
              </Typography>
              {read.slice(0, 3).map(n => (
                <NotifCardCompact key={`${n.id}-${tick}`} notif={n} onRead={handleRead} />
              ))}
              {read.length > 3 && (
                <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', py: 1 }}>
                  +{read.length - 3} más
                </Typography>
              )}
            </Stack>
          )}
        </Stack>
      )}
    </Paper>
  );
};
