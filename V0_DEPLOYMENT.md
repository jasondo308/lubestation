# LubeStation - v0.dev Deployment Guide

This guide covers publishing your LubeStation project to v0.dev for live hosting and sharing.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Deployment Options](#deployment-options)
- [Option 1: Multi-File Structure (Recommended)](#option-1-multi-file-structure-recommended)
- [Option 2: Single-File Version](#option-2-single-file-version)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [v0.dev Publishing Steps](#v0dev-publishing-steps)
- [Troubleshooting](#troubleshooting)
- [Post-Deployment Optimization](#post-deployment-optimization)

---

## 🎯 Overview

v0.dev is a Vercel-powered platform that can host Next.js applications. LubeStation is compatible with v0, but requires proper file structure and data file inclusion.

**Key Requirement**: The `stockprice/stock-pricelist.json` file MUST be included for the app to work.

---

## 🔀 Deployment Options

### Comparison

| Aspect | Multi-File (Current) | Single-File |
|--------|---------------------|-------------|
| **Maintainability** | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐ Good |
| **v0 Compatibility** | ⭐⭐⭐⭐⭐ Native | ⭐⭐⭐⭐ Works |
| **File Size** | Multiple small files | One ~600 line file |
| **Ease of Upload** | ⭐⭐⭐⭐ Good | ⭐⭐⭐⭐⭐ Excellent |
| **Future Updates** | ⭐⭐⭐⭐⭐ Easy | ⭐⭐⭐ Moderate |
| **Component Reuse** | ⭐⭐⭐⭐⭐ Yes | ⭐ No |

**Recommendation**: Use **Multi-File Structure** for production. Use **Single-File** only for quick demos or proof-of-concept.

---

## 📁 Option 1: Multi-File Structure (Recommended)

### File Structure for v0

```
Lubestation/
├── app/
│   ├── layout.tsx           ✅ Required
│   ├── page.tsx             ✅ Required
│   └── globals.css          ✅ Required
│
├── components/
│   ├── ProductCard.tsx      ✅ Required
│   ├── CartSummary.tsx      ✅ Required
│   └── PreOrderForm.tsx     ✅ Required
│
├── lib/
│   ├── types.ts             ✅ Required
│   └── products.ts          ✅ Required
│
├── stockprice/
│   └── stock-pricelist.json ⚠️  CRITICAL - Must include!
│
├── package.json             ✅ Required
├── tsconfig.json            ✅ Required
├── tailwind.config.ts       ✅ Required
├── next.config.ts           ✅ Required
└── postcss.config.mjs       ✅ Required
```

### Files to EXCLUDE

```
❌ stockprice/stock-pricelist.xlsx         (Source file, not needed)
❌ stockprice/product-descriptions.json    (Already merged into main JSON)
❌ data-processing/*                       (Scripts, not needed at runtime)
❌ full_product_descriptions_en_vi.txt     (Source file)
❌ pricelist.xlsx                          (Original source)
❌ node_modules/                           (Auto-installed by v0)
❌ .next/                                  (Build output)
❌ .git/                                   (Version control)
❌ README.md                               (Optional, can include if wanted)
❌ TECHNICAL.md                            (Optional)
❌ V0_DEPLOYMENT.md                        (This file, optional)
```

### Advantages

✅ Clean, professional code structure
✅ Easy to maintain and update
✅ Component reusability
✅ Standard Next.js conventions
✅ v0 understands this structure natively
✅ Other developers can understand code easily

### Upload Method for v0

**Method A: Direct Upload**
1. Zip the required files (see checklist above)
2. Go to https://v0.dev
3. Create new project
4. Upload ZIP file
5. v0 will analyze and deploy

**Method B: GitHub Integration**
1. Push project to GitHub
2. Connect v0 to your GitHub account
3. Import repository
4. v0 will auto-deploy

---

## 📄 Option 2: Single-File Version

### When to Use

- Quick demo or proof-of-concept
- Sharing code snippet
- Educational purposes
- When file structure is too complex for recipient

### File Structure

```
Lubestation/
├── app/
│   ├── layout.tsx           ✅ Required
│   ├── page.tsx             ✅ Required (ALL code inline)
│   └── globals.css          ✅ Required
│
├── lib/
│   └── products.ts          ✅ Required (data loading only)
│
├── stockprice/
│   └── stock-pricelist.json ⚠️  CRITICAL
│
├── package.json             ✅ Required
├── tsconfig.json            ✅ Required
├── tailwind.config.ts       ✅ Required
├── next.config.ts           ✅ Required
└── postcss.config.mjs       ✅ Required
```

### What Gets Combined

The single `app/page.tsx` would contain:
- All component code (ProductCard, CartSummary, PreOrderForm)
- All TypeScript interfaces (from lib/types.ts)
- Main page logic
- All local functions

**Estimated size**: ~500-600 lines

### To Create Single-File Version

If you decide to go this route, I can create it in a future session. The components would be moved inline as:

```typescript
// app/page.tsx (single file version)
'use client';

import { useState, FormEvent } from 'react';
import { products, getSubCategory, subCategories } from '@/lib/products';

// Types (from lib/types.ts)
interface ProductVariant { /* ... */ }
interface Product { /* ... */ }
interface CartItem { /* ... */ }
interface PreOrderFormData { /* ... */ }

// ProductCard component (inline)
function ProductCard({ product, quantities, onQuantityChange }: ProductCardProps) {
  // ... component code here
}

// CartSummary component (inline)
function CartSummary({ items }: CartSummaryProps) {
  // ... component code here
}

// PreOrderForm component (inline)
function PreOrderForm({ items, onSubmit }: PreOrderFormProps) {
  // ... component code here
}

// Main page component
export default function Home() {
  // ... main page logic
}
```

---

## ✅ Pre-Deployment Checklist

### 1. Verify Data File

```bash
# Check JSON file exists and is valid
cat stockprice/stock-pricelist.json | head -n 20

# Verify file size (should be ~38KB)
ls -lh stockprice/stock-pricelist.json
```

Expected output:
```json
{
  "metadata": {
    "conversionRate": 3900,
    "totalProducts": 111,
    ...
  },
  "categories": {
    "cubicle": [...],
    "scs": [...]
  }
}
```

### 2. Test Locally

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Test at http://localhost:3000
# Verify:
# - All products load (111 products)
# - Filters work
# - Cart works
# - Form submits
```

### 3. Production Build Test

```bash
# Build for production
npm run build

# Check for errors
# Should see: "Compiled successfully"

# Test production build locally
npm start

# Verify at http://localhost:3000
```

### 4. Check File Sizes

```bash
# Ensure JSON is included in build
ls -lh .next/static/chunks/

# Total build size should be reasonable (<5MB)
```

### 5. Environment Check

```bash
# Check Node.js version (should be 18+)
node --version

# Check npm version
npm --version

# Verify package.json scripts
cat package.json | grep scripts -A 5
```

---

## 🚀 v0.dev Publishing Steps

### Method 1: Direct Upload (Easiest)

**Step 1: Prepare ZIP File**

```bash
# Create a deployment folder
mkdir lubestation-deploy
cd lubestation-deploy

# Copy required files
cp -r ../app .
cp -r ../components .
cp -r ../lib .
cp -r ../stockprice .
cp ../package.json .
cp ../tsconfig.json .
cp ../tailwind.config.ts .
cp ../next.config.ts .
cp ../postcss.config.mjs .
cp ../.eslintrc.json .  # if exists

# Create ZIP
cd ..
zip -r lubestation-v0.zip lubestation-deploy/
```

**Step 2: Upload to v0**

1. Go to https://v0.dev
2. Sign in with GitHub/Email
3. Click "New Project"
4. Upload `lubestation-v0.zip`
5. Wait for v0 to analyze (~30 seconds)
6. Click "Deploy"

**Step 3: Verify Deployment**

1. Check deployment logs for errors
2. Visit deployed URL
3. Test all functionality:
   - Product listing loads
   - Filters work
   - Cart functions
   - Form submits

### Method 2: GitHub Integration (Best for Ongoing Development)

**Step 1: Push to GitHub**

```bash
# Initialize git if not already
git init

# Create .gitignore
cat > .gitignore << EOF
node_modules/
.next/
.env*.local
*.log
.DS_Store
EOF

# Commit files
git add .
git commit -m "Initial commit - LubeStation v0 deployment"

# Push to GitHub
git remote add origin https://github.com/YOUR_USERNAME/lubestation.git
git push -u origin main
```

**Step 2: Connect v0 to GitHub**

1. Go to https://v0.dev
2. Sign in with GitHub
3. Click "New Project"
4. Select "Import from GitHub"
5. Choose your repository
6. Configure build settings (usually auto-detected)
7. Click "Deploy"

**Step 3: Automatic Deployments**

- Every push to `main` branch triggers auto-deploy
- Preview deployments for pull requests
- Rollback capability

### Method 3: Vercel CLI (Advanced)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts
# - Project name: lubestation
# - Framework: Next.js
# - Root directory: ./
# - Build command: npm run build
# - Output directory: .next

# Production deployment
vercel --prod
```

---

## 🔧 Troubleshooting

### Issue 1: Products Not Loading

**Symptom**: Page loads but shows no products

**Cause**: `stock-pricelist.json` not found

**Solution**:
```bash
# Verify file exists
ls stockprice/stock-pricelist.json

# Check lib/products.ts import path
cat lib/products.ts | grep "import.*json"

# Should be:
import pricelistData from '@/stockprice/stock-pricelist.json';
```

### Issue 2: Build Fails - "Cannot find module"

**Symptom**: Build error about missing modules

**Solution**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

### Issue 3: TypeScript Errors

**Symptom**: Type errors during build

**Solution**:
```bash
# Check tsconfig.json
cat tsconfig.json

# Should have:
{
  "compilerOptions": {
    "resolveJsonModule": true,  // Important for JSON imports
    "paths": {
      "@/*": ["./*"]  // Path alias
    }
  }
}
```

### Issue 4: 404 on Deployed Site

**Symptom**: v0 URL shows 404

**Cause**: Build output incorrect

**Solution**:
- Check v0 build logs
- Verify `next.config.ts` has no custom output settings
- Ensure no `basePath` or `assetPrefix` configured

### Issue 5: Dark Mode Not Working

**Symptom**: Dark mode styles not applying

**Solution**:
```javascript
// tailwind.config.ts should have:
module.exports = {
  darkMode: 'class',  // or 'media'
  // ...
}
```

### Issue 6: Vietnamese Characters Display as ?????

**Symptom**: Vietnamese text shows as question marks

**Solution**:
```typescript
// app/layout.tsx should have:
export default function RootLayout({ children }) {
  return (
    <html lang="vi">  {/* Important: vi for Vietnamese */}
      <head>
        <meta charSet="UTF-8" />  {/* Ensure UTF-8 */}
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Issue 7: Environment Variables Not Working

**Symptom**: If you add env vars later, they don't work

**Solution** (for v0/Vercel):
1. Go to Project Settings
2. Environment Variables section
3. Add variables
4. Redeploy

---

## 🎨 Post-Deployment Optimization

### Performance Checks

**1. Lighthouse Score**
```bash
# Open deployed site
# Open Chrome DevTools
# Run Lighthouse audit
# Target: >90 for all categories
```

**2. Check Load Time**
```bash
# Use WebPageTest.org
# Enter your v0 URL
# Check First Contentful Paint (<2s ideal)
```

**3. Monitor Bundle Size**
```bash
npm run build

# Check output:
# Page size should be <200KB
# First Load JS should be <120KB
```

### SEO Optimization

```typescript
// app/layout.tsx - Add metadata
export const metadata: Metadata = {
  title: "LubeStation - Đặt Hàng Trước | powered by TheGioiRubik",
  description: "Đặt hàng trước dầu bôi trơn cube cao cấp từ TheCubicle và SpeedCubeShop.",
  keywords: ["rubik", "lube", "speedcube", "vietnam", "dầu bôi trơn"],
  openGraph: {
    title: "LubeStation",
    description: "Đặt hàng trước dầu bôi trơn cube cao cấp",
    images: ["/og-image.png"],  // Add when you have images
  },
};
```

### Custom Domain (Optional)

**On v0/Vercel:**
1. Go to Project Settings
2. Domains section
3. Add custom domain
4. Follow DNS configuration steps

Example:
```
lubestation.thegioi rubik.com
↓
Configure DNS:
A Record: @ → 76.76.21.21
CNAME: www → cname.vercel-dns.com
```

### Analytics Integration (Future)

```typescript
// Add to app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        {children}
        <Analytics />  {/* Auto-tracked on v0/Vercel */}
      </body>
    </html>
  );
}
```

---

## 📊 Deployment Checklist

Before going live:

**Functionality**:
- [ ] All 111 products load correctly
- [ ] Brand tabs work (All/TheCubicle/SpeedCubeShop)
- [ ] Sub-category filters work
- [ ] Search works
- [ ] Cart add/remove works
- [ ] Cart total calculates correctly
- [ ] Form validation works
- [ ] Form submission shows success message
- [ ] Success message auto-hides after 5 seconds
- [ ] Cart resets after order submission

**Content**:
- [ ] All prices display in VND
- [ ] Vietnamese text displays correctly
- [ ] "powered by TheGioiRubik" branding visible
- [ ] Product descriptions show (for products that have them)
- [ ] Language toggle works (EN/VN)

**Design**:
- [ ] Responsive on mobile (< 640px)
- [ ] Responsive on tablet (640px - 1024px)
- [ ] Responsive on desktop (> 1024px)
- [ ] Dark mode works
- [ ] All gradients visible
- [ ] Shadows display correctly
- [ ] Hover animations work

**Technical**:
- [ ] No console errors
- [ ] Fast page load (< 3 seconds)
- [ ] Lighthouse score > 90
- [ ] No TypeScript errors
- [ ] Build completes successfully

---

## 🔄 Update Workflow

After initial deployment, for future updates:

**Option A: GitHub Auto-Deploy** (if using GitHub integration)
```bash
# Make changes locally
# Commit and push
git add .
git commit -m "Update: description"
git push

# v0 auto-deploys within 1-2 minutes
```

**Option B: Manual Redeploy**
```bash
# Make changes locally
# Test locally
npm run dev

# Build and test
npm run build
npm start

# Re-upload to v0 or use CLI
vercel --prod
```

**Option C: Update Data Only**
```bash
# Update stockprice/stock-pricelist.xlsx
# Regenerate JSON
node data-processing/convert-to-json.js

# Commit and push (triggers auto-deploy)
git add stockprice/stock-pricelist.json
git commit -m "Update prices"
git push
```

---

## 📞 Support Resources

### v0.dev Resources
- Documentation: https://vercel.com/docs
- Community: https://github.com/vercel/next.js/discussions
- Status: https://www.vercel-status.com

### LubeStation Specific
- README.md - User documentation
- TECHNICAL.md - Developer documentation
- This file (V0_DEPLOYMENT.md) - Deployment guide

### Common Commands Reference

```bash
# Local development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Run production build locally

# Deployment
vercel                   # Deploy to preview
vercel --prod            # Deploy to production
vercel logs              # View deployment logs

# Maintenance
npm install              # Install/update dependencies
npm run lint             # Check code quality
npm audit                # Check for vulnerabilities

# Data updates
node data-processing/convert-to-json.js  # Update product JSON
node data-processing/parse-descriptions.js  # Update descriptions
```

---

## 🎯 Next Session TODO

When you return to continue this project:

1. **Decide on deployment option**:
   - Multi-file (current structure) - recommended
   - Single-file (consolidated) - optional

2. **If choosing single-file**:
   - Ask me to create consolidated version
   - Review and test

3. **Prepare for v0**:
   - Follow pre-deployment checklist
   - Test build locally
   - Verify JSON file included

4. **Deploy**:
   - Choose method (Direct upload / GitHub / CLI)
   - Follow steps in this guide
   - Test deployed site

5. **Optional enhancements**:
   - Add backend integration
   - Add email notifications
   - Add payment processing
   - Add product images

---

## 📝 Notes for Future Development

### Backend Integration Priority

When ready to add backend:

1. **Order Processing** (highest priority)
   - Store orders in database
   - Generate order IDs
   - Send confirmation emails

2. **Email Notifications**
   - Customer confirmation email
   - Admin notification email
   - Use SendGrid or Resend

3. **Admin Dashboard**
   - View orders
   - Update order status
   - Manage products

4. **Payment Integration**
   - Stripe or MoMo for Vietnam market
   - Add payment gateway
   - Handle payment confirmation

### Files to Create Later

```
app/api/orders/route.ts       # Order submission API
app/admin/page.tsx             # Admin dashboard
lib/db.ts                      # Database connection
lib/email.ts                   # Email sending logic
middleware.ts                  # Auth middleware
```

---

**Document Version**: 1.0
**Last Updated**: November 2024
**Author**: Claude Code
**For**: TheGioiRubik - LubeStation Project

---

## Quick Reference

**Current Status**: ✅ Development complete, ready for v0 deployment

**What's Working**:
- ✅ 111 products loading
- ✅ Filtering and search
- ✅ Cart functionality
- ✅ Pre-order form
- ✅ Vietnamese interface
- ✅ Modern minimalist UI

**What's Not Implemented**:
- ❌ Backend order processing
- ❌ Email notifications
- ❌ Payment gateway
- ❌ Admin dashboard
- ❌ Product images

**Recommended Next Steps**:
1. Deploy to v0 using multi-file structure
2. Test live site thoroughly
3. Share with stakeholders
4. Collect feedback
5. Plan Phase 2 (backend integration)

Good luck with deployment! 🚀
