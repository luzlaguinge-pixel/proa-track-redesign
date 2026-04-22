import db from '../../../../mock/db.json';
import { getAllMaterials } from '../../Inventory/store';

import { type PersonRow } from './types';

type RawPerson = {
  id: string;
  nombre: string;
  dni: string;
  telefono: string;
  email: string;
  puesto: string;
  pais: 'AR' | 'GT' | 'UY';
  jefeDirectoNombre: string | null;
};
const rawPersons = (db as { persons: RawPerson[] }).persons;

export const getPersons = async (): Promise<PersonRow[]> => {
  const materials = getAllMaterials();
  return rawPersons.map(p => ({
    ...p,
    materialesCount: materials.filter(m => m.responsableNombre === p.nombre)
      .length,
  }));
};
