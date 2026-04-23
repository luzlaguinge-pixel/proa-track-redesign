import type { VercelRequest, VercelResponse } from '@vercel/node';
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

function saveSubscriptions(subscriptions: PushSubscription[]) {
  try {
    const dir = path.dirname(SUBSCRIPTIONS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SUBSCRIPTIONS_FILE, JSON.stringify(subscriptions, null, 2));
  } catch (error) {
    console.error('Error saving subscriptions:', error);
  }
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  // TODO: Validate authentication token from request headers
  // For now, we'll accept requests but in production this should verify JWT/session

  const { subscription } = request.body;

  if (!subscription || !subscription.endpoint) {
    return response.status(400).json({ error: 'Invalid subscription data' });
  }

  try {
    // Get user ID from auth token (placeholder - implement with actual auth)
    const userId = request.headers['x-user-id'] || 'anonymous';

    const subscriptions = getSubscriptions();

    // Remove existing subscription for this user if present
    const filtered = subscriptions.filter(
      (sub) => sub.subscription.endpoint !== subscription.endpoint
    );

    // Add new subscription
    filtered.push({
      userId,
      subscription,
    });

    saveSubscriptions(filtered);

    return response.status(200).json({ success: true });
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return response.status(500).json({ error: 'Failed to save subscription' });
  }
}
