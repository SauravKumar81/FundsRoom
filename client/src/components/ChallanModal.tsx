import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Customer, Product, ChallanItem } from '../types';
import { X, Search, Plus, Trash2, ChevronRight, Package } from 'lucide-react';

interface ChallanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export const ChallanModal: React.FC<ChallanModalProps> = ({ isOpen, onClose, onSave }) => {
  const [step, setStep] = useState(1);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [items, setItems] = useState<ChallanItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedCustomer(null);
      setItems([]);
      setProductSearch('');
      setSearchResults([]);
      setError(null);
      loadCustomers();
      loadProducts();
    }
  }, [isOpen]);

  const loadCustomers = async () => {
    try {
      const res = await api.get('/customers', { params: { limit: 100, status: 'Active' } });
      setCustomers(res.data.customers || []);
    } catch (err) {
      console.error('Failed to load customers', err);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await api.get('/products', { params: { limit: 100 } });
      setProducts(res.data.products || []);
    } catch (err) {
      console.error('Failed to load products', err);
    }
  };

  const handleCustomerSearch = (query: string) => {
    setProductSearch(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const q = query.toLowerCase();
    const filtered = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
    setSearchResults(filtered);
  };

  const addProduct = (product: Product) => {
    const existing = items.find(i => i.productId === product.id);
    if (existing) {
      setItems(items.map(i =>
        i.productId === product.id
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ));
    } else {
      setItems([...items, {
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        unitPrice: product.unitPrice,
        quantity: 1
      }]);
    }
    setProductSearch('');
    setSearchResults([]);
  };

  const updateQuantity = (productId: string, qty: number) => {
    if (qty < 1) return;
    const product = products.find(p => p.id === productId);
    if (product && qty > product.currentStock) {
      setError(`Only ${product.currentStock} units available for ${product.name}`);
      return;
    }
    setItems(items.map(i =>
      i.productId === productId ? { ...i, quantity: qty } : i
    ));
    setError(null);
  };

  const removeItem = (productId: string) => {
    setItems(items.filter(i => i.productId !== productId));
  };

  const totalAmount = items.reduce((sum, i) => sum + (i.unitPrice * i.quantity), 0);
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);

  const handleSubmit = async () => {
    if (!selectedCustomer || items.length === 0) return;
    setSaving(true);
    setError(null);
    try {
      await api.post('/challans', {
        customerId: selectedCustomer.id,
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice })),
        status: 'Draft'
      });
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create challan');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '720px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-ink)' }}>Create Sales Challan</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} color="var(--color-muted)" />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {['Select Customer', 'Add Items', 'Review & Submit'].map((label, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', fontWeight: 700,
                backgroundColor: step > i + 1 ? '#dcfce7' : step === i + 1 ? 'var(--color-primary)' : 'var(--color-surface-card)',
                color: step === i + 1 ? '#fff' : step > i + 1 ? '#166534' : 'var(--color-muted)',
                border: step === i + 1 ? 'none' : '1px solid var(--color-hairline)'
              }}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: '13px', fontWeight: step === i + 1 ? 600 : 400, color: step === i + 1 ? 'var(--color-ink)' : 'var(--color-muted)' }}>{label}</span>
              {i < 2 && <ChevronRight size={14} color="var(--color-muted)" />}
            </div>
          ))}
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600 }}>Select a Customer *</label>
            <div style={{ maxHeight: '360px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {customers.map(c => (
                <div
                  key={c.id}
                  onClick={() => { setSelectedCustomer(c); setStep(2); }}
                  style={{
                    padding: '14px 16px', borderRadius: 'var(--rounded-md)', cursor: 'pointer',
                    border: selectedCustomer?.id === c.id ? '2px solid var(--color-primary)' : '1px solid var(--color-hairline)',
                    backgroundColor: selectedCustomer?.id === c.id ? 'var(--color-surface-card)' : 'var(--color-canvas)',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => { if (selectedCustomer?.id !== c.id) e.currentTarget.style.borderColor = 'var(--color-primary)'; }}
                  onMouseLeave={(e) => { if (selectedCustomer?.id !== c.id) e.currentTarget.style.borderColor = 'var(--color-hairline)'; }}
                >
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>{c.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '2px' }}>{c.businessName} · {c.mobile}</div>
                  <div style={{ marginTop: '4px' }}><span className={`badge badge-${c.customerType.toLowerCase()}`} style={{ fontSize: '11px' }}>{c.customerType}</span></div>
                </div>
              ))}
              {customers.length === 0 && <div style={{ color: 'var(--color-muted)', padding: '16px', textAlign: 'center' }}>No active customers found</div>}
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {selectedCustomer && (
              <div style={{ backgroundColor: 'var(--color-surface-card)', borderRadius: 'var(--rounded-md)', padding: '12px 16px', border: '1px solid var(--color-hairline)' }}>
                <span style={{ fontSize: '13px', color: 'var(--color-muted)' }}>Customer: </span>
                <strong>{selectedCustomer.name}</strong>
                <span style={{ fontSize: '13px', color: 'var(--color-muted)' }}> · {selectedCustomer.businessName}</span>
              </div>
            )}

            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--color-muted)' }} />
              <input
                className="input-clay"
                style={{ paddingLeft: '36px' }}
                placeholder="Search products by name or SKU..."
                value={productSearch}
                onChange={(e) => handleCustomerSearch(e.target.value)}
              />
              {searchResults.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'var(--color-canvas)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-md)', maxHeight: '200px', overflowY: 'auto', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                  {searchResults.map(p => (
                    <div
                      key={p.id}
                      onClick={() => addProduct(p)}
                      style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--color-hairline)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-surface-soft)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600 }}>{p.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>SKU: {p.sku} · Stock: {p.currentStock} · ₹{p.unitPrice.toLocaleString()}</div>
                      </div>
                      <Plus size={16} color="var(--color-primary)" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase' }}>Line Items ({items.length})</div>
                {items.map(item => {
                  const prod = products.find(p => p.id === item.productId);
                  return (
                    <div key={item.productId} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', backgroundColor: 'var(--color-surface-card)', borderRadius: 'var(--rounded-md)', border: '1px solid var(--color-hairline)' }}>
                      <Package size={18} color="var(--color-muted)" />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600 }}>{item.productName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>SKU: {item.productSku} · ₹{item.unitPrice.toLocaleString()} each</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="number"
                          min="1"
                          max={prod?.currentStock}
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value, 10) || 1)}
                          className="input-clay"
                          style={{ width: '70px', textAlign: 'center', padding: '6px' }}
                        />
                        <span style={{ fontSize: '14px', fontWeight: 700, minWidth: '80px', textAlign: 'right' }}>₹{(item.unitPrice * item.quantity).toLocaleString()}</span>
                        <button onClick={() => removeItem(item.productId)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                          <Trash2 size={16} color="var(--color-error)" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ color: 'var(--color-muted)', textAlign: 'center', padding: '24px', fontSize: '14px' }}>
                Search and add products above
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
              <button onClick={() => setStep(1)} className="btn-secondary">Back</button>
              <button onClick={() => setStep(3)} disabled={items.length === 0} className="btn-primary">
                Review Order <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ backgroundColor: 'var(--color-surface-card)', borderRadius: 'var(--rounded-md)', padding: '14px 16px', border: '1px solid var(--color-hairline)' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)', marginBottom: '4px' }}>Customer</div>
              <div style={{ fontSize: '14px', fontWeight: 600 }}>{selectedCustomer?.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>{selectedCustomer?.businessName} · {selectedCustomer?.email}</div>
            </div>

            <div style={{ backgroundColor: 'var(--color-canvas)', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-surface-soft)', borderBottom: '1px solid var(--color-hairline)' }}>
                    <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, fontSize: '11px', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Product</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600, fontSize: '11px', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Qty</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, fontSize: '11px', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Unit Price</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, fontSize: '11px', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item => (
                    <tr key={item.productId} style={{ borderBottom: '1px solid var(--color-hairline)' }}>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontWeight: 600 }}>{item.productName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>{item.productSku}</div>
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right' }}>₹{item.unitPrice.toLocaleString()}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600 }}>₹{(item.unitPrice * item.quantity).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-surface-card)', borderRadius: 'var(--rounded-md)', padding: '14px 16px', border: '1px solid var(--color-hairline)' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>Total Items: {totalQuantity}</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-ink)' }}>₹{totalAmount.toLocaleString()}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
              <button onClick={() => setStep(2)} className="btn-secondary">Back</button>
              <button onClick={handleSubmit} disabled={saving} className="btn-primary" style={{ fontSize: '15px', padding: '12px 24px' }}>
                {saving ? 'Creating...' : 'Create Draft Challan'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};