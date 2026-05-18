// Horizontal action dock — 2 rows × 5 slots — replaces the vertical SideRails.
// Each slot is a 56×56 neon button with custom SVG and glow.

function DockButton({ slot }) {
  const { icon: Icon, label, onClick, accent = 'green', badge, pulse, disabled } = slot;

  const glowMap = {
    green: 'shadow-[0_0_14px_rgba(0,255,136,0.5)] text-emerald-300 ring-emerald-400/50',
    blue: 'shadow-[0_0_14px_rgba(0,212,255,0.5)] text-sky-300 ring-sky-400/50',
    yellow: 'shadow-[0_0_14px_rgba(255,210,0,0.55)] text-amber-300 ring-amber-400/55',
    pink: 'shadow-[0_0_14px_rgba(236,72,153,0.5)] text-pink-300 ring-pink-400/50',
    purple: 'shadow-[0_0_14px_rgba(168,85,247,0.5)] text-fuchsia-300 ring-fuchsia-400/50',
    red: 'shadow-[0_0_14px_rgba(255,80,80,0.5)] text-rose-300 ring-rose-400/50',
    orange: 'shadow-[0_0_14px_rgba(255,140,0,0.5)] text-orange-300 ring-orange-400/50',
    cyan: 'shadow-[0_0_14px_rgba(34,211,238,0.5)] text-cyan-300 ring-cyan-400/50',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group relative aspect-square w-full rounded-2xl border-2 border-black/80 bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center ring-2 ${glowMap[accent] || glowMap.green} active:scale-90 transition-transform ${pulse ? 'animate-rail-pulse' : ''} ${disabled ? 'opacity-40' : ''}`}
    >
      <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      <Icon size={22} />
      <span className="text-[8px] font-black uppercase tracking-wider mt-0.5 text-white/85 drop-shadow-[1px_1px_0_rgba(0,0,0,0.9)]">{label}</span>

      {badge != null ? (
        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FFD200] text-black text-[10px] font-black border-2 border-black flex items-center justify-center leading-none">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

export default function ActionDock({ slots = [] }) {
  return (
    <div className="relative">
      {/* subtle top edge bracket */}
      <div className="absolute -top-1 left-0 right-0 flex justify-center pointer-events-none">
        <span className="h-1 w-12 rounded-full bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
      </div>

      <div className="grid grid-cols-5 gap-2 p-2 rounded-2xl bg-black/30 border border-white/5 backdrop-blur-sm">
        {slots.map((slot, idx) => (
          <DockButton key={slot.id || idx} slot={slot} />
        ))}
      </div>
    </div>
  );
}
