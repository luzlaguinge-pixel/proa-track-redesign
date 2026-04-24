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

  const { dispatcherName, dispatcherId, userIds } = req.body;

  if (!dispatcherName || !dispatcherId || !Array.isArray(userIds)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Fetch subscriptions from Supabase
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
    console.log(`Monthly confirmation: no subscriptions found for userIds=${JSON.stringify(userIds)}`);
    return res.status(200).json({
      success: true,
      sent: 0,
      failed: 0,
      message: 'No push subscriptions found for selected users',
    });
  }

  const payload = JSON.stringify({
    title: 'Confirmá tus materiales',
    body: 'Es momento de confirmar la tenencia de tus materiales asignados.',
    url: '/my-materials',
  });

  let sent = 0;
  let failed = 0;
  const failedUserIds: string[] = [];
  const toDelete: string[] = [];

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
        sent++;
        console.log(`Push sent to userId=${sub.user_id} endpoint=${sub.endpoint.slice(0, 60)}...`);
      } catch (err: any) {
        console.error(`Push failed for userId=${sub.user_id}: ${err.statusCode} ${err.message}`);
        failed++;
        failedUserIds.push(sub.user_id);
        // 410 Gone or 404 = subscription is no longer valid, clean it up
        if (err.statusCode === 410 || err.statusCode === 404) {
          toDelete.push(sub.user_id);
        }
      }
    })
  );

  // Remove expired subscriptions
  if (toDelete.length > 0) {
    await supabase.from('push_subscriptions').delete().in('user_id', toDelete);
    console.log(`Removed ${toDelete.length} expired subscriptions`);
  }

  // Record dispatch in history
  await supabase.from('notification_history').insert({
    dispatcher_name: dispatcherName,
    dispatcher_id: dispatcherId,
    user_count: userIds.length,
    recipient_count: subscriptions.length,
    sent_count: sent,
    failed_count: failed,
  });

  console.log(`Monthly confirmation dispatch: sent=${sent} failed=${failed}`);
  return res.status(200).json({
    success: true,
    sent,
    failed,
    failedUserIds: failed > 0 ? failedUserIds : undefined,
  });
}
