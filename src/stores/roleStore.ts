import { type Perfil } from '../providers/ProfileContext';

const STORAGE_KEY = 'proa-track:roles';

// Seed admins — always admin, cannot be demoted via the UI
export const SEED_ADMINS = new Set([
  'pavila@proaconsulting.com.ar',
  'luz.laguinge@humand.co',
  '39035048',
]);

type RoleMap = Record<string, Perfil>;

function load(): RoleMap {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as RoleMap) : {};
  } catch {
    return {};
  }
}

function save(map: RoleMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

export function getRoleForId(employeeInternalId: string): Perfil {
  if (SEED_ADMINS.has(employeeInternalId)) return 'admin';
  const map = load();
  return map[employeeInternalId] ?? 'navegante';
}

export function setRoleForId(employeeInternalId: string, role: Perfil): void {
  if (SEED_ADMINS.has(employeeInternalId)) return; // seed admins are immutable
  const map = load();
  map[employeeInternalId] = role;
  save(map);
}

export function getAllStoredRoles(): RoleMap {
  return load();
}
