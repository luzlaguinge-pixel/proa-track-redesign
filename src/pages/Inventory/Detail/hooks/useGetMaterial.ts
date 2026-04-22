import { useQuery } from '@tanstack/react-query';

import { materialsKeys } from '../../List/hooks/useGetMaterials';
import { getMaterial } from '../services';

export const useGetMaterial = (id: string | undefined) => {
  const { data, ...query } = useQuery({
    queryKey: [...materialsKeys.all(), 'detail', id] as const,
    queryFn: () => getMaterial(id!),
    enabled: !!id,
  });

  return { material: data ?? null, ...query };
};
