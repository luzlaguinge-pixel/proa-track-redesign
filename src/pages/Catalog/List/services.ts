import { getAllMaterials } from '../../Inventory/store';

import {
  createCatalogItem,
  getAllCatalogItems,
  updateCatalogItem,
} from './store';
import { type CatalogItem, type CatalogItemWithUnidades } from './types';

export type CreateCatalogInput = Omit<CatalogItem, 'id' | 'archivado'>;
export type UpdateCatalogInput = Partial<Omit<CatalogItem, 'id'>>;

export const getCatalogItems = async (): Promise<CatalogItemWithUnidades[]> => {
  const all = getAllCatalogItems().filter(i => !i.archivado);
  const materials = getAllMaterials();
  return all.map(item => ({
    ...item,
    unidades: materials.filter(m => item.id === `cat_${m.tipo}`).length,
  }));
};

export const createCatalogItemService = async (
  input: CreateCatalogInput,
): Promise<CatalogItem> => createCatalogItem(input);

export const updateCatalogItemService = async (
  id: string,
  input: UpdateCatalogInput,
): Promise<CatalogItem | null> => updateCatalogItem(id, input);

export const archiveCatalogItemService = async (id: string): Promise<void> => {
  updateCatalogItem(id, { archivado: true });
};
