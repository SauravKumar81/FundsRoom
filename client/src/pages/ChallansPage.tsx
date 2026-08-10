import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { SalesChallan } from '../types';
import { ChallanModal } from '../components/ChallanModal';
import { Search, Plus, ChevronLeft, ChevronRight, FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface ChallansPageProps {
  setActiveTab: (tab: string) => void;
}

export const ChallansPage: React.FC<ChallansPageProps> = ({ setActiveTab }) => {
  const [challans, setChallans] = useState<SalesChallan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedChallan, setSelectedChallan] = useState<SalesChallan | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchChallans = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/challans', { params });
      setChallans(res.data.challans || []);
      setMeta(res.data.meta || { total: 0, totalPages: 1 });
    } catch (err) {
      console.error('Failed to fetch challans', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallans();
  }, [page, statusFilter]);

  const handleSearch = () => {
    setPage(1);
    fetchChallans();
  };

  const handleRowClick = async (challan: SalesChallan) => {
    setDetailLoading(true);
    setSelectedChallan(challan);
    try {
      const res = await api.get(`/challans/${challan.id}`);
      setSelectedChallan(res.data.challan);
    } catch (err) {
      console.error('Failed to fetch challan detail', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedChallan) return;
    setConfirming(true);
    try {
      const res = await api.patch(`/challans/${selectedChallan.id}/status`, { status: 'Confirmed' });
      setSelectedChallan(res.data.challan);
      fetchChallans();
    } catch (err: any) {
      alert(err.message || 'Failed to confirm challan');
    } finally {
      setConfirming(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedChallan) return;
    if (!window.confirm('Are you sure you want to cancel this challan? Stock will be restored.')) return;
    setCancelling(true);
    try {
      const res = await api.patch(`/challans/${selectedChallan.id}/status`, { status: 'Cancelled' });
      setSelectedChallan(res.data.challan);
      fetchChallans();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel challan');
    } finally {
      setCancelling(false);
    }
  };

  if (selectedChallan) {
    return (
      <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <button onClick={() => setSelectedChallan(null)} className="btn-secondary" style={{ alignSelf: 'flex-start', gap: '6px' }}>
          <ChevronLeft size={16} /> Back to Challans
        </button>

        {detailLoading ? (
          <div style={{ color: 'var(--color-muted)', padding: '20px' }}>Loading challan details...</div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-ink)', letterSpacing: '-0.5px' }}>{selectedChallan.challanNumber}</h2>
                <p style={{ color: 'var(--color-muted)', fontSize: '14px', marginTop: '4px' }}>
                  Created on {new Date(selectedChallan.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} by {selectedChallan.createdBy}
                </p>
              </div>
              <span className={`badge badge-${selectedChallan.status.toLowerCase()}`} style={{ fontSize: '14px', padding: '8px 16px' }}>
                {selectedChallan.status}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ backgroundColor: 'var(--color-surface-card)', borderRadius: 'var(--rounded-lg)', padding: '20px', border: '1px solid var(--color-hairline)' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>Customer Details</h4>
                <div style={{ fontSize: '15px', fontWeight: 600 }}>{selectedChallan.customerName}</div>
                {selectedChallan.customerEmail && <div style={{ fontSize: '13px', color: 'var(--color-body)' }}>{selectedChallan.customerEmail}</div>}
                {selectedChallan.customerMobile && <div style={{ fontSize: '13px', color: 'var(--color-body)' }}>{selectedChallan.customerMobile}</div>}
              </div>
              <div style={{ backgroundColor: 'var(--color-surface-card)', borderRadius: 'var(--rounded-lg)', padding: '20px', border: '1px solid var(--color-hairline)' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>Order Summary</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--color-body)' }}>Total Items</span>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{selectedChallan.totalQuantity}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', color: 'var(--color-body)' }}>Total Amount</span>
                  <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-ink)' }}>₹{selectedChallan.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--color-canvas)', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-surface-soft)', borderBottom: '1px solid var(--color-hairline)' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '12px', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Product</th>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '12px', color: 'var(--color-muted)', textTransform: 'uppercase' }}>SKU</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, fontSize: '12px', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Qty</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, fontSize: '12px', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Unit Price</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, fontSize: '12px', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedChallan.items || []).map((item, idx) => (
                    <tr key={item.id || idx} style={{ borderBottom: '1px solid var(--color-hairline)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600 }}>{item.productName}</td>
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '13px', color: 'var(--color-body)' }}>{item.productSku}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>₹{item.unitPrice.toLocaleString()}</td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>₹{(item.unitPrice * item.quantity).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ backgroundColor: 'var(--color-surface-soft)' }}>
                    <td colSpan={4} style={{ padding: '12px 16px', fontWeight: 700, textAlign: 'right' }}>Grand Total</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, fontSize: '16px' }}>₹{selectedChallan.totalAmount.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              {selectedChallan.status === 'Draft' && (
                <button onClick={handleConfirm} disabled={confirming} className="btn-primary" style={{ backgroundColor: '#166534', gap: '6px' }}>
                  <CheckCircle size={16} /> {confirming ? 'Confirming...' : 'Confirm Challan'}
                </button>
              )}
              {selectedChallan.status === 'Confirmed' && (
                <button onClick={handleCancel} disabled={cancelling} className="btn-primary" style={{ backgroundColor: '#991b1b', gap: '6px' }}>
                  <XCircle size={16} /> {cancelling ? 'Cancelling...' : 'Cancel Challan'}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--color-ink)' }}>Sales Challans</h2>
          <p style={{ color: 'var(--color-muted)', fontSize: '14px', marginTop: '4px' }}>Create and manage dispatch challans</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <Plus size={16} /> Create Challan
        </button>
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '360px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--color-muted)' }} />
          <input className="input-clay" style={{ paddingLeft: '36px' }} placeholder="Search by challan # or customer..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {['', 'Draft', 'Confirmed', 'Cancelled'].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} className={statusFilter === s ? 'btn-primary' : 'btn-secondary'} style={{ fontSize: '12px', padding: '8px 14px' }}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ color: 'var(--color-muted)', padding: '20px' }}>Loading challans...</div>
      ) : (
        <div style={{ backgroundColor: 'var(--color-canvas)', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-surface-soft)', borderBottom: '1px solid var(--color-hairline)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '12px', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Challan #</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '12px', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Customer</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, fontSize: '12px', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Items</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, fontSize: '12px', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Amount</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '12px', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '12px', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {challans.map((c) => (
                <tr key={c.id} onClick={() => handleRowClick(c)} style={{ borderBottom: '1px solid var(--color-hairline)', cursor: 'pointer', transition: 'background 0.15s' }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-soft)')} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}>
                  <td style={{ padding: '12px 16px', fontWeight: 700, fontFamily: 'monospace', fontSize: '13px' }}>{c.challanNumber}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{c.customerName}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>{c.totalQuantity}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700 }}>₹{c.totalAmount.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px' }}><span className={`badge badge-${c.status.toLowerCase()}`}>{c.status}</span></td>
                  <td style={{ padding: '12px 16px', color: 'var(--color-muted)', fontSize: '13px' }}>{new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                </tr>
              ))}
              {challans.length === 0 && (
                <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--color-muted)' }}>No challans found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {meta.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
            <ChevronLeft size={14} /> Prev
          </button>
          <span style={{ fontSize: '13px', color: 'var(--color-muted)' }}>Page {page} of {meta.totalPages}</span>
          <button onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))} disabled={page === meta.totalPages} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}

      <ChallanModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={fetchChallans} />
    </div>
  );
};