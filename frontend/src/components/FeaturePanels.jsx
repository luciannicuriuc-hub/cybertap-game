import { useEffect, useState } from 'react';
import { api } from '../lib/api';

const LAMPORTS_PER_SOL = 1000000000;

function formatNumber(num) {
  const value = Math.floor(Number(num) || 0);
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return `${value}`;
}

function formatTokenAmount(amount, decimals = 9) {
  const value = Number(amount) || 0;
  if (!Number.isFinite(value) || value === 0) return '0';
  const denom = Math.pow(10, decimals);
  const display = value / denom;
  if (display >= 1) return display.toFixed(3);
  return display.toFixed(Math.min(6, decimals));
}

function CountdownBadge({ until }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const remaining = Math.max(0, until - now);
  const days = Math.floor(remaining / (24 * 3600 * 1000));
  const hours = Math.floor((remaining % (24 * 3600 * 1000)) / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  const label = days > 0 ? `${days}d ${hours}h` : hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m ${seconds}s`;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-black bg-black text-[#FFD200] px-2 py-1 rounded-full border-2 border-[#FFD200]">
      ⏳ {label}
    </span>
  );
}

// ---------------------- LEADERBOARD W/ PRIZES ----------------------
export function PrizeLeaderboardPanel({ telegramId, leagueGroup = 'global' }) {
  const [season, setSeason] = useState(null);
  const [prizes, setPrizes] = useState([]);
  const [rows, setRows] = useState([]);
  const [rank, setRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [seasonResp, lbResp, rankResp] = await Promise.all([
        api.getSeason(),
        api.getSeasonLeaderboard(leagueGroup, 100),
        telegramId ? api.getSeasonRank(telegramId, leagueGroup) : Promise.resolve({ ok: true, data: { rank: null } }),
      ]);
      if (cancelled) return;
      setSeason(seasonResp.ok ? seasonResp.data?.season : null);
      setPrizes(seasonResp.ok ? seasonResp.data?.prizes || [] : []);
      setRows(lbResp.ok ? lbResp.data?.rows || [] : []);
      setRank(rankResp.ok ? rankResp.data?.rank : null);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [telegramId, leagueGroup]);

  if (loading) return <p className="text-center text-slate-400">Loading season…</p>;
  if (!season) return <p className="text-center text-slate-400">No active season.</p>;

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-primary-container/30 border-2 border-black rounded-xl p-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase opacity-70">Current Season</p>
          <p className="font-black">{season.name}</p>
        </div>
        <CountdownBadge until={Number(season.ends_at)} />
      </div>

      <div className="bg-slate-900 border-2 border-black rounded-xl p-3">
        <p className="text-[10px] font-black uppercase opacity-70 mb-2">🎁 Prize Pool</p>
        <div className="space-y-1">
          {prizes.map((prize) => (
            <div key={prize.id} className="flex items-center justify-between text-sm">
              <span className="font-bold">#{prize.rank_min}{prize.rank_max !== prize.rank_min ? `–${prize.rank_max}` : ''}</span>
              <span className="text-[#FFD200] font-black">{prize.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 border-2 border-black rounded-xl p-3 max-h-64 overflow-y-auto">
        <p className="text-[10px] font-black uppercase opacity-70 mb-2">Live Ranking</p>
        {rows.length === 0 ? (
          <p className="text-slate-500 text-sm">No scores yet — start tapping!</p>
        ) : rows.slice(0, 50).map((row, idx) => (
          <div key={row.telegram_id} className={`flex items-center justify-between py-1 ${row.telegram_id === telegramId ? 'bg-primary-container/30 rounded' : ''}`}>
            <span className="text-sm font-black w-8">{idx + 1}</span>
            <span className="flex-1 truncate text-sm">{row.first_name || row.username || 'Anon'}</span>
            <span className="text-[#FFD200] font-black text-sm">{formatNumber(row.points)}</span>
          </div>
        ))}
      </div>

      {rank ? (
        <p className="text-center text-sm">Your rank: <span className="font-black text-[#FFD200]">#{rank}</span></p>
      ) : null}
    </div>
  );
}

// ---------------------- TOURNAMENTS ----------------------
export function TournamentsPanel({ telegramId, onAction }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null);

  async function refresh() {
    setLoading(true);
    const resp = await api.listTournaments();
    setItems(resp.ok ? resp.data : []);
    setLoading(false);
  }

  useEffect(() => { refresh(); }, []);

  async function join(id) {
    if (!telegramId) return;
    setJoining(id);
    const resp = await api.joinTournament(telegramId, id);
    if (resp.ok) {
      onAction?.('✅', resp.data.alreadyJoined ? 'Already joined' : 'Joined!');
      refresh();
    } else {
      onAction?.('⚠️', resp.error || 'Could not join');
    }
    setJoining(null);
  }

  if (loading) return <p className="text-center text-slate-400">Loading tournaments…</p>;
  if (items.length === 0) return <p className="text-center text-slate-400">No tournaments yet.</p>;

  return (
    <div className="flex flex-col gap-3">
      {items.map((t) => (
        <div key={t.id} className="bg-slate-900 border-2 border-black rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{t.icon}</span>
              <div>
                <p className="font-black">{t.name}</p>
                <p className="text-[10px] opacity-60 uppercase">{t.metric} · {t.status}</p>
              </div>
            </div>
            {t.status === 'active' ? <CountdownBadge until={Number(t.ends_at)} /> : null}
          </div>
          <p className="text-xs text-slate-400">{t.description}</p>
          <div className="flex items-center justify-between text-xs">
            <span>Entry: <span className="font-black text-white">{Number(t.entry_points) > 0 ? `${formatNumber(t.entry_points)} pts` : 'Free'}</span></span>
            <span>Prize: <span className="font-black text-[#FFD200]">{formatTokenAmount(t.prize_pool, 9)} {String(t.prize_token || '').toUpperCase()}</span></span>
          </div>
          <button
            type="button"
            disabled={joining === t.id || t.status !== 'active'}
            onClick={() => join(t.id)}
            className="bg-[#FFD200] text-black font-black py-2 rounded-lg border-2 border-black active:scale-95 disabled:opacity-50"
          >
            {joining === t.id ? 'Joining…' : t.status === 'active' ? 'JOIN' : 'CLOSED'}
          </button>
        </div>
      ))}
    </div>
  );
}

// ---------------------- FOLLOW MISSIONS ----------------------
export function FollowMissionsPanel({ telegramId, onAction }) {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  async function refresh() {
    if (!telegramId) return;
    setLoading(true);
    const resp = await api.listFollowMissions(telegramId);
    setMissions(resp.ok ? resp.data : []);
    setLoading(false);
  }

  useEffect(() => { refresh(); }, [telegramId]);

  function buildHref(m) {
    if (m.platform === 'telegram') return `https://t.me/${String(m.target).replace(/^@/, '')}`;
    if (m.platform === 'x') return `https://x.com/${String(m.target).replace(/^@/, '')}`;
    if (m.platform === 'youtube') return `https://youtube.com/${String(m.target).replace(/^@/, '@')}`;
    if (m.platform === 'tiktok') return `https://tiktok.com/${String(m.target).replace(/^@/, '@')}`;
    if (m.platform === 'discord') return `https://discord.gg/${m.target}`;
    return '#';
  }

  async function open(m) {
    setBusy(m.id);
    await api.startFollowMission(telegramId, m.id);
    window.open(buildHref(m), '_blank', 'noopener,noreferrer');
    setBusy(null);
    refresh();
  }

  async function claim(m) {
    setBusy(m.id);
    const resp = await api.claimFollowMission(telegramId, m.id);
    if (resp.ok) {
      onAction?.('💰', `+${formatNumber(m.reward)} points`);
      refresh();
    } else {
      onAction?.('⚠️', resp.error || 'Could not claim');
    }
    setBusy(null);
  }

  if (loading) return <p className="text-center text-slate-400">Loading missions…</p>;

  return (
    <div className="flex flex-col gap-3">
      {missions.map((m) => (
        <div key={m.id} className="bg-slate-900 border-2 border-black rounded-xl p-3 flex items-center gap-3">
          <span className="text-2xl">{m.icon}</span>
          <div className="flex-1">
            <p className="font-black text-sm">{m.title}</p>
            <p className="text-[10px] opacity-60 uppercase">{m.platform} · +{formatNumber(m.reward)} pts</p>
          </div>
          {m.reward_claimed ? (
            <span className="text-green-400 font-black text-xs">DONE</span>
          ) : m.user_status === 'started' ? (
            <button onClick={() => claim(m)} disabled={busy === m.id} className="bg-[#FFD200] text-black font-black text-xs px-3 py-2 rounded-lg border-2 border-black active:scale-95">CLAIM</button>
          ) : (
            <button onClick={() => open(m)} disabled={busy === m.id} className="bg-primary-container text-white font-black text-xs px-3 py-2 rounded-lg border-2 border-black active:scale-95">GO</button>
          )}
        </div>
      ))}
    </div>
  );
}

