import { getAllMaterials } from '../store';

import type { Material } from './types';

export const getMaterials = async (): Promise<Material[]> => {
  return getAllMaterials();
};
