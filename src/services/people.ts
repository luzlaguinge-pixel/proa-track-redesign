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
};

function mapToPerson(u: HumandUser): Person {
  return {
    id: String(u.id),
    nombre: `${u.firstName} ${u.lastName}`.trim(),
    dni: u.employeeInternalId ?? '',
    email: u.email ?? '',
    telefono: '',
    bossId: u.bossId ?? null,
  };
}

export async function getActivePeople(): Promise<Person[]> {
  const result = await postgrest.get<HumandUser>('/users', {
    status: 'eq.ACTIVE',
    select: 'id,firstName,lastName,employeeInternalId,email,bossId',
    order: 'lastName.asc',
    limit: '500',
  });
  return result.data.map(mapToPerson);
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
  return merged.map(mapToPerson);
}
