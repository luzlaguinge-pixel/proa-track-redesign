import { useMemo, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { useAuth } from '../../../../providers/AuthContext';
import { getTeamMaterials } from '../services';

export const useTeamInventory = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  const leaderDni = user?.employeeInternalId ?? '';

  const { data: materials = [], isLoading } = useQuery({
    queryKey: ['team-inventory', leaderDni],
    queryFn: () => getTeamMaterials(leaderDni),
    enabled: !!leaderDni,
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return materials;
    const q = search.toLowerCase();
    return materials.filter(
      m =>
        (m.responsableNombre ?? '').toLowerCase().includes(q) ||
        m.tipo.toLowerCase().includes(q) ||
        (m.detalle ?? '').toLowerCase().includes(q) ||
        (m.plaza ?? '').toLowerCase().includes(q),
    );
  }, [materials, search]);

  return { materials: filtered, total: materials.length, isLoading, search, setSearch };
};
