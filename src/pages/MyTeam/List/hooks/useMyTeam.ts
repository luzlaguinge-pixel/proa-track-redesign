import { useMemo, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { useAuth } from '../../../../providers/AuthContext';
import { getMyTeam } from '../services';

export const useMyTeam = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  const leaderDni = user?.employeeInternalId ?? '';

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['my-team', leaderDni],
    queryFn: () => getMyTeam(leaderDni),
    enabled: !!leaderDni,
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

  return {
    members: filtered,
    total: members.length,
    isLoading,
    search,
    setSearch,
  };
};
