import { useState } from 'react';

import { IconInfoCircle, IconPlus, IconTableImport } from '@material-hu/icons/tabler';
import Alert from '@material-hu/mui/Alert';
import Snackbar from '@material-hu/mui/Snackbar';
import Stack from '@material-hu/mui/Stack';

import StateCard from '@material-hu/components/composed-components/StateCard';
import Button from '@material-hu/components/design-system/Buttons/Button';
import Title from '@material-hu/components/design-system/Title';
import { useDrawerLayer } from '@material-hu/components/layers/Drawers';

import { DashboardLayout } from '../../../layouts/DashboardLayout';

import { BulkUploadDrawer } from './components/BulkUploadDrawer';
import CreateMaterialDrawer from './components/CreateMaterialDrawer';
import MaterialsFilters from './components/MaterialsFilters';
import MaterialsTable from './components/MaterialsTable';
import { useCreateMaterial } from './hooks/useCreateMaterial';
import { useGetMaterials } from './hooks/useGetMaterials';
import { useMaterialsFilters } from './hooks/useMaterialsFilters';
import { type CreateMaterialInput } from './services';

const InventoryList = () => {
  const { materials, isLoading } = useGetMaterials();
  const {
    filters,
    filtered,
    oscOptions,
    plazaOptions,
    updateFilter,
    clearFilters,
    hasActiveFilters,
  } = useMaterialsFilters(materials);
  const { openDrawer, closeDrawer } = useDrawerLayer();
  const createMaterial = useCreateMaterial();
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

  const hasNoMaterials = !isLoading && materials.length === 0;
  const hasNoResults =
    !isLoading && materials.length > 0 && filtered.length === 0;

  const handleCreate = () => {
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

  const handleBulkUpload = () => {
    openDrawer({
      wrapperProps: { anchor: 'right' },
      content: (
        <BulkUploadDrawer
          onClose={() => closeDrawer()}
          onSuccess={(count: number) => {
            closeDrawer();
            setSnackbar({ open: true, message: `${count} ${count === 1 ? 'material cargado' : 'materiales cargados'} correctamente.` });
          }}
        />
      ),
    });
  };

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
            title="Inventario"
            description="Todos los materiales que entregamos a los equipos en campo."
            variant="L"
          />
          <Stack sx={{ flexDirection: 'row', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="secondary"
              size="large"
              startIcon={<IconTableImport size={20} />}
              onClick={handleBulkUpload}
            >
              Carga masiva
            </Button>
            <Button
              variant="primary"
              size="large"
              startIcon={<IconPlus size={20} />}
              onClick={handleCreate}
            >
              Nuevo material
            </Button>
          </Stack>
        </Stack>

        {hasNoMaterials ? (
          <StateCard
            slotProps={{
              title: {
                title: 'Todavía no hay materiales cargados',
                description:
                  'Cuando agregues un material vas a verlo listado acá.',
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
            <MaterialsFilters
              filters={filters}
              oscOptions={oscOptions}
              plazaOptions={plazaOptions}
              hasActiveFilters={hasActiveFilters}
              onUpdate={updateFilter}
              onClear={clearFilters}
            />
            {hasNoResults ? (
              <StateCard
                slotProps={{
                  title: {
                    title: 'Sin resultados',
                    description: 'Probá ajustando los filtros o la búsqueda.',
                    variant: 'M',
                  },
                  avatar: {
                    Icon: IconInfoCircle,
                    color: 'default',
                  },
                }}
              />
            ) : (
              <MaterialsTable materials={filtered} selectable />
            )}
          </>
        )}
      </Stack>

      <Snackbar
        open={snackbar.open}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        autoHideDuration={4000}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
};

export default InventoryList;
