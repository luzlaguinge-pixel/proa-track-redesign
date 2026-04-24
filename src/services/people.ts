// Development: import mock data from mock/db.json
import db from '../../mock/db.json';

import { isExcludedFromActiveViews } from '../pages/People/lifecycleStore';
import { postgrest } from './postgrest';

export type HumandUser = {
  id: number;
  firstName: string;
  lastName: string;
  employeeInternalId: string;
  email: string | null;
  status: 'ACTIVE' | 'DEACTIVATED';
  bossId: number | null;
};

export type Person = {
  id: string;
  nombre: string;
  dni: string;
  email: string;
  telefono: string;
  bossId: number | null;
  employeeInternalId: string;
};

function mapToPerson(u: HumandUser): Person {
  return {
    id: String(u.id),
    nombre: `${u.firstName} ${u.lastName}`.trim(),
    dni: u.employeeInternalId ?? '',
    email: u.email ?? '',
    telefono: '',
    bossId: u.bossId ?? null,
    employeeInternalId: u.employeeInternalId ?? '',
  };
}

export async function getActivePeople(): Promise<Person[]> {
  // Development: use mock data from db.json
  // This provides immediate functionality while postgrest is configured
  // biome-ignore lint/suspicious/noExplicitAny: mock data has dynamic structure
  const mockPersons = (db as any).persons || [];
  if (mockPersons.length > 0) {
    // biome-ignore lint/suspicious/noExplicitAny: mock data has dynamic structure
    const all: Person[] = mockPersons.map((p: any) => ({
      id: p.id || String(p.id),
      nombre: p.nombre || '',
      dni: p.dni || '',
      email: p.email || '',
      telefono: p.telefono || '',
      bossId: null,
      employeeInternalId: p.employeeInternalId || p.email || '',
    }));
    // Exclude terminated / pending_recovery people from all active views
    return all.filter(p => !isExcludedFromActiveViews(p.id));
  }

  // Production: use postgrest API (DEACTIVATED users already excluded by status filter)
  const result = await postgrest.get<HumandUser>('/users', {
    status: 'eq.ACTIVE',
    select: 'id,firstName,lastName,employeeInternalId,email,bossId',
    order: 'lastName.asc',
    limit: '500',
  });
  const all = result.data.map(mapToPerson);
  return all.filter(p => !isExcludedFromActiveViews(p.id));
}

export async function searchPeople(query: string): Promise<Person[]> {
  const q = query.trim();
  if (!q) return getActivePeople();

  const [byFirst, byLast, byDni] = await Promise.all([
    postgrest.get<HumandUser>('/users', {
      status: 'eq.ACTIVE',
      firstName: `ilike.*${q}*`,
      select: 'id,firstName,lastName,employeeInternalId,email,bossId',
      limit: '100',
    }),
    postgrest.get<HumandUser>('/users', {
      status: 'eq.ACTIVE',
      lastName: `ilike.*${q}*`,
      select: 'id,firstName,lastName,employeeInternalId,email,bossId',
      limit: '100',
    }),
    postgrest.get<HumandUser>('/users', {
      status: 'eq.ACTIVE',
      employeeInternalId: `ilike.*${q}*`,
      select: 'id,firstName,lastName,employeeInternalId,email,bossId',
      limit: '50',
    }),
  ]);

  const seen = new Set<number>();
  const merged: HumandUser[] = [];
  for (const u of [...byFirst.data, ...byLast.data, ...byDni.data]) {
    if (!seen.has(u.id)) {
      seen.add(u.id);
      merged.push(u);
    }
  }
  merged.sort((a, b) => a.lastName.localeCompare(b.lastName));
  // Exclude terminated / pending_recovery from search results
  return merged.map(mapToPerson).filter(p => !isExcludedFromActiveViews(p.id));
}
