import { useQuery } from '@tanstack/react-query';

import { DEMO_CAPTADOR_NOMBRE, getMyMaterials } from '../services';

export const useMyMaterials = () => {
  const { data: materials = [], isLoading } = useQuery({
    queryKey: ['my-materials', DEMO_CAPTADOR_NOMBRE],
    queryFn: () => getMyMaterials(DEMO_CAPTADOR_NOMBRE),
  });

  return { materials, isLoading };
};
