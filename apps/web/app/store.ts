"use client";
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  branchId: string | null;
  branchName: string | null;
}

interface CafeStore {
  token: string | null;
  user: User | null;
  selectedBranchId: string | null;
  selectedBranchName: string | null;
  activeTab: string;
  cart: CartItem[];
  selectedTableId: string | null;
  selectedTableName: string | null;
  selectedCustomerId: string | null;
  selectedCustomerName: string | null;
  discount: number;
  sidebarCollapsed: boolean;

  setAuth: (token: string, user: User) => void;
  logout: () => void;
  setSelectedBranch: (id: string, name: string) => void;
  setActiveTab: (tab: string) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (menuItemId: string) => void;
  updateCartQty: (menuItemId: string, qty: number) => void;
  clearCart: () => void;
  setSelectedTable: (id: string | null, name: string | null) => void;
  setSelectedCustomer: (id: string | null, name: string | null) => void;
  setDiscount: (d: number) => void;
  toggleSidebar: () => void;
}

export const useCafeStore = create<CafeStore>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      selectedBranchId: null,
      selectedBranchName: null,
      activeTab: 'dashboard',
      cart: [],
      selectedTableId: null,
      selectedTableName: null,
      selectedCustomerId: null,
      selectedCustomerName: null,
      discount: 0,
      sidebarCollapsed: false,

      setAuth: (token, user) => set({ token, user }),
      logout: () => set({
        token: null, user: null, cart: [], selectedBranchId: null,
        selectedBranchName: null, activeTab: 'dashboard',
        selectedTableId: null, selectedCustomerId: null
      }),
      setSelectedBranch: (id, name) => set({ selectedBranchId: id, selectedBranchName: name }),
      setActiveTab: (tab) => set({ activeTab: tab }),
      addToCart: (item) => {
        const cart = get().cart;
        const existing = cart.find(c => c.menuItemId === item.menuItemId);
        if (existing) {
          set({ cart: cart.map(c => c.menuItemId === item.menuItemId ? { ...c, quantity: c.quantity + 1 } : c) });
        } else {
          set({ cart: [...cart, { ...item, quantity: 1 }] });
        }
      },
      removeFromCart: (menuItemId) => set({ cart: get().cart.filter(c => c.menuItemId !== menuItemId) }),
      updateCartQty: (menuItemId, qty) => {
        if (qty <= 0) {
          set({ cart: get().cart.filter(c => c.menuItemId !== menuItemId) });
        } else {
          set({ cart: get().cart.map(c => c.menuItemId === menuItemId ? { ...c, quantity: qty } : c) });
        }
      },
      clearCart: () => set({ cart: [], selectedTableId: null, selectedCustomerId: null, discount: 0 }),
      setSelectedTable: (id, name) => set({ selectedTableId: id, selectedTableName: name }),
      setSelectedCustomer: (id, name) => set({ selectedCustomerId: id, selectedCustomerName: name }),
      setDiscount: (d) => set({ discount: d }),
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
    }),
    { name: 'cafeos-store', partialize: (s) => ({ token: s.token, user: s.user, selectedBranchId: s.selectedBranchId, selectedBranchName: s.selectedBranchName, sidebarCollapsed: s.sidebarCollapsed }) }
  )
);

export const API_URL = 'http://localhost:5001/api';
