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
  const [activeTab, setActiveTab] = useState<'all' | 'cubicle' | 'scs'>('all');
  const [activeSubCategory, setActiveSubCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const handleQuantityChange = (variantId: number, quantity: number) => {
    setCart(prev => ({
      ...prev,
      [variantId]: quantity
    }));
  };

  // Reset sub-category when changing brand tab
  const handleTabChange = (tab: 'all' | 'cubicle' | 'scs') => {
    setActiveTab(tab);
    setActiveSubCategory('All');
  };

  // Filter products based on active tab, sub-category, and search
  const filteredProducts = products.filter(product => {
    // Brand filter
    if (activeTab === 'cubicle' && product.category !== 'TheCubicle') return false;
    if (activeTab === 'scs' && product.category !== 'SpeedCubeShop') return false;

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

  // Get current sub-categories based on active tab
  const currentSubCategories = activeTab === 'all' ? [] :
    activeTab === 'cubicle' ? subCategories.TheCubicle :
    subCategories.SpeedCubeShop;

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

  const handlePreOrderSubmit = (formData: PreOrderFormData) => {
    console.log('Pre-order submitted:', {
      ...formData,
      items: cartItems
    });

    // Show success message
    setShowSuccess(true);

    // Reset cart
    setCart({});

    // Hide success message after 5 seconds
    setTimeout(() => setShowSuccess(false), 5000);
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
          <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 rounded-r-lg p-5 shadow-md">
            <div className="flex items-center gap-3">
              <span className="text-3xl">✓</span>
              <div>
                <p className="font-bold text-green-800 dark:text-green-200 text-lg">
                  Đặt hàng thành công!
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  Chúng tôi sẽ liên hệ với bạn sớm để xác nhận đơn hàng.
                </p>
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
            Lựa chọn dầu bôi trơn cube cao cấp từ TheCubicle và SpeedCubeShop
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

        {/* Brand Tabs */}
        <div className="mb-6">
          <div className="flex gap-3 border-b-2 border-gray-100 dark:border-gray-700">
            <button
              onClick={() => handleTabChange('all')}
              className={`px-8 py-4 font-bold transition-all border-b-3 text-base ${
                activeTab === 'all'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              Tất Cả
            </button>
            <button
              onClick={() => handleTabChange('cubicle')}
              className={`px-8 py-4 font-bold transition-all border-b-3 text-base ${
                activeTab === 'cubicle'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              TheCubicle
            </button>
            <button
              onClick={() => handleTabChange('scs')}
              className={`px-8 py-4 font-bold transition-all border-b-3 text-base ${
                activeTab === 'scs'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }`}
            >
              SpeedCubeShop
            </button>
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
            <CartSummary items={cartItems} />
          </div>
        </div>

        {/* Pre-order Form */}
        <div className="mt-12">
          <PreOrderForm items={cartItems} onSubmit={handlePreOrderSubmit} />
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
