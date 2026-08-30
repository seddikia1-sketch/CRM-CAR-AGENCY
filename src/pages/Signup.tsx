import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Car, AlertCircle } from 'lucide-react';
import { supabase, isLocalMode } from '../lib/supabase';
import { logger } from '../lib/logger';
import { signupSchema } from '../lib/validators';
import { useAuth } from '../auth/useAuth';

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { initialized, user, localLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (initialized && user) {
      navigate('/', { replace: true });
    }
  }, [initialized, user, navigate]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // وضع محلي — إنشاء حساب محلي فوري
      if (isLocalMode) {
        if (!email.trim() || !companyName.trim()) {
          setError('أدخل اسم المكتب والبريد الإلكتروني');
          setLoading(false);
          return;
        }
        localLogin(email.trim(), companyName.trim());
        navigate('/', { replace: true });
        return;
      }

      const companyId = crypto.randomUUID();
      const validated = signupSchema.parse({ companyName, email, password });

      const { error: authError } = await supabase.auth.signUp({
        email: validated.email,
        password: validated.password,
        options: {
          data: {
            company_name: validated.companyName,
            company_id: companyId,
          },
        },
      });

      if (authError) throw authError;

      await (supabase as any).from('companies').insert({
        id: companyId,
        name: validated.companyName,
      });

      alert('تم التسجيل بنجاح! إذا لزم الأمر، قم بتأكيد بريدك الإلكتروني.');
      navigate('/');
    } catch (err: unknown) {
      logger.error('Signup error:', err);
      if (err instanceof Error && err.name === 'ZodError') {
        const zodError = err as any;
        setError(zodError.errors[0]?.message || 'بيانات غير صالحة.');
      } else if (err instanceof Error) {
        setError(err.message || 'خطأ في التسجيل');
      } else {
        setError('حدث خطأ غير متوقع.');
      }
    } finally {
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
      padding: 'var(--spacing-xl)',
    }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
        <div style={{ display: 'flex', justifyContent: 'center', color: 'var(--accent-primary)', marginBottom: 'var(--spacing-md)' }}>
          <Car size={48} />
        </div>
        <h2 style={{ fontSize: '2rem', marginBottom: 'var(--spacing-xs)' }}>إنشاء حساب جديد</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          لديك حساب بالفعل؟ <Link to="/login" style={{ color: 'var(--accent-primary)' }}>تسجيل الدخول</Link>
        </p>
        {isLocalMode && (
          <p style={{
            marginTop: '12px',
            padding: '8px 14px',
            background: 'rgba(34, 197, 94, 0.12)',
            borderRadius: '8px',
            color: '#22c55e',
            fontSize: '0.875rem',
          }}>
            ✅ الوضع المحلي — الحساب يُحفظ في متصفحك مباشرة
          </p>
        )}
      </div>

      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '400px',
        padding: 'var(--spacing-xl)',
      }}>
        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
          {error && (
            <div style={{
              background: 'rgba(225, 112, 85, 0.1)',
              border: '1px solid var(--accent-danger)',
              padding: 'var(--spacing-md)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              gap: 'var(--spacing-sm)',
              alignItems: 'center',
              color: 'var(--accent-danger)',
            }}>
              <AlertCircle size={20} />
              <span style={{ fontSize: '0.875rem' }}>{error}</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
            <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>اسم المكتب / الوكالة</label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                outline: 'none',
                width: '100%',
              }}
              placeholder="مكتب استيراد السيارات الصينية"
            />
          </div>

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
                width: '100%',
              }}
              placeholder="you@email.com"
            />
          </div>

          {!isLocalMode && (
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
                  width: '100%',
                }}
                placeholder="••••••••"
                minLength={6}
              />
            </div>
          )}

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
              border: 'none',
            }}
          >
            {loading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
          </button>
        </form>
      </div>
    </div>
  );
};
