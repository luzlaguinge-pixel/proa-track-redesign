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

const SUBSCRIPTIONS_FILE = path.join(process.cwd(), 'data', 'subscriptions.json');

// Configure web-push with VAPID keys
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

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  // TODO: Verify admin authorization
  // For now, we'll accept requests but in production this should verify admin role

  const { userIds, title, body, icon } = request.body;

  if (!userIds || !Array.isArray(userIds) || !title || !body) {
    return response.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const subscriptions = getSubscriptions();
    const targetSubscriptions = subscriptions.filter((sub) =>
      userIds.includes(sub.userId)
    );

    if (targetSubscriptions.length === 0) {
      return response.status(200).json({
        success: true,
        sent: 0,
        failed: 0,
        message: 'No subscriptions found for specified users',
      });
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: icon || '/logo.png',
      url: '/',
    });

    let sent = 0;
    let failed = 0;

    await Promise.allSettled(
      targetSubscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(sub.subscription, payload);
          sent++;
        } catch (error) {
          console.error('Error sending push notification:', error);
          failed++;

          // Remove subscription if endpoint is no longer valid
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

    return response.status(200).json({
      success: true,
      sent,
      failed,
    });
  } catch (error) {
    console.error('Error sending push notifications:', error);
    return response.status(500).json({ error: 'Failed to send notifications' });
  }
}
