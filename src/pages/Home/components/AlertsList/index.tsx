import {
  IconBell,
  IconCircleCheck,
  IconDeviceMobile,
  IconTool,
  IconUserMinus,
  IconUserX,
  type TablerIcon,
} from '@material-hu/icons/tabler';
import Box from '@material-hu/mui/Box';
import Divider from '@material-hu/mui/Divider';
import Stack from '@material-hu/mui/Stack';
import Typography from '@material-hu/mui/Typography';

import StateCard from '@material-hu/components/composed-components/StateCard';
import Pills from '@material-hu/components/design-system/Pills';
import { type PillsProps } from '@material-hu/components/design-system/Pills/types';

import { type AlertItem, type AlertTipo } from '../../hooks/useDashboardStats';

type AlertsListProps = {
  alertas: AlertItem[];
  onAlertClick: (linkTo: string) => void;
};

type IconConfig = {
  Icon: TablerIcon;
  bgcolor: string;
  color: string;
};

const ICON_CONFIG: Record<AlertTipo, IconConfig> = {
  perdido: { Icon: IconUserX, bgcolor: 'error.50', color: 'error.main' },
  reparacion: { Icon: IconTool, bgcolor: 'warning.50', color: 'warning.main' },
  linea: { Icon: IconDeviceMobile, bgcolor: 'info.50', color: 'info.main' },
  baja_pendiente: {
    Icon: IconUserMinus,
    bgcolor: 'warning.50',
    color: 'warning.main',
  },
  baja_escalada: {
    Icon: IconUserMinus,
    bgcolor: 'error.50',
    color: 'error.main',
  },
  confirmacion_vencida: {
    Icon: IconBell,
    bgcolor: 'warning.50',
    color: 'warning.main',
  },
};

const PILL_TYPE: Record<AlertTipo, PillsProps['type']> = {
  perdido: 'error',
  reparacion: 'warning',
  linea: 'info',
  baja_pendiente: 'warning',
  baja_escalada: 'error',
  confirmacion_vencida: 'warning',
};

export const AlertsList = ({ alertas, onAlertClick }: AlertsListProps) => {
  if (alertas.length === 0) {
    return (
      <StateCard
        Icon={IconCircleCheck}
        color="success"
        title="Todo en orden"
        description="No hay materiales que requieran atención."
      />
    );
  }

  return (
    <Stack>
      {alertas.map((alerta, index) => {
        const { Icon, bgcolor, color } = ICON_CONFIG[alerta.tipo];
        const pillType = PILL_TYPE[alerta.tipo];
        return (
          <Box key={alerta.id}>
            <Box
              sx={{
                cursor: 'pointer',
                '&:hover': { bgcolor: 'action.hover' },
                borderRadius: 1,
                p: 1,
                mx: -1,
              }}
              onClick={() => onAlertClick(alerta.linkTo)}
              role="button"
              aria-label={alerta.label}
            >
              <Stack
                sx={{ flexDirection: 'row', gap: 2, alignItems: 'center' }}
              >
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    bgcolor,
                    color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={18} />
                </Box>
                <Stack sx={{ flex: 1, gap: 0, minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600 }}
                    noWrap
                  >
                    {alerta.label}
                  </Typography>
                  {alerta.sublabel && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      noWrap
                    >
                      {alerta.sublabel}
                    </Typography>
                  )}
                </Stack>
                <Pills
                  label={alerta.motivo}
                  type={pillType}
                  size="small"
                />
              </Stack>
            </Box>
            {index < alertas.length - 1 && <Divider />}
          </Box>
        );
      })}
    </Stack>
  );
};
