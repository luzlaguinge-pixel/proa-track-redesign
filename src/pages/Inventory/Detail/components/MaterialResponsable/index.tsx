import Box from '@material-hu/mui/Box';
import Paper from '@material-hu/mui/Paper';
import Stack from '@material-hu/mui/Stack';
import Typography from '@material-hu/mui/Typography';

import Pills from '@material-hu/components/design-system/Pills';
import { IconUser, IconUserOff } from '@material-hu/icons/tabler';

import type { Material } from '../../../List/types';

type MaterialResponsableProps = {
  material: Material;
};

const MaterialResponsable = ({ material }: MaterialResponsableProps) => {
  const { responsableNombre, responsableDni, responsableTelefono, comodatoFirmado } = material;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Stack sx={{ gap: 2 }}>
        <Stack
          sx={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ letterSpacing: '0.08em', fontWeight: 600 }}
          >
            Responsable actual
          </Typography>
          {responsableNombre && (
            <Pills
              label={comodatoFirmado ? 'Comodato firmado' : 'Sin comodato'}
              type={comodatoFirmado ? 'success' : 'neutral'}
              size="small"
            />
          )}
        </Stack>

        {responsableNombre ? (
          <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: 'grey.100',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <IconUser size={24} />
            </Box>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                rowGap: 1.5,
                columnGap: 4,
                flex: 1,
              }}
            >
              <Stack sx={{ gap: 0.25 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Nombre
                </Typography>
                <Typography variant="body1">{responsableNombre}</Typography>
              </Stack>
              <Stack sx={{ gap: 0.25 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  DNI
                </Typography>
                <Typography variant="body1">{responsableDni || '—'}</Typography>
              </Stack>
              <Stack sx={{ gap: 0.25 }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Teléfono
                </Typography>
                <Typography variant="body1">{responsableTelefono || '—'}</Typography>
              </Stack>
            </Box>
          </Stack>
        ) : (
          <Stack
            sx={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 2,
              py: 2,
            }}
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: 'grey.100',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <IconUserOff
                size={24}
                color="#9ca3af"
              />
            </Box>
            <Stack sx={{ gap: 0.25 }}>
              <Typography
                variant="body1"
                sx={{ fontWeight: 500 }}
              >
                Sin asignar
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Este material no tiene un responsable asignado.
              </Typography>
            </Stack>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};

export default MaterialResponsable;
