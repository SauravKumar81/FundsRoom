import React, { useState, useEffect } from 'react';
import type { Product } from '../types';
import { X } from 'lucide-react';

interface ProductModalProps {
  product?: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Partial<Product>) => Promise<void>;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    sku: '',
    category: 'Networking',
    unitPrice: 0,
    currentStock: 0,
    minStockAlert: 5,
    location: 'Warehouse A'
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        category: product.category || 'Networking',
        unitPrice: product.unitPrice || 0,
        currentStock: product.currentStock || 0,
        minStockAlert: product.minStockAlert || 5,
        location: product.location || 'Warehouse A'
      });
    } else {
      setFormData({
        name: '',
        sku: '',
        category: 'Networking',
        unitPrice: 0,
        currentStock: 0,
        minStockAlert: 5,
        location: 'Warehouse A'
      });
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-ink)' }}>
            {product ? 'Edit Product Item' : 'Add New Inventory Product'}
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
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Product Name *</label>
              <input
                type="text"
                required
                className="input-clay"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Gigabit Ethernet Switch 24P"
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>SKU / Product Code *</label>
              <input
                type="text"
                required
                disabled={!!product}
                className="input-clay"
                value={formData.sku}
                onChange={e => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                placeholder="NET-SW-24P"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Category *</label>
              <input
                type="text"
                required
                className="input-clay"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                placeholder="Networking, Power, Cables..."
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Unit Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                required
                className="input-clay"
                value={formData.unitPrice}
                onChange={e => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                placeholder="4500.00"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            {!product && (
              <div>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Initial Stock Intake</label>
                <input
                  type="number"
                  min="0"
                  className="input-clay"
                  value={formData.currentStock}
                  onChange={e => setFormData({ ...formData, currentStock: parseInt(e.target.value, 10) || 0 })}
                  placeholder="0"
                />
              </div>
            )}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Min Stock Alert Qty *</label>
              <input
                type="number"
                min="1"
                required
                className="input-clay"
                value={formData.minStockAlert}
                onChange={e => setFormData({ ...formData, minStockAlert: parseInt(e.target.value, 10) || 5 })}
                placeholder="5"
              />
            </div>
            <div style={{ gridColumn: product ? 'span 2' : 'span 1' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Warehouse Location *</label>
              <input
                type="text"
                required
                className="input-clay"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                placeholder="Warehouse A - Shelf 4"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : (product ? 'Update Product' : 'Add Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
