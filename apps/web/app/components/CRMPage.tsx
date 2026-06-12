"use client";
import React, { useState } from 'react';
import { useCafeStore, API_URL } from '../store';
import { Users, Star, Gift, MessageSquare, Award, TrendingUp, Megaphone, Plus, X } from 'lucide-react';

interface CRMProps {
  customers: any[];
  campaigns: any[];
  onUpdate: () => void;
}

const TIER_COLORS: Record<string, string> = { SILVER: '#94a3b8', GOLD: '#fbbf24', PLATINUM: '#a78bfa' };
const TIER_BG: Record<string, string> = { SILVER: 'rgba(148,163,184,0.1)', GOLD: 'rgba(251,191,36,0.1)', PLATINUM: 'rgba(167,139,250,0.1)' };

export default function CRMPage({ customers, campaigns, onUpdate }: CRMProps) {
  const { token, selectedBranchId } = useCafeStore();
  const [tab, setTab] = useState<'customers' | 'campaigns'>('customers');
  const [search, setSearch] = useState('');
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ name: '', channel: 'WHATSAPP', content: '' });

  const filtered = customers.filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search)
  );

  const totalLoyaltyPts = customers.reduce((s, c) => s + (c.loyaltyPoints || 0), 0);
  const platinum = customers.filter(c => c.membershipTier === 'PLATINUM').length;
  const gold = customers.filter(c => c.membershipTier === 'GOLD').length;

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranchId || !newCampaign.name || !newCampaign.content) return;
    try {
      await fetch(`${API_URL}/crm/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...newCampaign, branchId: selectedBranchId, status: 'ACTIVE', triggerEvent: 'CUSTOM' })
      });
      setShowCampaignModal(false);
      setNewCampaign({ name: '', channel: 'WHATSAPP', content: '' });
      onUpdate();
    } catch { /* ignore */ }
  };

  return (
    <div className="animate-fade-in">
      {/* Stats */}
      <div className="stat-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card purple">
          <div className="stat-icon purple"><Users size={20} /></div>
          <div className="stat-value">{customers.length}</div>
          <div className="stat-label">Total Customers</div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon amber"><Star size={20} /></div>
          <div className="stat-value">{gold + platinum}</div>
          <div className="stat-label">Premium Members</div>
        </div>
        <div className="stat-card emerald">
          <div className="stat-icon emerald"><Gift size={20} /></div>
          <div className="stat-value">{totalLoyaltyPts.toLocaleString()}</div>
          <div className="stat-label">Loyalty Points Issued</div>
        </div>
        <div className="stat-card cyan">
          <div className="stat-icon cyan"><Megaphone size={20} /></div>
          <div className="stat-value">{campaigns.filter(c => c.status === 'ACTIVE').length}</div>
          <div className="stat-label">Active Campaigns</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button className={`tag${tab === 'customers' ? ' active' : ''}`} onClick={() => setTab('customers')}>
          👥 Customers ({customers.length})
        </button>
        <button className={`tag${tab === 'campaigns' ? ' active' : ''}`} onClick={() => setTab('campaigns')}>
          📣 Campaigns ({campaigns.length})
        </button>
      </div>

      {tab === 'customers' && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">Customer Directory</span>
            <input
              className="input" style={{ maxWidth: 240 }}
              placeholder="Search by name or phone..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Tier</th>
                  <th>Visits</th>
                  <th>Total Spent</th>
                  <th>Loyalty Points</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="avatar" style={{
                          background: `linear-gradient(135deg, ${TIER_COLORS[c.membershipTier] || '#7c3aed'}, #06b6d4)`,
                          color: 'white', fontSize: '0.72rem'
                        }}>
                          {c.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{c.name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{c.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge" style={{
                        background: TIER_BG[c.membershipTier] || 'rgba(148,163,184,0.1)',
                        color: TIER_COLORS[c.membershipTier] || '#94a3b8'
                      }}>
                        {c.membershipTier === 'PLATINUM' ? '💎' : c.membershipTier === 'GOLD' ? '⭐' : '🥈'} {c.membershipTier}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{c.totalVisits || 0}</td>
                    <td style={{ fontWeight: 600, color: '#10b981' }}>₹{(c.totalSpend || 0).toLocaleString()}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Gift size={13} color="#fbbf24" />
                        <span style={{ fontWeight: 600, color: '#fbbf24' }}>{c.loyaltyPoints || 0}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 30 }}>No customers found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'campaigns' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button className="btn btn-primary" onClick={() => setShowCampaignModal(true)}>
              <Plus size={16} /> New Campaign
            </button>
          </div>
          <div className="card">
            <table className="data-table">
              <thead>
                <tr><th>Campaign</th><th>Channel</th><th>Status</th><th>Trigger</th><th>Created</th></tr>
              </thead>
              <tbody>
                {campaigns.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.name}</td>
                    <td>
                      <span className="badge badge-purple">
                        {c.channel === 'WHATSAPP' ? '📱' : c.channel === 'EMAIL' ? '📧' : c.channel === 'SMS' ? '💬' : '📣'} {c.channel}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${c.status === 'ACTIVE' ? 'badge-emerald' : c.status === 'DRAFT' ? 'badge-slate' : 'badge-cyan'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{c.triggerEvent || 'Manual'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
                {campaigns.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 30 }}>No campaigns yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Campaign Modal */}
      {showCampaignModal && (
        <div className="modal-overlay" onClick={() => setShowCampaignModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'Outfit,sans-serif', fontWeight: 700 }}>Launch Campaign</h3>
              <button onClick={() => setShowCampaignModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateCampaign} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Campaign Name</label>
                <input className="input" required placeholder="e.g. Weekend Happy Hour" value={newCampaign.name} onChange={e => setNewCampaign(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Channel</label>
                <select className="input" value={newCampaign.channel} onChange={e => setNewCampaign(p => ({ ...p, channel: e.target.value }))}>
                  {['WHATSAPP', 'SMS', 'EMAIL', 'SOCIAL'].map(ch => <option key={ch} value={ch}>{ch}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>Message Content</label>
                <textarea className="input" required rows={4} placeholder="Write your campaign message..." value={newCampaign.content} onChange={e => setNewCampaign(p => ({ ...p, content: e.target.value }))} style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowCampaignModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary"><Megaphone size={14} /> Launch</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
