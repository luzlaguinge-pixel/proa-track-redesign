import { useMemo, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { DEMO_LEADER_NOMBRE } from '../../../MyTeam/List/services';
import { getTeamMaterials } from '../services';

export const useTeamInventory = () => {
  const [search, setSearch] = useState('');

  const { data: materials = [], isLoading } = useQuery({
    queryKey: ['team-inventory', DEMO_LEADER_NOMBRE],
    queryFn: () => getTeamMaterials(DEMO_LEADER_NOMBRE),
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
