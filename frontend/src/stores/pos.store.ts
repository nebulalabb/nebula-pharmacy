import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  unit: string;
  salePrice: number;
  quantity: number;
  total: number;
  stockRemaining: number;
}

interface CartStore {
  items: CartItem[];
  discount: number;
  subtotal: number;
  total: number;
  
  addItem: (product: any) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  setDiscount: (amount: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  discount: 0,
  subtotal: 0,
  total: 0,

  addItem: (product) => {
    const { items } = get();
    const existingItem = items.find((item) => item.id === product.id);

    if (existingItem) {
      // If quantity + 1 exists in stock
      if (existingItem.quantity < product.totalStock) {
        get().updateQuantity(product.id, existingItem.quantity + 1);
      }
    } else {
      if (product.totalStock <= 0) return; // Cannot add out of stock

      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        unit: product.unit,
        salePrice: Number(product.salePrice),
        quantity: 1,
        total: Number(product.salePrice),
        stockRemaining: product.totalStock,
      };

      const newItems = [...items, newItem];
      const newSubtotal = newItems.reduce((acc, item) => acc + item.total, 0);
      
      set({ 
        items: newItems,
        subtotal: newSubtotal,
        total: Math.max(0, newSubtotal - get().discount)
      });
    }
  },

  removeItem: (productId) => {
    const newItems = get().items.filter((item) => item.id !== productId);
    const newSubtotal = newItems.reduce((acc, item) => acc + item.total, 0);
    
    set({ 
      items: newItems, 
      subtotal: newSubtotal,
      total: Math.max(0, newSubtotal - get().discount)
    });
  },

  updateQuantity: (productId, qty) => {
    const newItems = get().items.map((item) => {
      if (item.id === productId) {
        // Clamp qty between 1 and stockRemaining
        const validatedQty = Math.max(1, Math.min(qty, item.stockRemaining));
        return {
          ...item,
          quantity: validatedQty,
          total: validatedQty * item.salePrice,
        };
      }
      return item;
    });

    const newSubtotal = newItems.reduce((acc, item) => acc + item.total, 0);
    set({ 
      items: newItems, 
      subtotal: newSubtotal,
      total: Math.max(0, newSubtotal - get().discount)
    });
  },

  setDiscount: (amount) => {
    const discountValue = Math.max(0, amount);
    set({ 
      discount: discountValue,
      total: Math.max(0, get().subtotal - discountValue)
    });
  },

  clearCart: () => {
    set({ items: [], discount: 0, subtotal: 0, total: 0 });
  },
}));
