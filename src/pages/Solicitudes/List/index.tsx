import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  IconArrowsExchange,
  IconCheck,
  IconX,
} from '@material-hu/icons/tabler';
import Stack from '@material-hu/mui/Stack';
import Typography from '@material-hu/mui/Typography';

import StateCard from '@material-hu/components/composed-components/StateCard';
import Button from '@material-hu/components/design-system/Buttons/Button';
import Pills from '@material-hu/components/design-system/Pills';
import Table from '@material-hu/components/design-system/Table';
import TableBody from '@material-hu/components/design-system/Table/components/TableBody';
import TableCell from '@material-hu/components/design-system/Table/components/TableCell';
import TableContainer from '@material-hu/components/design-system/Table/components/TableContainer';
import TableHead from '@material-hu/components/design-system/Table/components/TableHead';
import TableRow from '@material-hu/components/design-system/Table/components/TableRow';
import Title from '@material-hu/components/design-system/Title';

import { DashboardLayout } from '../../../layouts/DashboardLayout';
import { useAuth } from '../../../providers/AuthContext';
import { useProfile } from '../../../providers/ProfileContext';
import { getMyTeam } from '../../MyTeam/List/services';
import {
  aprobarSolicitud,
  getAllSolicitudesAdmin,
  getSolicitudesPendientes,
  rechazarSolicitud,
  type SolicitudConLabel,
} from './services';

const ESTADO_CONFIG = {
  pendiente: { label: 'Pendiente', type: 'warning' as const },
  aprobada: { label: 'Aprobada', type: 'success' as const },
  rechazada: { label: 'Rechazada', type: 'error' as const },
};

const SolicitudesList = () => {
  const { user } = useAuth();
  const { perfil } = useProfile();
  const isAdmin = perfil === 'admin';
  const queryClient = useQueryClient();
  const leaderDni = user?.employeeInternalId ?? '';

  const { data: team = [] } = useQuery({
    queryKey: ['my-team', leaderDni],
    queryFn: () => getMyTeam(leaderDni),
    enabled: !isAdmin && !!leaderDni,
  });

  const { data: solicitudes = [], isLoading } = useQuery({
    queryKey: ['solicitudes', isAdmin ? 'all' : leaderDni],
    queryFn: () =>
      isAdmin
        ? getAllSolicitudesAdmin()
        : getSolicitudesPendientes(team.map(t => t.nombre)),
    enabled: isAdmin || team.length >= 0,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['solicitudes'] });
    queryClient.invalidateQueries({ queryKey: ['my-materials'] });
    queryClient.invalidateQueries({ queryKey: ['confirmation-materials'] });
    queryClient.invalidateQueries({ queryKey: ['materials'] });
    queryClient.invalidateQueries({ queryKey: ['my-materials-with-confirmation'] });
  };

  const resolverNombre = user
    ? `${user.firstName} ${user.lastName}`.trim()
    : 'Sistema';

  const aprobar = useMutation({
    mutationFn: (id: string) => aprobarSolicitud(id, resolverNombre),
    onSuccess: invalidate,
  });

  const rechazar = useMutation({
    mutationFn: (id: string) => rechazarSolicitud(id, resolverNombre),
    onSuccess: invalidate,
  });

  if (isLoading)
    return (
      <DashboardLayout>
        <div />
      </DashboardLayout>
    );

  const pendientes = solicitudes.filter(s => s.estado === 'pendiente');
  const resueltas = solicitudes.filter(s => s.estado !== 'pendiente');

  return (
    <DashboardLayout>
      <Stack sx={{ gap: 3 }}>
        <Stack
          sx={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Title
            title="Solicitudes"
            description="Movimientos de materiales pendientes de aprobación."
            variant="L"
          />
          {pendientes.length > 0 && (
            <Pills
              label={`${pendientes.length} pendiente${pendientes.length > 1 ? 's' : ''}`}
              type="warning"
              size="small"
            />
          )}
        </Stack>

        {solicitudes.length === 0 ? (
          <StateCard
            slotProps={{
              title: {
                title: 'Sin solicitudes',
                description:
                  'Las solicitudes de movimiento de materiales aparecerán acá.',
                variant: 'M',
              },
              avatar: { Icon: IconArrowsExchange, color: 'default' },
            }}
          />
        ) : (
          <Stack sx={{ gap: 3 }}>
            {pendientes.length > 0 && (
              <Stack sx={{ gap: 1.5 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                >
                  Pendientes ({pendientes.length})
                </Typography>
                <SolicitudesTable
                  rows={pendientes}
                  showActions
                  onAprobar={id => aprobar.mutate(id)}
                  onRechazar={id => rechazar.mutate(id)}
                  loadingId={
                    aprobar.isPending || rechazar.isPending ? 'loading' : null
                  }
                />
              </Stack>
            )}

            {resueltas.length > 0 && (
              <Stack sx={{ gap: 1.5 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                >
                  Historial ({resueltas.length})
                </Typography>
                <SolicitudesTable
                  rows={resueltas}
                  showActions={false}
                />
              </Stack>
            )}
          </Stack>
        )}
      </Stack>
    </DashboardLayout>
  );
};

export default SolicitudesList;

// ─── Table ────────────────────────────────────────────────────────────────────

type TableProps = {
  rows: SolicitudConLabel[];
  showActions: boolean;
  onAprobar?: (id: string) => void;
  onRechazar?: (id: string) => void;
  loadingId?: string | null;
};

const SolicitudesTable = ({
  rows,
  showActions,
  onAprobar,
  onRechazar,
}: TableProps) => (
  <TableContainer sx={{ overflowX: 'auto' }}>
    <Table sx={{ minWidth: 800 }}>
      <TableHead>
        <TableRow headerRow>
          <TableCell headerCell>Solicitante</TableCell>
          <TableCell headerCell>Material</TableCell>
          <TableCell headerCell>Destinatario</TableCell>
          <TableCell headerCell>Descripción</TableCell>
          <TableCell headerCell>Fecha</TableCell>
          <TableCell headerCell>Estado</TableCell>
          {showActions && <TableCell headerCell />}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map(s => {
          const estadoConf = ESTADO_CONFIG[s.estado];
          return (
            <TableRow key={s.id}>
              <TableCell>{s.solicitanteNombre}</TableCell>
              <TableCell>{s.materialLabel}</TableCell>
              <TableCell>{s.destinatarioNombre}</TableCell>
              <TableCell>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  {s.descripcion || '—'}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="caption">
                  {new Date(s.fecha).toLocaleDateString('es-AR')}
                </Typography>
              </TableCell>
              <TableCell>
                <Pills
                  label={estadoConf.label}
                  type={estadoConf.type}
                  size="small"
                />
              </TableCell>
              {showActions && (
                <TableCell>
                  <Stack sx={{ flexDirection: 'row', gap: 1 }}>
                    <Button
                      variant="secondary"
                      size="small"
                      startIcon={<IconCheck size={14} />}
                      onClick={() => onAprobar?.(s.id)}
                    >
                      Aprobar
                    </Button>
                    <Button
                      variant="tertiary"
                      size="small"
                      startIcon={<IconX size={14} />}
                      onClick={() => onRechazar?.(s.id)}
                    >
                      Rechazar
                    </Button>
                  </Stack>
                </TableCell>
              )}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </TableContainer>
);
