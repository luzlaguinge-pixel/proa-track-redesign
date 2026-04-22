import { createMaterial, getAllMaterials } from '../store';

import {
  type Material,
  type MaterialDueño,
  type MaterialEstadoFisico,
  type MaterialPais,
  type MaterialTipo,
} from './types';

export const getMaterials = async (): Promise<Material[]> => {
  return getAllMaterials();
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
