/**
 * Person lifecycle store — persists lifecycle state in localStorage.
 *
 * Lifecycle states
 * ──────────────────
 *  active          – default; appears in all active views
 *  on_leave        – temporarily absent (licencia); still appears in all active
 *                    views but flagged with a "licencia" badge; can still receive
 *                    material assignments
 *  pending_recovery – baja initiated but materials not yet resolved;
 *                    hidden from active views, visible to admin for recovery
 *  terminated      – fully offboarded; hidden from all active views,
 *                    historical references still resolve with "(baja)" tag
 *
 * Transitions
 * ──────────────────
 *  active          → on_leave        (manual, via "Poner en licencia")
 *  on_leave        → active          (manual, via "Volver de licencia")
 *  active          → pending_recovery (automatic when baja is initiated with materials)
 *  active          → terminated      (automatic when baja is initiated with 0 materials)
 *  on_leave        → pending_recovery (same baja flow)
 *  pending_recovery → terminated     (automatic when all materials are resolved)
 */

const STORE_KEY = 'proa_person_lifecycle';

export type PersonLifecycleStatus =
  | 'active'
  | 'on_leave'
  | 'pending_recovery'
  | 'terminated';

export type PersonLifecycleRecord = {
  status: PersonLifecycleStatus;
  /** ISO timestamp of the last status change. */
  terminatedAt: string;
  /** Display name — used for "(baja)" badge lookups in history views. */
  nombre: string;
  /** Number of materials the person had at the moment the baja was initiated. */
  materialCountAtBaja: number;
  /**
   * The configured last working day (ISO date string, e.g. "2026-05-15").
   * When set and the date passes while the person is still pending_recovery,
   * the dashboard escalates this as a high-priority alert.
   */
  lastDay?: string;
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

/**
 * True for pending_recovery and terminated only.
 * on_leave is NOT excluded — those people are temporarily absent but still active.
 */
export const isExcludedFromActiveViews = (id: string): boolean => {
  const s = getLifecycleStatus(id);
  return s === 'pending_recovery' || s === 'terminated';
};

export const isOnLeave = (id: string): boolean =>
  getLifecycleStatus(id) === 'on_leave';

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
 * All people in pending_recovery whose configured lastDay has already passed.
 * Used to generate high-priority escalation alerts on the dashboard.
 */
export const getOverduePendingRecovery = (): Array<
  PersonLifecycleRecord & { id: string }
> => {
  const today = new Date().toISOString().slice(0, 10);
  return getAllPendingRecovery().filter(r => !!r.lastDay && r.lastDay < today);
};

/**
 * Set of all offboarded person names (pending_recovery + terminated).
 * Used by history views to render "(baja)" badges next to names.
 */
export const getOffboardedNames = (): Set<string> => {
  const store = readStore();
  return new Set(
    Object.values(store)
      .filter(r => r.status !== 'active' && r.status !== 'on_leave')
      .map(r => r.nombre),
  );
};

// ─── Writes ───────────────────────────────────────────────────────────────────

/**
 * Set lifecycle status for a person. Pass lastDay (ISO "YYYY-MM-DD") when
 * initiating baja so the dashboard can escalate if the date passes.
 */
export const setLifecycle = (
  id: string,
  status: PersonLifecycleStatus,
  nombre: string,
  materialCountAtBaja = 0,
  lastDay?: string,
): void => {
  const store = readStore();
  store[id] = {
    status,
    terminatedAt: new Date().toISOString(),
    nombre,
    materialCountAtBaja,
    ...(lastDay ? { lastDay } : {}),
  };
  writeStore(store);
};

/**
 * Revert a person to active state (e.g., returning from on_leave).
 * Removes their record from the store entirely.
 */
export const setActive = (id: string): void => {
  const store = readStore();
  delete store[id];
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
