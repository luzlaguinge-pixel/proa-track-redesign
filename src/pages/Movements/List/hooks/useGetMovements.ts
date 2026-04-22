import { useQuery } from '@tanstack/react-query';

import { getAllMovements } from '../services';

export const movementsKeys = {
  all: () => ['movements'] as const,
  list: () => [...movementsKeys.all(), 'list'] as const,
};

export const useGetMovements = () => {
  const { data, ...query } = useQuery({
    queryKey: movementsKeys.list(),
    queryFn: getAllMovements,
  });
  return { movements: data ?? [], ...query };
};
