import { supabase } from '../../../services/supabase';
import { createMaterial } from '../store';

import {
  type Material,
  type MaterialDueño,
  type MaterialEstadoFisico,
  type MaterialPais,
  type MaterialTipo,
} from './types';

export const getMaterials = async (): Promise<Material[]> => {
  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .order('id');
  if (error) throw error;
  return (data ?? []).map(m => ({
    ...m,
    historial: Array.isArray(m.historial) ? m.historial : [],
    assignedToUserId: m.assignedToUserId ?? null,
  }));
};

export type CreateMaterialInput = {
  tipo: MaterialTipo;
  detalle: string;
  estadoFisico: MaterialEstadoFisico;
  osc: string;
  dueño: MaterialDueño;
  cantidad: number;
  plaza: string;
  pais: MaterialPais;
  lineaTelefonica: string | null;
  observaciones: string | null;
};

export const createMaterialService = async (
  input: CreateMaterialInput,
): Promise<Material> => {
  return createMaterial(input);
};
