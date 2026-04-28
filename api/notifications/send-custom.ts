import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

import { dispatchToMany } from '../_lib/dispatchNotification.js';

function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not configured');
  return createClient(url, key);
}

/**
 * POST /api/notifications/send-custom
 * Dispatches a custom notification (in-app + push) to a given set of userIds.
 *
 * Body: { userIds: string[], title: string, body: string, url?: string,
 *         dispatcherName?: string, dispatcherId?: string }
 *
 * If userIds is empty, falls back to all users in push_subscriptions.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    return await handleRequest(req, res);
  } catch (err) {
    console.error('[send-custom] Unhandled error:', (err as Error).message, (err as Error).stack);
    return res.status(500).json({ error: `Unhandled: ${(err as Error).message}` });
  }
}

async function handleRequest(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userIds, title, body, url, dispatcherName, dispatcherId } =
    req.body ?? {};

  if (!Array.isArray(userIds) || !title || !body) {
    return res.status(400).json({
      error: 'Missing required fields: userIds[], title, body',
    });
  }

  let supabase: ReturnType<typeof getSupabase>;
  try {
    supabase = getSupabase();
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message });
  }

  let targetIds: string[] = userIds;
  if (targetIds.length === 0) {
    const { data: subs, error: subsError } = await supabase
      .from('push_subscriptions')
      .select('user_id');
    if (subsError) {
      return res.status(500).json({ error: 'Failed to fetch subscriptions' });
    }
    const seen = new Set<string>();
    targetIds = (subs ?? [])
      .filter(s => { const dup = seen.has(s.user_id); seen.add(s.user_id); return !dup; })
      .map(s => s.user_id);
  }

  if (targetIds.length === 0) {
    return res.status(200).json({ success: true, inApp: 0, sent: 0 });
  }

  const results = await dispatchToMany(targetIds, {
    title,
    body,
    url: url ?? '/',
  });

  const inApp = results.filter(r => r.inApp === 'delivered').length;
  const inAppFailed = results.filter(r => r.inApp === 'failed').length;
  const sent = results.filter(r => r.push === 'sent').length;
  const failed = results.filter(r => r.push === 'failed').length;
  const noSub = results.filter(r => r.push === 'no_subscription').length;

  try {
    await supabase.from('notification_history').insert({
      dispatcher_name: dispatcherName ?? 'custom',
      dispatcher_id: dispatcherId ?? 'system',
      user_count: targetIds.length,
      recipient_count: results.length,
      sent_count: sent,
      failed_count: failed,
      in_app_count: inApp,
      in_app_failed_count: inAppFailed,
      no_subscription_count: noSub,
    });
  } catch {
    // History insert failure is non-fatal
  }

  console.log(
    `[Custom] dispatch done: inApp=${inApp}/${targetIds.length} push_sent=${sent} push_failed=${failed} no_sub=${noSub}`,
  );

  return res.status(200).json({
    success: true,
    inApp,
    inAppFailed,
    sent,
    failed,
    noSubscription: noSub,
  });
}
