"use client";
import React, { useState, useRef, useEffect } from 'react';
import { useCafeStore, API_URL } from '../store';
import { Bot, Send, User, Sparkles, Zap, TrendingUp, Package, DollarSign } from 'lucide-react';

interface AIProps {
  recommendations: any[];
  onUpdate: () => void;
}

interface Message {
  role: 'ai' | 'user';
  text: string;
  queries: string[];
}

const SUGGESTED_QUESTIONS = [
  "Why are profits down this month?",
  "Which menu items should I remove?",
  "What should I order from suppliers tomorrow?",
  "Which staff members perform best?",
  "How can I increase revenue by 20%?",
  "What are my highest margin items?",
  "Predict next week's demand",
  "Which customers are at risk of churn?",
];

function parseMarkdown(text: string) {
  return text
    .replace(/### (.*)/g, '<h3 style="font-size:0.95rem;font-weight:700;margin:10px 0 4px;color:var(--text-primary)">$1</h3>')
    .replace(/## (.*)/g, '<h2 style="font-size:1rem;font-weight:700;margin:12px 0 6px;color:var(--text-primary)">$1</h2>')
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary)">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^- (.*)/gm, '<li style="margin-left:16px;margin-bottom:3px">$1</li>')
    .replace(/\n/g, '<br/>');
}

export default function AIPage({ recommendations, onUpdate }: AIProps) {
  const { token, selectedBranchId } = useCafeStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai' as const,
      text: `### 👋 Hello! I'm your CafeOS AI Business Consultant.\n\nI have full access to your sales data, inventory, customer behavior, and staff metrics. Ask me anything about your business!\n\n**Try asking me:**`,
      queries: SUGGESTED_QUESTIONS.slice(0, 3)
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || !selectedBranchId) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user' as const, text: msg, queries: [] }]);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/ai/branches/${selectedBranchId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ message: msg })
      });
      const data = await res.json();
      setMessages(prev => [...prev, {
        role: 'ai' as const,
        text: data.reply || 'I encountered an error processing your request.',
        queries: data.suggestedQueries || []
      }]);
    } catch {
      setMessages(prev => [...prev, { role: 'ai' as const, text: '❌ Connection error. Please try again.', queries: [] }]);
    }
    setLoading(false);
  };

  const handleDeploy = async (rec: any) => {
    try {
      const res = await fetch(`${API_URL}/ai/recommendations/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ actionCode: rec.actionCode, payload: rec.actionPayload })
      });
      const data = await res.json();
      alert(data.message || 'Action deployed!');
      onUpdate();
    } catch { alert('Deployment failed'); }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, height: 'calc(100vh - 140px)' }}>
      {/* Chat */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bot size={18} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>CafeOS AI Copilot</div>
            <div style={{ fontSize: '0.72rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              Online · Analyzing your data
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: msg.role === 'ai' ? 'linear-gradient(135deg, #7c3aed, #06b6d4)' : 'var(--bg-elevated)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  {msg.role === 'ai' ? <Bot size={14} color="white" /> : <User size={14} color="var(--text-secondary)" />}
                </div>
                <div
                  className={`chat-bubble ${msg.role}`}
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.text) }}
                />
              </div>
              {msg.queries && msg.queries.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingLeft: 36 }}>
                  {msg.queries.map((q: string, qi: number) => (
                    <button key={qi} className="tag" onClick={() => sendMessage(q)} style={{ fontSize: '0.75rem' }}>
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Bot size={14} color="white" />
              </div>
              <div className="chat-bubble ai" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <span className="animate-pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: '#a78bfa', display: 'inline-block' }} />
                <span className="animate-pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: '#a78bfa', display: 'inline-block', animationDelay: '0.2s' }} />
                <span className="animate-pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: '#a78bfa', display: 'inline-block', animationDelay: '0.4s' }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggested questions */}
        <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border-default)', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {SUGGESTED_QUESTIONS.slice(4).map((q, i) => (
            <button key={i} className="tag" onClick={() => sendMessage(q)} style={{ fontSize: '0.72rem' }}>
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="chat-input-area">
          <input
            id="ai-chat-input"
            className="input"
            placeholder="Ask anything about your cafe business..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          />
          <button
            id="ai-send-btn"
            className="btn btn-primary"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            style={{ flexShrink: 0 }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      {/* AI Recommendations Panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sparkles size={16} color="#f59e0b" /> AI Actions
            </span>
          </div>
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {recommendations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <Sparkles size={28} style={{ margin: '0 auto 8px', opacity: 0.3, display: 'block' }} />
                No recommendations yet
              </div>
            ) : (
              recommendations.map((rec: any, i: number) => (
                <div key={i} style={{
                  background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                  borderRadius: 10, padding: 14
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      background: rec.priority === 'HIGH' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {rec.category === 'inventory' ? <Package size={14} color="#f59e0b" /> :
                        rec.category === 'revenue' ? <DollarSign size={14} color="#10b981" /> :
                          <TrendingUp size={14} color="#a78bfa" />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{rec.title}</div>
                      <span className={`badge ${rec.priority === 'HIGH' ? 'badge-rose' : 'badge-amber'}`} style={{ fontSize: '0.65rem' }}>
                        {rec.priority}
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.5 }}>
                    {rec.description}
                  </p>
                  {rec.actionCode && (
                    <button
                      className="btn btn-primary w-full btn-sm"
                      style={{ justifyContent: 'center', fontSize: '0.75rem' }}
                      onClick={() => handleDeploy(rec)}
                    >
                      <Zap size={12} /> Deploy Action
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
