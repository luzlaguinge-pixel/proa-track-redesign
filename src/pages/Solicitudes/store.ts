import {
  postgrestCreate,
  postgrestDelete,
  postgrestQuery,
  postgrestUpdate,
} from '../../services/api';

export type Solicitud = {
  id: string;
  materialId: string;
  materialLabel: string;
  solicitanteNombre: string;
  destinatarioNombre: string;
  descripcion: string;
  fecha: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  resolverPorNombre: string | null;
  fechaResolucion: string | null;
};

let cache: Solicitud[] | null = null;

export const getAllSolicitudes = (): Solicitud[] => {
  return cache ? cache.map(s => ({ ...s })) : [];
};

export const createSolicitud = (
  data: Omit<
    Solicitud,
    'id' | 'estado' | 'resolverPorNombre' | 'fechaResolucion'
  >,
): Solicitud => {
  if (!cache) cache = [];
  const entry: Solicitud = {
    ...data,
    id: `sol_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    estado: 'pendiente',
    resolverPorNombre: null,
    fechaResolucion: null,
  };
  cache.push(entry);
  postgrestCreate<Solicitud>('solicitudes', entry).catch(() => {
    // log silently
  });
  return { ...entry };
};

export const resolveSolicitud = (
  id: string,
  estado: 'aprobada' | 'rechazada',
  resolverPorNombre: string,
): Solicitud | null => {
  if (!cache) return null;
  const idx = cache.findIndex(s => s.id === id);
  if (idx === -1) return null;
  const updated = {
    ...cache[idx],
    estado,
    resolverPorNombre,
    fechaResolucion: new Date().toISOString(),
  };
  cache[idx] = updated;
  postgrestUpdate<Solicitud>('solicitudes', id, updated).catch(() => {
    // log silently
  });
  return { ...updated };
};

export const deleteSolicitud = (id: string): boolean => {
  if (!cache) return false;
  const idx = cache.findIndex(s => s.id === id);
  if (idx === -1) return false;
  cache.splice(idx, 1);
  postgrestDelete('solicitudes', id).catch(() => {
    // log silently
  });
  return true;
};

export const initializeStore = async (): Promise<void> => {
  try {
    const solicitudes = await postgrestQuery<Solicitud>('solicitudes');
    cache = solicitudes;
  } catch {
    cache = [];
  }
};
