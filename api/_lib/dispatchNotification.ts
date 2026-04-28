import { createClient } from '@supabase/supabase-js';

// ─── Push notification status ──────────────────────────────────────────────
// The in-app channel (Supabase INSERT → bell icon) is the PRIMARY channel.
// Push (VAPID / web-push) is best-effort and fully isolated in its own async
// wrapper — any failure there can never crash the function or affect in-app.
// ─────────────────────────────────────────────────────────────────────────────

export interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
}

export interface DispatchResult {
  userId: string;
  inApp: 'delivered' | 'failed';
  push: 'sent' | 'failed' | 'no_subscription';
  pushSent: number;
  pushFailed: number;
}

function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase env vars not configured');
  return createClient(url, key);
}

// ── Isolated push attempt — runs fire-and-forget, never throws to caller ────
async function attemptPush(
  supabase: ReturnType<typeof getSupabase>,
  userId: string,
  notificationId: string,
  payload: NotificationPayload,
): Promise<'sent' | 'failed' | 'no_subscription'> {
  try {
    const { data: subscriptions } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId);

    if (!subscriptions || subscriptions.length === 0) {
      supabase.from('notifications').update({ push_status: 'no_subscription' }).eq('id', notificationId).then(() => {}, () => {});
      return 'no_subscription';
    }

    // Lazy-load web-push via dynamic import (works in ESM "type":"module" envs)
    // biome-ignore lint/suspicious/noExplicitAny: dynamic import
    let wp: any;
    try {
      const mod = await import('web-push');
      wp = (mod as any).default ?? mod;
    } catch {
      console.warn('[Push] web-push unavailable — skipping push for', userId);
      supabase.from('notifications').update({ push_status: 'failed' }).eq('id', notificationId).then(() => {}, () => {});
      return 'failed';
    }

    const subject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';
    const pub = process.env.VITE_VAPID_PUBLIC_KEY;
    const priv = process.env.VAPID_PRIVATE_KEY;
    if (!pub || !priv) {
      console.warn('[Push] VAPID keys not configured — skipping push for', userId);
      supabase.from('notifications').update({ push_status: 'failed' }).eq('id', notificationId).then(() => {}, () => {});
      return 'failed';
    }

    wp.setVapidDetails(subject, pub, priv);

    const icon = payload.icon ?? '/favicon.svg';
    const url = payload.url ?? '/';
    const pushPayload = JSON.stringify({ title: payload.title, body: payload.body, icon, url });

    let sent = 0;
    let failed = 0;
    const expired: string[] = [];

    await Promise.allSettled(
      subscriptions.map(async (sub: { endpoint: string; p256dh: string; auth: string }) => {
        try {
          await wp.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            pushPayload,
          );
          sent++;
          console.log(`[Push] Sent to ${userId} endpoint=${sub.endpoint.slice(0, 60)}`);
        } catch (err: unknown) {
          const e = err as { statusCode?: number; message?: string };
          console.error(`[Push] Failed for ${userId}: statusCode=${e.statusCode} msg=${e.message}`);
          failed++;
          if (e.statusCode === 410 || e.statusCode === 404) expired.push(sub.endpoint);
        }
      }),
    );

    if (expired.length > 0) {
      supabase.from('push_subscriptions').delete().in('endpoint', expired).then(() => {}, () => {});
    }

    const pushStatus = sent > 0 ? 'sent' : 'failed';
    supabase.from('notifications').update({ push_status: pushStatus }).eq('id', notificationId).then(() => {}, () => {});
    console.log(`[Push] ${userId}: sent=${sent} failed=${failed}`);
    return pushStatus as 'sent' | 'failed';
  } catch (err) {
    console.error(`[Push] Unexpected error for ${userId}:`, (err as Error).message);
    return 'failed';
  }
}

/**
 * Dispatch a notification to a single user.
 * Step 1 (in-app record) always runs and its result is always returned.
 * Step 2 (push) runs fire-and-forget and its result is appended to the return.
 */
export async function dispatchNotification(
  userId: string,
  payload: NotificationPayload,
): Promise<DispatchResult> {
  let supabase: ReturnType<typeof getSupabase>;
  try {
    supabase = getSupabase();
  } catch (err) {
    console.error(`[Dispatch] Supabase not configured:`, (err as Error).message);
    return { userId, inApp: 'failed', push: 'failed', pushSent: 0, pushFailed: 0 };
  }

  const icon = payload.icon ?? '/favicon.svg';
  const url = payload.url ?? '/';

  // ── Step 1: Create in-app record (UNCONDITIONAL, synchronous path) ──────────
  let notificationId: string | null = null;
  try {
    const { data: inserted, error: insertError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: payload.title,
        body: payload.body,
        url,
        icon,
        is_read: false,
        push_status: 'pending',
      })
      .select('id')
      .single();

    if (insertError || !inserted) {
      console.error(`[Dispatch] In-app insert failed for ${userId}:`, insertError?.message);
      return { userId, inApp: 'failed', push: 'failed', pushSent: 0, pushFailed: 0 };
    }

    notificationId = inserted.id as string;
    console.log(`[Dispatch] In-app created for ${userId} id=${notificationId}`);
  } catch (err) {
    console.error(`[Dispatch] In-app insert threw for ${userId}:`, (err as Error).message);
    return { userId, inApp: 'failed', push: 'failed', pushSent: 0, pushFailed: 0 };
  }

  // ── Step 2: Push (fully isolated, cannot affect Step 1 result) ─────────────
  const pushResult = await attemptPush(supabase, userId, notificationId, payload);
  const pushSent = pushResult === 'sent' ? 1 : 0;
  const pushFailed = pushResult === 'failed' ? 1 : 0;

  return { userId, inApp: 'delivered', push: pushResult, pushSent, pushFailed };
}

/**
 * Dispatch the same notification to multiple users in parallel.
 */
export async function dispatchToMany(
  userIds: string[],
  payload: NotificationPayload,
): Promise<DispatchResult[]> {
  const settled = await Promise.allSettled(
    userIds.map((uid) => dispatchNotification(uid, payload)),
  );
  return settled.map((r, i) =>
    r.status === 'fulfilled'
      ? r.value
      : { userId: userIds[i], inApp: 'failed' as const, push: 'failed' as const, pushSent: 0, pushFailed: 0 },
  );
}
