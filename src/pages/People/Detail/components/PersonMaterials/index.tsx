import { useNavigate } from 'react-router-dom';
import Paper from '@material-hu/mui/Paper';
import Stack from '@material-hu/mui/Stack';
import Typography from '@material-hu/mui/Typography';
import Pills from '@material-hu/components/design-system/Pills';
import Table from '@material-hu/components/design-system/Table';
import TableBody from '@material-hu/components/design-system/Table/components/TableBody';
import TableCell from '@material-hu/components/design-system/Table/components/TableCell';
import TableContainer from '@material-hu/components/design-system/Table/components/TableContainer';
import TableHead from '@material-hu/components/design-system/Table/components/TableHead';
import TableRow from '@material-hu/components/design-system/Table/components/TableRow';
import { ESTADO_CONFIG, TIPO_LABEL } from '../../../../Inventory/List/constants';
import type { Material } from '../../../../Inventory/List/types';

type PersonMaterialsProps = { materials: Material[] };

const PersonMaterials = ({ materials }: PersonMaterialsProps) => {
  const navigate = useNavigate();

  return (
    <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 2, bgcolor: 'background.paper' }}>
      <Stack sx={{ gap: 3 }}>
        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: '0.08em', fontWeight: 600 }}>
          Materiales asignados
        </Typography>
        {materials.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Esta persona no tiene materiales asignados actualmente.
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow headerRow>
                  <TableCell headerCell>Tipo</TableCell>
                  <TableCell headerCell>Detalle</TableCell>
                  <TableCell headerCell>Estado</TableCell>
                  <TableCell headerCell>OSC · Plaza</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {materials.map(m => {
                  const estado = ESTADO_CONFIG[m.estado];
                  return (
                    <TableRow key={m.id} onClick={() => navigate(`/inventory/${m.id}`)} sx={{ cursor: 'pointer' }}>
                      <TableCell>{TIPO_LABEL[m.tipo]}</TableCell>
                      <TableCell>{m.detalle || '—'}</TableCell>
                      <TableCell>
                        <Pills label={estado.label} type={estado.type} size="small" />
                      </TableCell>
                      <TableCell>{m.osc} · {m.plaza}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Stack>
    </Paper>
  );
};

export default PersonMaterials;
