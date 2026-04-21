export function Panel({ eyebrow, title, description, action, children, className = '' }) {
  return (
    <section className={`glass-panel relative overflow-hidden ${className}`}>
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/30 to-transparent" />
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 px-6 py-5">
        <div>
          {eyebrow ? <p className="section-label">{eyebrow}</p> : null}
          <h2 className="mt-2 font-display text-2xl font-bold text-white">{title}</h2>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="px-6 py-6">{children}</div>
    </section>
  );
}
