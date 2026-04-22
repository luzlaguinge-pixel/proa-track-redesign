import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  archiveCatalogItemService,
  type CreateCatalogInput,
  createCatalogItemService,
  getCatalogItems,
  type UpdateCatalogInput,
  updateCatalogItemService,
} from '../services';

export const catalogKeys = {
  all: () => ['catalog'] as const,
  list: () => [...catalogKeys.all(), 'list'] as const,
};

export const useGetCatalog = () => {
  const { data, ...query } = useQuery({
    queryKey: catalogKeys.list(),
    queryFn: getCatalogItems,
  });
  return { items: data ?? [], ...query };
};

export const useCreateCatalogItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCatalogInput) => createCatalogItemService(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: catalogKeys.all() }),
  });
};

export const useUpdateCatalogItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCatalogInput }) =>
      updateCatalogItemService(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: catalogKeys.all() }),
  });
};

export const useArchiveCatalogItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => archiveCatalogItemService(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: catalogKeys.all() }),
  });
};
