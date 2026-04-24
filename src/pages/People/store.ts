import {
  postgrestCreate,
  postgrestQuery,
  postgrestUpdate,
} from '../../services/api';

export type PersonOverride = {
  dni?: string;
  telefono?: string;
};

let cache: Record<string, PersonOverride> | null = null;

export const getPersonOverride = (id: string): PersonOverride =>
  (cache ?? {})[id] ?? {};

export const updatePersonOverride = (
  id: string,
  fields: PersonOverride,
): void => {
  if (!cache) cache = {};
  cache[id] = { ...cache[id], ...fields };
  postgrestUpdate<PersonOverride>('person_overrides', id, cache[id]).catch(
    () => {
      // log silently
    },
  );
};

export const initializeStore = async (): Promise<void> => {
  try {
    const overrides = await postgrestQuery<{ id: string } & PersonOverride>(
      'person_overrides',
    );
    cache = {};
    for (const override of overrides) {
      const { id, ...fields } = override;
      cache[id] = fields;
    }
  } catch {
    cache = {};
  }
};
