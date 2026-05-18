// Floating vertical action rail. Compact 44×44 buttons with neon SVG icons.
// Sized to fit on 360px viewports alongside a 176px tap-core.

function RailButton({ slot, side, index }) {
  const { icon: Icon, label, onClick, accent = 'green', badge, disabled, pulse } = slot;

  const glowMap = {
    green: 'shadow-[0_0_12px_rgba(0,255,136,0.55)] text-emerald-300 ring-emerald-400/55',
    blue: 'shadow-[0_0_12px_rgba(0,212,255,0.55)] text-sky-300 ring-sky-400/55',
    yellow: 'shadow-[0_0_12px_rgba(255,210,0,0.6)] text-amber-300 ring-amber-400/60',
    pink: 'shadow-[0_0_12px_rgba(236,72,153,0.55)] text-pink-300 ring-pink-400/55',
    purple: 'shadow-[0_0_12px_rgba(168,85,247,0.55)] text-fuchsia-300 ring-fuchsia-400/55',
    red: 'shadow-[0_0_12px_rgba(255,80,80,0.55)] text-rose-300 ring-rose-400/55',
    orange: 'shadow-[0_0_12px_rgba(255,140,0,0.55)] text-orange-300 ring-orange-400/55',
    cyan: 'shadow-[0_0_12px_rgba(34,211,238,0.55)] text-cyan-300 ring-cyan-400/55',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{ animationDelay: `${index * 70}ms` }}
      className={`group relative w-11 h-11 rounded-xl border-2 border-black/80 bg-slate-950/95 backdrop-blur-sm flex items-center justify-center ring-2 ${glowMap[accent] || glowMap.green} active:scale-90 transition-transform ${pulse ? 'animate-rail-pulse' : ''} ${disabled ? 'opacity-40' : ''} ${side === 'left' ? 'rail-slide-left' : 'rail-slide-right'} hover:scale-110`}
    >
      {/* sheen overlay */}
      <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/15 to-transparent pointer-events-none" />
      {/* corner notches */}
      <span className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/40 rounded-tl-xl pointer-events-none" />
      <span className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-white/40 rounded-br-xl pointer-events-none" />

      <Icon size={22} />

      {badge != null ? (
        <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] px-1 rounded-full bg-[#FFD200] text-black text-[9px] font-black border-2 border-black flex items-center justify-center leading-none shadow-md">
          {badge}
        </span>
      ) : null}

      {/* label tooltip */}
      <span className={`pointer-events-none absolute opacity-0 group-hover:opacity-100 group-focus:opacity-100 top-1/2 -translate-y-1/2 ${side === 'left' ? 'left-full ml-2' : 'right-full mr-2'} text-[9px] font-black uppercase tracking-widest bg-black/95 px-1.5 py-0.5 rounded text-white whitespace-nowrap transition-opacity border border-white/20 shadow-lg`}>
        {label}
      </span>
    </button>
  );
}

export default function SideRail({ side = 'left', slots = [] }) {
  return (
    <div
      className={`pointer-events-none absolute top-1/2 -translate-y-1/2 ${side === 'left' ? 'left-0' : 'right-0'} flex flex-col gap-2.5 z-30`}
    >
      {slots.map((slot, idx) => (
        <div key={slot.id || idx} className="pointer-events-auto">
          <RailButton slot={slot} side={side} index={idx} />
        </div>
      ))}
    </div>
  );
}
