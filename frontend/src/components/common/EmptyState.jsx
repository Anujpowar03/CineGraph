export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-12 text-center">
      {Icon && (
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/10 text-accent-soft">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
      )}
      <div>
        <p className="font-display text-lg font-semibold text-white">{title}</p>
        {description && <p className="mx-auto mt-1 max-w-md text-sm text-slate-400">{description}</p>}
      </div>
      {action}
    </div>
  );
}
