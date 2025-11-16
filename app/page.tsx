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

      // Show success modal with order ID
      setSuccessOrderId(result.orderId);
      setShowSuccess(true);

      // Reset cart and city
      setCart({});
      setSelectedCity('');
    } catch (error) {
      console.error('Order submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`Đặt hàng thất bại!\n\nChi tiết lỗi: ${errorMessage}`);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header - Apple Style */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white tracking-tight">
              LubeStation
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              powered by TheGioiRubik
            </p>
          </div>
        </div>
      </header>

      {/* Success Modal - Apple Style */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <div className="w-20 h-20 bg-black dark:bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-white dark:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                Đặt Hàng Thành Công
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Mã đơn hàng: <span className="font-mono font-semibold text-gray-900 dark:text-white">{successOrderId}</span>
              </p>
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
                <p>Email xác nhận đã được gửi đến hộp thư của bạn</p>
                <p>Chúng tôi sẽ liên hệ với bạn sớm để xác nhận đơn hàng</p>
                <p className="text-gray-900 dark:text-white font-medium pt-3">
                  Đóng đơn: 19/11/2025 | Dự kiến giao: 30/11/2025
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowSuccess(false);
                  setSuccessOrderId('');
                }}
                className="w-full bg-gray-900 dark:bg-white hover:bg-gray-700 dark:hover:bg-gray-100 text-white dark:text-gray-900 font-medium py-3 px-6 rounded-lg transition-all"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-2">
            Chọn Sản Phẩm
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Lựa chọn dầu bôi trơn cube cao cấp từ TheCubicle
          </p>

          {/* Search Bar - Apple Style */}
          <div className="relative max-w-2xl">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-3 pl-12 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-transparent dark:text-white transition-all text-base"
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

        {/* Sub-Category Filter Chips - Apple Style */}
        {currentSubCategories.length > 0 && (
          <div className="mb-10 flex flex-wrap gap-2">
            {currentSubCategories.map(subCat => (
              <button
                key={subCat}
                onClick={() => setActiveSubCategory(subCat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeSubCategory === subCat
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
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
