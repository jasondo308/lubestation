# LubeStation - Technical Documentation

## Data Processing Pipeline

### Overview

LubeStation uses a multi-stage data processing pipeline to convert Excel pricelists into structured JSON data that the application consumes.

```
pricelist.xlsx → analyze → format → verify → convert → JSON → app
                                                     ↓
                                            descriptions.txt → parse → merged
```

---

## Data Processing Scripts

All scripts are located in the `data-processing/` folder.

### 1. analyze-pricelist.js

**Purpose**: Analyzes the raw pricelist Excel file to understand its structure.

**Usage**:
```bash
node data-processing/analyze-pricelist.js
```

**Output**:
- Sheet names
- Column headers
- Sample data rows
- Data types detection
- Missing values report

**Example Output**:
```
Sheet: cubicle
Columns: ID, Product Code, Product Name, Size, Price (¥), Weight, ...
Total Rows: 77
Missing Values: 0
```

---

### 2. format-pricelist.js

**Purpose**: Takes raw pricelist and formats it properly with CNY to VND conversion.

**Usage**:
```bash
node data-processing/format-pricelist.js
```

**Process**:
1. Reads `pricelist.xlsx`
2. Applies CNY to VND conversion (1 CNY = 3900 VND)
3. Adds proper column headers
4. Creates formatted Excel file

**Output**: `stockprice/stock-pricelist.xlsx`

**Column Structure**:
```
ID | Product Code | Product Name | Size | Price (¥) | Price (VND) | Weight | QTY/Carton | MOQ | Description
```

**Key Features**:
- Automatic ID generation
- Currency conversion with 3900 rate
- Proper number formatting
- Column alignment

---

### 3. verify-formatted.js

**Purpose**: Validates the formatted pricelist for data integrity.

**Usage**:
```bash
node data-processing/verify-formatted.js
```

**Checks**:
- ✓ All required columns present
- ✓ No duplicate IDs
- ✓ Price conversions accurate (VND = CNY × 3900)
- ✓ No missing critical data
- ✓ Size format valid
- ✓ Product codes match pattern

**Example Output**:
```
✓ Verification passed
✓ 111 products validated
✓ All price conversions accurate
✓ No data integrity issues
```

---

### 4. convert-to-json.js

**Purpose**: Converts formatted Excel to JSON for application consumption.

**Usage**:
```bash
node data-processing/convert-to-json.js
```

**Input**: `stockprice/stock-pricelist.xlsx`

**Output**: `stockprice/stock-pricelist.json`

**JSON Structure**:
```json
{
  "metadata": {
    "conversionRate": 3900,
    "totalProducts": 111,
    "lastUpdated": "2024-11-10T00:00:00.000Z"
  },
  "categories": {
    "cubicle": [
      {
        "id": 1,
        "productCode": "TCC-DNM-37-3CC",
        "productName": "TheCubicle Lube - DNM-37",
        "size": "3cc",
        "price": {
          "cny": 8,
          "vnd": 31200
        },
        "weight": "7g",
        "qtyPerCarton": 100,
        "moq": 10,
        "description": "Fast, water-based lubricant"
      },
      ...
    ],
    "scs": [...]
  }
}
```

**Features**:
- Preserves all data fields
- Proper type conversion (strings → numbers where appropriate)
- Metadata for tracking
- Separate categories for cubicle and scs

---

### 5. parse-descriptions.js

**Purpose**: Parses bilingual product descriptions from text file into structured JSON.

**Usage**:
```bash
node data-processing/parse-descriptions.js
```

**Input**: `full_product_descriptions_en_vi.txt`

**Input Format**:
```
TheCubicle Lube - DNM-37 (3cc)
EN: DNM-37 is a fast, water-based lubricant ideal for speedcubing...
VN: DNM-37 là dầu bôi trơn gốc nước nhanh, lý tưởng cho việc speedcubing...

TheCubicle Lube - DNM-37 (5cc)
EN: DNM-37 is a fast, water-based lubricant ideal for speedcubing...
VN: DNM-37 là dầu bôi trơn gốc nước nhanh, lý tưởng cho việc speedcubing...
```

**Output**: `stockprice/product-descriptions.json`

