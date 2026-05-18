// Custom inline SVG icon set for the CyberTap arcade-style HUD.
// All icons inherit currentColor + currentFilter so glow comes from parent.

function Base({ children, size = 28, className = '' }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} className={`block ${className}`} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

export function IconTrophy(props) {
  return (
    <Base {...props}>
      <path d="M9 5h14v5a7 7 0 0 1-7 7 7 7 0 0 1-7-7V5z" fill="rgba(255,210,0,0.25)" />
      <path d="M9 7H5v2a5 5 0 0 0 4 5" />
      <path d="M23 7h4v2a5 5 0 0 1-4 5" />
      <path d="M12 20h8v3h-8z" />
      <path d="M10 26h12v2H10z" />
    </Base>
  );
}

export function IconSwords(props) {
  return (
    <Base {...props}>
      <path d="M5 5l9 9-3 3-9-9 3-3z" fill="rgba(255,80,80,0.25)" />
      <path d="M27 5l-9 9 3 3 9-9-3-3z" fill="rgba(255,80,80,0.25)" />
      <path d="M14 18l-2 2 4 4 2-2" />
      <path d="M18 18l2 2-4 4-2-2" />
    </Base>
  );
}

export function IconChest(props) {
  return (
    <Base {...props}>
      <path d="M4 12a8 8 0 0 1 8-8h8a8 8 0 0 1 8 8v3H4z" fill="rgba(168,85,247,0.25)" />
      <rect x="4" y="15" width="24" height="12" rx="2" fill="rgba(168,85,247,0.15)" />
      <path d="M14 15h4v4h-4z" fill="rgba(255,210,0,0.6)" stroke="rgba(255,210,0,1)" />
      <circle cx="16" cy="17" r="1" fill="#0a0" />
    </Base>
  );
}

export function IconTicket(props) {
  return (
    <Base {...props}>
      <path d="M3 12a3 3 0 0 0 0 6v3h26v-3a3 3 0 0 0 0-6V9H3v3z" fill="rgba(236,72,153,0.25)" />
      <path d="M16 9v12" strokeDasharray="2 2" />
    </Base>
  );
}

export function IconAntenna(props) {
  return (
    <Base {...props}>
      <path d="M16 18v10" />
      <circle cx="16" cy="14" r="3" fill="rgba(0,200,255,0.3)" />
      <path d="M10 10a8 8 0 0 1 12 0" />
      <path d="M7 6a13 13 0 0 1 18 0" />
      <path d="M12 28h8" />
    </Base>
  );
}

export function IconAd(props) {
  return (
    <Base {...props}>
      <rect x="3" y="6" width="26" height="18" rx="2" fill="rgba(16,185,129,0.25)" />
      <path d="M12 11v8m0-4h4m4-4l-2 8m-1-3h4m3-5v8" />
      <path d="M14 27l4 0" />
    </Base>
  );
}

export function IconGear(props) {
  return (
    <Base {...props}>
      <circle cx="16" cy="16" r="4" fill="rgba(148,163,184,0.25)" />
      <path d="M16 3v4M16 25v4M3 16h4M25 16h4M6 6l3 3M23 23l3 3M6 26l3-3M23 9l3-3" />
    </Base>
  );
}

export function IconMask(props) {
  return (
    <Base {...props}>
      <path d="M4 10c2-4 8-5 12-5s10 1 12 5c-1 9-6 17-12 17S5 19 4 10z" fill="rgba(217,70,239,0.3)" />
      <circle cx="11" cy="14" r="2" fill="#fff" />
      <circle cx="21" cy="14" r="2" fill="#fff" />
      <path d="M11 22h10" />
    </Base>
  );
}

export function IconUsers(props) {
  return (
    <Base {...props}>
      <circle cx="11" cy="11" r="4" fill="rgba(251,191,36,0.3)" />
      <circle cx="22" cy="13" r="3" fill="rgba(251,191,36,0.2)" />
      <path d="M3 26c0-4 4-7 8-7s8 3 8 7" />
      <path d="M18 26c0-3 3-5 5-5s4 2 4 5" />
    </Base>
  );
}

export function IconCoin(props) {
  return (
    <Base {...props}>
      <circle cx="16" cy="16" r="11" fill="rgba(251,191,36,0.3)" />
      <circle cx="16" cy="16" r="7" fill="none" />
      <path d="M14 12h3a2 2 0 0 1 0 4h-3v4" />
      <path d="M16 11v10" />
    </Base>
  );
}

export function IconGift(props) {
  return (
    <Base {...props}>
      <rect x="4" y="12" width="24" height="14" rx="2" fill="rgba(16,185,129,0.25)" />
      <path d="M4 18h24" />
      <path d="M16 12v14" />
      <path d="M11 8a3 3 0 0 1 5-2 3 3 0 0 1 5 2c0 2-3 4-5 4s-5-2-5-4z" fill="rgba(255,210,0,0.6)" />
    </Base>
  );
}

export function IconChart(props) {
  return (
    <Base {...props}>
      <path d="M5 26V14M11 26V8M17 26v-9M23 26v-6" fill="rgba(139,92,246,0.4)" />
      <path d="M5 26h22" />
      <circle cx="11" cy="8" r="1.5" fill="#fff" />
    </Base>
  );
}

export function IconBolt(props) {
  return (
    <Base {...props}>
      <path d="M17 3L7 18h7l-2 11 10-15h-7z" fill="rgba(255,210,0,0.8)" stroke="#000" strokeWidth="1.5" />
    </Base>
  );
}

export function IconLive(props) {
  return (
    <Base {...props} size={props.size || 14}>
      <circle cx="16" cy="16" r="6" fill="#ff4444" />
      <circle cx="16" cy="16" r="11" stroke="#ff4444" strokeWidth="2" fill="none" />
    </Base>
  );
}

export function IconFlame(props) {
  return (
    <Base {...props}>
      <path d="M16 3c2 4 6 6 6 12a6 6 0 1 1-12 0c0-3 1-5 3-7-1 2 0 4 2 5 1-3-2-6 1-10z" fill="rgba(255,100,0,0.7)" />
    </Base>
  );
}
