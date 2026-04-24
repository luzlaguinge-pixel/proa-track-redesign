import { postgrest } from '../../../services/postgrest';
import { getAllMaterials } from '../../Inventory/store';
import { isExcludedFromActiveViews } from '../../People/lifecycleStore';
import { getTeamForLeader } from '../../../stores/teamStore';

import { type TeamMember } from './types';

type HumandUser = {
  id: number;
  firstName: string;
  lastName: string;
  employeeInternalId: string;
  email: string | null;
};

export const getMyTeam = async (leaderDni: string): Promise<TeamMember[]> => {
  const memberDnis = getTeamForLeader(leaderDni);
  if (memberDnis.length === 0) return [];

  const dniList = memberDnis.join(',');
  const result = await postgrest.get<HumandUser>('/users', {
    employeeInternalId: `in.(${dniList})`,
    select: 'id,firstName,lastName,employeeInternalId,email',
    limit: '500',
  });

  const materials = await getAllMaterials();

  return result.data
    .filter(u => !isExcludedFromActiveViews(String(u.id)))
    .map(u => {
      const nombre = `${u.firstName} ${u.lastName}`.trim();
      return {
        id: String(u.id),
        nombre,
        dni: u.employeeInternalId,
        telefono: '',
        email: u.email ?? '',
        puesto: '',
        pais: 'AR' as const,
        materialesCount: materials.filter(m => m.responsableNombre === nombre)
          .length,
      };
    });
};
