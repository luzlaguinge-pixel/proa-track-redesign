import { postgrestQuery } from '../../../services/api';
import { getAllMaterials } from '../../Inventory/store';
import { type Material } from '../../Inventory/List/types';

export const getMyMaterials = async (nombre: string): Promise<Material[]> => {
  try {
    const rows = await postgrestQuery<Material>('materials', {
      query: { responsableNombre: `eq.${nombre}` },
    });
    return rows.map(m => ({
      ...m,
      historial: Array.isArray(m.historial) ? m.historial : [],
      assignedToUserId: m.assignedToUserId ?? null,
    }));
  } catch {
    // PostgREST unavailable — fall back to in-memory filter
    return getAllMaterials().filter(m => m.responsableNombre === nombre);
  }
};
