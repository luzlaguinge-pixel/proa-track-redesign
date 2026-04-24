import { postgrestQuery } from '../../../services/api';
import { createMaterial, getAllMaterials, setMaterialsCache } from '../store';

import {
  type Material,
  type MaterialDueño,
  type MaterialEstadoFisico,
  type MaterialPais,
  type MaterialTipo,
} from './types';

const normalizeMaterial = (m: Material): Material => ({
  ...m,
  historial: Array.isArray(m.historial) ? m.historial : [],
  assignedToUserId: m.assignedToUserId ?? null,
});

export const getMaterials = async (): Promise<Material[]> => {
  try {
    const rows = await postgrestQuery<Material>('materials');
    const materials = rows.map(normalizeMaterial);
    // Keep in-memory cache in sync so mutations (updateMaterial etc.) have current data
    setMaterialsCache(materials);
    return materials.map(m => ({ ...m }));
  } catch {
    // PostgREST unavailable — fall back to in-memory cache or seed data
    return getAllMaterials();
  }
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
