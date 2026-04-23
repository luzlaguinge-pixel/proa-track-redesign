import { IconCalendarCheck, IconCircleCheck, IconInfoCircle } from '@material-hu/icons/tabler';
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
import { TIPO_LABEL } from '../../Inventory/List/constants';
import { DEMO_CAPTADOR_NOMBRE } from '../../MyMaterials/List/services';
import ConfirmDialog from './components/ConfirmDialog';
import { useConfirmation } from './hooks/useConfirmation';

const ConfirmationList = () => {
  const { materials, isLoading, confirmar } = useConfirmation();
  const { openDialog, closeDialog } = useDialogLayer();

  if (isLoading) return <DashboardLayout><div /></DashboardLayout>;

  const pendientes = materials.filter(m => !m.confirmadaEsteMes);
  const confirmados = materials.filter(m => m.confirmadaEsteMes);

  const handleConfirm = (material: (typeof materials)[0]) => {
    openDialog({
      content: (
        <ConfirmDialog
          material={material}
          onClose={closeDialog}
          onSubmit={async (nota, fotoBase64) => {
            await confirmar.mutateAsync({
              materialId: material.id,
              responsableNombre: DEMO_CAPTADOR_NOMBRE,
              nota,
              fotoBase64,
            });
            closeDialog();
          }}
        />
      ),
    });
  };

  return (
    <DashboardLayout>
      <Stack sx={{ gap: 3 }}>
        <Title
          title="Confirmación mensual"
          description="Confirmá que tenés tus materiales en tu poder este mes."
          variant="L"
        />

        {materials.length === 0 ? (
          <StateCard
            slotProps={{
              title: {
                title: 'Sin materiales para confirmar',
                description: 'No tenés materiales asignados este mes.',
                variant: 'M',
              },
              avatar: { Icon: IconInfoCircle, color: 'default' },
            }}
          />
        ) : (
          <Stack sx={{ gap: 3 }}>
            {pendientes.length > 0 && (
              <Stack sx={{ gap: 1.5 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Pendientes de confirmar ({pendientes.length})
                </Typography>
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table sx={{ minWidth: 480 }}>
                    <TableHead>
                      <TableRow headerRow>
                        <TableCell headerCell>Tipo</TableCell>
                        <TableCell headerCell>Detalle</TableCell>
                        <TableCell headerCell>Plaza</TableCell>
                        <TableCell headerCell>Estado</TableCell>
                        <TableCell headerCell />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pendientes.map(m => (
                        <TableRow key={m.id}>
                          <TableCell>{TIPO_LABEL[m.tipo]}</TableCell>
                          <TableCell>{m.detalle || '—'}</TableCell>
                          <TableCell>{m.plaza}</TableCell>
                          <TableCell>
                            <Pills label="Pendiente" type="warning" size="small" />
                          </TableCell>
                          <TableCell>
                            <Pills
                              label="Confirmar"
                              type="info"
                              size="small"
                              sx={{ cursor: 'pointer' }}
                              onClick={() => handleConfirm(m)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Stack>
            )}

            {confirmados.length > 0 && (
              <Stack sx={{ gap: 1.5 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Confirmados este mes ({confirmados.length})
                </Typography>
                <TableContainer sx={{ overflowX: 'auto' }}>
                  <Table sx={{ minWidth: 480 }}>
                    <TableHead>
                      <TableRow headerRow>
                        <TableCell headerCell>Tipo</TableCell>
                        <TableCell headerCell>Detalle</TableCell>
                        <TableCell headerCell>Plaza</TableCell>
                        <TableCell headerCell>Última confirmación</TableCell>
                        <TableCell headerCell />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {confirmados.map(m => (
                        <TableRow key={m.id}>
                          <TableCell>{TIPO_LABEL[m.tipo]}</TableCell>
                          <TableCell>{m.detalle || '—'}</TableCell>
                          <TableCell>{m.plaza}</TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">
                              {m.ultimaConfirmacion
                                ? new Date(m.ultimaConfirmacion.fecha).toLocaleDateString('es-AR')
                                : '—'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Stack sx={{ flexDirection: 'row', gap: 0.5, alignItems: 'center', color: 'success.main' }}>
                              <IconCircleCheck size={16} />
                              <Typography variant="caption">Confirmado</Typography>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Stack>
            )}
          </Stack>
        )}
      </Stack>
    </DashboardLayout>
  );
};

export default ConfirmationList;
