import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ label = 'Loading…', className = '' }) {
  return (
    <div className={`flex items-center justify-center gap-3 py-12 text-sm text-slate-400 ${className}`} role="status">
      <Loader2 className="h-5 w-5 animate-spin text-accent-soft" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
