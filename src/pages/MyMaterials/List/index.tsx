import { useNavigate } from 'react-router-dom';

import { IconCircleCheck, IconInfoCircle } from '@material-hu/icons/tabler';
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

import { useAuth } from '../../../providers/AuthContext';
import { DashboardLayout } from '../../../layouts/DashboardLayout';
import { ESTADO_CONFIG, TIPO_LABEL } from '../../Inventory/List/constants';

import MaterialRowActions from './components/MaterialRowActions';
import { useMyMaterials } from './hooks/useMyMaterials';

const MyMaterialsList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { materials, isLoading } = useMyMaterials();

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
            <Typography
              variant="body2"
              color="text.secondary"
            >
              {materials.length}{' '}
              {materials.length === 1
                ? 'material asignado'
                : 'materiales asignados'}
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
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow headerRow>
                  <TableCell headerCell>Tipo</TableCell>
                  <TableCell headerCell>Detalle</TableCell>
                  <TableCell headerCell>Estado</TableCell>
                  <TableCell headerCell>OSC</TableCell>
                  <TableCell headerCell>Plaza</TableCell>
                  <TableCell headerCell>Comodato</TableCell>
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
                        <Pills
                          label={estado.label}
                          type={estado.type}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{material.osc || '—'}</TableCell>
                      <TableCell>{material.plaza}</TableCell>
                      <TableCell>
                        {material.comodatoFirmado ? (
                          <Stack
                            sx={{
                              flexDirection: 'row',
                              gap: 0.5,
                              alignItems: 'center',
                              color: 'success.main',
                            }}
                          >
                            <IconCircleCheck size={16} />
                            <Typography variant="caption">Firmado</Typography>
                          </Stack>
                        ) : (
                          <Typography
                            variant="caption"
                            color="text.disabled"
                          >
                            Pendiente
                          </Typography>
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
