---
name: postgrest-discovery
description: Discover PostgREST entities from the OpenAPI spec (cached locally), generate typed client code, and help users query the API
---

# PostgREST API Discovery

Discover available entities from the PostgREST OpenAPI spec, generate a typed client, and help users build queries.

## Step 1: Verify credentials and load the OpenAPI spec

**This step runs before every other postgrest action in this skill. Never skip it.**

### 1a. Check required credentials and defaults

Two values come from the user's M2M client (they vary per-project):

- `HUMAND_CLIENT_ID`
- `HUMAND_CLIENT_SECRET`

Two values are hardcoded fixed defaults written by the CLI into `.env.local` (they never vary — do NOT ask the user for them):

- `HUMAND_API_URL=https://api-prod.humand.co` (Humand main API / Janus token endpoint)
- `POSTGREST_BASE_URL=https://views-cx.humand.co` (PostgREST views backend)

Confirm all four are present in `.env.local` and that the two M2M credentials are not still at their placeholder values (`your-client-id`, `your-client-secret`). The URLs either match the defaults above or have been intentionally overridden by the user — either way, don't re-prompt for them.

```bash
for key in HUMAND_CLIENT_ID HUMAND_CLIENT_SECRET HUMAND_API_URL POSTGREST_BASE_URL; do
  value=$(grep -E "^${key}=" .env.local 2>/dev/null | head -1 | cut -d= -f2-)
  if [ -z "$value" ]; then
    echo "$key: MISSING"
  elif [ "$value" = "your-client-id" ] || [ "$value" = "your-client-secret" ]; then
    echo "$key: PLACEHOLDER"
  else
    echo "$key: OK"
  fi
done
```

If any M2M credential (`HUMAND_CLIENT_ID` or `HUMAND_CLIENT_SECRET`) is `MISSING` or `PLACEHOLDER`, continue to 1b. If only a URL is missing, write the default value (`https://api-prod.humand.co` for `HUMAND_API_URL`, `https://views-cx.humand.co` for `POSTGREST_BASE_URL`) directly into `.env.local` — do NOT ask the user.

### 1b. If an M2M credential is missing or still a placeholder — STOP and request the user's M2M client

The two URLs are fixed — if they were missing in 1a, you already restored the defaults yourself. The only values that require the user are the two M2M credentials.

Ask the user which kind of app this sandbox is for:

> ¿Este sandbox es para una iniciativa de **Revenue** (consume datos por PostgREST/views-cx) o de **Mejora Interna**?

Then surface the matching creation link and wait for the user to paste credentials:

- **Revenue (PostgREST):** https://cx-huckathon-landing.vercel.app/build/revenue
- **Mejora interna:** https://cx-huckathon-landing.vercel.app/build/mejora-interna

> Creá el M2M client en ese link y pasame:
> - `HUMAND_CLIENT_ID`
> - `HUMAND_CLIENT_SECRET`
>
> Las URLs (`HUMAND_API_URL` y `POSTGREST_BASE_URL`) ya están configuradas con los valores de producción — no las pidas ni las cambies salvo que el usuario explícitamente te diga.

When the user responds, append (or update in place) the two credential values in `.env.local`. Never write them to `.env`, `.env.example`, or any committed file. Never log or echo the `HUMAND_CLIENT_SECRET` value.

Then re-run 1a. If either credential is still `MISSING` or `PLACEHOLDER`, loop. **Do not proceed until both M2M values are real.**

### 1c. Fetch the OpenAPI spec through the local proxy — mandatory

Make sure `bun run dev` + `vercel dev` are running on port 3000. Then always hit the proxy first to confirm the round-trip works:

```bash
mkdir -p .cache
curl -sS -w "%{http_code}\n" -o .cache/openapi.json http://localhost:3000/api/postgrest/
```

Expected: HTTP `200` and `.cache/openapi.json` starts with `{` and contains `"paths"`.

Validate:

```bash
head -c 1 .cache/openapi.json | grep -q '{' && grep -q '"paths"' .cache/openapi.json && echo "OK: OpenAPI spec looks valid"
```

If the curl returns anything other than `200`, or the file is not valid OpenAPI JSON:

- Delete the bad cache: `rm -f .cache/openapi.json`
- Translate the error for the user: "El proxy de PostgREST devolvió un error — revisá que `vercel dev` esté corriendo en 3000 y que los valores de `.env.local` sean correctos. Los valores que tenemos son los que cargaste recién."
- **Stop.** Do not proceed with stale or missing spec data.

### 1d. Cache handling

