# LubeStation - Đặt Hàng Trước

**powered by TheGioiRubik**

LubeStation là một trang web đặt hàng trước dầu bôi trơn cube cao cấp từ TheCubicle và SpeedCubeShop, được thiết kế dành riêng cho thị trường Việt Nam.

## 📋 Mục Lục

- [Tổng Quan](#tổng-quan)
- [Tính Năng](#tính-năng)
- [Cấu Trúc Dự Án](#cấu-trúc-dự-án)
- [Cấu Trúc Dữ Liệu](#cấu-trúc-dữ-liệu)
- [Cài Đặt và Chạy](#cài-đặt-và-chạy)
- [Quản Lý Sản Phẩm](#quản-lý-sản-phẩm)
- [Kiến Trúc Kỹ Thuật](#kiến-trúc-kỹ-thuật)

---

## 🎯 Tổng Quan

LubeStation là một ứng dụng web Next.js 15 được xây dựng để cho phép khách hàng Việt Nam đặt hàng trước các sản phẩm dầu bôi trơn cube cao cấp. Trang web cung cấp:

- **111 sản phẩm** từ hai nhà cung cấp lớn (77 từ TheCubicle, 34 từ SpeedCubeShop)
- **Giao diện hoàn toàn tiếng Việt** với giá VND
- **Hệ thống lọc phân cấp** theo thương hiệu và danh mục phụ
- **Chức năng tìm kiếm** thời gian thực
- **Mô tả sản phẩm song ngữ** (Tiếng Việt/English)
- **Form đặt hàng** với các thành phố Việt Nam

---

## ✨ Tính Năng

### 1. Danh Sách Sản Phẩm
- Hiển thị sản phẩm theo dạng card với thiết kế hiện đại, tối giản
- Nhóm sản phẩm theo tên với các biến thể kích thước
- Chọn kích thước bằng nút bấm trực quan (3cc, 5cc, 10cc)
- Hiển thị giá VND với định dạng phân cách hàng nghìn

### 2. Hệ Thống Lọc
- **Tab thương hiệu**: Tất Cả / TheCubicle / SpeedCubeShop
- **Danh mục phụ**:
  - **TheCubicle**: FZ Series, Water-Based Lubes, Silicone Weights, Cubicle Labs, Angstrom Research
  - **SpeedCubeShop**: Cosmic Lube, Speed Lube (Weights)
- **Tìm kiếm**: Tìm kiếm theo tên hoặc mô tả sản phẩm

### 3. Giỏ Hàng
- Thêm/bớt số lượng sản phẩm
- Tính tổng tự động theo VND
- Hiển thị chi tiết từng sản phẩm trong giỏ
- Sticky sidebar để luôn hiển thị giỏ hàng

### 4. Mô Tả Sản Phẩm
- Mô tả chi tiết có thể mở rộng/thu gọn
- Chuyển đổi ngôn ngữ Tiếng Việt/English
- 45 sản phẩm có mô tả chi tiết song ngữ

### 5. Form Đặt Hàng
- Họ và Tên (bắt buộc)
- Email (bắt buộc)
- Số Điện Thoại (bắt buộc)
- Thành Phố - dropdown với 15 thành phố lớn Việt Nam (bắt buộc)
- Địa Chỉ (bắt buộc)
- Ghi Chú (tùy chọn)
- Thông báo thành công sau khi đặt hàng

### 6. UI/UX Hiện Đại
- Gradient backgrounds cho header và buttons
- Rounded corners (rounded-xl, rounded-2xl)
- Shadow effects và hover animations
- Dark mode support
- Responsive design cho mobile và desktop

---

## 📁 Cấu Trúc Dự Án

```
Lubestation/
├── app/
│   ├── layout.tsx           # Root layout với metadata
│   ├── page.tsx             # Main page - product listing, cart, search
│   └── globals.css          # Global styles
│
├── components/
│   ├── ProductCard.tsx      # Product card với size selector và descriptions
│   ├── CartSummary.tsx      # Cart summary sidebar
│   └── PreOrderForm.tsx     # Pre-order form với Vietnamese cities
│
├── lib/
│   ├── types.ts             # TypeScript type definitions
│   └── products.ts          # Product data loading và sub-category logic
│
├── stockprice/
│   ├── stock-pricelist.xlsx # Formatted Excel file (source of truth)
│   ├── stock-pricelist.json # JSON version for app consumption
│   └── product-descriptions.json # Parsed bilingual descriptions
│
├── data-processing/         # Scripts xử lý dữ liệu
│   ├── analyze-pricelist.js
│   ├── format-pricelist.js
│   ├── verify-formatted.js
│   ├── convert-to-json.js
│   └── parse-descriptions.js
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

---

## 🗄️ Cấu Trúc Dữ Liệu

### Product Interface

```typescript
interface ProductVariant {
  id: number;                    // Unique variant ID
  productCode: string;           // e.g., "TCC-DNM-37-3CC"
  size: string;                  // e.g., "3cc", "5cc", "10cc"
  price: {
    cny: number;                 // Original price in Chinese Yuan
    vnd: number;                 // Converted price (1 CNY = 3900 VND)
  };
  weight: string;                // Product weight
  qtyPerCarton: number | string; // Quantity per carton
  moq: number | string;          // Minimum order quantity
  detailedDescription?: {        // Optional bilingual description
    en: string;
    vn: string;
  };
}

interface Product {
  productName: string;           // e.g., "TheCubicle Lube - DNM-37"
  description: string;           // Short description
  category: string;              // "TheCubicle" or "SpeedCubeShop"
  variants: ProductVariant[];    // Array of size variants
}
```

### Cart Interface

```typescript
interface CartItem {
  productName: string;
  variant: ProductVariant;
  quantity: number;
}
```

### Pre-Order Form Data

```typescript
interface PreOrderFormData {
  fullName: string;
  email: string;
  phone: string;
  city: string;      // Selected from Vietnamese cities dropdown
  address: string;
  notes?: string;
}
```

---

## 🚀 Cài Đặt và Chạy

### Prerequisites
- Node.js 18+
- npm hoặc yarn

### Cài Đặt

```bash
# Clone repository
git clone [repository-url]
cd Lubestation

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

Trang web sẽ chạy tại: **http://localhost:3000**

### Build Production

```bash
npm run build
npm start
```

---

## 📦 Quản Lý Sản Phẩm

### Nguồn Dữ Liệu

Tất cả dữ liệu sản phẩm được lưu trong thư mục `stockprice/`:

1. **stock-pricelist.xlsx** - File Excel chính (source of truth)
   - Sheet "cubicle": 77 sản phẩm từ TheCubicle
   - Sheet "scs": 34 sản phẩm từ SpeedCubeShop
   - Cột: ID, Product Code, Product Name, Size, Price (¥), Price (VND), Weight, QTY/Carton, MOQ, Description

2. **stock-pricelist.json** - JSON version được tạo tự động
   - Chứa metadata (conversionRate: 3900, totalProducts: 111)
   - Categories: cubicle và scs arrays

3. **product-descriptions.json** - Mô tả chi tiết song ngữ
   - 45 sản phẩm có mô tả đầy đủ EN/VN
   - Được parse từ file full_product_descriptions_en_vi.txt

### Quy Tắc Lọc Sản Phẩm

Products được lọc dựa trên các tiêu chí sau (xem `lib/products.ts`):

```typescript
// Loại bỏ:
- Labels/Stickers (productName chứa "Label" hoặc "Sticker")
- Bottles (productName chứa "Bottle")
- Kích thước > 10cc (size parsing)
- Giá = 0 (price.vnd === 0)

// Kết quả: 111 sản phẩm được hiển thị
```

### Danh Mục Phụ (Sub-Categories)

Logic phân loại được định nghĩa trong `lib/products.ts`:

```typescript
// TheCubicle Sub-Categories:
- FZ Series: productName chứa "FZ"
- Water-Based Lubes: chứa "DNM" hoặc "Lubicle" (không phải FZ)
- Silicone Weights: chứa "Weight"
- Cubicle Labs: chứa "Labs"
- Angstrom Research: chứa "Compound"

// SpeedCubeShop Sub-Categories:
- Cosmic Lube: chứa "Cosmic", "Lunar", "Martian", hoặc "Galaxy"
- Speed Lube (Weights): chứa "Speed Lube"
```

### Cập Nhật Sản Phẩm

Để cập nhật products:

1. **Sửa file Excel**: `stockprice/stock-pricelist.xlsx`
   - Sửa thông tin sản phẩm, giá, hoặc thêm sản phẩm mới
   - Giữ nguyên cấu trúc cột

2. **Convert sang JSON**:
   ```bash
   node data-processing/convert-to-json.js
   ```

3. **Thêm mô tả chi tiết** (optional):
   - Sửa file `full_product_descriptions_en_vi.txt`
   - Chạy parse script:
   ```bash
   node data-processing/parse-descriptions.js
   ```

4. **Restart dev server**:
   ```bash
   npm run dev
   ```

---

## 🏗️ Kiến Trúc Kỹ Thuật

### Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI**: React 18 với hooks
- **Data Processing**: xlsx library cho Excel parsing

### State Management

State được quản lý bằng React `useState`:

```typescript
// Cart state: variantId -> quantity mapping
const [cart, setCart] = useState<Record<number, number>>({});

// Filter states
const [activeTab, setActiveTab] = useState<'all' | 'cubicle' | 'scs'>('all');
const [activeSubCategory, setActiveSubCategory] = useState<string>('All');
const [searchQuery, setSearchQuery] = useState('');
```

### Key Components Logic

#### 1. Product Filtering (app/page.tsx)

```typescript
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
```

#### 2. Cart Building (app/page.tsx)

```typescript
const cartItems: CartItem[] = Object.entries(cart)
  .filter(([_, quantity]) => quantity > 0)
  .map(([variantIdStr, quantity]) => {
    const variantId = parseInt(variantIdStr);

    // Find product and variant by ID
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
```

#### 3. Product Grouping (lib/products.ts)

```typescript
// Group products by name, creating variants for different sizes
const grouped = filteredData.reduce((acc, product) => {
  if (!acc[product.productName]) {
    acc[product.productName] = {
      productName: product.productName,
      description: product.description,
      category: product.category,
      variants: []
    };
  }
  acc[product.productName].variants.push(variant);
  return acc;
}, {});
```

### VND Currency Formatting

```typescript
const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN').format(Math.round(amount));
};

// Output: "234,000 ₫"
```

### Vietnamese Cities

15 thành phố lớn được định nghĩa trong `PreOrderForm.tsx`:

```typescript
const vietnameseCities = [
  'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
  'Biên Hòa', 'Nha Trang', 'Huế', 'Vũng Tàu', 'Buôn Ma Thuột',
  'Quy Nhơn', 'Thái Nguyên', 'Vinh', 'Thanh Hóa', 'Nam Định'
];
```

---

## 🎨 Design System

### Colors
- **Primary**: Blue-600 to Blue-700 gradients
- **Success**: Green-50/500/800
- **Warning**: Yellow-50/500/800
- **Background**: Gray-50 (light), Gray-900 (dark)
- **Text**: Gray-900 (light), White (dark)

### Border Radius
- Small elements: `rounded-xl` (12px)
- Large cards: `rounded-2xl` (16px)
- Pills/badges: `rounded-full`

### Shadows
- Cards: `shadow-lg`, `shadow-xl`
- Hover: `shadow-2xl`
- Colored shadows: `shadow-blue-200`, `shadow-blue-900/50`

### Transitions
- `transition-all`
- `duration-300`
- `hover:scale-105`, `hover:-translate-y-1`

---

## 📊 Data Statistics

- **Total Products**: 111
  - TheCubicle: 77 products
  - SpeedCubeShop: 34 products
- **Products with Detailed Descriptions**: 45
- **Size Variants**: Primarily 3cc, 5cc, 10cc (all ≤ 10cc)
- **Price Range**: 31,200 ₫ - 351,000 ₫
- **Conversion Rate**: 1 CNY = 3,900 VND

---

## 🔄 Workflow

### User Flow
1. User lands on homepage → sees all products
2. User can filter by:
   - Brand tab (All/TheCubicle/SpeedCubeShop)
   - Sub-category chips
   - Search bar
3. User selects size variant → adjusts quantity → adds to cart
4. Cart updates in real-time in sticky sidebar
5. User fills pre-order form with details
6. User submits order → sees success message
7. Cart resets automatically

### Data Flow
1. Excel file (`stock-pricelist.xlsx`) - Source of truth
2. JSON conversion (`stock-pricelist.json`)
3. App loads JSON in `lib/products.ts`
4. Products filtered and grouped
5. Components receive processed data
6. UI renders with TypeScript type safety

---

## 🛠️ Maintenance

### Regular Tasks

1. **Update Prices**:
   - Edit `stockprice/stock-pricelist.xlsx`
   - Run `node data-processing/convert-to-json.js`
   - Restart server

2. **Add New Products**:
   - Add rows to Excel file
   - Ensure columns match existing structure
   - Convert to JSON
   - Add descriptions if needed

3. **Update Descriptions**:
   - Edit `full_product_descriptions_en_vi.txt`
   - Run `node data-processing/parse-descriptions.js`

### Future Enhancements

- [ ] Backend integration for order processing
- [ ] Email notifications
- [ ] Admin panel for product management
- [ ] Image support when products have photos
- [ ] Stock availability tracking
- [ ] Multiple language support (currently VN/EN descriptions only)
- [ ] Payment gateway integration
- [ ] Order history for returning customers

---

## 📝 Notes

- **No Images**: Currently no product images as this is a simple pre-order page
- **Internal Use**: Price data in `stockprice/` folder is for internal use only
- **Form Submission**: Currently logs to console - needs backend integration
- **CNY to VND**: Conversion rate is hardcoded at 3900 VND per 1 CNY

---

## 📞 Contact

**LubeStation** - powered by **TheGioiRubik**

© 2024 LubeStation. Tất cả quyền được bảo lưu.

---

**Last Updated**: November 2024
