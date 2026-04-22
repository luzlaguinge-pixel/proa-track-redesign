import db from '../../../../mock/db.json';

import type { Material } from '../List/types';

export const getMaterial = async (id: string): Promise<Material | null> => {
  const material = (db as { materials: Material[] }).materials.find(
    m => m.id === id,
  );
  return material ?? null;
};
