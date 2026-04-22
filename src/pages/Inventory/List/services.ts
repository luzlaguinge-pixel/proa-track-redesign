import db from '../../../../mock/db.json';

import type { Material } from './types';

export const getMaterials = async (): Promise<Material[]> => {
  return (db as { materials: Material[] }).materials;
};
