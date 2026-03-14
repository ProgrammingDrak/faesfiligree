"use client";

import { useCartStore, type CartItem as CartItemType } from "@/stores/cart";
import { formatPrice } from "@/lib/utils";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const hue = item.name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 40 + 15;

  return (
    <div className="flex gap-4 py-4 border-b border-charcoal/10">
      {/* Image placeholder */}
      <div
        className="w-20 h-20 rounded-lg flex-shrink-0 flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, hsl(${hue}, 30%, 15%) 0%, hsl(${hue}, 40%, 25%) 100%)`,
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="opacity-30">
          <path
            d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
            fill="#B76E79"
          />
        </svg>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-heading text-base text-charcoal truncate">
          {item.name}
        </h4>
        <p className="text-copper text-sm font-medium mt-0.5">
          {formatPrice(item.price)}
        </p>

        {/* Quantity controls */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            className="w-7 h-7 rounded-full border border-charcoal/20 flex items-center justify-center text-charcoal/60 hover:border-copper hover:text-copper transition-colors text-sm"
            aria-label="Decrease quantity"
          >
            &minus;
          </button>
          <span className="text-sm text-charcoal min-w-[1.5rem] text-center">
            {item.quantity}
          </span>
          <button
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className="w-7 h-7 rounded-full border border-charcoal/20 flex items-center justify-center text-charcoal/60 hover:border-copper hover:text-copper transition-colors text-sm"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      {/* Remove + Line total */}
      <div className="flex flex-col items-end justify-between">
        <button
          onClick={() => removeItem(item.id)}
          className="text-charcoal/40 hover:text-red-500 transition-colors text-sm"
          aria-label={`Remove ${item.name} from cart`}
        >
          &times;
        </button>
        <p className="text-sm font-medium text-charcoal">
          {formatPrice(item.price * item.quantity)}
        </p>
      </div>
    </div>
  );
}
