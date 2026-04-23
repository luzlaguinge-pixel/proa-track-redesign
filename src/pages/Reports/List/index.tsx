import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { IconArrowsExchange, IconBox, IconCalendarCheck, IconCircleCheck, IconClock, IconX } from '@material-hu/icons/tabler';
import LinearProgress from '@material-hu/mui/LinearProgress';
import Paper from '@material-hu/mui/Paper';
import Stack from '@material-hu/mui/Stack';
import Typography from '@material-hu/mui/Typography';
import MenuItem from '@material-hu/mui/MenuItem';
import Select from '@material-hu/mui/Select';

import Title from '@material-hu/components/design-system/Title';
import Button from '@material-hu/components/design-system/Buttons/Button';
import InputClassic from '@material-hu/components/design-system/Inputs/Classic';

import { DashboardLayout } from '../../../layouts/DashboardLayout';
import {
  getConfirmacionStats,
  getMaterialsByOsc,
  getMaterialsByPlaza,
  getMaterialStats,
  getSolicitudStats,
  type BreakdownItem,
  type ReportFilters,
} from './services';

const ReportsList = () => {
  const [filters, setFilters] = useState<ReportFilters>({});

  const { data: matStats } = useQuery({
    queryKey: ['reports-materials', filters],
    queryFn: () => getMaterialStats(filters),
  });
  const { data: confStats } = useQuery({
    queryKey: ['reports-confirmaciones', filters],
    queryFn: () => getConfirmacionStats(filters),
  });
  const { data: solStats } = useQuery({
    queryKey: ['reports-solicitudes', filters],
    queryFn: () => getSolicitudStats(filters),
  });
  const { data: byOsc = [] } = useQuery({
    queryKey: ['reports-osc', filters],
    queryFn: () => getMaterialsByOsc(filters),
  });
  const { data: byPlaza = [] } = useQuery({
    queryKey: ['reports-plaza', filters],
    queryFn: () => getMaterialsByPlaza(filters),
  });

  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(v => v !== undefined && v !== '');
  }, [filters]);

  const handleClearFilters = () => {
    setFilters({});
  };

  return (
    <DashboardLayout>
      <Stack sx={{ gap: 4 }}>
        <Title title="Reportes" description="Resumen del estado actual del inventario." variant="L" />

        {/* ── Filters ── */}
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Stack sx={{ gap: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Filtros</Typography>
            <Stack sx={{ gap: 2, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <Stack sx={{ flex: '1 1 140px', minWidth: 140 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
                  Fecha inicio
                </Typography>
                <InputClassic
                  type="date"
                  value={filters.dateStart || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateStart: e || undefined }))}
                  fullWidth
                />
              </Stack>
              <Stack sx={{ flex: '1 1 140px', minWidth: 140 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
                  Fecha fin
                </Typography>
                <InputClassic
                  type="date"
                  value={filters.dateEnd || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateEnd: e || undefined }))}
                  fullWidth
                />
              </Stack>
              <Stack sx={{ flex: '1 1 140px', minWidth: 140 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
                  Estado
                </Typography>
                <Select
                  size="small"
                  value={filters.estado || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, estado: e.target.value || undefined }))}
                  fullWidth
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="en_uso">En uso</MenuItem>
                  <MenuItem value="sin_uso">Sin uso</MenuItem>
                  <MenuItem value="perdida">Perdida</MenuItem>
                  <MenuItem value="en_reparacion">En reparación</MenuItem>
                </Select>
              </Stack>
              <Stack sx={{ flex: '1 1 140px', minWidth: 140 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
                  Ubicación
                </Typography>
                <InputClassic
                  placeholder="Filtrar por plaza..."
                  value={filters.ubicacion || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, ubicacion: e || undefined }))}
                  fullWidth
                />
              </Stack>
              {hasActiveFilters && (
                <Button
                  variant="tertiary"
                  size="small"
                  onClick={handleClearFilters}
                  startIcon={<IconX size={16} />}
                >
                  Limpiar
                </Button>
              )}
            </Stack>
          </Stack>
        </Paper>

        {/* ── Materiales ── */}
        <Stack sx={{ gap: 2 }}>
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: '0.08em', fontWeight: 600 }}>
            Materiales
          </Typography>
          <Stack sx={{ flexDirection: 'row', gap: 2, flexWrap: 'wrap' }}>
            <StatCard label="Total" value={matStats?.total ?? '—'} color="text.primary" />
            <StatCard label="En uso" value={matStats?.enUso ?? '—'} color="success.main" />
            <StatCard label="Sin uso" value={matStats?.sinUso ?? '—'} color="text.secondary" />
            <StatCard label="En reparación" value={matStats?.enReparacion ?? '—'} color="warning.main" />
            <StatCard label="Perdidos" value={matStats?.perdida ?? '—'} color="error.main" />
          </Stack>
        </Stack>

        {/* ── Confirmaciones del mes ── */}
        <Stack sx={{ gap: 2 }}>
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: '0.08em', fontWeight: 600 }}>
            Confirmaciones — {new Date().toLocaleString('es-AR', { month: 'long', year: 'numeric' })}
          </Typography>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <Stack sx={{ gap: 2 }}>
              <Stack sx={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {confStats?.confirmados ?? 0} de {confStats?.total ?? 0} materiales en uso confirmados
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {confStats?.porcentaje ?? 0}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={confStats?.porcentaje ?? 0}
                sx={{ height: 8, borderRadius: 4, bgcolor: 'action.hover',
                  '& .MuiLinearProgress-bar': { bgcolor: 'success.main', borderRadius: 4 } }}
              />
              <Stack sx={{ flexDirection: 'row', gap: 3 }}>
                <Stack sx={{ flexDirection: 'row', gap: 0.5, alignItems: 'center', color: 'success.main' }}>
                  <IconCircleCheck size={16} />
                  <Typography variant="caption">{confStats?.confirmados ?? 0} confirmados</Typography>
                </Stack>
                <Stack sx={{ flexDirection: 'row', gap: 0.5, alignItems: 'center', color: 'warning.main' }}>
                  <IconClock size={16} />
                  <Typography variant="caption">{confStats?.pendientes ?? 0} pendientes</Typography>
                </Stack>
              </Stack>
            </Stack>
          </Paper>
        </Stack>

        {/* ── Solicitudes ── */}
        <Stack sx={{ gap: 2 }}>
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: '0.08em', fontWeight: 600 }}>
            Solicitudes de movimiento
          </Typography>
          <Stack sx={{ flexDirection: 'row', gap: 2, flexWrap: 'wrap' }}>
            <StatCard label="Pendientes" value={solStats?.pendientes ?? '—'} color="warning.main" />
            <StatCard label="Aprobadas" value={solStats?.aprobadas ?? '—'} color="success.main" />
            <StatCard label="Rechazadas" value={solStats?.rechazadas ?? '—'} color="error.main" />
          </Stack>
        </Stack>

        {/* ── Breakdown ── */}
        <Stack sx={{ flexDirection: 'row', gap: 3, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <BreakdownTable title="Materiales en uso por OSC" rows={byOsc} total={matStats?.enUso ?? 0} />
          <BreakdownTable title="Materiales en uso por plaza" rows={byPlaza} total={matStats?.enUso ?? 0} />
        </Stack>
      </Stack>
    </DashboardLayout>
  );
};

