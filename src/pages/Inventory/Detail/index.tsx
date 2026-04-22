import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { IconAlertTriangle, IconArrowLeft } from '@material-hu/icons/tabler';
import Stack from '@material-hu/mui/Stack';

import Button from '@material-hu/components/design-system/Buttons/Button';

import StateCard from '@material-hu/components/composed-components/StateCard';

import { DashboardLayout } from '../../../layouts/DashboardLayout';

import MaterialActions from './components/MaterialActions';
import MaterialHeader from './components/MaterialHeader';
import MaterialHistorial from './components/MaterialHistorial';
import MaterialMetadata from './components/MaterialMetadata';
import MaterialResponsable from './components/MaterialResponsable';
import { useGetMaterial } from './hooks/useGetMaterial';

const InventoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const canGoBack = location.key !== 'default';
  const { material, isLoading } = useGetMaterial(id);

  if (isLoading) {
    return <DashboardLayout />;
  }

  if (!material) {
    return (
      <DashboardLayout>
        <StateCard
          slotProps={{
            title: {
              title: 'Material no encontrado',
              description: 'El material que buscás no existe o fue eliminado.',
              variant: 'M',
            },
            avatar: {
              Icon: IconAlertTriangle,
              color: 'default',
            },
          }}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Stack sx={{ gap: 4 }}>
        {canGoBack && (
          <Button
            variant="tertiary"
            size="small"
            startIcon={<IconArrowLeft size={16} />}
            onClick={() => navigate(-1)}
            sx={{ alignSelf: 'flex-start' }}
          >
            Volver
          </Button>
        )}
        <MaterialHeader
          material={material}
          actions={<MaterialActions material={material} />}
        />
        <MaterialResponsable material={material} />
        <MaterialMetadata material={material} />
        <MaterialHistorial material={material} />
      </Stack>
    </DashboardLayout>
  );
};

export default InventoryDetail;
