import { useMemo, useState } from 'react';

import {
  type HistorialEventoTipo,
  type MaterialPais,
} from '../../../Inventory/List/types';
import { type MovementsFilters, type MovimientoGlobal } from '../types';

const PAGE_SIZE = 25;

export const useMovementsFilters = (movements: MovimientoGlobal[]) => {
  const [filters, setFilters] = useState<MovementsFilters>({
    search: '',
    tipo: 'todos',
    pais: 'todos',
  });
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () =>
      movements.filter(m => {
        if (filters.tipo !== 'todos' && m.tipo !== filters.tipo) return false;
        if (filters.pais !== 'todos' && m.pais !== filters.pais) return false;
        if (filters.search) {
          const q = filters.search.toLowerCase();
          return (
            m.titulo.toLowerCase().includes(q) ||
            m.autor.toLowerCase().includes(q) ||
            m.materialLabel.toLowerCase().includes(q) ||
            (m.responsableNombre?.toLowerCase().includes(q) ?? false)
          );
        }
        return true;
      }),
    [movements, filters],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const updateFilter = <K extends keyof MovementsFilters>(
    key: K,
    value: MovementsFilters[K],
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({ search: '', tipo: 'todos', pais: 'todos' });
    setPage(1);
  };
  const hasActiveFilters =
    filters.search !== '' ||
    filters.tipo !== 'todos' ||
    filters.pais !== 'todos';

  return {
    filters,
    filtered,
    paginated,
    page,
    setPage,
    totalPages,
    updateFilter,
    hasActiveFilters,
    clearFilters,
  };
};