**Output Structure**:
```json
{
  "TheCubicle Lube - DNM-37": {
    "3cc": {
      "en": "DNM-37 is a fast, water-based lubricant...",
      "vn": "DNM-37 là dầu bôi trơn gốc nước..."
    },
    "5cc": {
      "en": "DNM-37 is a fast, water-based lubricant...",
      "vn": "DNM-37 là dầu bôi trơn gốc nước..."
    }
  }
}
```

**Parsing Logic**:
```javascript
// Pattern: Product Name (Size)
const headerPattern = /^(.+?)\s*\((.+?)\)$/;

// Extract EN description
const enMatch = line.match(/^EN:\s*(.+)$/);

// Extract VN description
const vnMatch = line.match(/^VN:\s*(.+)$/);
```

---

## Application Architecture

### Component Hierarchy

```
App (page.tsx)
├── Header (inline)
├── SearchBar (inline)
├── BrandTabs (inline)
├── SubCategoryChips (inline)
├── ProductGrid
│   └── ProductCard (multiple)
│       ├── CategoryBadge
│       ├── SizeSelector
│       ├── QuantityControls
│       └── DescriptionToggle
├── Sidebar
│   └── CartSummary
└── PreOrderForm
```

### Data Flow Diagram

```
stockprice/stock-pricelist.json
              ↓
      lib/products.ts
              ↓
    [Load & Parse JSON]
              ↓
    [Apply Filters]
    - Remove labels/stickers
    - Remove bottles
    - Remove size > 10cc
    - Remove price = 0
              ↓
    [Group by Product Name]
    - Combine size variants
              ↓
    [Merge Descriptions]
    - Load product-descriptions.json
    - Match by name and size
              ↓
    Export: products array
              ↓
      app/page.tsx
              ↓
    [User Interactions]
    - Brand filter
    - Sub-category filter
    - Search filter
              ↓
    filteredProducts
              ↓
    Render Components
```

### State Management

#### Cart State

```typescript
// Structure: { [variantId: number]: quantity: number }
const [cart, setCart] = useState<Record<number, number>>({});

// Example:
{
  1: 2,   // Variant ID 1 → quantity 2
  5: 1,   // Variant ID 5 → quantity 1
  12: 3   // Variant ID 12 → quantity 3
}
```

**Why variantId as key?**
- Each size variant has unique ID
- Allows different sizes of same product in cart
- Efficient O(1) lookup and update
- Simple quantity tracking

**Cart Operations**:

```typescript
// Add/Update quantity
const handleQuantityChange = (variantId: number, quantity: number) => {
  setCart(prev => ({
    ...prev,
    [variantId]: quantity
  }));
};

// Build CartItems from cart state
const cartItems = Object.entries(cart)
  .filter(([_, quantity]) => quantity > 0)
  .map(([variantIdStr, quantity]) => {
    // Find product and variant by ID
    // Return CartItem object
  });
```

#### Filter State

```typescript
const [activeTab, setActiveTab] = useState<'all' | 'cubicle' | 'scs'>('all');
const [activeSubCategory, setActiveSubCategory] = useState<string>('All');
const [searchQuery, setSearchQuery] = useState('');
```

**Filter Precedence**:
1. Brand filter (activeTab)
2. Sub-category filter (activeSubCategory)
3. Search filter (searchQuery)

All filters are AND-ed together.

---

## Product Filtering Logic

### Filter Pipeline

Located in `lib/products.ts`:

```typescript
// Step 1: Load raw data from JSON
const rawData = loadJSON();

// Step 2: Filter out unwanted products
const filteredData = rawData.filter(product => {
  // Remove labels/stickers
  if (product.productName.toLowerCase().includes('label') ||
      product.productName.toLowerCase().includes('sticker')) {
    return false;
  }

  // Remove bottles
  if (product.productName.toLowerCase().includes('bottle')) {
    return false;
  }

  // Remove sizes > 10cc
  const sizeMatch = product.size.match(/(\d+(?:\.\d+)?)\s*cc/i);
  if (sizeMatch) {
    const sizeNum = parseFloat(sizeMatch[1]);
    if (sizeNum > 10) return false;
  }

  // Remove products with 0 price
  if (product.price.vnd === 0) {
    return false;
  }

  return true;
});

// Step 3: Group by product name
const grouped = groupByProductName(filteredData);

// Step 4: Merge detailed descriptions
const withDescriptions = mergeDescriptions(grouped);

// Result: 111 products ready for display
export const products = withDescriptions;
```

