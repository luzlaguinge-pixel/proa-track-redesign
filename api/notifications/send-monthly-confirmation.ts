import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

import { dispatchToMany } from '../_lib/dispatchNotification.js';

function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not configured');
  return createClient(url, key);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    return await handleRequest(req, res);
  } catch (err) {
    console.error('[send-monthly] Unhandled error:', (err as Error).message, (err as Error).stack);
    return res.status(500).json({ error: `Unhandled: ${(err as Error).message}` });
  }
}

async function handleRequest(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { dispatcherName, dispatcherId, userIds } = req.body ?? {};

  if (!dispatcherName || !dispatcherId || !Array.isArray(userIds)) {
    return res.status(400).json({ error: 'Missing required fields: dispatcherName, dispatcherId, userIds[]' });
  }

  let supabase: ReturnType<typeof getSupabase>;
  try {
    supabase = getSupabase();
  } catch (err) {
    console.error('[Monthly] Supabase not configured:', (err as Error).message);
    return res.status(500).json({ error: 'Supabase not configured on server' });
  }

  // If the frontend couldn't load the subscriber list (API failure or no subscriptions yet),
  // fall back to querying all subscribed users directly from the DB.
  let targetUserIds: string[] = userIds;
  if (targetUserIds.length === 0) {
    const { data: subs, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('user_id');
    if (subsError) {
      console.error('[Monthly] Failed to fetch fallback subscriptions:', subsError.message);
      return res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }
    const seen = new Set<string>();
    targetUserIds = (subs ?? [])
      .filter((s) => { const dup = seen.has(s.user_id); seen.add(s.user_id); return !dup; })
      .map((s) => s.user_id);
  }

  if (targetUserIds.length === 0) {
    console.log('[Monthly] No recipients found');
    return res.status(200).json({
      success: true,
      sent: 0,
      failed: 0,
      inApp: 0,
      message: 'No recipients found',
    });
  }

  // Dispatch to BOTH channels (in-app unconditional, push best-effort) for every recipient
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
  const { error: historyError } = await supabase.from('notification_history').insert({
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

  if (historyError) {
    console.error('[Monthly] Failed to write notification_history:', historyError.message);
  }

  console.log(
    `[Monthly] dispatch done: inApp=${inAppDelivered}/${targetUserIds.length} inApp_failed=${inAppFailed} push_sent=${pushSent} push_failed=${pushFailed} no_sub=${noSub}`,
  );

  return res.status(200).json({
    success: true,
    inApp: inAppDelivered,
    inAppFailed,
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
