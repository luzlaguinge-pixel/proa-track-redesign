import Box from '@material-hu/mui/Box';
import Divider from '@material-hu/mui/Divider';
import Stack from '@material-hu/mui/Stack';
import Typography from '@material-hu/mui/Typography';

import StateCard from '@material-hu/components/composed-components/StateCard';
import { IconCircleCheck, IconDeviceMobile, IconTool, IconUserX } from '@material-hu/icons/tabler';

import { type AlertItem } from '../../hooks/useDashboardStats';

type AlertsListProps = {
  alertas: AlertItem[];
  onAlertClick: (alertaId: string) => void;
};

const iconConfig = {
  perdido: { bgcolor: 'error.50', color: 'error.main', Icon: IconUserX },
  reparacion: { bgcolor: 'warning.50', color: 'warning.main', Icon: IconTool },
  linea: { bgcolor: 'info.50', color: 'info.main', Icon: IconDeviceMobile },
};

export const AlertsList = ({ alertas, onAlertClick }: AlertsListProps) => {
  if (alertas.length === 0) {
    return (
      <StateCard
        title="Todo en orden"
        description="No hay materiales que requieran atención en este momento."
        Icon={IconCircleCheck}
        color="success"
      />
    );
  }

  return (
    <Stack>
      {alertas.map((alerta, index) => {
        const { bgcolor, color, Icon } = iconConfig[alerta.tipo];
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
              onClick={() => onAlertClick(alerta.id)}
            >
              <Stack flexDirection="row" gap={2} alignItems="center">
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
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {alerta.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {alerta.motivo}
                  </Typography>
                </Box>
              </Stack>
            </Box>
            {index < alertas.length - 1 && <Divider />}
          </Box>
        );
      })}
    </Stack>
  );
};
