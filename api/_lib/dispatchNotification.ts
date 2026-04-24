import { createClient } from '@supabase/supabase-js';

// ─── Push notification status ──────────────────────────────────────────────
// TODO: Push notifications (web-push / APNs) are NOT reliably working in this
// deployment. Multiple root causes were investigated:
//   1. The web-push module had module-level import issues on Vercel Lambda
//      (fixed by lazy require() below, but push delivery still unverified)
//   2. iOS Safari requires the app to be "Added to Home Screen" as a PWA
//      for Web Push to be delivered — plain Safari browser sessions drop
//      all push silently
//   3. We could not confirm end-to-end delivery without Vercel log access
//      (403 on runtime logs due to SAML scope restrictions on the team)
//
// The in-app channel (Supabase INSERT → bell icon) is the PRIMARY channel
// and MUST work reliably — see the guaranteed Step 1 below.
// A developer with deeper PWA/push experience should revisit push later.
// ─────────────────────────────────────────────────────────────────────────────

// web-push is loaded lazily with require() so that any load-time failure
// (native crypto bindings, bundler issue, missing key) cannot crash the module
// or kill the in-app record creation — the two channels are fully independent.
// biome-ignore lint/suspicious/noExplicitAny: dynamic require with runtime safety
let webpushModule: any = null;
let webpushLoadError: string | null = null;

function loadWebPush() {
  if (webpushModule !== null) return webpushModule;
  if (webpushLoadError !== null) throw new Error(webpushLoadError);
  try {
    // biome-ignore lint/security/noCommonJs: intentional lazy require to isolate failures
    webpushModule = require('web-push');
    return webpushModule;
  } catch (err) {
    webpushLoadError = `web-push load failed: ${(err as Error).message}`;
    console.error('[Dispatch] web-push module failed to load:', (err as Error).message);
    throw new Error(webpushLoadError);
  }
}

let vapidInitialised = false;
function ensureVapid() {
  if (vapidInitialised) return;
  const wp = loadWebPush();
  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';
  const pub = process.env.VITE_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) throw new Error('VAPID keys not configured');
  wp.setVapidDetails(subject, pub, priv);
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
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Supabase env vars not configured');
  return createClient(url, key);
}

/**
 * Dispatch a notification to a single user through BOTH channels:
 * 1. In-app record created in DB first (unconditional — always runs)
 * 2. Push delivery attempted to all registered devices (best-effort, isolated)
 *
 * If push fails for any reason, the in-app record is NOT rolled back.
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

  // ── Step 1: Create in-app notification record (UNCONDITIONAL) ──────────────
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
    console.log(`[Dispatch] In-app record created for ${userId} id=${notificationId}`);
  } catch (err) {
    console.error(`[Dispatch] In-app insert threw for ${userId}:`, (err as Error).message);
    return { userId, inApp: 'failed', push: 'failed', pushSent: 0, pushFailed: 0 };
  }

  // ── Step 2: Best-effort push delivery (isolated, cannot affect in-app) ─────
  try {
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
    const wp = loadWebPush();
    const pushPayload = JSON.stringify({ title: payload.title, body: payload.body, icon, url });
    let pushSent = 0;
    let pushFailed = 0;
    const expiredEndpoints: string[] = [];

    await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await wp.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            pushPayload,
          );
          pushSent++;
          console.log(`[Dispatch] Push sent to ${userId} endpoint=${sub.endpoint.slice(0, 60)}`);
        } catch (err: unknown) {
          const e = err as { statusCode?: number; message?: string };
          console.error(`[Dispatch] Push failed for ${userId}: statusCode=${e.statusCode} msg=${e.message}`);
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
  } catch (pushErr) {
    // Push channel completely failed — but in-app was already written
    console.error(`[Dispatch] Push channel failed for ${userId}:`, (pushErr as Error).message);
    await supabase
      .from('notifications')
      .update({ push_status: 'failed' })
      .eq('id', notificationId)
      .catch(() => {});
    return { userId, inApp: 'delivered', push: 'failed', pushSent: 0, pushFailed: 1 };
  }
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
