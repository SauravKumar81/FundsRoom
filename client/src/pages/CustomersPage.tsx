import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Customer, Tab } from '../types';
import { CustomerModal } from '../components/CustomerModal';
import { Search, Plus, Filter, ChevronLeft, ChevronRight, Clock, MessageSquare } from 'lucide-react';

interface CustomersPageProps {
  setActiveTab: (tab: Tab) => void;
}

export const CustomersPage: React.FC<CustomersPageProps> = ({ setActiveTab: _setActiveTab }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.customerType = typeFilter;
      const res = await api.get('/customers', { params });
      setCustomers(res.data.customers || []);
      setMeta(res.data.meta || { total: 0, totalPages: 1 });
    } catch (err) {
      console.error('Failed to fetch customers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, statusFilter, typeFilter]);

  const handleSearch = () => {
    setPage(1);
    fetchCustomers();
  };

  const handleSave = async (data: Partial<Customer>) => {
    if (editingCustomer) {
      await api.put(`/customers/${editingCustomer.id}`, data);
    } else {
      await api.post('/customers', data);
    }
    fetchCustomers();
  };

  const handleRowClick = async (customer: Customer) => {
    setDetailLoading(true);
    setSelectedCustomer(customer);
    try {
      const res = await api.get(`/customers/${customer.id}`);
      setSelectedCustomer(res.data.customer);
    } catch (err) {
      console.error('Failed to fetch customer detail', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!selectedCustomer || !noteText.trim()) return;
    setNoteSaving(true);
    try {
      await api.post(`/customers/${selectedCustomer.id}/notes`, { note: noteText });
      const res = await api.get(`/customers/${selectedCustomer.id}`);
      setSelectedCustomer(res.data.customer);
      setNoteText('');
    } catch (err) {
      console.error('Failed to add note', err);
    } finally {
      setNoteSaving(false);
    }
  };

  if (selectedCustomer) {
    return (
      <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <button onClick={() => setSelectedCustomer(null)} className="btn-secondary" style={{ alignSelf: 'flex-start', gap: '6px' }}>
          <ChevronLeft size={16} /> Back to Customers
        </button>

        {detailLoading ? (
          <div style={{ color: 'var(--color-muted)', padding: '20px' }}>Loading customer details...</div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-ink)', letterSpacing: '-0.5px' }}>{selectedCustomer.name}</h2>
                <p style={{ color: 'var(--color-muted)', fontSize: '14px', marginTop: '4px' }}>{selectedCustomer.businessName}</p>
              </div>
              <button onClick={() => { setEditingCustomer(selectedCustomer); setModalOpen(true); }} className="btn-secondary">Edit Customer</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ backgroundColor: 'var(--color-surface-card)', borderRadius: 'var(--rounded-lg)', padding: '16px', border: '1px solid var(--color-hairline)' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)', marginBottom: '4px' }}>Mobile</div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{selectedCustomer.mobile}</div>
              </div>
              <div style={{ backgroundColor: 'var(--color-surface-card)', borderRadius: 'var(--rounded-lg)', padding: '16px', border: '1px solid var(--color-hairline)' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)', marginBottom: '4px' }}>Email</div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{selectedCustomer.email}</div>
              </div>
              <div style={{ backgroundColor: 'var(--color-surface-card)', borderRadius: 'var(--rounded-lg)', padding: '16px', border: '1px solid var(--color-hairline)' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)', marginBottom: '4px' }}>Type</div>
                <span className={`badge badge-${selectedCustomer.customerType.toLowerCase()}`}>{selectedCustomer.customerType}</span>
              </div>
              <div style={{ backgroundColor: 'var(--color-surface-card)', borderRadius: 'var(--rounded-lg)', padding: '16px', border: '1px solid var(--color-hairline)' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)', marginBottom: '4px' }}>Status</div>
                <span className={`badge badge-${selectedCustomer.status.toLowerCase()}`}>{selectedCustomer.status}</span>
              </div>
              <div style={{ backgroundColor: 'var(--color-surface-card)', borderRadius: 'var(--rounded-lg)', padding: '16px', border: '1px solid var(--color-hairline)' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)', marginBottom: '4px' }}>GST Number</div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{selectedCustomer.gstNumber || 'N/A'}</div>
              </div>
              <div style={{ backgroundColor: 'var(--color-surface-card)', borderRadius: 'var(--rounded-lg)', padding: '16px', border: '1px solid var(--color-hairline)' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)', marginBottom: '4px' }}>Next Follow-up</div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>{selectedCustomer.followUpDate || 'Not scheduled'}</div>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--color-surface-card)', borderRadius: 'var(--rounded-lg)', padding: '16px', border: '1px solid var(--color-hairline)' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)', marginBottom: '4px' }}>Address</div>
              <div style={{ fontSize: '14px' }}>{selectedCustomer.address}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-ink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} /> Follow-up Timeline
              </h3>

              <div style={{ backgroundColor: 'var(--color-canvas)', borderRadius: 'var(--rounded-md)', padding: '16px', border: '1px solid var(--color-hairline)' }}>
                <textarea
                  className="input-clay"
                  rows={3}
                  placeholder="Add a follow-up note..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  style={{ resize: 'vertical', marginBottom: '10px' }}
                />
                <button onClick={handleAddNote} disabled={noteSaving || !noteText.trim()} className="btn-primary" style={{ fontSize: '13px', padding: '8px 16px' }}>
                  <MessageSquare size={14} /> {noteSaving ? 'Saving...' : 'Add Note'}
                </button>
              </div>

              {selectedCustomer.followUps && selectedCustomer.followUps.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedCustomer.followUps.map((fu) => (
                    <div key={fu.id} style={{ backgroundColor: 'var(--color-canvas)', borderRadius: 'var(--rounded-md)', padding: '16px', border: '1px solid var(--color-hairline)', borderLeft: '3px solid var(--color-brand-teal)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)' }}>{fu.createdBy}</span>
                        <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>{new Date(fu.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p style={{ fontSize: '14px', lineHeight: 1.5 }}>{fu.note}</p>
                      {fu.followUpDate && (
                        <div style={{ fontSize: '12px', color: 'var(--color-brand-teal)', marginTop: '6px', fontWeight: 600 }}>
                          Follow-up: {fu.followUpDate}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ color: 'var(--color-muted)', fontSize: '14px', fontStyle: 'italic' }}>No follow-up notes yet.</div>
              )}
            </div>
          </>
        )}

        <CustomerModal customer={editingCustomer} isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingCustomer(null); }} onSave={handleSave} />
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--color-ink)' }}>Customer CRM</h2>
          <p style={{ color: 'var(--color-muted)', fontSize: '14px', marginTop: '4px' }}>Manage leads, active accounts, and follow-ups</p>
        </div>
        <button onClick={() => { setEditingCustomer(null); setModalOpen(true); }} className="btn-primary">
          <Plus size={16} /> Add Customer
        </button>
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '360px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--color-muted)' }} />
          <input className="input-clay" style={{ paddingLeft: '36px' }} placeholder="Search by name, email, mobile..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
        </div>
        <select className="input-clay" style={{ width: 'auto', minWidth: '130px' }} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="Lead">Lead</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
        <select className="input-clay" style={{ width: 'auto', minWidth: '140px' }} value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}>
          <option value="">All Types</option>
          <option value="Retail">Retail</option>
          <option value="Wholesale">Wholesale</option>
          <option value="Distributor">Distributor</option>
        </select>
        <button onClick={handleSearch} className="btn-primary" style={{ fontSize: '13px', padding: '10px 16px' }}>
          <Filter size={14} /> Search
        </button>
      </div>

      {loading ? (
        <div style={{ color: 'var(--color-muted)', padding: '20px' }}>Loading customers...</div>
      ) : (
        <div style={{ backgroundColor: 'var(--color-canvas)', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-surface-soft)', borderBottom: '1px solid var(--color-hairline)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '12px', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '12px', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Business</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '12px', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Type</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '12px', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '12px', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Follow-up</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} onClick={() => handleRowClick(c)} style={{ borderBottom: '1px solid var(--color-hairline)', cursor: 'pointer', transition: 'background 0.15s' }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-soft)')} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{c.name}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--color-body)' }}>{c.businessName}</td>
                  <td style={{ padding: '12px 16px' }}><span className={`badge badge-${c.customerType.toLowerCase()}`}>{c.customerType}</span></td>
                  <td style={{ padding: '12px 16px' }}><span className={`badge badge-${c.status.toLowerCase()}`}>{c.status}</span></td>
                  <td style={{ padding: '12px 16px', color: 'var(--color-muted)' }}>{c.followUpDate || '—'}</td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--color-muted)' }}>No customers found</td></tr>
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

      <CustomerModal customer={editingCustomer} isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingCustomer(null); }} onSave={handleSave} />
    </div>
  );
};