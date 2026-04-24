import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

import { requireUser } from '../_lib/session';

/**
 * POST /api/notifications/mark-read
 * Body: { ids?: string[] }
 * If ids is omitted or empty, marks ALL notifications as read for the user.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await requireUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    console.error('[mark-read] Supabase env vars not configured');
    return res.status(500).json({ error: 'Supabase not configured' });
  }

  const supabase = createClient(url, key);
  const userId = user.employeeInternalId || String(user.id);
  const { ids } = (req.body ?? {}) as { ids?: string[] };

  let query = supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId);

  if (ids && ids.length > 0) {
    query = query.in('id', ids);
  }

  const { error } = await query;
  if (error) {
    console.error('[Notifications] mark-read failed:', error.message);
    return res.status(500).json({ error: 'Failed to mark as read' });
  }

  return res.status(200).json({ success: true });
}
