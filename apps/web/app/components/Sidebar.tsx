"use client";
import React from 'react';
import { useCafeStore } from '../store';
import {
  LayoutDashboard, ShoppingCart, Package, Users, Bot,
  TrendingUp, Utensils, Calendar, FileText, Settings,
  ChevronLeft, ChevronRight, Coffee, LogOut,
  GitBranch, Award, Megaphone, AlertTriangle, BarChart3,
  ClipboardList, UserCheck
} from 'lucide-react';

interface NavSection {
  label: string;
  items: NavItem[];
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

const navSections: NavSection[] = [
  {
    label: 'Operations',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
      { id: 'pos', label: 'Point of Sale', icon: <ShoppingCart size={18} /> },
      { id: 'kds', label: 'Kitchen Display', icon: <Utensils size={18} /> },
      { id: 'tables', label: 'Tables & Reservations', icon: <Calendar size={18} /> },
    ]
  },
  {
    label: 'Inventory',
    items: [
      { id: 'inventory', label: 'Inventory', icon: <Package size={18} /> },
      { id: 'recipes', label: 'Recipe Costing', icon: <ClipboardList size={18} /> },
      { id: 'waste', label: 'Waste Tracking', icon: <AlertTriangle size={18} /> },
    ]
  },
  {
    label: 'Customers & Marketing',
    items: [
      { id: 'crm', label: 'CRM & Loyalty', icon: <Users size={18} /> },
      { id: 'campaigns', label: 'Marketing', icon: <Megaphone size={18} /> },
    ]
  },
  {
    label: 'Analytics & AI',
    items: [
      { id: 'analytics', label: 'Analytics', icon: <TrendingUp size={18} /> },
      { id: 'staff', label: 'Staff & HR', icon: <UserCheck size={18} /> },
      { id: 'financials', label: 'Financials', icon: <BarChart3 size={18} /> },
      { id: 'forecasting', label: 'Forecasting', icon: <GitBranch size={18} /> },
      { id: 'ai', label: 'AI Copilot', icon: <Bot size={18} /> },
    ]
  },
  {
    label: 'Management',
    items: [
      { id: 'branches', label: 'Multi-Branch', icon: <Award size={18} /> },
      { id: 'reports', label: 'Reports', icon: <FileText size={18} /> },
      { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
    ]
  },
];

export default function Sidebar() {
  const { activeTab, setActiveTab, user, logout, sidebarCollapsed, toggleSidebar, branches, setSelectedBranch, selectedBranchId, selectedBranchName } = useCafeStore() as any;

  const initials = user?.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const roleColor: Record<string, string> = {
    CAFE_OWNER: '#a78bfa',
    MANAGER: '#34d399',
    CASHIER: '#67e8f9',
    KITCHEN_STAFF: '#fbbf24',
    SUPER_ADMIN: '#f87171',
  };

  return (
    <aside className={`sidebar${sidebarCollapsed ? ' collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Coffee size={18} color="white" />
        </div>
        {!sidebarCollapsed && (
          <div className="sidebar-logo-text">
            <span className="brand">CafeOS AI</span>
            <span className="tagline">Cafe Operating System</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          style={{
            marginLeft: 'auto', background: 'rgba(255,255,255,0.06)',
            border: 'none', borderRadius: 6, padding: 6,
            color: 'rgba(255,255,255,0.4)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', flexShrink: 0
          }}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* Branch Selector */}
      {!sidebarCollapsed && (branches?.length > 0) && (
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-default)' }}>
          <select
            className="input"
            style={{ fontSize: '0.78rem', padding: '7px 10px' }}
            value={selectedBranchId || ''}
            onChange={e => {
              const b = branches.find((br: any) => br.id === e.target.value);
              if (b) setSelectedBranch(b.id, b.name);
            }}
          >
            {branches.map((b: any) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Nav */}
      <nav className="sidebar-nav">
        {navSections.map(section => (
          <div key={section.label}>
            <div className="sidebar-section-label">{section.label}</div>
            {section.items.map(item => (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                className={`nav-item${activeTab === item.id ? ' active' : ''}`}
                onClick={() => setActiveTab(item.id)}
                title={sidebarCollapsed ? item.label : undefined}
                style={{ width: '100%', background: 'none', cursor: 'pointer' }}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </button>
            ))}
          </div>
        ))}
      </nav>

      {/* User Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user" title={sidebarCollapsed ? `${user?.name} (${user?.role})` : undefined}>
          <div className="sidebar-avatar">
            {initials}
          </div>
          {!sidebarCollapsed && (
            <div className="sidebar-user-info" style={{ flex: 1, minWidth: 0 }}>
              <div className="sidebar-user-name">{user?.name || 'User'}</div>
              <div className="sidebar-user-role" style={{ color: roleColor[user?.role] || 'var(--text-muted)' }}>
                {user?.role?.replace(/_/g, ' ')}
              </div>
            </div>
          )}
          {!sidebarCollapsed && (
            <button
              id="sidebar-logout"
              onClick={logout}
              title="Logout"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'rgba(255,255,255,0.3)', padding: 4,
                display: 'flex', alignItems: 'center',
                transition: 'color 0.2s'
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
