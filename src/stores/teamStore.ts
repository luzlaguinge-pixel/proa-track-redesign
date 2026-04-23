// Maps a leader's employeeInternalId → list of navegante employeeInternalIds in their team
const STORAGE_KEY = 'proa-track:teams';

type TeamMap = Record<string, string[]>;

function load(): TeamMap {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as TeamMap) : {};
  } catch {
    return {};
  }
}

function save(map: TeamMap): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

export function getTeamForLeader(leaderDni: string): string[] {
  return load()[leaderDni] ?? [];
}

export function setTeamForLeader(leaderDni: string, memberDnis: string[]): void {
  const map = load();
  map[leaderDni] = memberDnis;
  save(map);
}

export function getAllTeams(): TeamMap {
  return load();
}
