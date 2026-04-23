import { useQuery, useQueryClient } from '@tanstack/react-query';

import { getMaterialesParaConfirmar } from '../../../Confirmation/List/services';
import { DEMO_CAPTADOR_NOMBRE } from '../services';

export const useMyMaterials = () => {
  const { data: materials = [], isLoading } = useQuery({
    queryKey: ['my-materials', DEMO_CAPTADOR_NOMBRE],
    queryFn: () => getMaterialesParaConfirmar(DEMO_CAPTADOR_NOMBRE),
  });

  return { materials, isLoading };
};
