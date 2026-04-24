import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

// Initialise VAPID lazily inside the function so a missing key never crashes
// the module at load time and surfaces a clear error instead.
let vapidInitialised = false;
function ensureVapid() {
  if (vapidInitialised) return;
  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';
  const pub = process.env.VITE_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) throw new Error('VAPID keys not configured');
  webpush.setVapidDetails(subject, pub, priv);
  vapidInitialised = true;
}

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
  return createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_ANON_KEY!,
  );
}

/**
 * Dispatch a notification to a single user through BOTH channels:
 * 1. In-app record created in DB first (unconditional — always runs)
 * 2. Push delivery attempted to all registered devices (best-effort)
 *
 * If push fails for any reason, the in-app record is NOT rolled back.
 */
export async function dispatchNotification(
  userId: string,
  payload: NotificationPayload,
): Promise<DispatchResult> {
  const supabase = getSupabase();
  const icon = payload.icon ?? '/favicon.svg';
  const url = payload.url ?? '/';

  // ── Step 1: Create in-app notification record (UNCONDITIONAL) ──────────────
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

  const notificationId = inserted.id as string;

  // ── Step 2: Best-effort push delivery ─────────────────────────────────────
  const { data: subscriptions } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', userId);

  if (!subscriptions || subscriptions.length === 0) {
    await supabase
      .from('notifications')
      .update({ push_status: 'no_subscription' })
      .eq('id', notificationId);
    console.log(`[Dispatch] No subscription for ${userId} — in-app delivered, push skipped`);
    return { userId, inApp: 'delivered', push: 'no_subscription', pushSent: 0, pushFailed: 0 };
  }

  ensureVapid();
  const pushPayload = JSON.stringify({ title: payload.title, body: payload.body, icon, url });
  let pushSent = 0;
  let pushFailed = 0;
  const expiredEndpoints: string[] = [];

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          pushPayload,
        );
        pushSent++;
        console.log(`[Dispatch] Push sent to ${userId} endpoint=${sub.endpoint.slice(0, 50)}`);
      } catch (err: unknown) {
        const e = err as { statusCode?: number; message?: string };
        console.error(`[Dispatch] Push failed for ${userId}: ${e.statusCode} ${e.message}`);
        pushFailed++;
        if (e.statusCode === 410 || e.statusCode === 404) {
          expiredEndpoints.push(sub.endpoint);
        }
      }
    }),
  );

  if (expiredEndpoints.length > 0) {
    await supabase.from('push_subscriptions').delete().in('endpoint', expiredEndpoints);
    console.log(`[Dispatch] Removed ${expiredEndpoints.length} expired subscriptions`);
  }

  const pushStatus = pushSent > 0 ? 'sent' : 'failed';
  await supabase
    .from('notifications')
    .update({ push_status: pushStatus })
    .eq('id', notificationId);

  console.log(`[Dispatch] ${userId}: inApp=delivered push=${pushStatus} (sent=${pushSent} failed=${pushFailed})`);
  return { userId, inApp: 'delivered', push: pushStatus, pushSent, pushFailed };
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
