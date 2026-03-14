"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/stores/cart";
import { CartItem } from "./CartItem";
import { CartSummary } from "./CartSummary";

const PANEL_WIDTH = 384;

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function EmptyCart() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-12">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="text-charcoal/20 mb-4">
        <path
          d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
          fill="currentColor"
        />
      </svg>
      <p className="text-charcoal/50 font-heading text-lg">
        Your cart is empty
      </p>
      <p className="text-charcoal/40 text-sm mt-1">
        Browse the shop to find something enchanting
      </p>
    </div>
  );
}

function CartItems({ items }: { items: ReturnType<typeof useCartStore.getState>["items"] }) {
  return items.length === 0 ? <EmptyCart /> : (
    <>
      {items.map((item) => <CartItem key={item.id} item={item} />)}
    </>
  );
}

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const items = useCartStore((s) => s.items);
  const getItemCount = useCartStore((s) => s.getItemCount);
  const itemCount = getItemCount();

  return (
    <>
      {/* ─── Mobile: Floating button + Bottom sheet ─── */}

      {/* Floating cart button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed bottom-5 right-5 z-[60] bg-copper hover:bg-copper-dark text-white rounded-full w-14 h-14 shadow-lg flex items-center justify-center transition-colors active:scale-95"
        aria-label="Open cart"
      >
        <CartIcon />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-white text-copper text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
            {itemCount}
          </span>
        )}
      </button>

      {/* Bottom sheet */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="md:hidden fixed inset-0 bg-black/40 z-[61]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="md:hidden fixed bottom-0 left-0 right-0 z-[62] bg-parchment rounded-t-2xl shadow-2xl flex flex-col"
              style={{ maxHeight: "85vh" }}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 rounded-full bg-charcoal/20" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-charcoal/10 shrink-0">
                <h2 className="font-heading text-xl text-charcoal">Your Cart</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-charcoal/60 hover:text-charcoal transition-colors"
                  aria-label="Close cart"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto px-5">
                <CartItems items={items} />
              </div>

              {/* Summary */}
              {items.length > 0 && (
                <div className="px-5 pb-6 shrink-0">
                  <CartSummary />
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── Desktop/Tablet: Side panel with tab ─── */}

      {/* Tab */}
      <motion.button
        initial={false}
        animate={{ x: isOpen ? -(PANEL_WIDTH) : 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-1/2 -translate-y-1/2 right-0 z-[61] hidden md:flex items-center"
        aria-label={isOpen ? "Minimize cart" : "Open cart"}
      >
        <div className="bg-copper hover:bg-copper-dark text-white rounded-l-lg shadow-lg transition-colors py-4 px-2.5 flex flex-col items-center gap-2">
          <CartIcon />

          {itemCount > 0 && (
            <span className="bg-white text-copper text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {itemCount}
            </span>
          )}

          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform duration-200"
            style={{ transform: isOpen ? "rotate(0deg)" : "rotate(180deg)" }}
          >
            <polyline points="8 2 4 6 8 10" />
          </svg>
        </div>
      </motion.button>

      {/* Side panel */}
      <motion.div
        initial={false}
        animate={{ x: isOpen ? 0 : PANEL_WIDTH }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed top-0 right-0 bottom-0 z-[60] hidden md:flex flex-col bg-parchment shadow-2xl border-l border-charcoal/10"
        style={{ width: PANEL_WIDTH }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-charcoal/10 shrink-0">
          <h2 className="font-heading text-2xl text-charcoal">Your Cart</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-charcoal/60 hover:text-charcoal transition-colors"
            aria-label="Minimize cart"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6">
          <CartItems items={items} />
        </div>

        {/* Summary */}
        {items.length > 0 && (
          <div className="px-6 pb-6 shrink-0">
            <CartSummary />
          </div>
        )}
      </motion.div>
    </>
  );
}
