import db from '../../../../mock/db.json';
import { getAllMaterials } from '../../Inventory/store';
import { type Material } from '../../Inventory/List/types';

type RawPerson = {
  id: string;
  nombre: string;
  jefeDirectoNombre: string | null;
};

const rawPersons = (db as { persons: RawPerson[] }).persons;

export const getTeamMaterials = async (leaderNombre: string): Promise<Material[]> => {
  const teamNames = new Set(
    rawPersons
      .filter(p => p.jefeDirectoNombre === leaderNombre)
      .map(p => p.nombre),
  );
  return getAllMaterials().filter(
    m => m.responsableNombre !== null && teamNames.has(m.responsableNombre),
  );
};