### Sub-Category Classification

```typescript
export const getSubCategory = (
  productName: string,
  category: string
): string => {
  if (category === 'TheCubicle') {
    // Priority order matters!
    if (productName.includes('Labs')) return 'Cubicle Labs';
    if (productName.includes('Compound')) return 'Angstrom Research';
    if (productName.includes('Weight')) return 'Silicone Weights';
    if (productName.includes('FZ')) return 'FZ Series';
    if (productName.includes('DNM') || productName.includes('Lubicle')) {
      return 'Water-Based Lubes';
    }
    return 'TheCubicle Lube';
  }
  else if (category === 'SpeedCubeShop') {
    if (productName.includes('Speed Lube')) return 'Speed Lube (Weights)';
    if (productName.includes('Cosmic') || productName.includes('Lunar') ||
        productName.includes('Martian') || productName.includes('Galaxy')) {
      return 'Cosmic Lube';
    }
    return 'SCS Lube';
  }

  return 'Other';
};
```

**Classification Rules**:

**TheCubicle**:
1. Contains "Labs" → Cubicle Labs
2. Contains "Compound" → Angstrom Research
3. Contains "Weight" → Silicone Weights
4. Contains "FZ" → FZ Series
5. Contains "DNM" or "Lubicle" → Water-Based Lubes
6. Default → TheCubicle Lube

**SpeedCubeShop**:
1. Contains "Speed Lube" → Speed Lube (Weights)
2. Contains "Cosmic", "Lunar", "Martian", or "Galaxy" → Cosmic Lube
3. Default → SCS Lube

---

## Component Deep Dive

### ProductCard Component

**File**: `components/ProductCard.tsx`

**Props**:
```typescript
interface ProductCardProps {
  product: Product;
  quantities: Record<number, number>;
  onQuantityChange: (variantId: number, quantity: number) => void;
}
```

**Local State**:
```typescript
const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0]);
const [showDescription, setShowDescription] = useState(false);
const [language, setLanguage] = useState<'en' | 'vn'>('vn');
```

**Key Features**:

1. **Size Selection**:
   - Visual button-based selector (not dropdown)
   - Highlight selected variant with gradient
   - Update price display on selection

2. **Quantity Controls**:
   - Minus button (disabled at 0)
   - Current quantity display
   - Plus button
   - Updates parent cart state via callback

3. **Description Toggle**:
   - Collapsible section
   - Language switcher (EN/VN)
   - Only shown if detailedDescription exists

**Size Selector Implementation**:
```typescript
<div className="flex flex-wrap gap-2.5">
  {product.variants.map(variant => (
    <button
      key={variant.id}
      onClick={() => setSelectedVariant(variant)}
      className={`px-5 py-2.5 rounded-xl text-sm font-bold ${
        selectedVariant.id === variant.id
          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
          : 'bg-gray-50 text-gray-700 border-2 border-gray-200'
      }`}
    >
      {variant.size}
    </button>
  ))}
</div>
```

---

### CartSummary Component

**File**: `components/CartSummary.tsx`

**Props**:
```typescript
interface CartSummaryProps {
  items: CartItem[];
}
```

