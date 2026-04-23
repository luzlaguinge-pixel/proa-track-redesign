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

const STORAGE_KEY = 'proa-track:solicitudes';

let cache: Solicitud[] | null = null;

const load = (): Solicitud[] => {
  if (cache) return cache;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      cache = JSON.parse(stored) as Solicitud[];
      return cache;
    }
  } catch { /* ignore */ }
  cache = [];
  return cache;
};

const persist = () => {
  if (!cache) return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cache)); } catch { /* ignore */ }
};

export const getAllSolicitudes = (): Solicitud[] => load().map(s => ({ ...s }));

export const createSolicitud = (data: Omit<Solicitud, 'id' | 'estado' | 'resolverPorNombre' | 'fechaResolucion'>): Solicitud => {
  const list = load();
  const entry: Solicitud = {
    ...data,
    id: `sol_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    estado: 'pendiente',
    resolverPorNombre: null,
    fechaResolucion: null,
  };
  list.push(entry);
  cache = list;
  persist();
  return { ...entry };
};

export const resolveSolicitud = (
  id: string,
  estado: 'aprobada' | 'rechazada',
  resolverPorNombre: string,
): Solicitud | null => {
  const list = load();
  const idx = list.findIndex(s => s.id === id);
  if (idx === -1) return null;
  list[idx] = {
    ...list[idx],
    estado,
    resolverPorNombre,
    fechaResolucion: new Date().toISOString(),
  };
  cache = list;
  persist();
  return { ...list[idx] };
};
