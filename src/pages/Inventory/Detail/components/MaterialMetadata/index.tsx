import Box from '@material-hu/mui/Box';
import Divider from '@material-hu/mui/Divider';
import Paper from '@material-hu/mui/Paper';
import Stack from '@material-hu/mui/Stack';
import Typography from '@material-hu/mui/Typography';

import type { Material, MaterialPais } from '../../../List/types';

const PAIS_LABEL: Record<MaterialPais, string> = {
  AR: 'Argentina',
  UY: 'Uruguay',
  GT: 'Guatemala',
};

const ESTADO_FISICO_LABEL: Record<Material['estadoFisico'], string> = {
  ok: 'OK',
  dañado: 'Dañado',
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

type MaterialMetadataProps = {
  material: Material;
};

type Item = { label: string; value: string };

const Section = ({ title, items }: { title: string; items: Item[] }) => (
  <Stack sx={{ gap: 2 }}>
    <Typography
      variant="overline"
      color="text.secondary"
      sx={{ letterSpacing: '0.08em', fontWeight: 600 }}
    >
      {title}
    </Typography>
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
        rowGap: 2.5,
        columnGap: 4,
      }}
    >
      {items.map(item => (
        <Stack
          key={item.label}
          sx={{ gap: 0.25 }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
          >
            {item.label}
          </Typography>
          <Typography variant="body1">{item.value}</Typography>
        </Stack>
      ))}
    </Box>
  </Stack>
);

const MaterialMetadata = ({ material }: MaterialMetadataProps) => {
  const ubicacion: Item[] = [
    { label: 'OSC', value: material.osc || '—' },
    { label: 'Plaza', value: material.plaza },
    { label: 'País', value: PAIS_LABEL[material.pais] },
  ];

  const estadoFisico: Item[] = [
    {
      label: 'Estado físico',
      value: ESTADO_FISICO_LABEL[material.estadoFisico],
    },
    { label: 'Cantidad', value: String(material.cantidad) },
    {
      label: 'Fecha actualización',
      value: formatDate(material.fechaActualizacion),
    },
  ];

  if (material.lineaTelefonica) {
    estadoFisico.push({
      label: 'Línea telefónica',
      value: material.lineaTelefonica,
    });
  }

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
        <Section
          title="Ubicación"
          items={ubicacion}
        />
        <Divider />
        <Section
          title="Detalle"
          items={estadoFisico}
        />
        {material.observaciones && (
          <>
            <Divider />
            <Stack sx={{ gap: 0.5 }}>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ letterSpacing: '0.08em', fontWeight: 600 }}
              >
                Observaciones
              </Typography>
              <Typography
                variant="body1"
                sx={{ whiteSpace: 'pre-wrap' }}
              >
                {material.observaciones}
              </Typography>
            </Stack>
          </>
        )}
      </Stack>
    </Paper>
  );
};

export default MaterialMetadata;
