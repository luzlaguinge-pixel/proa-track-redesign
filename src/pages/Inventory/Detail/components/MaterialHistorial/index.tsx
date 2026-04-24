import {
  IconAlertTriangle,
  IconBell,
  IconCircleCheck,
  IconClockHour3,
  IconMailbox,
  IconTool,
  IconUserCheck,
  IconUserPlus,
  IconUserX,
  type TablerIcon,
} from '@material-hu/icons/tabler';
import Box from '@material-hu/mui/Box';
import Paper from '@material-hu/mui/Paper';
import Stack from '@material-hu/mui/Stack';
import Typography from '@material-hu/mui/Typography';

import Chip from '@material-hu/mui/Chip';

import { getOffboardedNames } from '../../../../People/lifecycleStore';
import { type HistorialEventoTipo, type Material } from '../../../List/types';

const ICONS: Record<HistorialEventoTipo, TablerIcon> = {
  asignacion: IconUserPlus,
  reasignacion: IconUserCheck,
  devolucion: IconUserCheck,
  solicitud_devolucion: IconMailbox,
  notificacion: IconBell,
  marcado_perdido: IconUserX,
  marcado_dañado: IconAlertTriangle,
  enviado_reparacion: IconTool,
  recuperado: IconCircleCheck,
};

const ICON_BG: Record<HistorialEventoTipo, string> = {
  asignacion: 'success.50',
  reasignacion: 'info.50',
  devolucion: 'success.50',
  solicitud_devolucion: 'warning.50',
  notificacion: 'warning.50',
  marcado_perdido: 'error.50',
  marcado_dañado: 'error.50',
  enviado_reparacion: 'warning.50',
  recuperado: 'success.50',
};

const ICON_COLOR: Record<HistorialEventoTipo, string> = {
  asignacion: 'success.main',
  reasignacion: 'info.main',
  devolucion: 'success.main',
  solicitud_devolucion: 'warning.main',
  notificacion: 'warning.main',
  marcado_perdido: 'error.main',
  marcado_dañado: 'error.main',
  enviado_reparacion: 'warning.main',
  recuperado: 'success.main',
};

const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

type MaterialHistorialProps = {
  material: Material;
};

const MaterialHistorial = ({ material }: MaterialHistorialProps) => {
  const events = material.historial;
  const offboardedNames = getOffboardedNames();

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Stack sx={{ gap: 3 }}>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ letterSpacing: '0.08em', fontWeight: 600 }}
        >
          Historial
        </Typography>

        {events.length === 0 ? (
          <Stack
            sx={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 2,
              py: 1,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: 'grey.100',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <IconClockHour3
                size={20}
                color="#9ca3af"
              />
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Todavía no hay eventos registrados para este material.
            </Typography>
          </Stack>
        ) : (
          <Stack sx={{ gap: 2.5 }}>
            {events.map(event => {
              const Icon = ICONS[event.tipo];
              return (
                <Stack
                  key={event.id}
                  sx={{
                    flexDirection: 'row',
                    gap: 2,
                    alignItems: 'flex-start',
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      bgcolor: ICON_BG[event.tipo],
                      color: ICON_COLOR[event.tipo],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={18} />
                  </Box>
                  <Stack sx={{ gap: 0.25, flex: 1, minWidth: 0 }}>
                    <Stack
                      sx={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        gap: 2,
                        flexWrap: 'wrap',
                        alignItems: 'flex-start',
                      }}
                    >
                      <Stack sx={{ flexDirection: 'row', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Typography
                          variant="body1"
                          sx={{ fontWeight: 500 }}
                        >
                          {event.titulo}
                        </Typography>
                        {[...offboardedNames].some(n => event.titulo.includes(n)) && (
                          <Chip label="baja" size="small" color="warning" variant="outlined" sx={{ height: 18, fontSize: 10 }} />
                        )}
                      </Stack>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {formatDateTime(event.fecha)}
                      </Typography>
                    </Stack>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Por {event.autor}
                    </Typography>
                    {event.descripcion && (
                      <Typography
                        variant="body2"
                        sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}
                      >
                        {event.descripcion}
                      </Typography>
                    )}
                  </Stack>
                </Stack>
              );
            })}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};

export default MaterialHistorial;
