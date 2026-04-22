import { useQuery } from '@tanstack/react-query';

import {
  getPersonById,
  getPersonHistory,
  getPersonMaterials,
} from '../services';

export const personKeys = {
  all: () => ['people'] as const,
  detail: (id: string) => [...personKeys.all(), 'detail', id] as const,
  materials: (nombre: string) =>
    [...personKeys.all(), 'materials', nombre] as const,
  history: (nombre: string) =>
    [...personKeys.all(), 'history', nombre] as const,
};

export const useGetPerson = (id: string | undefined) => {
  const { data, ...query } = useQuery({
    queryKey: personKeys.detail(id ?? ''),
    queryFn: () => getPersonById(id!),
    enabled: !!id,
  });
  return { person: data ?? null, ...query };
};

export const useGetPersonMaterials = (nombre: string | undefined) => {
  const { data, ...query } = useQuery({
    queryKey: personKeys.materials(nombre ?? ''),
    queryFn: () => getPersonMaterials(nombre!),
    enabled: !!nombre,
  });
  return { materials: data ?? [], ...query };
};

export const useGetPersonHistory = (nombre: string | undefined) => {
  const { data, ...query } = useQuery({
    queryKey: personKeys.history(nombre ?? ''),
    queryFn: () => getPersonHistory(nombre!),
    enabled: !!nombre,
  });
  return { history: data ?? [], ...query };
};
