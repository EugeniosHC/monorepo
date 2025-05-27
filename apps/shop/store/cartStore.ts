// store/cartStore.ts
import { Product } from "@eugenios/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartProduct extends Product {
  quantity: number;
}

type CartState = {
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  items: CartProduct[];
  addToCart: (product: CartProduct) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  updateQuantity: (id: string, quantity: number) => void;
  total: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      isCartOpen: false,
      setIsCartOpen: (isOpen) => set({ isCartOpen: isOpen }),

      items: [],

      addToCart: (product) =>
        set((state) => {
          const existing = state.items.find((item) => item.id === product.id);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.id === product.id ? { ...item, quantity: item.quantity + product.quantity } : item
              ),
            };
          } else {
            return { items: [...state.items, product] };
          }
        }),

      removeFromCart: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items
            .map((item) => (item.id === id ? { ...item, quantity } : item))
            .filter((item) => item.quantity > 0), // se a quantidade for 0, remove
        })),

      clearCart: () => set({ items: [] }),

      total: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
    }),
    {
      name: "cart-storage", // nome da key no localStorage
    }
  )
);
