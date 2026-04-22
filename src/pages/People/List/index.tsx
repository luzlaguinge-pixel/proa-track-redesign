import { IconInfoCircle } from '@material-hu/icons/tabler';
import Stack from '@material-hu/mui/Stack';

import StateCard from '@material-hu/components/composed-components/StateCard';
import Pagination from '@material-hu/components/design-system/Inputs/Pagination';
import Search from '@material-hu/components/design-system/Inputs/Search';
import Title from '@material-hu/components/design-system/Title';

import { DashboardLayout } from '../../../layouts/DashboardLayout';

import PersonsTable from './components/PersonsTable';
import { useGetPersons } from './hooks/useGetPersons';
import { PAGE_LIMIT_OPTIONS, usePersonsSearch } from './hooks/usePersonsSearch';

const PeopleList = () => {
  const { persons, isLoading } = useGetPersons();
  const {
    search,
    page,
    limit,
    filtered,
    paginated,
    totalPages,
    onSearch,
    onPageChange,
    onLimitChange,
  } = usePersonsSearch(persons);

  const hasNoPersons = !isLoading && persons.length === 0;
  const hasNoResults =
    !isLoading && persons.length > 0 && filtered.length === 0;

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
            title="Personas"
            description="Todos los responsables de materiales en campo."
            variant="L"
          />
        </Stack>

        {hasNoPersons ? (
          <StateCard
            slotProps={{
              title: {
                title: 'No hay personas registradas',
                description:
                  'Las personas aparecen cuando se les asigna un material.',
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
            <Search
              value={search}
              onChange={value => onSearch(value)}
              placeholder="Buscar por nombre o DNI"
              variant="classic"
            />
            {hasNoResults ? (
              <StateCard
                slotProps={{
                  title: {
                    title: 'Sin resultados',
                    description: 'Probá con otro nombre o DNI.',
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
                <PersonsTable persons={paginated} />
                <Pagination
                  type="changer"
                  page={page}
                  totalPages={totalPages}
                  limit={limit}
                  limitOptions={PAGE_LIMIT_OPTIONS}
                  onChangePage={onPageChange}
                  onChangeLimit={onLimitChange}
                />
              </>
            )}
          </>
        )}
      </Stack>
    </DashboardLayout>
  );
};

export default PeopleList;
