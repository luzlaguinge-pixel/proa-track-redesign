import { useNavigate } from 'react-router-dom';

import Paper from '@material-hu/mui/Paper';
import Stack from '@material-hu/mui/Stack';
import Typography from '@material-hu/mui/Typography';

import Title from '@material-hu/components/design-system/Title';

import { DashboardLayout } from '../../layouts/DashboardLayout';
import { AlertsList } from './components/AlertsList';
import { StatCard } from './components/StatCard';
import { useDashboardStats } from './hooks/useDashboardStats';

export const HomePage = () => {
  const navigate = useNavigate();
  const { stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return <DashboardLayout><div /></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <Stack sx={{ gap: 4 }}>
        <Title title="Dashboard" description="Resumen general del inventario y alertas activas." variant="L" />

        <Stack sx={{ flexDirection: 'row', gap: 2, flexWrap: 'wrap' }}>
          <StatCard label="Total materiales" value={stats?.total ?? 0} />
          <StatCard label="En uso" value={stats?.enUso ?? 0} />
          <StatCard label="Sin asignar" value={stats?.sinAsignar ?? 0} />
          <StatCard label="Perdidos" value={stats?.perdidos ?? 0} />
          <StatCard label="En reparación" value={stats?.enReparacion ?? 0} />
        </Stack>

        <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 2, bgcolor: 'background.paper' }}>
          <Stack sx={{ gap: 3 }}>
            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: '0.08em', fontWeight: 600 }}>
              Requieren atención
            </Typography>
            <AlertsList
              alertas={stats?.alertas ?? []}
              onAlertClick={(id) => navigate(`/inventory/${id}`)}
            />
          </Stack>
        </Paper>
      </Stack>
    </DashboardLayout>
  );
};