The `--refresh` flag forces a fresh fetch regardless of cache: when the user passes `--refresh`, delete `.cache/openapi.json` before running 1c. Otherwise, if the cache file is fresh and valid (step 1c's validation passed in this session), you may reuse it on subsequent steps — but step 1c **must have run at least once in this session** before any other postgrest action.

## Step 2: Parse entities from the spec

The OpenAPI spec from PostgREST has this structure:

```json
{
  "paths": {
    "/users": { "get": { ... } },
    "/departments": { "get": { ... } }
  },
  "definitions": {
    "users": {
      "properties": {
        "id": { "format": "integer", "type": "integer" },
        "firstName": { "format": "character varying", "type": "string" }
      }
    }
  }
}
```

For each key in `paths`:
1. Extract the entity name (strip leading `/`, e.g., `/users` -> `users`)
2. Find the matching definition in `definitions`
3. For each property in the definition, map the type:
   - `integer` or format `bigint` -> `number`
   - `string` with format `character varying` or `text` -> `string`
   - `boolean` -> `boolean`
   - format `timestamp with time zone` or `timestamp without time zone` -> `string`
   - format `jsonb` or `json` -> `unknown`
   - Any other -> `string`
4. Note the primary key (usually `id` with type `integer`)

## Step 3: Check and update src/services/postgrest.ts

Read `src/services/postgrest.ts` and look for the merge markers:
- `// === Generated entities (managed by postgrest-discovery skill) ===`
- `// === Exported client (updated when entities change) ===`

**If markers are missing:** Add them. Place the generated entities marker after the `discover()` function. Place the exported client marker before the `export const postgrest` line.

**Compare discovered entities to what's in the file.** For each entity from the spec, check if there's already a `// --- Entity: {Name} ---` section. If any entity is missing, regenerate the entire section between the two markers.

### Generating entity code

For each entity (e.g., path `/users`, definition `users`):

1. Convert entity name to PascalCase for the interface (e.g., `users` -> `User`, `department_roles` -> `DepartmentRole`)
2. Generate an exported interface with all properties and mapped types
3. Generate a list function: `get{PluralName}(params?)` returning `PostgrestListResult<{Name}>`
4. Generate a singular function: `get{Name}(id)` returning `{Name}`

Example output for entity `users`:

```ts
// --- Entity: Users ---

export interface User {
    id: number;
    employeeInternalId: string;
    email: string;
    firstName: string;
    lastName: string;
    status: string;
    instanceId: number;
}

function getUsers(params?: Record<string, string>): Promise<PostgrestListResult<User>> {
    return get<User>('/users', params);
}

function getUser(id: number): Promise<User> {
    return getOne<User>('/users', { id: \`eq.\${id}\` });
}
```

**Update the exported client object** to include all entity functions plus the core `get`, `getOne`, and `discover`:

```ts
// === Exported client (updated when entities change) ===

export const postgrest = {
    get,
    getOne,
    discover,
    getUsers,
    getUser,
    // ... all other entity functions
};
```

## Step 4: Present findings

Tell the user what's available. Example format:

> **PostgREST API — Available entities:**
>
> - **users** — id (number), employeeInternalId (string), email (string), firstName (string), lastName (string), status (string), instanceId (number)
>
> The typed client at `src/services/postgrest.ts` has been updated with functions for all entities.
> Use `postgrest.getUsers()`, `postgrest.getUser(id)`, etc.

Then proceed to help with whatever the user originally asked.

## PostgREST Query Reference

Use this knowledge when helping users write queries or build pages.

### Filtering operators

| Operator | Meaning | Example |
|----------|---------|---------|
| `eq` | Equals | `status=eq.ACTIVE` |
| `neq` | Not equals | `status=neq.DELETED` |
| `gt` | Greater than | `age=gt.18` |
| `gte` | Greater than or equal | `age=gte.18` |
| `lt` | Less than | `age=lt.65` |
| `lte` | Less than or equal | `age=lte.65` |
| `like` | LIKE (case-sensitive, `*` = `%`) | `name=like.*john*` |
| `ilike` | ILIKE (case-insensitive) | `email=ilike.*@example.com` |
| `in` | In list | `status=in.(ACTIVE,INACTIVE)` |
| `is` | IS (null, true, false) | `deletedAt=is.null` |
| `not` | Negate any operator | `status=not.eq.DELETED` |

### Ordering

- Single column: `order=firstName.asc` or `order=createdAt.desc`
- Multiple columns: `order=lastName.asc,firstName.asc`
- Null handling: `order=column.asc.nullslast`

### Pagination

- `limit=N` — max rows to return (server max is 100)
- `offset=N` — skip first N rows
- Response includes `Content-Range` header: `0-19/150` (from-to/total)
- Total may be `*` if count is not available

### Column selection

`select=col1,col2,col3` — only return specified columns. Reduces payload size.

### Singular responses

To fetch a single object (not an array):
- The request must include header: `Accept: application/vnd.pgrst.object+json`
- The `postgrest.getOne()` and entity-specific `get{Entity}()` functions handle this
- PostgREST returns 406 if the query matches zero or multiple rows

### Important: No path-based lookups

PostgREST does NOT support `GET /users/123`. Single-record fetch is:
`GET /users?id=eq.123` with `Accept: application/vnd.pgrst.object+json`

Always use query parameter filtering, never path segments for IDs.

## Rules

- ALWAYS run Step 1 (credential check + OpenAPI fetch) before any other postgrest action in this skill. No exceptions.
- NEVER ask the user for credentials without first showing the correct creation link (Revenue → `https://cx-huckathon-landing.vercel.app/build/revenue`, Internal → `https://cx-huckathon-landing.vercel.app/build/mejora-interna`).
- ALWAYS prefer PostgREST resource embedding (joins via `select=parent(child)`) when a request needs data from more than one entity. NEVER hydrate rows one-by-one with per-row follow-up queries — that's an N+1 pattern and it kills performance and multiplies round-trips.
- ALWAYS use `src/services/postgrest.ts` for API calls. NEVER call external URLs directly.
- When building features or writing application code, NEVER ask for API keys or credentials. Auth is automatic via the BFF proxy.
- NEVER install auth libraries. Auth is handled by the proxy.
- NEVER modify `api/postgrest/[...path].ts`.
- This API is READ-ONLY. Only GET requests are supported.
- All API calls go through `/api/postgrest/*`.
