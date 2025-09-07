/**
 * Product Catalog Component
 * Simulates WhatsApp Product Catalog with shopping cart functionality
 */

'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, ShoppingCart, X, Check } from 'lucide-react';

import type { 
  CatalogProduct, 
  CartItem, 
  ShoppingCart as ShoppingCartType 
} from '@/modules/marketing/domain/types/whatsapp-features.types';

interface ProductCatalogProps {
  products: CatalogProduct[];
  onAddToCart?: (product: CatalogProduct, quantity: number) => void;
  onViewCart?: (cart: ShoppingCartType) => void;
  isVisible?: boolean;
  currency?: string;
}

export function ProductCatalog({ 
  products, 
  onAddToCart,
  onViewCart,
  isVisible = true,
  currency = '€'
}: ProductCatalogProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<CatalogProduct | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addedToCart, setAddedToCart] = useState<Record<string, boolean>>({});

  const getCartTotal = useCallback(() => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }, [cart]);

  const getCartItemCount = useCallback(() => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  }, [cart]);

  const handleQuantityChange = useCallback((productId: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + delta)
    }));
  }, []);

  const handleAddToCart = useCallback((product: CatalogProduct) => {
    const quantity = quantities[product.id] || 1;
    
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevCart, { product, quantity }];
      }
    });

    // Show confirmation animation
    setAddedToCart(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedToCart(prev => ({ ...prev, [product.id]: false }));
    }, 2000);

    onAddToCart?.(product, quantity);
    
    // Reset quantity
    setQuantities(prev => ({ ...prev, [product.id]: 1 }));
  }, [quantities, onAddToCart]);

  const handleViewCart = useCallback(() => {
    const shoppingCart: ShoppingCartType = {
      items: cart,
      total: getCartTotal(),
      currency,
      itemCount: getCartItemCount()
    };
    onViewCart?.(shoppingCart);
  }, [cart, getCartTotal, getCartItemCount, currency, onViewCart]);

  if (!isVisible || products.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg">
      {/* Header with Cart */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Catálogo de Productos</h3>
          {cart.length > 0 && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={handleViewCart}
              className="relative p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingCart className="w-5 h-5" />
              {getCartItemCount() > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                >
                  {getCartItemCount()}
                </motion.div>
              )}
            </motion.button>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 gap-2 p-2">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Product Image */}
            <div className="relative aspect-square bg-gray-100">
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.badge && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                  {product.badge}
                </div>
              )}
              {!product.inStock && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="text-white font-semibold">Agotado</span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-2">
              <h4 className="font-semibold text-sm text-gray-900 truncate">
                {product.name}
              </h4>
              <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                {product.description}
              </p>
              
              {/* Price */}
              <div className="mt-2 flex items-center justify-between">
                <span className="text-lg font-bold text-green-600">
                  {product.price.toFixed(2)}{currency}
                </span>
              </div>

              {/* Quantity and Add to Cart */}
              {product.inStock && (
                <div className="mt-2 space-y-2">
                  {/* Quantity Selector */}
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleQuantityChange(product.id, -1)}
                      className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      disabled={quantities[product.id] <= 1}
                    >
                      <Minus className="w-4 h-4 text-gray-600" />
                    </button>
                    <span className="w-8 text-center font-semibold text-gray-900">
                      {quantities[product.id] || 1}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(product.id, 1)}
                      className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <motion.button
                    onClick={() => handleAddToCart(product)}
                    className={`w-full py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-1 ${
                      addedToCart[product.id]
                        ? 'bg-green-100 text-green-700'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    {addedToCart[product.id] ? (
                      <>
                        <Check className="w-4 h-4" />
                        Añadido
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Añadir
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl max-w-sm w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900">{selectedProduct.name}</h3>
                <p className="text-sm text-gray-600 mt-2">{selectedProduct.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-600">
                    {selectedProduct.price.toFixed(2)}{currency}
                  </span>
                  {selectedProduct.inStock && (
                    <button
                      onClick={() => {
                        handleAddToCart(selectedProduct);
                        setSelectedProduct(null);
                      }}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                    >
                      Añadir al carrito
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WhatsApp branding */}
      <div className="text-center py-2 border-t border-gray-200">
        <span className="text-xs text-gray-400">WhatsApp Catalog</span>
      </div>
    </div>
  );
}