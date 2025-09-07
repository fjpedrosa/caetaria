/**
 * Shopping Cart Component
 * Simulates WhatsApp Shopping Cart with order summary
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart as CartIcon, Plus, Minus, Trash2, CreditCard } from 'lucide-react';

import type { ShoppingCart, CartItem } from '@/modules/marketing/domain/types/whatsapp-features.types';

interface ShoppingCartProps {
  cart: ShoppingCart;
  onUpdateQuantity?: (productId: string, quantity: number) => void;
  onRemoveItem?: (productId: string) => void;
  onCheckout?: () => void;
  isVisible?: boolean;
}

export function ShoppingCartComponent({ 
  cart, 
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  isVisible = true 
}: ShoppingCartProps) {
  if (!isVisible || cart.items.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className="bg-green-500 text-white p-3">
        <div className="flex items-center gap-2">
          <CartIcon className="w-5 h-5" />
          <h3 className="font-semibold">Tu Carrito</h3>
          <span className="ml-auto bg-white text-green-500 px-2 py-0.5 rounded-full text-sm font-bold">
            {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'}
          </span>
        </div>
      </div>

      {/* Cart Items */}
      <div className="max-h-80 overflow-y-auto">
        <AnimatePresence>
          {cart.items.map((item, index) => (
            <motion.div
              key={item.product.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
              className="p-3 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex gap-3">
                {/* Product Image */}
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-gray-900 line-clamp-1">
                    {item.product.name}
                  </h4>
                  <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                    {item.product.description}
                  </p>
                  
                  {/* Price and Quantity */}
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-green-600">
                      {(item.product.price * item.quantity).toFixed(2)}{cart.currency}
                    </span>
                    
                    {/* Quantity Controls */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onUpdateQuantity?.(item.product.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-3 h-3 text-gray-600" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity?.(item.product.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-3 h-3 text-gray-600" />
                      </button>
                      <button
                        onClick={() => onRemoveItem?.(item.product.id)}
                        className="w-6 h-6 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors ml-2"
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Order Summary */}
      <div className="border-t border-gray-200 bg-gray-50 p-3">
        <div className="space-y-2">
          {/* Subtotal */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium text-gray-900">
              {cart.total.toFixed(2)}{cart.currency}
            </span>
          </div>
          
          {/* Delivery */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Envío</span>
            <span className="font-medium text-green-600">GRATIS</span>
          </div>
          
          {/* Total */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="font-bold text-lg text-green-600">
              {cart.total.toFixed(2)}{cart.currency}
            </span>
          </div>
        </div>

        {/* Checkout Button */}
        <motion.button
          onClick={onCheckout}
          className="w-full mt-3 px-4 py-2.5 bg-green-500 text-white rounded-lg font-semibold text-sm hover:bg-green-600 active:bg-green-700 transition-colors flex items-center justify-center gap-2"
          whileTap={{ scale: 0.98 }}
        >
          <CreditCard className="w-4 h-4" />
          Proceder al Pago
        </motion.button>

        {/* Estimated Time */}
        <div className="mt-2 text-center">
          <span className="text-xs text-gray-500">
            Tiempo estimado: 25-35 minutos
          </span>
        </div>
      </div>

      {/* WhatsApp Indicator */}
      <div className="px-3 py-2 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">WhatsApp Shopping</span>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            <span className="text-xs text-gray-400">Secure Checkout</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}