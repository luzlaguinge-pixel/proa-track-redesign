import { useMemo, useState } from 'react';

import {
  type Material,
  type MaterialDueño,
  type MaterialEstado,
  type MaterialTipo,
} from '../types';

export type Filters = {
  search: string;
  tipo: MaterialTipo | '';
  estado: MaterialEstado | '';
  dueño: MaterialDueño | '';
  osc: string;
  plaza: string;
};

const EMPTY_FILTERS: Filters = {
  search: '',
  tipo: '',
  estado: '',
  dueño: '',
  osc: '',
  plaza: '',
};

export const useMaterialsFilters = (materials: Material[]) => {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  const oscOptions = useMemo(
    () => Array.from(new Set(materials.map(m => m.osc).filter(Boolean))).sort(),
    [materials],
  );

  const plazaOptions = useMemo(
    () => Array.from(new Set(materials.map(m => m.plaza))).sort(),
    [materials],
  );

  const filtered = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return materials.filter(m => {
      if (filters.tipo && m.tipo !== filters.tipo) return false;
      if (filters.estado && m.estado !== filters.estado) return false;
      if (filters.dueño && m.dueño !== filters.dueño) return false;
      if (filters.osc && m.osc !== filters.osc) return false;
      if (filters.plaza && m.plaza !== filters.plaza) return false;
      if (search) {
        const haystack = [
          m.responsableNombre,
          m.detalle,
          m.observaciones,
          m.osc,
          m.plaza,
          m.responsableDni,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(search)) return false;
      }
      return true;
    });
  }, [materials, filters]);

  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => setFilters(EMPTY_FILTERS);

  const hasActiveFilters =
    filters.search !== '' ||
    filters.tipo !== '' ||
    filters.estado !== '' ||
    filters.dueño !== '' ||
    filters.osc !== '' ||
    filters.plaza !== '';

  return {
    filters,
    filtered,
    oscOptions,
    plazaOptions,
    updateFilter,
    clearFilters,
    hasActiveFilters,
  };
};
