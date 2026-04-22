import { useState } from 'react';

import { type PersonRow } from '../types';

export const PAGE_LIMIT_OPTIONS = [10, 25, 50];

export const usePersonsSearch = (persons: PersonRow[]) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const filtered = persons.filter(p => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      p.nombre.toLowerCase().includes(q) || p.dni.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * limit, safePage * limit);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  return {
    search,
    page: safePage,
    limit,
    filtered,
    paginated,
    totalPages,
    onSearch: handleSearchChange,
    onPageChange: setPage,
    onLimitChange: handleLimitChange,
  };
};
