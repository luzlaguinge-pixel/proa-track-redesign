import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

import { dispatchToMany } from '../../_lib/dispatchNotification.js';

function isValidCronRequest(req: VercelRequest): boolean {
  const auth = req.headers.authorization;
  return auth === `Bearer ${process.env.CRON_SECRET}`;
}

/**
 * GET /api/notifications/cron/monthly-reminder
 * Runs on the 1st of each month at 08:00 UTC (configured in vercel.json).
 * Dispatches the monthly material-confirmation reminder to every subscribed user
 * through BOTH channels: in-app record (unconditional) + push (best-effort).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isValidCronRequest(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!,
  );

  // Collect every unique user_id that has at least one active push subscription.
  // dispatchNotification handles the no_subscription case gracefully — in-app is
  // always created regardless, so even if a subscription disappears between here
  // and push delivery the user still gets the bell-icon notification.
  const { data: subs, error: subsError } = await supabase
    .from('push_subscriptions')
    .select('user_id');

  if (subsError) {
    console.error('[Cron] Failed to fetch subscriptions:', subsError.message);
    return res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }

  const seen = new Set<string>();
  const userIds = (subs ?? [])
    .filter((s) => {
      if (seen.has(s.user_id)) return false;
      seen.add(s.user_id);
      return true;
    })
    .map((s) => s.user_id);

  if (userIds.length === 0) {
    console.log('[Cron] No subscriptions — skipping dispatch');
    return res.status(200).json({ success: true, inApp: 0, sent: 0, message: 'No subscriptions' });
  }

  // Dispatch through BOTH channels for every user
  const results = await dispatchToMany(userIds, {
    title: 'Confirmá tus materiales',
    body: 'Es momento de confirmar la tenencia de tus materiales asignados.',
    url: '/my-materials',
  });

  const inApp = results.filter((r) => r.inApp === 'delivered').length;
  const inAppFailed = results.filter((r) => r.inApp === 'failed').length;
  const sent = results.filter((r) => r.push === 'sent').length;
  const failed = results.filter((r) => r.push === 'failed').length;
  const noSub = results.filter((r) => r.push === 'no_subscription').length;

  // Record in dispatch history
  await supabase.from('notification_history').insert({
    dispatcher_name: 'cron/monthly-reminder',
    dispatcher_id: 'system',
    user_count: userIds.length,
    recipient_count: results.length,
    sent_count: sent,
    failed_count: failed,
    in_app_count: inApp,
    in_app_failed_count: inAppFailed,
    no_subscription_count: noSub,
  });

  console.log(
    `[Cron] monthly-reminder done: inApp=${inApp}/${userIds.length} push_sent=${sent} push_failed=${failed} no_sub=${noSub}`,
  );

  return res.status(200).json({
    success: true,
    inApp,
    inAppFailed,
    sent,
    failed,
    noSubscription: noSub,
    results: results.map((r) => ({ userId: r.userId, inApp: r.inApp, push: r.push })),
  });
}
