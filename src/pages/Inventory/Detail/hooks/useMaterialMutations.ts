import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '../../../../providers/AuthContext';
import { materialsKeys } from '../../List/hooks/useGetMaterials';
import {
  assignMaterial,
  reportMaterial,
  requestConfirmation,
  type AssignInput,
  type ConfirmInput,
  type ReportInput,
} from '../services';

const autorFrom = (user: { firstName: string; lastName: string } | null) =>
  user ? `${user.firstName} ${user.lastName}`.trim() : 'Usuario';

export const useMaterialMutations = (materialId: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: materialsKeys.all() });
  };

  const assign = useMutation({
    mutationFn: (input: Omit<AssignInput, 'autor' | 'materialId'>) =>
      assignMaterial({ ...input, materialId, autor: autorFrom(user) }),
    onSuccess: invalidate,
  });

  const report = useMutation({
    mutationFn: (input: Omit<ReportInput, 'autor' | 'materialId'>) =>
      reportMaterial({ ...input, materialId, autor: autorFrom(user) }),
    onSuccess: invalidate,
  });

  const confirm = useMutation({
    mutationFn: (input: Omit<ConfirmInput, 'autor' | 'materialId'>) =>
      requestConfirmation({ ...input, materialId, autor: autorFrom(user) }),
    onSuccess: invalidate,
  });

  return { assign, report, confirm };
};
