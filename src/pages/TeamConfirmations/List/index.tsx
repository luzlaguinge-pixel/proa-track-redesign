import { useQuery } from '@tanstack/react-query';

import { IconCalendarCheck } from '@material-hu/icons/tabler';
import Box from '@material-hu/mui/Box';
import Stack from '@material-hu/mui/Stack';
import Typography from '@material-hu/mui/Typography';

import StateCard from '@material-hu/components/composed-components/StateCard';
import Pills from '@material-hu/components/design-system/Pills';
import Table from '@material-hu/components/design-system/Table';
import TableBody from '@material-hu/components/design-system/Table/components/TableBody';
import TableCell from '@material-hu/components/design-system/Table/components/TableCell';
import TableContainer from '@material-hu/components/design-system/Table/components/TableContainer';
import TableHead from '@material-hu/components/design-system/Table/components/TableHead';
import TableRow from '@material-hu/components/design-system/Table/components/TableRow';
import Title from '@material-hu/components/design-system/Title';
import { useDialogLayer } from '@material-hu/components/layers/Dialogs';

import { DashboardLayout } from '../../../layouts/DashboardLayout';
import {
  getAllConfirmaciones,
  type Confirmacion,
} from '../../Confirmation/store';
import {
  getConfirmacionesEquipo,
  type ConfirmacionConMaterial,
} from '../../Confirmation/List/services';
import { getAllMaterials } from '../../Inventory/store';
import { getMyTeam } from '../../MyTeam/List/services';
import { useAuth } from '../../../providers/AuthContext';
import { useProfile } from '../../../providers/ProfileContext';

const TeamConfirmationsList = () => {
  const { openDialog } = useDialogLayer();
  const { user } = useAuth();
  const { perfil } = useProfile();
  const isAdmin = perfil === 'admin';
  const leaderDni = user?.employeeInternalId ?? '';

  const { data: team = [], isLoading: loadingTeam } = useQuery({
    queryKey: ['my-team', leaderDni],
    queryFn: () => getMyTeam(leaderDni),
    enabled: !isAdmin && !!leaderDni,
  });

  const { data: confirmaciones = [], isLoading: loadingConf } = useQuery({
    queryKey: ['confirmaciones', isAdmin ? 'all' : leaderDni],
    queryFn: async () => {
      if (isAdmin) {
        const materials = await getAllMaterials();
        return getAllConfirmaciones()
          .map(c => {
            const m = materials.find(mat => mat.id === c.materialId);
            return {
              ...c,
              materialLabel: m
                ? `${m.tipo} · ${m.detalle || '—'}`
                : c.materialId,
            } as ConfirmacionConMaterial;
          })
          .sort(
            (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime(),
          );
      }
      return getConfirmacionesEquipo(team.map(t => t.nombre));
    },
    enabled: isAdmin || team.length > 0,
  });

  const isLoading = loadingTeam || loadingConf;

  if (isLoading)
    return (
      <DashboardLayout>
        <div />
      </DashboardLayout>
    );

  const handleVerFoto = (conf: ConfirmacionConMaterial) => {
    if (!conf.fotoBase64) return;
    openDialog({
      content: (
        <Stack sx={{ p: 3, gap: 2, maxWidth: 540 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600 }}
          >
            Foto de confirmación
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {conf.responsableNombre} · {conf.materialLabel}
          </Typography>
          <Box
            component="img"
            src={conf.fotoBase64}
            alt="confirmación"
            sx={{
              width: '100%',
              maxHeight: 400,
              objectFit: 'contain',
              borderRadius: 1,
            }}
          />
          {conf.nota && (
            <Typography variant="body2">
              <strong>Nota:</strong> {conf.nota}
            </Typography>
          )}
        </Stack>
      ),
    });
  };

  const title = isAdmin ? 'Confirmaciones' : 'Confirmaciones del equipo';
  const description = isAdmin
    ? 'Historial de confirmaciones de tenencia de todos los captadores.'
    : 'Historial de confirmaciones de tenencia de tu equipo.';

  return (
    <DashboardLayout>
      <Stack sx={{ gap: 3 }}>
        <Title
          title={title}
          description={description}
          variant="L"
        />

        {confirmaciones.length === 0 ? (
          <StateCard
            slotProps={{
              title: {
                title: 'Sin confirmaciones aún',
                description: 'Las confirmaciones de tenencia aparecerán acá.',
                variant: 'M',
              },
              avatar: { Icon: IconCalendarCheck, color: 'default' },
            }}
          />
        ) : (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 600 }}>
              <TableHead>
                <TableRow headerRow>
                  <TableCell headerCell>Persona</TableCell>
                  <TableCell headerCell>Material</TableCell>
                  <TableCell headerCell>Fecha</TableCell>
                  <TableCell headerCell>Nota</TableCell>
                  <TableCell headerCell>Foto</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {confirmaciones.map(conf => (
                  <TableRow key={conf.id}>
                    <TableCell>{conf.responsableNombre}</TableCell>
                    <TableCell>{conf.materialLabel}</TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {new Date(conf.fecha).toLocaleDateString('es-AR')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {conf.nota || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {conf.fotoBase64 ? (
                        <Pills
                          label="Ver foto"
                          type="info"
                          size="small"
                          sx={{ cursor: 'pointer' }}
                          onClick={() => handleVerFoto(conf)}
                        />
                      ) : (
                        <Typography
                          variant="caption"
                          color="text.disabled"
                        >
                          Sin foto
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Stack>
    </DashboardLayout>
  );
};

export default TeamConfirmationsList;
