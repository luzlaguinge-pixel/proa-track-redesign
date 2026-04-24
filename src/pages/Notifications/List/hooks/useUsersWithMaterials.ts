import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

export interface UserWithMaterials {
  userId: string;
  userName: string;
  materialCount: number;
}

async function getUsersWithAssignedMaterials(): Promise<UserWithMaterials[]> {
  try {
    // In production, this would fetch from the real API
    // For now, we'll return mock data showing users with assigned materials
    // This should be called from an admin-only endpoint that returns:
    // - All users with at least 1 material assigned to them
    // - Material count for each user
    // - User IDs for push notification targeting
    const response = await fetch('/api/admin/users-with-materials');
    if (!response.ok) throw new Error('Failed to fetch users with materials');
    return response.json();
  } catch (error) {
    console.error('Error fetching users with materials:', error);
    return [];
  }
}

export function useUsersWithMaterials() {
  const { data = [], isLoading, error } = useQuery({
    queryKey: ['users-with-materials'],
    queryFn: getUsersWithAssignedMaterials,
    staleTime: 30 * 1000, // 30 seconds — refresh quickly so newly subscribed users appear
  });

  return useMemo(
    () => ({
      users: data,
      recipientCount: data.reduce((sum, u) => sum + u.materialCount, 0),
      userCount: data.length,
      isLoading,
      error,
    }),
    [data, isLoading, error]
  );
}
