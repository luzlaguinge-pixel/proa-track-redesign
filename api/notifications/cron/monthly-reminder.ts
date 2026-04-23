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

function isValidCronRequest(request: VercelRequest): boolean {
  // Verify Vercel cron authorization header
  const authHeader = request.headers.authorization;
  return authHeader === `Bearer ${process.env.CRON_SECRET}`;
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  // Verify Vercel cron authorization
  if (!isValidCronRequest(request)) {
    return response.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const subscriptions = getSubscriptions();

    if (subscriptions.length === 0) {
      return response.status(200).json({
        success: true,
        sent: 0,
        message: 'No subscriptions to send to',
      });
    }

    const payload = JSON.stringify({
      title: 'Confirmación de tenencia de materiales',
      body: 'Es momento de confirmar que tenés los materiales en tu poder. Por favor, accedé a la aplicación para completar la confirmación.',
      icon: '/logo.png',
      url: '/my-materials',
    });

    let sent = 0;

    await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(sub.subscription, payload);
          sent++;
        } catch (error) {
          console.error('Error sending monthly reminder:', error);

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
      total: subscriptions.length,
    });
  } catch (error) {
    console.error('Error in monthly reminder cron:', error);
    return response.status(500).json({ error: 'Cron job failed' });
  }
}
