import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

import { dispatchToMany } from '../_lib/dispatchNotification';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!,
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { dispatcherName, dispatcherId, userIds } = req.body;

  if (!dispatcherName || !dispatcherId || !Array.isArray(userIds)) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // If no specific userIds provided, target ALL users with a push subscription.
  let targetUserIds: string[] = userIds;
  if (targetUserIds.length === 0) {
    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('user_id');
    const seen = new Set<string>();
    targetUserIds = (subs ?? [])
      .filter((s) => { const dup = seen.has(s.user_id); seen.add(s.user_id); return !dup; })
      .map((s) => s.user_id);
  }

  if (targetUserIds.length === 0) {
    console.log('[Monthly] No recipients — no push subscriptions found');
    return res.status(200).json({
      success: true,
      sent: 0,
      failed: 0,
      inApp: 0,
      message: 'No recipients found',
    });
  }

  // Dispatch to BOTH channels for every recipient
  const results = await dispatchToMany(targetUserIds, {
    title: 'Confirmá tus materiales',
    body: 'Es momento de confirmar la tenencia de tus materiales asignados.',
    url: '/my-materials',
  });

  const inAppDelivered = results.filter((r) => r.inApp === 'delivered').length;
  const inAppFailed = results.filter((r) => r.inApp === 'failed').length;
  const pushSent = results.filter((r) => r.push === 'sent').length;
  const pushFailed = results.filter((r) => r.push === 'failed').length;
  const noSub = results.filter((r) => r.push === 'no_subscription').length;

  // Record dispatch history with per-channel counts
  await supabase.from('notification_history').insert({
    dispatcher_name: dispatcherName,
    dispatcher_id: dispatcherId,
    user_count: targetUserIds.length,
    recipient_count: results.length,
    sent_count: pushSent,
    failed_count: pushFailed,
    in_app_count: inAppDelivered,
    in_app_failed_count: inAppFailed,
    no_subscription_count: noSub,
  });

  console.log(
    `[Monthly] dispatch done: inApp=${inAppDelivered}/${targetUserIds.length} push_sent=${pushSent} push_failed=${pushFailed} no_sub=${noSub}`,
  );

  return res.status(200).json({
    success: true,
    inApp: inAppDelivered,
    sent: pushSent,
    failed: pushFailed,
    noSubscription: noSub,
    results: results.map((r) => ({
      userId: r.userId,
      inApp: r.inApp,
      push: r.push,
    })),
  });
}
