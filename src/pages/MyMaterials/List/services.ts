import { supabase } from '../../../services/supabase';
import { type Material } from '../../Inventory/List/types';

export const getMyMaterials = async (nombre: string): Promise<Material[]> => {
  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .eq('responsableNombre', nombre)
    .order('id');
  if (error) throw error;
  return (data ?? []).map(m => ({
    ...m,
    historial: Array.isArray(m.historial) ? m.historial : [],
    assignedToUserId: m.assignedToUserId ?? null,
  }));
};
