import { useQuery } from '@tanstack/react-query';

import { useAuth } from '../../../../providers/AuthContext';
import { getMyMaterials } from '../services';

export const useMyMaterials = () => {
  const { user } = useAuth();
  const userName = user ? `${user.firstName} ${user.lastName}` : '';

  const { data: materials = [], isLoading } = useQuery({
    queryKey: ['my-materials', userName],
    queryFn: () => getMyMaterials(userName),
    enabled: !!userName,
  });

  return { materials, isLoading };
};
