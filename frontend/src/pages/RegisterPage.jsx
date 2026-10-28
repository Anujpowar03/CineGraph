import { Loader2, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { LogoMark } from '../components/layout/Logo.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

function validate({ name, email, password, confirm }) {
  const errors = {};
  if (name.trim().length < 2) errors.name = 'Please enter at least 2 characters.';
  if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Please enter a valid email address.';
  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    errors.password = 'Use at least 8 characters with a letter and a number.';
  }
  if (confirm !== password) errors.confirm = 'Passwords do not match.';
  return errors;
}

export default function RegisterPage() {
  const { user, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/recommendations" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    setSubmitting(true);
    setServerError('');
    try {
      const created = await register({ name: form.name, email: form.email, password: form.password });
      toast.success(`Welcome to CineGraph, ${created.name.split(' ')[0]}! Pick a few genres to get started.`);
      navigate('/recommendations', { replace: true });
    } catch (err) {
      // Server-side validation messages are shown next to the matching field.
      const fieldErrors = Object.fromEntries((err.details || []).map((d) => [d.field, d.message]));
      setErrors(fieldErrors);
      setServerError(Object.keys(fieldErrors).length ? '' : err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const field = (name, label, type, autoComplete) => (
    <div>
      <label htmlFor={name} className="label">{label}</label>
      <input
        id={name}
        type={type}
        autoComplete={autoComplete}
        className="input"
        value={form[name]}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
      />
      {errors[name] && <p id={`${name}-error`} className="mt-1 text-xs text-rose-300">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-12">
      <section className="card w-full max-w-md p-6 sm:p-8">
        <LogoMark className="h-10 w-10" />
        <h1 className="mt-4 text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-slate-400">Passwords are hashed with bcrypt and never leave the server.</p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
          {field('name', 'Name', 'text', 'name')}
          {field('email', 'Email', 'email', 'email')}
          {field('password', 'Password', 'password', 'new-password')}
          {field('confirm', 'Confirm password', 'password', 'new-password')}
          {serverError && <p className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200" role="alert">{serverError}</p>}
          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <UserPlus className="h-4 w-4" aria-hidden="true" />}
            Create account
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-slate-400">
          Already registered? <Link to="/login" className="font-medium text-accent-soft hover:underline">Sign in</Link>
        </p>
      </section>
    </div>
  );
}
