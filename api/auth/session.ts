import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireUser } from '../_lib/session.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await requireUser(req);
  if (!user) return res.status(401).json({ user: null });
  return res.status(200).json({ user });
}
