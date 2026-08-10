import React, { useState, useEffect } from 'react';
import type { Customer } from '../types';
import { X } from 'lucide-react';

interface CustomerModalProps {
  customer?: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (customerData: Partial<Customer>) => Promise<void>;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  customer,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    mobile: '',
    email: '',
    businessName: '',
    gstNumber: '',
    customerType: 'Retail',
    address: '',
    status: 'Active',
    followUpDate: '',
    notes: ''
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        mobile: customer.mobile || '',
        email: customer.email || '',
        businessName: customer.businessName || '',
        gstNumber: customer.gstNumber || '',
        customerType: customer.customerType || 'Retail',
        address: customer.address || '',
        status: customer.status || 'Active',
        followUpDate: customer.followUpDate || '',
        notes: customer.notes || ''
      });
    } else {
      setFormData({
        name: '',
        mobile: '',
        email: '',
        businessName: '',
        gstNumber: '',
        customerType: 'Retail',
        address: '',
        status: 'Active',
        followUpDate: '',
        notes: ''
      });
    }
  }, [customer, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save customer');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-ink)' }}>
            {customer ? 'Edit Customer Account' : 'Add New Customer'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} color="var(--color-muted)" />
          </button>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Customer Name *</label>
              <input
                type="text"
                required
                className="input-clay"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Rajesh Sharma"
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Business Name *</label>
              <input
                type="text"
                required
                className="input-clay"
                value={formData.businessName}
                onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="Apex Wholesale Ltd"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Mobile Number *</label>
              <input
                type="text"
                required
                className="input-clay"
                value={formData.mobile}
                onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Email Address *</label>
              <input
                type="email"
                required
                className="input-clay"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="client@company.com"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>GST Number (Optional)</label>
              <input
                type="text"
                className="input-clay"
                value={formData.gstNumber || ''}
                onChange={e => setFormData({ ...formData, gstNumber: e.target.value })}
                placeholder="27AAAAA0000A1Z5"
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Customer Type *</label>
              <select
                className="input-clay"
                value={formData.customerType}
                onChange={e => setFormData({ ...formData, customerType: e.target.value as any })}
              >
                <option value="Retail">Retail</option>
                <option value="Wholesale">Wholesale</option>
                <option value="Distributor">Distributor</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Status *</label>
              <select
                className="input-clay"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
              >
                <option value="Lead">Lead</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Address *</label>
            <input
              type="text"
              required
              className="input-clay"
              value={formData.address}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              placeholder="Full office/warehouse delivery address"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Next Follow-up Date</label>
              <input
                type="date"
                className="input-clay"
                value={formData.followUpDate || ''}
                onChange={e => setFormData({ ...formData, followUpDate: e.target.value })}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Initial Notes</label>
              <input
                type="text"
                className="input-clay"
                value={formData.notes || ''}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Key requirements or discussion summary"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : (customer ? 'Update Customer' : 'Add Customer')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
