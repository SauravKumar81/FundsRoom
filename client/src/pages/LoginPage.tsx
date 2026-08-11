import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ShieldAlert, Crown, Briefcase, Package, BarChart2 } from 'lucide-react';

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
      backgroundColor: '#FAF9F5',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        padding: '40px 36px',
        width: '100%',
        maxWidth: '440px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.04), 0 8px 10px -6px rgba(0, 0, 0, 0.02)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#111827', letterSpacing: '-0.5px', marginBottom: '4px' }}>
            Fundsroom
          </h1>
          <p style={{ fontSize: '14px', fontWeight: 500, color: '#6B7280', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
            ERP + CRM
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#FEF2F2',
            border: '1px solid #FCA5A5',
            color: '#991B1B',
            padding: '12px 16px',
            borderRadius: '10px',
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

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#1F2937', display: 'block', marginBottom: '8px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                style={{
                  width: '100%',
                  height: '46px',
                  paddingLeft: '44px',
                  paddingRight: '14px',
                  fontSize: '14px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '10px',
                  backgroundColor: '#FFFFFF',
                  color: '#111827',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#1F2937', display: 'block', marginBottom: '8px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  height: '46px',
                  paddingLeft: '44px',
                  paddingRight: '14px',
                  fontSize: '14px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '10px',
                  backgroundColor: '#FFFFFF',
                  color: '#111827',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              height: '48px',
              marginTop: '4px',
              backgroundColor: '#2ECC71',
              color: '#064E3B',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
              opacity: submitting ? 0.7 : 1
            }}
          >
            {submitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ margin: '28px 0 24px 0', borderTop: '1px solid #E5E7EB' }} />

        {/* Role Presets */}
        <div>
          <p style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#9CA3AF',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            TEST ROLE PRESETS
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setPreset('admin@fundsroom.com')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 12px',
                height: '42px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#1F2937',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Crown size={16} /> Admin Role
            </button>
            <button
              type="button"
              onClick={() => setPreset('sales@fundsroom.com')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 12px',
                height: '42px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#1F2937',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Briefcase size={16} /> Sales Role
            </button>
            <button
              type="button"
              onClick={() => setPreset('warehouse@fundsroom.com')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 12px',
                height: '42px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                color: '#1F2937',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Package size={16} /> Warehouse Role
            </button>
            <button
              type="button"
              onClick={() => setPreset('accounts@fundsroom.com')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 12px',
                height: '42px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#1F2937',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <BarChart2 size={16} /> Accounts Role
            </button>
          </div>
          <p style={{
            fontSize: '12px',
            color: '#9CA3AF',
            textAlign: 'center',
            marginTop: '20px'
          }}>
            Default Password: Password123!
          </p>
        </div>
      </div>
    </div>
  );
};

