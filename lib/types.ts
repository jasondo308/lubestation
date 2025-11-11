export interface ProductVariant {
  id: number;
  productCode: string;
  size: string;
  price: number;
  weight: string;
  qtyPerCarton: number | string;
  moq: number | string;
  detailedDescription?: {
    en: string;
    vn: string;
  };
}

export interface Product {
  productName: string;
  description: string;
  category: string;
  variants: ProductVariant[];
}

export interface CartItem {
  productName: string;
  variant: ProductVariant;
  quantity: number;
}

export interface PreOrderFormData {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  notes?: string;
}
