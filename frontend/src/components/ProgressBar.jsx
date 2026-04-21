const toneClasses = {
  cyan: 'from-cyan-300 to-sky-400',
  emerald: 'from-emerald-300 to-cyan-300',
  amber: 'from-amber-300 to-orange-400',
  violet: 'from-fuchsia-300 to-violet-400',
};

export function ProgressBar({ label, value, max, helper, tone = 'cyan' }) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const gradient = toneClasses[tone] ?? toneClasses.cyan;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4 text-sm text-slate-300">
        <span>{label}</span>
        <span className="font-semibold text-white">
          {value}/{max}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full bg-gradient-to-r ${gradient}`} style={{ width: `${percent}%` }} />
      </div>
      {helper ? <p className="text-xs text-slate-400">{helper}</p> : null}
    </div>
  );
}
