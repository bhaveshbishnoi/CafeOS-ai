"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { useCafeStore, API_URL } from './store';
import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import DashboardPage from './components/DashboardPage';
import POSPage from './components/POSPage';
import KDSPage from './components/KDSPage';
import TablesPage from './components/TablesPage';
import InventoryPage from './components/InventoryPage';
import CRMPage from './components/CRMPage';
import AnalyticsPage from './components/AnalyticsPage';
import AIPage from './components/AIPage';

// ---- Placeholder for remaining pages ----
function ComingSoon({ title }: { title: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: 400, gap: 16, color: 'var(--text-muted)'
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: 20,
        background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.15))',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem'
      }}>🚧</div>
      <h2 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
        {title}
      </h2>
      <p style={{ fontSize: '0.85rem' }}>This module is ready in the backend — UI coming soon.</p>
    </div>
  );
}

export default function App() {
  const {
    token, user, activeTab,
    selectedBranchId, selectedBranchName,
    sidebarCollapsed,
    setSelectedBranch, logout
  } = useCafeStore();

  // Data states
  const [branches, setBranches] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [costings, setCostings] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [staffMetrics, setStaffMetrics] = useState<any[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Expose branches to Sidebar via store (using a workaround via window)
  // We'll pass branches + setSelectedBranch as props override via a wrapper
  const cafeStore = useCafeStore() as any;

  // Fetch branches on auth
  const fetchBranches = useCallback(async (authToken: string) => {
    try {
      const res = await fetch(`${API_URL}/analytics/compare`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
        const uniqueBranches = data.map((b: any) => ({ id: b.id, name: b.name }));
        setBranches(uniqueBranches);
        cafeStore.branches = uniqueBranches; // Store reference for sidebar
        if (uniqueBranches.length > 0 && !selectedBranchId) {
          setSelectedBranch(uniqueBranches[0].id, uniqueBranches[0].name);
        }
      }
    } catch (err) {
      console.error('Fetch branches error:', err);
    }
  }, [selectedBranchId]);

  // Fetch all branch data
  const fetchBranchData = useCallback(async () => {
    if (!token || !selectedBranchId) return;
    const headers = { 'Authorization': `Bearer ${token}` };
    setLoading(true);

    try {
      const [
        dashRes, tablesRes, menuRes, ordersRes,
        ingRes, suppRes, costRes, custRes,
        campRes, staffRes, recRes, leadRes
      ] = await Promise.allSettled([
        fetch(`${API_URL}/analytics/branches/${selectedBranchId}/dashboard`, { headers }),
        fetch(`${API_URL}/pos/branches/${selectedBranchId}/tables`, { headers }),
        fetch(`${API_URL}/pos/branches/${selectedBranchId}/menu`, { headers }),
        fetch(`${API_URL}/pos/branches/${selectedBranchId}/orders`, { headers }),
        fetch(`${API_URL}/inventory/branches/${selectedBranchId}/ingredients`, { headers }),
        fetch(`${API_URL}/inventory/suppliers`, { headers }),
        fetch(`${API_URL}/inventory/branches/${selectedBranchId}/recipes/costing`, { headers }),
        fetch(`${API_URL}/crm/branches/${selectedBranchId}/customers`, { headers }),
        fetch(`${API_URL}/crm/branches/${selectedBranchId}/campaigns`, { headers }),
        fetch(`${API_URL}/analytics/branches/${selectedBranchId}/staff-metrics`, { headers }),
        fetch(`${API_URL}/ai/branches/${selectedBranchId}/recommendations`, { headers }),
        fetch(`${API_URL}/analytics/compare`, { headers }),
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value.ok) setDashboardStats(await dashRes.value.json());
      if (tablesRes.status === 'fulfilled' && tablesRes.value.ok) setTables(await tablesRes.value.json());
      if (menuRes.status === 'fulfilled' && menuRes.value.ok) setMenuItems(await menuRes.value.json());
      if (ordersRes.status === 'fulfilled' && ordersRes.value.ok) setOrders(await ordersRes.value.json());
      if (ingRes.status === 'fulfilled' && ingRes.value.ok) setIngredients(await ingRes.value.json());
      if (suppRes.status === 'fulfilled' && suppRes.value.ok) setSuppliers(await suppRes.value.json());
      if (costRes.status === 'fulfilled' && costRes.value.ok) setCostings(await costRes.value.json());
      if (custRes.status === 'fulfilled' && custRes.value.ok) setCustomers(await custRes.value.json());
      if (campRes.status === 'fulfilled' && campRes.value.ok) setCampaigns(await campRes.value.json());
      if (staffRes.status === 'fulfilled' && staffRes.value.ok) setStaffMetrics(await staffRes.value.json());
      if (recRes.status === 'fulfilled' && recRes.value.ok) setAiRecommendations(await recRes.value.json());
      if (leadRes.status === 'fulfilled' && leadRes.value.ok) {
        const lb = await leadRes.value.json();
        setLeaderboard(lb);
        const bs = lb.map((b: any) => ({ id: b.id, name: b.name }));
        setBranches(bs);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    }
    setLoading(false);
  }, [token, selectedBranchId]);

  useEffect(() => { if (token) fetchBranches(token); }, [token]);
  useEffect(() => { if (token && selectedBranchId) fetchBranchData(); }, [token, selectedBranchId]);

  // Not logged in
  if (!token) return <LoginPage />;

  const renderPage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage stats={dashboardStats} leaderboard={leaderboard} branches={branches} />;
      case 'pos':
        return <POSPage menuItems={menuItems} tables={tables} customers={customers} onOrderPlaced={fetchBranchData} />;
      case 'kds':
        return <KDSPage orders={orders} onUpdate={fetchBranchData} />;
      case 'tables':
        return <TablesPage tables={tables} onUpdate={fetchBranchData} />;
      case 'inventory':
        return <InventoryPage ingredients={ingredients} suppliers={suppliers} costings={costings} />;
      case 'recipes':
        return (
          <div className="animate-fade-in card">
            <div className="card-header"><span className="card-title">Recipe Costing</span></div>
            <table className="data-table">
              <thead><tr><th>Menu Item</th><th>Ingredients</th><th>Cost</th><th>Price</th><th>Margin</th><th>Margin %</th></tr></thead>
              <tbody>
                {costings.map((c: any) => {
                  const margin = c.sellingPrice - c.totalCost;
                  const marginPct = c.sellingPrice > 0 ? Math.round((margin / c.sellingPrice) * 100) : 0;
                  return (
                    <tr key={c.menuItemId}>
                      <td style={{ fontWeight: 600 }}>{c.menuItemName}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{c.ingredientCount || 0} items</td>
                      <td>₹{c.totalCost?.toFixed(2)}</td>
                      <td style={{ fontWeight: 600 }}>₹{c.sellingPrice}</td>
                      <td style={{ color: '#10b981', fontWeight: 600 }}>₹{margin?.toFixed(2)}</td>
                      <td>
                        <span className={`badge ${marginPct > 60 ? 'badge-emerald' : marginPct > 40 ? 'badge-amber' : 'badge-rose'}`}>
                          {marginPct}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {costings.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 30 }}>No costing data</td></tr>}
              </tbody>
            </table>
          </div>
        );
      case 'waste':
        return <ComingSoon title="Waste Tracking" />;
      case 'crm':
        return <CRMPage customers={customers} campaigns={campaigns} onUpdate={fetchBranchData} />;
      case 'campaigns':
        return <CRMPage customers={customers} campaigns={campaigns} onUpdate={fetchBranchData} />;
      case 'analytics':
        return <AnalyticsPage stats={dashboardStats} staffMetrics={staffMetrics} leaderboard={leaderboard} />;
      case 'staff':
        return (
          <div className="animate-fade-in card">
            <div className="card-header"><span className="card-title">Staff Performance</span></div>
            <table className="data-table">
              <thead><tr><th>Staff Member</th><th>Role</th><th>Orders</th><th>Revenue</th><th>Performance</th></tr></thead>
              <tbody>
                {staffMetrics.map((s: any) => {
                  const score = Math.min(100, Math.round((s.ordersProcessed / 100) * 60 + (s.revenue / 50000) * 40));
                  return (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600 }}>{s.name}</td>
                      <td><span className="badge badge-purple">{s.role?.replace(/_/g, ' ')}</span></td>
                      <td>{s.ordersProcessed || 0}</td>
                      <td style={{ color: '#10b981', fontWeight: 600 }}>₹{(s.revenue || 0).toLocaleString()}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="progress-bar" style={{ width: 80 }}>
                            <div className="progress-fill" style={{ width: `${score}%`, background: score > 70 ? '#10b981' : '#f59e0b' }} />
                          </div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{score}/100</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {staffMetrics.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 30 }}>No staff data</td></tr>}
              </tbody>
            </table>
          </div>
        );
      case 'financials':
        return <ComingSoon title="Financial Reports" />;
      case 'forecasting':
        return <ComingSoon title="AI Demand Forecasting" />;
      case 'ai':
        return <AIPage recommendations={aiRecommendations} onUpdate={fetchBranchData} />;
      case 'branches':
        return (
          <div className="animate-fade-in">
            <div className="card">
              <div className="card-header"><span className="card-title">Branch Comparison</span></div>
              <table className="data-table">
                <thead><tr><th>Branch</th><th>Revenue</th><th>Orders</th><th>Customers</th><th>Avg Order</th></tr></thead>
                <tbody>
                  {leaderboard.map((b: any) => (
                    <tr key={b.id}>
                      <td style={{ fontWeight: 600 }}>{b.name}</td>
                      <td style={{ color: '#10b981', fontWeight: 700 }}>₹{(b.revenue || 0).toLocaleString()}</td>
                      <td>{b.orders || 0}</td>
                      <td>{b.customers || 0}</td>
                      <td>₹{b.orders > 0 ? Math.round((b.revenue || 0) / b.orders) : 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'reports':
        return <ComingSoon title="Scheduled Reports" />;
      case 'settings':
        return (
          <div className="animate-fade-in">
            <div className="card">
              <div className="card-header"><span className="card-title">Account Settings</span></div>
              <div className="card-body">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0', borderBottom: '1px solid var(--border-default)' }}>
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.1rem', color: 'white' }}>
                      {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem' }}>{user?.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{user?.email}</div>
                      <div style={{ fontSize: '0.78rem', marginTop: 4 }}>
                        <span className="badge badge-purple">{user?.role?.replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 12 }}>Active Branch</div>
                    <div style={{ color: 'var(--text-secondary)' }}>{selectedBranchName || 'Not selected'}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 12 }}>App Version</div>
                    <div style={{ color: 'var(--text-secondary)' }}>CafeOS AI v1.0.0 — Production</div>
                  </div>
                  <button className="btn btn-danger" onClick={logout} style={{ width: 'fit-content' }}>
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <DashboardPage stats={dashboardStats} leaderboard={leaderboard} branches={branches} />;
    }
  };

  return (
    <div className="app-shell">
      {/* Inject branches into store for sidebar access */}
      <SidebarBranchInjector branches={branches} />

      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className={`main-content${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
        <Topbar onRefresh={fetchBranchData} />
        <main className="page-content">
          {loading && !dashboardStats && (
            <div style={{ position: 'absolute', top: 80, right: 28, zIndex: 30 }}>
              <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border-default)',
                borderRadius: 8, padding: '8px 14px', fontSize: '0.8rem', color: 'var(--text-muted)',
                display: 'flex', alignItems: 'center', gap: 8
              }}>
                <div className="animate-spin" style={{ width: 12, height: 12, border: '2px solid var(--border-default)', borderTopColor: '#7c3aed', borderRadius: '50%' }} />
                Loading data...
              </div>
            </div>
          )}
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

// Helper to inject branches into store (since Zustand doesn't support dynamic fields easily)
function SidebarBranchInjector({ branches }: { branches: any[] }) {
  const store = useCafeStore() as any;
  useEffect(() => {
    store.branches = branches;
  }, [branches]);
  return null;
}
