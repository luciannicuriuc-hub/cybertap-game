export const backendUrl = (import.meta.env.BACKEND_URL ?? import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3000').replace(/\/$/, '');

async function request(path, options = {}) {
  try {
    const response = await fetch(`${backendUrl}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export const api = {
  getUser(telegramId) {
    return request(`/api/user/${telegramId}`);
  },
  getRank(telegramId) {
    return request(`/api/rank/${telegramId}`);
  },
  getLeaderboard(limit = 10) {
    return request(`/api/leaderboard?limit=${limit}`);
  },
  ping() {
    return request('/');
  },
};

export function normalizeUser(source = {}) {
  return {
    telegramId: source.telegram_id ?? source.telegramId ?? source.id ?? null,
    username: source.username ?? 'operator',
    firstName: source.first_name ?? source.firstName ?? 'Operator',
    points: Number(source.points ?? 0),
    totalPoints: Number(source.total_points ?? source.totalPoints ?? source.points ?? 0),
    pointsPerHour: Number(source.points_per_hour ?? source.pointsPerHour ?? 0),
    tapValue: Number(source.tap_value ?? source.tapValue ?? 1),
    criticalChance: Number(source.critical_chance ?? source.criticalChance ?? 0),
    energy: Number(source.energy ?? 0),
    maxEnergy: Number(source.max_energy ?? source.maxEnergy ?? 1000),
    bonusPercent: Number(source.bonus_percent ?? source.bonusPercent ?? 0),
    league: source.league ?? 'Silver',
    rank: Number(source.rank ?? 0),
    referralCount: Number(source.referral_count ?? source.referrerCount ?? 0),
  };
}

export function normalizeLeaderboard(rows = []) {
  return rows.map((entry, index) => ({
    id: entry.telegram_id ?? entry.telegramId ?? index,
    name: entry.first_name ?? entry.firstName ?? entry.username ?? 'Operator',
    points: Number(entry.points ?? entry.total_points ?? 0),
    league: entry.league ?? 'Silver',
  }));
}
