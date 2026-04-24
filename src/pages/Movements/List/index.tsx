import { useNavigate } from 'react-router-dom';

import { IconDownload, IconInfoCircle } from '@material-hu/icons/tabler';
import Chip from '@material-hu/mui/Chip';
import Paper from '@material-hu/mui/Paper';
import Stack from '@material-hu/mui/Stack';
import Typography from '@material-hu/mui/Typography';

import StateCard from '@material-hu/components/composed-components/StateCard';
import Button from '@material-hu/components/design-system/Buttons/Button';
import Autocomplete from '@material-hu/components/design-system/Inputs/Autocomplete';
import Pagination from '@material-hu/components/design-system/Inputs/Pagination';
import Search from '@material-hu/components/design-system/Inputs/Search';
import Pills from '@material-hu/components/design-system/Pills';
import Table from '@material-hu/components/design-system/Table';
import TableBody from '@material-hu/components/design-system/Table/components/TableBody';
import TableCell from '@material-hu/components/design-system/Table/components/TableCell';
import TableContainer from '@material-hu/components/design-system/Table/components/TableContainer';
import TableHead from '@material-hu/components/design-system/Table/components/TableHead';
import TableRow from '@material-hu/components/design-system/Table/components/TableRow';
import Title from '@material-hu/components/design-system/Title';

import { DashboardLayout } from '../../../layouts/DashboardLayout';
import { getOffboardedNames } from '../../People/lifecycleStore';
import {
  type HistorialEventoTipo,
  type MaterialPais,
} from '../../Inventory/List/types';

import { EVENTO_LABEL, EVENTO_PILL, PAIS_LABEL } from './constants';
import { useGetMovements } from './hooks/useGetMovements';
import { useMovementsFilters } from './hooks/useMovementsFilters';
import { exportMovementsToCSV } from './services';

const MovementsList = () => {
  const navigate = useNavigate();
  const { movements, isLoading } = useGetMovements();
  const offboardedNames = getOffboardedNames();
  const {
    filters,
    filtered,
    paginated,
    page,
    setPage,
    totalPages,
    updateFilter,
    hasActiveFilters,
    clearFilters,
  } = useMovementsFilters(movements);

  const tipoOptions = [
    { label: 'Todos los tipos', value: 'todos' },
    ...Object.entries(EVENTO_LABEL).map(([value, label]) => ({ label, value })),
  ];

  const paisOptions = Object.entries(PAIS_LABEL).map(([value, label]) => ({
    label,
    value,
  }));

  const selectedTipo =
    tipoOptions.find(o => o.value === filters.tipo) ?? tipoOptions[0];
  const selectedPais =
    paisOptions.find(o => o.value === filters.pais) ?? paisOptions[0];

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading)
    return (
      <DashboardLayout>
        <div />
      </DashboardLayout>
    );

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
            title="Movimientos"
            description="Log global de todos los eventos del sistema."
            variant="L"
          />
          <Button
            variant="secondary"
            size="large"
            startIcon={<IconDownload size={18} />}
            onClick={() => exportMovementsToCSV(filtered)}
            disabled={filtered.length === 0}
          >
            Exportar CSV
          </Button>
        </Stack>

        <Stack
          sx={{
            flexDirection: 'row',
            gap: 2,
            flexWrap: 'wrap',
            alignItems: 'flex-end',
          }}
        >
          <Stack sx={{ flex: '1 1 220px', minWidth: 200 }}>
            <Search
              value={filters.search}
              onChange={value => updateFilter('search', value)}
              placeholder="Buscar por persona, material o título..."
              variant="classic"
            />
          </Stack>
          <Stack sx={{ flex: '1 1 180px', minWidth: 160 }}>
            <Autocomplete
              label="Tipo"
              options={tipoOptions}
              value={selectedTipo}
              onChange={opt =>
                updateFilter(
                  'tipo',
                  (opt?.value ?? 'todos') as HistorialEventoTipo | 'todos',
                )
              }
            />
          </Stack>
          <Stack sx={{ flex: '1 1 160px', minWidth: 140 }}>
            <Autocomplete
              label="País"
              options={paisOptions}
              value={selectedPais}
              onChange={opt =>
                updateFilter(
                  'pais',
                  (opt?.value ?? 'todos') as MaterialPais | 'todos',
                )
              }
            />
          </Stack>
          {hasActiveFilters && (
            <Button
              variant="tertiary"
              size="medium"
              onClick={clearFilters}
            >
              Limpiar filtros
            </Button>
          )}
        </Stack>

        <Typography
          variant="body2"
          color="text.secondary"
        >
          {filtered.length} movimiento{filtered.length !== 1 ? 's' : ''}
        </Typography>

        {filtered.length === 0 ? (
          <StateCard
            slotProps={{
              title: {
                title: 'Sin resultados',
                description:
                  'No hay movimientos que coincidan con los filtros aplicados.',
                variant: 'M',
              },
              avatar: {
                Icon: IconInfoCircle,
                color: 'default',
              },
            }}
          />
        ) : (
          <>
            <Paper
              variant="outlined"
              sx={{ borderRadius: 2, overflow: 'hidden' }}
            >
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: 750 }}>
                  <TableHead>
                    <TableRow headerRow>
                      <TableCell headerCell>Fecha</TableCell>
                      <TableCell headerCell>Tipo</TableCell>
                      <TableCell headerCell>Título</TableCell>
                      <TableCell headerCell>Autor</TableCell>
                      <TableCell headerCell>Material</TableCell>
                      <TableCell headerCell>País</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginated.map(mov => (
                      <TableRow
                        key={mov.id}
                        sx={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/inventory/${mov.materialId}`)}
                      >
                        <TableCell>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ whiteSpace: 'nowrap' }}
                          >
                            {formatDate(mov.fecha)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Pills
                            label={EVENTO_LABEL[mov.tipo]}
                            type={EVENTO_PILL[mov.tipo]}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Stack
                            sx={{ flexDirection: 'row', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}
                          >
                            <Typography variant="body2">{mov.titulo}</Typography>
                            {[...offboardedNames].some(n => mov.titulo.includes(n)) && (
                              <Chip
                                label="baja"
                                size="small"
                                color="warning"
                                variant="outlined"
                                sx={{ height: 18, fontSize: 10 }}
                              />
                            )}
                          </Stack>
                          {mov.descripcion && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: 'block' }}
                            >
                              {mov.descripcion.length > 60
                                ? `${mov.descripcion.slice(0, 60)}…`
                                : mov.descripcion}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{mov.autor}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            color="primary.main"
                          >
                            {mov.materialLabel}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {mov.pais}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
            <Pagination
              type="changer"
              page={page}
              totalPages={totalPages}
              limit={25}
              limitOptions={[25, 50, 100]}
              onChangePage={setPage}
              onChangeLimit={() => {}}
            />
          </>
        )}
      </Stack>
    </DashboardLayout>
  );
};

export default MovementsList;
