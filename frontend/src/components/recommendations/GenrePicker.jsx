import { Check, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAsync } from '../../hooks/useAsync.js';
import { moviesApi, userApi } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

/** Lets the user choose preferred genres (stored as (:User)-[:PREFERS]->(:Genre)). */
export default function GenrePicker({ initial = [], onSaved, compact = false }) {
  const toast = useToast();
  const { markActivity } = useAuth();
  const genres = useAsync(() => moviesApi.genres().then((r) => r.data), []);
  const [selected, setSelected] = useState(() => new Set(initial.map((g) => g.genreId)));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSelected(new Set(initial.map((g) => g.genreId)));
  }, [initial]);

  const toggle = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const save = async () => {
    setSaving(true);
    try {
      const res = await userApi.savePreferences([...selected]);
      toast.success('Preferred genres saved');
      markActivity();
      onSaved?.(res.data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (genres.loading) return <p className="text-sm text-slate-400">Loading genres…</p>;
  if (genres.error) return <p className="text-sm text-rose-300">{genres.error.message}</p>;

  return (
    <div>
      <fieldset>
        <legend className={compact ? 'sr-only' : 'label'}>Preferred genres</legend>
        <div className="flex flex-wrap gap-2">
          {genres.data.map((g) => {
            const active = selected.has(g.genreId);
            return (
              <button
                key={g.genreId}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(g.genreId)}
                className={`chip px-3 py-1.5 text-sm transition ${
                  active ? 'border-accent/60 bg-accent/20 text-white' : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/25'
                }`}
              >
                {active && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                {g.name}
              </button>
            );
          })}
        </div>
      </fieldset>
      <button type="button" className="btn-primary mt-4" onClick={save} disabled={saving}>
        {saving && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        Save preferences ({selected.size})
      </button>
    </div>
  );
}
