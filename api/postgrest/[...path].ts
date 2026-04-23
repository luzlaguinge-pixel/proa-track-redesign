import type { VercelRequest, VercelResponse } from '@vercel/node'
import axios from 'axios'
import * as dotenv from 'dotenv'
import { join } from 'node:path'
import qs from 'qs'

dotenv.config({ path: join(process.cwd(), '.env.local'), override: true })

// --- Environment ---
const CLIENT_ID = process.env.HUMAND_CLIENT_ID!
const CLIENT_SECRET = process.env.HUMAND_CLIENT_SECRET!
const API_URL = process.env.HUMAND_API_URL!
const POSTGREST_BASE_URL = process.env.POSTGREST_BASE_URL!

// --- Token cache (module-level, survives across warm invocations) ---
let cachedToken: string | null = null
let tokenExpiresAt = 0

async function getToken(): Promise<string> {
  const now = Date.now()
  if (cachedToken && tokenExpiresAt - now > 30_000) {
    return cachedToken
  }

  const { data } = await axios.post(
    `${API_URL}/api/v1/janus/oauth2/token`,
    qs.stringify({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      audience: 'views-cx',
    }),
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
  )

  if (!data.access_token) throw new Error('Token fetch failed: no access_token in response')

  cachedToken = data.access_token
  tokenExpiresAt = now + data.expires_in * 1000
  return cachedToken!
}

// --- Path validation ---
function validatePath(path: string): boolean {
  if (path === '') return true
  return !path.includes('..') && /^[a-zA-Z0-9\-_./@]+$/.test(path)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!CLIENT_ID || !CLIENT_SECRET || !API_URL || !POSTGREST_BASE_URL) {
    return res.status(503).json({ error: 'PostgREST proxy configuration error — check your environment variables' })
  }

  if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method!)) {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const segments = (req.query.path ?? req.query['...path']) as string | string[] | undefined
  const apiPath = Array.isArray(segments) ? segments.join('/') : (segments ?? '')

  if (!validatePath(apiPath)) {
    return res.status(400).json({ error: 'Invalid path' })
  }

  const targetUrl = new URL(`${POSTGREST_BASE_URL}/${apiPath}`)
  for (const [key, value] of Object.entries(req.query)) {
    if (key === 'path' || key === '...path') continue
    if (value !== undefined) {
      targetUrl.searchParams.set(key, Array.isArray(value) ? value[0] : value)
    }
  }

  const forwardHeaders: Record<string, string> = {}
  const clientAccept = req.headers['accept']
  if (clientAccept) {
    forwardHeaders['Accept'] = Array.isArray(clientAccept) ? clientAccept[0] : clientAccept
  }
  if (req.method !== 'GET' && req.headers['content-type']) {
    forwardHeaders['Content-Type'] = req.headers['content-type']
  }

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const token = await getToken()
      forwardHeaders['Authorization'] = `Bearer ${token}`

      const axiosConfig = {
        headers: forwardHeaders,
        validateStatus: () => true,
      }

      let upstream
      if (req.method === 'GET') {
        upstream = await axios.get(targetUrl.toString(), axiosConfig)
      } else if (req.method === 'POST') {
        upstream = await axios.post(targetUrl.toString(), req.body, axiosConfig)
      } else if (req.method === 'PUT') {
        upstream = await axios.put(targetUrl.toString(), req.body, axiosConfig)
      } else if (req.method === 'PATCH') {
        upstream = await axios.patch(targetUrl.toString(), req.body, axiosConfig)
      } else if (req.method === 'DELETE') {
        upstream = await axios.delete(targetUrl.toString(), axiosConfig)
      } else {
        return res.status(405).json({ error: 'Method not allowed' })
      }

      if (upstream.status === 401 && attempt === 0) {
        cachedToken = null
        continue
      }

      const contentRange = upstream.headers['content-range']
      if (contentRange) {
        res.setHeader('Content-Range', contentRange)
      }
      res.setHeader('Content-Type', upstream.headers['content-type'] || 'application/json')
      return res.status(upstream.status).send(
        typeof upstream.data === 'string' ? upstream.data : JSON.stringify(upstream.data),
      )
    } catch (error) {
      const msg = (error as Error).message
      console.error(`[postgrest proxy] attempt=${attempt} error=${msg}`)
      if (attempt === 0 && msg.includes('Token fetch failed')) {
        return res.status(503).json({ error: 'PostgREST proxy configuration error — check your environment variables' })
      }
      return res.status(502).json({ error: 'Unable to reach PostgREST service' })
    }
  }

  return res.status(502).json({ error: 'Authentication failed' })
}
