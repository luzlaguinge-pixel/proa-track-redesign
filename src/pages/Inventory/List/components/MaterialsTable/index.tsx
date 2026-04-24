import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { IconTrash, IconUserX } from '@material-hu/icons/tabler';
import Alert from '@material-hu/mui/Alert';
import Checkbox from '@material-hu/mui/Checkbox';
import Snackbar from '@material-hu/mui/Snackbar';
import Stack from '@material-hu/mui/Stack';
import Typography from '@material-hu/mui/Typography';

import Button from '@material-hu/components/design-system/Buttons/Button';
import Pagination from '@material-hu/components/design-system/Inputs/Pagination';
import Pills from '@material-hu/components/design-system/Pills';
import Table from '@material-hu/components/design-system/Table';
import TableBody from '@material-hu/components/design-system/Table/components/TableBody';
import TableCell from '@material-hu/components/design-system/Table/components/TableCell';
import TableContainer from '@material-hu/components/design-system/Table/components/TableContainer';
import TableHead from '@material-hu/components/design-system/Table/components/TableHead';
import TableRow from '@material-hu/components/design-system/Table/components/TableRow';
import { useDialogLayer } from '@material-hu/components/layers/Dialogs';

import { useQueryClient } from '@tanstack/react-query';

import { deleteMaterials, unassignMaterials } from '../../../store';
import {
  DUEÑO_LABEL,
  ESTADO_CONFIG,
  PAGE_LIMIT_OPTIONS,
  TIPO_LABEL,
} from '../../constants';
import { materialsKeys } from '../../hooks/useGetMaterials';
import { type Material } from '../../types';

type MaterialsTableProps = {
  materials: Material[];
  selectable?: boolean;
};

