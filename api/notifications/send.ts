import type { VercelRequest, VercelResponse } from '@vercel/node';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
  process.env.VITE_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userIds, title, body, icon } = req.body;

  if (!userIds || !Array.isArray(userIds) || !title || !body) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const query = supabase.from('push_subscriptions').select('*');
  if (userIds.length > 0) {
    query.in('user_id', userIds);
  }
  const { data: subscriptions, error: fetchError } = await query;

  if (fetchError) {
    console.error('Error fetching subscriptions:', fetchError);
    return res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }

  if (!subscriptions || subscriptions.length === 0) {
    return res.status(200).json({
      success: true,
      sent: 0,
      failed: 0,
      message: 'No push subscriptions found for specified users',
    });
  }

  const payload = JSON.stringify({ title, body, icon: icon || '/favicon.svg', url: '/' });

  let sent = 0;
  let failed = 0;
  const toDelete: string[] = [];

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
        sent++;
      } catch (err: any) {
        console.error(`Push failed for userId=${sub.user_id}: ${err.statusCode} ${err.message}`);
        failed++;
        if (err.statusCode === 410 || err.statusCode === 404) {
          toDelete.push(sub.user_id);
        }
      }
    })
  );

  if (toDelete.length > 0) {
    await supabase.from('push_subscriptions').delete().in('user_id', toDelete);
  }

  return res.status(200).json({ success: true, sent, failed });
}
