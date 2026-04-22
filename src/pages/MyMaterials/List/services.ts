import db from '../../../../mock/db.json';
import { getAllMaterials } from '../../Inventory/store';
import { type Material } from '../../Inventory/List/types';

type RawPerson = { id: string; nombre: string; dni: string };

// TODO: replace with actual logged-in user lookup via auth session
export const DEMO_CAPTADOR_NOMBRE = 'Luz Laguinge';

const rawPersons = (db as { persons: RawPerson[] }).persons;

export const getMyCaptadorId = (): string | null => {
  const p = rawPersons.find(p => p.nombre === DEMO_CAPTADOR_NOMBRE);
  return p?.id ?? null;
};

export const getMyMaterials = async (nombre: string): Promise<Material[]> => {
  return getAllMaterials().filter(m => m.responsableNombre === nombre);
};
