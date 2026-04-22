import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

import Stack from '@material-hu/mui/Stack';
import Typography from '@material-hu/mui/Typography';

import Button from '@material-hu/components/design-system/Buttons/Button';
import Pills from '@material-hu/components/design-system/Pills';
import { IconArrowLeft } from '@material-hu/icons/tabler';

import { DUEÑO_LABEL, ESTADO_CONFIG, TIPO_LABEL } from '../../../List/constants';
import type { Material } from '../../../List/types';

type MaterialHeaderProps = {
  material: Material;
  actions?: ReactNode;
};

const MaterialHeader = ({ material, actions }: MaterialHeaderProps) => {
  const navigate = useNavigate();
  const estado = ESTADO_CONFIG[material.estado];
  const subtitle = [material.osc, material.plaza].filter(Boolean).join(' · ');

  return (
    <Stack sx={{ gap: 3 }}>
      <Stack sx={{ alignItems: 'flex-start' }}>
        <Button
          variant="ghost"
          size="small"
          startIcon={<IconArrowLeft size={16} />}
          onClick={() => navigate('/inventory')}
        >
          Volver a inventario
        </Button>
      </Stack>
      <Stack
        sx={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Stack sx={{ gap: 0.5 }}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 600 }}
          >
            {TIPO_LABEL[material.tipo]}
            {material.detalle ? ` · ${material.detalle}` : ''}
          </Typography>
          {subtitle && (
            <Typography
              variant="body1"
              color="text.secondary"
            >
              {subtitle}
            </Typography>
          )}
        </Stack>
        <Stack
          sx={{
            flexDirection: 'row',
            gap: 2,
            flexShrink: 0,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Stack sx={{ flexDirection: 'row', gap: 1 }}>
            <Pills
              label={estado.label}
              type={estado.type}
              size="small"
            />
            <Pills
              label={DUEÑO_LABEL[material.dueño]}
              type="neutral"
              size="small"
            />
          </Stack>
          {actions}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default MaterialHeader;
