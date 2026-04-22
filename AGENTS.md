# proa-track-redesign

This project was scaffolded with `humand-create-app`. These are the mandatory rules and conventions for any work in this codebase. Read them fully before touching code.

---

## Agent Coding Principles

**1. Think Before Coding — Don't assume. Don't hide confusion. Surface tradeoffs.**
- State assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

**2. Simplicity First — Minimum code that solves the problem. Nothing speculative.**
- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- Ask: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

**3. Surgical Changes — Touch only what you must. Clean up only your own mess.**
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken. Match existing style.
- If you notice unrelated dead code, mention it — don't delete it.
- Remove imports/variables/functions that *your* changes made unused, not pre-existing ones.
- Every changed line should trace directly to the user's request.

**4. Goal-Driven Execution — Define success criteria. Loop until verified.**
- Transform tasks into verifiable goals:
  - "Fix the bug" → "Write a test that reproduces it, then make it pass"
  - "Add validation" → "Write tests for invalid inputs, then make them pass"
- For multi-step tasks, state a brief plan with a verify step per item.
- Weak criteria ("make it work") require constant clarification — define what done looks like.

---

## Project-Specific Guidelines

#### Project Context

- Frontend app built on top of the Humand React stack.
- Designed to be operated by non-technical users — follow the communication rules in the "Non-technical Communication" section.
- All structural decisions are encoded here. Do not invent new patterns; if something is missing, ask.

### Stack

- React 18 + TypeScript via Vite.
- `material-hu` (Hugo theme) — UI components.
- React Hook Form + Zod — forms and validation.
- React Router v6 — routing.
- Axios — HTTP client.
- React Query — server state.
- Biome — linter/formatter.

### Folder Structure

```
src/
  assets/       Static assets (images, fonts, icons)
  layouts/      App layouts (DashboardLayout, BlankLayout)
  providers/    React providers (theme, query client, router, etc.)
  pages/        Feature pages, one folder per feature (module architecture)
  services/     API clients and service functions
  theme/        Theme tokens and helpers
api/            Vercel proxy functions for external services
```

- Everything under `src/pages/` follows module-architecture — do NOT create ad-hoc modules.
- File, variable, and symbol names are in English. Only UI strings may be in another language.

### Routing

- Routes live in `src/App.tsx`.
- Use `DashboardLayout` for authenticated pages.
- Use `BlankLayout` for public / single-purpose pages (onboarding, focused tasks).

### Components

- Always use `material-hu`. NEVER import from `@mui/material` directly.
- Layout exceptions allowed from `@material-hu/mui/`: `Stack`, `Typography`, `IconButton`.
- Everything else: `@material-hu/components/design-system/*`.
- Icons: `@material-hu/icons/tabler`.
- Headers: use the `Title` component with `title` + `description`.
- Empty states: use the `StateCard` composed component with `slotProps.title.variant="M"` and `slotProps.avatar.color="default"`.

### Forms

- Always use Form variants: `FormInputClassic`, `FormAutocomplete`, etc. NEVER wire a manual `Controller`.
- Define the Zod schema in a `schema.ts` file next to the form.
- Use `zodResolver` from `@hookform/resolvers/zod`.

### Layers (Drawer / Dialog / Menu)

Mandatory — use hooks, never render these directly:

- Drawer → `useDrawerLayer`
- Dialog → `useDialogLayer`
- Menu → `useMenuLayer`

### Styling

- NEVER hardcode hex colors. Always use `theme.palette.new.*` via `useTheme()`.
- Do NOT assign sub-objects. Reference leaves directly, e.g. `theme.palette.new.text.neutral.default`.
- For radius-L, use the string literal `'16px'`. `theme.shape.borderRadiusL` is not typed; do not rely on it.

### Services & HTTP

- All HTTP goes through the `http` instance in `src/services/axios.ts`.
- One service file per domain: `src/services/<name>.ts`.
- Matching hooks file: `src/services/<name>.hooks.ts`.
- Use React Query for server state.

