import { supabase } from '../../services/supabase';

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

const TABLE = 'solicitudes';

export const getAllSolicitudes = async (): Promise<Solicitud[]> => {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .order('fecha', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Solicitud[];
};

export const createSolicitud = async (
  data: Omit<Solicitud, 'id' | 'estado' | 'resolverPorNombre' | 'fechaResolucion'>,
): Promise<Solicitud> => {
  const entry: Solicitud = {
    ...data,
    id: `sol_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    estado: 'pendiente',
    resolverPorNombre: null,
    fechaResolucion: null,
  };
  const { data: row, error } = await supabase
    .from(TABLE)
    .insert(entry)
    .select()
    .single();
  if (error) throw error;
  return row as Solicitud;
};

export const resolveSolicitud = async (
  id: string,
  estado: 'aprobada' | 'rechazada',
  resolverPorNombre: string,
): Promise<Solicitud | null> => {
  const updated = {
    estado,
    resolverPorNombre,
    fechaResolucion: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from(TABLE)
    .update(updated)
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data as Solicitud | null;
};

export const deleteSolicitud = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
  return true;
};

// Legacy no-op kept so any leftover callers don't crash on import
export const initializeStore = async (): Promise<void> => {};
