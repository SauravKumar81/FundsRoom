import React from 'react';
import { LayoutDashboard, Users, Package, FileText, History } from 'lucide-react';
import type { Tab } from '../types';

interface SidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems: { id: Tab; label: string; icon: React.FC<{ size?: number; color?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'customers', label: 'Customer CRM', icon: Users },
    { id: 'products', label: 'Products & Inventory', icon: Package },
    { id: 'challans', label: 'Sales Challans', icon: FileText },
    { id: 'logs', label: 'Stock Audit Logs', icon: History }
  ];

  return (
    <aside style={{
      width: '240px',
      backgroundColor: 'var(--color-surface-soft)',
      borderRight: '1px solid var(--color-hairline)',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      minHeight: 'calc(100vh - 64px)'
    }}>
      <div style={{ padding: '0 12px 12px 12px', fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--color-muted)' }}>
        Navigation
      </div>
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '12px 16px',
              borderRadius: 'var(--rounded-md)',
              border: 'none',
              backgroundColor: isActive ? 'var(--color-surface-card)' : 'transparent',
              color: isActive ? 'var(--color-ink)' : 'var(--color-muted)',
              fontWeight: isActive ? 600 : 500,
              fontSize: '14px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s ease',
              borderLeft: isActive ? '3px solid var(--color-primary)' : '3px solid transparent'
            }}
          >
            <Icon size={18} color={isActive ? 'var(--color-primary)' : 'var(--color-muted)'} />
            {item.label}
          </button>
        );
      })}
    </aside>
  );
};
