import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  bulkPricingEnabled?: boolean;
  bulkMinQuantity?: number;
  bulkPricingMode?: string;
  bulkDiscountPercent?: number;
  bulkUnitPrice?: number;
  slug: string;
  image?: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getTotal: () => number;
}

export function getEffectiveCartUnitPrice(item: Pick<CartItem, "price" | "quantity" | "bulkPricingEnabled" | "bulkMinQuantity" | "bulkPricingMode" | "bulkDiscountPercent" | "bulkUnitPrice">) {
  if (!item.bulkPricingEnabled || !item.bulkMinQuantity || item.quantity < item.bulkMinQuantity) {
    return item.price;
  }
  if (item.bulkPricingMode === "fixed" && item.bulkUnitPrice && item.bulkUnitPrice > 0) {
    return item.bulkUnitPrice;
  }
  if (item.bulkDiscountPercent && item.bulkDiscountPercent > 0) {
    return Math.round(item.price * (1 - item.bulkDiscountPercent / 100));
  }
  return item.price;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 1) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getItemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      getTotal: () =>
        get().items.reduce(
          (sum, item) => sum + getEffectiveCartUnitPrice(item) * item.quantity,
          0
        ),
    }),
    {
      name: "faesfiligree-cart",
    }
  )
);