export default ReportsList;

// ─── StatCard ─────────────────────────────────────────────────────────────────

const StatCard = ({ label, value, color }: { label: string; value: number | string; color: string }) => (
  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, minWidth: 130, flex: '1 1 130px', maxWidth: 180 }}>
    <Stack sx={{ gap: 0.5 }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="h4" sx={{ fontWeight: 700, color }}>{value}</Typography>
    </Stack>
  </Paper>
);

// ─── BreakdownTable ───────────────────────────────────────────────────────────

const BreakdownTable = ({ title, rows, total }: { title: string; rows: BreakdownItem[]; total: number }) => (
  <Paper variant="outlined" sx={{ p: 3, borderRadius: 2, flex: '1 1 280px', minWidth: 280 }}>
    <Stack sx={{ gap: 2 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{title}</Typography>
      {rows.length === 0 ? (
        <Typography variant="body2" color="text.disabled">Sin datos</Typography>
      ) : (
        <Stack sx={{ gap: 1.5 }}>
          {rows.map(row => {
            const pct = total > 0 ? Math.round((row.count / total) * 100) : 0;
            return (
              <Stack key={row.label} sx={{ gap: 0.5 }}>
                <Stack sx={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.primary" noWrap sx={{ maxWidth: '70%' }}>
                    {row.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {row.count} ({pct}%)
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={pct}
                  sx={{ height: 4, borderRadius: 2, bgcolor: 'action.hover',
                    '& .MuiLinearProgress-bar': { borderRadius: 2 } }}
                />
              </Stack>
            );
          })}
        </Stack>
      )}
    </Stack>
  </Paper>
);
