import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '../../../../providers/AuthContext';
import {
  confirmarTenencia,
  type ConfirmarInput,
  getMaterialesParaConfirmar,
} from '../services';

export const useConfirmation = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userName = user ? `${user.firstName} ${user.lastName}` : '';

  const { data: materials = [], isLoading } = useQuery({
    queryKey: ['confirmation-materials', userName],
    queryFn: () => getMaterialesParaConfirmar(userName),
    enabled: !!userName,
  });

  const mutation = useMutation({
    mutationFn: (input: ConfirmarInput) => confirmarTenencia(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['confirmation-materials'] });
    },
  });

  return { materials, isLoading, confirmar: mutation };
};
