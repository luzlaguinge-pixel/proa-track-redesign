import { getAllMaterials } from '../../Inventory/store';
import { getActivePeople } from '../../../services/people';

import { type PersonRow } from './types';

export const getPersons = async (): Promise<PersonRow[]> => {
  const [people, materials] = await Promise.all([
    getActivePeople(),
    Promise.resolve(getAllMaterials()),
  ]);

  return people.map(p => ({
    id: p.id,
    nombre: p.nombre,
    dni: p.dni,
    email: p.email,
    telefono: p.telefono,
    puesto: '',
    pais: 'AR' as const,
    jefeDirectoNombre: null,
    materialesCount: materials.filter(m => m.responsableNombre === p.nombre).length,
  }));
};
