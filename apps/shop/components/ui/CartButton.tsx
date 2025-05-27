"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@eugenios/ui/components/button";
import { Sheet, SheetContent, SheetTrigger } from "@eugenios/ui/components/sheet";
import { ShoppingCart, X, Minus, Plus, ArrowRight, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CartButtonProps {
  hasHeaderBackground: boolean;
}

export function CartButton({ hasHeaderBackground }: CartButtonProps) {
  const isCartOpen = useCartStore((state) => state.isCartOpen);
  const setIsCartOpen = useCartStore((state) => state.setIsCartOpen);
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const [animateCart, setAnimateCart] = useState(false);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = total().toFixed(2).replace(".", ",");

  // Efeito de animação quando um item é adicionado ao carrinho
  useEffect(() => {
    if (totalQuantity > 0 && !isCartOpen) {
      setAnimateCart(true);
      const timer = setTimeout(() => setAnimateCart(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [totalQuantity, isCartOpen]);

  const handleRemoveItem = (id: string) => {
    setRemovingItemId(id);
    // Pequeno atraso para a animação acontecer antes de remover
    setTimeout(() => {
      removeFromCart(id);
      setRemovingItemId(null);
    }, 300);
  };

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      updateQuantity(id, newQuantity);
    } else {
      handleRemoveItem(id);
    }
  };

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      {" "}
      <SheetTrigger asChild>
        <button
          className={`relative p-2 rounded-full aspect-square overflow-visible group focus:outline-none ${
            animateCart ? "animate-pulse" : ""
          }`}
          aria-label="Abrir carrinho"
        >
          <span
            className="absolute inset-0 bg-primary rounded-full scale-0 group-hover:scale-100 transition-transform duration-500 origin-center"
            aria-hidden="true"
          />
          <ShoppingCart
            size={20}
            className={`relative z-10 transition-colors duration-500 group-hover:text-white ${
              hasHeaderBackground ? "text-neutral-700" : "text-white"
            }`}
          />
          {totalQuantity > 0 && (
            <span
              className={`absolute -top-1 -right-2 z-20 text-xs rounded-full h-5 w-5 flex items-center justify-center transition-all duration-500
              group-hover:bg-white group-hover:text-primary bg-primary text-white ${animateCart ? "scale-125" : ""}`}
            >
              {totalQuantity}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[90vw] sm:w-[450px] p-0 border-l border-neutral-200 shadow-2xl">
        <div className="flex flex-col h-full bg-white">
          {/* Header */}
          <div className="flex justify-between items-center p-5 border-b">
            <div className="flex items-center gap-2">
              <ShoppingCart size={20} className="text-primary" />
              <span className="font-medium text-xl ">Carrinho</span>
              {totalQuantity > 0 && (
                <span className="ml-2 text-sm bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
                  {totalQuantity} {totalQuantity === 1 ? "item" : "itens"}
                </span>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCartOpen(false)}
              aria-label="Fechar carrinho"
              className="rounded-full hover:bg-neutral-100"
            >
              <X size={20} />
            </Button>
          </div>

          {/* Body */}
          <div className="flex-grow overflow-auto p-5 custom-scrollbar">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-neutral-500 space-y-4 py-10">
                <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
                  <ShoppingCart size={40} strokeWidth={1.5} className="text-neutral-400" />
                </div>
                <p className="text-lg font-medium">O seu carrinho está vazio</p>
                <p className="text-sm max-w-[250px]">Adicione produtos para continuar com a sua compra</p>
                <Button
                  className="mt-6 bg-primary hover:bg-primary/90 text-white rounded-full px-8 py-6"
                  onClick={() => setIsCartOpen(false)}
                >
                  Ver Produtos
                </Button>
              </div>
            ) : (
              <ul className="space-y-5 py-2">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.li
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{
                        opacity: removingItemId === item.id ? 0 : 1,
                        height: removingItemId === item.id ? 0 : "auto",
                        y: 0,
                      }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex gap-4 pb-5 border-b border-neutral-100 last:border-0"
                    >
                      <div className="w-20 h-20 bg-neutral-100 rounded-md overflow-hidden flex-shrink-0">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl || "/placeholder.svg"}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-neutral-200">
                            <ShoppingCart size={24} className="text-neutral-400" />
                          </div>
                        )}
                      </div>

                      <div className="flex-grow flex flex-col">
                        <div className="flex justify-between">
                          <h4 className="font-medium text-neutral-800 line-clamp-2">{item.name}</h4>
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-neutral-400 hover:text-red-500 transition-colors p-1 -mt-1 -mr-1"
                            aria-label="Remover item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-auto pt-2">
                          <div className="flex items-center border border-neutral-200 rounded-full overflow-hidden">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="px-2 py-1 hover:bg-neutral-100 transition-colors"
                              aria-label="Diminuir quantidade"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-3 font-medium text-sm">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="px-2 py-1 hover:bg-neutral-100 transition-colors"
                              aria-label="Aumentar quantidade"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                          <span className="font-semibold text-neutral-800">
                            {(item.price * item.quantity).toFixed(2).replace(".", ",")}€
                          </span>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="mt-auto border-t border-neutral-200">
              <div className="p-5 space-y-3">
                <div className="flex justify-between font-medium text-lg pt-2">
                  <span>Total</span>
                  <span className="text-primary">{totalPrice}€</span>
                </div>
              </div>

              <div className="p-5 pt-0 space-y-3">
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-white rounded-full py-6 font-semibold"
                  asChild
                >
                  <Link href="/checkout" onClick={() => setIsCartOpen(false)}>
                    FINALIZAR COMPRA
                    <ArrowRight size={16} className="ml-2" />
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-neutral-200 text-neutral-800 hover:bg-neutral-50 rounded-full py-6 font-medium"
                  onClick={() => setIsCartOpen(false)}
                >
                  CONTINUAR COMPRANDO
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
