import { useQuery } from '@tanstack/react-query';

import { getPersons } from '../services';

export const personsKeys = {
  all: () => ['persons'] as const,
  lists: () => [...personsKeys.all(), 'list'] as const,
};

export const useGetPersons = () => {
  const { data, ...query } = useQuery({
    queryKey: personsKeys.lists(),
    queryFn: getPersons,
  });
  return { persons: data ?? [], ...query };
};