### React Query

- Single-object syntax only: `useQuery({ queryKey, queryFn })`.
- Query keys live in a factory in the service file (not scattered across components).

### External Services (Proxy Pattern)

External services are ALWAYS called via a Vercel proxy. No direct browser calls to third-party APIs.

- Use a single catch-all file per service: `api/<service>/[...path].ts`. Route to the appropriate handler based on `req.query.path[0]`.
- Shared helpers (clients, types) go in `api/<service>/_lib.ts`. The `_` prefix prevents Vercel from treating it as a route.
- Secrets live in `process.env.*` — NEVER in `VITE_*` env vars (those leak to the client).
- Validate input with Zod inside the proxy.
- Timeouts: 10s with `AbortController`.
- Sanitize errors before returning them to the client.

#### Catch-all route path extraction

Vercel exposes the catch-all segments differently depending on the environment:

- **Production:** `req.query.path` — an array of path segments (e.g. `['users', '42']`)
- **Local dev (`vercel dev`):** `req.query['...path']` — same array but under the spread-syntax key

Always read both and coalesce so the proxy works identically in both environments:

```ts
const segments = (req.query.path ?? req.query['...path']) as string | string[] | undefined
const path = Array.isArray(segments) ? segments.join('/') : (segments ?? '')
```

### Pagination

- **Every list endpoint must be paginated — no exceptions.** This includes dropdowns, filters, and any other UI that shows a collection of records. Never return an unbounded list.
- **Always paginate on the backend.** Never load all records and slice on the frontend.
- **Use cursor-based pagination**, not offset/limit. Offset pagination is unreliable under concurrent writes (rows shift, causing duplicates or gaps).
- Cursor contract:
  - Request: `?cursor=<opaque_string>&pageSize=<n>` (first page omits `cursor`)
  - Response: `{ data: [...], nextCursor: string | null }` — `null` means no more pages
- The cursor is opaque to the client. It encodes whatever the backend needs (e.g. last seen `id`, composite sort key).
- Use `useServerPagination` from `@material-hu/hooks/useServerPagination` on the frontend, passing `nextCursor` to the next query.
- React Query: use `useInfiniteQuery` when appending pages (infinite scroll), `useQuery` when replacing pages (table with explicit navigation).

### Janus Authentication

> Apply this section only if the project needs Google login — which implies using Janus as the auth server.

#### OAuth2 PKCE flow

