// === Core infrastructure (NEVER modified by postgrest-discovery skill) ===

import axios from 'axios';

const http = axios.create({
  baseURL: '/api/postgrest',
});

// --- Types ---

export interface PostgrestListResult<T> {
  data: T[];
  contentRange: string | null;
}

export interface EntityField {
  name: string;
  tsType: 'string' | 'number' | 'boolean' | 'unknown';
  pgFormat: string;
}

export interface EntityMeta {
  name: string;
  path: string;
  fields: EntityField[];
  primaryKey: string | null;
}

// --- Generic client functions ---

async function get<T>(
  path: string,
  params?: Record<string, string>,
): Promise<PostgrestListResult<T>> {
  const response = await http.get<T[]>(path, { params });
  return {
    data: response.data,
    contentRange: response.headers['content-range'] ?? null,
  };
}

async function getOne<T>(
  path: string,
  params?: Record<string, string>,
): Promise<T> {
  const response = await http.get<T>(path, {
    params,
    headers: { Accept: 'application/vnd.pgrst.object+json' },
  });
  return response.data;
}

// --- Discovery (runtime OpenAPI introspection) ---

const PG_TYPE_MAP: Record<string, EntityField['tsType']> = {
  integer: 'number',
  bigint: 'number',
  'character varying': 'string',
  text: 'string',
  boolean: 'boolean',
  'timestamp with time zone': 'string',
  'timestamp without time zone': 'string',
  jsonb: 'unknown',
  json: 'unknown',
};

function mapPgType(
  format: string | undefined,
  type: string | undefined,
): EntityField['tsType'] {
  if (format && PG_TYPE_MAP[format] !== undefined) return PG_TYPE_MAP[format];
  if (type === 'integer' || type === 'number') return 'number';
  if (type === 'boolean') return 'boolean';
  return 'string';
}

export async function discover(): Promise<EntityMeta[]> {
  const response = await http.get('/');
  const spec = response.data;

  const paths = spec.paths ?? {};
  const definitions = spec.definitions ?? {};
  const entities: EntityMeta[] = [];

  for (const pathKey of Object.keys(paths)) {
    const entityName = pathKey.replace(/^\//, '');
    if (!entityName) continue;

    const definition = definitions[entityName];
    if (!definition?.properties) continue;

    const fields: EntityField[] = [];
    let primaryKey: string | null = null;

    for (const [fieldName, fieldDef] of Object.entries<Record<string, string>>(
      definition.properties,
    )) {
      const pgFormat = fieldDef.format ?? fieldDef.type ?? 'unknown';
      const tsType = mapPgType(fieldDef.format, fieldDef.type);

      fields.push({ name: fieldName, tsType, pgFormat });

      if (fieldName === 'id' && tsType === 'number' && !primaryKey) {
        primaryKey = 'id';
      }
    }

    if (!primaryKey) {
      const firstNumberField = fields.find(f => f.tsType === 'number');
      if (firstNumberField) primaryKey = firstNumberField.name;
    }

    entities.push({
      name: entityName,
      path: pathKey,
      fields,
      primaryKey,
    });
  }

  return entities;
}

// === Generated entities (managed by postgrest-discovery skill) ===

// === Exported client (updated when entities change) ===

export const postgrest = {
  get,
  getOne,
  discover,
};
