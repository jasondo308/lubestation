'use client';

import { useState } from 'react';
import { Product, ProductVariant } from '@/lib/types';

interface ProductCardProps {
  product: Product;
  quantities: Record<number, number>; // variantId -> quantity
  onQuantityChange: (variantId: number, quantity: number) => void;
}

export default function ProductCard({ product, quantities, onQuantityChange }: ProductCardProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0]);
  const [showDescription, setShowDescription] = useState(false);
  const [language, setLanguage] = useState<'en' | 'vn'>('vn');

  // Format VND currency with thousand separators
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(Math.round(amount));
  };

  const currentQuantity = quantities[selectedVariant.id] || 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
      <div className="p-6">
        <div className="mb-3">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider px-3 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-full">
            {product.category}
          </span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
          {product.productName}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 font-mono">
          {selectedVariant.productCode}
        </p>

        {/* Size Selector - Visual Boxes */}
        <div className="mb-5">
          <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">
            Dung Tích
          </label>
          <div className="flex flex-wrap gap-2.5">
            {product.variants.map(variant => (
              <button
                key={variant.id}
                onClick={() => setSelectedVariant(variant)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all transform hover:scale-105 ${
                  selectedVariant.id === variant.id
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/50'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border-2 border-gray-200 dark:border-gray-600'
                }`}
              >
                {variant.size}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
            {formatVND(selectedVariant.price)} ₫
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onQuantityChange(selectedVariant.id, Math.max(0, currentQuantity - 1))}
              className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center font-bold disabled:opacity-50"
              disabled={currentQuantity === 0}
            >
              -
            </button>
            <span className="w-8 text-center font-semibold">{currentQuantity}</span>
            <button
              onClick={() => onQuantityChange(selectedVariant.id, currentQuantity + 1)}
              className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center font-bold"
            >
              +
            </button>
          </div>
        </div>

        {/* Detailed Description Section */}
        {selectedVariant.detailedDescription && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setShowDescription(!showDescription)}
              className="flex items-center justify-between w-full text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <span>{language === 'vn' ? 'Chi tiết sản phẩm' : 'Product Details'}</span>
              <span className="text-xl">{showDescription ? '−' : '+'}</span>
            </button>

            {showDescription && (
              <div className="mt-3 space-y-2">
                {/* Language Toggle */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setLanguage('vn')}
                    className={`px-3 py-1 text-xs rounded-full ${
                      language === 'vn'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Tiếng Việt
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-1 text-xs rounded-full ${
                      language === 'en'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    English
                  </button>
                </div>

                {/* Description Text */}
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  {language === 'vn'
                    ? selectedVariant.detailedDescription.vn
                    : selectedVariant.detailedDescription.en}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
