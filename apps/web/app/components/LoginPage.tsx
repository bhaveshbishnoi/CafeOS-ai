"use client";
import React, { useState } from 'react';
import { useCafeStore, API_URL } from '../store';
import { Coffee, Zap } from 'lucide-react';

const demoUsers = [
  { label: 'Cafe Owner', email: 'owner@CafeOS.ai', icon: '👑' },
  { label: 'HSR Manager', email: 'manager.hsr@CafeOS.ai', icon: '🏪' },
  { label: 'Cashier', email: 'cashier.hsr@CafeOS.ai', icon: '💳' },
  { label: 'Kitchen', email: 'kitchen.hsr@CafeOS.ai', icon: '👨‍🍳' },
];

export default function LoginPage() {
  const { setAuth } = useCafeStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setAuth(data.access_token, data.user);
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch {
      setError('Cannot connect to server. Ensure API is running on port 5001.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  return (
    <div className="login-page">
      <div className="login-card animate-fade-in">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', boxShadow: '0 0 30px rgba(124,58,237,0.4)'
          }}>
            <Coffee size={28} color="white" />
          </div>
          <h1 style={{ fontFamily: 'Outfit,sans-serif', fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
            CafeOS AI
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            AI-Powered Cafe Operating System
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              className="input"
              placeholder="you@cafeos.ai"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block' }}>
              Password
            </label>
            <input
              id="login-password"
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="alert alert-danger" style={{ fontSize: '0.8rem' }}>
              ⚠️ {error}
            </div>
          )}

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary w-full"
            style={{ justifyContent: 'center', padding: '12px', marginTop: 4 }}
            disabled={loading}
          >
            {loading ? (
              <span className="animate-spin" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} />
            ) : (
              <>Sign In to CafeOS</>
            )}
          </button>
        </form>

        {/* Quick Demo Access */}
        <div style={{ marginTop: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border-default)' }} />
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap size={12} /> Quick Access
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--border-default)' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {demoUsers.map(u => (
              <button
                key={u.email}
                id={`demo-${u.label.toLowerCase().replace(/\s/g, '-')}`}
                onClick={() => quickLogin(u.email)}
                className="btn btn-secondary"
                style={{ fontSize: '0.78rem', justifyContent: 'flex-start', gap: 8 }}
              >
                <span>{u.icon}</span>
                {u.label}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 10 }}>
            Password for all demo accounts: <code style={{ background: 'var(--bg-elevated)', padding: '1px 6px', borderRadius: 4 }}>password123</code>
          </p>
        </div>
      </div>
    </div>
  );
}
