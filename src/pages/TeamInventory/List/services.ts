import { postgrest } from '../../../services/postgrest';
import { getAllMaterials } from '../../Inventory/store';
import { getTeamForLeader } from '../../../stores/teamStore';
import { type Material } from '../../Inventory/List/types';

type HumandUser = {
  firstName: string;
  lastName: string;
  employeeInternalId: string;
};

export const getTeamMaterials = async (leaderDni: string): Promise<Material[]> => {
  const memberDnis = getTeamForLeader(leaderDni);
  if (memberDnis.length === 0) return [];

  const dniList = memberDnis.join(',');
  const result = await postgrest.get<HumandUser>('/users', {
    employeeInternalId: `in.(${dniList})`,
    select: 'firstName,lastName,employeeInternalId',
    limit: '500',
  });

  const teamNames = new Set(
    result.data.map(u => `${u.firstName} ${u.lastName}`.trim()),
  );

  return getAllMaterials().filter(
    m => m.responsableNombre !== null && teamNames.has(m.responsableNombre),
  );
};
