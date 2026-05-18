import { useEffect } from 'react';

export default function FeatureOverlay({ title, icon, onClose, children, accent = 'bg-primary-container' }) {
  useEffect(() => {
    const handler = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full sm:max-w-md max-h-[92vh] overflow-y-auto bg-slate-950 border-4 border-black rounded-t-3xl sm:rounded-3xl shadow-[0_-8px_0_0_rgba(0,0,0,1)] sm:shadow-[8px_8px_0_0_rgba(0,0,0,1)] flex flex-col"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={`flex items-center justify-between px-5 py-4 ${accent} border-b-4 border-black sticky top-0 z-10`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">{icon}</span>
            <h2 className="text-lg font-black uppercase italic text-white drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-slate-900 border-2 border-black text-white font-black text-lg active:scale-95"
          >
            ✕
          </button>
        </header>
        <div className="p-5 flex flex-col gap-4 text-white">{children}</div>
      </div>
    </div>
  );
}
