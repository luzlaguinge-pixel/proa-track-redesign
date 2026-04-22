import Stack from '@material-hu/mui/Stack';

import Button from '@material-hu/components/design-system/Buttons/Button';
import StateCard from '@material-hu/components/composed-components/StateCard';
import Title from '@material-hu/components/design-system/Title';
import { IconInfoCircle, IconPlus } from '@material-hu/icons/tabler';

import { DashboardLayout } from '../../../layouts/DashboardLayout';

const InventoryList = () => {
  const handleCreate = () => {};

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
      </Stack>
    </DashboardLayout>
  );
};

export default InventoryList;
