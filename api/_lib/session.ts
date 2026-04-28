import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE = 'hu_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

export type SessionUser = {
  id: number;
  employeeInternalId: string;
  firstName: string;
  lastName: string;
  email: string;
  language?: string;
  instanceId: number;
};

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET missing or shorter than 32 chars');
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(user: SessionUser): Promise<string> {
  return new SignJWT({ user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecret());
}

export async function verifySession(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return (payload as { user: SessionUser }).user ?? null;
  } catch {
    return null;
  }
}

export function parseCookies(header: string | undefined): Record<string, string> {
  if (!header) return {};
  return Object.fromEntries(
    header.split(';').map((c) => {
      const [k, ...v] = c.trim().split('=');
      return [k, decodeURIComponent(v.join('='))];
    }),
  );
}

function cookie(name: string, value: string, maxAge: number) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
  ];
  if (process.env.NODE_ENV === 'production') parts.push('Secure');
  return parts.join('; ');
}

export function setSessionCookie(res: VercelResponse, token: string) {
  res.setHeader('Set-Cookie', cookie(SESSION_COOKIE, token, SESSION_TTL_SECONDS));
}

export function clearSessionCookie(res: VercelResponse) {
  res.setHeader('Set-Cookie', cookie(SESSION_COOKIE, '', 0));
}

export async function requireUser(req: VercelRequest): Promise<SessionUser | null> {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[SESSION_COOKIE];
  if (!token) return null;
  return verifySession(token);
}
