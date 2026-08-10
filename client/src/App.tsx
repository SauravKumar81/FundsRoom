import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CustomersPage } from './pages/CustomersPage';
import { ProductsPage } from './pages/ProductsPage';
import { ChallansPage } from './pages/ChallansPage';
import { StockLogsPage } from './pages/StockLogsPage';
import { Layout } from './components/Layout';

type Tab = 'dashboard' | 'customers' | 'products' | 'challans' | 'logs';

const PageComponents: Record<Tab, React.FC<{ setActiveTab: (tab: Tab) => void }>> = {
  dashboard: DashboardPage,
  customers: CustomersPage,
  products: ProductsPage,
  challans: ChallansPage,
  logs: StockLogsPage,
};

const App: React.FC = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-canvas)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ fontSize: '16px', color: 'var(--color-muted)' }}>Loading Fundsroom...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const ActivePage = PageComponents[activeTab];

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <ActivePage setActiveTab={setActiveTab} />
    </Layout>
  );
};

export default App;