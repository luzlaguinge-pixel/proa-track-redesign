import type { VercelRequest, VercelResponse } from '@vercel/node';

import { dispatchToMany } from '../_lib/dispatchNotification.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userIds, title, body, icon, url } = req.body;

  if (!userIds || !Array.isArray(userIds) || !title || !body) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const results = await dispatchToMany(userIds, { title, body, icon, url });

  const inApp = results.filter((r) => r.inApp === 'delivered').length;
  const sent = results.filter((r) => r.push === 'sent').length;
  const failed = results.filter((r) => r.push === 'failed').length;

  return res.status(200).json({ success: true, inApp, sent, failed });
}
