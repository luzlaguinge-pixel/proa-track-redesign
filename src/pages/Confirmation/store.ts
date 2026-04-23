export type Confirmacion = {
  id: string;
  materialId: string;
  responsableNombre: string;
  fecha: string;
  nota: string;
  fotoBase64: string | null;
};

const STORAGE_KEY = 'proa-track:confirmaciones';

let cache: Confirmacion[] | null = null;

const load = (): Confirmacion[] => {
  if (cache) return cache;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      cache = JSON.parse(stored) as Confirmacion[];
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

export const getAllConfirmaciones = (): Confirmacion[] => load().map(c => ({ ...c }));

export const getConfirmacionesByMaterial = (materialId: string): Confirmacion[] =>
  load().filter(c => c.materialId === materialId).map(c => ({ ...c }));

export const getConfirmacionesByResponsable = (nombre: string): Confirmacion[] =>
  load().filter(c => c.responsableNombre === nombre).map(c => ({ ...c }));

export const createConfirmacion = (data: Omit<Confirmacion, 'id'>): Confirmacion => {
  const list = load();
  const entry: Confirmacion = {
    ...data,
    id: `conf_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  };
  list.push(entry);
  cache = list;
  persist();
  return { ...entry };
};
