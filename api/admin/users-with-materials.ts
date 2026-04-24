import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Return all users who have an active push subscription.
  // These are the users who will receive the monthly confirmation push.
  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('user_id, created_at');

  if (error) {
    console.error('Error fetching push subscriptions:', error);
    return res.status(500).json({ error: 'Failed to fetch subscribers' });
  }

  // Deduplicate by user_id — one user can have subscriptions on multiple devices
  const seen = new Set<string>();
  const users = (subscriptions ?? [])
    .filter((sub) => {
      if (seen.has(sub.user_id)) return false;
      seen.add(sub.user_id);
      return true;
    })
    .map((sub) => ({
      userId: sub.user_id,
      userName: sub.user_id,
      materialCount: 1,
    }));

  return res.status(200).json(users);
}
