import { useQuery } from '@tanstack/react-query';

import { getMaterials } from '../services';

export const materialsKeys = {
  all: () => ['materials'] as const,
  lists: () => [...materialsKeys.all(), 'list'] as const,
};

export const useGetMaterials = () => {
  const { data, ...query } = useQuery({
    queryKey: materialsKeys.lists(),
    queryFn: getMaterials,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  return { materials: data ?? [], ...query };
};
