import { Loader2, LogIn, UserRound } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LogoMark } from '../components/layout/Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

/** Seeded demo accounts (see backend/src/data/users.js). Password: Demo@1234 */
const DEMO_ACCOUNTS = [
  { email: 'aarav@cinegraph.demo', name: 'Aarav', persona: 'Sci-fi & Nolan' },
  { email: 'priya@cinegraph.demo', name: 'Priya', persona: 'Space epics' },
  { email: 'rohan@cinegraph.demo', name: 'Rohan', persona: 'Crime sagas' },
  { email: 'sneha@cinegraph.demo', name: 'Sneha', persona: 'Animation' },
  { email: 'meera@cinegraph.demo', name: 'Meera', persona: 'Horror & mystery' },
  { email: 'ishaan@cinegraph.demo', name: 'Ishaan', persona: 'New user (cold start)' },
];
const DEMO_PASSWORD = 'Demo@1234';

export default function LoginPage() {
  const { user, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const redirectTo = location.state?.from || '/recommendations';

  if (user) return <Navigate to={redirectTo} replace />;

  const submit = async (credentials) => {
    setSubmitting(true);
    setError('');
    try {
      const signedIn = await login(credentials.email, credentials.password);
      toast.success(`Welcome back, ${signedIn.name.split(' ')[0]}!`);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-page grid min-h-[70vh] items-center gap-10 py-12 lg:grid-cols-2">
      <section className="card mx-auto w-full max-w-md p-6 sm:p-8">
        <LogoMark className="h-10 w-10" />
        <h1 className="mt-4 text-2xl font-bold">Sign in to CineGraph</h1>
        <p className="mt-1 text-sm text-slate-400">Your likes and ratings become relationships in the graph.</p>

        <form
          className="mt-6 space-y-4"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            submit(form);
          }}
        >
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input id="email" type="email" autoComplete="email" required className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label htmlFor="password" className="label">Password</label>
            <input id="password" type="password" autoComplete="current-password" required className="input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          {error && <p className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200" role="alert">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={submitting || !form.email || !form.password}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <LogIn className="h-4 w-4" aria-hidden="true" />}
            Sign in
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-400">
          New here? <Link to="/register" className="font-medium text-accent-soft hover:underline">Create an account</Link>
        </p>
      </section>

      <section aria-labelledby="demo-title">
        <p className="eyebrow">Demo mode</p>
        <h2 id="demo-title" className="mt-2 text-2xl font-semibold">Try a seeded demo account</h2>
        <p className="mt-2 max-w-lg text-sm text-slate-400">
          These real accounts were created by the seed script with different tastes, so each shows different graph-based
          recommendations. They all use the password <code className="rounded bg-white/10 px-1.5 py-0.5 text-slate-200">{DEMO_PASSWORD}</code>.
        </p>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {DEMO_ACCOUNTS.map((account) => (
            <li key={account.email}>
              <button
                type="button"
                onClick={() => submit({ email: account.email, password: DEMO_PASSWORD })}
                disabled={submitting}
                className="card flex w-full items-center gap-3 p-4 text-left transition hover:border-accent/40"
              >
                <span className="grid h-10 w-10 place-items-center rounded-full bg-accent/15 text-accent-soft">
                  <UserRound className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-white">{account.name}</span>
                  <span className="block text-xs text-slate-400">{account.persona}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
