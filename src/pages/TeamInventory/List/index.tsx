import { IconInfoCircle } from '@material-hu/icons/tabler';
import Stack from '@material-hu/mui/Stack';

import StateCard from '@material-hu/components/composed-components/StateCard';
import Search from '@material-hu/components/design-system/Inputs/Search';
import Title from '@material-hu/components/design-system/Title';

import { useAuth } from '../../../providers/AuthContext';
import { DashboardLayout } from '../../../layouts/DashboardLayout';
import MaterialsTable from '../../Inventory/List/components/MaterialsTable';

import { useTeamInventory } from './hooks/useTeamInventory';

const TeamInventoryList = () => {
  const { user } = useAuth();
  const { materials, total, isLoading, search, setSearch } = useTeamInventory();
  const leaderNombre = user ? `${user.firstName} ${user.lastName}`.trim() : 'mi equipo';

  if (isLoading) return <DashboardLayout><div /></DashboardLayout>;

  return (
    <DashboardLayout>
      <Stack sx={{ gap: 3 }}>
        <Title
          title="Materiales del equipo"
          description={`Materiales asignados al equipo de ${leaderNombre} · ${total} en total`}
          variant="L"
        />

        <Search
          value={search}
          onChange={setSearch}
          placeholder="Buscar por responsable, tipo o plaza"
          variant="classic"
        />

        {total === 0 ? (
          <StateCard
            slotProps={{
              title: {
                title: 'Sin materiales asignados',
                description: 'Ningún integrante del equipo tiene materiales asignados.',
                variant: 'M',
              },
              avatar: { Icon: IconInfoCircle, color: 'default' },
            }}
          />
        ) : materials.length === 0 ? (
          <StateCard
            slotProps={{
              title: {
                title: 'Sin resultados',
                description: 'Probá con otro responsable o tipo de material.',
                variant: 'M',
              },
              avatar: { Icon: IconInfoCircle, color: 'default' },
            }}
          />
        ) : (
          <MaterialsTable materials={materials} />
        )}
      </Stack>
    </DashboardLayout>
  );
};

export default TeamInventoryList;
