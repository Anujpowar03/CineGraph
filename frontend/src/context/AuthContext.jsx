import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, userApi } from '../services/api.js';

/**
 * Holds the signed-in user (from GET /auth/session) plus the ids of their liked
 * movies, so every FavoriteButton in the app shows the correct state.
 * The session itself lives in an httpOnly cookie managed by the API.
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initialising, setInitialising] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState(() => new Set());
  // Bumped whenever the user's interactions change, so pages can refetch recommendations.
  const [activityVersion, setActivityVersion] = useState(0);

  const loadFavorites = useCallback(async () => {
    try {
      const res = await userApi.favorites(100);
      setFavoriteIds(new Set(res.data.map((m) => m.movieId)));
    } catch {
      setFavoriteIds(new Set());
    }
  }, []);

  useEffect(() => {
    let active = true;
    authApi
      .session()
      .then((res) => {
        if (!active) return;
        setUser(res.data.user);
        if (res.data.user) loadFavorites();
      })
      .catch(() => active && setUser(null))
      .finally(() => active && setInitialising(false));
    return () => {
      active = false;
    };
  }, [loadFavorites]);

  const login = useCallback(
    async (email, password) => {
      const res = await authApi.login(email, password);
      setUser(res.data.user);
      await loadFavorites();
      setActivityVersion((v) => v + 1);
      return res.data.user;
    },
    [loadFavorites],
  );

  const register = useCallback(async (payload) => {
    const res = await authApi.register(payload);
    setUser(res.data.user);
    setFavoriteIds(new Set());
    return res.data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      setFavoriteIds(new Set());
      setActivityVersion((v) => v + 1);
    }
  }, []);

  const toggleFavorite = useCallback(
    async (movieId) => {
      const wasFavorite = favoriteIds.has(movieId);
      const apply = (add) =>
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (add) next.add(movieId);
          else next.delete(movieId);
          return next;
        });
      apply(!wasFavorite); // optimistic update
      try {
        if (wasFavorite) await userApi.unlike(movieId);
        else await userApi.like(movieId);
        setActivityVersion((v) => v + 1);
        return !wasFavorite;
      } catch (error) {
        apply(wasFavorite); // roll back
        throw error;
      }
    },
    [favoriteIds],
  );

  const markActivity = useCallback(() => setActivityVersion((v) => v + 1), []);

  const value = useMemo(
    () => ({ user, initialising, login, register, logout, favoriteIds, toggleFavorite, activityVersion, markActivity }),
    [user, initialising, login, register, logout, favoriteIds, toggleFavorite, activityVersion, markActivity],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}
