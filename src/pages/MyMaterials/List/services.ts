import { getAllMaterials } from '../../Inventory/store';
import { type Material } from '../../Inventory/List/types';

export const getMyMaterials = async (nombre: string): Promise<Material[]> => {
  return getAllMaterials().filter(m => m.responsableNombre === nombre);
};
