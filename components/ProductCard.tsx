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
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200">
      {/* Product Image - Apple Style */}
      {product.imageUrl && (
        <div className="h-48 bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-8">
          <img
            src={product.imageUrl}
            alt={product.productName}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      )}

      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 leading-tight">
          {product.productName}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {selectedVariant.productCode}
        </p>

        {/* Size Selector - Apple Style */}
        <div className="mb-6">
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-3">
            Dung tích
          </label>
          <div className="flex flex-wrap gap-2">
            {product.variants.map(variant => (
              <button
                key={variant.id}
                type="button"
                onClick={() => setSelectedVariant(variant)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  selectedVariant.id === variant.id
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                }`}
              >
                {variant.size}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <span className="text-xl font-semibold text-gray-900 dark:text-white">
            {formatVND(selectedVariant.price)} ₫
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onQuantityChange(selectedVariant.id, Math.max(0, currentQuantity - 1))}
              className="w-9 h-9 rounded-full border border-gray-300 dark:border-gray-600 hover:border-gray-900 dark:hover:border-white flex items-center justify-center text-gray-700 dark:text-gray-300 font-medium disabled:opacity-30 disabled:hover:border-gray-300 transition-all"
              disabled={currentQuantity === 0}
            >
              −
            </button>
            <span className="w-8 text-center font-medium text-gray-900 dark:text-white">{currentQuantity}</span>
            <button
              type="button"
              onClick={() => onQuantityChange(selectedVariant.id, currentQuantity + 1)}
              className="w-9 h-9 rounded-full bg-gray-900 dark:bg-white hover:bg-gray-700 dark:hover:bg-gray-100 text-white dark:text-gray-900 flex items-center justify-center font-medium transition-all"
            >
              +
            </button>
          </div>
        </div>

        {/* Detailed Description Section - Apple Style */}
        {selectedVariant.detailedDescription && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setShowDescription(!showDescription)}
              className="flex items-center justify-between w-full text-sm font-medium text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <span>Chi tiết sản phẩm</span>
              <span className="text-lg">{showDescription ? '−' : '+'}</span>
            </button>

            {showDescription && (
              <div className="mt-4 space-y-3">
                {/* Language Toggle - Apple Style */}
                <div className="inline-flex gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setLanguage('vn')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      language === 'vn'
                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    Tiếng Việt
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      language === 'en'
                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    English
                  </button>
                </div>

                {/* Description Text */}
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
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
