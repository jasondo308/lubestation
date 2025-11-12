'use client';

import { useState, FormEvent } from 'react';
import { CartItem, PreOrderFormData } from '@/lib/types';

interface PreOrderFormProps {
  items: CartItem[];
  onSubmit: (formData: PreOrderFormData) => void;
  onCityChange?: (city: string) => void;
}

export default function PreOrderForm({ items, onSubmit, onCityChange }: PreOrderFormProps) {
  const [formData, setFormData] = useState<PreOrderFormData>({
    fullName: '',
    email: '',
    phone: '',
    city: '',
    address: '',
    notes: ''
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Notify parent when city changes
    if (name === 'city' && onCityChange) {
      onCityChange(value);
    }
  };

  const vietnameseCities = [
    'Hà Nội',
    'Hồ Chí Minh',
    'Đà Nẵng',
    'Hải Phòng',
    'Cần Thơ',
    'Biên Hòa',
    'Nha Trang',
    'Huế',
    'Vũng Tàu',
    'Buôn Ma Thuột',
    'Quy Nhơn',
    'Thái Nguyên',
    'Vinh',
    'Thanh Hóa',
    'Nam Định'
  ];

  if (items.length === 0) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 rounded-r-xl p-6 text-center shadow-md">
        <p className="text-yellow-800 dark:text-yellow-200 font-medium">
          Vui lòng thêm sản phẩm vào giỏ hàng trước khi đặt hàng.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-700">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Thông Tin Đặt Hàng
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Họ và Tên *
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            required
            value={formData.fullName}
            onChange={handleChange}
            className="w-full px-5 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all"
            placeholder="Nguyễn Văn A"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="w-full px-5 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all"
            placeholder="email@example.com"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Số Điện Thoại *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-5 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all"
            placeholder="0912 345 678"
          />
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Thành Phố *
          </label>
          <select
            id="city"
            name="city"
            required
            value={formData.city}
            onChange={handleChange}
            className="w-full px-5 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all"
          >
            <option value="">Chọn thành phố</option>
            {vietnameseCities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Địa Chỉ *
          </label>
          <input
            type="text"
            id="address"
            name="address"
            required
            value={formData.address}
            onChange={handleChange}
            className="w-full px-5 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all"
            placeholder="123 Đường ABC, Quận/Huyện"
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Ghi Chú
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            className="w-full px-5 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white resize-none transition-all"
            placeholder="Yêu cầu đặc biệt hoặc ghi chú thêm..."
          />
        </div>

        {/* Payment Instructions */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-xl p-5 space-y-4">
          <h3 className="font-bold text-blue-900 dark:text-blue-200 text-lg">
            💳 Hướng Dẫn Thanh Toán
          </h3>
          <div className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
            <p>
              <span className="font-semibold">Bước 1:</span> Đặt hàng và nhận thông tin xác nhận
            </p>
            <p>
              <span className="font-semibold">Bước 2:</span> Quét mã QR hoặc chuyển khoản theo thông tin bên dưới
            </p>
            <p className="pl-6 text-xs italic">
              ⚠️ <strong>LƯU Ý:</strong> Vui lòng ghi <strong>Họ Tên + Số Điện Thoại</strong> vào nội dung chuyển khoản
            </p>
            <p>
              <span className="font-semibold">Bước 3:</span> Chúng tôi sẽ xử lý và giao hàng sau khi nhận được thanh toán
            </p>
          </div>

          {/* QR Code */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 flex flex-col items-center space-y-3">
            <img
              src="/payment-qr.jpeg"
              alt="QR Code thanh toán"
              className="w-64 h-64 object-contain rounded-lg border-2 border-blue-200 dark:border-blue-700"
            />
            <p className="text-xs text-center text-blue-900 dark:text-blue-200 font-medium">
              Quét mã QR để chuyển khoản
            </p>

            {/* Bank Details */}
            <div className="w-full border-t-2 border-gray-200 dark:border-gray-700 pt-3 space-y-2">
              <p className="text-xs font-bold text-center text-gray-700 dark:text-gray-300 mb-2">
                Hoặc chuyển khoản thủ công:
              </p>
              <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Ngân hàng:</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">Vietcombank HCM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Số tài khoản:</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100 font-mono">0421000408696</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Chủ tài khoản:</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">DO CONG TOAN</span>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-gray-600 dark:text-gray-400">Nội dung:</p>
                  <p className="font-bold text-blue-600 dark:text-blue-400 mt-1">
                    {formData.fullName && formData.phone
                      ? `${formData.fullName} ${formData.phone}`
                      : '[Họ Tên] [Số ĐT]'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
            <p className="text-xs text-blue-700 dark:text-blue-400">
              <span className="font-semibold">📦 Phí vận chuyển:</span>
              {formData.city === 'Hồ Chí Minh' ? ' 35,000 ₫ (HCM)' :
               formData.city ? ' 40,000 ₫ (Tỉnh khác)' :
               ' 35,000 ₫ (HCM) / 40,000 ₫ (Tỉnh khác)'}
            </p>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] shadow-lg shadow-blue-200 dark:shadow-blue-900/50"
        >
          Đặt Hàng Ngay
        </button>

        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Bằng cách đặt hàng, bạn đồng ý để chúng tôi liên hệ xác nhận đơn hàng.
        </p>
      </form>
    </div>
  );
}
