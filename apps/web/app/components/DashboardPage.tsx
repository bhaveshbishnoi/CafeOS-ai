"use client";
import React from 'react';
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  DollarSign, TrendingUp, ShoppingBag, Users, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Coffee, Star, Package
} from 'lucide-react';

interface DashboardProps {
  stats: any;
  leaderboard: any[];
  branches: any[];
}

const COLORS = ['#7c3aed', '#06b6d4', '#f59e0b', '#10b981', '#ef4444'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border-default)',
        borderRadius: 8, padding: '10px 14px', fontSize: '0.8rem',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
      }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: 6 }}>{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} style={{ color: entry.color }}>
            {entry.name}: <strong>{typeof entry.value === 'number' && entry.name.includes('₹') || entry.name.toLowerCase().includes('revenue') || entry.name.toLowerCase().includes('sales')
              ? `₹${entry.value.toLocaleString()}`
              : entry.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage({ stats, leaderboard, branches }: DashboardProps) {
  if (!stats) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 400, gap: 16 }}>
        <div className="animate-spin" style={{ width: 36, height: 36, border: '3px solid var(--border-default)', borderTopColor: '#7c3aed', borderRadius: '50%' }} />
        <p style={{ color: 'var(--text-muted)' }}>Loading dashboard data...</p>
      </div>
    );
  }

  const revenue = stats.revenue || 0;
  const orders = stats.orders || 0;
  const avgOrder = orders > 0 ? Math.round(revenue / orders) : 0;
  const topItems = stats.topItems || [];
  const salesTrend = stats.salesTrend || [];
  const categoryBreakdown = stats.categoryBreakdown || [];
  const wasteAmount = stats.wasteAmount || 0;
  const lowStock = stats.lowStockCount || 0;

  return (
    <div className="animate-fade-in">
      {/* Stat cards */}
      <div className="stat-grid">
        <div className="stat-card purple">
          <div className="flex items-center justify-between">
            <div className="stat-icon purple"><DollarSign size={20} /></div>
            <span className="stat-change up"><ArrowUpRight size={12} /> 12.4%</span>
          </div>
          <div>
            <div className="stat-value">₹{revenue.toLocaleString()}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>

        <div className="stat-card cyan">
          <div className="flex items-center justify-between">
            <div className="stat-icon cyan"><ShoppingBag size={20} /></div>
            <span className="stat-change up"><ArrowUpRight size={12} /> 8.2%</span>
          </div>
          <div>
            <div className="stat-value">{orders.toLocaleString()}</div>
            <div className="stat-label">Total Orders</div>
          </div>
        </div>

        <div className="stat-card amber">
          <div className="flex items-center justify-between">
            <div className="stat-icon amber"><Coffee size={20} /></div>
            <span className="stat-change up"><ArrowUpRight size={12} /> 3.1%</span>
          </div>
          <div>
            <div className="stat-value">₹{avgOrder.toLocaleString()}</div>
            <div className="stat-label">Avg Order Value</div>
          </div>
        </div>

        <div className="stat-card emerald">
          <div className="flex items-center justify-between">
            <div className="stat-icon emerald"><Users size={20} /></div>
            <span className="stat-change up"><ArrowUpRight size={12} /> 5.8%</span>
          </div>
          <div>
            <div className="stat-value">{stats.customers || 0}</div>
            <div className="stat-label">Active Customers</div>
          </div>
        </div>

        <div className="stat-card rose">
          <div className="flex items-center justify-between">
            <div className="stat-icon rose"><AlertTriangle size={20} /></div>
            {wasteAmount > 500 ? (
              <span className="stat-change down"><ArrowDownRight size={12} /> High</span>
            ) : (
              <span className="stat-change up"><ArrowUpRight size={12} /> Low</span>
            )}
          </div>
          <div>
            <div className="stat-value">₹{wasteAmount.toLocaleString()}</div>
            <div className="stat-label">Waste This Period</div>
          </div>
        </div>

        <div className="stat-card blue">
          <div className="flex items-center justify-between">
            <div className="stat-icon blue"><Package size={20} /></div>
            {lowStock > 0 && <span className="badge badge-rose">{lowStock} alerts</span>}
          </div>
          <div>
            <div className="stat-value">{stats.inventoryItems || 0}</div>
            <div className="stat-label">Inventory Items</div>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="two-col" style={{ marginBottom: 24 }}>
        {/* Sales Trend */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">📈 Revenue Trend (30 Days)</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={salesTrend}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} interval={4} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={2.5} dot={false} name="Revenue (₹)" />
                <Line type="monotone" dataKey="orders" stroke="#06b6d4" strokeWidth={2} dot={false} name="Orders" strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🍕 Sales by Category</span>
          </div>
          <div className="chart-container" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <ResponsiveContainer width="55%" height={220}>
              <PieChart>
                <Pie
                  data={categoryBreakdown.length > 0 ? categoryBreakdown : [{ name: 'No data', value: 1 }]}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {(categoryBreakdown.length > 0 ? categoryBreakdown : [{ name: 'No data', value: 1 }]).map((_: any, index: number) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: any) => `₹${Number(v).toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {categoryBreakdown.slice(0, 5).map((c: any, i: number) => (
                <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                  <div style={{ flex: 1, fontSize: '0.78rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>₹{Number(c.value).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="two-col">
        {/* Top Items */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">⭐ Top Selling Items</span>
          </div>
          <div style={{ overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Item</th>
                  <th>Qty Sold</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topItems.slice(0, 8).map((item: any, i: number) => (
                  <tr key={item.id || i}>
                    <td>
                      <span style={{
                        width: 22, height: 22, borderRadius: 6,
                        background: i < 3 ? 'rgba(124,58,237,0.2)' : 'var(--bg-elevated)',
                        color: i < 3 ? '#a78bfa' : 'var(--text-muted)',
                        fontSize: '0.72rem', fontWeight: 700,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {i + 1}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{item.name}</td>
                    <td>
                      <span className="badge badge-cyan">{item.qty || item.totalQty || 0}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: '#10b981' }}>₹{(item.revenue || 0).toLocaleString()}</td>
                  </tr>
                ))}
                {topItems.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>No sales data yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Branch Leaderboard */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">🏆 Branch Comparison</span>
          </div>
          <div className="card-body">
            {leaderboard.map((branch: any, i: number) => {
              const maxRev = Math.max(...leaderboard.map((b: any) => b.revenue || 0));
              const pct = maxRev > 0 ? Math.round(((branch.revenue || 0) / maxRev) * 100) : 0;
              return (
                <div key={branch.id} style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        width: 22, height: 22, borderRadius: 6,
                        background: i === 0 ? 'rgba(245,158,11,0.2)' : 'var(--bg-elevated)',
                        color: i === 0 ? '#fbbf24' : 'var(--text-muted)',
                        fontSize: '0.72rem', fontWeight: 700,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i + 1}
                      </span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{branch.name}</span>
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981' }}>₹{(branch.revenue || 0).toLocaleString()}</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${pct}%`,
                        background: i === 0 ? 'linear-gradient(90deg, #7c3aed, #06b6d4)' : 'linear-gradient(90deg, #334155, #475569)'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    <span>{branch.orders || 0} orders</span>
                    <span>{branch.customers || 0} customers</span>
                    <span>{pct}% of top</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
