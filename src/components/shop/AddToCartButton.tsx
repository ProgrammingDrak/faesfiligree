"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui";
import { useCartStore } from "@/stores/cart";
import type { Product } from "@/lib/data/types";

interface AddToCartButtonProps {
  product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const handleAdd = () => {
    if (!product.inStock) return;

    addItem({
      id: product._id,
      name: product.name,
      price: product.price,
      slug: product.slug.current,
      image: product.images[0],
    });

    setShowConfirm(true);
    setTimeout(() => setShowConfirm(false), 2000);
  };

  return (
    <div className="relative">
      <Button
        onClick={handleAdd}
        disabled={!product.inStock}
        size="lg"
        className="w-full"
      >
        {product.inStock ? "Add to Cart" : "Sold Out"}
      </Button>

      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 bg-copper text-white text-sm px-3 py-1 rounded-full whitespace-nowrap"
          >
            Added to cart!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