const MaterialsTable = ({
  materials,
  selectable = false,
}: MaterialsTableProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { openDialog, closeDialog } = useDialogLayer();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });

  // Reset selection when material list changes (e.g. filters)
  useEffect(() => {
    setSelected(new Set());
    setPage(1);
  }, [materials]);

  const totalPages = Math.max(1, Math.ceil(materials.length / limit));
  const paginated = useMemo(
    () => materials.slice((page - 1) * limit, page * limit),
    [materials, page, limit],
  );

  const pageIds = paginated.map(m => m.id);
  const allOnPageSelected =
    pageIds.length > 0 && pageIds.every(id => selected.has(id));
  const someOnPageSelected = pageIds.some(id => selected.has(id));

  const toggleAll = () => {
    setSelected(prev => {
      const next = new Set(prev);
      if (allOnPageSelected) {
        pageIds.forEach(id => next.delete(id));
      } else {
        pageIds.forEach(id => next.add(id));
      }
      return next;
    });
  };

  const toggleOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: materialsKeys.all() });
  };

  const handleUnassign = () => {
    const ids = Array.from(selected);
    const count = ids.length;
    openDialog({
      content: (
        <Stack sx={{ p: 3, gap: 3, maxWidth: 440 }}>
          <Stack sx={{ gap: 1 }}>
            <Typography
              variant="h6"
              fontWeight={600}
            >
              Desasignar materiales
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              ¿Desasignar{' '}
              <strong>
                {count} {count === 1 ? 'material' : 'materiales'}
              </strong>
              ? Los responsables quedarán sin material asignado.
            </Typography>
          </Stack>
          <Stack
            sx={{ flexDirection: 'row', gap: 1, justifyContent: 'flex-end' }}
          >
            <Button
              variant="secondary"
              size="medium"
              onClick={() => closeDialog()}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="medium"
              onClick={() => {
                unassignMaterials(ids);
                invalidate();
                setSelected(new Set());
                closeDialog();
              }}
            >
              Desasignar
            </Button>
          </Stack>
        </Stack>
      ),
    });
  };

  const handleDelete = () => {
    const ids = Array.from(selected);
    const count = ids.length;
    openDialog({
      content: (
        <Stack sx={{ p: 3, gap: 3, maxWidth: 440 }}>
          <Stack sx={{ gap: 1 }}>
            <Typography
              variant="h6"
              fontWeight={600}
            >
              Eliminar materiales
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
            >
              ¿Eliminar{' '}
              <strong>
                {count} {count === 1 ? 'material' : 'materiales'}
              </strong>
              ? Esta acción no se puede deshacer.
            </Typography>
          </Stack>
          <Stack
            sx={{ flexDirection: 'row', gap: 1, justifyContent: 'flex-end' }}
          >
            <Button
              variant="secondary"
              size="medium"
              onClick={() => closeDialog()}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="medium"
              onClick={() => {
                deleteMaterials(ids);
                invalidate();
                setSelected(new Set());
                closeDialog();
              }}
              sx={{
                bgcolor: 'error.main',
                '&:hover': { bgcolor: 'error.dark' },
              }}
            >
              Eliminar
            </Button>
          </Stack>
        </Stack>
      ),
    });
  };

  const selectedCount = selected.size;
  const hasAssignedSelected = Array.from(selected).some(
    id => materials.find(m => m.id === id)?.responsableNombre,
  );

  return (
    <Stack sx={{ gap: 2 }}>
      {/* Bulk action bar */}
      {selectable && selectedCount > 0 && (
        <Stack
          sx={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1.5,
            bgcolor: 'primary.main',
            borderRadius: 1,
            color: 'primary.contrastText',
          }}
        >
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{ color: 'inherit' }}
          >
            {selectedCount}{' '}
            {selectedCount === 1
              ? 'material seleccionado'
              : 'materiales seleccionados'}
          </Typography>
          <Stack
            sx={{
              flexDirection: 'row',
              gap: 1,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            {hasAssignedSelected && (
              <Button
                variant="secondary"
                size="small"
                startIcon={<IconUserX size={16} />}
                onClick={handleUnassign}
                sx={{
                  color: 'primary.contrastText',
                  borderColor: 'primary.contrastText',
                }}
              >
                Desasignar
              </Button>
            )}
            <Button
              variant="secondary"
              size="small"
              startIcon={<IconTrash size={16} />}
              onClick={handleDelete}
              sx={{
                color: 'primary.contrastText',
                borderColor: 'primary.contrastText',
              }}
            >
              Eliminar
            </Button>
            <Button
              variant="text"
              size="small"
              onClick={() => setSelected(new Set())}
              sx={{ color: 'primary.contrastText' }}
            >
              Cancelar
            </Button>
          </Stack>
        </Stack>
      )}

      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow headerRow>
              {selectable && (
                <TableCell
                  headerCell
                  sx={{ width: 48, pr: 0 }}
                >
                  <Checkbox
                    size="small"
                    checked={allOnPageSelected}
                    indeterminate={someOnPageSelected && !allOnPageSelected}
                    onChange={toggleAll}
                    onClick={e => e.stopPropagation()}
                  />
                </TableCell>
              )}
              <TableCell headerCell>Tipo</TableCell>
              <TableCell headerCell>Detalle</TableCell>
              <TableCell headerCell>Estado</TableCell>
              <TableCell headerCell>Dueño</TableCell>
              <TableCell headerCell>OSC</TableCell>
              <TableCell headerCell>Plaza</TableCell>
              <TableCell headerCell>Responsable</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map(material => {
              const estado = ESTADO_CONFIG[material.estado];
              const isSelected = selected.has(material.id);
              return (
                <TableRow
                  key={material.id}
                  onClick={() => navigate(`/inventory/${material.id}`)}
                  sx={{
                    cursor: 'pointer',
                    ...(isSelected && { bgcolor: 'action.selected' }),
                  }}
                >
                  {selectable && (
                    <TableCell sx={{ width: 48, pr: 0 }}>
                      <Checkbox
                        size="small"
                        checked={isSelected}
                        onClick={e => toggleOne(material.id, e)}
                        onChange={() => {}}
                      />
                    </TableCell>
                  )}
                  <TableCell>{TIPO_LABEL[material.tipo]}</TableCell>
                  <TableCell>{material.detalle || '—'}</TableCell>
                  <TableCell>
                    <Pills
                      label={estado.label}
                      type={estado.type}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{DUEÑO_LABEL[material.dueño]}</TableCell>
                  <TableCell>{material.osc || '—'}</TableCell>
                  <TableCell>{material.plaza}</TableCell>
                  <TableCell>{material.responsableNombre ?? '—'}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Pagination
        type="changer"
        page={page}
        totalPages={totalPages}
        limit={limit}
        limitOptions={PAGE_LIMIT_OPTIONS}
        onChangePage={setPage}
        onChangeLimit={newLimit => {
          setLimit(newLimit);
          setPage(1);
        }}
      />

      <Snackbar
        open={snackbar.open}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        autoHideDuration={3000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity="success"
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
};

export default MaterialsTable;
