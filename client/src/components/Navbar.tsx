import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, ShieldCheck, Box } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  const getRoleColor = (role?: string) => {
    switch (role) {
      case 'Admin': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Sales': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Warehouse': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Accounts': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <header style={{
      height: '64px',
      backgroundColor: 'var(--color-canvas)',
      borderBottom: '1px solid var(--color-hairline)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          backgroundColor: 'var(--color-primary)',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff'
        }}>
          <Box size={20} />
        </div>
        <div>
          <h1 style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--color-ink)' }}>
            Fundsroom <span style={{ fontWeight: 400, color: 'var(--color-muted)', fontSize: '14px' }}>ERP + CRM</span>
          </h1>
        </div>
      </div>

      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge" style={{
              backgroundColor: 'var(--color-surface-card)',
              color: 'var(--color-ink)',
              border: '1px solid var(--color-hairline)',
              padding: '6px 12px',
              fontSize: '13px'
            }}>
              <ShieldCheck size={14} style={{ marginRight: '4px' }} />
              Role: <strong>{user.role}</strong>
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            paddingLeft: '16px',
            borderLeft: '1px solid var(--color-hairline)'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-surface-soft)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--color-hairline)'
            }}>
              <UserIcon size={16} color="var(--color-ink)" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-ink)' }}>{user.name}</span>
              <span style={{ fontSize: '11px', color: 'var(--color-muted)' }}>{user.email}</span>
            </div>
            <button
              onClick={logout}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '12px', marginLeft: '8px' }}
              title="Sign Out"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
