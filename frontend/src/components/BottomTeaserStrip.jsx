import { useEffect, useState } from 'react';
import { IconFlame, IconUsers, IconBolt } from './GameIcons';

function formatNum(num) {
  const value = Math.floor(Number(num) || 0);
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return `${value}`;
}

function useCountdown(until) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!until) return undefined;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [until]);
  const remaining = Math.max(0, until - now);
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function Pill({ icon, label, value, pct, accent, onClick, glow }) {
  const accentMap = {
    yellow: 'border-amber-400/60 from-amber-700/35 to-amber-900/35 text-amber-200',
    pink: 'border-pink-400/60 from-pink-700/35 to-pink-900/35 text-pink-200',
    purple: 'border-fuchsia-400/60 from-fuchsia-700/35 to-fuchsia-900/35 text-fuchsia-200',
    cyan: 'border-cyan-400/60 from-cyan-700/35 to-cyan-900/35 text-cyan-200',
  };
  const fillMap = {
    yellow: 'bg-gradient-to-r from-amber-400 to-yellow-300',
    pink: 'bg-gradient-to-r from-pink-400 to-rose-300',
    purple: 'bg-gradient-to-r from-fuchsia-400 to-purple-300',
    cyan: 'bg-gradient-to-r from-cyan-400 to-sky-300',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 relative rounded-xl border-2 ${accentMap[accent]} bg-gradient-to-br backdrop-blur-sm p-2 text-left overflow-hidden active:scale-95 transition-transform ${glow ? 'animate-rail-pulse' : ''}`}
    >
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 shrink-0 rounded-lg bg-black/40 border border-white/15 flex items-center justify-center text-current">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[8px] font-black uppercase tracking-widest opacity-80 truncate">{label}</p>
          <p className="text-[11px] font-black text-white truncate">{value}</p>
        </div>
      </div>
      {pct != null ? (
        <div className="h-1 w-full bg-black/50 rounded-full mt-1.5 overflow-hidden">
          <div className={`h-full ${fillMap[accent]} transition-all duration-500`} style={{ width: `${Math.min(100, pct)}%` }} />
        </div>
      ) : null}
    </button>
  );
}

export default function BottomTeaserStrip({ todayTaps, referralCount, boostActive, boostMultiplier, boostUntil, onOpenReferrals, onSwitchDaily, onOpenAutoclicker }) {
  const tapsTarget = 5000;
  const tapsPct = (todayTaps / tapsTarget) * 100;

  const referralTarget = 3;
  const refPct = (referralCount / referralTarget) * 100;

  const boostCd = useCountdown(boostActive && boostUntil ? boostUntil : 0);

  return (
    <div className="grid grid-cols-3 gap-2">
      <Pill
        icon={<IconFlame size={18} />}
        label="DAILY TAPS"
        value={`${formatNum(todayTaps)} / ${formatNum(tapsTarget)}`}
        pct={tapsPct}
        accent="yellow"
        onClick={onSwitchDaily}
      />
      <Pill
        icon={<IconUsers size={18} />}
        label="INVITE 3"
        value={`${referralCount} / ${referralTarget}`}
        pct={refPct}
        accent="pink"
        onClick={onOpenReferrals}
      />
      {boostActive ? (
        <Pill
          icon={<IconBolt size={18} />}
          label={`BOOST ×${boostMultiplier}`}
          value={boostCd}
          accent="cyan"
          onClick={onOpenAutoclicker}
          glow
        />
      ) : (
        <Pill
          icon={<IconBolt size={18} />}
          label="BOOST"
          value="Activate"
          accent="purple"
          onClick={onOpenAutoclicker}
        />
      )}
    </div>
  );
}
