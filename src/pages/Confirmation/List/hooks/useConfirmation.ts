import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { DEMO_CAPTADOR_NOMBRE } from '../../../MyMaterials/List/services';
import {
  confirmarTenencia,
  type ConfirmarInput,
  getMaterialesParaConfirmar,
} from '../services';

export const useConfirmation = () => {
  const queryClient = useQueryClient();

  const { data: materials = [], isLoading } = useQuery({
    queryKey: ['confirmation-materials', DEMO_CAPTADOR_NOMBRE],
    queryFn: () => getMaterialesParaConfirmar(DEMO_CAPTADOR_NOMBRE),
  });

  const mutation = useMutation({
    mutationFn: (input: ConfirmarInput) => confirmarTenencia(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['confirmation-materials'] });
    },
  });

  return { materials, isLoading, confirmar: mutation };
};
