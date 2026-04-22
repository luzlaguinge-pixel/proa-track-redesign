import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setSessionCookie, signSession, type SessionUser } from '../_lib/session.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { employeeInternalId, password } = (req.body ?? {}) as {
    employeeInternalId?: string;
    password?: string;
  };
  if (!employeeInternalId || !password) {
    return res.status(400).json({ error: 'employeeInternalId and password required' });
  }

  const janusUrl = process.env.JANUS_URL;
  const instanceId = process.env.JANUS_INSTANCE_ID;
  if (!janusUrl || !instanceId) {
    return res.status(500).json({ error: 'JANUS_URL or JANUS_INSTANCE_ID not configured' });
  }

  const upstream = await fetch(`${janusUrl}/cx-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      employeeInternalId,
      instanceId: Number(instanceId),
      password,
    }),
  });

  if (!upstream.ok) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const data = (await upstream.json()) as Omit<SessionUser, 'instanceId'> & { instanceId?: number };
  const user: SessionUser = {
    id: data.id,
    employeeInternalId: data.employeeInternalId,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    language: data.language,
    instanceId: data.instanceId ?? Number(instanceId),
  };

  const token = await signSession(user);
  setSessionCookie(res, token);
  return res.status(200).json({ user });
}
