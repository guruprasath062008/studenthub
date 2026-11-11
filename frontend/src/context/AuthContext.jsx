import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// In production (Vercel), VITE_AUTH_API_URL and VITE_STUDENT_API_URL are set.
// In local dev, the Vite proxy handles /api/* routes automatically (no prefix needed).
export const AUTH_BASE = import.meta.env.VITE_AUTH_API_URL || '';
export const STUDENT_BASE = import.meta.env.VITE_STUDENT_API_URL || '';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('studenthub_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyExistingToken = async () => {
      const savedToken = localStorage.getItem('studenthub_token');
      const savedUser = localStorage.getItem('studenthub_user');

      if (savedToken && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          const res = await fetch(`${AUTH_BASE}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${savedToken}` }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.user) {
              setUser(data.user);
              localStorage.setItem('studenthub_user', JSON.stringify(data.user));
            }
          } else {
            logout();
          }
        } catch (err) {
          console.warn('[AuthContext] Verification failed, using cached session:', err);
        }
      }
      setLoading(false);
    };

    verifyExistingToken();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await fetch(`${AUTH_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed. Please verify credentials.');
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('studenthub_token', data.token);
      localStorage.setItem('studenthub_user', JSON.stringify(data.user));

      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const register = async (name, email, password, role = 'faculty') => {
    try {
      const res = await fetch(`${AUTH_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Registration failed.');
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('studenthub_token', data.token);
      localStorage.setItem('studenthub_user', JSON.stringify(data.user));

      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('studenthub_token');
    localStorage.removeItem('studenthub_user');
  };

  const authFetch = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      console.warn('[AuthContext] Received 401 unauthorized response.');
    }
    return res;
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};