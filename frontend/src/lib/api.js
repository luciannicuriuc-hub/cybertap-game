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
      let errorMessage = `Request failed with status ${response.status}`;
      let errorDetails = null;

      try {
        const errorData = await response.json();
        errorMessage = errorData?.error || errorMessage;
        errorDetails = errorData || null;
      } catch (parseError) {
        void parseError;
      }

      return {
        ok: false,
        error: errorMessage,
        details: errorDetails,
      };
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
  ping() {
    return request('/api/health');
  },
  getBotInfo() {
    return request('/api/botinfo');
  },
  walletChallenge(telegramId) {
    return request(`/api/wallet/challenge/${telegramId}`);
  },
  walletStatus(telegramId) {
    return request(`/api/wallet/status/${telegramId}`);
  },
  walletVerify(telegramId, walletAddress, signature) {
    return request('/api/wallet/verify', {
      method: 'POST',
      body: JSON.stringify({ telegramId, walletAddress, signature }),
    });
  },
  walletClaim(telegramId) {
    return request('/api/wallet/claim', {
      method: 'POST',
      body: JSON.stringify({ telegramId }),
    });
  },
  getUser(telegramId) {
    return request(`/api/user/${telegramId}`);
  },
  getRank(telegramId) {
    return request(`/api/rank/${telegramId}`);
  },
  getLeaderboard(limit = 10) {
    return request(`/api/leaderboard?limit=${limit}`);
  },
  tap(telegramId, taps, tapValue) {
    return request('/api/tap', {
      method: 'POST',
      body: JSON.stringify({ telegramId, taps, tapValue }),
    });
  },
  collect(telegramId) {
    return request('/api/collect', {
      method: 'POST',
      body: JSON.stringify({ telegramId }),
    });
  },
  upgrade(telegramId, upgradeId) {
    return request('/api/upgrade', {
      method: 'POST',
      body: JSON.stringify({ telegramId, upgradeId }),
    });
  },
  daily(telegramId) {
    return request('/api/daily', {
      method: 'POST',
      body: JSON.stringify({ telegramId }),
    });
  },
  wheelSpin(telegramId, reward, points, special) {
    return request('/api/wheel_spin', {
      method: 'POST',
      body: JSON.stringify({ telegramId, reward, points, special }),
    });
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
    walletAddress: source.wallet_address ?? source.walletAddress ?? null,
    walletVerifiedAt: Number(source.wallet_verified_at ?? source.walletVerifiedAt ?? 0),
    revenueEarnedLamports: Number(source.revenue_earned_lamports ?? source.revenueEarnedLamports ?? 0),
    revenueClaimedLamports: Number(source.revenue_claimed_lamports ?? source.revenueClaimedLamports ?? 0),
    walletClaimCount: Number(source.wallet_claim_count ?? source.walletClaimCount ?? 0),
    walletLastClaimAmountLamports: Number(source.wallet_last_claim_amount_lamports ?? source.walletLastClaimAmountLamports ?? 0),
    revenueLastClaimAt: Number(source.revenue_last_claim_at ?? source.revenueLastClaimAt ?? 0),
    revenueLastClaimSignature: source.revenue_last_claim_signature ?? source.revenueLastClaimSignature ?? null,
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
