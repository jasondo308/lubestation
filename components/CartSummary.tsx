'use client';

import { CartItem } from '@/lib/types';

interface CartSummaryProps {
  items: CartItem[];
  selectedCity?: string;
}

export default function CartSummary({ items, selectedCity }: CartSummaryProps) {
  const subtotal = items.reduce((sum, item) => sum + (item.variant.price * item.quantity), 0);

  // 10% pre-order discount
  const discount = subtotal * 0.1;
  const afterDiscount = subtotal - discount;

  // Shipping cost based on city
  const getShippingCost = () => {
    if (!selectedCity) return 0;
    return selectedCity === 'Hồ Chí Minh' ? 35000 : 40000;
  };

  const shippingCost = getShippingCost();
  const total = afterDiscount + shippingCost;

  // Format VND currency with thousand separators
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(Math.round(amount));
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-7 sticky top-6 border border-gray-100 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Giỏ Hàng
      </h2>

      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div key={item.variant.id} className="flex justify-between text-sm gap-4 pb-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
            <span className="text-gray-700 dark:text-gray-300 flex-1 font-medium">
              {item.productName} <span className="text-blue-600 dark:text-blue-400">({item.variant.size})</span> × {item.quantity}
            </span>
            <span className="font-bold text-gray-900 dark:text-white whitespace-nowrap">
              {formatVND(item.variant.price * item.quantity)} ₫
            </span>
          </div>
        ))}
      </div>

      {/* Pre-order discount banner */}
      <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <p className="text-xs font-bold text-green-800 dark:text-green-200 text-center">
          🎉 Ưu đãi đặt hàng trước: Giảm 10%
        </p>
      </div>

      <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-5 space-y-3">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Tạm tính</span>
          <span className="text-gray-900 dark:text-white font-medium">
            {formatVND(subtotal)} ₫
          </span>
        </div>

        {/* Discount */}
        <div className="flex justify-between text-sm">
          <span className="text-green-600 dark:text-green-400 font-medium">Giảm giá (10%)</span>
          <span className="text-green-600 dark:text-green-400 font-bold">
            -{formatVND(discount)} ₫
          </span>
        </div>

        {/* Shipping */}
        {selectedCity && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Phí vận chuyển {selectedCity === 'Hồ Chí Minh' ? '(HCM)' : '(Tỉnh khác)'}
            </span>
            <span className="text-gray-900 dark:text-white font-medium">
              {formatVND(shippingCost)} ₫
            </span>
          </div>
        )}

        {/* Total */}
        <div className="flex justify-between text-xl font-bold pt-3 border-t border-gray-200 dark:border-gray-700">
          <span className="text-gray-900 dark:text-white">Tổng Cộng</span>
          <span className="text-blue-600 dark:text-blue-400">
            {formatVND(total)} ₫
          </span>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center bg-gray-50 dark:bg-gray-700/50 py-2 rounded-lg">
        {items.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm
      </div>
    </div>
  );
}
