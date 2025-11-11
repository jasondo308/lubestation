'use client';

import { CartItem } from '@/lib/types';

interface CartSummaryProps {
  items: CartItem[];
}

export default function CartSummary({ items }: CartSummaryProps) {
  const subtotal = items.reduce((sum, item) => sum + (item.variant.price * item.quantity), 0);

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

      <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-5">
        <div className="flex justify-between text-xl font-bold">
          <span className="text-gray-900 dark:text-white">Tổng Cộng</span>
          <span className="text-blue-600 dark:text-blue-400">
            {formatVND(subtotal)} ₫
          </span>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center bg-gray-50 dark:bg-gray-700/50 py-2 rounded-lg">
        {items.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm
      </div>
    </div>
  );
}
