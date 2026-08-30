import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Car, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import { loginSchema } from '../lib/validators';

import { useAuth } from '../auth/useAuth';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { initialized, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    if (initialized && user && isMounted) {
      logger.debug('User already logged in, redirecting to dashboard');
      navigate('/', { replace: true });
    }
    return () => { isMounted = false; };
  }, [initialized, user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const validated = loginSchema.parse({ email, password });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: validated.email,
        password: validated.password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else if (data.user) {
        navigate('/', { replace: true });
      }
    } catch (err: unknown) {
      logger.error('Login error:', err);
      if (err instanceof Error && err.name === 'ZodError') {
        const zodError = err as any;
        setError(zodError.errors[0]?.message || 'بيانات غير صالحة.');
      } else {
        setError('حدث خطأ غير متوقع أثناء تسجيل الدخول.');
      }
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center', 
      alignItems: 'center',
      padding: 'var(--spacing-xl)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--accent-primary)', marginBottom: 'var(--spacing-md)' }}>
          <Car size={48} />
        </div>
        <h2 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-xs)' }}>دخول إلى نظام الـ CRM</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          أو <Link to="/signup" style={{ color: 'var(--accent-primary)' }}>إنشاء حساب جديد</Link>
        </p>
      </div>

      <div className="glass-card" style={{ 
        width: '100%', 
        maxWidth: '400px', 
        padding: 'var(--spacing-xl)' 
      }}>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          {error && (
            <div style={{ 
              background: 'rgba(225, 112, 85, 0.1)', 
              border: '1px solid var(--accent-danger)', 
              padding: 'var(--spacing-md)', 
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              gap: 'var(--spacing-sm)',
              alignItems: 'center',
              color: 'var(--accent-danger)'
            }}>
              <AlertCircle size={20} />
              <span style={{ fontSize: '0.875rem' }}>{error}</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
            <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>البريد الإلكتروني</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                outline: 'none',
                width: '100%'
              }}
              placeholder="you@email.com"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
            <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>كلمة المرور</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                outline: 'none',
                width: '100%'
              }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              background: 'var(--accent-primary)',
              color: 'white',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              fontWeight: 600,
              marginTop: 'var(--spacing-sm)',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {loading ? 'جاري الدخول...' : 'دخول إلى النظام'}
          </button>
        </form>
      </div>
    </div>
  );
};