// ---------------------- ADS ----------------------
export function AdsPanel({ telegramId, onAction }) {
  const [config, setConfig] = useState(null);
  const [busy, setBusy] = useState(null);

  async function refresh() {
    if (!telegramId) return;
    const resp = await api.getAdConfig(telegramId);
    setConfig(resp.ok ? resp.data : null);
  }

  useEffect(() => { refresh(); }, [telegramId]);

  async function watch(rewardId) {
    setBusy(rewardId);
    // TODO[ads]: integrate Adsgram / Onclicka SDK — call here with the placement
    // and only credit after the provider fires the rewarded callback.
    await new Promise((r) => setTimeout(r, 800));
    const resp = await api.rewardForAdView(telegramId, { placement: 'home', rewardId, provider: 'mock' });
    if (resp.ok) {
      onAction?.('🎬', resp.data.label || 'Reward credited');
    } else {
      onAction?.('⚠️', resp.error || 'Ad failed');
    }
    setBusy(null);
    refresh();
  }

  if (!config) return <p className="text-center text-slate-400">Loading ad slots…</p>;

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-slate-900 border-2 border-black rounded-xl p-3 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase opacity-70">Watched today</p>
          <p className="font-black">{config.ads_watched_today} / {config.ads_max_per_day}</p>
        </div>
        <span className="text-[10px] font-black bg-black px-2 py-1 rounded border border-slate-700">{config.can_watch_now ? 'READY' : 'COOLDOWN'}</span>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {config.available_rewards.map((reward) => (
          <button
            key={reward.id}
            disabled={!config.can_watch_now || busy === reward.id}
            onClick={() => watch(reward.id)}
            className="flex items-center justify-between bg-primary-container text-white font-black p-3 rounded-xl border-2 border-black active:scale-95 disabled:opacity-50"
          >
            <span className="text-sm">{reward.label}</span>
            <span className="bg-black px-2 py-1 rounded text-[10px]">{busy === reward.id ? '…' : 'WATCH AD'}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------- CHESTS ----------------------
export function ChestsPanel({ telegramId, walletLinked, onAction }) {
  const [chests, setChests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [history, setHistory] = useState([]);

  async function refresh() {
    setLoading(true);
    const [c, h] = await Promise.all([api.listChests(), telegramId ? api.getChestHistory(telegramId) : Promise.resolve({ ok: true, data: [] })]);
    setChests(c.ok ? c.data : []);
    setHistory(h.ok ? h.data : []);
    setLoading(false);
  }

  useEffect(() => { refresh(); }, [telegramId]);

  async function open(chest) {
    if (!walletLinked) {
      onAction?.('🔗', 'Link your wallet first to pay for chests');
      return;
    }
    setBusy(chest.id);
    // TODO[SC]: build & send the on-chain payment, then forward the signature.
    const signature = `mock_sig_${Date.now()}`;
    const resp = await api.openChest(telegramId, chest.id, signature);
    if (resp.ok) {
      const reward = resp.data.reward || {};
      const label = reward.kind === 'points' ? `+${formatNumber(reward.amount)} pts`
        : reward.kind === 'character' ? `Skin: ${reward.character_id}`
        : reward.kind === 'token' ? `${formatTokenAmount(reward.amount, 6)} ${String(reward.token_id).toUpperCase()}`
        : reward.kind === 'boost' ? `${reward.multiplier}x boost`
        : reward.kind === 'energy_full' ? 'Energy refill'
        : 'Reward';
      onAction?.('🎁', label);
    } else {
      onAction?.('⚠️', resp.error || 'Chest opening failed');
    }
    setBusy(null);
    refresh();
  }

  if (loading) return <p className="text-center text-slate-400">Loading chests…</p>;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        {chests.map((chest) => (
          <div key={chest.id} className="bg-slate-900 border-2 border-black rounded-xl p-3 text-center flex flex-col gap-2">
            <div className="text-5xl">{chest.icon}</div>
            <p className="font-black text-sm">{chest.name}</p>
            <p className="text-[10px] opacity-60">{formatTokenAmount(chest.price_amount, 9)} {String(chest.price_token).toUpperCase()}</p>
            <button
              disabled={busy === chest.id || !telegramId}
              onClick={() => open(chest)}
              className="bg-[#FFD200] text-black font-black text-xs py-2 rounded-lg border-2 border-black active:scale-95 disabled:opacity-50"
            >
              {busy === chest.id ? 'Opening…' : 'OPEN'}
            </button>
          </div>
        ))}
      </div>
      {history.length > 0 ? (
        <div className="bg-slate-900 border-2 border-black rounded-xl p-3">
          <p className="text-[10px] font-black uppercase opacity-70 mb-2">History</p>
          {history.slice(0, 5).map((h) => (
            <div key={h.id} className="text-xs flex justify-between py-1">
              <span>{h.chest_id}</span>
              <span className="opacity-70">{h.reward_json?.kind || '—'}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// ---------------------- REFERRAL TIERS ----------------------
export function ReferralTiersPanel({ telegramId, referralLink, onAction }) {
  const [progress, setProgress] = useState(null);
  const [busy, setBusy] = useState(null);

  async function refresh() {
    if (!telegramId) return;
    const resp = await api.getReferralProgress(telegramId);
    setProgress(resp.ok ? resp.data : null);
  }

  useEffect(() => { refresh(); }, [telegramId]);

  async function copy() {
    try { await navigator.clipboard.writeText(referralLink); onAction?.('✅', 'Link copied'); } catch (_) { /* ignore */ }
  }

  async function claim(tier) {
    setBusy(tier);
    const resp = await api.claimReferralTier(telegramId, tier);
    if (resp.ok) {
      onAction?.('🎁', `Tier ${tier} claimed!`);
      refresh();
    } else {
      onAction?.('⚠️', resp.error || 'Cannot claim');
    }
    setBusy(null);
  }

  if (!progress) return <p className="text-center text-slate-400">Loading…</p>;

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-slate-900 border-2 border-black rounded-xl p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm">Friends invited</span>
          <span className="font-black text-[#FFD200] text-lg">{progress.referral_count}</span>
        </div>
        <div className="flex gap-2">
          <input readOnly value={referralLink} className="flex-1 bg-black border-2 border-slate-800 rounded p-2 text-xs" />
          <button onClick={copy} className="bg-primary-container text-white font-black text-xs px-3 rounded border-2 border-black">COPY</button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {progress.tiers.map((tier) => (
          <div key={tier.tier} className={`flex items-center justify-between p-3 rounded-xl border-2 border-black ${tier.claimed ? 'bg-slate-800 opacity-60' : tier.reached ? 'bg-primary-container' : 'bg-slate-900'}`}>
            <div>
              <p className="font-black text-sm">Tier {tier.tier} · {tier.threshold} friends</p>
              <p className="text-[10px] opacity-80">{tier.label}</p>
              <p className="text-[10px] opacity-60">+{formatNumber(tier.reward_points)} pts {tier.reward_token && Number(tier.reward_token_amount) > 0 ? `+ ${formatTokenAmount(tier.reward_token_amount, 9)} ${String(tier.reward_token).toUpperCase()}` : ''}</p>
            </div>
            {tier.claimed ? (
              <span className="text-green-400 font-black text-xs">CLAIMED</span>
            ) : tier.reached ? (
              <button disabled={busy === tier.tier} onClick={() => claim(tier.tier)} className="bg-[#FFD200] text-black font-black text-xs px-3 py-2 rounded-lg border-2 border-black active:scale-95">CLAIM</button>
            ) : (
              <span className="text-xs opacity-60">{progress.referral_count}/{tier.threshold}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------- AUTO CLICKER ----------------------
export function AutoClickerPanel({ telegramId, walletLinked, onAction }) {
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    if (!telegramId) return;
    const resp = await api.getAutoClickerStatus(telegramId);
    setStatus(resp.ok ? resp.data : null);
  }

  useEffect(() => { refresh(); }, [telegramId]);

  async function activate() {
    if (!walletLinked) {
      onAction?.('🔗', 'Link wallet to buy boost');
      return;
    }
    setBusy(true);
    // TODO[SC]: build & sign the SOL/SPL payment client-side, then forward the signature.
    const signature = `mock_sig_${Date.now()}`;
    const resp = await api.activateAutoClicker(telegramId, { signature, level: 1 });
    if (resp.ok) onAction?.('⚙️', 'Auto-clicker activated');
    else onAction?.('⚠️', resp.error || 'Activation failed');
    setBusy(false);
    refresh();
  }

  async function collect() {
    setBusy(true);
    const resp = await api.collectAutoClicker(telegramId);
    if (resp.ok && resp.data.collected > 0) onAction?.('💰', `+${formatNumber(resp.data.collected)} from auto-clicker`);
    else onAction?.('ℹ️', 'Nothing to collect yet');
    setBusy(false);
    refresh();
  }

  if (!status) return <p className="text-center text-slate-400">Loading…</p>;

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-slate-900 border-2 border-black rounded-xl p-3 text-center">
        <p className="text-[10px] font-black uppercase opacity-70">Status</p>
        <p className="text-2xl font-black">{status.active ? `${status.taps_per_sec}/sec` : 'Inactive'}</p>
        {status.active ? <CountdownBadge until={Number(status.active_until)} /> : null}
      </div>
      <button onClick={activate} disabled={busy} className="bg-[#FFD200] text-black font-black py-3 rounded-xl border-2 border-black active:scale-95 disabled:opacity-50">
        {status.active ? 'Extend Boost' : `Activate (${formatTokenAmount(status.boost_amount, 9)} ${String(status.boost_token).toUpperCase()})`}
      </button>
      <button onClick={collect} disabled={busy || !status.active} className="bg-primary-container text-white font-black py-3 rounded-xl border-2 border-black active:scale-95 disabled:opacity-50">
        Collect catch-up
      </button>
      <p className="text-[10px] opacity-60 text-center">Runs server-side. You can collect earnings any time you return.</p>
    </div>
  );
}

// ---------------------- CHARACTERS ----------------------
export function CharactersPanel({ telegramId, activeCharacterId, onSelect, onAction }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    if (!telegramId) return;
    setLoading(true);
    const resp = await api.listMyCharacters(telegramId);
    setList(resp.ok ? resp.data : []);
    setLoading(false);
  }

  useEffect(() => { refresh(); }, [telegramId]);

  async function pick(id) {
    const resp = await api.selectCharacter(telegramId, id);
    if (resp.ok) {
      onSelect?.(id);
      onAction?.('🎭', 'Character equipped');
    } else {
      onAction?.('⚠️', resp.error || 'Cannot select');
    }
    refresh();
  }

  if (loading) return <p className="text-center text-slate-400">Loading…</p>;

  return (
    <div className="grid grid-cols-2 gap-3">
      {list.map((c) => (
        <button
          key={c.id}
          onClick={() => pick(c.id)}
          className={`bg-slate-900 border-2 border-black rounded-xl p-3 text-center active:scale-95 ${activeCharacterId === c.id ? 'ring-2 ring-[#FFD200]' : ''}`}
        >
          <div className="text-4xl">{c.icon}</div>
          <p className="font-black text-xs mt-2">{c.name}</p>
          <p className="text-[10px] opacity-60 uppercase">{c.rarity} · {c.league_group}</p>
          {c.tap_bonus || c.passive_bonus ? <p className="text-[10px] text-[#FFD200]">+{c.tap_bonus}% tap · +{c.passive_bonus}% passive</p> : null}
        </button>
      ))}
    </div>
  );
}

// ---------------------- RAFFLES ----------------------
export function RafflesPanel({ telegramId, walletLinked, onAction }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [tickets, setTickets] = useState({});

  async function refresh() {
    setLoading(true);
    const resp = await api.listRaffles();
    setItems(resp.ok ? resp.data : []);
    setLoading(false);
  }

  useEffect(() => { refresh(); }, []);

  async function buy(raffleId, payWith) {
    const count = Math.max(1, Number(tickets[raffleId] || 1));
    setBusy(raffleId);
    const args = payWith === 'token'
      ? [telegramId, raffleId, count, 'token', `mock_sig_${Date.now()}`]
      : [telegramId, raffleId, count, 'points'];
    // TODO[SC]: real signature for token payments
    const resp = await api.buyRaffleTickets(...args);
    if (resp.ok) onAction?.('🎟️', `+${count} ticket(s)`);
    else onAction?.('⚠️', resp.error || 'Could not buy');
    setBusy(null);
    refresh();
  }

  if (loading) return <p className="text-center text-slate-400">Loading raffles…</p>;
  if (items.length === 0) return <p className="text-center text-slate-400">No raffles right now.</p>;

  return (
    <div className="flex flex-col gap-3">
      {items.map((r) => (
        <div key={r.id} className="bg-slate-900 border-2 border-black rounded-xl p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-3xl">{r.icon}</span>
              <div>
                <p className="font-black">{r.name}</p>
                <p className="text-[10px] opacity-60 uppercase">{r.status}</p>
              </div>
            </div>
            {r.status === 'open' ? <CountdownBadge until={Number(r.ends_at)} /> : null}
          </div>
          <p className="text-xs text-slate-400">{r.prize_description}</p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              value={tickets[r.id] || 1}
              onChange={(e) => setTickets((prev) => ({ ...prev, [r.id]: e.target.value }))}
              className="w-16 bg-black border-2 border-slate-800 rounded p-2 text-xs"
            />
            <button disabled={busy === r.id || Number(r.ticket_points) === 0} onClick={() => buy(r.id, 'points')} className="flex-1 bg-primary-container text-white font-black py-2 rounded-lg border-2 border-black active:scale-95 disabled:opacity-50 text-xs">
              {formatNumber(r.ticket_points)} pts each
            </button>
            <button disabled={busy === r.id || !walletLinked || Number(r.ticket_price) === 0} onClick={() => buy(r.id, 'token')} className="flex-1 bg-[#FFD200] text-black font-black py-2 rounded-lg border-2 border-black active:scale-95 disabled:opacity-50 text-xs">
              {formatTokenAmount(r.ticket_price, 9)} {String(r.ticket_token || 'SOL').toUpperCase()}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------- TOKEN PICKER (for multi-token UI) ----------------------
export function TokenPickerPanel() {
  const [tokens, setTokens] = useState([]);
  useEffect(() => {
    api.listTokens().then((r) => setTokens(r.ok ? r.data : []));
  }, []);
  return (
    <div className="grid grid-cols-2 gap-3">
      {tokens.map((token) => (
        <div key={token.id} className={`bg-slate-900 border-2 border-black rounded-xl p-3 text-center ${token.enabled ? '' : 'opacity-50'}`}>
          <div className="text-4xl">{token.icon}</div>
          <p className="font-black mt-1">{token.symbol}</p>
          <p className="text-[10px] opacity-60 uppercase">{token.kind}</p>
          {!token.enabled ? <p className="text-[10px] text-yellow-400 mt-1">SOON</p> : null}
        </div>
      ))}
    </div>
  );
}
