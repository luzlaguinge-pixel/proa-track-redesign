import { useNavigate } from 'react-router-dom';

import { IconCircleCheck, IconClock, IconInfoCircle } from '@material-hu/icons/tabler';
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

import { DashboardLayout } from '../../../layouts/DashboardLayout';
import {
  ESTADO_CONFIG,
  TIPO_LABEL,
} from '../../Inventory/List/constants';

import MaterialRowActions from './components/MaterialRowActions';
import { DEMO_CAPTADOR_NOMBRE } from './services';
import { useMyMaterials } from './hooks/useMyMaterials';

const MyMaterialsList = () => {
  const navigate = useNavigate();
  const { materials, isLoading } = useMyMaterials();

  if (isLoading) return <DashboardLayout><div /></DashboardLayout>;

  return (
    <DashboardLayout>
      <Stack sx={{ gap: 3 }}>
        <Stack sx={{ gap: 1 }}>
          <Title
            title="Mis materiales"
            description={`Materiales asignados a ${DEMO_CAPTADOR_NOMBRE}`}
            variant="L"
          />
          {materials.length > 0 && (
            <Typography variant="body2" color="text.secondary">
              {materials.length} {materials.length === 1 ? 'material asignado' : 'materiales asignados'}
            </Typography>
          )}
        </Stack>

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
            <Table sx={{ minWidth: 750 }}>
              <TableHead>
                <TableRow headerRow>
                  <TableCell headerCell>Tipo</TableCell>
                  <TableCell headerCell>Detalle</TableCell>
                  <TableCell headerCell>Estado</TableCell>
                  <TableCell headerCell>OSC</TableCell>
                  <TableCell headerCell>Plaza</TableCell>
                  <TableCell headerCell>Comodato</TableCell>
                  <TableCell headerCell>Confirmación</TableCell>
                  <TableCell headerCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {materials.map(material => {
                  const estado = ESTADO_CONFIG[material.estado];
                  return (
                    <TableRow
                      key={material.id}
                      sx={{ cursor: 'default' }}
                    >
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
                        <Pills label={estado.label} type={estado.type} size="small" />
                      </TableCell>
                      <TableCell>{material.osc || '—'}</TableCell>
                      <TableCell>{material.plaza}</TableCell>
                      <TableCell>
                        {material.comodatoFirmado ? (
                          <Stack sx={{ flexDirection: 'row', gap: 0.5, alignItems: 'center', color: 'success.main' }}>
                            <IconCircleCheck size={16} />
                            <Typography variant="caption">Firmado</Typography>
                          </Stack>
                        ) : (
                          <Typography variant="caption" color="text.disabled">Pendiente</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {material.confirmadaEsteMes ? (
                          <Stack sx={{ flexDirection: 'row', gap: 0.5, alignItems: 'center', color: 'success.main' }}>
                            <IconCircleCheck size={16} />
                            <Typography variant="caption">
                              {material.ultimaConfirmacion
                                ? new Date(material.ultimaConfirmacion.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
                                : 'Confirmado'}
                            </Typography>
                          </Stack>
                        ) : (
                          <Stack sx={{ flexDirection: 'row', gap: 0.5, alignItems: 'center', color: 'warning.main' }}>
                            <IconClock size={16} />
                            <Typography variant="caption">Pendiente</Typography>
                          </Stack>
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
