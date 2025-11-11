import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for our orders table
export interface Order {
  id?: number;
  created_at?: string;
  full_name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  notes?: string;
  items: Array<{
    productName: string;
    size: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
}
