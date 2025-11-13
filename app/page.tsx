'use client';

import { useState } from 'react';
import ProductCard from '@/components/ProductCard';
import CartSummary from '@/components/CartSummary';
import PreOrderForm from '@/components/PreOrderForm';
import { products, getSubCategory, subCategories } from '@/lib/products';
import { CartItem, PreOrderFormData, ProductVariant } from '@/lib/types';

export default function Home() {
  const [cart, setCart] = useState<Record<number, number>>({}); // variantId -> quantity
  const [showSuccess, setShowSuccess] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'cubicle'>('cubicle');
  const [activeSubCategory, setActiveSubCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('');

  const handleQuantityChange = (variantId: number, quantity: number) => {
    setCart(prev => ({
      ...prev,
      [variantId]: quantity
    }));
  };

  // Reset sub-category when changing brand tab
  const handleTabChange = (tab: 'cubicle') => {
    setActiveTab(tab);
    setActiveSubCategory('All');
  };

  // Filter products based on active tab, sub-category, and search
  const filteredProducts = products.filter(product => {
    // Only show TheCubicle products
    if (product.category !== 'TheCubicle') return false;

    // Sub-category filter
    if (activeSubCategory !== 'All') {
      const productSubCat = getSubCategory(product.productName, product.category);
      if (productSubCat !== activeSubCategory) return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return product.productName.toLowerCase().includes(query) ||
             product.description.toLowerCase().includes(query);
    }

    return true;
  });

  // Get current sub-categories (only TheCubicle)
  const currentSubCategories = subCategories.TheCubicle;

  // Build cart items by finding variants across all products
  const cartItems: CartItem[] = Object.entries(cart)
    .filter(([_, quantity]) => quantity > 0)
    .map(([variantIdStr, quantity]) => {
      const variantId = parseInt(variantIdStr);

      // Find the product and variant
      for (const product of products) {
        const variant = product.variants.find(v => v.id === variantId);
        if (variant) {
          return {
            productName: product.productName,
            variant,
            quantity
          };
        }
      }
      return null;
    })
    .filter((item): item is CartItem => item !== null);

  const handlePreOrderSubmit = async (formData: PreOrderFormData) => {
    try {
      // Calculate order totals
      const subtotal = cartItems.reduce((sum, item) => sum + (item.variant.price * item.quantity), 0);
      const discount = subtotal * 0.1; // 10% pre-order discount
      const shipping = formData.city === 'Hồ Chí Minh' ? 35000 : 40000;
      const total = subtotal - discount + shipping;

      // Prepare order data for API
      const orderData = {
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        address: formData.address,
        notes: formData.notes || '',
        items: cartItems.map(item => ({
          productName: item.productName,
          size: item.variant.size,
          quantity: item.quantity,
          price: item.variant.price
        })),
        subtotal,
        discount,
        shipping,
        total
      };

      // Submit to API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Failed to submit order');
      }

      const result = await response.json();

      // Show success message with order ID
      setSuccessOrderId(result.orderId);
      setShowSuccess(true);

      // Reset cart and city
      setCart({});
      setSelectedCity('');

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Hide success message after 10 seconds
      setTimeout(() => {
        setShowSuccess(false);
        setSuccessOrderId('');
      }, 10000);
    } catch (error) {
      console.error('Order submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Đặt hàng thất bại!\n\nChi tiết lỗi: ${errorMessage}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
              LubeStation
            </h1>
            <p className="text-blue-100 text-sm font-medium">
              powered by <span className="font-bold">TheGioiRubik</span>
            </p>
          </div>
        </div>
      </header>

      {/* Success Message */}
      {showSuccess && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-xl p-6 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-3xl text-white">✓</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-green-800 dark:text-green-200 text-2xl mb-2">
                  🎉 Đặt Hàng Thành Công!
                </h3>
                <p className="text-green-700 dark:text-green-300 mb-3">
                  <strong>Mã đơn hàng:</strong> <span className="font-mono bg-green-100 dark:bg-green-800 px-2 py-1 rounded">{successOrderId}</span>
                </p>
                <div className="space-y-2 text-sm text-green-700 dark:text-green-300">
                  <p className="flex items-start gap-2">
                    <span className="flex-shrink-0">📧</span>
                    <span>Email xác nhận đã được gửi đến <strong>hộp thư của bạn</strong></span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="flex-shrink-0">📬</span>
                    <span>Chúng tôi cũng đã nhận được thông báo đơn hàng của bạn</span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="flex-shrink-0">📞</span>
                    <span>Chúng tôi sẽ liên hệ với bạn sớm để xác nhận đơn hàng</span>
                  </p>
                  <p className="flex items-start gap-2 mt-3 pt-3 border-t border-green-300 dark:border-green-700">
                    <span className="flex-shrink-0">📅</span>
                    <span><strong>Đóng đơn:</strong> 19/11/2025 | <strong>Dự kiến giao:</strong> 30/11/2025</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Chọn Sản Phẩm
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
            Lựa chọn dầu bôi trơn cube cao cấp từ TheCubicle
          </p>

          {/* Search Bar */}
          <div className="relative max-w-xl">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-3.5 pl-12 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white transition-all text-base"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Sub-Category Filter Chips */}
        {currentSubCategories.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-3">
            {currentSubCategories.map(subCat => (
              <button
                key={subCat}
                onClick={() => setActiveSubCategory(subCat)}
                className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all transform hover:scale-105 ${
                  activeSubCategory === subCat
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/50'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                }`}
              >
                {subCat}
              </button>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Products Grid */}
          <div className="lg:col-span-2">
            <div className="grid sm:grid-cols-2 gap-6">
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={`${product.category}-${product.productName}-${index}`}
                  product={product}
                  quantities={cart}
                  onQuantityChange={handleQuantityChange}
                />
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <CartSummary items={cartItems} selectedCity={selectedCity} />
          </div>
        </div>

        {/* Pre-order Form */}
        <div className="mt-12">
          <PreOrderForm
            items={cartItems}
            onSubmit={handlePreOrderSubmit}
            onCityChange={setSelectedCity}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-900 dark:to-black mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white mb-2">LubeStation</h3>
            <p className="text-gray-400 text-sm mb-4">powered by <span className="text-blue-400 font-bold">TheGioiRubik</span></p>
            <p className="text-gray-500 text-sm">
              © 2024 LubeStation. Tất cả quyền được bảo lưu.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
