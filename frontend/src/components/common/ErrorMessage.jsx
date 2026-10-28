import { AlertTriangle, RotateCw } from 'lucide-react';

export default function ErrorMessage({ error, onRetry, title = 'Something went wrong' }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-10 text-center" role="alert">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-rose-500/10 text-rose-300">
        <AlertTriangle className="h-5 w-5" aria-hidden="true" />
      </span>
      <div>
        <p className="font-semibold text-white">{title}</p>
        <p className="mt-1 max-w-md text-sm text-slate-400">{error?.message || String(error)}</p>
      </div>
      {onRetry && (
        <button type="button" className="btn-secondary mt-1" onClick={onRetry}>
          <RotateCw className="h-4 w-4" aria-hidden="true" /> Try again
        </button>
      )}
    </div>
  );
}
