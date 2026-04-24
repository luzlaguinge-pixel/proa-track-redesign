import {
  postgrestCreate,
  postgrestDelete,
  postgrestQuery,
} from '../../services/api';

export type Confirmacion = {
  id: string;
  materialId: string;
  responsableNombre: string;
  fecha: string;
  nota: string;
  fotoBase64: string | null;
};

let cache: Confirmacion[] | null = null;

export const getAllConfirmaciones = (): Confirmacion[] => {
  return cache ? cache.map(c => ({ ...c })) : [];
};

export const getConfirmacionesByMaterial = (
  materialId: string,
): Confirmacion[] =>
  (cache ?? []).filter(c => c.materialId === materialId).map(c => ({ ...c }));

export const getConfirmacionesByResponsable = (
  nombre: string,
): Confirmacion[] =>
  (cache ?? [])
    .filter(c => c.responsableNombre === nombre)
    .map(c => ({ ...c }));

export const createConfirmacion = (
  data: Omit<Confirmacion, 'id'>,
): Confirmacion => {
  if (!cache) cache = [];
  const entry: Confirmacion = {
    ...data,
    id: `conf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  };
  cache.push(entry);
  postgrestCreate<Confirmacion>('confirmaciones', entry).catch(() => {
    // log silently
  });
  return { ...entry };
};

export const deleteConfirmacion = (id: string): boolean => {
  if (!cache) return false;
  const idx = cache.findIndex(c => c.id === id);
  if (idx === -1) return false;
  cache.splice(idx, 1);
  postgrestDelete('confirmaciones', id).catch(() => {
    // log silently
  });
  return true;
};

export const initializeStore = async (): Promise<void> => {
  try {
    const confirmaciones = await postgrestQuery<Confirmacion>('confirmaciones');
    cache = confirmaciones;
  } catch {
    cache = [];
  }
};
