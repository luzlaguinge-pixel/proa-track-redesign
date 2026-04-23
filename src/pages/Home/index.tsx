import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { IconBell, IconPlus } from '@material-hu/icons/tabler';
import Paper from '@material-hu/mui/Paper';
import Stack from '@material-hu/mui/Stack';
import Typography from '@material-hu/mui/Typography';

import Button from '@material-hu/components/design-system/Buttons/Button';
import Title from '@material-hu/components/design-system/Title';
import Snackbar from '@material-hu/mui/Snackbar';
import Alert from '@material-hu/mui/Alert';
import { useDrawerLayer } from '@material-hu/components/layers/Drawers';

import { DashboardLayout } from '../../layouts/DashboardLayout';
import CreateMaterialDrawer from '../Inventory/List/components/CreateMaterialDrawer';
import { useCreateMaterial } from '../Inventory/List/hooks/useCreateMaterial';
import { type CreateMaterialInput } from '../Inventory/List/services';

import { AlertsList } from './components/AlertsList';
import { CountryToggle } from './components/CountryToggle';
import { StatCard } from './components/StatCard';
import { useCountryFilter } from './hooks/useCountryFilter';
import { useDashboardStats } from './hooks/useDashboardStats';
import { useSendReminder } from './hooks/useSendReminder';
import type { SendReminderResult } from './hooks/useSendReminder';

export const HomePage = () => {
  const navigate = useNavigate();
  const { country, setCountry } = useCountryFilter();
  const { stats, isLoading } = useDashboardStats(country);
  const { openDrawer, closeDrawer } = useDrawerLayer();
  const createMaterial = useCreateMaterial();
  const { sendReminder, isLoading: isSendingReminder } = useSendReminder();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  if (isLoading)
    return (
      <DashboardLayout>
        <div />
      </DashboardLayout>
    );

  const handleNewMaterial = () => {
    openDrawer({
      wrapperProps: { anchor: 'right' },
      content: (
        <CreateMaterialDrawer
          onClose={() => closeDrawer()}
          onSubmit={async (input: CreateMaterialInput) => {
            await createMaterial.mutateAsync(input);
            closeDrawer();
          }}
        />
      ),
    });
  };

  const handleSendReminder = async () => {
    const result: SendReminderResult = await sendReminder();
    setSnackbarMessage(result.message);
    setSnackbarSeverity(result.success ? 'success' : 'error');
    setSnackbarOpen(true);
  };

  return (
    <DashboardLayout>
      <Stack sx={{ gap: 4 }}>
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
            title="Dashboard"
            description="Resumen general del inventario y alertas activas."
            variant="L"
          />
          <Stack sx={{ flexDirection: 'row', gap: 1, flexShrink: 0 }}>
            <Button
              variant="primary"
              size="large"
              startIcon={<IconPlus size={18} />}
              onClick={handleNewMaterial}
            >
              Nuevo material
            </Button>
            <Button
              variant="secondary"
              size="large"
              startIcon={<IconBell size={18} />}
              onClick={handleSendReminder}
              disabled={isSendingReminder}
            >
              Enviar recordatorio
            </Button>
          </Stack>
        </Stack>

        <CountryToggle
          value={country}
          onChange={setCountry}
        />

        <Stack sx={{ flexDirection: 'row', gap: 2, flexWrap: 'wrap' }}>
          <StatCard
            label="Total materiales"
            value={stats?.total ?? 0}
            showTrend
          />
          <StatCard
            label="En uso"
            value={stats?.enUso ?? 0}
            subtitle={
              stats ? `${stats.utilizacionPct}% del inventario` : undefined
            }
            showTrend
          />
          <StatCard
            label="Disponible"
            value={stats?.disponible ?? 0}
            showTrend
          />
          <StatCard
            label="Perdidos"
            value={stats?.perdidos ?? 0}
            color="error"
            showTrend
          />
          <StatCard
            label="En reparación"
            value={stats?.enReparacion ?? 0}
            color="warning"
            showTrend
          />
        </Stack>

        {(stats?.sinMovimiento90 ?? 0) > 0 && (
          <Stack
            sx={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
            }}
            onClick={() => navigate('/inventory')}
            role="button"
          >
            <Typography
              variant="body2"
              color="text.secondary"
            >
              {stats?.sinMovimiento90} materiales sin movimiento en más de 90
              días
            </Typography>
            <Typography
              variant="body2"
              color="primary.main"
              sx={{ '&:hover': { textDecoration: 'underline' } }}
            >
              Ver en inventario →
            </Typography>
          </Stack>
        )}

        <Paper
          variant="outlined"
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 2,
            bgcolor: 'background.paper',
          }}
        >
          <Stack sx={{ gap: 3 }}>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ letterSpacing: '0.08em', fontWeight: 600 }}
            >
              Requieren atención
              {stats && stats.alertas.length > 0
                ? ` (${stats.alertas.length})`
                : ''}
            </Typography>
            <AlertsList
              alertas={stats?.alertas ?? []}
              onAlertClick={linkTo => navigate(linkTo)}
            />
          </Stack>
        </Paper>
      </Stack>

      <Snackbar
        open={snackbarOpen}
        onClose={() => setSnackbarOpen(false)}
        autoHideDuration={4000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
};
