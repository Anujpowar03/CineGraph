import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';

/**
 * Client-side guard for pages that need a session. This only improves UX -
 * the API enforces authentication and authorisation on every request.
 */
export default function ProtectedRoute({ children }) {
  const { user, initialising } = useAuth();
  const location = useLocation();
  if (initialising) return <LoadingSpinner label="Checking your session…" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return children;
}
