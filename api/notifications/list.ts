import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

import { requireUser } from '../_lib/session';

/**
 * GET /api/notifications/list
 * Returns the last 50 notifications for the authenticated user.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await requireUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error('[Notifications] Supabase env vars not configured');
    return res.status(200).json([]);
  }

  const supabase = createClient(url, key);

  // Match the same userId format used when subscribing (employeeInternalId or numeric id)
  const userId = user.employeeInternalId || String(user.id);

  console.log(`[Notifications] Fetching for userId=${userId}`);

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('[Notifications] Fetch failed:', error.message);
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }

  console.log(`[Notifications] Returned ${data?.length ?? 0} rows for ${userId}`);
  return res.status(200).json(data ?? []);
}
