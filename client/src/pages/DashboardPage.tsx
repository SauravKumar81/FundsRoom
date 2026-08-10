import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Customer, Product, SalesChallan } from '../types';
import { Users, Package, FileText, AlertTriangle, ArrowUpRight, TrendingUp } from 'lucide-react';

interface DashboardPageProps {
  setActiveTab: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ setActiveTab }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [challans, setChallans] = useState<SalesChallan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, pRes, chRes] = await Promise.all([
          api.get('/customers?limit=100'),
          api.get('/products?limit=100'),
          api.get('/challans?limit=100')
        ]);
        setCustomers(cRes.data.customers || []);
        setProducts(pRes.data.products || []);
        setChallans(chRes.data.challans || []);
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const lowStockCount = products.filter(p => p.currentStock <= p.minStockAlert).length;
  const activeCustomers = customers.filter(c => c.status === 'Active').length;
  const confirmedChallans = challans.filter(c => c.status === 'Confirmed').length;
  const totalRevenue = challans
    .filter(c => c.status === 'Confirmed')
    .reduce((sum, c) => sum + c.totalAmount, 0);

  if (loading) {
    return <div style={{ padding: '32px' }}>Loading portal dashboard...</div>;
  }

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h2 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--color-ink)' }}>
          Operations & Performance Dashboard
        </h2>
        <p style={{ color: 'var(--color-muted)', fontSize: '14px', marginTop: '4px' }}>
          Real-time wholesale CRM, Inventory levels, and Sales Challan status tracking
        </p>
      </div>

      {/* Saturated Feature Cards Grid (DESIGN.md claymation color palette) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
        {/* Card 1: Pink */}
        <div className="card-pink rounded-clay-xl" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '140px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, opacity: 0.9 }}>Total Customers</span>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 700, lineHeight: 1 }}>{customers.length}</div>
            <span style={{ fontSize: '12px', opacity: 0.9, marginTop: '4px', display: 'block' }}>
              {activeCustomers} Active Accounts
            </span>
          </div>
        </div>

        {/* Card 2: Teal */}
        <div className="card-teal rounded-clay-xl" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '140px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, opacity: 0.9 }}>Product Inventory</span>
            <Package size={22} />
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 700, lineHeight: 1 }}>{products.length}</div>
            <span style={{ fontSize: '12px', opacity: 0.9, marginTop: '4px', display: 'block' }}>
              Items Cataloged
            </span>
          </div>
        </div>

        {/* Card 3: Lavender */}
        <div className="card-lavender rounded-clay-xl" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '140px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)' }}>Low Stock Alerts</span>
            <AlertTriangle size={22} color={lowStockCount > 0 ? 'var(--color-error)' : 'var(--color-ink)'} />
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 700, lineHeight: 1, color: lowStockCount > 0 ? 'var(--color-error)' : 'var(--color-ink)' }}>
              {lowStockCount}
            </div>
            <span style={{ fontSize: '12px', color: 'var(--color-body)', marginTop: '4px', display: 'block' }}>
              {lowStockCount > 0 ? 'Action required in Inventory' : 'Stock levels healthy'}
            </span>
          </div>
        </div>

        {/* Card 4: Peach */}
        <div className="card-peach rounded-clay-xl" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '140px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-ink)' }}>Sales Challans</span>
            <FileText size={22} color="var(--color-ink)" />
          </div>
          <div>
            <div style={{ fontSize: '32px', fontWeight: 700, lineHeight: 1, color: 'var(--color-ink)' }}>
              {challans.length}
            </div>
            <span style={{ fontSize: '12px', color: 'var(--color-body)', marginTop: '4px', display: 'block' }}>
              {confirmedChallans} Confirmed & Dispatched
            </span>
          </div>
        </div>
      </div>

      {/* Quick Navigation Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Recent Challans List */}
        <div style={{
          backgroundColor: 'var(--color-surface-card)',
          borderRadius: 'var(--rounded-xl)',
          padding: '24px',
          border: '1px solid var(--color-hairline)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-ink)' }}>Recent Sales Challans</h3>
            <button
              onClick={() => setActiveTab('challans')}
              className="btn-secondary"
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              View All <ArrowUpRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {challans.slice(0, 5).map(c => (
              <div
                key={c.id}
                style={{
                  backgroundColor: 'var(--color-canvas)',
                  padding: '12px 16px',
                  borderRadius: 'var(--rounded-md)',
                  border: '1px solid var(--color-hairline)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-ink)' }}>{c.challanNumber}</span>
                  <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '2px' }}>
                    Customer: <strong>{c.customerName}</strong> · Items: {c.totalQuantity}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontWeight: 700, fontSize: '14px' }}>₹{c.totalAmount.toLocaleString()}</span>
                  <span className={`badge badge-${c.status.toLowerCase()}`}>
                    {c.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Watchlist */}
        <div style={{
          backgroundColor: 'var(--color-surface-soft)',
          borderRadius: 'var(--rounded-xl)',
          padding: '24px',
          border: '1px solid var(--color-hairline)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-ink)' }}>Stock Alerts</h3>
            <button
              onClick={() => setActiveTab('products')}
              className="btn-secondary"
              style={{ fontSize: '12px', padding: '4px 10px' }}
            >
              Inventory
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {products.filter(p => p.currentStock <= p.minStockAlert).length === 0 ? (
              <div style={{ fontSize: '13px', color: 'var(--color-muted)', fontStyle: 'italic', padding: '12px 0' }}>
                All product stock levels are above threshold.
              </div>
            ) : (
              products.filter(p => p.currentStock <= p.minStockAlert).map(p => (
                <div
                  key={p.id}
                  style={{
                    backgroundColor: 'var(--color-canvas)',
                    padding: '10px 12px',
                    borderRadius: 'var(--rounded-md)',
                    border: '1px solid #fee2e2',
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-ink)' }}>{p.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-muted)' }}>SKU: {p.sku}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-error)' }}>
                      {p.currentStock} left
                    </span>
                    <div style={{ fontSize: '10px', color: 'var(--color-muted)' }}>Min: {p.minStockAlert}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
