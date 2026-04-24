import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

import { requireUser } from '../_lib/session';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!,
);

/**
 * GET /api/notifications
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

  // Match the same userId format used when subscribing (employeeInternalId or numeric id)
  const userId = user.employeeInternalId || String(user.id);

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

  return res.status(200).json(data ?? []);
}
