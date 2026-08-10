import React, { useState, useEffect } from 'react';
import type { Product } from '../types';
import { X, ArrowUp, ArrowDown } from 'lucide-react';

interface StockAdjustmentModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { quantityChanged: number; movementType: string; reason: string }) => Promise<void>;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  product,
  isOpen,
  onClose,
  onSave
}) => {
  const [movementType, setMovementType] = useState<'IN' | 'OUT'>('IN');
  const [quantity, setQuantity] = useState<number>(0);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMovementType('IN');
      setQuantity(0);
      setReason('');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (quantity <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    if (movementType === 'OUT' && quantity > product.currentStock) {
      setError(`Insufficient stock. Available: ${product.currentStock}`);
      return;
    }

    setSaving(true);
    try {
      await onSave({ quantityChanged: quantity, movementType, reason });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to adjust stock');
    } finally {
      setSaving(false);
    }
  };

  const newStock = movementType === 'IN'
    ? product.currentStock + quantity
    : product.currentStock - quantity;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-ink)' }}>Adjust Stock</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={20} color="var(--color-muted)" />
          </button>
        </div>

        <div style={{ backgroundColor: 'var(--color-surface-card)', borderRadius: 'var(--rounded-md)', padding: '14px', marginBottom: '16px', border: '1px solid var(--color-hairline)' }}>
          <div style={{ fontSize: '14px', fontWeight: 600 }}>{product.name}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '2px' }}>SKU: {product.sku}</div>
          <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '8px' }}>
            Current Stock: <span style={{ color: product.currentStock <= product.minStockAlert ? 'var(--color-error)' : 'var(--color-ink)' }}>{product.currentStock}</span>
          </div>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Movement Type *</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={() => setMovementType('IN')} style={{
                flex: 1, padding: '12px', borderRadius: 'var(--rounded-md)', border: movementType === 'IN' ? '2px solid #166534' : '1px solid var(--color-hairline)',
                backgroundColor: movementType === 'IN' ? '#dcfce7' : 'var(--color-canvas)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                fontWeight: 600, fontSize: '14px', color: movementType === 'IN' ? '#166534' : 'var(--color-muted)'
              }}>
                <ArrowUp size={18} /> Stock IN
              </button>
              <button type="button" onClick={() => setMovementType('OUT')} style={{
                flex: 1, padding: '12px', borderRadius: 'var(--rounded-md)', border: movementType === 'OUT' ? '2px solid #991b1b' : '1px solid var(--color-hairline)',
                backgroundColor: movementType === 'OUT' ? '#fee2e2' : 'var(--color-canvas)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                fontWeight: 600, fontSize: '14px', color: movementType === 'OUT' ? '#991b1b' : 'var(--color-muted)'
              }}>
                <ArrowDown size={18} /> Stock OUT
              </button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Quantity *</label>
            <input
              type="number"
              min="1"
              max={movementType === 'OUT' ? product.currentStock : undefined}
              required
              className="input-clay"
              value={quantity || ''}
              onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 0)}
              placeholder="Enter quantity"
            />
            {quantity > 0 && (
              <div style={{ fontSize: '13px', color: 'var(--color-muted)', marginTop: '6px' }}>
                New stock will be: <strong style={{ color: newStock < 0 ? 'var(--color-error)' : 'var(--color-ink)' }}>{newStock}</strong>
              </div>
            )}
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>Reason</label>
            <input
              type="text"
              className="input-clay"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Incoming shipment, Damaged goods, Manual correction"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saving || quantity <= 0} className="btn-primary">
              {saving ? 'Processing...' : 'Confirm Adjustment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};