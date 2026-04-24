import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface DispatchedNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  url: string;
  icon: string;
  isRead: boolean;
  pushStatus: 'pending' | 'sent' | 'failed' | 'no_subscription';
  createdAt: string;
}

async function fetchNotifications(): Promise<DispatchedNotification[]> {
  const res = await fetch('/api/notifications/list');
  if (!res.ok) return [];
  const data = await res.json();
  return (data ?? []).map(
    (n: {
      id: string;
      user_id: string;
      title: string;
      body: string;
      url: string;
      icon: string;
      is_read: boolean;
      push_status: string;
      created_at: string;
    }) => ({
      id: n.id,
      userId: n.user_id,
      title: n.title,
      body: n.body,
      url: n.url,
      icon: n.icon,
      isRead: n.is_read,
      pushStatus: n.push_status,
      createdAt: n.created_at,
    }),
  );
}

async function markReadRequest(ids?: string[]): Promise<void> {
  await fetch('/api/notifications/mark-read', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
}

export const DISPATCHED_NOTIFS_KEY = ['dispatched-notifications'] as const;

/**
 * Fetches real server-dispatched notifications for the current user.
 * Polls every 15 seconds so the bell stays near-real-time for all users.
 * Also re-fetches immediately whenever the query is invalidated (e.g. after dispatch).
 */
export function useDispatchedNotifications() {
  return useQuery({
    queryKey: DISPATCHED_NOTIFS_KEY,
    queryFn: fetchNotifications,
    staleTime: 0,
    refetchInterval: 15_000,
  });
}

/**
 * Marks one or more notifications as read.
 * Pass specific ids to mark only those; pass nothing to mark all.
 */
export function useMarkNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids?: string[]) => markReadRequest(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: DISPATCHED_NOTIFS_KEY }),
  });
}
