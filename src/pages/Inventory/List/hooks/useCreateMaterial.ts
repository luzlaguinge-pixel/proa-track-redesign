import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createMaterialService, type CreateMaterialInput } from '../services';
import { materialsKeys } from './useGetMaterials';

export const useCreateMaterial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateMaterialInput) => createMaterialService(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: materialsKeys.all() });
    },
  });
};