This project uses OAuth2 Authorization Code + PKCE through Janus (Humand's auth server). The flow is:

```
1. Browser → Janus /oauth2/authorize  (direct, browser navigation)
      ↓ Janus redirects to Google
2. Google login → Janus callback
      ↓ Janus redirects to /callback?code=XXX
3. Browser /callback → Vercel proxy /api/janus/token  (NEVER direct to Janus)
      ↓ Proxy calls Janus /oauth2/token server-to-server
4. Proxy returns { access_token } → stored in sessionStorage
```

#### Why the token exchange MUST go through the proxy

Janus prod does not include `Access-Control-Allow-Origin` for `localhost` origins. A direct browser `fetch()` to `/oauth2/token` is blocked by CORS before it reaches the server — `send: 0ms, wait: 0ms, _error: net::ERR_FAILED`. The Vercel serverless function has no browser CORS restrictions, so it can call Janus freely.

**Rule:** The `/oauth2/authorize` redirect is a browser navigation (no CORS applies). Everything else — especially the token exchange — goes through `api/janus/token.ts`.

#### Environment variables

| Variable | Side | Purpose |
|---|---|---|
| `VITE_JANUS_URL` | Client (VITE_) | Base URL used for the authorize redirect only |
| `VITE_CLIENT_ID` | Client (VITE_) | OAuth2 public client ID |
| `JANUS_URL` | Server (process.env) | Base URL used by the proxy for token exchange |

`JANUS_URL` and `VITE_JANUS_URL` point to the same server but are intentionally separate: `VITE_*` vars are safe to expose (only used in a browser redirect URL), while `JANUS_URL` stays server-side.

### Redash

> Apply this section only if the project uses Redash.

Every Redash query created for this project MUST follow this convention:

- **Name:** `[<project-name>] <Description>` — e.g. `[my-project] Departments - Paginated`
- **Tags:** `<project-name>`, `<VITE_CLIENT_ID value>`

This makes queries searchable and traceable back to the project and its registered client. The project name and client ID are defined in `.env` / `.env.local`.

#### Pagination in Redash queries

Paginated queries MUST use cursor-based pagination, not `OFFSET / LIMIT`.

- Use a `cursor_id` parameter (last seen `id` from the previous page). First page passes `0` or `NULL`.
- Query pattern:
  ```sql
  WHERE (:cursor_id = 0 OR id > :cursor_id)
  ORDER BY id ASC
  LIMIT :page_size
  ```
- Return `nextCursor` as the `id` of the last row in the result set (`NULL` if fewer rows than `page_size` were returned).
- Never return a `totalCount` — it requires a full table scan and is incompatible with cursor pagination.

### Deployment

To deploy to production on Vercel, use the local config file that sets up the correct rewrites for the SPA and API routes:

```bash
npx vercel --local-config ./vercel.prod.json deploy
```

The `vercel.prod.json` file uses a negative-lookahead rewrite: any path that does NOT start with `/api/` is served `index.html` (client-side routing). Vercel handles `/api/*` natively without an explicit rewrite rule.

#### Security gate — required before every commit and deploy

**Before every commit (`git push`):** audit staged changes only:

```
/audit-secrets-diff
```

- Scans only the lines being added in the current diff (`git diff --cached`) — faster and more focused than a full scan.
- If the skill reports **any finding**, do not commit. Unstage the affected files, fix the issue, then re-run the audit.

**Before every deploy (`npx vercel ... deploy`):** full codebase audit:

```
/audit-secrets
```

- Audits all files, not just recent changes.
- If the skill reports **any finding**, do not deploy. Fix every finding first, then re-run the audit.
- **Do NOT deploy until the audit returns clean.**

### Navigation

- Sidebar entries are configured in `SECTIONS` inside `DashboardLayout`.
- Icons from `@material-hu/icons/tabler`.

### Pre-flight Checks

Before implementing anything, verify these files exist:

- `node_modules/material-hu/src/components/design-system/COMPONENTS.md`
- `node_modules/material-hu/src/components/composed-components/COMPONENTS.md`
- `node_modules/material-hu/src/theme/hugo/newTokens.ts`

If any of them is missing, run:

```bash
GITHUB_TOKEN=$(cat ~/.humand/github-token) bun install
```

### Compliance Gate

- ALWAYS produce a Notion plan before writing code.
- NEVER create ad-hoc modules under `src/pages/` without invoking the right skill.
- Before writing code, ALWAYS read the conventions from the `humand-react` plugin:
  - `module-architecture.md`
  - `module-architecture-files.md`
  - `module-architecture-hooks.md`
  - `react.md`
  - `typescript.md`
  - `react-styling.md`
  - `react-query.md`

### Workflow (Mandatory Order)

1. `/pipeline-input-cx` or `/pipeline-input-designer` — collect requirements.
2. `/bootstrap-react-project` — scaffold.
3. `/plan-project` — Notion page with flows. NO code yet.
4. Per screen: `/refine-feature` — break into features.
5. Per feature: `/build-feature` — implement.

Rules baked into the workflow:

- After each feature, do a visual checkpoint: tell the user exactly what changed and where to look.
- After user confirmation, commit with a Spanish, user-visible message (e.g. "Pantalla de lista de pedidos lista").
- After each commit, update Notion.
- At the start of every session, read `git log --oneline -10` and summarize the state to the user.

### Non-technical Communication

This project is operated by non-technical users. Communication rules are strict:

- No tech jargon. Translate:
  - "componente" → "bloque visual"
  - "commit" → "punto de guardado"
  - "error" → "algo no funcionó"
- Terminal instructions must be explicitly numbered, one step at a time.
- NEVER show raw errors or stack traces. Always translate them into plain language.
- One action at a time. Wait for confirmation before the next one.

## PostgREST Integration

- Proxy: `api/postgrest/[...path].ts` — Vercel Edge, read-only. DO NOT modify.
- Client: `src/services/postgrest.ts` — `postgrest.get()`, `postgrest.getOne()`, `postgrest.discover()`.
- Skill: `/postgrest-discovery` — **always runs first** when any feature needs PostgREST data. It checks `.env.local` for the M2M credentials, fetches the OpenAPI spec through the proxy, and only then exposes entities.
- All PostgREST calls go through `/api/postgrest/*` — auth is automatic via the proxy.
- M2M credentials: only `HUMAND_CLIENT_ID` and `HUMAND_CLIENT_SECRET` come from the user's M2M client and go into `.env.local`. The URL defaults (`HUMAND_API_URL=https://api-prod.humand.co` for the Humand main API / Janus, `POSTGREST_BASE_URL=https://views-cx.humand.co` for PostgREST views) are hardcoded and written by the CLI — never prompt the user for them. If the two M2M credentials are missing, create the client at the appropriate landing: Revenue → https://cx-huckathon-landing.vercel.app/build/revenue · Mejora interna → https://cx-huckathon-landing.vercel.app/build/mejora-interna.

### PostgREST — Pagination

PostgREST uses offset-based pagination via query params (the cursor rule in the Pagination section applies to your own API endpoints, not to PostgREST views).

- `limit=<n>` — rows to return.
- `offset=<n>` — rows to skip.
- To get the total row count, send the request header `Prefer: count=planned`. Use `planned` (uses DB statistics, fast) unless you need an exact count — `exact` does a full table scan.
- The response always includes a `Content-Range` header: `0-14/47` means rows 0–14 were returned out of 47 total.

```
GET /api/postgrest/employees?limit=20&offset=40
Prefer: count=planned
→ Content-Range: 40-59/312
```

### PostgREST — Filtering

Syntax: `?column=operator.value`. Multiple params are AND-ed together.

| Operator | Meaning | Example |
|---|---|---|
| `eq` | equal | `?status=eq.active` |
| `neq` | not equal | `?role=neq.admin` |
| `gt` / `gte` | greater than / or equal | `?age=gte.18` |
| `lt` / `lte` | less than / or equal | `?salary=lt.50000` |
| `like` | SQL LIKE (case-sensitive, `*` = wildcard) | `?name=like.Ju*` |
| `ilike` | SQL ILIKE (case-insensitive) | `?email=ilike.*@gmail.com` |
| `in` | value in list | `?id=in.(1,2,3)` |
| `is` | null / boolean check | `?deleted_at=is.null` |
| `not` | negate any operator | `?name=not.eq.admin` |

OR logic — wrap in `or=(...)`:
```
?or=(status.eq.active,status.eq.pending)
```

**Gotcha:** reserved characters (`,` `.` `:` `(` `)`) inside values must be percent-encoded or double-quoted: `?name=eq."O'Brien"`.

### PostgREST — Column Selection

Use `select=col1,col2` to return only the columns you need. Never use `select=*` in production — always be explicit to reduce payload size and prevent leaking sensitive columns.

```
GET /api/postgrest/employees?select=id,name,department,salary
```

You can alias columns in the response:
```
?select=employee_id:id,full_name:name
```

Combine with filters and pagination freely:
```
GET /api/postgrest/employees?select=id,name,salary&department=eq.engineering&limit=20&offset=0
Prefer: count=planned
```

### PostgREST — Resource Embedding (joins)

**Hard rule:** when a request needs data from more than one entity, ALWAYS use resource embedding (`select=parent(child)`). NEVER issue a second round-trip to hydrate related rows — that pattern is **N+1** and it gets worse linearly as the top-level response grows.

Docs: https://docs.postgrest.org/en/v12/references/api/resource_embedding.html

#### Syntax

`select=<cols>,<relation>(<cols>)` — `<relation>` is the name of a related table/view (or a foreign-key column). PostgREST resolves the relationship from the schema's foreign keys.

```
GET /api/postgrest/employees?select=id,name,department(id,name)
```

Works for all cardinalities:

| Relationship | Example |
|---|---|
| Many-to-one (FK on parent) | `/employees?select=name,department(name)` |
| One-to-one (unique FK) | `/employees?select=name,profile(avatar_url)` |
| One-to-many (FK on child) | `/departments?select=name,employees(id,name)` |
| Many-to-many (via junction table) | `/actors?select=name,films(title)` |

#### Nested embedding

Chain embeds arbitrarily deep — each relation keeps its own `select`:

```
GET /api/postgrest/departments?select=name,employees(name,role(title))
```

#### Aliasing embedded resources and columns

Rename an embed or a column in the response:

```
GET /api/postgrest/films?select=title,director:directors(id,last_name:name)
```

Use an alias when the foreign-key name is unclear, when you want client-side naming, or when you need the same relation twice with different filters.

#### Filtering embedded resources

Filters on an embedded relation use dotted paths with the relation name (or alias) as the prefix:

```
GET /api/postgrest/departments?select=name,employees(name,role)&employees.role=eq.manager
```

Embedded filters do NOT remove the parent row — by default embeds are a LEFT JOIN, so departments with no matching manager still come back with `employees: []`.

#### Top-level filtering with `!inner`

To drop parents that have no matching children, mark the embed `!inner`:

```
GET /api/postgrest/films?select=title,actors!inner(first_name,last_name)&actors.first_name=eq.Jehanne
```

Equivalently, `<relation>=not.is.null` on a plain embed performs the same inner-join semantics (`actors=not.is.null` ≡ `actors!inner(*)`). Use whichever reads better.

`<relation>=is.null` performs an anti-join — "only parents with no children":

```
GET /api/postgrest/employees?select=name,manager_assignments()&manager_assignments=is.null
```

#### Disambiguating multiple foreign keys

When two FKs point at the same table (e.g. `orders.billing_address_id` and `orders.shipping_address_id`), name the FK explicitly with `!<fk_name_or_column>`:

```
GET /api/postgrest/addresses?select=name,billing_orders:orders!billing_address_id(name),shipping_orders:orders!shipping_address_id(name)
```

If PostgREST returns HTTP 300 ("multiple relationships found"), that's the error — pick one via the `!hint` form and re-send.

#### Combining with pagination and counts

`limit`, `offset`, and `Prefer: count=planned` still apply to the **top-level** resource. To page an embedded collection, use its dotted filter: `employees.limit=5`, `employees.offset=10`. The top-level `Content-Range` header counts top-level rows only — embedded collections are not paginated globally.

#### Rules for this project

- When the user request spans more than one entity (e.g. "list employees with their department", "orders and their customer"), ALWAYS use embedding in the `select` param. NEVER make a second round-trip to fetch related rows — that is an **N+1** query pattern.
- Pick `!inner` or `=not.is.null` when the caller's intent is "only rows that have the related data". Default (LEFT JOIN) otherwise.
- Add an alias when a column or relation name would look ugly on the frontend or when disambiguating multiple FKs.
- If you ever find yourself writing a `useEffect` / `forEach` / `map` that fires a per-row PostgREST query, STOP — that's N+1. Rewrite the top-level call with embedding instead.
