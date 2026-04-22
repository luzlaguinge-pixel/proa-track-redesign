import db from '../../../../mock/db.json';
import { getAllMaterials } from '../../Inventory/store';

import { type TeamMember } from './types';

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

// TODO: replace with actual logged-in user lookup via auth session
export const DEMO_LEADER_NOMBRE = 'Agustina Ayelen Jalil';

export const getMyTeam = async (leaderNombre: string): Promise<TeamMember[]> => {
  const materials = getAllMaterials();
  return rawPersons
    .filter(p => p.jefeDirectoNombre === leaderNombre)
    .map(p => ({
      id: p.id,
      nombre: p.nombre,
      dni: p.dni,
      telefono: p.telefono,
      email: p.email,
      puesto: p.puesto,
      pais: p.pais,
      materialesCount: materials.filter(m => m.responsableNombre === p.nombre).length,
    }));
};
