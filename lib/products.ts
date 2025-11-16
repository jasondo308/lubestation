import { Product, ProductVariant } from './types';
import pricelistData from '../stockprice/stock-pricelist.json';
import detailedDescriptions from '../stockprice/product-descriptions.json';
import productImages from '../stockprice/product-images.json';

// Raw products from both categories
const rawCubicleProducts = pricelistData.categories.cubicle.products.map(p => ({
  ...p,
  price: typeof p.price === 'string' ? parseFloat(p.price) || 0 : p.price,
  category: 'TheCubicle'
}));

const rawScsProducts = pricelistData.categories.scs.products.map(p => ({
  ...p,
  price: typeof p.price === 'string' ? parseFloat(p.price) || 0 : p.price,
  category: 'SpeedCubeShop'
}));

const allRawProducts = [...rawCubicleProducts, ...rawScsProducts];

// Group products by name and create variants for different sizes
const groupedProducts = new Map<string, Product>();

allRawProducts.forEach(product => {
  const key = `${product.category}|${product.productName}`;

  if (!groupedProducts.has(key)) {
    // Look up image URL from product-images.json
    const imageUrl = (productImages.productImages as any)[product.productName];

    groupedProducts.set(key, {
      productName: product.productName,
      description: product.description || '',
      category: product.category,
      variants: [],
      imageUrl: imageUrl
    });
  }

  const grouped = groupedProducts.get(key)!;

  // Look up detailed description
  const detailedDesc = (detailedDescriptions as any)[product.productName]?.[product.size];

  grouped.variants.push({
    id: product.id,
    productCode: product.productCode,
    size: product.size,
    price: product.price,
    weight: product.weight,
    qtyPerCarton: product.qtyPerCarton,
    moq: product.moq,
    detailedDescription: detailedDesc
  });

  // Update description if current product has one and grouped doesn't
  if (product.description && !grouped.description) {
    grouped.description = product.description;
  }
});

// Sort variants by size (numerically where possible) and filter out sizes > 10cc and price = 0
groupedProducts.forEach(product => {
  // Filter out variants larger than 10cc and variants with price = 0
  product.variants = product.variants.filter(variant => {
    const size = parseFloat(variant.size) || 0;
    const hasValidPrice = variant.price > 0;
    return size <= 10 && hasValidPrice;
  });

  // Sort remaining variants by size
  product.variants.sort((a, b) => {
    const aSize = parseFloat(a.size) || 0;
    const bSize = parseFloat(b.size) || 0;
    return aSize - bSize;
  });
});

// Filter out label/sticker products and bottles - only keep premium lubes
export const products: Product[] = Array.from(groupedProducts.values()).filter(
  product =>
    !product.productName.includes('Label') &&
    !product.productName.toLowerCase().includes('bottle') &&
    product.variants.length > 0 // Only keep products that have variants after filtering
);

// Extract sub-categories from product names
export const getSubCategory = (productName: string, category: string): string => {
  if (category === 'TheCubicle') {
    // Cubicle Labs products
    if (productName.includes('Labs')) return 'Cubicle Labs';

    // Compound series (Angstrom Research)
    if (productName.includes('Compound')) return 'Angstrom Research';

    // Silicone weight-based lubes
    if (productName.includes('Weight')) return 'Silicone Weights';

    // FZ series (separate category)
    if (productName.includes('FZ')) return 'FZ Series';

    // Other water-based lubes (DNM-37, Lubicle, etc.)
    if (productName.includes('DNM') || productName.includes('Lubicle')) {
      return 'Water-Based Lubes';
    }

    return 'TheCubicle Lube';
  } else if (category === 'SpeedCubeShop') {
    // Speed Lube series (weight-based) - check this first
    if (productName.includes('Speed Lube')) {
      return 'Speed Lube (Weights)';
    }

    // Cosmic series
    if (productName.includes('Cosmic') || productName.includes('Lunar') ||
        productName.includes('Martian') || productName.includes('Galaxy')) {
      return 'Cosmic Lube';
    }

    // Adheron series
    if (productName.includes('Adheron')) return 'Adheron';

    return 'SCS Lube';
  }
  return 'Other';
};

// Get unique sub-categories for each brand
export const subCategories = {
  TheCubicle: [
    'All',
    'FZ Series',
    'Water-Based Lubes',
    'Silicone Weights',
    'Cubicle Labs',
    'Angstrom Research'
  ],
  SpeedCubeShop: [
    'All',
    'Cosmic Lube',
    'Speed Lube (Weights)'
  ]
};

// Export categories for filtering if needed
export const categories = {
  cubicle: pricelistData.categories.cubicle.name,
  scs: pricelistData.categories.scs.name
};
