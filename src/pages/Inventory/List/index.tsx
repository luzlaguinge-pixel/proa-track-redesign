import { IconInfoCircle, IconPlus } from '@material-hu/icons/tabler';
import Stack from '@material-hu/mui/Stack';

import StateCard from '@material-hu/components/composed-components/StateCard';
import Button from '@material-hu/components/design-system/Buttons/Button';
import Title from '@material-hu/components/design-system/Title';
import { useDrawerLayer } from '@material-hu/components/layers/Drawers';

import { DashboardLayout } from '../../../layouts/DashboardLayout';

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

  return (
    <DashboardLayout>
      <Stack sx={{ gap: 3 }}>
        <Stack
          sx={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <Title
            title="Inventario"
            description="Todos los materiales que entregamos a los equipos en campo."
            variant="L"
          />
          <Button
            variant="primary"
            size="large"
            startIcon={<IconPlus size={20} />}
            onClick={handleCreate}
          >
            Nuevo material
          </Button>
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
              <MaterialsTable materials={filtered} />
            )}
          </>
        )}
      </Stack>
    </DashboardLayout>
  );
};

export default InventoryList;
