import { useNavigate } from 'react-router-dom';

import {
  IconCalendarCheck,
  IconCircleCheck,
  IconInfoCircle,
} from '@material-hu/icons/tabler';
import Alert from '@material-hu/mui/Alert';
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

import { useAuth } from '../../../providers/AuthContext';
import { DashboardLayout } from '../../../layouts/DashboardLayout';
import { ESTADO_CONFIG, TIPO_LABEL } from '../../Inventory/List/constants';

import MaterialRowActions from './components/MaterialRowActions';
import { useMyMaterialsWithConfirmation } from './hooks/useMyMaterialsWithConfirmation';

const MyMaterialsList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { materials, pendingCount, isLoading } = useMyMaterialsWithConfirmation();

  if (isLoading)
    return (
      <DashboardLayout>
        <div />
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <Stack sx={{ gap: 3 }}>
        <Stack sx={{ gap: 1 }}>
          <Title
            title="Mis materiales"
            description={
              user
                ? `Materiales asignados a ${user.firstName} ${user.lastName}`
                : 'Cargando...'
            }
            variant="L"
          />
          {materials.length > 0 && (
            <Typography variant="body2" color="text.secondary">
              {materials.length}{' '}
              {materials.length === 1
                ? 'material asignado'
                : 'materiales asignados'}
            </Typography>
          )}
        </Stack>

        {pendingCount > 0 && (
          <Alert
            severity="warning"
            action={
              <Button
                variant="secondary"
                size="small"
                startIcon={<IconCalendarCheck size={16} />}
                onClick={() => navigate('/my-confirmation')}
              >
                Confirmar ahora
              </Button>
            }
          >
            Tenés{' '}
            <strong>
              {pendingCount}{' '}
              {pendingCount === 1 ? 'material' : 'materiales'}
            </strong>{' '}
            pendiente{pendingCount === 1 ? '' : 's'} de confirmar este mes.
          </Alert>
        )}

        {materials.length === 0 ? (
          <StateCard
            slotProps={{
              title: {
                title: 'Sin materiales asignados',
                description: 'Cuando te asignen un material, lo vas a ver acá.',
                variant: 'M',
              },
              avatar: { Icon: IconInfoCircle, color: 'default' },
            }}
          />
        ) : (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table sx={{ minWidth: 860 }}>
              <TableHead>
                <TableRow headerRow>
                  <TableCell headerCell>Tipo</TableCell>
                  <TableCell headerCell>Detalle</TableCell>
                  <TableCell headerCell>Estado</TableCell>
                  <TableCell headerCell>OSC</TableCell>
                  <TableCell headerCell>Plaza</TableCell>
                  <TableCell headerCell>Confirmación</TableCell>
                  <TableCell headerCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {materials.map(material => {
                  const estado = ESTADO_CONFIG[material.estado];
                  return (
                    <TableRow key={material.id} sx={{ cursor: 'default' }}>
                      <TableCell
                        onClick={() => navigate(`/inventory/${material.id}`)}
                        sx={{ cursor: 'pointer' }}
                      >
                        {TIPO_LABEL[material.tipo]}
                      </TableCell>
                      <TableCell
                        onClick={() => navigate(`/inventory/${material.id}`)}
                        sx={{ cursor: 'pointer' }}
                      >
                        {material.detalle || '—'}
                      </TableCell>
                      <TableCell>
                        <Pills
                          label={estado.label}
                          type={estado.type}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{material.osc || '—'}</TableCell>
                      <TableCell>{material.plaza}</TableCell>
                      <TableCell>
                        {material.confirmadaEsteMes ? (
                          <Stack
                            sx={{
                              flexDirection: 'row',
                              gap: 0.5,
                              alignItems: 'center',
                              color: 'success.main',
                            }}
                          >
                            <IconCircleCheck size={14} />
                            <Typography variant="caption">
                              {material.ultimaConfirmacion
                                ? `Confirmado el ${new Date(
                                    material.ultimaConfirmacion.fecha,
                                  ).toLocaleDateString('es-AR', {
                                    day: '2-digit',
                                    month: 'short',
                                  })}`
                                : 'Confirmado'}
                            </Typography>
                          </Stack>
                        ) : (
                          <Pills
                            label="Pendiente"
                            type="warning"
                            size="small"
                            sx={{ cursor: 'pointer' }}
                            onClick={() => navigate('/my-confirmation')}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <MaterialRowActions material={material} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Stack>
    </DashboardLayout>
  );
};

export default MyMaterialsList;
