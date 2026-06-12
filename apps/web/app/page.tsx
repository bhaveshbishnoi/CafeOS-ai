"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
  useCafeStore,
  CartItem,
  User
} from './store';
import {
  Coffee,
  TrendingUp,
  ClipboardList,
  Users,
  Bot,
  LogOut,
  Package,
  Percent,
  AlertTriangle,
  Calendar,
  DollarSign,
  Layers,
  Plus,
  Minus,
  Trash2,
  Sparkles,
  Play,
  Send,
  UserCheck,
  CheckCircle2,
  Hourglass,
  LayoutGrid,
  FileSpreadsheet,
  Settings,
  HelpCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const API_URL = 'http://localhost:5001/api';

export default function CafeOSDashboard() {
  const {
    token,
    user,
    selectedBranchId,
    selectedBranchName,
    activeTab,
    cart,
    selectedTableId,
    selectedTableName,
    selectedCustomerId,
    selectedCustomerName,
    discount,
    setAuth,
    logout,
    setSelectedBranch,
    setActiveTab,
    addToCart,
    removeFromCart,
    updateCartQty,
    clearCart,
    setSelectedTable,
    setSelectedCustomer,
    setDiscount
  } = useCafeStore();

  // Authentication states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // App data states
  const [branches, setBranches] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [costings, setCostings] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [staffMetrics, setStaffMetrics] = useState<any[]>([]);

  // AI chat states
  const [chatMessages, setChatMessages] = useState<any[]>([
    {
      sender: 'ai',
      text: '### Hello! I am your CafeOS AI Business Consultant.\n\nAsk me anything about your profitability, inventory predictions, staff performance, or menu recommendations.',
      queries: ['Why are profits down this month?', 'What should I order tomorrow?', 'Which staff members perform best?']
    }
  ]);
  const [aiInput, setAiInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);

  // UI interaction states
  const [posCategory, setPosCategory] = useState('All');
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState('UPI');
  const [checkoutOrderType, setCheckoutOrderType] = useState('DINE_IN');
  const [posNotifications, setPosNotifications] = useState<string[]>([]);
  const [reservationName, setReservationName] = useState('');
  const [reservationPhone, setReservationPhone] = useState('');
  const [reservationParty, setReservationParty] = useState(2);
  const [reservationTime, setReservationTime] = useState('');
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedKdsStatus, setSelectedKdsStatus] = useState('ALL');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('INVENTORY');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignChannel, setNewCampaignChannel] = useState('WHATSAPP');
  const [newCampaignContent, setNewCampaignContent] = useState('');
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);

  // Quick credentials for easy manual evaluation
  const demoUsers = [
    { label: 'Cafe Owner', email: 'owner@CafeOS.ai' },
    { label: 'HSR Manager', email: 'manager.hsr@CafeOS.ai' },
    { label: 'HSR Cashier', email: 'cashier.hsr@CafeOS.ai' },
    { label: 'Indira Cashier', email: 'cashier.indira@CafeOS.ai' },
    { label: 'HSR Kitchen', email: 'kitchen.hsr@CafeOS.ai' }
  ];

  // Ref for scroll to bottom in chat
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Fetch branches helper
  const fetchBranches = async (authToken: string) => {
    try {
      const res = await fetch(`${API_URL}/analytics/compare`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
        const uniqueBranches = data.map((b: any) => ({ id: b.id, name: b.name }));
        setBranches(uniqueBranches);
        // Default select first branch if none selected
        if (uniqueBranches.length > 0 && !selectedBranchId) {
          setSelectedBranch(uniqueBranches[0].id, uniqueBranches[0].name);
        }
      }
    } catch (err) {
      console.error('Error fetching branches:', err);
    }
  };

  // Fetch all data based on selected branch
  const fetchBranchData = async () => {
    if (!token || !selectedBranchId) return;
    const authHeaders = { 'Authorization': `Bearer ${token}` };

    try {
      // 1. Dashboard metrics
      const dashRes = await fetch(`${API_URL}/analytics/branches/${selectedBranchId}/dashboard`, { headers: authHeaders });
      if (dashRes.ok) setDashboardStats(await dashRes.json());

      // 2. Tables
      const tablesRes = await fetch(`${API_URL}/pos/branches/${selectedBranchId}/tables`, { headers: authHeaders });
      if (tablesRes.ok) setTables(await tablesRes.json());

      // 3. Menu items
      const menuRes = await fetch(`${API_URL}/pos/branches/${selectedBranchId}/menu`, { headers: authHeaders });
      if (menuRes.ok) setMenuItems(await menuRes.json());

      // 4. Orders
      const ordersRes = await fetch(`${API_URL}/pos/branches/${selectedBranchId}/orders`, { headers: authHeaders });
      if (ordersRes.ok) setOrders(await ordersRes.json());

      // 5. Ingredients
      const ingRes = await fetch(`${API_URL}/inventory/branches/${selectedBranchId}/ingredients`, { headers: authHeaders });
      if (ingRes.ok) setIngredients(await ingRes.json());

      // 6. Recipe costing
      const costingRes = await fetch(`${API_URL}/inventory/branches/${selectedBranchId}/recipes/costing`, { headers: authHeaders });
      if (costingRes.ok) setCostings(await costingRes.json());

      // 7. Customers
      const custRes = await fetch(`${API_URL}/crm/branches/${selectedBranchId}/customers`, { headers: authHeaders });
      if (custRes.ok) setCustomers(await custRes.json());

      // 8. Campaigns
      const campRes = await fetch(`${API_URL}/crm/branches/${selectedBranchId}/campaigns`, { headers: authHeaders });
      if (campRes.ok) setCampaigns(await campRes.json());

      // 9. Staff metrics
      const staffRes = await fetch(`${API_URL}/analytics/branches/${selectedBranchId}/staff-metrics`, { headers: authHeaders });
      if (staffRes.ok) setStaffMetrics(await staffRes.json());

      // 10. AI Recommendations
      const recsRes = await fetch(`${API_URL}/ai/branches/${selectedBranchId}/recommendations`, { headers: authHeaders });
      if (recsRes.ok) setAiRecommendations(await recsRes.json());

      // 11. Suppliers
      const supRes = await fetch(`${API_URL}/inventory/suppliers`, { headers: authHeaders });
      if (supRes.ok) setSuppliers(await supRes.json());

      // 12. Compare Leaderboard (re-fetch)
      const leadRes = await fetch(`${API_URL}/analytics/compare`, { headers: authHeaders });
      if (leadRes.ok) setLeaderboard(await leadRes.json());
    } catch (err) {
      console.error('Error fetching branch data:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchBranches(token);
    }
  }, [token]);

  useEffect(() => {
    if (token && selectedBranchId) {
      fetchBranchData();
    }
  }, [token, selectedBranchId, activeTab]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoggingIn(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setAuth(data.access_token, data.user);
      } else {
        setAuthError(data.message || 'Login failed. Please verify credentials.');
      }
    } catch (err) {
      setAuthError('Connection server error.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const selectDemoUser = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
  };

  // Cart Operations
  const handleCheckout = async () => {
    if (cart.length === 0 || !selectedBranchId) return;
    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const payload = {
      branchId: selectedBranchId,
      type: checkoutOrderType,
      paymentMethod: checkoutPaymentMethod,
      tableId: selectedTableId,
      customerId: selectedCustomerId,
      discount: discount,
      items: cart.map(i => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
      splitPayments: checkoutPaymentMethod === 'SPLIT' ? [
        { method: 'UPI', amount: Math.floor(cart.reduce((a, c) => a + c.price * c.quantity, 0) * 0.6) },
        { method: 'CASH', amount: Math.ceil(cart.reduce((a, c) => a + c.price * c.quantity, 0) * 0.4) }
      ] : undefined
    };

    try {
      const res = await fetch(`${API_URL}/pos/orders`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setPosNotifications(data.lowStockAlerts || []);
        clearCart();
        fetchBranchData();
        alert('Order placed successfully!');
      } else {
        alert(`Checkout failed: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update order status in KDS
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`${API_URL}/pos/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchBranchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update table status
  const handleUpdateTableStatus = async (tableId: string, status: string) => {
    try {
      const res = await fetch(`${API_URL}/pos/tables/${tableId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchBranchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Reservation
  const handleCreateReservation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranchId || !selectedTableId) return;

    try {
      const res = await fetch(`${API_URL}/pos/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          branchId: selectedBranchId,
          tableId: selectedTableId,
          customerName: reservationName,
          customerPhone: reservationPhone,
          dateTime: reservationTime,
          partySize: reservationParty
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Reservation created successfully!');
        setShowReservationModal(false);
        setReservationName('');
        setReservationPhone('');
        setReservationTime('');
        fetchBranchData();
      } else {
        alert(`Failed: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Log new expense
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranchId || !expenseAmount) return;

    try {
      const res = await fetch(`${API_URL}/analytics/branches/${selectedBranchId}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          category: expenseCategory,
          amount: parseFloat(expenseAmount),
          description: expenseDesc,
          date: new Date().toISOString()
        })
      });
      if (res.ok) {
        alert('Expense logged!');
        setExpenseAmount('');
        setExpenseDesc('');
        fetchBranchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Create Campaign
  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranchId || !newCampaignName || !newCampaignContent) return;

    try {
      const res = await fetch(`${API_URL}/crm/campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          branchId: selectedBranchId,
          name: newCampaignName,
          channel: newCampaignChannel,
          content: newCampaignContent,
          status: 'ACTIVE',
          triggerEvent: 'CUSTOM_AI_TRIGGER'
        })
      });
      if (res.ok) {
        alert('Marketing Campaign launched successfully!');
        setNewCampaignName('');
        setNewCampaignContent('');
        setShowNewCampaignModal(false);
        fetchBranchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Execute AI Growth Recommendation
  const handleDeployRecommendation = async (rec: any) => {
    try {
      const res = await fetch(`${API_URL}/ai/recommendations/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          actionCode: rec.actionCode,
          payload: rec.actionPayload
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Growth action deployed successfully!');
        fetchBranchData();
      } else {
        alert(`Failed: ${data.message}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // AI chat messenger
  const handleSendChatMessage = async (textToSend?: string) => {
    const messageText = textToSend || aiInput;
    if (!messageText || !selectedBranchId) return;

    // Add user message to state
    setChatMessages(prev => [...prev, { sender: 'user', text: messageText }]);
    setAiInput('');
    setIsAiLoading(true);

    try {
      const res = await fetch(`${API_URL}/ai/branches/${selectedBranchId}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: messageText })
      });
      const data = await res.json();
      if (res.ok) {
        setChatMessages(prev => [...prev, {
          sender: 'ai',
          text: data.reply,
          queries: data.suggestedQueries
        }]);
      } else {
        setChatMessages(prev => [...prev, {
          sender: 'ai',
          text: 'Sorry, I failed to process that analysis. Please try again.'
        }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Auth Card Renderer
  if (!token) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#030712] relative overflow-hidden font-sans px-4">
        {/* Glow circles */}
        <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] rounded-full bg-violet-900/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[500px] h-[500px] rounded-full bg-emerald-900/10 blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md p-8 rounded-2xl glass-panel relative z-10 shadow-glow-purple">
          <div className="flex justify-center mb-6">
            <div className="p-3 bg-violet-600/20 border border-violet-500/30 rounded-2xl">
              <Coffee className="w-10 h-10 text-violet-400 animate-pulse" />
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-center tracking-tight text-white mb-2 font-outfit">
            CafeOS <span className="text-violet-400">AI</span>
          </h1>
          <p className="text-sm text-gray-400 text-center mb-8">
            Advanced AI-Powered Operating System
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="owner@CafeOS.ai"
                className="w-full px-4 py-3 bg-gray-950/60 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-400 tracking-wider mb-2">
                Security Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-gray-950/60 border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
              />
            </div>

            {authError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-lg flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition cursor-pointer glow-btn shadow-md text-sm uppercase tracking-wide"
            >
              {isLoggingIn ? 'Verifying Session...' : 'Authenticate Credentials'}
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-8 border-t border-gray-800 pt-6">
            <p className="text-xs text-center text-gray-500 mb-4 font-semibold uppercase tracking-wider">
              Quick evaluation access (Password: password123)
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {demoUsers.map(demo => (
                <button
                  key={demo.label}
                  onClick={() => selectDemoUser(demo.email)}
                  className="px-3 py-2 bg-gray-950/50 hover:bg-violet-950/20 border border-gray-800 hover:border-violet-800/40 text-gray-300 rounded-lg text-left transition cursor-pointer"
                >
                  <div className="font-semibold text-gray-400">{demo.label}</div>
                  <div className="text-[10px] text-gray-600 truncate">{demo.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Helper colors for charts
  const COLORS = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

  return (
    <div className="min-h-screen bg-[#030712] text-gray-100 flex font-sans antialiased">
      {/* 1. Sidebar Navigation */}
      <aside className="w-64 border-r border-gray-800/60 flex flex-col justify-between p-5 bg-gray-950/40 flex-shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-8 px-2">
            <div className="p-2 bg-violet-500/10 border border-violet-500/20 rounded-xl">
              <Coffee className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight font-outfit text-white">CafeOS <span className="text-violet-400">AI</span></span>
              <span className="block text-[10px] uppercase text-gray-500 font-semibold tracking-widest">Cafe OS v1.0</span>
            </div>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { id: 'pos', label: 'POS Terminal', icon: Coffee },
              { id: 'kds', label: 'KDS Screens', icon: ClipboardList },
              { id: 'tables', label: 'Table Layout', icon: LayoutGrid },
              { id: 'inventory', label: 'Inventory Cost', icon: Package },
              { id: 'crm', label: 'CRM & campaigns', icon: Users },
              { id: 'ai', label: 'AI Business Copilot', icon: Bot, highlight: true }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              // Hide POS/KDS depending on role boundaries in strict apps
              if (user?.role === 'KITCHEN_STAFF' && tab.id === 'pos') return null;
              if (user?.role === 'CASHIER' && tab.id === 'kds') return null;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${isActive
                      ? 'bg-violet-600/20 border border-violet-500/30 text-white font-semibold shadow-glow-purple'
                      : tab.highlight
                        ? 'text-violet-400 hover:bg-violet-950/20'
                        : 'text-gray-400 hover:bg-gray-900/50 hover:text-white'
                    }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-violet-400' : 'text-gray-400'}`} />
                  <span>{tab.label}</span>
                  {tab.highlight && (
                    <Sparkles className="w-3 h-3 text-violet-400 ml-auto animate-bounce" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="border-t border-gray-800/80 pt-4 px-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-600/30 flex items-center justify-center border border-violet-500/20 font-bold text-violet-400 uppercase text-sm font-outfit">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <span className="block text-xs font-semibold text-white truncate">{user?.name || 'User'}</span>
              <span className="block text-[10px] text-gray-500 uppercase tracking-wide font-medium">{user?.role || 'Guest'}</span>
            </div>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/10 border border-transparent hover:border-rose-950/30 rounded-xl transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>End Session</span>
          </button>
        </div>
      </aside>

      {/* 2. Main Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#030712]/95 relative overflow-y-auto">

        {/* Header Controls */}
        <header className="flex justify-between items-center px-8 py-4 border-b border-gray-800/40 bg-gray-950/20 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold font-outfit text-white tracking-tight capitalize">
              {activeTab} Management
            </h2>
            <div className="h-4 w-[1px] bg-gray-800" />
            <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-900/60 px-3 py-1.5 rounded-lg border border-gray-800">
              <span className="font-semibold text-gray-500">USER MODE:</span>
              <span className="text-violet-400 font-bold uppercase tracking-wider">{user?.role || 'GUEST'}</span>
            </div>
          </div>

          {/* Branch Selection */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Viewing Location</span>
            <div className="flex bg-gray-900/60 p-1 rounded-xl border border-gray-800">
              {branches.map(b => (
                <button
                  key={b.id}
                  onClick={() => setSelectedBranch(b.id, b.name)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${selectedBranchId === b.id
                      ? 'bg-violet-600/30 border border-violet-500/30 text-white font-semibold'
                      : 'text-gray-400 hover:text-white'
                    }`}
                >
                  {b.name.split(' ')[0]} {/* Show HSR / Indiranagar */}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Core Tab Panels */}
        <div className="flex-1 p-8">

          {/* --- PANEL A: DASHBOARD --- */}
          {activeTab === 'dashboard' && dashboardStats && (
            <div className="space-y-8 animate-fade-in">
              {/* Financial Metrics Row */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'Gross Revenue', value: `₹${dashboardStats.financials.totalRevenue.toLocaleString()}`, change: '+14% vs prev week', color: 'text-white' },
                  { label: 'COGS (Food Cost)', value: `₹${dashboardStats.financials.totalCOGS.toLocaleString()}`, change: 'Recipe deducted', color: 'text-amber-400' },
                  { label: 'Waste Cost', value: `₹${dashboardStats.financials.totalWasteCost.toLocaleString()}`, change: 'Needs optimization', color: 'text-rose-400' },
                  { label: 'Net Profit', value: `₹${dashboardStats.financials.netProfit.toLocaleString()}`, change: `Net margin: ${dashboardStats.financials.netMargin}%`, color: 'text-emerald-400' }
                ].map((stat, idx) => (
                  <div key={idx} className="p-6 rounded-2xl glass-panel relative overflow-hidden shadow-sm hover:shadow-md transition">
                    <div className="absolute top-0 left-0 w-2 h-full bg-violet-600/40" />
                    <span className="block text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">{stat.label}</span>
                    <span className={`block text-3xl font-extrabold font-outfit mb-1 ${stat.color}`}>{stat.value}</span>
                    <span className="block text-[11px] text-gray-400 font-medium">{stat.change}</span>
                  </div>
                ))}
              </div>

              {/* Graphical Layouts */}
              <div className="grid grid-cols-3 gap-6">

                {/* 30 Day Sales trends */}
                <div className="col-span-2 p-6 rounded-2xl glass-panel">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">30-Day Sales Revenue Trend</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dashboardStats.salesTrend}>
                        <XAxis dataKey="date" stroke="#4b5563" fontSize={10} />
                        <YAxis stroke="#4b5563" fontSize={10} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
                        <Line type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={3} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Waste Cost categories */}
                <div className="p-6 rounded-2xl glass-panel flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">Spoilage Waste Cost breakdown</h3>
                    <div className="h-[180px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dashboardStats.wasteBreakdown}>
                          <XAxis dataKey="name" stroke="#4b5563" fontSize={9} />
                          <YAxis stroke="#4b5563" fontSize={9} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: 8 }} />
                          <Bar dataKey="value" fill="#EF4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="text-[11px] bg-rose-950/15 border border-rose-900/30 p-3 rounded-xl text-rose-300 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <span>Waste directly damages net profit. View <strong>AI Copilot</strong> tab for recommendations to minimize expirations.</span>
                  </div>
                </div>
              </div>

              {/* Bottom Row (Branch Comparisons, Popular dishes, Expenses logger) */}
              <div className="grid grid-cols-3 gap-6">

                {/* Branch Leaderboard */}
                <div className="p-6 rounded-2xl glass-panel">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">Multi-Branch Leaderboard</h3>
                  <div className="space-y-4">
                    {leaderboard.map((lead, idx) => (
                      <div key={idx} className="flex justify-between items-center border-b border-gray-800/40 pb-3 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-violet-400 bg-violet-600/10 px-2 py-1 rounded-lg">#{idx + 1}</span>
                          <div>
                            <span className="block text-xs font-bold text-white">{lead.name}</span>
                            <span className="block text-[10px] text-gray-500 font-medium">Rating: {lead.satisfaction} ★</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="block text-xs font-extrabold text-white">₹{lead.revenue.toLocaleString()}</span>
                          <span className="block text-[10px] text-emerald-400 font-medium">Profit: ₹{lead.profit.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Popular Dishes */}
                <div className="p-6 rounded-2xl glass-panel">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">Top Performing Menu Items</h3>
                  <div className="space-y-4">
                    {dashboardStats.topProducts.map((p: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-violet-500" />
                          <span className="text-xs font-bold text-gray-200">{p.name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-gray-500 font-semibold">{p.quantity} sold</span>
                          <span className="font-extrabold text-white">₹{p.revenue.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Expense logger */}
                <div className="p-6 rounded-2xl glass-panel">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">Log Branch Expense</h3>
                  <form onSubmit={handleAddExpense} className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Amount</label>
                        <input
                          type="number"
                          required
                          value={expenseAmount}
                          onChange={e => setExpenseAmount(e.target.value)}
                          placeholder="₹ Amount"
                          className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white text-xs focus:outline-none focus:border-violet-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Category</label>
                        <select
                          value={expenseCategory}
                          onChange={e => setExpenseCategory(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white text-xs focus:outline-none"
                        >
                          <option value="INVENTORY">Inventory</option>
                          <option value="PAYROLL">Payroll</option>
                          <option value="RENT">Rent</option>
                          <option value="UTILITIES">Utilities</option>
                          <option value="TAX">Taxes</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Description</label>
                      <input
                        type="text"
                        value={expenseDesc}
                        onChange={e => setExpenseDesc(e.target.value)}
                        placeholder="Electricity bill, ingredient refills etc."
                        className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white text-xs focus:outline-none focus:border-violet-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold text-xs rounded-xl cursor-pointer transition border border-gray-700 uppercase"
                    >
                      Log Expense
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* --- PANEL B: SMART POS --- */}
          {activeTab === 'pos' && (
            <div className="grid grid-cols-3 gap-6 items-start animate-fade-in">
              <div className="col-span-2 space-y-6">

                {/* Category selectors */}
                <div className="flex gap-2 bg-gray-950/40 p-1.5 rounded-xl border border-gray-800/40 inline-flex">
                  {['All', 'Coffee', 'Bakery'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setPosCategory(cat)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${posCategory === cat
                          ? 'bg-violet-600/30 border border-violet-500/30 text-white'
                          : 'text-gray-400 hover:text-white'
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Notifications and Low Stock flags */}
                {posNotifications.length > 0 && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-1">
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                      <AlertTriangle className="w-4 h-4" /> Real-time Stock Alerts triggered:
                    </span>
                    {posNotifications.map((alertMsg, index) => (
                      <div key={index} className="text-xs text-rose-300">• {alertMsg}</div>
                    ))}
                  </div>
                )}

                {/* POS Product grid */}
                <div className="grid grid-cols-3 gap-4">
                  {menuItems
                    .filter(item => posCategory === 'All' || item.category === posCategory)
                    .map(item => (
                      <button
                        key={item.id}
                        onClick={() => addToCart({ menuItemId: item.id, name: item.name, price: item.price })}
                        className="p-5 rounded-2xl glass-panel text-left flex flex-col justify-between h-36 hover:border-violet-500/40 transition cursor-pointer hover:shadow-glow-purple relative overflow-hidden group"
                      >
                        <div className="absolute top-0 right-0 w-8 h-8 bg-violet-600/10 rounded-bl-xl flex items-center justify-center border-l border-b border-violet-500/10 opacity-0 group-hover:opacity-100 transition">
                          <Plus className="w-4 h-4 text-violet-400" />
                        </div>
                        <div>
                          <span className="block text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">{item.category}</span>
                          <span className="block text-sm font-extrabold text-white leading-tight font-outfit">{item.name}</span>
                        </div>
                        <div className="flex justify-between items-end">
                          <span className="text-base font-extrabold text-violet-400 font-outfit">₹{item.price}</span>
                          <span className="text-[10px] text-emerald-400 font-medium">Profit: ~{item.price > 120 ? '70%' : '60%'}</span>
                        </div>
                      </button>
                    ))}
                </div>
              </div>

              {/* POS Cart Sidebar Checkout Pane */}
              <div className="p-6 rounded-2xl glass-panel flex flex-col justify-between shadow-glow-purple h-[550px]">
                <div>
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4 border-b border-gray-800 pb-3">Checkout cart</h3>

                  {/* Cart Item rows */}
                  <div className="space-y-3 max-h-[200px] overflow-y-auto pr-1">
                    {cart.length === 0 ? (
                      <p className="text-xs text-gray-500 text-center py-8">Cart is currently empty. Click on menu products to add them.</p>
                    ) : (
                      cart.map(i => (
                        <div key={i.menuItemId} className="flex justify-between items-center bg-gray-950/40 p-2.5 rounded-xl border border-gray-800/30">
                          <div className="overflow-hidden mr-2">
                            <span className="block text-xs font-bold text-white truncate">{i.name}</span>
                            <span className="block text-[10px] text-gray-500">₹{i.price} each</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateCartQty(i.menuItemId, i.quantity - 1)}
                              className="p-1 hover:bg-gray-800 rounded text-gray-400 cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-bold text-white w-4 text-center">{i.quantity}</span>
                            <button
                              onClick={() => updateCartQty(i.menuItemId, i.quantity + 1)}
                              className="p-1 hover:bg-gray-800 rounded text-gray-400 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => removeFromCart(i.menuItemId)}
                              className="p-1 hover:bg-rose-950/20 hover:text-rose-400 rounded text-gray-500 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Cart Settings */}
                  {cart.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-800/80 space-y-3 text-xs">
                      {/* Customer / Table tags */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-gray-500 mb-1">Select Table</label>
                          <select
                            value={selectedTableId || ''}
                            onChange={e => {
                              const tbl = tables.find(t => t.id === e.target.value);
                              setSelectedTable(tbl?.id || null, tbl?.name || null);
                            }}
                            className="w-full px-2 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-white text-[11px]"
                          >
                            <option value="">Walk-In</option>
                            {tables.map(t => (
                              <option key={t.id} value={t.id}>{t.name} ({t.status})</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-gray-500 mb-1">CRM Customer</label>
                          <select
                            value={selectedCustomerId || ''}
                            onChange={e => {
                              const cust = customers.find(c => c.id === e.target.value);
                              setSelectedCustomer(cust?.id || null, cust?.name || null);
                              if (cust?.membershipTier === 'PLATINUM') setDiscount(30);
                              else if (cust?.membershipTier === 'GOLD') setDiscount(15);
                              else setDiscount(0);
                            }}
                            className="w-full px-2 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-white text-[11px]"
                          >
                            <option value="">No Loyalty Profile</option>
                            {customers.map(c => (
                              <option key={c.id} value={c.id}>{c.name} ({c.membershipTier})</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Payment and Order Type */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-gray-500 mb-1">Order Type</label>
                          <select
                            value={checkoutOrderType}
                            onChange={e => setCheckoutOrderType(e.target.value)}
                            className="w-full px-2 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-white text-[11px]"
                          >
                            <option value="DINE_IN">Dine In</option>
                            <option value="TAKEAWAY">Takeaway</option>
                            <option value="DELIVERY">Delivery</option>
                            <option value="QR_ORDER">Self-Order</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-gray-500 mb-1">Payment</label>
                          <select
                            value={checkoutPaymentMethod}
                            onChange={e => setCheckoutPaymentMethod(e.target.value)}
                            className="w-full px-2 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-white text-[11px]"
                          >
                            <option value="UPI">UPI</option>
                            <option value="CARD">Card</option>
                            <option value="CASH">Cash</option>
                            <option value="WALLET">Wallet</option>
                            <option value="SPLIT">Split (60/40)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Subtotal, tax, checkout button */}
                <div className="border-t border-gray-800/80 pt-4 space-y-4">
                  <div className="space-y-1.5 text-xs text-gray-400">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="text-white">₹{cart.reduce((a, c) => a + c.price * c.quantity, 0)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Loyalty Tier Discount</span>
                        <span>-₹{discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Tax (5% GST)</span>
                      <span className="text-white">₹{Math.max(0, Math.round((cart.reduce((a, c) => a + c.price * c.quantity, 0) - discount) * 0.05))}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-white pt-1">
                      <span>Grand Total</span>
                      <span className="text-violet-400 text-lg">₹{Math.max(0, cart.reduce((a, c) => a + c.price * c.quantity, 0) - discount + Math.round((cart.reduce((a, c) => a + c.price * c.quantity, 0) - discount) * 0.05))}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={cart.length === 0}
                    className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-gray-800 disabled:text-gray-500 font-bold text-sm rounded-xl transition cursor-pointer uppercase tracking-wider shadow-md"
                  >
                    Place & Complete Order
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --- PANEL C: KITCHEN DISPLAY SYSTEM (KDS) --- */}
          {activeTab === 'kds' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center">
                <div className="flex bg-gray-900/60 p-1 rounded-xl border border-gray-800">
                  {['ALL', 'PENDING', 'PREPARING', 'READY'].map(status => (
                    <button
                      key={status}
                      onClick={() => setSelectedKdsStatus(status)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${selectedKdsStatus === status
                          ? 'bg-violet-600/30 border border-violet-500/30 text-white'
                          : 'text-gray-400 hover:text-white'
                        }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* KDS Card Columns */}
              <div className="grid grid-cols-4 gap-4">
                {orders
                  .filter(o => selectedKdsStatus === 'ALL' ? o.status !== 'COMPLETED' && o.status !== 'CANCELLED' : o.status === selectedKdsStatus)
                  .map(order => {
                    const elapsedMins = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);
                    const isOverdue = elapsedMins > 10;

                    return (
                      <div key={order.id} className={`p-5 rounded-2xl glass-panel flex flex-col justify-between shadow-sm relative ${isOverdue && order.status !== 'READY' ? 'border-rose-900/50 shadow-glow-emerald bg-rose-950/5' : ''
                        }`}>
                        <div>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-[10px] font-bold text-gray-500 font-outfit">{order.orderNumber.substring(12, 22)}</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${order.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                order.status === 'PREPARING' ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' :
                                  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}>
                              {order.status}
                            </span>
                          </div>

                          <div className="text-[10px] text-gray-400 flex justify-between mb-4 border-b border-gray-800/80 pb-2">
                            <span>Type: <strong>{order.type}</strong></span>
                            <span className={isOverdue && order.status !== 'READY' ? 'text-rose-400 font-bold' : ''}>
                              Timer: {elapsedMins} mins
                            </span>
                          </div>

                          {/* Ordered items list */}
                          <div className="space-y-2 mb-6">
                            {order.items.map((it: any) => (
                              <div key={it.id} className="flex justify-between items-center text-xs">
                                <span className="font-bold text-gray-200">{it.menuItem.name} <span className="text-[10px] text-gray-500">x{it.quantity}</span></span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Status updates buttons */}
                        <div className="pt-4 border-t border-gray-800/80">
                          {order.status === 'PENDING' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'PREPARING')}
                              className="w-full py-2 bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/30 text-white text-xs font-bold rounded-lg cursor-pointer transition flex justify-center items-center gap-1.5"
                            >
                              <Hourglass className="w-3.5 h-3.5" /> Start Preparing
                            </button>
                          )}
                          {order.status === 'PREPARING' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'READY')}
                              className="w-full py-2 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/30 text-white text-xs font-bold rounded-lg cursor-pointer transition flex justify-center items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Mark Ready
                            </button>
                          )}
                          {order.status === 'READY' && (
                            <button
                              onClick={() => handleUpdateOrderStatus(order.id, 'COMPLETED')}
                              className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold rounded-lg cursor-pointer transition flex justify-center items-center gap-1.5"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Complete Order
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* --- PANEL D: TABLES LAYOUT --- */}
          {activeTab === 'tables' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm text-gray-400">Manage cafe occupancy and reservations. Select a table to reserve.</span>
                {selectedTableId && (
                  <button
                    onClick={() => setShowReservationModal(true)}
                    className="py-2.5 px-4 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl cursor-pointer transition shadow-md flex items-center gap-1.5"
                  >
                    <Calendar className="w-4 h-4" /> Book Reservation for {selectedTableName}
                  </button>
                )}
              </div>

              {/* Grid map layout */}
              <div className="grid grid-cols-5 gap-4">
                {tables.map(t => {
                  const isSelected = selectedTableId === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTable(t.id, t.name)}
                      className={`p-6 rounded-2xl glass-panel text-left flex flex-col justify-between h-40 transition cursor-pointer relative ${isSelected ? 'border-violet-500 shadow-glow-purple bg-violet-950/10' : ''
                        } ${t.status === 'OCCUPIED' ? 'border-amber-900/30 bg-amber-950/5' :
                          t.status === 'CLEANING' ? 'border-rose-900/30 bg-rose-950/5 animate-pulse' :
                            t.status === 'RESERVED' ? 'border-emerald-900/30 bg-emerald-950/5' : 'hover:border-gray-800'
                        }`}
                    >
                      <div>
                        <span className="block text-sm font-extrabold text-white leading-tight font-outfit mb-1">{t.name}</span>
                        <span className="block text-[10px] text-gray-500 font-semibold">{t.capacity} Pax Capacity</span>
                      </div>

                      <div className="flex justify-between items-end w-full">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${t.status === 'AVAILABLE' ? 'bg-gray-800 text-gray-400 border border-gray-700/50' :
                            t.status === 'RESERVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              t.status === 'OCCUPIED' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                          {t.status}
                        </span>

                        {/* Table actions */}
                        {isSelected && (
                          <div className="flex gap-1 text-[9px] font-bold">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateTableStatus(t.id, 'AVAILABLE');
                              }}
                              className="px-1.5 py-0.5 bg-gray-950 hover:bg-gray-800 border border-gray-800 text-gray-300 rounded"
                            >
                              Free
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateTableStatus(t.id, 'CLEANING');
                              }}
                              className="px-1.5 py-0.5 bg-gray-950 hover:bg-rose-950/30 border border-gray-800 text-rose-400 rounded"
                            >
                              Clean
                            </button>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Reservation list */}
              <div className="mt-8">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Upcoming Reservations</h3>
                <div className="glass-panel rounded-2xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-950/60 text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                      <tr>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Phone</th>
                        <th className="px-6 py-4">Date & Time</th>
                        <th className="px-6 py-4">Party Size</th>
                        <th className="px-6 py-4">Table</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/40">
                      {tables.flatMap(t => t.reservations || []).map((res: any) => (
                        <tr key={res.id} className="hover:bg-gray-900/30">
                          <td className="px-6 py-4 font-bold text-white">{res.customerName}</td>
                          <td className="px-6 py-4 text-gray-400">{res.customerPhone}</td>
                          <td className="px-6 py-4 text-gray-300">{new Date(res.dateTime).toLocaleString()}</td>
                          <td className="px-6 py-4 text-gray-300">{res.partySize} Pax</td>
                          <td className="px-6 py-4 text-violet-400 font-semibold">{tables.find(t => t.id === res.tableId)?.name || 'Reserved'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* --- PANEL E: INVENTORY & RECIPES --- */}
          {activeTab === 'inventory' && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-3 gap-6 items-start">

                {/* Ingredients table list */}
                <div className="col-span-2 space-y-4">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Live stock quantities</h3>
                  <div className="glass-panel rounded-2xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-gray-950/60 text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                        <tr>
                          <th className="px-6 py-4">Ingredient</th>
                          <th className="px-6 py-4">Remaining quantity</th>
                          <th className="px-6 py-4">Alert Threshold</th>
                          <th className="px-6 py-4">Cost per unit</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Supplier</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/40">
                        {ingredients.map(ing => {
                          const isLow = ing.quantity <= ing.minStockAlert;
                          return (
                            <tr key={ing.id} className={`hover:bg-gray-900/30 ${isLow ? 'bg-rose-950/5' : ''}`}>
                              <td className="px-6 py-4 font-bold text-white">{ing.name}</td>
                              <td className="px-6 py-4 text-gray-300">{(ing.quantity).toLocaleString()} {ing.unit}</td>
                              <td className="px-6 py-4 text-gray-500">{ing.minStockAlert} {ing.unit}</td>
                              <td className="px-6 py-4 text-gray-300">₹{ing.costPerUnit}</td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${isLow ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  }`}>
                                  {isLow ? 'Low Stock' : 'Good'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-violet-400 font-semibold">{ing.supplier?.name || 'Local Vendor'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recipe Costing engine calculator */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Recipe Costing & Margins</h3>
                  <div className="space-y-4">
                    {costings.map(item => (
                      <div key={item.id} className="p-5 rounded-2xl glass-panel relative overflow-hidden shadow-sm">
                        <div className="absolute top-0 right-0 px-2 py-0.5 bg-violet-600/10 text-violet-400 border-l border-b border-violet-500/15 text-[9px] font-bold uppercase rounded-bl-lg">
                          {item.category}
                        </div>
                        <span className="block text-sm font-bold text-white mb-3 font-outfit">{item.name}</span>
                        <div className="grid grid-cols-3 gap-2 text-[10px] uppercase text-gray-500 font-semibold mb-4 border-b border-gray-800/80 pb-3">
                          <div>
                            <span>Sell Price</span>
                            <span className="block text-sm font-extrabold text-white pt-1">₹{item.price}</span>
                          </div>
                          <div>
                            <span>Production cost</span>
                            <span className="block text-sm font-extrabold text-rose-400 pt-1">₹{Math.round(item.totalCost)}</span>
                          </div>
                          <div>
                            <span>Margin</span>
                            <span className="block text-sm font-extrabold text-emerald-400 pt-1">{item.margin}%</span>
                          </div>
                        </div>

                        {/* Ingredient costs nested list */}
                        <div className="space-y-1.5 pl-1">
                          {item.ingredients.map((ing: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center text-[10px] text-gray-400">
                              <span>• {ing.name} ({ing.qty}{ing.unit})</span>
                              <span>₹{Math.round(ing.cost * 100) / 100}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- PANEL F: CRM & CAMPAIGNS --- */}
          {activeTab === 'crm' && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Automatically segments VIP, Inactive, and At Risk customers. Customize campaigns below.</span>
                <button
                  onClick={() => setShowNewCampaignModal(true)}
                  className="py-2.5 px-4 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl cursor-pointer transition shadow-md flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Create Automated Marketing Campaign
                </button>
              </div>

              <div className="grid grid-cols-3 gap-6 items-start">

                {/* Customers CRM List */}
                <div className="col-span-2 space-y-4">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Customer Loyalty Registry</h3>
                  <div className="glass-panel rounded-2xl overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-gray-950/60 text-gray-500 uppercase tracking-wider text-[10px] font-bold">
                        <tr>
                          <th className="px-6 py-4">Customer</th>
                          <th className="px-6 py-4">Phone</th>
                          <th className="px-6 py-4">Segment</th>
                          <th className="px-6 py-4">Visits</th>
                          <th className="px-6 py-4">Total Spend</th>
                          <th className="px-6 py-4">Point Bal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/40">
                        {customers.map(cust => (
                          <tr key={cust.id} className="hover:bg-gray-900/30">
                            <td className="px-6 py-4 font-bold text-white">{cust.name}</td>
                            <td className="px-6 py-4 text-gray-400">{cust.phone}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${cust.segment === 'VIP' ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20 shadow-glow-purple' :
                                  cust.segment === 'At Risk' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                    cust.segment === 'Inactive' ? 'bg-gray-800 text-gray-400 border border-gray-700/50' :
                                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                }`}>
                                {cust.segment}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-300">{cust.visitCount} visits</td>
                            <td className="px-6 py-4 font-bold text-white">₹{Math.round(cust.totalSpend).toLocaleString()}</td>
                            <td className="px-6 py-4 text-violet-400 font-semibold">{cust.points} pts</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Campaign metrics / list */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Active Marketing automation triggers</h3>
                  <div className="space-y-4">
                    {campaigns.map(camp => (
                      <div key={camp.id} className="p-5 rounded-2xl glass-panel relative overflow-hidden shadow-sm">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">{camp.channel}</span>
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[8px] font-bold uppercase tracking-wider rounded border border-emerald-500/15">
                            {camp.status}
                          </span>
                        </div>
                        <span className="block text-sm font-bold text-white mb-2 font-outfit leading-snug">{camp.name}</span>
                        <p className="text-xs text-gray-400 leading-relaxed italic">"{camp.content}"</p>
                        <div className="mt-4 pt-3 border-t border-gray-800/80 text-[10px] text-gray-500 font-semibold">
                          Trigger: <span className="text-gray-300 font-bold uppercase tracking-wider">{camp.triggerEvent}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- PANEL G: AI BUSINESS COPILOT & GROWTH ADVISOR --- */}
          {activeTab === 'ai' && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-3 gap-6 items-start">

                {/* Copilot Chat pane */}
                <div className="col-span-2 glass-panel rounded-2xl flex flex-col justify-between h-[550px] shadow-glow-purple border-violet-500/20">

                  {/* Message displays */}
                  <div className="flex-1 p-6 overflow-y-auto space-y-4">
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <div className={`p-4 rounded-2xl text-xs max-w-[85%] leading-relaxed ${msg.sender === 'user'
                            ? 'bg-violet-600 text-white rounded-br-none shadow-md'
                            : 'bg-gray-950/60 border border-gray-800 text-gray-100 rounded-bl-none'
                          }`}>
                          {/* Render simple custom markdown bullets for aesthetics */}
                          {msg.text.split('\n').map((line: string, lIdx: number) => {
                            if (line.startsWith('### ')) {
                              return <h4 key={lIdx} className="text-sm font-extrabold text-violet-400 font-outfit mb-3">{line.replace('### ', '')}</h4>;
                            }
                            if (line.startsWith('#### ')) {
                              return <h5 key={lIdx} className="text-xs font-bold text-white uppercase tracking-wider mt-4 mb-2">{line.replace('#### ', '')}</h5>;
                            }
                            if (line.startsWith('* **') || line.startsWith('- **')) {
                              return <div key={lIdx} className="my-1.5 text-gray-300">• {line.replace(/^[*\-]\s+\*\*/, '').replace(/\*\*/, '')}</div>;
                            }
                            if (line.startsWith('|')) {
                              return <pre key={lIdx} className="text-[10px] text-gray-400 font-mono overflow-x-auto my-1 leading-snug">{line}</pre>;
                            }
                            return <p key={lIdx} className="mb-2 last:mb-0">{line}</p>;
                          })}
                        </div>

                        {/* Suggested Query Buttons */}
                        {msg.queries && msg.queries.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {msg.queries.map((q: string) => (
                              <button
                                key={q}
                                onClick={() => handleSendChatMessage(q)}
                                className="px-2.5 py-1.5 bg-gray-950/40 hover:bg-violet-950/20 border border-gray-800 hover:border-violet-500/30 text-gray-400 hover:text-violet-400 text-[10px] font-semibold rounded-lg transition cursor-pointer"
                              >
                                {q}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {isAiLoading && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-950/30 border border-gray-800 p-3 rounded-xl">
                        <Bot className="w-4 h-4 text-violet-400 animate-spin" />
                        <span>AI Analyst is computing database factors...</span>
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Input form */}
                  <div className="p-4 border-t border-gray-800/80 bg-gray-950/20 flex gap-2">
                    <input
                      type="text"
                      value={aiInput}
                      onChange={e => setAiInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendChatMessage()}
                      placeholder="Ask the AI business brain (e.g. Why did waste increase?)"
                      className="flex-1 px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-white text-xs placeholder-gray-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                    />
                    <button
                      onClick={() => handleSendChatMessage()}
                      className="p-3 bg-violet-600 hover:bg-violet-500 rounded-xl text-white cursor-pointer transition shadow-md"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Growth Advisor Card suggestions */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-violet-400" /> AI Growth Recommendations
                  </h3>

                  {aiRecommendations.map(rec => (
                    <div key={rec.id} className="p-5 rounded-2xl glass-panel relative overflow-hidden shadow-sm hover:border-violet-500/20 transition">
                      <div className="absolute top-0 right-0 px-2 py-0.5 bg-violet-600/10 text-violet-400 border-l border-b border-violet-500/15 text-[9px] font-bold uppercase tracking-wider rounded-bl-lg">
                        {rec.type}
                      </div>

                      <span className="block text-sm font-bold text-white mb-2 font-outfit pr-10">{rec.title}</span>
                      <p className="text-xs text-gray-400 leading-relaxed mb-4">{rec.description}</p>

                      <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-gray-500 mb-4 bg-gray-950/30 p-2.5 rounded-xl border border-gray-800/20">
                        <div>
                          <span>Projection</span>
                          <span className="block text-xs font-bold text-emerald-400 mt-0.5">+{rec.impactType} ₹{rec.impactAmount.toLocaleString()}/mo</span>
                        </div>
                        <div>
                          <span>Trigger Event</span>
                          <span className="block text-[10px] font-bold text-violet-400 truncate mt-0.5">{rec.actionCode}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeployRecommendation(rec)}
                        className="w-full py-2 bg-violet-600/20 hover:bg-violet-600 border border-violet-500/20 hover:border-violet-500 text-white text-xs font-bold rounded-xl cursor-pointer transition flex justify-center items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5" /> Deploy Growth Action
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* --- MODAL 1: RESERVATION POPUP --- */}
      {showReservationModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl glass-panel shadow-glow-purple">
            <h3 className="text-base font-extrabold text-white mb-4 font-outfit uppercase">Book Table Reservation</h3>
            <form onSubmit={handleCreateReservation} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  value={reservationName}
                  onChange={e => setReservationName(e.target.value)}
                  placeholder="Kunal Shah"
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-700 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Contact Phone</label>
                <input
                  type="text"
                  required
                  value={reservationPhone}
                  onChange={e => setReservationPhone(e.target.value)}
                  placeholder="+919900000001"
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-700 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={reservationTime}
                    onChange={e => setReservationTime(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-violet-500 text-[10px]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Party Size</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={reservationParty}
                    onChange={e => setReservationParty(parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowReservationModal(false)}
                  className="w-1/2 py-2.5 bg-gray-950 hover:bg-gray-900 border border-gray-800 text-gray-400 font-bold rounded-xl cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl cursor-pointer transition glow-btn"
                >
                  Confirm Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: NEW CAMPAIGN POPUP --- */}
      {showNewCampaignModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-2xl glass-panel shadow-glow-purple">
            <h3 className="text-base font-extrabold text-white mb-4 font-outfit uppercase">Launch Automated Campaign</h3>
            <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Campaign Name</label>
                <input
                  type="text"
                  required
                  value={newCampaignName}
                  onChange={e => setNewCampaignName(e.target.value)}
                  placeholder="Inactive customers 15% discount coupon"
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-700 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Channel</label>
                <select
                  value={newCampaignChannel}
                  onChange={e => setNewCampaignChannel(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white focus:outline-none"
                >
                  <option value="WHATSAPP">WhatsApp Message</option>
                  <option value="SMS">SMS Message</option>
                  <option value="EMAIL">Email Newsletters</option>
                  <option value="SOCIAL">Instagram/Social Media</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Message Content</label>
                <textarea
                  required
                  rows={4}
                  value={newCampaignContent}
                  onChange={e => setNewCampaignContent(e.target.value)}
                  placeholder="Hi [Name]! We miss you. Use code MISSYOU15 to get 15% off your next purchase at CafeOS!"
                  className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white placeholder-gray-700 focus:outline-none focus:border-violet-500 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewCampaignModal(false)}
                  className="w-1/2 py-2.5 bg-gray-950 hover:bg-gray-900 border border-gray-800 text-gray-400 font-bold rounded-xl cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl cursor-pointer transition glow-btn"
                >
                  Launch Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