**Features**:
- Displays all cart items with product name, size, quantity
- Calculates subtotal automatically
- VND formatting with thousand separators
- Shows total item count
- Sticky positioning (always visible on scroll)
- Returns null if cart empty (doesn't render)

**Subtotal Calculation**:
```typescript
const subtotal = items.reduce((sum, item) =>
  sum + (item.variant.price.vnd * item.quantity), 0
);
```

**VND Formatting**:
```typescript
const formatVND = (amount: number) => {
  return new Intl.NumberFormat('vi-VN').format(Math.round(amount));
};

// 234000 → "234,000"
```

---

### PreOrderForm Component

**File**: `components/PreOrderForm.tsx`

**Props**:
```typescript
interface PreOrderFormProps {
  items: CartItem[];
  onSubmit: (formData: PreOrderFormData) => void;
}
```

**Form Fields**:
1. **Họ và Tên** (fullName) - text, required
2. **Email** (email) - email, required
3. **Số Điện Thoại** (phone) - tel, required
4. **Thành Phố** (city) - select, required
5. **Địa Chỉ** (address) - text, required
6. **Ghi Chú** (notes) - textarea, optional

**Vietnamese Cities**:
```typescript
const vietnameseCities = [
  'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
  'Biên Hòa', 'Nha Trang', 'Huế', 'Vũng Tàu', 'Buôn Ma Thuột',
  'Quy Nhơn', 'Thái Nguyên', 'Vinh', 'Thanh Hóa', 'Nam Định'
];
```

**Form Submission Flow**:
```typescript
const handleSubmit = (e: FormEvent) => {
  e.preventDefault();
  onSubmit(formData);  // Parent handles submission
};

// In parent (app/page.tsx):
const handlePreOrderSubmit = (formData: PreOrderFormData) => {
  console.log('Pre-order submitted:', { ...formData, items: cartItems });
  setShowSuccess(true);
  setCart({});  // Reset cart
  setTimeout(() => setShowSuccess(false), 5000);
};
```

**Current Limitation**:
- Form logs to console only
- No backend integration yet
- No email notification

**Future Backend Integration**:
```typescript
const handlePreOrderSubmit = async (formData: PreOrderFormData) => {
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, items: cartItems })
    });

    if (response.ok) {
      setShowSuccess(true);
      setCart({});
    }
  } catch (error) {
    // Handle error
  }
};
```

---

## TypeScript Type System

### Core Types

**File**: `lib/types.ts`

```typescript
// Variant represents a specific size of a product
export interface ProductVariant {
  id: number;                    // Unique ID across all variants
  productCode: string;           // SKU/product code
  size: string;                  // e.g., "3cc", "5cc", "10cc"
  price: {
    cny: number;                 // Original price in CNY
    vnd: number;                 // Converted price (CNY × 3900)
  };
  weight: string;                // Weight with unit
  qtyPerCarton: number | string; // Quantity per carton
  moq: number | string;          // Minimum order quantity
  detailedDescription?: {        // Optional bilingual description
    en: string;
    vn: string;
  };
}

// Product groups multiple size variants
export interface Product {
  productName: string;           // Display name
  description: string;           // Short description
  category: string;              // "TheCubicle" or "SpeedCubeShop"
  variants: ProductVariant[];    // Array of size options
}

// Cart item with selected variant and quantity
export interface CartItem {
  productName: string;
  variant: ProductVariant;
  quantity: number;
}

// Pre-order form data
export interface PreOrderFormData {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  notes?: string;
}
```

### Type Guards

```typescript
// Filter out null values from CartItem array
.filter((item): item is CartItem => item !== null)

// This tells TypeScript that after this filter,
// array definitely contains only CartItem objects (not null)
```

---

## Performance Considerations

### Data Loading

- **JSON file size**: ~38KB
- **Products count**: 111 products
- **Load time**: < 10ms
- **Method**: Synchronous require() on build

### Rendering Optimization

**Current Approach**:
- All products loaded at once
- Filter in memory (fast with 111 products)
- No pagination needed

**If Scaling**:
```typescript
// Virtual scrolling with react-window
import { FixedSizeGrid } from 'react-window';

// Pagination
const [page, setPage] = useState(1);
const productsPerPage = 20;
const paginatedProducts = filteredProducts.slice(
  (page - 1) * productsPerPage,
  page * productsPerPage
);
```

### State Updates

**Optimized Cart Updates**:
```typescript
// Good: Only updates affected variantId
setCart(prev => ({ ...prev, [variantId]: quantity }));

// Bad: Would re-render entire object
setCart({ ...cart, [variantId]: quantity });
```

**Debounced Search**:
```typescript
// If needed for larger datasets
import { useDebouncedValue } from '@/hooks/useDebounce';

const [searchQuery, setSearchQuery] = useState('');
const debouncedSearch = useDebouncedValue(searchQuery, 300);
```

---

## Styling System

### Tailwind Configuration

**File**: `tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Custom extensions here
    },
  },
  plugins: [],
};
```

### Design Tokens

**Colors**:
```css
Primary: blue-600 (#2563eb), blue-700 (#1d4ed8)
Success: green-500 (#22c55e), green-800 (#166534)
Warning: yellow-500 (#eab308), yellow-800 (#854d0e)
Background Light: gray-50 (#f9fafb)
Background Dark: gray-900 (#111827)
```

**Spacing**:
```css
Gap between cards: gap-6 (24px)
Padding cards: p-6 (24px), p-7 (28px), p-8 (32px)
Section margin: mb-8 (32px), mt-12 (48px)
```

**Typography**:
```css
Header: text-4xl md:text-5xl
Section: text-3xl
Card title: text-xl
Body: text-base
Small: text-sm, text-xs
```

### Common Patterns

**Card Pattern**:
```typescript
className="bg-white dark:bg-gray-800
           rounded-2xl
           shadow-lg
           hover:shadow-2xl
           transition-all duration-300
           transform hover:-translate-y-1
           border border-gray-100 dark:border-gray-700"
```

**Button Pattern (Primary)**:
```typescript
className="bg-gradient-to-r from-blue-600 to-blue-700
           hover:from-blue-700 hover:to-blue-800
           text-white
           font-bold
           py-4 px-6
           rounded-xl
           transition-all
           transform hover:scale-[1.02]
           shadow-lg shadow-blue-200 dark:shadow-blue-900/50"
```

**Button Pattern (Size Selector)**:
```typescript
// Selected
className="px-5 py-2.5
           rounded-xl
           text-sm font-bold
           transition-all transform hover:scale-105
           bg-gradient-to-r from-blue-600 to-blue-700
           text-white
           shadow-lg shadow-blue-200 dark:shadow-blue-900/50"

// Unselected
className="px-5 py-2.5
           rounded-xl
           text-sm font-bold
           transition-all transform hover:scale-105
           bg-gray-50 dark:bg-gray-700
           text-gray-700 dark:text-gray-300
           hover:bg-gray-100 dark:hover:bg-gray-600
           border-2 border-gray-200 dark:border-gray-600"
```

---

## Testing Considerations

### Manual Testing Checklist

**Product Display**:
- [ ] All 111 products load correctly
- [ ] Size variants display for each product
- [ ] Prices show in VND with correct formatting
- [ ] Product codes display correctly

**Filtering**:
- [ ] Brand tabs switch correctly (All/TheCubicle/SpeedCubeShop)
- [ ] Sub-category chips filter properly
- [ ] Search works for product names
- [ ] Search works for descriptions
- [ ] Filters combine correctly (AND logic)

**Cart**:
- [ ] Add to cart increases quantity
- [ ] Remove from cart decreases quantity
- [ ] Multiple variants can be in cart simultaneously
- [ ] Cart summary calculates total correctly
- [ ] Cart persists during navigation (within session)

**Form**:
- [ ] All required fields validated
- [ ] Email validation works
- [ ] City dropdown shows all 15 cities
- [ ] Form submits with valid data
- [ ] Success message appears
- [ ] Cart resets after submission

**Responsive Design**:
- [ ] Mobile view (< 640px)
- [ ] Tablet view (640px - 1024px)
- [ ] Desktop view (> 1024px)
- [ ] Product grid adjusts correctly
- [ ] Cart sidebar stacks properly on mobile

**Dark Mode**:
- [ ] All colors have dark variants
- [ ] Text remains readable
- [ ] Shadows adjust for dark background
- [ ] Gradients visible in dark mode

### Future Automated Tests

**Unit Tests** (with Jest/Vitest):
```typescript
describe('formatVND', () => {
  it('formats VND correctly with thousand separators', () => {
    expect(formatVND(234000)).toBe('234,000');
  });
});

describe('getSubCategory', () => {
  it('classifies FZ Series correctly', () => {
    expect(getSubCategory('TheCubicle Lube - FZ 1', 'TheCubicle'))
      .toBe('FZ Series');
  });
});
```

**Integration Tests** (with React Testing Library):
```typescript
describe('ProductCard', () => {
  it('updates quantity when buttons clicked', () => {
    render(<ProductCard product={mockProduct} />);

    const plusButton = screen.getByText('+');
    fireEvent.click(plusButton);

    expect(screen.getByText('1')).toBeInTheDocument();
  });
});
```

**E2E Tests** (with Playwright):
```typescript
test('complete order flow', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Add product to cart
  await page.click('button:has-text("+")');

  // Fill form
  await page.fill('input[name="fullName"]', 'Nguyen Van A');
  await page.fill('input[name="email"]', 'test@example.com');

  // Submit
  await page.click('button:has-text("Đặt Hàng Ngay")');

  // Verify success
  await expect(page.getByText('Đặt hàng thành công!')).toBeVisible();
});
```

---

## Deployment

### Development

```bash
npm run dev
```
- Runs on http://localhost:3000
- Hot reload enabled
- Source maps for debugging

### Production Build

```bash
npm run build
```

**Build Output**:
```
Page                              Size     First Load JS
┌ ○ /                            5.2 kB          120 kB
└ ○ /404                         182 B          85.9 kB
+ First Load JS shared by all    85.7 kB
  ├ chunks/framework-[hash].js   45.2 kB
  ├ chunks/main-[hash].js        32.1 kB
  └ other shared chunks           8.4 kB
```

### Hosting Options

**1. Vercel (Recommended)**:
```bash
npm install -g vercel
vercel
```
- Automatic deployments from git
- Edge network CDN
- Zero configuration

**2. Netlify**:
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"
```

**3. Self-Hosted**:
```bash
npm run build
npm start
```
- Requires Node.js runtime
- Use PM2 for process management
- Set up reverse proxy (nginx)

### Environment Variables

**Future Backend Integration**:
```env
# .env.local
NEXT_PUBLIC_API_URL=https://api.lubestation.com
NEXT_PUBLIC_STRIPE_KEY=pk_live_...
DATABASE_URL=postgresql://...
EMAIL_SERVER=smtp://...
```

---

## Security Considerations

### Current State (Pre-Order Only)

- No authentication required
- No sensitive data storage
- Form data logged to console only
- No payment processing

### Future Backend Integration

**Input Validation**:
```typescript
// Server-side validation with Zod
import { z } from 'zod';

const orderSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^0\d{9,10}$/),
  city: z.enum(vietnameseCities),
  address: z.string().min(10).max(200),
  notes: z.string().max(500).optional(),
  items: z.array(z.object({
    variantId: z.number(),
    quantity: z.number().min(1).max(100)
  }))
});
```

**CSRF Protection**:
```typescript
// Use next-csrf package
import csrf from 'next-csrf';
```

**Rate Limiting**:
```typescript
// Use express-rate-limit or upstash-ratelimit
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10 // limit each IP to 10 requests per windowMs
});
```

---

## Troubleshooting

### Common Issues

**1. Products not loading**:
```
Error: Cannot find module 'stockprice/stock-pricelist.json'
```
**Solution**: Run `node data-processing/convert-to-json.js`

**2. Prices showing as 0**:
```
Check: price.vnd field in JSON
```
**Solution**: Verify conversion rate in convert script (should be 3900)

**3. Build fails**:
```
Type error: Property 'variants' does not exist on type 'Product'
```
**Solution**: Check types.ts matches data structure, rebuild

**4. Dark mode not working**:
```
Check: tailwind.config.ts has darkMode: 'class'
```
**Solution**: Add `darkMode: 'class'` to config

**5. Vietnamese characters broken**:
```
Check: charset in layout.tsx
```
**Solution**: Ensure `<html lang="vi">` and UTF-8 encoding

---

## Future Roadmap

### Phase 1: Backend Integration (Current)
- [ ] API endpoints for order submission
- [ ] Email notifications (SendGrid/Resend)
- [ ] Order storage (Supabase/PostgreSQL)
- [ ] Admin dashboard for orders

### Phase 2: Enhanced Features
- [ ] Product images
- [ ] Stock availability
- [ ] Wishlist functionality
- [ ] Order tracking
- [ ] Customer accounts

### Phase 3: E-commerce Features
- [ ] Payment gateway (Stripe/MoMo)
- [ ] Shipping integration
- [ ] Invoice generation
- [ ] Inventory management
- [ ] Analytics dashboard

### Phase 4: Optimization
- [ ] PWA support
- [ ] Offline mode
- [ ] Image optimization
- [ ] Performance monitoring
- [ ] SEO optimization

---

## Additional Resources

### Documentation
- [Next.js 15 Docs](https://nextjs.org/docs)
- [React 18 Docs](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Tools
- [xlsx npm package](https://www.npmjs.com/package/xlsx)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [TypeScript Playground](https://www.typescriptlang.org/play)

---

**Document Version**: 1.0
**Last Updated**: November 2024
**Maintained by**: TheGioiRubik Team
