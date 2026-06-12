import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  branchId: string | null;
  branchName: string | null;
}

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

interface CafeState {
  token: string | null;
  user: User | null;
  selectedBranchId: string | null;
  selectedBranchName: string | null;
  activeTab: string;

  // POS Cart State
  cart: CartItem[];
  selectedTableId: string | null;
  selectedTableName: string | null;
  selectedCustomerId: string | null;
  selectedCustomerName: string | null;
  discount: number;

  // Setters
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  setSelectedBranch: (id: string, name: string) => void;
  setActiveTab: (tab: string) => void;

  // Cart Actions
  addToCart: (item: { menuItemId: string; name: string; price: number }) => void;
  removeFromCart: (menuItemId: string) => void;
  updateCartQty: (menuItemId: string, qty: number) => void;
  clearCart: () => void;
  setSelectedTable: (id: string | null, name: string | null) => void;
  setSelectedCustomer: (id: string | null, name: string | null) => void;
  setDiscount: (discount: number) => void;
}

export const useCafeStore = create<CafeState>((set) => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('CafeOS_token') : null,
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('CafeOS_user') || 'null') : null,
  selectedBranchId: null,
  selectedBranchName: null,
  activeTab: 'dashboard',

  cart: [],
  selectedTableId: null,
  selectedTableName: null,
  selectedCustomerId: null,
  selectedCustomerName: null,
  discount: 0,

  setAuth: (token, user) => {
    localStorage.setItem('CafeOS_token', token);
    localStorage.setItem('CafeOS_user', JSON.stringify(user));
    set({
      token,
      user,
      selectedBranchId: user.branchId,
      selectedBranchName: user.branchName
    });
  },

  logout: () => {
    localStorage.removeItem('CafeOS_token');
    localStorage.removeItem('CafeOS_user');
    set({
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
      discount: 0
    });
  },

  setSelectedBranch: (id, name) => set({ selectedBranchId: id, selectedBranchName: name }),
  setActiveTab: (tab) => set({ activeTab: tab }),

  addToCart: (item) => set((state) => {
    const existingIdx = state.cart.findIndex(i => i.menuItemId === item.menuItemId);
    if (existingIdx > -1) {
      const updated = [...state.cart];
      const cartItem = updated[existingIdx];
      if (cartItem) {
        cartItem.quantity += 1;
      }
      return { cart: updated };
    }
    return {
      cart: [...state.cart, { menuItemId: item.menuItemId, name: item.name, price: item.price, quantity: 1 }]
    };
  }),

  removeFromCart: (menuItemId) => set((state) => ({
    cart: state.cart.filter(i => i.menuItemId !== menuItemId)
  })),

  updateCartQty: (menuItemId, qty) => set((state) => {
    if (qty <= 0) {
      return { cart: state.cart.filter(i => i.menuItemId !== menuItemId) };
    }
    return {
      cart: state.cart.map(i => i.menuItemId === menuItemId ? { ...i, quantity: qty } : i)
    };
  }),

  clearCart: () => set({
    cart: [],
    selectedTableId: null,
    selectedTableName: null,
    selectedCustomerId: null,
    selectedCustomerName: null,
    discount: 0
  }),

  setSelectedTable: (id, name) => set({ selectedTableId: id, selectedTableName: name }),
  setSelectedCustomer: (id, name) => set({ selectedCustomerId: id, selectedCustomerName: name }),
  setDiscount: (discount) => set({ discount })
}));
