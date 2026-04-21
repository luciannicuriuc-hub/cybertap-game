const toneClasses = {
  cyan: 'from-cyan-200 via-sky-300 to-emerald-300',
  emerald: 'from-emerald-200 via-cyan-200 to-cyan-300',
  amber: 'from-amber-200 via-orange-300 to-rose-300',
  violet: 'from-fuchsia-200 via-violet-300 to-cyan-200',
};

export function MetricCard({ label, value, hint, tone = 'cyan' }) {
  const gradient = toneClasses[tone] ?? toneClasses.cyan;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
      <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-slate-400">{label}</p>
      <div className={`mt-3 bg-gradient-to-r ${gradient} bg-clip-text text-2xl font-bold text-transparent`}>
        {value}
      </div>
      {hint ? <p className="mt-2 text-sm leading-5 text-slate-400">{hint}</p> : null}
    </div>
  );
}
