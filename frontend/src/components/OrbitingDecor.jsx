// Pure visual decor around the tap-core: orbiting coins + idle sparkles + boost aura overlay.
// Pointer-events disabled so it never blocks taps.

const SPARKLES = [
  { top: '10%', left: '85%', delay: '0s' },
  { top: '78%', left: '12%', delay: '0.4s' },
  { top: '85%', left: '78%', delay: '0.9s' },
  { top: '18%', left: '15%', delay: '1.3s' },
  { top: '50%', left: '95%', delay: '0.7s' },
  { top: '95%', left: '50%', delay: '1.6s' },
];

export default function OrbitingDecor({ showHint, boostActive }) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* sparkles */}
      {SPARKLES.map((s, i) => (
        <span key={i} className="sparkle" style={{ top: s.top, left: s.left, animationDelay: s.delay }} />
      ))}

      {/* orbiting coins */}
      <span className="orbit-coin orbit-coin-1">💎</span>
      <span className="orbit-coin orbit-coin-2">⚡</span>
      <span className="orbit-coin orbit-coin-3">{boostActive ? '🔥' : '✨'}</span>

      {/* idle floating hint */}
      {showHint ? <span className="float-hint">+TAP</span> : null}
    </div>
  );
}
