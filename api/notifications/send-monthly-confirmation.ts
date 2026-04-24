import type { VercelRequest, VercelResponse } from '@vercel/node';
import webpush from 'web-push';
import fs from 'fs';
import path from 'path';

interface PushSubscription {
  userId: string;
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
}

interface NotificationHistoryEntry {
  id: string;
  timestamp: string;
  dispatcherName: string;
  dispatcherId: string;
  userCount: number;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
}

const SUBSCRIPTIONS_FILE = path.join(process.cwd(), 'data', 'subscriptions.json');
const NOTIFICATION_HISTORY_FILE = path.join(
  process.cwd(),
  'data',
  'notification-history.json'
);

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@example.com',
  process.env.VITE_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

function getSubscriptions(): PushSubscription[] {
  try {
    if (fs.existsSync(SUBSCRIPTIONS_FILE)) {
      const data = fs.readFileSync(SUBSCRIPTIONS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading subscriptions file:', error);
  }
  return [];
}

function getNotificationHistory(): NotificationHistoryEntry[] {
  try {
    if (fs.existsSync(NOTIFICATION_HISTORY_FILE)) {
      const data = fs.readFileSync(NOTIFICATION_HISTORY_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading notification history:', error);
  }
  return [];
}

function saveNotificationHistory(history: NotificationHistoryEntry[]) {
  try {
    const dir = path.dirname(NOTIFICATION_HISTORY_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(NOTIFICATION_HISTORY_FILE, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error('Error saving notification history:', error);
  }
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { dispatcherName, dispatcherId, userIds } = request.body;

  if (!dispatcherName || !dispatcherId || !Array.isArray(userIds)) {
    return response.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const subscriptions = getSubscriptions();

    // Filter subscriptions for the target users
    const targetSubscriptions = subscriptions.filter(sub =>
      userIds.includes(sub.userId)
    );

    if (targetSubscriptions.length === 0) {
      return response.status(200).json({
        success: true,
        sent: 0,
        failed: 0,
        message: 'No subscriptions found for selected users',
      });
    }

    const title = 'Confirmá tus materiales';
    const body = 'Es momento de confirmar la tenencia de tus materiales asignados';

    const payload = JSON.stringify({
      title,
      body,
      icon: '/logo.png',
      url: '/inventory/monthly-confirmation',
    });

    let sent = 0;
    let failed = 0;
    const failedUserIds: string[] = [];

    await Promise.allSettled(
      targetSubscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(sub.subscription, payload);
          sent++;
        } catch (error) {
          console.error(
            `Error sending monthly confirmation notification to user ${sub.userId}:`,
            error
          );
          failed++;
          failedUserIds.push(sub.userId);

          // Remove invalid subscriptions
          if (
            error instanceof Error &&
            (error.message.includes('410') || error.message.includes('invalid'))
          ) {
            const filtered = subscriptions.filter(
              (s) => s.subscription.endpoint !== sub.subscription.endpoint
            );
            fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(filtered, null, 2));
          }
        }
      })
    );

    // Save to notification history
    const history = getNotificationHistory();
    const entry: NotificationHistoryEntry = {
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      dispatcherName,
      dispatcherId,
      userCount: userIds.length,
      recipientCount: targetSubscriptions.length,
      sentCount: sent,
      failedCount: failed,
    };
    history.push(entry);
    saveNotificationHistory(history);

    return response.status(200).json({
      success: true,
      sent,
      failed,
      failedUserIds: failedCount > 0 ? failedUserIds : undefined,
    });
  } catch (error) {
    console.error('Error sending monthly confirmation notifications:', error);
    return response
      .status(500)
      .json({ error: 'Failed to send notifications' });
  }
}
