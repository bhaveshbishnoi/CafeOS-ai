"use client";
import React from 'react';
import { useCafeStore } from '../store';
import { Bell, Search, RefreshCw, Menu } from 'lucide-react';

const tabTitles: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Overview of your cafe performance' },
  pos: { title: 'Point of Sale', subtitle: 'Process orders and manage transactions' },
  kds: { title: 'Kitchen Display System', subtitle: 'Live order queue for kitchen staff' },
  tables: { title: 'Tables & Reservations', subtitle: 'Manage table status and reservations' },
  inventory: { title: 'Inventory Management', subtitle: 'Track stock levels and suppliers' },
  recipes: { title: 'Recipe Costing', subtitle: 'Analyze food cost and margins' },
  waste: { title: 'Waste Tracking', subtitle: 'Monitor and reduce food waste' },
  crm: { title: 'CRM & Loyalty', subtitle: 'Customer relationships and loyalty program' },
  campaigns: { title: 'Marketing Campaigns', subtitle: 'Automated marketing and outreach' },
  analytics: { title: 'Business Analytics', subtitle: 'Revenue, traffic, and performance insights' },
  staff: { title: 'Staff & HR', subtitle: 'Performance, shifts, and attendance' },
  financials: { title: 'Financials', subtitle: 'P&L, expenses, and cost analysis' },
  forecasting: { title: 'AI Forecasting', subtitle: 'Demand prediction and purchase planning' },
  ai: { title: 'AI Copilot', subtitle: 'Your intelligent business advisor' },
  branches: { title: 'Multi-Branch Overview', subtitle: 'Compare branch performance' },
  reports: { title: 'Reports', subtitle: 'Export and schedule reports' },
  settings: { title: 'Settings', subtitle: 'Configure your cafe and preferences' },
};

interface TopbarProps {
  onRefresh: () => void;
}

export default function Topbar({ onRefresh }: TopbarProps) {
  const { activeTab, selectedBranchName, toggleSidebar } = useCafeStore() as any;
  const info = tabTitles[activeTab] || { title: activeTab, subtitle: '' };

  return (
    <header className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={toggleSidebar}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
          title="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <div>
          <div className="topbar-title">{info.title}</div>
          <div className="topbar-subtitle">
            {selectedBranchName ? `${selectedBranchName} · ` : ''}{info.subtitle}
          </div>
        </div>
      </div>

      <div className="topbar-right">
        <button
          onClick={onRefresh}
          className="btn btn-secondary btn-sm"
          style={{ padding: '7px 12px' }}
          title="Refresh data"
        >
          <RefreshCw size={14} />
        </button>
        <button
          className="btn btn-secondary"
          style={{ padding: '7px', position: 'relative' }}
          title="Notifications"
        >
          <Bell size={18} />
          <span style={{
            position: 'absolute', top: 5, right: 5, width: 7, height: 7,
            background: '#ef4444', borderRadius: '50%',
            border: '1.5px solid var(--bg-surface)'
          }} />
        </button>
      </div>
    </header>
  );
}
