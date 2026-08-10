import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Product, StockMovementLog, Tab } from '../types';
import { ProductModal } from '../components/ProductModal';
import { StockAdjustmentModal } from '../components/StockAdjustmentModal';
import { Search, Plus, Filter, AlertTriangle, ChevronLeft, ChevronRight, ArrowUpDown, Eye, Edit } from 'lucide-react';

interface ProductsPageProps {
  setActiveTab: (tab: Tab) => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({ setActiveTab: _setActiveTab }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [productLogs, setProductLogs] = useState<StockMovementLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;
      if (lowStockOnly) params.lowStock = 'true';
      const res = await api.get('/products', { params });
      setProducts(res.data.products || []);
      setMeta(res.data.meta || { total: 0, totalPages: 1 });
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, categoryFilter, lowStockOnly]);

  const handleSearch = () => {
    setPage(1);
    fetchProducts();
  };

  const handleSave = async (data: Partial<Product>) => {
    if (editingProduct) {
      await api.put(`/products/${editingProduct.id}`, data);
    } else {
      await api.post('/products', data);
    }
    fetchProducts();
  };

  const handleStockAdjust = async (data: { quantityChanged: number; movementType: string; reason: string }) => {
    if (!adjustingProduct) return;
    await api.post(`/products/${adjustingProduct.id}/stock`, data);
    fetchProducts();
  };

  const handleViewHistory = async (product: Product) => {
    setViewingProduct(product);
    setLogsLoading(true);
    try {
      const res = await api.get(`/products/${product.id}`);
      setProductLogs(res.data.product?.stockLogs || []);
    } catch (err) {
      console.error('Failed to fetch stock logs', err);
    } finally {
      setLogsLoading(false);
    }
  };

  if (viewingProduct) {
    return (
      <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <button onClick={() => { setViewingProduct(null); setProductLogs([]); }} className="btn-secondary" style={{ alignSelf: 'flex-start', gap: '6px' }}>
          <ChevronLeft size={16} /> Back to Inventory
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-ink)', letterSpacing: '-0.5px' }}>{viewingProduct.name}</h2>
            <p style={{ color: 'var(--color-muted)', fontSize: '14px', marginTop: '4px' }}>SKU: {viewingProduct.sku} · {viewingProduct.category}</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => { setAdjustingProduct(viewingProduct); setStockModalOpen(true); }} className="btn-primary" style={{ fontSize: '13px' }}>
              <ArrowUpDown size={14} /> Adjust Stock
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
          <div style={{ backgroundColor: viewingProduct.currentStock <= viewingProduct.minStockAlert ? '#fee2e2' : 'var(--color-surface-card)', borderRadius: 'var(--rounded-lg)', padding: '16px', border: '1px solid var(--color-hairline)' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)', marginBottom: '4px' }}>Current Stock</div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: viewingProduct.currentStock <= viewingProduct.minStockAlert ? 'var(--color-error)' : 'var(--color-ink)' }}>{viewingProduct.currentStock}</div>
          </div>
          <div style={{ backgroundColor: 'var(--color-surface-card)', borderRadius: 'var(--rounded-lg)', padding: '16px', border: '1px solid var(--color-hairline)' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)', marginBottom: '4px' }}>Min Alert</div>
            <div style={{ fontSize: '28px', fontWeight: 700 }}>{viewingProduct.minStockAlert}</div>
          </div>
          <div style={{ backgroundColor: 'var(--color-surface-card)', borderRadius: 'var(--rounded-lg)', padding: '16px', border: '1px solid var(--color-hairline)' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)', marginBottom: '4px' }}>Unit Price</div>
            <div style={{ fontSize: '28px', fontWeight: 700 }}>₹{viewingProduct.unitPrice.toLocaleString()}</div>
          </div>
          <div style={{ backgroundColor: 'var(--color-surface-card)', borderRadius: 'var(--rounded-lg)', padding: '16px', border: '1px solid var(--color-hairline)' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)', marginBottom: '4px' }}>Location</div>
            <div style={{ fontSize: '16px', fontWeight: 600 }}>{viewingProduct.location}</div>
          </div>
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-ink)' }}>Stock Movement History</h3>

        {logsLoading ? (
          <div style={{ color: 'var(--color-muted)', padding: '12px' }}>Loading movement logs...</div>
        ) : productLogs.length === 0 ? (
          <div style={{ color: 'var(--color-muted)', fontSize: '14px', fontStyle: 'italic' }}>No stock movements recorded.</div>
        ) : (
          <div style={{ backgroundColor: 'var(--color-canvas)', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-surface-soft)', borderBottom: '1px solid var(--color-hairline)' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '12px', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Type</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '12px', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Quantity</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '12px', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Reason</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '12px', color: 'var(--color-muted)', textTransform: 'uppercase' }}>By</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '12px', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {productLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--color-hairline)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: log.movementType === 'IN' ? '#166534' : '#991b1b', backgroundColor: log.movementType === 'IN' ? '#dcfce7' : '#fee2e2', padding: '4px 10px', borderRadius: '9999px' }}>
                        {log.movementType === 'IN' ? '↑ IN' : '↓ OUT'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{log.quantityChanged}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-body)' }}>{log.reason}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-muted)' }}>{log.createdBy}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-muted)', fontSize: '13px' }}>{new Date(log.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <StockAdjustmentModal product={adjustingProduct || viewingProduct} isOpen={stockModalOpen} onClose={() => { setStockModalOpen(false); setAdjustingProduct(null); }} onSave={handleStockAdjust} />
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--color-ink)' }}>Products & Inventory</h2>
          <p style={{ color: 'var(--color-muted)', fontSize: '14px', marginTop: '4px' }}>Manage product catalog and stock levels</p>
        </div>
        <button onClick={() => { setEditingProduct(null); setModalOpen(true); }} className="btn-primary">
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px', maxWidth: '360px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--color-muted)' }} />
          <input className="input-clay" style={{ paddingLeft: '36px' }} placeholder="Search by name, SKU, category..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
        </div>
        <select className="input-clay" style={{ width: 'auto', minWidth: '140px' }} value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}>
          <option value="">All Categories</option>
          <option value="Networking">Networking</option>
          <option value="Wireless">Wireless</option>
          <option value="Power">Power</option>
        </select>
        <button onClick={() => { setLowStockOnly(!lowStockOnly); setPage(1); }} className={lowStockOnly ? 'btn-primary' : 'btn-secondary'} style={{ fontSize: '13px', padding: '10px 16px' }}>
          <AlertTriangle size={14} /> Low Stock Only
        </button>
        <button onClick={handleSearch} className="btn-primary" style={{ fontSize: '13px', padding: '10px 16px' }}>
          <Filter size={14} /> Search
        </button>
      </div>

      {loading ? (
        <div style={{ color: 'var(--color-muted)', padding: '20px' }}>Loading products...</div>
      ) : (
        <div style={{ backgroundColor: 'var(--color-canvas)', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-surface-soft)', borderBottom: '1px solid var(--color-hairline)' }}>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '12px', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Product</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '12px', color: 'var(--color-muted)', textTransform: 'uppercase' }}>SKU</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '12px', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Category</th>
                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 600, fontSize: '12px', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Stock</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '12px', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Location</th>
                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, fontSize: '12px', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Price</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, fontSize: '12px', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const isLow = p.currentStock <= p.minStockAlert;
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--color-hairline)', backgroundColor: isLow ? '#fff5f5' : 'transparent' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{p.name}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '13px', color: 'var(--color-body)' }}>{p.sku}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-body)' }}>{p.category}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: '15px', color: isLow ? 'var(--color-error)' : 'var(--color-ink)' }}>
                        {p.currentStock}
                      </span>
                      {isLow && <AlertTriangle size={14} color="var(--color-error)" style={{ marginLeft: '6px', verticalAlign: 'middle' }} />}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--color-body)', fontSize: '13px' }}>{p.location}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>₹{p.unitPrice.toLocaleString()}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button onClick={() => handleViewHistory(p)} className="btn-secondary" style={{ padding: '6px 10px', fontSize: '12px' }} title="View History">
                          <Eye size={14} />
                        </button>
                        <button onClick={() => { setAdjustingProduct(p); setStockModalOpen(true); }} className="btn-secondary" style={{ padding: '6px 10px', fontSize: '12px' }} title="Adjust Stock">
                          <ArrowUpDown size={14} />
                        </button>
                        <button onClick={() => { setEditingProduct(p); setModalOpen(true); }} className="btn-secondary" style={{ padding: '6px 10px', fontSize: '12px' }} title="Edit">
                          <Edit size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {products.length === 0 && (
                <tr><td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: 'var(--color-muted)' }}>No products found</td></tr>
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

      <ProductModal product={editingProduct} isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingProduct(null); }} onSave={handleSave} />
      <StockAdjustmentModal product={adjustingProduct} isOpen={stockModalOpen} onClose={() => { setStockModalOpen(false); setAdjustingProduct(null); }} onSave={handleStockAdjust} />
    </div>
  );
};