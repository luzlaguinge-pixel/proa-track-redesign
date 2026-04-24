import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getBasicPersons } from '../services';

export const personsKeys = {
  all: () => ['persons'] as const,
  lists: () => [...personsKeys.all(), 'list'] as const,
};

export const useGetPersons = () => {
  const { data, ...query } = useQuery({
    queryKey: personsKeys.lists(),
    queryFn: getBasicPersons,
  });

  return useMemo(() => ({ persons: data ?? [], ...query }), [data, query]);
};
