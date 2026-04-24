import type { VercelRequest, VercelResponse } from '@vercel/node';

interface UserWithMaterials {
  userId: string;
  userName: string;
  materialCount: number;
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  // TODO: Add admin authorization check
  // For now, returning mock data showing users with assigned materials

  const usersWithMaterials: UserWithMaterials[] = [
    {
      userId: 'user-001',
      userName: 'Ana García',
      materialCount: 3,
    },
    {
      userId: 'user-002',
      userName: 'María Rodríguez',
      materialCount: 2,
    },
    {
      userId: 'user-003',
      userName: 'Luis Martínez',
      materialCount: 5,
    },
    {
      userId: 'user-004',
      userName: 'Pablo Fernández',
      materialCount: 1,
    },
    {
      userId: 'user-005',
      userName: 'Sofía Torres',
      materialCount: 4,
    },
  ];

  return response.status(200).json(usersWithMaterials);
}
