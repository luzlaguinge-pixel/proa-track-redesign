/**
 * Person lifecycle store — persists termination state in localStorage.
 *
 * Lifecycle states
 * ──────────────────
 *  active          – default; appears in all active views
 *  pending_recovery – baja initiated but materials not yet resolved;
 *                    hidden from active views, visible to admin for recovery
 *  terminated      – fully offboarded; hidden from all active views,
 *                    historical references still resolve with "(baja)" tag
 */

const STORE_KEY = 'proa_person_lifecycle';

export type PersonLifecycleStatus =
  | 'active'
  | 'pending_recovery'
  | 'terminated';

export type PersonLifecycleRecord = {
  status: PersonLifecycleStatus;
  terminatedAt: string;
  /** Display name — used for "(baja)" badge lookups in history views. */
  nombre: string;
  /** Number of materials the person had at the moment the baja was initiated. */
  materialCountAtBaja: number;
};

type LifecycleMap = Record<string, PersonLifecycleRecord>;

// ─── Persistence ─────────────────────────────────────────────────────────────

function readStore(): LifecycleMap {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function writeStore(map: LifecycleMap): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(map));
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

// ─── Reads ────────────────────────────────────────────────────────────────────

export const getLifecycleRecord = (
  id: string,
): PersonLifecycleRecord | null => readStore()[id] ?? null;

export const getLifecycleStatus = (id: string): PersonLifecycleStatus =>
  readStore()[id]?.status ?? 'active';

/** True for both pending_recovery and terminated — use to filter active views. */
export const isExcludedFromActiveViews = (id: string): boolean => {
  const s = getLifecycleStatus(id);
  return s === 'pending_recovery' || s === 'terminated';
};

export const isPendingRecovery = (id: string): boolean =>
  getLifecycleStatus(id) === 'pending_recovery';

export const isTerminated = (id: string): boolean =>
  getLifecycleStatus(id) === 'terminated';

/** All people currently in pending_recovery, with their IDs. */
export const getAllPendingRecovery = (): Array<
  PersonLifecycleRecord & { id: string }
> => {
  const store = readStore();
  return Object.entries(store)
    .filter(([, r]) => r.status === 'pending_recovery')
    .map(([id, r]) => ({ ...r, id }));
};

/**
 * Set of all offboarded person names (pending_recovery + terminated).
 * Used by history views to render "(baja)" badges next to names.
 */
export const getOffboardedNames = (): Set<string> => {
  const store = readStore();
  return new Set(
    Object.values(store)
      .filter(r => r.status !== 'active')
      .map(r => r.nombre),
  );
};

// ─── Writes ───────────────────────────────────────────────────────────────────

export const setLifecycle = (
  id: string,
  status: PersonLifecycleStatus,
  nombre: string,
  materialCountAtBaja = 0,
): void => {
  const store = readStore();
  store[id] = {
    status,
    terminatedAt: new Date().toISOString(),
    nombre,
    materialCountAtBaja,
  };
  writeStore(store);
};

/**
 * Moves a person from pending_recovery → terminated.
 * Called automatically when all their materials are resolved.
 */
export const resolveTermination = (id: string): void => {
  const store = readStore();
  if (store[id]) {
    store[id] = { ...store[id], status: 'terminated' };
    writeStore(store);
  }
};
