import { useMemo, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { DEMO_LEADER_NOMBRE, getMyTeam } from '../services';

export const useMyTeam = () => {
  const [search, setSearch] = useState('');

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['my-team', DEMO_LEADER_NOMBRE],
    queryFn: () => getMyTeam(DEMO_LEADER_NOMBRE),
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return members;
    const q = search.toLowerCase();
    return members.filter(
      m =>
        m.nombre.toLowerCase().includes(q) ||
        m.puesto.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q),
    );
  }, [members, search]);

  return { members: filtered, total: members.length, isLoading, search, setSearch };
};
