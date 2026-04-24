const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface ApiOptions {
  query?: Record<string, string | number | boolean>;
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
}

async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const url = new URL(`${API_BASE}${path}`);

  if (options.query) {
    for (const [key, value] of Object.entries(options.query)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const fetchOptions: RequestInit = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const res = await fetch(url.toString(), fetchOptions);
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function postgrestQuery<T>(
  table: string,
  options: ApiOptions = {},
): Promise<T[]> {
  return apiFetch<T[]>(`/api/postgrest/${table}`, {
    ...options,
    method: 'GET',
  });
}

export async function postgrestQueryOne<T>(
  table: string,
  id: string,
): Promise<T | null> {
  try {
    const results = await postgrestQuery<T & { id: string }>(table, {
      query: { id: `eq.${id}` },
    });
    return results[0] || null;
  } catch {
    return null;
  }
}

export async function postgrestCreate<T>(
  table: string,
  data: unknown,
): Promise<T> {
  return apiFetch<T>(`/api/postgrest/${table}`, {
    method: 'POST',
    body: data,
  });
}

export async function postgrestUpdate<T>(
  table: string,
  id: string,
  data: unknown,
): Promise<T> {
  return apiFetch<T>(`/api/postgrest/${table}`, {
    method: 'PATCH',
    query: { id: `eq.${id}` },
    body: data,
  });
}

export async function postgrestDelete(
  table: string,
  id: string,
): Promise<void> {
  await apiFetch<void>(`/api/postgrest/${table}`, {
    method: 'DELETE',
    query: { id: `eq.${id}` },
  });
}

export { apiFetch };
