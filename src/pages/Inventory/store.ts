import { supabase } from '../../services/supabase';
import { type Material } from './List/types';

// ─── Supabase helpers ─────────────────────────────────────────────────────────

const TABLE = 'materials';

export const getAllMaterials = async (): Promise<Material[]> => {
  const { data, error } = await supabase.from(TABLE).select('*').order('id');
  if (error) throw error;
  return (data ?? []).map(normalizeMaterial);
};

export const getMaterialById = async (id: string): Promise<Material | null> => {
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ? normalizeMaterial(data) : null;
};

export const updateMaterial = async (
  id: string,
  updater: (current: Material) => Material,
): Promise<Material | null> => {
  const current = await getMaterialById(id);
  if (!current) return null;
  const updated = updater(current);
  const { data, error } = await supabase
    .from(TABLE)
    .update(toRow(updated))
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data ? normalizeMaterial(data) : null;
};

export const createMaterial = async (
  data: Omit<
    Material,
    | 'id'
    | 'estado'
    | 'responsableNombre'
    | 'responsableDni'
    | 'responsableTelefono'
    | 'comodatoFirmado'
    | 'fechaActualizacion'
    | 'historial'
    | 'assignedToUserId'
  >,
): Promise<Material> => {
  const newMaterial: Material = {
    ...data,
    id: `mat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    estado: 'sin_uso',
    responsableNombre: null,
    responsableDni: null,
    responsableTelefono: null,
    comodatoFirmado: false,
    fechaActualizacion: new Date().toISOString().slice(0, 10),
    historial: [],
    assignedToUserId: null,
  };
  const { data: row, error } = await supabase
    .from(TABLE)
    .insert(toRow(newMaterial))
    .select()
    .single();
  if (error) throw error;
  return normalizeMaterial(row);
};

export const unassignMaterials = async (ids: string[]): Promise<void> => {
  const todayStr = new Date().toISOString().slice(0, 10);
  const { error } = await supabase
    .from(TABLE)
    .update({
      responsableNombre: null,
      responsableDni: null,
      responsableTelefono: null,
      comodatoFirmado: false,
      estado: 'sin_uso',
      fechaActualizacion: todayStr,
    })
    .in('id', ids);
  if (error) throw error;
};

export const deleteMaterials = async (ids: string[]): Promise<void> => {
  const { error } = await supabase.from(TABLE).delete().in('id', ids);
  if (error) throw error;
};

export const deleteMaterial = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from(TABLE).delete().eq('id', id);
  if (error) throw error;
  return true;
};

// ─── Internal helpers ─────────────────────────────────────────────────────────

// Supabase returns exactly our column names (camelCase with quotes in schema)
const normalizeMaterial = (row: Record<string, unknown>): Material => ({
  id: row.id as string,
  tipo: row.tipo as Material['tipo'],
  detalle: (row.detalle as string) ?? '',
  estado: row.estado as Material['estado'],
  estadoFisico: (row.estadoFisico as Material['estadoFisico']) ?? 'ok',
  osc: (row.osc as string) ?? '',
  dueño: (row['dueño'] as Material['dueño']) ?? 'proa',
  cantidad: (row.cantidad as number) ?? 1,
  plaza: (row.plaza as string) ?? '',
  pais: (row.pais as Material['pais']) ?? 'AR',
  responsableNombre: (row.responsableNombre as string) ?? null,
  responsableDni: (row.responsableDni as string) ?? null,
  responsableTelefono: (row.responsableTelefono as string) ?? null,
  comodatoFirmado: (row.comodatoFirmado as boolean) ?? false,
  lineaTelefonica: (row.lineaTelefonica as string) ?? null,
  observaciones: (row.observaciones as string) ?? null,
  fechaActualizacion: (row.fechaActualizacion as string) ?? '',
  historial: Array.isArray(row.historial) ? row.historial : [],
  assignedToUserId: (row.assignedToUserId as string) ?? null,
});

// Strip Supabase-only columns before writing
const toRow = (m: Material) => ({
  id: m.id,
  tipo: m.tipo,
  detalle: m.detalle,
  estado: m.estado,
  estadoFisico: m.estadoFisico,
  osc: m.osc,
  'dueño': m.dueño,
  cantidad: m.cantidad,
  plaza: m.plaza,
  pais: m.pais,
  responsableNombre: m.responsableNombre,
  responsableDni: m.responsableDni,
  responsableTelefono: m.responsableTelefono,
  comodatoFirmado: m.comodatoFirmado,
  lineaTelefonica: m.lineaTelefonica,
  observaciones: m.observaciones,
  fechaActualizacion: m.fechaActualizacion,
  historial: m.historial,
  assignedToUserId: m.assignedToUserId,
});

// Kept for any code that hasn't migrated yet — now async
export const setMaterialsCache = (_materials: Material[]): void => {
  // no-op: Supabase is the source of truth now
};
export const initializeStore = async (): Promise<void> => {
  // no-op: Supabase is the source of truth now
};
