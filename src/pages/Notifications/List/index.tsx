import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  IconBell,
  IconBellOff,
  IconCheck,
  IconCircleCheck,
  IconInfoCircle,
  IconAlertTriangle,
  IconX,
} from '@material-hu/icons/tabler';
import Button from '@material-hu/components/design-system/Buttons/Button';
import Title from '@material-hu/components/design-system/Title';
import Chip from '@material-hu/mui/Chip';
import Divider from '@material-hu/mui/Divider';
import Paper from '@material-hu/mui/Paper';
import Stack from '@material-hu/mui/Stack';
import Typography from '@material-hu/mui/Typography';

import { DashboardLayout } from '../../../layouts/DashboardLayout';
import { useProfile } from '../../../providers/ProfileContext';
import { markAllRead, markRead } from '../store';
import {
  type Notificacion,
  getNotificacionesCaptador,
  getNotificacionesLiderAdmin,
} from './services';

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
  return d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const NotifCard = ({
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
        p: 2.5,
        borderRadius: 2,
        borderLeft: '3px solid',
        borderLeftColor: notif.leida ? 'divider' : cfg.color,
        opacity: notif.leida ? 0.65 : 1,
        transition: 'opacity 0.2s',
        cursor: notif.navigationPath
          ? 'pointer'
          : notif.leida
            ? 'default'
            : 'pointer',
        '&:hover':
          notif.navigationPath || !notif.leida
            ? { bgcolor: 'action.hover' }
            : {},
      }}
      onClick={handleClick}
    >
      <Stack sx={{ flexDirection: 'row', gap: 1.5, alignItems: 'flex-start' }}>
        <Stack
          sx={{
            color: notif.leida ? 'text.disabled' : cfg.color,
            mt: '2px',
            flexShrink: 0,
          }}
        >
          {cfg.icon}
        </Stack>
        <Stack sx={{ flex: 1, gap: 0.5 }}>
          <Stack
            sx={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: 1,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: notif.leida ? 400 : 600,
                color: notif.leida ? 'text.secondary' : 'text.primary',
              }}
            >
              {notif.titulo}
            </Typography>
            <Typography
              variant="caption"
              color="text.disabled"
              sx={{ flexShrink: 0 }}
            >
              {formatFecha(notif.fecha)}
            </Typography>
          </Stack>
          <Typography
            variant="caption"
            color="text.secondary"
          >
            {notif.descripcion}
          </Typography>
        </Stack>
        {!notif.leida && (
          <Stack
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: cfg.color,
              flexShrink: 0,
              mt: '6px',
            }}
          />
        )}
      </Stack>
    </Paper>
  );
};

const NotificationsList = () => {
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
    <DashboardLayout>
      <Stack sx={{ gap: 4 }}>
        <Stack
          sx={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <Title
            title="Notificaciones"
            description="Mantente al tanto de lo que pasa en tu equipo."
            variant="L"
          />
          {unread.length > 0 && (
            <Button
              variant="text"
              size="small"
              startIcon={<IconCheck size={16} />}
              onClick={handleMarkAllRead}
            >
              Marcar todo como leído
            </Button>
          )}
        </Stack>

        {notifs.length === 0 ? (
          <Stack sx={{ alignItems: 'center', gap: 2, py: 10 }}>
            <Stack sx={{ color: 'text.disabled' }}>
              <IconBellOff size={48} />
            </Stack>
            <Typography
              variant="body2"
              color="text.disabled"
            >
              No tenés notificaciones nuevas
            </Typography>
          </Stack>
        ) : (
          <Stack sx={{ gap: 4 }}>
            {unread.length > 0 && (
              <Stack sx={{ gap: 1.5 }}>
                <Stack
                  sx={{ flexDirection: 'row', gap: 1, alignItems: 'center' }}
                >
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    sx={{ fontWeight: 600, letterSpacing: '0.08em' }}
                  >
                    Sin leer
                  </Typography>
                  <Chip
                    label={unread.length}
                    size="small"
                    color="primary"
                  />
                </Stack>
                {unread.map(n => (
                  <NotifCard
                    key={`${n.id}-${tick}`}
                    notif={n}
                    onRead={handleRead}
                  />
                ))}
              </Stack>
            )}

            {unread.length > 0 && read.length > 0 && <Divider />}

            {read.length > 0 && (
              <Stack sx={{ gap: 1.5 }}>
                <Typography
                  variant="overline"
                  color="text.disabled"
                  sx={{ fontWeight: 600, letterSpacing: '0.08em' }}
                >
                  Leídas
                </Typography>
                {read.map(n => (
                  <NotifCard
                    key={`${n.id}-${tick}`}
                    notif={n}
                    onRead={handleRead}
                  />
                ))}
              </Stack>
            )}
          </Stack>
        )}
      </Stack>
    </DashboardLayout>
  );
};

export default NotificationsList;
