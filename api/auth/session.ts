import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireUser, setSessionCookie, signSession } from '../_lib/session.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = await requireUser(req);
  if (!user) return res.status(401).json({ user: null });
  // Sliding session: refresh the cookie on every visit so it never expires while active
  const token = await signSession(user);
  setSessionCookie(res, token);
  return res.status(200).json({ user });
}
