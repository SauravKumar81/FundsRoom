import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { StockMovementLog, Tab } from '../types';
import { Search, Filter, History } from 'lucide-react';

interface StockLogsPageProps {
  setActiveTab: (tab: Tab) => void;
}

export const StockLogsPage: React.FC<StockLogsPageProps> = ({ setActiveTab: _setActiveTab }) => {
  const [logs, setLogs] = useState<StockMovementLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/products/logs/all');
      let data = res.data.logs || [];
      if (typeFilter) {
        data = data.filter((l: StockMovementLog) => l.movementType === typeFilter);
      }
      if (search) {
        const q = search.toLowerCase();
        data = data.filter((l: StockMovementLog) =>
          l.reason.toLowerCase().includes(q) ||
          l.createdBy.toLowerCase().includes(q) ||
          l.product?.name?.toLowerCase().includes(q) ||
          l.product?.sku?.toLowerCase().includes(q)
        );
      }
      setLogs(data);
    } catch (err) {
      console.error('Failed to fetch stock logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [typeFilter]);

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--color-ink)' }}>Stock Audit Logs</h2>
        <p style={{ color: 'var(--color-muted)', fontSize: '14px', marginTop: '4px' }}>Complete audit trail of all inventory movements</p>
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '360px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--color-muted)' }} />
          <input className="input-clay" style={{ paddingLeft: '36px' }} placeholder="Search by product, reason, or user..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchLogs()} />
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['', 'IN', 'OUT'].map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} className={typeFilter === t ? 'btn-primary' : 'btn-secondary'} style={{ fontSize: '12px', padding: '8px 14px' }}>
              {t === 'IN' ? '↑ Stock IN' : t === 'OUT' ? '↓ Stock OUT' : 'All'}
            </button>
          ))}
        </div>
        <button onClick={fetchLogs} className="btn-secondary" style={{ fontSize: '13px', padding: '10px 16px' }}>
          <Filter size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <div style={{ color: 'var(--color-muted)', padding: '20px' }}>Loading stock logs...</div>
      ) : logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'var(--color-muted)' }}>
          <History size={40} style={{ marginBottom: '12px', opacity: 0.4 }} />
          <div style={{ fontSize: '16px', fontWeight: 600 }}>No stock movements found</div>
          <div style={{ fontSize: '13px', marginTop: '4px' }}>Stock movements will appear here when inventory changes</div>
        </div>
      ) : (
        <div style={{ backgroundColor: 'var(--color-canvas)', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-surface-soft)', borderBottom: '1px solid var(--color-hairline)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '12px', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Product</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '12px', color: 'var(--color-muted)', textTransform: 'uppercase' }}>SKU</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, fontSize: '12px', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Type</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, fontSize: '12px', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Quantity</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '12px', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Reason</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '12px', color: 'var(--color-muted)', textTransform: 'uppercase' }}>By</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '12px', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid var(--color-hairline)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{log.product?.name || '—'}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '13px', color: 'var(--color-body)' }}>{log.product?.sku || '—'}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600,
                      color: log.movementType === 'IN' ? '#166534' : '#991b1b',
                      backgroundColor: log.movementType === 'IN' ? '#dcfce7' : '#fee2e2',
                      padding: '4px 10px', borderRadius: '9999px'
                    }}>
                      {log.movementType === 'IN' ? '↑ IN' : '↓ OUT'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 700 }}>{log.quantityChanged}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--color-body)' }}>{log.reason}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--color-muted)' }}>{log.createdBy}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--color-muted)', fontSize: '13px' }}>
                    {new Date(log.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};