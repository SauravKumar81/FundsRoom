import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ShieldAlert } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const setPreset = (presetEmail: string) => {
    setEmail(presetEmail);
    setPassword('Password123!');
    setError(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--color-canvas)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'var(--color-surface-card)',
        borderRadius: 'var(--rounded-xl)',
        padding: '40px',
        width: '100%',
        maxWidth: '460px',
        border: '1px solid var(--color-hairline)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-ink)', letterSpacing: '-0.5px' }}>
            Fundsroom ERP + CRM
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--color-muted)', marginTop: '4px' }}>
            Sign in to access your operations portal
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee2e2',
            color: '#991b1b',
            padding: '12px 16px',
            borderRadius: 'var(--rounded-md)',
            fontSize: '13px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <ShieldAlert size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-ink)', display: 'block', marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-muted)' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="input-clay"
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-ink)', display: 'block', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--color-muted)' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-clay"
                style={{ paddingLeft: '40px' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '8px', fontSize: '15px' }}
          >
            {submitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--color-hairline)' }}>
          <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)', marginBottom: '10px', textAlign: 'center' }}>
            TEST ROLE PRESETS (One-Click Auto Fill)
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              onClick={() => setPreset('admin@fundsroom.com')}
              className="btn-secondary"
              style={{ fontSize: '12px', padding: '8px 10px', justifyContent: 'center' }}
            >
              👑 Admin Role
            </button>
            <button
              onClick={() => setPreset('sales@fundsroom.com')}
              className="btn-secondary"
              style={{ fontSize: '12px', padding: '8px 10px', justifyContent: 'center' }}
            >
              💼 Sales Role
            </button>
            <button
              onClick={() => setPreset('warehouse@fundsroom.com')}
              className="btn-secondary"
              style={{ fontSize: '12px', padding: '8px 10px', justifyContent: 'center' }}
            >
              📦 Warehouse Role
            </button>
            <button
              onClick={() => setPreset('accounts@fundsroom.com')}
              className="btn-secondary"
              style={{ fontSize: '12px', padding: '8px 10px', justifyContent: 'center' }}
            >
              📊 Accounts Role
            </button>
          </div>
          <p style={{ fontSize: '11px', color: 'var(--color-muted)', textAlign: 'center', marginTop: '12px' }}>
            Default Password for all preset accounts: <code>Password123!</code>
          </p>
        </div>
      </div>
    </div>
  );
};
