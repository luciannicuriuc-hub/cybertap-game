import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { IconLive, IconFlame, IconSwords, IconTicket, IconChest, IconTrophy } from './GameIcons';

function formatRemaining(ms) {
  const remaining = Math.max(0, ms);
  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m ${seconds}s`;
}

function useCountdown(until) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return formatRemaining(until - now);
}

function EventCard({ kind, title, subtitle, accent, countdownTo, onClick, hot }) {
  const cd = useCountdown(countdownTo || Date.now());

  const accentMap = {
    red: 'from-rose-700 via-red-600 to-orange-600 shadow-[0_0_18px_rgba(255,80,80,0.4)]',
    pink: 'from-fuchsia-700 via-pink-600 to-rose-500 shadow-[0_0_18px_rgba(236,72,153,0.4)]',
    purple: 'from-indigo-800 via-purple-700 to-fuchsia-700 shadow-[0_0_18px_rgba(168,85,247,0.4)]',
    yellow: 'from-amber-600 via-yellow-500 to-orange-600 shadow-[0_0_18px_rgba(255,210,0,0.4)]',
    cyan: 'from-cyan-700 via-sky-600 to-blue-600 shadow-[0_0_18px_rgba(34,211,238,0.4)]',
  };

  const iconMap = {
    tournament: <IconSwords size={28} />,
    raffle: <IconTicket size={28} />,
    chest: <IconChest size={28} />,
    season: <IconTrophy size={28} />,
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`snap-start shrink-0 w-[85%] sm:w-[70%] relative rounded-2xl overflow-hidden border-2 border-black active:scale-[0.98] transition-transform`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${accentMap[accent] || accentMap.purple} opacity-95`} />
      <div className="absolute inset-0 opacity-15 mix-blend-screen pointer-events-none"
           style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(255,255,255,0.15) 6px, rgba(255,255,255,0.15) 7px)' }} />

      <div className="relative px-3 py-2.5 flex items-center gap-2.5 text-white">
        <div className="w-11 h-11 rounded-xl bg-black/40 border border-white/20 flex items-center justify-center text-white shrink-0">
          {iconMap[kind] || <IconFlame size={24} />}
        </div>

        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-1 mb-0.5">
            {hot ? <IconLive size={9} /> : null}
            <span className="text-[9px] font-black uppercase tracking-widest opacity-90 truncate">{hot ? 'LIVE' : kind}</span>
            <span className="text-[9px] font-black opacity-75 ml-auto">⏳ {cd}</span>
          </div>
          <h3 className="text-[13px] font-black uppercase italic leading-tight drop-shadow-[1px_1px_0_rgba(0,0,0,1)] truncate">{title}</h3>
          <p className="text-[10px] opacity-85 truncate">{subtitle}</p>
        </div>

        <span className="bg-[#FFD200] text-black text-[10px] font-black px-2 py-1 rounded-md border-2 border-black shrink-0">▸</span>
      </div>
    </button>
  );
}

export default function LiveEventsBanner({ onOpen, telegramId }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [tResp, rResp, sResp] = await Promise.all([
        api.listTournaments(),
        api.listRaffles(),
        api.getSeason(),
      ]);
      if (cancelled) return;

      const items = [];
      const now = Date.now();

      if (sResp.ok && sResp.data?.season) {
        const season = sResp.data.season;
        items.push({
          kind: 'season',
          accent: 'yellow',
          title: season.name,
          subtitle: 'Climb to win SOL prizes',
          countdownTo: Number(season.ends_at),
          onClick: () => onOpen?.('prizes'),
          hot: true,
        });
      }

      if (tResp.ok) {
        (tResp.data || []).filter((t) => t.status === 'active' && Number(t.ends_at) > now).slice(0, 3).forEach((t) => {
          items.push({
            kind: 'tournament',
            accent: 'red',
            title: t.name,
            subtitle: t.description || 'Compete for the prize pool',
            countdownTo: Number(t.ends_at),
            onClick: () => onOpen?.('tournaments'),
            hot: true,
          });
        });
      }

      if (rResp.ok) {
        (rResp.data || []).filter((r) => r.status === 'open' && Number(r.ends_at) > now).slice(0, 2).forEach((r) => {
          items.push({
            kind: 'raffle',
            accent: 'pink',
            title: r.name,
            subtitle: r.prize_description || 'Buy tickets, win big',
            countdownTo: Number(r.ends_at),
            onClick: () => onOpen?.('raffles'),
            hot: true,
          });
        });
      }

      // Fallback chest deal if no events
      if (items.length < 2) {
        items.push({
          kind: 'chest',
          accent: 'purple',
          title: 'Loot Crates Open',
          subtitle: 'Spin for SOL, skins and boosts',
          countdownTo: now + 24 * 3600000,
          onClick: () => onOpen?.('chests'),
          hot: false,
        });
      }

      setEvents(items);
      setLoading(false);
    }
    load();
    const refresh = setInterval(load, 45000);
    return () => { cancelled = true; clearInterval(refresh); };
  }, [onOpen, telegramId]);

  if (loading) {
    return (
      <div className="h-16 rounded-2xl border-2 border-black bg-slate-900 flex items-center justify-center text-slate-500 text-xs font-black">
        Loading live events...
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-1 px-1">
        <div className="flex items-center gap-1.5 text-rose-300">
          <IconLive size={10} />
          <span className="text-[9px] font-black uppercase tracking-widest">Live Events</span>
        </div>
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">swipe ▸</span>
      </div>

      <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory -mx-1 px-1 pb-1 scrollbar-hide">
        {events.map((event, idx) => (
          <EventCard key={`${event.kind}-${idx}`} {...event} />
        ))}
      </div>
    </div>
  );
}
