import { useQuery } from '@tanstack/react-query';

import { useAuth } from '../../../../providers/AuthContext';
import { getMaterialesParaConfirmar } from '../../../Confirmation/List/services';

export const useMyMaterialsWithConfirmation = () => {
  const { user } = useAuth();
  const userName = user ? `${user.firstName} ${user.lastName}` : '';

  const { data: materials = [], isLoading } = useQuery({
    queryKey: ['my-materials-with-confirmation', userName],
    queryFn: () => getMaterialesParaConfirmar(userName),
    enabled: !!userName,
    refetchOnMount: 'always',
    staleTime: 0,
  });

  const pendingCount = materials.filter(m => !m.confirmadaEsteMes).length;

  return { materials, pendingCount, isLoading };
};
